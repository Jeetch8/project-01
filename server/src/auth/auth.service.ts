import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '@/user/user.service';
import { ConfigService } from '@nestjs/config';
import bcrypt from 'bcrypt';
import { jwtAuthTokenPayload } from './entities/auth.entity';
import {
  LocalLoginPayloadDto,
  RegisterLocalPayloadDto,
  RegisterPayloadDto,
  RegisterSSOPayloadDto,
} from './dto/auth.dto';
import { generateFromEmail } from 'unique-username-generator';
import { auth_provider } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UserService,
    private jwtService: JwtService,
    private configService: ConfigService
  ) {}

  async validateLocalLogin({ email, password }: LocalLoginPayloadDto) {
    const user = await this.usersService.findOneAppUserByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Unauthorized', {
        description: 'User with this email does not exist',
      });
    }
    const isPasswordCorret = await this.checkIfPasswordIsCorrect(
      password,
      user.password
    );
    if (isPasswordCorret) {
      const payload = { userId: user.id, email: user.email };
      return {
        accessToken: await this.generatedAccessToken(payload),
        refreshToken: await this.generateRefreshToken(payload),
      };
    } else {
      throw new UnauthorizedException(
        {},
        { description: 'Password is incorrect' }
      );
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
        refresh_token: await this.generateRefreshToken(tokenPayload),
        access_token: await this.generatedAccessToken(tokenPayload),
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
      throw new BadRequestException('User with this email already exists');
    }
    const hashedPassword = await this.createHashedPassword(payload.password);
    if (!hashedPassword) {
      throw new Error('Could not hash password');
    }
    const tokens = await this.registerUser({
      ...payload,
      password: hashedPassword,
      auth_provider: auth_provider.local,
    });

    return tokens;
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
      refresh_token: await this.generateRefreshToken(tokenPayload),
      access_token: await this.generatedAccessToken(tokenPayload),
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

  async generatedAccessToken(payload: jwtAuthTokenPayload) {
    try {
      return await this.jwtService.sign(payload, {
        secret: this.configService.get('JWT_ACCESS_TOKEN_SECRET'),
        expiresIn: this.configService.get('JWT_ACCESS_TOKEN_EXPIRY'),
      });
    } catch (error) {
      return undefined;
    }
  }
  async generateRefreshToken(payload: jwtAuthTokenPayload) {
    try {
      return await this.jwtService.sign(payload, {
        secret: this.configService.get('JWT_REFRESH_TOKEN_SECRET'),
        expiresIn: this.configService.get('JWT_REFRESH_TOKEN_EXPIRY'),
      });
    } catch (error) {
      return undefined;
    }
  }
}
