import { Injectable, NotFoundException } from '@nestjs/common';
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
import { User } from '@/user/user.entity';
import { createId } from '@paralleldrive/cuid2';

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

  async toggleLikePost(postId: string, userId: string) {
    const res = await this.neo4jService.write(
      `MATCH (user:USER {id: $userId}), (post:POST {id: $postId})
     OPTIONAL MATCH (user)-[r:LIKES]->(post)
     WITH user, post, r,
          CASE WHEN r IS NULL THEN 'CREATE' ELSE 'DELETE' END AS action
     CALL apoc.do.when(
       action = 'CREATE',
       'CREATE (user)-[:LIKES]->(post) RETURN 1 as result',
       'DELETE r RETURN 0 as result',
       {user: user, post: post, r: r}
     ) YIELD value
     RETURN value.result as toggleResult`,
      {
        postId,
        userId,
      }
    );
    return res.records[0].get('toggleResult') === 1 ? 'Liked' : 'Unliked';
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

  async getPostComments(
    postId: string,
    page: number = 0,
    limit: number = 10
  ): Promise<{ comments: Post[]; hasMore: boolean; nextPage: number }> {
    const skip = page * limit;
    const result = await this.neo4jService.read(
      `MATCH (post:POST {id: $postId})<-[:REPLY_TO]-(comment:POST)
       OPTIONAL MATCH (comment)-[:HAS_MEDIA]->(media:POST_MEDIA)
       OPTIONAL MATCH (comment)<-[:POSTED]-(user:USER)
       WITH comment, collect(media) as comment_media, user
       ORDER BY comment.created_on DESC
       SKIP $skip
       LIMIT $limit
       RETURN comment, comment_media, user`,
      { postId, skip, limit: limit + 1 }
    );

    const comments = result.records.slice(0, limit).map((record) => {
      const comment = new PostCon(record.get('comment')).getObject();
      const media = record
        .get('comment_media')
        .map((m) => new PostMediaCon(m).getObject());
      const user = record.get('user').properties;
      return { ...comment, post_media: media, user };
    });

    const hasMore = result.records.length > limit;
    const nextPage = hasMore ? page + 1 : null;

    return { comments, hasMore, nextPage };
  }

  async toggleBookmarkPost(postId: string, userId: string) {
    const res = await this.neo4jService.write(
      `MATCH (user:USER {id: $userId}), (post:POST {id: $postId})
       OPTIONAL MATCH (user)-[r:BOOKMARKED]->(post)
       WITH user, post, r,
            CASE WHEN r IS NULL THEN 'CREATE' ELSE 'DELETE' END AS action
       CALL apoc.do.when(
         action = 'CREATE',
         'CREATE (user)-[:BOOKMARKED]->(post) RETURN 1 as result',
         'DELETE r RETURN 0 as result',
         {user: user, post: post, r: r}
       ) YIELD value
       RETURN value.result as toggleResult, post`,
      {
        postId,
        userId,
      }
    );
    return {
      post: {
        ...new PostCon(res.records[0].get('post')).getObject(),
        bookmarked:
          res.records[0].get('toggleResult') === 1
            ? 'Bookmarked'
            : 'Unbookmarked',
      },
    };
  }

  async getPost(
    postId: string,
    userId: string
  ): Promise<{
    post: Post & {
      post_media: PostMedia[];
      comments: Post[];
      creator: Partial<User>;
      liked: boolean;
      bookmarked: boolean;
    };
  }> {
    const result = await this.neo4jService.read(
      `MATCH (post:POST {id: $postId})
       OPTIONAL MATCH (post)-[:HAS_MEDIA]->(media:POST_MEDIA)
       OPTIONAL MATCH (post)<-[:POSTED]-(creator:USER)
       OPTIONAL MATCH (post)<-[:REPLY_TO]-(comment:POST)
       OPTIONAL MATCH (comment)<-[:POSTED]-(commentCreator:USER)
       OPTIONAL MATCH (user:USER {id: $userId})-[liked:LIKES]->(post)
       OPTIONAL MATCH (user)-[bookmarked:BOOKMARKED]->(post)
       WITH post, collect(DISTINCT media) as post_media, creator,
            collect(DISTINCT {comment: comment, creator: commentCreator}) as comments,
            CASE WHEN liked IS NOT NULL THEN true ELSE false END as liked,
            CASE WHEN bookmarked IS NOT NULL THEN true ELSE false END as bookmarked
       RETURN post, post_media, creator, comments, liked, bookmarked
       LIMIT 1`,
      { postId, userId }
    );

    if (result.records.length === 0) {
      throw new NotFoundException('Post not found');
    }

    const record = result.records[0];
    const post = new PostCon(record.get('post')).getObject();
    const postMedia = record
      .get('post_media')
      .map((m) => new PostMediaCon(m).getObject());
    const creator = record.get('creator').properties;
    const comments = record
      .get('comments')
      .slice(0, 10)
      .map((c) => ({
        ...new PostCon(c.comment).getObject(),
        creator: c.creator.properties,
      }));
    const liked = record.get('liked');
    const bookmarked = record.get('bookmarked');

    return {
      post: {
        ...post,
        post_media: postMedia,
        comments,
        creator,
        liked,
        bookmarked,
      },
    };
  }

  async commentOnPost({
    postId,
    userId,
    comment,
    media,
  }: {
    postId: string;
    userId: string;
    comment: string;
    media: Express.Multer.File[];
  }): Promise<Post> {
    const newComment = await this.neo4jService
      .write(
        `MATCH (user:USER {id: $userId}), (post:POST {id: $postId})
       CREATE (comment:POST {id: $commentId, caption: $comment, created_on: datetime(), updated_on: datetime(), likes_count: 0})
       CREATE (user)-[:POSTED]->(comment)-[:REPLY_TO]->(post)
       RETURN comment`,
        {
          userId,
          postId,
          commentId: createId(),
          comment,
        }
      )
      .then((res) => new PostCon(res.records[0].get('comment')).getObject());

    // Upload and create media for the comment
    for (const item of media) {
      const uploadedItem = await this.cloudinaryService.uploadImage(item);
      await this.createPostMedia({
        post_id: newComment.id,
        media_type: MediaType.IMAGE,
        creator_id: userId,
        modified_media_url: uploadedItem.url,
        original_media_url: uploadedItem.url,
      });
    }

    const updatedPost = await this.getPost(postId, userId);
    return updatedPost.post;
  }
}
