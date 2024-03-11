import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from '@/user/user.service';
import { PrismaService } from '@/prisma.service';

const mockNeo4jService = {
  read: jest.fn(),
  write: jest.fn(),
};

const mockPrismaService = {
  app_user: {
    findMany: jest.fn().mockResolvedValue({
      email: 'jeetchawda@gmail.com',
      password: 'password',
    }),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        JwtService,
        UserService,
        { provide: PrismaService, useValue: mockPrismaService },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((x) => '1d'),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateLocalLogin', () => {
    it('should return an object with accessToken and refreshToken when validateLocalLogin is called with a valid email and password', async () => {
      const payload = { email: 'JeetChawda@gmail.com', password: 'password' };
      const { accessToken, refreshToken } =
        await service.validateLocalLogin(payload);
      expect(accessToken).toBeInstanceOf(String);
      expect(refreshToken).toBeInstanceOf(String);
    });
  });
});
