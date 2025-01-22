import {
  BadRequestException,
  ConflictException,
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
import * as dayjs from 'dayjs';
import { MailService } from '@/lib/mail/mail.service';
import {
  AuthProvider,
  createUserTokenPropertiesString,
  User,
  AuthSession,
  createAuthSessionPropertiesString,
  UserToken,
} from '@/user/user.entity';
import { Neo4jService } from 'nest-neo4j/dist';
import { createId } from '@paralleldrive/cuid2';
import { Request } from 'express';
import { UAParser } from 'ua-parser-js';
import { IncomingHttpHeaders } from 'http';
import { InjectModel } from '@nestjs/mongoose';
import { Participant } from '@/schemas/Participant.schema';
import { Model } from 'mongoose';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UserService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private mailService: MailService,
    private neo4jService: Neo4jService,
    @InjectModel(Participant.name) private participantModel: Model<Participant>
  ) {}

  async validateLocalLogin(
    { email, password }: LocalLoginPayloadDto,
    req: Request
  ) {
    const result = await this.usersService.getUserAndToken({ email });
    const user = result.user;
    if (!user) {
      throw new NotFoundException('Email not found');
    }
    const isPasswordCorrect = await this.checkIfPasswordIsCorrect(
      password,
      user.password
    );
    if (isPasswordCorrect) {
      const payload = {
        userId: user.id,
        email: user.email,
        username: user.username,
      };
      const tokens = {
        access_token: await this.generateAccessToken(payload),
      };
      await this.createAuthSession(user.id, req.headers, req.ip);
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
    const result = await this.usersService.getUserAndToken({
      email: isJWTValid.email,
      userId: isJWTValid.userId,
    });
    const user = result.user;
    const userTokens = result.userTokens;
    if (!userTokens?.email_verification_token)
      throw new UnauthorizedException('Invalid Token');
    if (userTokens?.email_verification_token !== token)
      throw new UnauthorizedException('Invalid token');
    if (user.email_verified) {
      throw new BadRequestException('Email has already been verified');
    }
    await this.usersService.updateUser(user.id, { email_verified: true });
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
    const result = await this.usersService.getUserAndToken(isJWTValid.userId);
    const user = result.user;
    const userAuth = result.userTokens;
    if (!user) {
      throw new BadRequestException('User does not exist');
    }
    if (userAuth?.forgot_password_token !== token)
      throw new UnauthorizedException('Unauthorized', {
        description: 'Invalid token provided',
      });
    const newHashedPass = await this.createHashedPassword(password);
    await this.usersService.updateUser(user.id, { password: newHashedPass });
    return user;
  }

  async sendResetPasswordToken({ email }: RequestResetPasswordDto) {
    const doesUserExist = (await this.usersService.getUserAndToken({ email }))
      .user;
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
    auth_provider: AuthProvider,
    headers: IncomingHttpHeaders,
    ip: string
  ) {
    const doesUserExist = (
      await this.usersService.getUserAndToken({
        email: payload.email,
      })
    ).user;
    if (doesUserExist) {
      const tokenPayload = {
        userId: doesUserExist.id,
        email: doesUserExist.email,
        username: doesUserExist.username,
      };
      return {
        access_token: await this.generateAccessToken(tokenPayload),
      };
    }
    const newAppUser = await this.usersService.create_user_and_tokens({
      ...payload,
      auth_provider,
      full_name: `${payload.first_name} ${payload.last_name}`,
      email_verified: true,
    });
    await this.createAuthSession(newAppUser.user.id, headers, ip);
    await this.createParticipant(newAppUser.user);
    const access_token = this.generateAccessToken({
      userId: newAppUser.user.id,
      email: payload.email,
      username: newAppUser.user.username,
    });
    if (!access_token) {
      throw new BadRequestException('Something went wrong');
    }
    return {
      access_token,
    };
  }

  async registerLocalUser(payload: RegisterLocalPayloadDto) {
    const user = (
      await this.usersService.getUserAndToken({ email: payload.email })
    ).user;
    if (user) {
      throw new ConflictException('User with this email already exists');
    }
    const hashedPassword = await this.createHashedPassword(payload.password);
    if (!hashedPassword) {
      throw new Error('Could not hash password');
    }
    const newUser = await this.usersService.create_user({
      ...payload,
      password: hashedPassword,
      auth_provider: AuthProvider.LOCAL,
      email_verified: false,
    });
    const emailTokenExpiry = dayjs(new Date())
      .add(30, 'days')
      .format('DD-MM-YYYY');
    const verifyEmailToken = await this.createEmailVerificationToken({
      userId: newUser.id,
      email: payload.email,
      username: newUser.username,
    });
    await this.createParticipant(newUser);
    const userTokensStr = createUserTokenPropertiesString({
      email_verification_token: verifyEmailToken,
      email_verification_expiry: emailTokenExpiry,
      id: createId(),
    });
    await this.neo4jService.write(
      `MATCH (user:USER {id: $userId})
      CREATE (user) -[:TOKENS]-> (token:USER_TOKENS {${userTokensStr}})`,
      { userId: newUser.id }
    );
    await this.mailService.sendEmailVerificationEmail(
      payload.email,
      verifyEmailToken
    );
    return { msg: 'mail sent' };
  }

  // ------------------------------------------- UTILLS ---------------------------------------------

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
      console.log(error, token);
      return null;
    }
  }

  async validateAccessToken(
    token: string
  ): Promise<jwtAuthTokenPayload | null> {
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

  async createEmailVerificationToken(payload: jwtAuthTokenPayload) {
    try {
      return await this.jwtService.sign(payload, {
        secret: this.configService.get('JWT_VERIFY_EMAIL_SECRET'),
        expiresIn: '30d',
      });
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async createParticipant(user: User) {
    const participant = await this.participantModel.create({
      name: user.full_name,
      userid: user.id,
      email: user.email,
      profile_img: user.profile_img,
      participatedRooms: [],
    });
    return participant;
  }

  async createAuthSession(
    userId: string,
    headers: IncomingHttpHeaders,
    ip: string
  ): Promise<AuthSession> {
    const useragent = new UAParser(headers['user-agent']).getResult();
    const authSession: AuthSession = {
      id: createId(),
      device_name: useragent.device.model || 'Unknown Device',
      browser: useragent.browser.name || 'Unknown Browser',
      os: useragent.os.name || 'Unknown OS',
      ip_address: ip,
      location: 'Unknown', // You might want to implement IP geolocation here
      logged_in: true,
      logged_in_date: new Date().toISOString(),
      last_logged_in_date: new Date().toISOString(),
    };

    await this.neo4jService.write(
      `MATCH (u:USER {id: $userId})
       CREATE (u)-[:SESSION]->(a:AUTH_SESSION {${createAuthSessionPropertiesString(authSession)}})
       RETURN a`,
      { userId }
    );

    return authSession;
  }
}
