import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PrismaService } from '@/prisma.service';
import { JwtService } from '@nestjs/jwt';
// import { Neo4jService } from 'nest-neo4j';

@Module({
  imports: [],
  controllers: [UserController],
  providers: [UserService, PrismaService, JwtService],
  exports: [UserService],
})
export class UserModule {}
