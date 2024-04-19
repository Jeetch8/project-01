import Driver from 'neo4j-driver';
import mongoose from 'mongoose';
import { faker } from '@faker-js/faker';
import {
  User,
  UserToken,
  AuthProvider,
  Gender,
  createUserPropertiesString,
  createUserTokenPropertiesString,
  createAuthSessionPropertiesString,
  AuthSession,
} from './src/user/user.entity';
import {
  Post,
  PostMedia,
  MediaType,
  createPostPropertiesString,
  createPostMediaPropertiesString,
} from './src/post/entities/post.entity';
import { createId } from '@paralleldrive/cuid2';
import { UAParser } from 'ua-parser-js';
import { hashPassword } from './src/utils/helpers';

const driver = Driver.driver(
  'bolt://localhost:7687',
  Driver.auth.basic(
    process.env.NEO4J_DB_USERNAME,
    process.env.NEO4J_DB_PASSWORD
  )
);

const session = driver.session();

const createUser = async (): Promise<User> => {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();

  return {
    id: createId(),
    signup_date: faker.date.past().toISOString(),
    email: faker.internet.email().toLowerCase(),
    password: await hashPassword('PAssword!@12'),
    auth_provider: faker.helpers.arrayElement(Object.values(AuthProvider)),
    email_verified: faker.datatype.boolean(),
    first_name: firstName,
    last_name: lastName,
    full_name: `${firstName} ${lastName}`,
    username: faker.internet.userName(),
    profile_img: faker.image.avatarGitHub(),
    gender: faker.helpers.arrayElement(Object.values(Gender)),
    date_of_birth: faker.date.birthdate().toISOString(),
    banner_img: faker.image.url(),
    bio: faker.lorem.sentence(),
    location: faker.location.city(),
    followers_count: faker.number.int({ min: 0, max: 1000 }),
    following_count: faker.number.int({ min: 0, max: 1000 }),
  };
};

const createUserToken = (): UserToken => {
  return {
    id: faker.string.uuid(),
    forgot_password_token: faker.string.alphanumeric(20),
    forgot_password_token_expiry: faker.date.future().toISOString(),
    email_verification_token: faker.string.alphanumeric(20),
    email_verification_expiry: faker.date.future().toISOString(),
  };
};

const createPost = (): Post => {
  return {
    id: createId(),
    caption: faker.lorem.sentence(),
    likes_count: faker.number.int({ min: 0, max: 1000 }),
    created_on: faker.date.past(),
    updated_on: faker.date.recent(),
  };
};

const createPostMedia = (postId: string, creatorId: string): PostMedia => {
  return {
    id: createId(),
    post_id: postId,
    media_type: faker.helpers.arrayElement(Object.values(MediaType)),
    tags: faker.lorem.words(3),
    alt: faker.lorem.sentence(),
    original_media_url: faker.image.url(),
    modified_media_url: faker.image.url(),
    creator_id: creatorId,
  };
};

const createAuthSession = (): AuthSession => {
  const useragent = new UAParser(faker.internet.userAgent()).getResult();
  return {
    id: createId(),
    device_name: useragent.device.model || 'Unknown Device',
    browser: useragent.browser.name || 'Unknown Browser',
    os: useragent.os.name || 'Unknown OS',
    ip_address: faker.internet.ip(),
    location: faker.location.city(),
    logged_in: faker.datatype.boolean(),
    logged_in_date: faker.date.past().toISOString(),
    last_logged_in_date: faker.date.past().toISOString(),
  };
};

const createParticipant = (user: User): any => {
  return {
    name: user.full_name,
    email: user.email,
    profile_img: user.profile_img,
    userid: user.id,
    participatedRooms: [],
  };
};

