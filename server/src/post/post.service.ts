import { Injectable } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { FileUploadService } from '@/file_upload/file_upload.service';
import { CloudinaryService } from '@/lib/cloudinary/cloudinary.service';
import { jwtAuthTokenPayload } from '@/auth/entities/auth.entity';
import { Neo4jService } from 'nest-neo4j/dist';
import {
  MediaType,
  PostCon,
  PostMedia,
  PostMediaCon,
  Post,
} from './entities/post.entity';

@Injectable()
export class PostService {
  constructor(
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
  }): Promise<Post> {
    const newPost = await this.neo4jService
      .write(
        `MATCH (user:USER {id:$creatorid})
      CREATE (post:POST {caption:$caption}) -[:CREATED_BY]-> (user)
      RETURN post
      `,
        {
          caption,
          creatorid: requestUser.userId,
        }
      )
      .then((res) => {
        const record = res.records[0];
        return new PostCon(record.get('post')).getObject();
      });
    for (let i = 0; i < media.length; i++) {
      const item = media[i];
      if (typeof item !== 'string') {
        if (item instanceof Blob) {
          const uploadedItem = await this.cloudinaryService.uploadImage(item);
          await this.createPostMedia({
            post_id: newPost.id,
            media_type: MediaType.IMAGE,
            creator_id: requestUser.userId,
            modified_media_url: uploadedItem.url,
            original_media_url: uploadedItem.url,
          });
        }
      } else {
        await this.createPostMedia({
          post_id: newPost.id,
          media_type: MediaType.IMAGE,
          creator_id: requestUser.userId,
          modified_media_url: item,
          original_media_url: item,
        });
      }
    }
    return newPost;
  }

  async deletePost(postid: string) {
    const res = await this.neo4jService.write(
      `MATCH (post:POST {id:$postid})
      MATCH (post_media:POST_MEDIA) -[:MEDIA_OF]-> (post)
      DETACH DELETE post
      `,
      {
        postid,
      }
    );
    if (res.records[0].get('deleted') === 0) {
      throw new Error('Post not found');
    }
    return res.records[0].get('deleted');
  }

  // async likePost(postId: string, userId: string) {
  //   const post = await this.neo4jService
  //     .read(
  //       `MATCH (post:POST {id:$postId})
  //     RETURN post
  //     `,
  //       {
  //         postId,
  //       }
  //     )
  //     .then((res) => {
  //       return res.records.map((record) => {
  //         return new PostCon(record.get('post')).getObject();
  //       });
  //     });
  //   // const post = await this.prismaService.post.findUnique({
  //   //   where: { id: postId },
  //   // });
  //   if (!post) throw new Error('Post not found');
  //   const like = await this.neo4jService
  //     .read(
  //       `MATCH (post:POST {id:$postId}) -[likes:LIKED]-> (user:USER {id:$userId})
  //     RETURN user, likes
  //     `,
  //       {
  //         postId,
  //         userId,
  //       }
  //     )
  //     .then((res) => {
  //       return res.records.map((record) => {
  //         return new PostCon(record.get('user')).getObject();
  //       });
  //     });
  // }

  async disLikePost(postId: string, userId: string) {
    const res = await this.neo4jService.write(
      `MATCH (post:POST {id:$postId}) -[likes:LIKED]-> (user:USER {id:$userId})
      DELETE likes
      `,
      {
        postId,
        userId,
      }
    );
    if (res.records[0].get('deleted') === 0) {
      throw new Error('Like not found');
    }
    return res.records[0].get('deleted');
  }

  async likePost(postId: string, userId: string) {
    const res = await this.neo4jService.write(
      `MATCH (post:POST {id:$postId})
      MATCH (user:USER {id:$userId})
      CREATE (user) -[:LIKED]-> (post)
      RETURN post.likes
      `,
      {
        postId,
        userId,
      }
    );
    return res.records[0].get('likes');
  }

  async createPostMedia(payload: Omit<PostMedia, 'id'>) {
    const {
      post_id,
      media_type,
      creator_id,
      modified_media_url,
      original_media_url,
    } = payload;
    return this.neo4jService
      .write(
        `MATCH (post:POST {id:$post_id})
      CREATE (post_media:POST_MEDIA {media_type:$media_type,creator_id:$creator_id,modified_media_url:$modified_media_url,original_media_url:$original_media_url}) -[:MEDIA_OF]-> (post)
      RETURN post_media, post
      `,
        {
          post_id,
          media_type,
          creator_id,
          modified_media_url,
          original_media_url,
        }
      )
      .then((res) => {
        return res.records.map((record) => {
          return {
            post: record.get('post'),
            post_media: new PostMediaCon(record.get('post_media')).getObject(),
          };
        });
      });
  }
}
