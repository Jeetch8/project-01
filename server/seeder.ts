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
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createReadStream } from 'fs';
import os from 'os';
import * as path from 'path';
import * as csv from 'csv-parser';
import * as fs from 'fs';

const driver = Driver.driver(
  'bolt://localhost:7687',
  Driver.auth.basic(
    process.env.NEO4J_DB_USERNAME,
    process.env.NEO4J_DB_PASSWORD
  )
);
const genAIClient = new GoogleGenerativeAI(
  process.env.GOOGLE_GENERATIVE_AI_API_KEY
);
const model = genAIClient.getGenerativeModel({ model: 'text-embedding-004' });

const session = driver.session();

const createUser = async (
  embedding: number[]
): Promise<User & { embedding: number[] }> => {
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
    embedding,
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

const createPost = (index: number): Post & { embedding: number[] } => {
  const tweet = sampleTweets[index].Text;
  const embedding = sampleTweetsEmbedding[index];
  return {
    id: createId(),
    caption: tweet,
    likes_count: faker.number.int({ min: 0, max: 1000 }),
    created_on: faker.date.past(),
    updated_on: faker.date.recent(),
    embedding,
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

let sampleTweets = [];
let sampleTweetsEmbedding = [];
let currentTweetIndex = 0;
let sampleTwitterUsers = [];
let sampleTwitterUsersEmbedding = [];
let sampleTwitterUsersEmbeddingIndex = 0;

const seed = async () => {
  // Connect to MongoDB
  await mongoose.connect(process.env.MONGODB_URI);

  await mongoose.connection.collection('participants').deleteMany({});
  await mongoose.connection.collection('rooms').deleteMany({});
  await session.run(`MATCH (n) DETACH DELETE n;`);
  // await session.run(`DROP INDEX postembeddings IF EXISTS;`);
  // await session.run(`DROP INDEX userembeddings IF EXISTS;`);

  // await session.run(`
  //   CREATE VECTOR INDEX postembeddings
  //   FOR (n:POST) ON (n.embedding)
  //   OPTIONS {indexConfig: {
  //     \`vector.dimensions\`: 768,
  //     \`vector.similarity_function\`: 'cosine'
  //   }}
  // `);
  // await session.run(`
  //   CREATE VECTOR INDEX userembeddings
  //   FOR (n:USER) ON (n.embedding)
  //   OPTIONS {indexConfig: {
  //     \`vector.dimensions\`: 768,
  //     \`vector.similarity_function\`: 'cosine'
  //   }}
  // `);

  const userids = [];
  const followSet = new Set();
  const allPostsIds = [];
  for (let i = 0; i < 30; i++) {
    const user = await createUser(
      sampleTwitterUsersEmbedding[sampleTwitterUsersEmbeddingIndex]
    );
    const userToken = createUserToken();
    let authSessionStr = '';
    for (let j = 0; j < faker.number.int({ min: 1, max: 3 }); j++) {
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
    for (let j = 0; j < faker.number.int({ min: 1, max: 20 }); j++) {
      const post = createPost(currentTweetIndex);
      let postMediaStr = '';
      for (let k = 0; k < faker.number.int({ min: 1, max: 3 }); k++) {
        const postMedia = createPostMedia(post.id, user.id);
        postMediaStr += ` CREATE (p) -[:HAS_MEDIA]-> (pm${k}:POST_MEDIA {${createPostMediaPropertiesString(postMedia)}}) `;
        postIds.push(post.id);
        allPostsIds.push(post.id);
      }
      await session.run(
        `MATCH (u:USER {id: $userId})
        CREATE (p:POST {${createPostPropertiesString(post)}, embedding: $embedding})
        CREATE (u)-[:POSTED]->(p)
        ${postMediaStr}
         RETURN p`,
        { userId: user.id, embedding: post.embedding }
      );
      currentTweetIndex++;
    }

    // Create replies for random posts
    for (
      let j = 0;
      j < faker.number.int({ min: 0, max: allPostsIds.length });
      j++
    ) {
      const originalPostId = faker.helpers.arrayElement(allPostsIds);
      const reply = createPost(currentTweetIndex);
      let replyMediaStr = '';
      for (let k = 0; k < faker.number.int({ min: 0, max: 3 }); k++) {
        const replyMedia = createPostMedia(reply.id, user.id);
        replyMediaStr += ` CREATE (r) -[:HAS_MEDIA]-> (rm${k}:POST_MEDIA {${createPostMediaPropertiesString(replyMedia)}}) `;
      }
      allPostsIds.push(reply.id);
      await session.run(
        `MATCH (u:USER {id: $userId}), (p:POST {id: $originalPostId})
            CREATE (r:POST {${createPostPropertiesString(reply)}, embedding: $embedding})
            CREATE (u)-[:POSTED]->(r)
            CREATE (r)-[:REPLY_TO]->(p)
            ${replyMediaStr}
            RETURN r`,
        { userId: user.id, originalPostId, embedding: reply.embedding }
      );
      currentTweetIndex++;
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
    sampleTwitterUsersEmbeddingIndex++;
  }
};

try {
  createReadStream(path.join(__dirname, 'sample', 'twitter_dataset.csv'))
    .pipe(csv())
    .on('data', (data) => {
      sampleTweets.push(data);
    })
    .on('end', async () => {
      console.log('csv data pushed');
      createReadStream(
        path.join(__dirname, 'sample', 'twitter_user_scraping.csv')
      )
        .pipe(csv())
        .on('data', (data) => {
          sampleTwitterUsers.push(data);
        })
        .on('end', async () => {
          if (
            fs.existsSync(
              path.join(__dirname, 'sample', 'twitter_user_embeddings.json')
            )
          ) {
            sampleTwitterUsersEmbedding = JSON.parse(
              fs.readFileSync(
                path.join(__dirname, 'sample', 'twitter_user_embeddings.json'),
                'utf8'
              )
            );
          } else {
            const temp2 = [];
            for (let i = 0; i < 30; i++) {
              temp2.push({
                content: {
                  parts: [{ text: sampleTwitterUsers[i].Description }],
                  role: 'user',
                },
              });
            }
            await model
              .batchEmbedContents({
                requests: temp2,
              })
              .then((res) => {
                res.embeddings.forEach((embedding, index) => {
                  sampleTwitterUsersEmbedding.push(embedding.values);
                });
              });
            fs.writeFileSync(
              path.join(__dirname, 'sample', 'twitter_user_embeddings.json'),
              JSON.stringify(sampleTwitterUsersEmbedding)
            );
          }
        });

      if (
        fs.existsSync(path.join(__dirname, 'sample', 'tweet_embeddings.json'))
      ) {
        sampleTweetsEmbedding = JSON.parse(
          fs.readFileSync(
            path.join(__dirname, 'sample', 'tweet_embeddings.json'),
            'utf8'
          )
        );
      } else {
        const temp = [];
        for (let i = 0; i < 1200; i++) {
          temp.push({
            content: { parts: [{ text: sampleTweets[i].Text }], role: 'user' },
          });
        }
        for (let i = 0; i < 12; i++) {
          await model
            .batchEmbedContents({
              requests: temp.slice(i * 100, (i + 1) * 100),
            })
            .then((res) => {
              res.embeddings.forEach((embedding, index) => {
                sampleTweetsEmbedding.push(embedding.values);
              });
            });
        }
        fs.writeFileSync(
          path.join(__dirname, 'sample', 'tweet_embeddings.json'),
          JSON.stringify(sampleTweetsEmbedding)
        );
      }
      console.log('embedding done');
      await seed();
      console.log('seed done');
      session.close();
      driver.close();
      process.exit(0);
    });
} catch (error) {
  console.log(error);
}
