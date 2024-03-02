import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategy/jwt.strategy';
import { UserModule } from '@/user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { UserService } from '@/user/user.service';
import { PrismaService } from '@/prisma.service';
import { LocalStrategy } from './strategy/local.strategy';
import { Neo4jService } from 'nest-neo4j/dist';

@Module({
  imports: [UserModule, PassportModule, JwtModule.register({})],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    UserService,
    PrismaService,
    LocalStrategy,
  ],
  exports: [AuthService],
})
export class AuthModule {}
