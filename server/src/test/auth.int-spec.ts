import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import * as request from 'supertest';
import { UserModule } from '@/user/user.module';
import { PrismaService } from '@/prisma.service';
import { AuthModule } from '@/auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PrismaClient } from '@prisma/client';
import { hashPassword } from '@/utils/helpers';
import * as jwt from 'jsonwebtoken';
import { MailModule } from '@/lib/mail/mail.module';
import { MailService } from '@/lib/mail/mail.service';

const mockMailService = {
  sendEmailVerificationEmail: jest.fn().mockResolvedValueOnce(true),
  sendResetPasswordToken: jest.fn().mockResolvedValueOnce(true),
};

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  const prismaClient = new PrismaClient();

  beforeAll(async () => {
    await prismaClient.$connect();
    console.log('Prisma client connected');
  });

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env.test',
        }),
        JwtModule.register({}),
        AuthModule,
        UserModule,
        TestingModule,
      ],
      providers: [PrismaService],
    })
      .overrideModule(MailModule)
      .useModule(TestingModule)
      .overrideProvider(MailService)
      .useValue(mockMailService)
      .compile();

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

  const createUser = async ({
    password,
    email,
    profile_img,
    username,
    first_name,
    last_name,
  }: {
    email?: string;
    password?: string;
    first_name?: string;
    last_name?: string;
    username?: string;
    profile_img?: string;
  }) => {
    const hashed = await hashPassword('JEetk8035!@');
    return await prismaClient.app_user.create({
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

  describe('POST /auth/login/local', () => {
    const requestLoginRoute = async ({
      email,
      password,
      expectedStatus,
    }: {
      email?: string;
      password?: string;
      expectedStatus?: number;
    }) => {
      return await request(app.getHttpServer())
        .post('/auth/login/local')
        .send({
          email: email ?? 'jeet@gmail.com',
          password: password ?? 'JEetk8035!@',
        })
        .expect(expectedStatus ?? 200);
    };

    describe('Dto test', () => {
      beforeAll(async () => {
        await createUser({ password: 'password' });
      });
      it.each([
        { testmail: 'jeet' },
        { testmail: 'jeet.com' },
        { testmail: 'jeet1232.com' },
        { testmail: 'jeet$sadksa.csdas' },
      ])(
        'Should throw error when invalid email-($testmail) is provided',
        async ({ testmail }) => {
          const req = await requestLoginRoute({
            email: testmail,
            expectedStatus: 400,
          });
          expect(req.body).toMatchObject({
            message: expect.arrayContaining([
              { property: 'email', message: expect.any(String) },
            ]),
            error: expect.any(String),
          });
        }
      );

      it.each([
        { testpassword: 'jeet', case: 'less than 8 letters' },
        { testpassword: 'jeetasd@', case: 'only one symbol' },
        { testpassword: 'jeetas1@', case: 'one symbol and one number' },
        {
          testpassword: 'jeetas@Q',
          case: 'one symbol, one uppercase letter',
        },
      ])(
        'Should throw error when password-($testpassword) is $case',
        async ({ testpassword }) => {
          const req = await requestLoginRoute({
            password: testpassword,
            expectedStatus: 400,
          });
          expect(req.body).toMatchObject({
            message: expect.arrayContaining([
              { property: 'password', message: expect.any(String) },
            ]),
            error: expect.any(String),
          });
        }
      );
    });

    it('Should return error if email is not registered', async () => {
      const req = await requestLoginRoute({ expectedStatus: 404 });
      expect(req.body).toMatchObject({
        message: 'NotFound',
        error: expect.any(String),
      });
    });

    it("Should return 401 error if password doesn't match", async () => {
      await createUser({});
      const req = await requestLoginRoute({
        expectedStatus: 401,
        password: 'Password1!@',
      });
      expect(req.body).toMatchObject({
        message: 'Unauthorized',
        error: expect.any(String),
      });
    });

    it('Should return access_token and refresh_token if email and password are correct', async () => {
      await createUser({});
      const res = await requestLoginRoute({});
      expect(res.body).toMatchObject({
        access_token: expect.any(String),
      });
      expect(
        jwt.verify(res.body.access_token, process.env.JWT_ACCESS_TOKEN_SECRET)
      ).toBeTruthy();
      expect(
        res.header['set-cookie'][0].startsWith('AUTH_REFRESH_TOKEN=')
      ).toBeTruthy();
    });
  });

  describe('POST /auth/register/local', () => {
    const requestRegisterRoute = async ({
      email,
      password,
      first_name,
      last_name,
      username,
      expectedStatus,
    }: {
      email?: string;
      password?: string;
      first_name?: string;
      last_name?: string;
      username?: string;
      expectedStatus?: number;
    }) => {
      return await request(app.getHttpServer())
        .post('/auth/register/local')
        .send({
          email: email ?? 'jeet@gmail.com',
          password: password ?? 'JEetk8035!@',
          first_name: first_name ?? 'Jeet',
          last_name: last_name ?? 'Kumar',
          username: username ?? 'jeetkumar',
          date_of_birth: '2024-12-10',
          profile_img: 'http://www.example.com',
          gender: 'male',
        })
        .expect(expectedStatus ?? 201);
    };

    it.each([
      { testmail: 'jeet' },
      { testmail: 'jeet.com' },
      { testmail: 'jeet1232.com' },
      { testmail: 'jeet$sadksa.csdas' },
    ])(
      'Should throw error when invalid email-($testmail) is provided',
      async ({ testmail }) => {
        const res = await requestRegisterRoute({
          email: testmail,
          expectedStatus: 400,
        });
        expect(res.body).toMatchObject({
          message: expect.arrayContaining([
            { property: 'email', message: expect.any(String) },
          ]),
          error: 'Bad Request',
          statusCode: 400,
        });
      }
    );

    it('Should not throw email validation error when email is valid', async () => {
      await requestRegisterRoute({});
    });

    it.each([
      { testpassword: 'jeet', case: 'less than 8 letters' },
      { testpassword: 'jeetasd@', case: 'only one symbol' },
      { testpassword: 'jeetas1@', case: 'one symbol and one number' },
      { testpassword: 'jeetas@Q', case: 'one symbol, one uppercase letter' },
    ])(
      'Should throw error when password-($testpassword) is $case',
      async ({ testpassword }) => {
        const res = await requestRegisterRoute({
          password: testpassword,
          expectedStatus: 400,
        });
        expect(res.body).toMatchObject({
          message: expect.arrayContaining([
            { property: 'password', message: expect.any(String) },
          ]),
          error: 'Bad Request',
          statusCode: 400,
        });
      }
    );

    it('Should not throw password validation error when password is strong', async () => {
      await requestRegisterRoute({});
    });

    it('Should return 409 error if email is already registered', async () => {
      await createUser({});
      await requestRegisterRoute({ expectedStatus: 409 });
    });

    it('Should register user', async () => {
      await requestRegisterRoute({});
      expect(mockMailService.sendEmailVerificationEmail).toHaveBeenCalled();
    });
  });

  describe('POST /auth/verify-email', () => {
    const requestVerifyEmailRoute = async ({
      token,
      expectedStatus,
      userId,
      email,
      verified = false,
    }: {
      token?: string;
      expectedStatus?: number;
      userId?: string;
      email?: string;
      verified?: boolean;
    }) => {
      const user = await createUser({});
      const emailToken = jwt.sign(
        { userId: userId ?? user.id, email: email ?? user.email },
        process.env.JWT_VERIFY_EMAIL_SECRET as string,
        {
          expiresIn: '30d',
        }
      );
      const user_tokens = await prismaClient.user_tokens.create({
        data: {
          app_user_id: user.id,
          email_verification_token: token ?? emailToken,
          email_verification_expiry: '30d',
        },
      });
      if (verified)
        await prismaClient.app_user.update({
          where: { email: 'jeet@gmail.com' },
          data: { email_verified: true },
        });
      const res = await request(app.getHttpServer())
        .post('/auth/verify-email')
        .send({ token: token ?? emailToken })
        .expect(expectedStatus ?? 200);
      return { res, emailToken, user_tokens };
    };

    it('Should throw error if token is invalid', async () => {
      await requestVerifyEmailRoute({
        token: 'token',
        expectedStatus: 401,
      });
    });

    it('Should throw error if user is not registered', async () => {
      await requestVerifyEmailRoute({
        userId: '123123',
        email: 'test@gmail.com',
        expectedStatus: 401,
      });
    });

    it('Should throw error if another token is provided', async () => {
      await requestVerifyEmailRoute({
        userId: '123123',
        email: 'test@gmail.com',
        expectedStatus: 401,
        token: 'token',
      });
    });

    it('Should throw error if email has already been verified', async () => {
      await requestVerifyEmailRoute({
        expectedStatus: 400,
        verified: true,
      });
    });

    it('Should verify the email', async () => {
      await requestVerifyEmailRoute({
        expectedStatus: 200,
      });
    });
  });

  describe('POST /auth/request-reset-password', () => {
    const requestRequestResetPassword = async ({
      email,
      expectedStatus,
    }: {
      email?: string;
      expectedStatus?: number;
    }) => {
      const res = await request(app.getHttpServer())
        .patch('/auth/request-reset-password')
        .send({ email: email ?? 'jeet@gmail.com' })
        .expect(expectedStatus ?? 200);
      return { res };
    };
    it.each([
      { testmail: 'jeet' },
      { testmail: 'jeet.com' },
      { testmail: 'jeet1232.com' },
      { testmail: 'jeet$sadksa.csdas' },
    ])('Should throw if invalid email is provided', async ({ testmail }) => {
      await requestRequestResetPassword({
        email: testmail,
        expectedStatus: 400,
      });
    });

    it('Should throw error if user not found', async () => {
      await createUser({ email: 'jeet@gmail.com' });
      await requestRequestResetPassword({
        email: 'test@gmail.com',
        expectedStatus: 404,
      });
    });

    it("Should send email to the user's inbox", async () => {
      await createUser({});
      await requestRequestResetPassword({ expectedStatus: 200 });
      expect(mockMailService.sendResetPasswordToken).toHaveBeenCalled();
    });
  });

  describe('POST /auth/logout', () => {
    it('Should request clear cookies', async () => {
      const res = await request(app.getHttpServer()).patch('/auth/logout');
      expect(
        res.header['set-cookie'][0].startsWith('AUTH_REFRESH_TOKEN=')
      ).toBeTruthy();
    });
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
});
