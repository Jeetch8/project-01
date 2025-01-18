export interface IParticipant {
  name: string;
  email: string;
  profile_img: string;
  userid: string;
  participatedRooms: string[];
}

export interface IMessage {
  content: string;
  contentType: MessageContentType;
  isRead: boolean;
  isDeleted: boolean;
  isEdited: boolean;
  sender: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum MessageContentType {
  TEXT = 'text',
  IMAGE = 'image',
  VIDEO = 'video',
  AUDIO = 'audio',
  FILE = 'file',
}

export interface IRoom {
  name?: string;
  description?: string;
  room_img?: string;
  isDeleted?: boolean;
  roomType: string;
  participants: string[];
  chatHistory: IMessage[];
  lastMessage?: string;
}
