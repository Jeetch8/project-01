import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { Neo4jService } from 'nest-neo4j/dist';
import { UserModule } from '@/user/user.module';
import { PrismaService } from '@/prisma.service';
import { AuthModule } from '@/auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PrismaClient } from '@prisma/client';

const mockNeo4jService = {
  read: jest.fn(),
  write: jest.fn(),
};

describe('AppController (e2e)', () => {
  let app: INestApplication;
  const prismaClient = new PrismaClient();

  beforeAll(() => {
    prismaClient.$connect();
  });
  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: `.env.test`,
        }),
        JwtModule.register({}),
        AuthModule,
        UserModule,
      ],
    })
      .overrideProvider(Neo4jService)
      .useValue(mockNeo4jService)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  describe('Testing local login route', () => {
    it('Should throw 401 error if email not found', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login/local')
        .send({ email: 'jeet@gmail.com', password: 'password' })
        .expect(401);
      expect(res.body.error).toBe('User with this email does not exist');
    });

    it('Should throw password incorrect password', async () => {
      const registerRes = await request(app.getHttpServer())
        .post('/auth/register/local')
        .send({
          email: 'jeet@gmail.com',
          first_name: 'Jeet',
          last_name: 'chawda',
          password: 'JEetk8035!@',
          date_of_birth: '2023-10-01',
          profile_img: 'http://www.example.com',
          banner_img: 'http://www.example.com',
        })
        .expect(200);
      const res = await request(app.getHttpServer())
        .post('/auth/login/local')
        .send({
          email: 'jeet@gmail.com',
          password: 'password',
        })
        .expect(200);
    });
  });

  afterEach(async () => {
    await app.close();
  });

  afterAll(async () => {
    await prismaClient.app_user.deleteMany({});
    await prismaClient.user_profile.deleteMany({});
  });
});
