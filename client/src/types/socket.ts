export enum SocketEvents {
  MESSAGE = 'message',
  JOIN_ROOM = 'join_room',
  ROOM_CREATED = 'room-created',
  CHAT_HISTORY = 'chat-history',
  CREATE_ROOM = 'create-room',
  INITIAL_DATA = 'initial-data',
  LEAVE_ROOM = 'leave-room',
  GET_ROOM_MESSAGES = 'get-room-messages',
  ERROR = 'error',
}

export enum IRole {
  HOST = 'host',
  PARTICIPANT = 'participant',
}

export interface IParticipant {
  id: string;
  name: string;
  email: string;
  profile_img: string;
  userid: string;
}

export interface IRoom {
  id: string;
  name?: string;
  description?: string;
  isDeleted?: boolean;
  room_img?: string;
  participants: IParticipant[];
  roomType: RoomType;
}

export enum RoomType {
  GROUP = 'group',
  PRIVATE = 'private',
}

export interface IOnlineParticipant {
  id: string;
  userid: string;
  socketid: string;
  name: string;
  current_joined_room: string | undefined;
  profile_img: string;
  email: string;
}

export interface IMessage {
  id: string;
  content: string;
  isRead: boolean;
  isDeleted: boolean;
  isEdited: boolean;
  contentType: string;
  sender: string;
  room: string;
  createdAt: string;
  updatedAt: string;
}

export interface IMessageWithSender extends Omit<IMessage, 'sender'> {
  sender: IParticipant;
}

export interface IOnlineRoom {
  id: string;
  name?: string;
  description?: string;
  room_img?: string;
  messageSavedTimes: number;
  isDeleted?: boolean;
  roomType: RoomType;
  chatHistory: IMessageWithSender[];
  lastMessage: IMessage;
  participants: IParticipant[];
  online_participants: IOnlineParticipant[];
  updatedAt: string;
  createdAt: string;
}

export interface ISenderMessage {
  content: string;
  contentType: string;
  sender: IParticipant;
  room: string;
}