const seed = async () => {
  // Connect to MongoDB
  await mongoose.connect(process.env.MONGODB_URI);

  // Clear existing participants
  await mongoose.connection.collection('participants').deleteMany({});
  await mongoose.connection.collection('rooms').deleteMany({});

  await session.run('MATCH (n) DETACH DELETE n');
  const userids = [];
  const followSet = new Set();
  const allPostsIds = [];
  for (let i = 0; i < 10; i++) {
    const user = await createUser();
    const userToken = createUserToken();
    let authSessionStr = '';
    for (let j = 0; j < faker.number.int({ min: 1, max: 5 }); j++) {
      const authSession = createAuthSession();
      authSessionStr += ` CREATE (u) - [z${j}:SESSION]-> (a${j}:AUTH_SESSION {${createAuthSessionPropertiesString(authSession)}}) `;
    }
    const userResult = await session.run(
      `CREATE (u:USER {${createUserPropertiesString(user)}}) -[r:TOKENS]-> (t:USER_TOKENS {${createUserTokenPropertiesString(userToken)}})
      ${authSessionStr}
      RETURN u, t`
    );
    userids.push(userResult.records[0].get('u').properties.id);

    // Create participant in MongoDB
    const participantData = createParticipant(user);
    await mongoose.connection
      .collection('participants')
      .insertOne(participantData);

    const follower = faker.helpers.arrayElement(userids);
    const following = faker.helpers.arrayElement(userids);
    if (follower !== following) {
      if (!followSet.has(`${follower}-${following}`)) {
        followSet.add(`${follower}-${following}`);
        await session.run(
          `MATCH (u:User {id: $follower}), (f:User {id: $following})
         CREATE (u)-[:FOLLOWS]->(f)
         RETURN u, f`,
          { follower, following }
        );
      }
    }

    // Create posts for each user
    const postIds = [];
    for (let j = 0; j < faker.number.int({ min: 1, max: 10 }); j++) {
      const post = createPost();
      let postMediaStr = '';
      for (let k = 0; k < faker.number.int({ min: 1, max: 3 }); k++) {
        const postMedia = createPostMedia(post.id, user.id);
        postMediaStr += ` CREATE (p) -[:HAS_MEDIA]-> (pm${k}:POST_MEDIA {${createPostMediaPropertiesString(postMedia)}}) `;
        postIds.push(post.id);
        allPostsIds.push(post.id);
      }
      await session.run(
        `MATCH (u:USER {id: $userId})
        CREATE (p:POST {${createPostPropertiesString(post)}})
        CREATE (u)-[:POSTED]->(p)
        ${postMediaStr}
         RETURN p`,
        { userId: user.id }
      );
    }

    // Create replies for random posts
    for (
      let j = 0;
      j < faker.number.int({ min: 0, max: allPostsIds.length });
      j++
    ) {
      const originalPostId = faker.helpers.arrayElement(allPostsIds);
      const reply = createPost();
      let replyMediaStr = '';
      for (let k = 0; k < faker.number.int({ min: 0, max: 3 }); k++) {
        const replyMedia = createPostMedia(reply.id, user.id);
        replyMediaStr += ` CREATE (r) -[:HAS_MEDIA]-> (rm${k}:POST_MEDIA {${createPostMediaPropertiesString(replyMedia)}}) `;
      }
      allPostsIds.push(reply.id);
      await session.run(
        `MATCH (u:USER {id: $userId}), (p:POST {id: $originalPostId})
            CREATE (r:POST {${createPostPropertiesString(reply)}})
            CREATE (u)-[:POSTED]->(r)
            CREATE (r)-[:REPLY_TO]->(p)
            ${replyMediaStr}
            RETURN r`,
        { userId: user.id, originalPostId }
      );
    }

    const likedSet = new Set();
    const bookmarkedSet = new Set();
    for (
      let j = 0;
      j < faker.number.int({ min: 0, max: allPostsIds.length });
      j++
    ) {
      const postId = faker.helpers.arrayElement(allPostsIds);
      if (!bookmarkedSet.has(`${user.id}-${postId}`)) {
        bookmarkedSet.add(`${user.id}-${postId}`);
        await session.run(
          `MATCH (u:USER {id: $userId}), (p:POST {id: $postId})
        CREATE (u)-[:BOOKMARKED]->(p)
        RETURN u, p`,
          { userId: user.id, postId }
        );
      }
      if (!likedSet.has(`${user.id}-${postId}`)) {
        likedSet.add(`${user.id}-${postId}`);
        await session.run(
          `MATCH (u:USER {id: $userId}), (p:POST {id: $postId})
        CREATE (u)-[:LIKED]->(p)
        RETURN u, p`,
          { userId: user.id, postId }
        );
      }
    }
  }
};

seed().then(() => {
  session.close();
  driver.close();
  process.exit(0);
});
