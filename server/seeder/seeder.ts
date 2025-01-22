// TODO: clear memory of unused variables (error - heap memory leak)

import Driver from 'neo4j-driver';
import mongoose from 'mongoose';
import { fa, faker } from '@faker-js/faker';
import {
  User,
  UserToken,
  AuthProvider,
  Gender,
  createUserPropertiesString,
  createUserTokenPropertiesString,
  createAuthSessionPropertiesString,
  AuthSession,
} from '../src/user/user.entity';
import {
  Post,
  PostMedia,
  MediaType,
  createPostPropertiesString,
  createPostMediaPropertiesString,
} from '../src/post/entities/post.entity';
import { createId } from '@paralleldrive/cuid2';
import { UAParser } from 'ua-parser-js';
import { hashPassword } from '../src/utils/helpers';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createReadStream } from 'fs';
import os from 'os';
import * as path from 'path';
import * as csv from 'csv-parser';
import * as fs from 'fs';
import {
  Community,
  createCommunityPropertiesString,
} from '@/community/entities/community.entity';
import {
  TSampleTweet,
  TSampleUser,
  TUnsplashData,
  TUnsplashResponse,
} from './types';
import { join } from 'path';

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

const randomInt = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const fetchImagesFromUnsplash = async (page_no: number = 1) => {
  try {
    const res = await fetch(
      `https://api.unsplash.com/search/photos?page=${page_no}&per_page=30&query=nature&client_id=${process.env.UNSPLASH_CLIENT_ID}`
    );
    const jsondata: TUnsplashResponse = await res.json();
    return jsondata;
  } catch (error) {
    return null;
  }
};

