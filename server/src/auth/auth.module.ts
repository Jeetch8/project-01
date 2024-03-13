import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserModule } from '@/user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { UserService } from '@/user/user.service';
import { PrismaService } from '@/prisma.service';
import { GoogleStrategy } from './strategy/google.strategy';
import { GithubStrategy } from './strategy/github.strategy';
import { MailService } from '@/lib/mail/mail.service';
import { MailModule } from '@/lib/mail/mail.module';

@Module({
  imports: [UserModule, PassportModule, JwtModule.register({}), MailModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    UserService,
    PrismaService,
    GoogleStrategy,
    GithubStrategy,
    MailService,
  ],
  exports: [AuthService],
})
export class AuthModule {}
