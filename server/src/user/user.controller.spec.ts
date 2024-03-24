import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { ConfigModule } from '@nestjs/config';
import { Neo4jService } from 'nest-neo4j/dist';

// Mock Neo4jService
const mockNeo4jService = {
  // Add any methods from Neo4jService that your UserService might be using
  // For example:
  read: jest.fn(),
  write: jest.fn(),
};

// Mock PrismaService
const mockPrismaService = {
  // Add any methods from PrismaService that your UserService might be using
  // For example:
  user: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

describe('UserController', () => {
  let controller: UserController;
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
        }),
      ],
      controllers: [UserController],
      providers: [
        UserService,
        {
          provide: Neo4jService,
          useValue: mockNeo4jService,
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // Add more tests for your controller methods here
  // For example:
  it('should find all users', async () => {});
});
