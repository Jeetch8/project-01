import { Module } from '@nestjs/common';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { CloudinaryService } from '@/lib/cloudinary/cloudinary.service';

@Module({
  controllers: [PostController],
  providers: [PostService, CloudinaryService],
})
export class PostModule {}
