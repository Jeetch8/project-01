import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Participant } from './Participant.schema';
import { IRole, RoomType } from '@/socket/socket.types';

export type MessageDocument = HydratedDocument<Message>;
export type RoomDocument = HydratedDocument<Room>;

export enum MessageContentType {
  TEXT = 'text',
  IMAGE = 'image',
  VIDEO = 'video',
  AUDIO = 'audio',
  FILE = 'file',
}

@Schema()
export class Message {
  @Prop({ required: true })
  content: string;

  @Prop({ required: true, enum: MessageContentType })
  contentType: MessageContentType;

  @Prop({ default: false })
  isRead: boolean;

  @Prop({ default: false })
  isDeleted: boolean;

  @Prop({ default: false })
  isEdited: boolean;

  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Participant',
  })
  sender: Participant | mongoose.Types.ObjectId;

  @Prop({ required: true })
  createdAt: Date;

  @Prop({ required: true })
  updatedAt: Date;
}

@Schema({ timestamps: true })
export class Room {
  @Prop({ default: '' })
  name?: string;

  @Prop({ default: '' })
  description?: string;

  @Prop({ default: '' })
  room_img?: string;

  @Prop({ default: false })
  isDeleted?: boolean;

  @Prop({ required: true, enum: RoomType })
  roomType: string;

  @Prop({
    required: true,
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Participant' }],
  })
  participants: Participant[];

  @Prop({
    required: true,
    type: [Message],
  })
  chatHistory: Message[];

  @Prop({ default: '' })
  lastMessage?: string;
}

export const RoomSchema = SchemaFactory.createForClass(Room);
