import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { JwtService } from '@nestjs/jwt';
import { Participant, ParticipantSchema } from '@/schemas/Participant.schema';
import { Room, RoomSchema } from '@/schemas/Room.schema';
import { MongooseModule } from '@nestjs/mongoose';
// import { Neo4jService } from 'nest-neo4j';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Participant.name, schema: ParticipantSchema },
      { name: Room.name, schema: RoomSchema },
    ]),
  ],
  controllers: [UserController],
  providers: [UserService, JwtService],
  exports: [UserService],
})
export class UserModule {}
