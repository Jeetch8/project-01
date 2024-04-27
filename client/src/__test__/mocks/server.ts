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
  ISchemaPost,
  ICommunity,
  IUserSession,
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

      this.put('/user', (schema, request) => {
        return { user: schema.db.users[0] };
      });

      this.get('/user', (schema, request) => {
        const query =
          typeof request.queryParams.query === 'string'
            ? request.queryParams.query.toLowerCase()
            : '';
        const users = schema.db.users.filter(
          (user) =>
            user.full_name.toLowerCase().includes(query) ||
            user.username.toLowerCase().includes(query)
        );
        return {
          users: users.map((user) => ({
            id: user.id,
            value: user.id,
            label: user.full_name,
            username: user.username,
            full_name: user.full_name,
            profile_img: user.profile_img,
            bio: user.bio,
          })),
          hasMore: users.length > 10,
          currentPage: 1,
          nextPage: 2,
        };
      });

      this.get('/post/feed', (schema, request) => {
        const page = request.queryParams.page;
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
        return {
          posts: arr,
          hasMore: true,
          currentPage: page,
          nextPage: page ? Number(page) + 1 : 2,
        };
      });

      this.get('/user/:username', async (schema, request) => {
        if (request.params.username === 'me') {
          return { user: schema.db.users[0] };
        }
        const user = schema.db.users.findBy({
          username: request.params.username,
        });
        return { user };
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
        return { post: schema.db.posts[0] };
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

      this.get('/posts/comments', (schema, request) => {
        const page = request.queryParams.page;
        const user = schema.db.users[0];
        const formattedPosts = schema.db.posts.map((post) => ({
          ...post,
          comments: [], // Assuming comments are not pre-loaded
          creator: user,
        }));

        return {
          posts: formattedPosts,
          hasMore: true,
          nextPage: Number(page) + 1,
          currentPage: page,
        };
      });

      this.get('/user/bookmarks', (schema, request) => {
        const page = request.queryParams.page;
        const formattedPosts = schema.db.posts.map((post) => ({
          ...post,
          creator: schema.db.users.find(post.userId),
          media: Array(faker.number.int({ min: 0, max: 4 }))
            .fill(null)
            .map(() => createPostMedia()),
        }));

        return {
          bookmarks: formattedPosts,
          hasMore: true,
          nextPage: Number(page) + 1,
          currentPage: page,
        };
      });

      this.get('/user/profile', (schema, request) => {
        const formattedPosts = schema.db.posts.map((post) => ({
          ...post,
          creator: schema.db.users.find(post.userId),
          media: Array(faker.number.int({ min: 0, max: 4 }))
            .fill(null)
            .map(() => createPostMedia()),
        }));

        const firstUser = schema.db.users[0];

        return {
          posts: {
            posts: formattedPosts,
            hasMore: true,
            nextPage: 2,
            currentPage: 1,
          },
          user: firstUser,
        };
      });

      this.get('/user/:username/liked-posts', (schema, request) => {
        const page = request.queryParams.page;
        const formattedPosts = schema.db.posts.map((post) => ({
          ...post,
          creator: schema.db.users.find(post.userId),
          media: Array(faker.number.int({ min: 0, max: 4 }))
            .fill(null)
            .map(() => createPostMedia()),
        }));

        return {
          posts: formattedPosts,
          hasMore: true,
          nextPage: Number(page) + 1,
          currentPage: page,
        };
      });

      this.get('/user/posts', (schema, request) => {
        const page = request.queryParams.page;
        const formattedPosts = schema.db.posts.map((post) => ({
          ...post,
          creator: schema.db.users.find(post.userId),
          media: Array(faker.number.int({ min: 0, max: 4 }))
            .fill(null)
            .map(() => createPostMedia()),
        }));

        return {
          posts: formattedPosts,
          hasMore: true,
          nextPage: Number(page) + 1,
          currentPage: page,
        };
      });

      this.get('/post/search', (schema, request) => {
        const page = request.queryParams.page;
        const formattedPosts = schema.db.posts.map((post) => ({
          ...post,
          creator: schema.db.users.find(post.userId),
          media: Array(faker.number.int({ min: 0, max: 4 }))
            .fill(null)
            .map(() => createPostMedia()),
        }));

        return {
          posts: formattedPosts,
          hasMore: true,
          nextPage: Number(page) + 1,
          currentPage: page,
        };
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

      this.get('/user/communities', (schema, request) => {
        const page = parseInt(request.queryParams.page as string) || 1;
        const communities: ICommunity[] = Array(20)
          .fill(null)
          .map(() => ({
            id: faker.string.uuid(),
            name: faker.word.words(2),
            banner_img: faker.image.url(),
            members_count: faker.number.int({ min: 100, max: 10000 }),
            description: faker.word.words(),
            members: Array(10)
              .fill(null)
              .map(() => faker.string.uuid()),
          }));
        const posts: IFeedPost[] = schema.db.posts.map((post) => ({
          ...post,
          creator: schema.db.users.find(post.userId),
          media: Array(faker.number.int({ min: 0, max: 4 }))
            .fill(null)
            .map(() => createPostMedia()),
          isCommunityPost: true,
          communityName: faker.helpers.arrayElement(communities).name,
          roleInCommunity: faker.helpers.maybe(
            () => faker.helpers.arrayElement(['Admin', 'Mod'] as const),
            { probability: 0.3 }
          ),
        }));

        return {
          communities,
          posts: {
            posts,
            hasMore: true,
            nextPage: page + 1,
            currentPage: page,
          },
        };
      });

      this.get('/community/:communityId', (schema, request) => {
        const communityId = request.params.communityId;
        const page = parseInt(request.queryParams.page as string) || 1;

        const community: ICommunity = {
          id: communityId,
          name: faker.word.words(2),
          banner_img: faker.image.url(),
          members_count: faker.number.int({ min: 100, max: 10000 }),
          description: faker.lorem.paragraph(),
          members: schema.db.users,
        };

        const posts: IFeedPost[] = Array(10)
          .fill(null)
          .map(() => ({
            ...schema.db.posts[0],
            id: faker.string.uuid(),
            creator: schema.db.users[0],
            media: Array(faker.number.int({ min: 0, max: 4 }))
              .fill(null)
              .map(() => createPostMedia()),
            isCommunityPost: true,
            communityName: community.name,
            roleInCommunity: faker.helpers.maybe(
              () => faker.helpers.arrayElement(['Admin', 'Mod'] as const),
              { probability: 0.3 }
            ),
          }));

        return {
          community,
          posts: {
            posts,
            hasMore: page < 5, // Simulate 5 pages of content
            nextPage: page + 1,
            currentPage: page,
          },
        };
      });

      // New endpoint for fetching comments
      this.get('/post/:postId/comments', (schema, request) => {
        const page = parseInt(request.queryParams.page as string) || 1;

        const comments = schema.db.posts.map((post) => ({
          ...post,
          creator: schema.db.users.find(post.userId),
          media: Array(faker.number.int({ min: 0, max: 4 }))
            .fill(null)
            .map(() => createPostMedia()),
        }));

        return {
          posts: comments,
          hasMore: true,
          nextPage: page + 1,
          currentPage: page,
        };
      });

      // New endpoint for fetching user's posts with media
      this.get('/user/:username/posts', (schema, request) => {
        const page = parseInt(request.queryParams.page as string) || 1;
        const posts: IFeedPost[] = Array(10)
          .fill(null)
          .map(() => ({
            ...schema.db.posts[0],
            id: faker.string.uuid(),
            creator: schema.db.users[0],
            media: Array(faker.number.int({ min: 0, max: 4 }))
              .fill(null)
              .map(() => createPostMedia()),
            isCommunityPost: false,
            communityName: undefined,
            roleInCommunity: undefined,
          }));

        return {
          posts: posts,
          hasMore: true,
          nextPage: page + 1,
          currentPage: page,
        };
      });

      this.get('/user/:username/media', (schema, request) => {
        const page = parseInt(request.queryParams.page as string) || 1;

        const media = Array(20)
          .fill(null)
          .map(() => ({
            ...createPostMedia(),
            post: faker.helpers.arrayElements(schema.db.users),
          }));

        return {
          media: media,
          hasMore: true,
          nextPage: page + 1,
          currentPage: page,
        };
      });

      this.get('/community/:communityId/post/media', (schema, request) => {
        const page = parseInt(request.queryParams.page as string) || 1;

        const media = Array(20)
          .fill(null)
          .map(() => ({
            ...createPostMedia(),
            post: faker.helpers.arrayElements(schema.db.users),
          }));

        return {
          media: media,
          hasMore: true,
          nextPage: page + 1,
          currentPage: page,
        };
      });

      this.get('/community/:communityId/post/top', (schema, request) => {
        const page = parseInt(request.queryParams.page as string) || 1;
        const posts: IFeedPost[] = Array(10)
          .fill(null)
          .map(() => ({
            ...schema.db.posts[0],
            id: faker.string.uuid(),
            creator: schema.db.users[0],
            media: Array(faker.number.int({ min: 0, max: 4 }))
              .fill(null)
              .map(() => createPostMedia()),
            isCommunityPost: true,
            communityName: faker.word.words(2),
            roleInCommunity: faker.helpers.maybe(
              () => faker.helpers.arrayElement(['Admin', 'Mod'] as const),
              { probability: 0.3 }
            ),
          }));

        return {
          posts: posts,
          hasMore: true,
          nextPage: page + 1,
          currentPage: page,
        };
      });

      this.get('/user/sessions', (schema, request) => {
        const sessions: IUserSession[] = Array(10)
          .fill(null)
          .map(() => ({
            id: faker.string.uuid(),
            device_name: faker.helpers.arrayElement([
              'Desktop',
              'Mobile',
              'Tablet',
            ]),
            browser: faker.word.words(2),
            os: faker.word.words(2),
            ip_address: faker.internet.ip(),
            location: faker.location.city(),
            operating_system: faker.word.words(2),
            last_seen_on: faker.date.recent().toISOString(),
            signed_in_on: faker.date.recent().toISOString(),
            logged_in: faker.datatype.boolean(),
            logged_in_date: faker.date.recent().toISOString(),
            last_logged_in_date: faker.date.recent().toISOString(),
          }));
        return {
          sessions,
          user_ip: faker.internet.ip(),
        };
      });

      this.get('/community/:communityId/post/latest', (schema, request) => {
        const page = parseInt(request.queryParams.page as string) || 1;
        const posts: IFeedPost[] = Array(10)
          .fill(null)
          .map(() => ({
            ...schema.db.posts[0],
            id: faker.string.uuid(),
            creator: schema.db.users[0],
            media: Array(faker.number.int({ min: 0, max: 4 }))
              .fill(null)
              .map(() => createPostMedia()),
            isCommunityPost: true,
            communityName: faker.word.words(2),
            roleInCommunity: faker.helpers.maybe(
              () => faker.helpers.arrayElement(['Admin', 'Mod'] as const),
              { probability: 0.3 }
            ),
          }));

        return {
          posts: posts,
          hasMore: true,
          nextPage: page + 1,
          currentPage: page,
        };
      });
    },
  });
  return server;
}
