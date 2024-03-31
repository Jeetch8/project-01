import { belongsTo, createServer, hasMany, Model } from 'miragejs';
import {
  MediaSchema,
  PostSchema,
  UserSchema,
  UserTokensSchema,
} from './Schemas';
import {
  IFeedPost,
  IMediaType,
  IPost,
  ISchemaPost,
  IUser,
} from '@/utils/interfaces';
import { faker } from '@faker-js/faker';

const createPostMedia = () => {
  return {
    id: faker.string.uuid(),
    media_type: IMediaType.IMAGE,
    tags: faker.lorem.words(),
    alt: faker.lorem.words(),
    original_media_url: faker.image.urlPicsumPhotos(),
    modified_media_url: faker.image.urlPicsumPhotos(),
  };
};

export function makeServer({ environment = 'development' }) {
  const server = createServer({
    environment,

    factories: {
      post: PostSchema,
      user: UserSchema,
      media: MediaSchema,
      user_token: UserTokensSchema,
    },

    models: {
      user: Model,
      media: Model.extend({}),
      post: Model.extend({
        user: belongsTo('user'),
        media: hasMany('media'),
      }),
      user_token: Model,
    },

    seeds(server) {
      server.create('user_token');
      for (let i = 0; i < 10; i++) {
        const user = server.create('user');
        server.create('post', {
          user,
        });
      }
    },

    routes() {
      this.urlPrefix = 'http://localhost:5000';
      this.namespace = '/api/v1';

      this.get('/post/feed', (schema, request) => {
        const posts: (ISchemaPost & { userId: string })[] = schema.db.posts;
        const arr: IFeedPost[] = [];
        for (let i = 0; i < posts.length; i++) {
          const postMedia = [];
          for (let j = 0; j < faker.number.int({ min: 0, max: 4 }); j++) {
            postMedia.push(createPostMedia());
          }
          const user = schema.db.users.findBy({ id: posts[i].userId });
          arr.push({ ...posts[i], media: postMedia, creator: user });
        }
        return { feed: arr };
      });

      this.get('/user/me', async (schema, request) => {
        return { user: schema.db.users[0] };
      });
      this.patch('/post/:id/togglelike', (schema, request) => {
        const post = schema.db.posts.find(request.params.id);
        const isLiked = post.liked;
        const likesCount = isLiked
          ? post.likes_count - 1
          : post.likes_count + 1;

        this.db.posts.update(request.params.id, {
          likes_count: likesCount,
        });

        post.liked = !isLiked;
        post.likes_count = likesCount;

        return { post };
      });
      this.patch('/post/:id/bookmark', (schema, request) => {
        const post = schema.db.posts.find(request.params.id);
        const isBookmarked = post.bookmarked;
        this.db.posts.update(request.params.id, {
          bookmarked: !isBookmarked,
        });

        post.bookmarked = !isBookmarked;
        return { post };
      });
      this.post('/auth/login/local', (schema, request) => {
        return { access_token: 'access_token' };
      });
      this.patch('/auth/request-reset-password', (schema, request) => {
        return { message: 'Email sent' };
      });
      this.patch('auth/reset-password', (schema, request) => {
        return { message: 'Password reseted' };
      });
      this.patch('/auth/verify-email', (schema, request) => {
        return { message: 'Email verified' };
      });
      this.post('/auth/register/local', (schema, request) => {
        return { message: 'user registered' };
      });

      this.put('/post/:id/comment', (schema, request) => {
        const postId = request.params.id;
        const { comment } = JSON.parse(request.requestBody);

        const post = schema.db.posts.find(postId);
        if (!post) {
          return new Response(null, {
            status: 404,
            statusText: 'Post not found',
          });
        }

        const newComment = {
          id: faker.string.uuid(),
          content: comment,
          created_at: new Date().toISOString(),
          user: schema.db.users[0],
        };

        post.comments = [...(post.comments || []), newComment];

        return { post };
      });

      this.get('/post/:id', (schema, request) => {
        const post = schema.db.posts[0];
        const user = schema.db.users[0];
        post.creator = user;
        const postMedia = [];
        for (let j = 0; j < faker.number.int({ min: 0, max: 4 }); j++) {
          postMedia.push(createPostMedia());
        }
        post.media = postMedia;
        const comments = [];
        for (let i = 0; i < schema.db.posts.length; i++) {
          comments.push({ ...schema.db.posts[i], creator: user });
        }
        post.comments = comments;
        return { post };
      });
      this.post('/post', (schema, request) => {
        return { post: schema.db.posts[0] };
      });
      this.passthrough('https://tenor.googleapis.com/*');
    },
  });
  return server;
}
