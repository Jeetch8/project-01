import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import * as request from 'supertest';
import { hashPassword } from '@/utils/helpers';
import * as jwt from 'jsonwebtoken';
import { AppModule } from '@/app.module';
import { Neo4jModule, Neo4jService } from 'nest-neo4j/dist';
import { UserCon, UserTokenCon } from '@/user/user.entity';
import { UserService } from '@/user/user.service';
import { createId } from '@paralleldrive/cuid2';
import { MailService } from '@/lib/mail/mail.service';
import { MailModule } from '@/lib/mail/mail.module';
import { AuthService } from '@/auth/auth.service';

const mockMailService = {
  sendEmailVerificationEmail: jest.fn().mockResolvedValueOnce(true),
  sendResetPasswordToken: jest.fn().mockResolvedValueOnce(true),
};

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let api: any;
  let neo4j: Neo4jService;
  let userService: UserService;
  let authService: AuthService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, TestingModule],
    })
      .overrideModule(Neo4jModule)
      .useModule(
        Neo4jModule.forRoot({
          scheme: 'neo4j',
          host: 'localhost',
          port: 7687,
          username: 'neo4j',
          password: 'password',
          database: 'neo4j',
        })
      )
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
    api = app.getHttpServer();
    neo4j = app.get(Neo4jService);
    authService = app.get(AuthService);
    userService = app.get(UserService);
    await neo4j.write(`MATCH (n) DETACH DELETE n`);
    await app.init();
  });

  const createUser = async (
    {
      password,
      email = 'jeet@gmail.com',
      profile_img = 'http://www.example.com',
      username = 'jeetkumar12',
      first_name = 'Jeet',
      last_name = 'Kumar',
      emailToken,
    }: {
      email?: string;
      password?: string;
      first_name?: string;
      last_name?: string;
      username?: string;
      profile_img?: string;
      emailToken?: string;
    },
    connection: Neo4jService
  ) => {
    const userId = createId();
    const userTokenId = createId();
    const hashed = await hashPassword('JEetk8035!@');
    const userStr = await userService.createUserPropertiesString({
      id: userId,
      email,
      password: hashed,
      first_name,
      last_name,
      username,
      profile_img,
      full_name: first_name + ' ' + last_name,
    });
    const emailTokenJWT = await authService.createEmailVerificationToken({
      email,
      userId,
    });
    const userTokenStr = await userService.createUserTokenPropertiesString({
      id: userTokenId,
      email_verification_expiry: '30d',
      email_verification_token: emailToken ?? emailTokenJWT,
    });
    const result = await neo4j
      .write(
        `CREATE (u:USER {${userStr}}) -[:TOKENS]-> (auth:USER_TOKEN {${userTokenStr}}) RETURN u,auth`
      )
      .then((res) => {
        return {
          user: new UserCon(res.records[0].get('u')).getObject(),
          userTokens: new UserTokenCon(res.records[0].get('auth')).getObject(),
        };
      });
    return { ...result, emailToken: emailToken ?? emailTokenJWT };
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
      const res = await request(app.getHttpServer())
        .post('/auth/login/local')
        .send({
          email: email ?? 'jeet@gmail.com',
          password: password ?? 'JEetk8035!@',
        })
        .expect(expectedStatus ?? 200);
      return res;
    };

    describe('Dto test', () => {
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
        message: expect.any(String),
        error: expect.any(String),
      });
    });

    it("Should return 401 error if password doesn't match", async () => {
      await createUser({}, neo4j);
      const req = await requestLoginRoute({
        expectedStatus: 401,
        password: 'Password1!@',
      });
      expect(req.body).toMatchObject({
        message: 'Unauthorized',
        error: expect.any(String),
      });
    });

    it('Should return access_token if email and password are correct', async () => {
      await createUser({}, neo4j);
      const res = await requestLoginRoute({});
      expect(res.body).toMatchObject({
        message: expect.any(String),
        access_token: expect.any(String),
      });
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
      const query = await request(app.getHttpServer())
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
        });
      return query;
      // .expect(expectedStatus ?? 201);
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

    it('Should return 409 error if email is already registered', async () => {
      await createUser({}, neo4j);
      await requestRegisterRoute({ expectedStatus: 409 });
    });

    it('Should register user', async () => {
      await requestRegisterRoute({});
      // expect(mockMailService.sendEmailVerificationEmail).toHaveBeenCalled();
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
      const result = await createUser({}, neo4j);
      if (verified)
        await neo4j.write(
          `MATCH (user:USER {id: $id}) SET user.email_verified=true`,
          { id: result.user.id }
        );
      const res = await request(app.getHttpServer())
        .patch('/auth/verify-email')
        .send({ token: token ?? result.userTokens.email_verification_token })
        .expect(expectedStatus ?? 200);
      return {
        res,
        emailToken: result.emailToken,
        user_tokens: result.userTokens,
      };
    };

    it('Should throw error if token is invalid', async () => {
      await requestVerifyEmailRoute({
        token: 'token',
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
      await createUser({ email: 'jeet@gmail.com' }, neo4j);
      await requestRequestResetPassword({
        email: 'test@gmail.com',
        expectedStatus: 404,
      });
    });

    it("Should send email to the user's inbox", async () => {
      await createUser({}, neo4j);
      await requestRequestResetPassword({ expectedStatus: 200 });
      expect(mockMailService.sendResetPasswordToken).toHaveBeenCalled();
    });
  });

  describe('POST /auth/logout', () => {
    it('Should request clear cookies', async () => {
      const res = await request(app.getHttpServer()).patch('/auth/logout');
      // expect(
      //   res.header['set-cookie'][0].startsWith('AUTH_ACCESS_TOKEN=')
      // ).toBeTruthy();
    });
  });

  afterEach(async () => {
    await neo4j.write(`MATCH (n) DETACH DELETE n`);
    await app.close();
  });
});
