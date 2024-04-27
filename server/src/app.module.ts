import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { validate } from '@/utils/env.validation';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { MailModule } from './lib/mail/mail.module';
import { Neo4jModule } from 'nest-neo4j';
import { PostModule } from './post/post.module';
import { FileUploadModule } from './file_upload/file_upload.module';
import { SocketModule } from './socket/socket.module';
import { CacheModule } from '@nestjs/cache-manager';
import { MongooseModule } from '@nestjs/mongoose';
import { RedisModule } from '@nestjs-modules/ioredis';
import { CloudinaryModule } from './lib/cloudinary/cloudinary.module';
import { CommunityModule } from './community/community.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
      validate,
    }),
    Neo4jModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        scheme: configService.get('NEO4J_DB_SCHEME'),
        host: configService.get('NEO4J_DB_HOST'),
        port: configService.get('NEO4J_DB_PORT'),
        username: configService.get('NEO4J_DB_USERNAME'),
        password: configService.get('NEO4J_DB_PASSWORD'),
        database: configService.get('NEO4J_DB_DATABASE'),
      }),
    }),
    AuthModule,
    UserModule,
    MailModule,
    PostModule,
    FileUploadModule,
    SocketModule,
    RedisModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        url: configService.get('REDIS_URL'),
        type: 'single',
      }),
    }),
    CacheModule.register({
      isGlobal: true,
      modelOptions: {
        ttl: 1000 * 60 * 60 * 24 * 7,
      },
    }),
    MongooseModule.forRoot('mongodb://localhost:27017/social_media'),
    CloudinaryModule,
    CommunityModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
