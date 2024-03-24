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
import { AuthProvider, User } from '@/user/user.entity';
import { Neo4jService } from 'nest-neo4j/dist';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UserService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private mailService: MailService,
    private neo4jService: Neo4jService
  ) {}

  async validateLocalLogin({ email, password }: LocalLoginPayloadDto) {
    const result = await this.usersService.getUser({ email });
    const user = result.user;
    if (!user) {
      throw new NotFoundException('NotFound', {
        description: 'User with this email does not exist',
      });
    }
    const isPasswordCorret = await this.checkIfPasswordIsCorrect(
      password,
      user.password
    );
    if (isPasswordCorret) {
      const payload = {
        userId: user.id,
        email: user.email,
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
    const result = await this.usersService.getUser({
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
    const result = await this.usersService.getUser(isJWTValid.userId);
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
    const doesUserExist = (await this.usersService.getUser({ email })).user;
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
    auth_provider: AuthProvider
  ) {
    const doesUserExist = (
      await this.usersService.getUser({
        email: payload.email,
      })
    ).user;
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
    const user = (await this.usersService.getUser({ email: payload.email }))
      .user;
    if (user) {
      throw new ConflictException('User with this email already exists');
    }
    const hashedPassword = await this.createHashedPassword(payload.password);
    if (!hashedPassword) {
      throw new Error('Could not hash password');
    }
    const newUser = await this.registerUser({
      ...payload,
      password: hashedPassword,
      auth_provider: AuthProvider.LOCAL,
    });
    const jwtPaylaod = {
      userId: newUser.user.id,
      email: payload.email,
    };
    const verifyEmailToken =
      await this.createEmailVerificationToken(jwtPaylaod);
    const newUserTokens = await this.usersService.create_user_token(
      {
        email_verification_token: verifyEmailToken,
        email_verification_expiry: dayjs(new Date())
          .add(30, 'days')
          .format('DD-MM-YYYY'),
      },
      { userId: newUser.user.id }
    );
    await this.neo4jService.write(
      `MATCH (user:USER {id: $userId}), (token:USER_TOKEN {id: $tokensId})
      CREATE (user) -[:TOKENS]-> (token)`,
      { userId: newUser.user.id, tokensId: newUserTokens.id }
    );
    await this.mailService.sendEmailVerificationEmail(
      payload.email,
      verifyEmailToken
    );
    return { msg: 'mail sent' };
  }

  async registerUser(payload: RegisterPayloadDto) {
    const newAppUser = await this.usersService.create_user({ ...payload });
    const tokenPayload = { userId: newAppUser.id, email: newAppUser.email };
    return {
      access_token: await this.generateAccessToken(tokenPayload),
      user: newAppUser,
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
      console.log(error, token);
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
}
