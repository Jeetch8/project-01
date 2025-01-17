import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Room } from './Room.schema';

export type ParticipantDocument = HydratedDocument<Participant>;

@Schema({ timestamps: true })
export class Participant {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  profile_img: string;

  @Prop({ required: true })
  userid: string;

  @Prop({
    required: true,
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Room' }],
  })
  participatedRooms: Room | mongoose.Types.ObjectId[];
}

export const ParticipantSchema = SchemaFactory.createForClass(Participant);
