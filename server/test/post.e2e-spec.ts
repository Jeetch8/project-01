import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { PostModule } from '@/post/post.module';
import { Neo4jModule } from 'nest-neo4j/dist';
import { ConfigModule, ConfigService } from '@nestjs/config';

describe('PostController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: `.env.development`,
        }),
        PostModule,
        Neo4jModule.forRootAsync({
          imports: [ConfigModule],
          global: true,
          useFactory: (configService: ConfigService) => ({
            scheme: configService.get('NEO4J_DB_SCHEME'),
            host: configService.get('NEO4J_DB_HOST'),
            port: configService.get('NEO4J_DB_PORT'),
            username: configService.get('NEO4J_DB_USERNAME'),
            password: configService.get('NEO4J_DB_PASSWORD'),
          }),
          inject: [ConfigService],
        }),
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer()).get('/post').expect(200).expect(String);
  });
});
