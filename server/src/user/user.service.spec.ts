import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { Neo4jService } from 'nest-neo4j/dist';

describe('UserService', () => {
  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserService, Neo4jService],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
