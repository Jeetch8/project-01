import {
  BadRequestException,
  HttpException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '@/user/user.service';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { jwtAuthTokenPayload } from './entities/auth.entity';
import {
  LocalLoginPayloadDto,
  RegisterLocalPayloadDto,
  RegisterPayloadDto,
  RegisterSSOPayloadDto,
  RequestResetPasswordDto,
} from './dto/auth.dto';
import { generateFromEmail } from 'unique-username-generator';
import { auth_provider } from '@prisma/client';
import * as dayjs from 'dayjs';
import { MailService } from '@/lib/mail/mail.service';
import { PrismaService } from '@/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UserService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private mailService: MailService,
    private prismaService: PrismaService
  ) {}

  async validateLocalLogin({ email, password }: LocalLoginPayloadDto) {
    const user = await this.usersService.findUser({ email });
    if (!user) {
      throw new NotFoundException('NotFound', {
        description: 'User with this email does not exist',
      });
    }
    const isPasswordCorret = await this.checkIfPasswordIsCorrect(
      password,
      user.app_user.password
    );
    if (isPasswordCorret) {
      const payload = {
        userId: user.user_profile.id,
        email: user.app_user.email,
      };
      const tokens = {
        access_token: await this.generateAccessToken(payload),
      };
      return tokens;
    } else {
      throw new UnauthorizedException('Unauthorized', {
        description: 'Password is incorrect',
      });
    }
  }

  async validateEmailVerificationToken(token: string) {
    const isJWTValid = await this.verifyEmailToken(token);
    if (!isJWTValid) throw new UnauthorizedException('Invalid token');
    const user = await this.usersService.findOneAppUser(isJWTValid.userId);
    if (!user) throw new UnauthorizedException('Invalid Token');
    const user_tokens = await this.prismaService.user_tokens.findFirst({
      where: {
        app_user_id: user.id,
      },
    });
    if (user_tokens.email_verification_token !== token)
      throw new UnauthorizedException('Invalid token');
    if (user.email_verified) {
      throw new BadRequestException('Email has already been verified');
    }
    await this.usersService.updateAppUser(user.id, { email_verified: true });
    return user;
  }

  async resetUserPasswordWithtoken({
    token,
    password,
  }: {
    token: string;
    password: string;
  }) {
    const isJWTValid = await this.verifyPasswordResetToken(token);
    if (!isJWTValid) throw new UnauthorizedException('Invalid token provided');
    const user = await this.usersService.findOneAppUser(isJWTValid.userId);
    if (!user) {
      throw new BadRequestException('User does not exist');
    }
    const user_tokens = await this.prismaService.user_tokens.findFirst({
      where: {
        app_user_id: user.id,
      },
    });
    if (user_tokens.forgot_password_token !== token)
      throw new UnauthorizedException('Unauthorized', {
        description: 'Invalid token provided',
      });
    const newHashedPass = await this.createHashedPassword(password);
    await this.usersService.updateAppUser(user.id, { password: newHashedPass });
    return user;
  }

  async sendResetPasswordToken({ email }: RequestResetPasswordDto) {
    const doesUserExist = await this.usersService.findOneAppUserByEmail(email);
    if (!doesUserExist) {
      throw new NotFoundException('User not found');
    }
    const payload = { email, userId: doesUserExist.id };
    const mailToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_PASSWORD_RESET_TOKEN'),
      expiresIn: '1d',
    });
    try {
      await this.mailService.sendResetPasswordToken(email, mailToken);
    } catch (error) {
      throw new BadRequestException('Something went wrong');
    }
  }

  async handleSSORegisterORLogin(
    payload: RegisterSSOPayloadDto,
    auth_provider: auth_provider
  ) {
    const doesUserExist = await this.usersService.findOneAppUserByEmail(
      payload.email
    );
    if (doesUserExist) {
      const tokenPayload = {
        userId: doesUserExist.id,
        email: doesUserExist.email,
      };
      return {
        access_token: await this.generateAccessToken(tokenPayload),
      };
    }
    const tokens = await this.registerUser({
      ...payload,
      password: '',
      auth_provider,
    });
    return tokens;
  }

  async registerLocalUser(payload: RegisterLocalPayloadDto) {
    const user = await this.usersService.findOneAppUserByEmail(payload.email);
    if (user) {
      throw new HttpException('User with this email already exists', 409);
    }
    const hashedPassword = await this.createHashedPassword(payload.password);
    if (!hashedPassword) {
      throw new Error('Could not hash password');
    }
    const newUser = await this.registerUser({
      ...payload,
      password: hashedPassword,
      auth_provider: auth_provider.local,
    });
    const jwtPaylaod = { userId: newUser.app_user.id, email: payload.email };
    const verifyEmailToken = await this.jwtService.sign(jwtPaylaod, {
      secret: this.configService.get('JWT_VERIFY_EMAIL_SECRET'),
      expiresIn: '30d',
    });
    await this.prismaService.user_tokens.create({
      data: {
        app_user_id: newUser.app_user.id,
        email_verification_token: verifyEmailToken,
        email_verification_expiry: dayjs(new Date())
          .add(30, 'days')
          .format('DD-MM-YYYY'),
      },
    });
    await this.mailService.sendEmailVerificationEmail(
      payload.email,
      verifyEmailToken
    );
    return { msg: 'mail sent' };
  }

  async registerUser(payload: RegisterPayloadDto) {
    const username = await generateFromEmail(payload.email, 4);
    const newProfileUser = await this.usersService.create_user_profile({
      ...payload,
      username,
    });
    const newAppUser = await this.usersService.create_app_user(
      { ...payload },
      newProfileUser.id
    );
    const tokenPayload = { userId: newAppUser.id, email: newAppUser.email };
    return {
      access_token: await this.generateAccessToken(tokenPayload),
      app_user: newAppUser,
      user_profile: newProfileUser,
    };
  }

  async checkIfPasswordIsCorrect(password: string, hashedPassword: string) {
    try {
      return await bcrypt.compare(password, hashedPassword);
    } catch (error) {
      return false;
    }
  }

  async createHashedPassword(password: string) {
    try {
      return await bcrypt.hash(password, 10);
    } catch (error) {
      return undefined;
    }
  }

  async generateAccessToken(payload: jwtAuthTokenPayload) {
    try {
      return await this.jwtService.sign(payload, {
        secret: this.configService.get('JWT_ACCESS_TOKEN_SECRET'),
        expiresIn: this.configService.get('JWT_ACCESS_TOKEN_EXPIRY'),
      });
    } catch (error) {
      return undefined;
    }
  }

  async verifyEmailToken(token: string) {
    try {
      return await this.jwtService.verify(token, {
        secret: this.configService.get('JWT_VERIFY_EMAIL_SECRET'),
      });
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async validateAccessToken(token: string) {
    try {
      return await this.jwtService.verify(token, {
        secret: this.configService.get('JWT_ACCESS_TOKEN_SECRET'),
      });
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async verifyPasswordResetToken(token: string) {
    try {
      return await this.jwtService.verify(token, {
        secret: this.configService.get('JWT_PASSWORD_RESET_TOKEN'),
      });
    } catch (error) {
      console.log(error);
      return null;
    }
  }
}
