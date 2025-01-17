import { Module } from '@nestjs/common';
import { SocketService } from './socket.service';
import { SocketGateway } from './socket.gateway';
import { AuthModule } from '@/auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Participant, ParticipantSchema } from '@/schemas/Participant.schema';
import { Room, RoomSchema } from '@/schemas/Room.schema';
import { UserModule } from '@/user/user.module';

@Module({
  imports: [
    AuthModule,
    UserModule,
    MongooseModule.forFeature([
      { name: Participant.name, schema: ParticipantSchema },
      { name: Room.name, schema: RoomSchema },
    ]),
  ],
  providers: [SocketGateway, SocketService],
})
export class SocketModule {}