const addRandomImagesToFile = async () => {
  const pageCount = 50;
  const pathTofile = join(__dirname, 'seed_cached_data', 'unsplash-data.json');

  const existingData: TUnsplashResponse = JSON.parse(
    fs.readFileSync(pathTofile, 'utf8')
  );
  let allResults = existingData.results || [];
  const startingPageNumber = Math.ceil(existingData.results.length / 30);
  for (
    let page = startingPageNumber;
    page <= pageCount + startingPageNumber;
    page++
  ) {
    const data = await fetchImagesFromUnsplash(page);
    if (data && data.results) {
      allResults = [...allResults, ...data.results];
    }
    // Add delay to respect API rate limits
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  const updatedData = { ...existingData, results: allResults };
  fs.writeFileSync(pathTofile, JSON.stringify(updatedData, null, 2));
};

const getUnsplashImages = async (): Promise<TUnsplashResponse['results']> => {
  const pathTofile = join(__dirname, 'seed_cached_data', 'unsplash-data.json');
  const fileData = await fs.readFileSync(pathTofile, {
    encoding: 'utf8',
  });
  if (fileData) {
    const jsonFileData: TUnsplashResponse = JSON.parse(fileData);
    return jsonFileData.results;
  } else {
    await addRandomImagesToFile();
    // if (!data) throw Error('Error fetching data from Unsplash');
    // fs.writeFileSync(pathTofile, JSON.stringify(data, null, 2));
    const res = await getUnsplashImages();
    return res;
  }
};

const createUser = async (
  providedUserInfo?: Partial<User>
): Promise<User & { embedding: number[] }> => {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();

  return {
    id: createId(),
    signup_date:
      providedUserInfo?.signup_date || faker.date.past().toISOString(),
    email: providedUserInfo?.email || faker.internet.email().toLowerCase(),
    password:
      providedUserInfo?.password || (await hashPassword('PAssword!@12')),
    auth_provider:
      providedUserInfo?.auth_provider ||
      faker.helpers.arrayElement(Object.values(AuthProvider)),
    email_verified:
      providedUserInfo?.email_verified || faker.datatype.boolean(),
    first_name: providedUserInfo?.first_name || firstName,
    last_name: providedUserInfo?.last_name || lastName,
    full_name: providedUserInfo?.full_name || `${firstName} ${lastName}`,
    username: providedUserInfo?.username || faker.internet.username(),
    profile_img: providedUserInfo?.profile_img || faker.image.avatarGitHub(),
    gender:
      providedUserInfo?.gender ||
      faker.helpers.arrayElement(Object.values(Gender)),
    date_of_birth:
      providedUserInfo?.date_of_birth || faker.date.birthdate().toISOString(),
    banner_img: providedUserInfo?.banner_img || faker.image.url(),
    bio: providedUserInfo?.bio || faker.lorem.sentence(),
    location: providedUserInfo?.location || faker.location.city(),
    followers_count: 0,
    following_count: 0,
    embedding: [],
  };
};

const createCommunity = (): Community => {
  return {
    id: createId(),
    title: faker.lorem.sentence(),
    description: faker.lorem.paragraph(),
    image: faker.image.url(),
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
    rules: faker.lorem.paragraph(),
    membership_type: faker.helpers.arrayElement([
      'ADMIN',
      'MODERATOR',
      'MEMBER',
    ]),
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

const createPost = (
  index: number,
  numberOfReplies: number,
  numberOfLikes: number
): Post & { embedding: number[] } => {
  const tweet = sampleTweets[index].Text;
  // const embedding = sampleTweetsEmbedding[index];
  return {
    id: createId(),
    caption: tweet,
    likes_count: numberOfLikes,
    comments_count: numberOfReplies,
    created_on: faker.date.past(),
    updated_on: faker.date.recent(),
    embedding: [],
  };
};

const createPostMedia = (
  postId: string,
  creatorId: string,
  imageUrl: string
): PostMedia => {
  return {
    id: createId(),
    post_id: postId,
    media_type: faker.helpers.arrayElement(Object.values(MediaType)),
    tags: faker.lorem.words(3),
    alt: faker.lorem.sentence(),
    original_media_url: imageUrl,
    modified_media_url: imageUrl,
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

let sampleTweets: TSampleTweet[] = [];
// let sampleTweetsEmbedding: number[][] = [];
let currentTweetIndex = 0;
let sampleTwitterUsers: TSampleUser[] = [];
// let sampleTwitterUsersEmbedding = [];
let sampleTwitterUsersEmbeddingIndex = 0;
let imageIndex = 0;

const getRandomImage = (data: TUnsplashResponse['results']) => {
  if (imageIndex >= data.length) imageIndex = 0;
  imageIndex++;
  return data[imageIndex].urls.regular;
};
const getSampleTweetIndex = () => {
  if (currentTweetIndex >= sampleTweets.length) currentTweetIndex = 0;
  currentTweetIndex++;
  return currentTweetIndex;
};

const seed = async () => {
  // Connect to MongoDB
  await mongoose.connect(process.env.MONGO_DB_URL);

  await mongoose.connection.collection('participants').deleteMany({});
  await mongoose.connection.collection('rooms').deleteMany({});
  await session.run(`MATCH (n) DETACH DELETE n;`);
  await session.run(`DROP INDEX postembeddings IF EXISTS;`);
  await session.run(`DROP INDEX userembeddings IF EXISTS;`);
  await session.run(`DROP INDEX communityembeddings IF EXISTS`);
  console.log('Databases cleared');

  // await session.run(`
  //   CREATE VECTOR INDEX communityembeddings IF NOT EXISTS
  //   FOR (n:POST) ON (n.embedding)
  //   OPTIONS {indexConfig: {
  //     \`vector.dimensions\`: 768,
  //     \`vector.similarity_function\`: 'cosine'
  //   }}
  // `);
  // await session.run(`
  //   CREATE VECTOR INDEX postembeddings IF NOT EXISTS
  //   FOR (n:POST) ON (n.embedding)
  //   OPTIONS {indexConfig: {
  //     \`vector.dimensions\`: 768,
  //     \`vector.similarity_function\`: 'cosine'
  //   }}
  // `);
  // await session.run(`
  //   CREATE VECTOR INDEX userembeddings IF NOT EXISTS
  //   FOR (n:USER) ON (n.embedding)
  //   OPTIONS {indexConfig: {
  //     \`vector.dimensions\`: 768,
  //     \`vector.similarity_function\`: 'cosine'
  //   }}
  // `);
  // console.log('Indexes created');

  const imagesArr = await getUnsplashImages();
  const userids: string[] = [];
  const followSet = new Set();
  const allPostsIds = [];

  const generateLikesForPost = async (
    postId: string,
    userIds: string[],
    numberOfLikes: number
  ) => {
    const likers = faker.helpers.arrayElements(userIds, numberOfLikes);

    for (const userId of likers) {
      await session.run(
        `MATCH (u:USER {id: $userId}), (p:POST {id: $postId})
          CREATE (u)-[:LIKED]->(p)
          RETURN u, p`,
        { userId, postId }
      );
    }
  };
  const queryCreateFullPosts = async ({
    postCreatorId,
    userIdsGroup,
  }: {
    postCreatorId: string;
    userIdsGroup: string[];
  }) => {
    const numberOfReplies = faker.number.int({ min: 2, max: 10 });
    const numberOfLikes = faker.number.int({
      min: 30,
      max: userIdsGroup.length,
    });
    const post = createPost(
      getSampleTweetIndex(),
      numberOfReplies,
      numberOfLikes
    );
    let postMediaStr = '';
    for (let k = 0; k < faker.number.int({ min: 1, max: 3 }); k++) {
      const postMedia = createPostMedia(
        post.id,
        postCreatorId,
        getRandomImage(imagesArr)
      );
      postMediaStr += ` CREATE (p) -[:HAS_MEDIA]-> (pm${k}:POST_MEDIA {${createPostMediaPropertiesString(postMedia)}}) `;
    }
    const postRes = await session.run(
      `MATCH (u:USER {id: $userId})
        CREATE (p:POST {${createPostPropertiesString(post)}, embedding: $embedding})
        CREATE (u)-[:POSTED]->(p)
        ${postMediaStr}
        RETURN p`,
      { userId: postCreatorId, embedding: post.embedding }
    );
    const createdPost = postRes.records[0].get('p').properties;
    allPostsIds.push(createdPost.id);

    // Generate likes for post
    await generateLikesForPost(createdPost.id, userIdsGroup, numberOfLikes);

    // Creating replies for post
    for (let k = 0; k < numberOfReplies; k++) {
      const numberOfLikes = faker.number.int({
        min: 30,
        max: userIdsGroup.length,
      });

      const reply = createPost(getSampleTweetIndex(), 0, numberOfLikes);
      const replyCreatorId = faker.helpers.arrayElement(userIdsGroup);
      let replyMediaStr = '';
      const toCreateMedia = faker.datatype.boolean();
      if (toCreateMedia) {
        for (let k = 0; k < faker.number.int({ min: 0, max: 3 }); k++) {
          const replyMedia = createPostMedia(
            reply.id,
            replyCreatorId,
            getRandomImage(imagesArr)
          );
          replyMediaStr += ` CREATE (r) -[:HAS_MEDIA]-> (rm${k}:POST_MEDIA {${createPostMediaPropertiesString(replyMedia)}}) `;
        }
      }
      allPostsIds.push(reply.id);
      const replyRes = await session.run(
        `MATCH (u:USER {id: $userId}), (p:POST {id: $originalPostId})
        CREATE (r:POST {${createPostPropertiesString(reply)}, embedding: $embedding})
        CREATE (u)-[:POSTED]->(r)
        CREATE (r)-[:REPLY_TO]->(p)
        ${replyMediaStr}
        RETURN r`,
        {
          userId: replyCreatorId,
          originalPostId: createdPost.id,
          embedding: reply.embedding,
        }
      );
      const createdReply = replyRes.records[0].get('r').properties;
      await generateLikesForPost(createdReply.id, userids, numberOfLikes);
    }
    return createdPost.id;
  };

  for (let i = 0; i < 100; i++) {
    const sampleUser = sampleTwitterUsers[i];
    let user = await createUser({
      bio: sampleUser.Description,
    });
    if (i === 29) {
      user = await createUser({
        email: 'demo@demo.com',
        full_name: 'Demo User',
        username: 'demo',
        last_name: 'User',
        first_name: 'Demo',
        bio: sampleUser.Description,
      });
    }
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
    const createdUser = userResult.records[0].get('u').properties;
    userids.push(createdUser.id);

    // Create participant in MongoDB
    const participantData = createParticipant(user);
    await mongoose.connection
      .collection('participants')
      .insertOne(participantData);

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
      // if (!likedSet.has(`${user.id}-${postId}`)) {
      //   likedSet.add(`${user.id}-${postId}`);
      //   await session.run(
      //     `MATCH (u:USER {id: $userId}), (p:POST {id: $postId})
      //   CREATE (u)-[:LIKED]->(p)
      //   RETURN u, p`,
      //     { userId: user.id, postId }
      //   );
      // }
    }
    sampleTwitterUsersEmbeddingIndex++;
  }
  for (let i = 0; i < userids.length; i++) {
    for (let j = 0; j < faker.number.int({ min: 30, max: 100 }); j++) {
      await queryCreateFullPosts({
        postCreatorId: userids[i],
        userIdsGroup: userids,
      });
    }
  }

  const communitiesArr = [];
  for (let i = 0; i < userids.length; i++) {
    const community = createCommunity();
    const members = faker.helpers.arrayElements(userids, {
      min: 10,
      max: userids.length,
    });
    const communityAdmin = userids[i];
    const moderators = faker.helpers.arrayElements(userids, {
      min: 2,
      max: 5,
    });
    const communityPostIds: string[] = [];
    const pinnedPost = faker.helpers.arrayElement(allPostsIds);
    for (let j = 0; j < 10; j++) {
      const resId = await queryCreateFullPosts({
        postCreatorId: communityAdmin,
        userIdsGroup: members,
      });
      communityPostIds.push(resId);
    }

    const membersStr = members
      .map(
        (member, ind) =>
          `CREATE (c) -[ab${ind}:MEMBER {role: 'MEMBER', joined_at: '${faker.date.past().toISOString()}'}]-> (:USER {id: '${member}'})`
      )
      .join('\n');
    const postsStr = communityPostIds
      .map((post) => `CREATE (c) -[:COMMUNITY_POST]-> (:POST {id: '${post}'})`)
      .join('\n');
    const moderatorsStr = moderators
      .map(
        (moderator, ind) =>
          `CREATE  (c) -[gd${ind}:MEMBER {role: 'MODERATOR', joined_at: '${faker.date.past().toISOString()}'}]-> (:USER {id: '${moderator}'})`
      )
      .join('\n');
    const communityResult = await session.run(
      `CREATE (c:COMMUNITY {${createCommunityPropertiesString(community)}})        
      ${membersStr}
      ${postsStr}
      CREATE (c) -[:ADMIN]-> (a:USER {id: '${communityAdmin}'})
      ${moderatorsStr}
      CREATE (c) -[:PINNED_POST]-> (p:POST {id: '${pinnedPost}'})
      RETURN c`
    );
    communitiesArr.push(communityResult.records[0].get('c').properties);
  }
  console.log('✓ Communities created');
  // TODO: Follow more users
  for (let i = 0; i < userids.length; i++) {
    const user = userids[i];
    const followCount = faker.number.int({ min: 0, max: userids.length });
    for (let j = 0; j < followCount; j++) {
      const followUser = faker.helpers.arrayElement(userids);
      if (followUser !== user) {
        followSet.add(`${user}-${followUser}`);
        await session.run(
          `MATCH (u:USER {id: $userId}), (f:USER {id: $followId})
          CREATE (u)-[:FOLLOWS]->(f)
          UPDATE u SET u.following_count = u.following_count + 1
          UPDATE f SET f.followers_count = f.followers_count + 1
          RETURN u, f`,
          { userId: user, followId: followUser }
        );
      }
    }
  }
  console.log('✓ Users followed');

  // Join multiple communites
  // for (let i = 0; i < userids.length; i++) {
  //   const user = userids[i];
  //   const joinCount = faker.number.int({ min: 0, max: communitiesArr.length });
  //   for (let j = 0; j < joinCount; j++) {
  //     const community = faker.helpers.arrayElement(communitiesArr);
  //     await session.run(
  //       `MATCH (u:USER {id: $userId}), (c:COMMUNITY {id: $communityId})
  //       CREATE (u)-[:JOINED]->(c)
  //       RETURN u, c`,
  //       { userId: user, communityId: community.id }
  //     );
  //   }
  // }
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
        });
      // .on('end', async () => {
      //   // Embedding for users
      //   if (
      //     fs.existsSync(
      //       path.join(__dirname, 'sample', 'twitter_user_embeddings.json')
      //     )
      //   ) {
      //     sampleTwitterUsersEmbedding = JSON.parse(
      //       fs.readFileSync(
      //         path.join(__dirname, 'sample', 'twitter_user_embeddings.json'),
      //         'utf8'
      //       )
      //     );
      //   } else {
      //     const temp2 = [];
      //     for (let i = 0; i < 100; i++) {
      //       temp2.push({
      //         content: {
      //           parts: [{ text: sampleTwitterUsers[i].Description }],
      //           role: 'user',
      //         },
      //       });
      //     }
      //     await model
      //       .batchEmbedContents({
      //         requests: temp2,
      //       })
      //       .then((res) => {
      //         res.embeddings.forEach((embedding, index) => {
      //           sampleTwitterUsersEmbedding.push(embedding.values);
      //         });
      //       });
      //     fs.writeFileSync(
      //       path.join(__dirname, 'sample', 'twitter_user_embeddings.json'),
      //       JSON.stringify(sampleTwitterUsersEmbedding)
      //     );
      //   }
      // });

      // Embedding for tweets
      // if (
      //   fs.existsSync(path.join(__dirname, 'sample', 'tweet_embeddings.json'))
      // ) {
      //   sampleTweetsEmbedding = JSON.parse(
      //     fs.readFileSync(
      //       path.join(__dirname, 'sample', 'tweet_embeddings.json'),
      //       'utf8'
      //     )
      //   );
      // } else {
      //   const temp = [];
      //   for (let i = 0; i < 10000; i++) {
      //     temp.push({
      //       content: { parts: [{ text: sampleTweets[i].Text }], role: 'user' },
      //     });
      //   }
      //   for (let i = 0; i < 100; i++) {
      //     await model
      //       .batchEmbedContents({
      //         requests: temp.slice(i * 100, (i + 1) * 100),
      //       })
      //       .then((res) => {
      //         res.embeddings.forEach((embedding, index) => {
      //           sampleTweetsEmbedding.push(embedding.values);
      //         });
      //       });
      //   }
      //   fs.writeFileSync(
      //     path.join(__dirname, 'sample', 'tweet_embeddings.json'),
      //     JSON.stringify(sampleTweetsEmbedding)
      //   );
      // }
      console.log('embedding done');
      await seed();
      console.log((await getUnsplashImages()).length);
      console.log('seed done');
      session.close();
      driver.close();
      process.exit(0);
    });
} catch (error) {
  console.log(error);
}
