import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { io, Socket } from 'socket.io-client';
import { AppModule } from '../src/app.module';
import { SocketEvents } from '../src/socket/socket.constants';
import { IOnlineRoom, RoomType } from '../src/socket/socket.types';

describe('SocketGateway (e2e)', () => {
  let app: INestApplication;
  let clientSocket: Socket;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.listen(3000);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach((done) => {
    clientSocket = io('http://localhost:3000', {
      auth: { token: 'valid_token' }, // Replace with a valid token
    });
    clientSocket.on('connect', done);
  });

  afterEach(() => {
    clientSocket.disconnect();
  });

  it('should connect and receive chat history', (done) => {
    clientSocket.on(SocketEvents.CHAT_HISTORY, (chats) => {
      expect(Array.isArray(chats)).toBeTruthy();
      done();
    });
  });

  it('should create a private room', (done) => {
    const participants = [
      {
        id: '1',
        name: 'User1',
        email: 'user1@example.com',
        profile_img: 'img1.jpg',
        userid: '1',
      },
      {
        id: '2',
        name: 'User2',
        email: 'user2@example.com',
        profile_img: 'img2.jpg',
        userid: '2',
      },
    ];

    clientSocket.emit(
      SocketEvents.CREATE_ROOM,
      { participants },
      (response: IOnlineRoom) => {
        expect(response).toBeDefined();
        expect(response.room_type).toBe(RoomType.PRIVATE);
        expect(response.participants.length).toBe(2);
        done();
      }
    );
  });

  it('should join a room', (done) => {
    const roomId = 'test_room_id';

    clientSocket.emit(SocketEvents.JOIN_ROOM, { roomId }, () => {
      clientSocket.on(SocketEvents.ROOM_CREATED, (room) => {
        expect(room).toBeDefined();
        expect(room.id).toBe(roomId);
        done();
      });
    });
  });

  it('should send and receive messages', (done) => {
    const testMessage = 'Hello, world!';

    clientSocket.on(SocketEvents.MESSAGE, (message, senderId) => {
      expect(message).toBe(testMessage);
      expect(senderId).toBeDefined();
      done();
    });

    clientSocket.emit(SocketEvents.MESSAGE, testMessage);
  });

  it('should leave a room', (done) => {
    const roomId = 'test_room_id';

    clientSocket.emit(SocketEvents.LEAVE_ROOM, { roomId }, () => {
      clientSocket.on(SocketEvents.ROOM_CREATED, (room) => {
        expect(room).toBeDefined();
        expect(room.id).toBe(roomId);
        // Check if the client is no longer in the room's participants
        expect(
          room.participants.find((p) => p.id === clientSocket.id)
        ).toBeUndefined();
        done();
      });
    });
  });
});
