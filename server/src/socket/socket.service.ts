import { BadRequestException, Injectable } from '@nestjs/common';
import { createId } from '@paralleldrive/cuid2';
import {
  IParticipant,
  IRole,
  IRoom,
  RoomType,
  IOnlineParticipant,
  IOnlineRoom,
  IMessage,
  IMessageWithSender,
} from './socket.types';
import { AuthService } from '@/auth/auth.service';
import { InjectModel } from '@nestjs/mongoose';
import { Participant, ParticipantDocument } from '@/schemas/Participant.schema';
import Mongoose, { Model, Schema, Types } from 'mongoose';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { Redis } from 'ioredis';
import { UserService } from '@/user/user.service';
import {
  Message,
  MessageContentType,
  Room,
  RoomDocument,
} from '@/schemas/Room.schema';
import mongoose from 'mongoose';

@Injectable()
export class SocketService {
  constructor(
    @InjectRedis() private readonly redis: Redis,
    private authService: AuthService,
    @InjectModel(Participant.name) private participantModel: Model<Participant>,
    @InjectModel(Room.name) private roomModel: Model<Room>,
    private userService: UserService
  ) {}

  async createPrivateChat(payload: { participants: IParticipant[] }) {
    return await this.createRoom({ ...payload, roomType: RoomType.PRIVATE });
  }

  async createGroupChat(payload: {
    participants: IParticipant[];
    roomName: string;
    roomImg?: string;
    adminId?: string;
  }) {
    return await this.createRoom({ ...payload, roomType: RoomType.GROUP });
  }

  private async createRoom(payload: {
    participants: IParticipant[];
    roomType: RoomType;
    roomName?: string;
    roomImg?: string;
    adminId?: string;
  }) {
    const { roomType, roomImg, roomName, adminId, participants } = payload;
    const roomId = createId();
    const participantIds = participants.map((p) => p.id);
    const newRoom = (await this.roomModel.create({
      name: roomName,
      room_img: roomImg,
      roomType: roomType,
      participants: participantIds,
      chatHistory: [],
    })) as unknown as RoomDocument & { updatedAt: string; createdAt: string };
    await this.participantModel.updateMany(
      { _id: { $in: participantIds } },
      { $push: { participatedRooms: newRoom._id } }
    );
    const redisUsers = await this.redis.mget(
      participants.map((p) => `user:${p.userid}`)
    );
    const online_participants: IOnlineParticipant[] = redisUsers
      .map((user) => user as unknown as IOnlineParticipant | null)
      .filter((user) => user !== null);
    const room: IOnlineRoom = {
      ...newRoom.toObject(),
      id: newRoom._id.toString(),
      participants,
      online_participants,
      roomType: roomType,
      chatHistory: [],
      lastMessage: null,
      createdAt: newRoom.createdAt,
      updatedAt: newRoom.updatedAt,
      messageSavedTimes: 0, // Add this line
    };
    await this.redis.hset(`room:${roomId}`, room);
    return room;
  }

  async handle_new_socket(socketid: string, token: string) {
    const tokenUser = await this.authService.validateAccessToken(token);
    let participant = await this.participantModel.findOne({
      userid: tokenUser.userId,
    });
    if (!participant) {
      const dbUser = await this.userService.getUser({
        userId: tokenUser.userId,
      });
      participant = await this.participantModel.create({
        email: dbUser.user.email,
        name: dbUser.user.full_name,
        profile_img: dbUser.user.profile_img,
        userid: dbUser.user.id,
        role: IRole.PARTICIPANT,
        participatedRooms: [],
      });
    }
    return { participant, tokenUser };
  }

  async getUserRooms(participantId: string) {
    const rooms = await this.participantModel.aggregate([
      {
        $match: {
          _id: new Types.ObjectId(participantId),
        },
      },
      {
        $lookup: {
          from: 'rooms',
          localField: 'participatedRooms',
          foreignField: '_id',
          as: 'participatedRooms',
        },
      },
      {
        $unwind: '$participatedRooms',
      },
      {
        $lookup: {
          from: 'participants',
          localField: 'participatedRooms.participants',
          foreignField: '_id',
          as: 'participatedRooms.participants',
        },
      },
    ]);
    // console.log(rooms, participantId);
    // const temp = rooms.map((room) => {
    //   const mappingObj = {};
    //   room.roomJoined.participants.forEach((participant) => {
    //     mappingObj[participant] = participant;
    //   });
    //   room.roomJoined.chatHistory.forEach((message) => {
    //     message.sender = mappingObj[message.sender];
    //   });
    //   return room.roomJoined;
    // });
    const temp = rooms.map((room) => {
      const participants = room.participatedRooms.participants;
      const participantsObj = {};
      const participantsWithid = [];
      participants.forEach((participant) => {
        const id = participant._id.toString();
        participantsWithid.push({ ...participant, id });
        participantsObj[id] = {
          ...participant,
          id: participant._id.toString(),
        };
      });
      const chatHistory = room.participatedRooms.chatHistory.map((message) => {
        message.sender = participantsObj[message.sender.toString()];
        return message;
      });
      return {
        ...room.participatedRooms,
        id: room.participatedRooms._id.toString(),
        online_participants: [],
        chatHistory,
        participants: participantsWithid,
      };
    });
    return { rooms: temp };
  }

  async getRoom(roomId: string) {
    return await this.redis.get(roomId);
  }

  async getRoomMessages(roomId: string) {
    const room = await this.roomModel.findById(roomId).populate({
      path: 'chatHistory',
      options: { sort: { createdAt: -1 }, limit: 50 },
    });

    if (!room) {
      throw new BadRequestException('Room not found');
    }

    return room.chatHistory;
  }

  async saveMultipleMessages(roomId: string, messages: IMessageWithSender[]) {
    const temp = messages.map((message) => ({
      content: message.content,
      contentType: MessageContentType.TEXT,
      sender: new mongoose.Types.ObjectId(message.sender.id),
      isRead: message.isRead || false,
      isDeleted: message.isDeleted || false,
      isEdited: message.isEdited || false,
      createdAt: message.createdAt,
      updatedAt: message.updatedAt,
    }));

    const result = await this.roomModel.findByIdAndUpdate(
      roomId,
      {
        $push: {
          chatHistory: {
            $each: temp,
            $position: 0,
          },
        },
        $set: {
          lastMessage: temp[temp.length - 1].content,
        },
      },
      { new: true }
    );

    if (!result) {
      throw new BadRequestException('Room not found');
    }

    return result.chatHistory;
  }

  async getAllRooms() {
    const rooms = await this.roomModel.aggregate([
      {
        $lookup: {
          from: 'participants',
          localField: 'participants',
          foreignField: '_id',
          as: 'participants',
        },
      },
    ]);
    return rooms;
  }
}
