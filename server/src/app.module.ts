import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { validate } from '@/utils/env.validation';
import { AuthModule } from './auth/auth.module';
import { Neo4jModule } from 'nest-neo4j/dist';
import { UserModule } from './user/user.module';
import { MailModule } from './lib/mail/mail.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
      validate,
    }),
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
    AuthModule,
    UserModule,
    MailModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
