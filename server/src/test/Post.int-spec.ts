import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import * as request from 'supertest';
import { PrismaService } from '@/prisma.service';
import { ConfigModule } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';
import { hashPassword } from '@/utils/helpers';
import { PostModule } from '@/post/post.module';
import { PostService } from '@/post/post.service';
import * as jwt from 'jsonwebtoken';
import { JwtStrategy } from '@/auth/strategy/jwt.strategy';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtAuthGuard } from '@/auth/guards/jwt.guard';

const createUser = async ({
  password,
  email,
  profile_img,
  username,
  first_name,
  last_name,
  prisma,
}: {
  email?: string;
  password?: string;
  first_name?: string;
  last_name?: string;
  username?: string;
  profile_img?: string;
  prisma: PrismaClient;
}) => {
  const hashed = await hashPassword('JEetk8035!@');
  return await prisma.app_user.create({
    data: {
      email: 'jeet@gmail.com' ?? email,
      password: password ?? hashed,
      user_profile: {
        create: {
          first_name: 'Jeet' ?? first_name,
          last_name: 'Kumar' ?? last_name,
          full_name: 'Jeet Kumar' ?? first_name + last_name,
          username: 'jeetkumar' ?? username,
          profile_img: 'https://www.google.com' ?? profile_img,
        },
      },
    },
  });
};

describe('PostController (e2e)', () => {
  let app: INestApplication;
  const prismaClient = new PrismaClient();
  let authToken: string;

  beforeAll(async () => {
    await prismaClient.$connect();
    console.log('Prisma client connected');
    const user = await createUser({ prisma: prismaClient });
    authToken = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_ACCESS_TOKEN_SECRET,
      {
        expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRY,
      }
    );
  });

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env.test',
        }),
        PassportModule.register({ defaultStrategy: 'jwt' }),
        PostModule,
      ],
      providers: [PrismaService, PostService, JwtStrategy],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        stopAtFirstError: true,
        exceptionFactory: (errors) => {
          const result = errors.map((error) => ({
            property: error.property,
            message: error.constraints[Object.keys(error.constraints)[0]],
          }));
          return new BadRequestException(result);
        },
      })
    );
    await app.init();
  });

  afterEach(async () => {
    await prismaClient.app_user.deleteMany({});
    await prismaClient.user_profile.deleteMany({});
    await prismaClient.user_tokens.deleteMany({});
    await app.close();
  });

  afterAll(async () => {
    await prismaClient.$disconnect();
  });

  it('Should', async () => {
    const req = await request(app.getHttpServer())
      .get('/post')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);
  });
});
