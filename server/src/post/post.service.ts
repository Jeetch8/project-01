import { Injectable } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PrismaService } from '@/prisma.service';
import { FileUploadService } from '@/file_upload/file_upload.service';
import { CloudinaryService } from '@/lib/cloudinary/cloudinary.service';
import { jwtAuthTokenPayload } from '@/auth/entities/auth.entity';
import { Neo4jService } from 'nest-neo4j/dist';

@Injectable()
export class PostService {
  constructor(
    private prismaService: PrismaService,
    private cloudinaryService: CloudinaryService,
    private neo4jService: Neo4jService
  ) {}

  async createPost({
    caption,
    media,
    requestUser,
  }: {
    caption: string;
    media: (Express.Multer.File | string)[];
    requestUser: jwtAuthTokenPayload;
  }) {
    const newPost = await this.prismaService.post.create({
      data: {
        caption,
        creator_id: requestUser.userId,
      },
    });
    for (let i = 0; i < media.length; i++) {
      const item = media[i];
      if (typeof item !== 'string') {
        if (item instanceof Blob) {
          const uploadedItem = await this.cloudinaryService.uploadImage(item);
          await this.prismaService.post_media.create({
            data: {
              post_id: newPost.id,
              media_type: 'image',
              creator_id: requestUser.userId,
              modified_media_url: uploadedItem.secure_url,
              original_media_url: uploadedItem.secure_url,
            },
          });
        }
      } else {
        await this.prismaService.post_media.create({
          data: {
            modified_media_url: item,
            original_media_url: item,
            creator_id: requestUser.userId,
            media_type: 'image',
            post_id: newPost.id,
          },
        });
      }
    }
    return newPost;
  }

  async deletePost(postid: string) {
    if (postid) await this.prismaService.post.delete({ where: { id: postid } });
  }

  async likePost(postId: string, userId: string) {
    const post = await this.prismaService.post.findUnique({
      where: { id: postId },
    });
    if (!post) throw new Error('Post not found');
    const like = await this.prismaService.post_likes.findFirst({
      where: {
        post_id: postId,
        user_id: userId,
      },
    });
    if (like) {
      await this.prismaService.post_likes.delete({ where: { id: like.id } });
    } else {
      await this.prismaService.post_likes.create({
        data: {
          post_id: postId,
          user_id: userId,
        },
      });
    }
  }
}
