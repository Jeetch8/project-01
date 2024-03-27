import { belongsTo, createServer, hasMany, Model } from 'miragejs';
import {
  MediaSchema,
  PostSchema,
  UserSchema,
  UserTokensSchema,
} from './Schemas';
import { IMediaType, IPost, IPostMedia } from '@/utils/interfaces';
import { faker } from '@faker-js/faker';

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
        // const media = server.createList('media', 4);
        server.create('post', { user });
      }
    },

    routes() {
      this.urlPrefix = 'http://localhost:5000';
      this.namespace = '/api/v1';

      this.get('/post/feed', (schema, request) => {
        const posts = schema.db.posts;
        const arr: IPost[] = [];
        for (let i = 0; i < posts.length; i++) {
          const postMedia = [];
          for (let j = 0; j < faker.number.int({ min: 0, max: 4 }); j++) {
            postMedia.push({
              id: faker.string.uuid(),
              media_type: IMediaType.IMAGE,
              tags: faker.lorem.words(),
              alt: faker.lorem.words(),
              original_media_url: faker.image.urlPicsumPhotos(),
              modified_media_url: faker.image.urlPicsumPhotos(),
            });
          }
          const user = schema.db.users.findBy({ id: posts[i].userId });
          arr.push({
            ...posts[i],
            creator: {
              id: user.id,
              full_name: user.full_name,
              first_name: user.first_name,
              last_name: user.last_name,
              username: user.username,
              profile_img: user.profile_img,
            },
            media: postMedia,
          });
        }
        return { feed: arr };
      });

      this.get('/user/me', async (schema, request) => {
        return { user: schema.db.users[0] };
      });

      this.post('/auth/login/local', (schema, request) => {
        return { token: 'testtoken' };
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
    },
  });
  return server;
}
