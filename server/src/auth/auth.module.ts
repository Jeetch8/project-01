import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserModule } from '@/user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { UserService } from '@/user/user.service';
import { GoogleStrategy } from './strategy/google.strategy';
import { GithubStrategy } from './strategy/github.strategy';
import { MailService } from '@/lib/mail/mail.service';
import { MailModule } from '@/lib/mail/mail.module';
import { JwtStrategy } from './strategy/jwt.strategy';
import { Participant, ParticipantSchema } from '@/schemas/Participant.schema';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    UserModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({}),
    MailModule,
    MongooseModule.forFeature([
      { name: Participant.name, schema: ParticipantSchema },
    ]),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    UserService,
    GoogleStrategy,
    GithubStrategy,
    MailService,
    JwtStrategy,
  ],
  exports: [AuthService],
})
export class AuthModule {}
