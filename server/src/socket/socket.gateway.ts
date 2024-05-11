import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
  OnGatewayDisconnect,
  OnGatewayConnection,
  OnGatewayInit,
} from '@nestjs/websockets';
import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Server } from 'socket.io';
import { Socket } from 'socket.io';
import { SocketService } from './socket.service';
import { SocketEvents } from './socket.constants';
import {
  IParticipant,
  IOnlineParticipant,
  IOnlineRoom,
  IMessage,
  IMessageWithSender,
  ISenderMessage,
} from './socket.types';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { Redis } from 'ioredis';
import { createId } from '@paralleldrive/cuid2';

@WebSocketGateway({ cors: { origin: ['http://localhost:5173'] } })
export class SocketGateway
  implements
    OnModuleDestroy,
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnGatewayInit
{
  constructor(
    private readonly socketService: SocketService,
    @InjectRedis() private readonly redis: Redis
  ) {}

  @WebSocketServer()
  server: Server;

  async handleConnection(@ConnectedSocket() socket: Socket) {
    const token = socket.handshake.auth.token;
    if (!token) {
      socket.disconnect();
      return;
    }
    const { participant, tokenUser } =
      await this.socketService.handle_new_socket(socket.id, token);
    if (!participant || !tokenUser) {
      socket.disconnect();
      return;
    }
    await this.redis.set(`user:${tokenUser.userId}`, socket.id);
    const userRooms = await this.socketService.getUserRooms(participant.id);
    const onlineParticipant: IOnlineParticipant = {
      ...participant,
      id: participant.id,
      socketid: socket.id,
      current_joined_room: undefined,
    };
    await this.redis.set(`socketid:${socket.id}`, participant.id);
    await this.redis.hset(`participant:${participant.id}`, onlineParticipant);
    socket.emit(SocketEvents.INITIAL_DATA, {
      userRooms: userRooms.rooms,
      participant: {
        id: participant._id.toString(),
        userid: participant.userid,
        name: participant.name,
        email: participant.email,
        profile_img: participant.profile_img,
      },
    });
  }

  async handleDisconnect(@ConnectedSocket() socket: Socket) {
    const socketid = socket.id;
    const participantid = await this.redis.get(`socketid:${socketid}`);
    if (participantid) {
      await this.redis.del(`socketid:${socketid}`);
    }
    // if (participantid) {
    //   await this.redis.del(socketid);
    //   const participant = await this.redis.hgetall(
    //     `participant:${participantid}`
    //   );
    //   const roomJoined = participant.current_joined_room;
    //   if (roomJoined) {
    //     const room = await this.redis.hgetall(`room:${roomJoined}`);
    //     const onlineParticipants = JSON.parse(room.online_participants || '[]');
    //     const updatedParticipants = onlineParticipants.filter(
    //       (p) => p !== socketid
    //     );
    //     if (updatedParticipants.length === 0) {
    //       await this.redis.del(`room:${roomJoined}`);
    //     } else {
    //       await this.redis.hset(`room:${roomJoined}`, {
    //         online_participants: updatedParticipants,
    //       });
    //     }
    //   }
    // }
  }

  async afterInit(server: Server) {
    await this.redis.flushall();
    const rooms = await this.socketService.getAllRooms();
    for (let i = 0; i < rooms.length; i++) {
      const temp = { ...rooms[i] };
      temp.participants = JSON.stringify(temp.participants);
      temp.chatHistory = JSON.stringify(temp.chatHistory);
      await this.redis.hset(`room:${rooms[i]._id.toString()}`, temp);
    }
  }

  async onModuleDestroy() {
    await this.redis.flushall();
    await this.redis.disconnect();
    this.server.close();
  }

  @SubscribeMessage(SocketEvents.JOIN_ROOM)
  async handleJoinRoom(
    @MessageBody() data: { roomId: string },
    @ConnectedSocket() socket: Socket
  ) {
    const cachedRoom = await this.redis.hgetall(`room:${data.roomId}`);
    if (cachedRoom) {
      await this.redis.hset(
        `room:${data.roomId}`,
        'online_participants',
        JSON.stringify([...(cachedRoom?.online_participants || []), socket.id])
      );
    } else {
      const dbRoom = await this.socketService.getRoom(data.roomId);
      await this.redis.hset(`room:${data.roomId}`, dbRoom);
    }
    socket.join(data.roomId);
  }

  @SubscribeMessage(SocketEvents.CREATE_ROOM)
  async handleCreateRoom(
    @MessageBody()
    data: {
      participants: IParticipant[];
      room_name?: string;
      room_img?: string;
      admin_id?: string;
    },
    @ConnectedSocket() socket: Socket
  ) {
    const { participants, room_img, room_name, admin_id } = data;
    if (data.participants.length < 2) return;
    let room: IOnlineRoom;
    if (data.participants.length === 2) {
      room = await this.socketService.createPrivateChat({
        participants: participants,
      });
    } else {
      room = await this.socketService.createGroupChat({
        participants,
        roomName: room_name,
        roomImg: room_img,
        adminId: admin_id,
      });
    }

    for (let i = 0; i < room.participants.length; i++) {
      const socketId = await this.redis.get(
        `user:${room.participants[i].userid}`
      );
      if (socketId) {
        socket.to(socketId).emit(SocketEvents.ROOM_CREATED, room);
      }
    }

    return room;
  }

  @SubscribeMessage(SocketEvents.MESSAGE)
  async handleMessage(
    @MessageBody()
    data: ISenderMessage,
    @ConnectedSocket() socket: Socket
  ) {
    const { room: roomId, content, contentType, sender } = data;
    const room = await this.redis.hgetall(`room:${roomId}`);
    if (!room) {
      socket.emit('error', 'Room not found');
      return;
    }
    const newMessage: IMessageWithSender = {
      id: createId(),
      content,
      contentType,
      sender,
      room: roomId,
      isRead: false,
      isDeleted: false,
      isEdited: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await this.socketService.saveMultipleMessages(roomId, [newMessage]);
    let chatHistory = JSON.parse(room.chatHistory);
    chatHistory.unshift(newMessage);
    let messageSavedTimes = parseInt(room.messageSavedTimes);
    const notSavedMessages = chatHistory.length % 100;
    if (notSavedMessages > 100) {
      await this.socketService.saveMultipleMessages(roomId, chatHistory);
      messageSavedTimes++;
    }
    await this.redis.hset(`room:${roomId}`, {
      chatHistory: JSON.stringify(chatHistory),
      lastMessage: newMessage.content,
      messageSavedTimes: messageSavedTimes.toString(),
    });
    // const temp = { ...newMessage };
    // for (let i = 0; i < room.participants.length; i++) {
    //   temp.sender = room.participants[i];
    // }
    // socket.to(roomId).emit(SocketEvents.MESSAGE, temp);
    this.server
      .to(roomId)
      .emit(SocketEvents.MESSAGE, { message: newMessage, roomId });
    // broadcast used to send message to all clients except the sender
    // socket.broadcast.emit(SocketEvents.MESSAGE, temp);
  }

  @SubscribeMessage(SocketEvents.LEAVE_ROOM)
  async handleLeaveRoom(
    @MessageBody() data: { roomId: string },
    @ConnectedSocket() socket: Socket
  ) {
    socket.leave(data.roomId);
    const room = await this.redis.hgetall(`room:${data.roomId}`);
    if (room) {
      const onlineParticipants =
        room.online_participants as unknown as IOnlineParticipant[];
      const updatedParticipants = onlineParticipants.filter(
        (participant) => participant.socketid !== socket.id
      );
      if (updatedParticipants.length === 0) {
        await this.redis.del(`room:${data.roomId}`);
      } else {
        await this.redis.hset(`room:${data.roomId}`, {
          online_participants: updatedParticipants,
        });
      }
    }
    if (room) {
      socket.to(socket.id).emit(SocketEvents.ROOM_CREATED, room);
    }
  }

  @SubscribeMessage(SocketEvents.GET_ROOM_MESSAGES)
  async handleGetRoomMessages(
    @MessageBody() data: { roomId: string },
    @ConnectedSocket() socket: Socket
  ) {
    try {
      const room = await this.redis.hgetall(`room:${data.roomId}`);
      if (room) {
        const chatHistory = JSON.parse(room.chatHistory || '[]');
        socket.emit(SocketEvents.GET_ROOM_MESSAGES, chatHistory);
      } else {
        const messages = await this.socketService.getRoomMessages(data.roomId);
        socket.emit(SocketEvents.GET_ROOM_MESSAGES, messages);
      }
    } catch (error) {
      socket.emit('error', error.message);
    }
  }
}
