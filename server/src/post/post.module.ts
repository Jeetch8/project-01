import { Module } from '@nestjs/common';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { CloudinaryModule } from '@/lib/cloudinary/cloudinary.module';
import { GoogleAIModule } from '@/lib/googleAI/googleAI.module';

@Module({
  imports: [CloudinaryModule, GoogleAIModule],
  controllers: [PostController],
  providers: [PostService],
  exports: [PostService],
})
export class PostModule {}
