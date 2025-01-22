import { Inject, Injectable } from '@nestjs/common';
import { Neo4jService } from 'nest-neo4j/dist';
import { ChangePasswordDto, UpdateAccountInfoDto } from './user.dto';
import { createId } from '@paralleldrive/cuid2';
import {
  UserCon,
  User,
  UserToken,
  UserTokenCon,
  createUserPropertiesString,
  createUserTokenPropertiesString,
  AuthSession,
  AuthSessionCon,
} from './user.entity';
import {
  Post,
  PostCon,
  PostMedia,
  PostMediaCon,
} from '@/post/entities/post.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Participant, ParticipantDocument } from '@/schemas/Participant.schema';
import { hashPassword } from '@/utils/helpers';
import * as dayjs from 'dayjs';
import * as relativeTime from 'dayjs/plugin/relativeTime';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { Redis } from 'ioredis';
dayjs.extend(relativeTime);

@Injectable()
export class UserService {
  constructor(
    private neo4jService: Neo4jService,
    @InjectRedis() private readonly redis: Redis,
    @InjectModel(Participant.name) private participantModel: Model<Participant>
  ) {}

  async create_user(
    Props: Omit<
      User,
      | 'full_name'
      | 'id'
      | 'signup_date'
      | 'username'
      | 'following_count'
      | 'followers_count'
    >
  ) {
    const username = await this.generate_unique_username(
      Props.first_name,
      Props.last_name
    );
    return await this.neo4jService
      .write(
        `CREATE (user:USER {${createUserPropertiesString({
          ...Props,
          id: createId(),
          full_name: Props.first_name + ' ' + Props.last_name,
          email_verified: false,
          signup_date: new Date().toISOString(),
          username,
          followers_count: 0,
          following_count: 0,
        })}})
      RETURN user`
      )
      .then((res) => {
        return new UserCon(res.records[0].get('user')).getObject();
      });
  }

  async create_user_and_tokens(
    Props: Omit<
      User,
      'id' | 'signup_date' | 'username' | 'followers_count' | 'following_count'
    > &
      Partial<Omit<UserToken, 'id'>>
  ) {
    const username = await this.generate_unique_username(
      Props.first_name,
      Props.last_name
    );
    const userProps = {
      ...Props,
      id: createId(),
      full_name: Props.first_name + ' ' + Props.last_name,
      email_verified: false,
      signup_date: new Date().toISOString(),
      username,
      followers_count: 0,
      following_count: 0,
    };
    const userTokenProps = {
      id: createId(),
      email_verification_token: Props.email_verification_token,
      email_verification_expiry: Props.email_verification_expiry,
      forgot_password_token: Props.forgot_password_token,
      forgot_password_token_expiry: Props.forgot_password_token_expiry,
    };
    const result = await this.neo4jService.write(
      `
      CREATE (user:USER {${createUserPropertiesString(userProps)}})
      CREATE (token:USER_TOKENS {${createUserTokenPropertiesString(userTokenProps)}})
      CREATE (user)-[:TOKENS]->(token)
      RETURN user, token
      `
    );
    return {
      user: new UserCon(result.records[0].get('user')).getObject(),
      userTokens: new UserTokenCon(result.records[0].get('token')).getObject(),
    };
  }

  async create_user_token(
    {
      email_verification_expiry,
      email_verification_token,
    }: Omit<UserToken, 'id'>,
    { email, userId }: { email?: string; userId?: string }
  ) {
    const searchWith = userId ? 'id: $userId' : 'email: $email';
    const userTokenStr = await createUserTokenPropertiesString({
      email_verification_expiry,
      email_verification_token,
    });
    const res = await this.neo4jService.write(
      `MATCH (user:USER {${searchWith}}) 
      CREATE (auth:USER_TOKENS {${userTokenStr}}) <-[:TOKENS]- (user)
      RETURN auth`,
      {
        email_expiry: email_verification_expiry,
        email_token: email_verification_token,
        email,
        userId,
      }
    );
    return new UserTokenCon(res.records[0].get('auth')).getObject();
  }

  async getUserAndToken({
    email,
    userId,
  }: {
    email?: string;
    userId?: string;
  }) {
    const searchWith = userId ? 'id: $userId' : 'email: $email';

    const result = await this.neo4jService.read(
      `MATCH (user:USER {${searchWith}})-[:TOKENS]->(token:USER_TOKENS)
       RETURN user, token`,
      { email, userId }
    );

    if (!result.records.length)
      return { user: undefined, userTokens: undefined };

    return {
      user: new UserCon(result.records[0].get('user')).getObject(),
      userTokens: new UserTokenCon(result.records[0].get('token')).getObject(),
    };
  }

  async getUser(
    {
      email,
      userId,
      username,
    }: {
      email?: string;
      userId?: string;
      username?: string;
    },
    reqUserUserId?: string
  ): Promise<{
    doesFollow: boolean;
    user: User | undefined;
  }> {
    let searchWith: string | undefined;
    if (userId) searchWith = 'id: $userId';
    else if (email) searchWith = 'email: $email';
    else if (username) searchWith = 'username: $username';
    else return { user: undefined, doesFollow: false };
    const result = await this.neo4jService.read(
      `MATCH (user:USER {${searchWith}})
      ${reqUserUserId ? `MATCH (followE:USER { id: '${reqUserUserId}' })` : ' '}
      RETURN user, followE ${reqUserUserId ? ', exists((followE)-[:FOLLOWS]->(user)) AS doesFollow' : ' '}`,
      {
        userId,
        email: email?.toLocaleLowerCase(),
        username,
      }
    );
    if (!result.records.length) return { doesFollow: false, user: undefined };
    return {
      doesFollow: result.records[0].get('doesFollow'),
      user: new UserCon(result.records[0].get('user')).getObject(),
    };
  }

  async updateUser(userId: string, user: Partial<User>) {
    const result = await this.neo4jService.write(
      `MATCH (user:USER {id: $userId})
     SET user.email_verified = true
     RETURN user`,
      { userId: userId }
    );
    return new UserCon(result.records[0].get('user'));
  }

  async is_username_unique(username: string) {
    const check_username = await this.neo4jService.read(
      `MATCH (user:USER {username: $username})
      RETURN user`,
      { username }
    );
    return check_username.records.length ? false : true;
  }

  async generate_unique_username(first_name: string, last_name: string) {
    let temp_username =
      first_name + last_name + Math.random().toString(36).substring(2, 7);
    while (!this.is_username_unique(temp_username)) {
      const random_number =
        first_name + last_name + Math.random().toString(36).substring(2, 7);
      temp_username = temp_username + random_number;
    }
    return temp_username;
  }

  async updateUserProfile(
    userId: string,
    user: Pick<
      User,
      'full_name' | 'username' | 'profile_img' | 'bio' | 'banner_img'
    >
  ) {
    const result = await this.neo4jService.write(
      `MATCH (user:USER {id: $userId})
      SET user.full_name = $full_name, user.username = $username, user.profile_img = $profile_img, user.bio = $bio, user.banner_img = $banner_img
      RETURN user`,
      { userId, ...user }
    );
    return new UserCon(result.records[0].get('user')).getObject();
  }

  async searchUsersByFullName(
    query: string,
    page: number = 0,
    limit: number = 25
  ): Promise<User[]> {
    const skip = page * limit;
    const result = await this.neo4jService.read(
      `MATCH (user:USER)
      WHERE toLower(user.full_name) CONTAINS toLower($query)
      RETURN user
      ORDER BY user.username ASC
      SKIP toInteger($skip)
      LIMIT toInteger($limit)`,
      { query, skip, limit }
    );

    return result.records.map((record) =>
      new UserCon(record.get('user')).getObject()
    );
  }

  async updateAccountInfo(userId: string, user: UpdateAccountInfoDto) {
    const result = await this.neo4jService.write(
      `MATCH (user:USER {id: $userId})
      SET user.username = $username, user.email = $email, user.gender = $gender, user.date_of_birth = $date_of_birth, user.location = $location
      RETURN user`,
      { userId, ...user }
    );
    return new UserCon(result.records[0].get('user')).getObject();
  }

  async changePassword(userId: string, password: ChangePasswordDto) {
    const hashedPass = await hashPassword(password.new_password);
    const result = await this.neo4jService.write(
      `MATCH (user:USER {id: $userId})
      SET user.password = $password
      RETURN user`,
      { userId, password: hashedPass }
    );
    return new UserCon(result.records[0].get('user')).getObject();
  }

  async getUserPosts(
    username: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{ posts: Post[]; hasMore: boolean; nextPage: number }> {
    const skip = (page - 1) * limit;
    const result = await this.neo4jService.read(
      `MATCH (user:USER {username: $username})-[:POSTED]->(post:POST)
       OPTIONAL MATCH (post)-[:HAS_MEDIA]->(media:POST_MEDIA)
       WITH user, post, collect(media) as post_media
       ORDER BY post.created_on DESC
       SKIP toInteger($skip)
       LIMIT toInteger($limit)
       RETURN post, post_media, user, exists((user)-[:LIKED]->(post)) AS isPostLiked, exists((user)-[:BOOKMARKED]->(post)) AS isBookmarked, exists((user)-[:POSTED]->(:POST)-[:REPLY_TO]->(post)) AS hasCommented`,
      { username, skip, limit }
    );
    const posts = result.records.map((record) => {
      const post = new PostCon(record.get('post')).getObject();
      const { password, ...restUser } = new UserCon(
        record.get('user')
      ).getObject();
      const timeAgo = dayjs(post.created_on).fromNow();
      const isPostLiked = record.get('isPostLiked');
      const isBookmarked = record.get('isBookmarked');
      const hasCommented = record.get('hasCommented');
      const media = record
        .get('post_media')
        .map((m) => new PostMediaCon(m).getObject());
      return {
        ...post,
        liked: isPostLiked,
        bookmarked: isBookmarked,
        commented: hasCommented,
        timeAgo,
        creator: restUser,
        media: media,
      };
    });

    const hasMore = result.records.length > limit;
    const nextPage = hasMore ? page + 1 : null;

    return { posts, hasMore, nextPage };
  }

  async getLikedPosts(
    username: string,
    page: number = 0,
    limit: number = 10
  ): Promise<{ posts: Post[]; hasMore: boolean; nextPage: number }> {
    const skip = page * limit;
    const result = await this.neo4jService.read(
      `MATCH (user:USER {username: $username})-[:LIKED]->(post:POST)
       OPTIONAL MATCH (post)-[:HAS_MEDIA]->(media:POST_MEDIA)
       WITH  user, post, collect(media) as post_media
       ORDER BY post.created_on DESC
       SKIP ${skip}
       LIMIT ${limit + 1}
       RETURN post, post_media, user, exists((user)-[:LIKED]->(post)) AS isPostLiked, exists((user)-[:BOOKMARKED]->(post)) AS isBookmarked, exists((user)-[:POSTED]->(:POST)-[:REPLY_TO]->(post)) AS hasCommented`,
      { username }
    );

    const posts = result.records.map((record) => {
      const post = new PostCon(record.get('post')).getObject();
      const { password, ...restUser } = new UserCon(
        record.get('user')
      ).getObject();
      const timeAgo = dayjs(post.created_on).fromNow();
      const isPostLiked = record.get('isPostLiked');
      const isBookmarked = record.get('isBookmarked');
      const hasCommented = record.get('hasCommented');
      const media = record
        .get('post_media')
        .map((m) => new PostMediaCon(m).getObject());
      return {
        ...post,
        commented: hasCommented,
        bookmarked: isBookmarked,
        liked: isPostLiked,
        timeAgo,
        creator: restUser,
        media: media,
      };
    });

    const hasMore = result.records.length > limit;
    const nextPage = hasMore ? page + 1 : null;

    return { posts, hasMore, nextPage };
  }

  async getUserCreatedPostMedia(
    username: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{
    posts_media: (PostMedia & { post: Post & { timeAgo: string } })[];
    hasMore: boolean;
    nextPage: number;
  }> {
    const skip = (page - 1) * limit;
    const result = await this.neo4jService.read(
      `MATCH (user:USER {username: $username})-[:LIKED]->(post:POST)
       OPTIONAL MATCH (post)-[:HAS_MEDIA]->(media:POST_MEDIA)
       WITH   post, collect(media) as post_media
       ORDER BY post.created_on DESC
       SKIP toInteger($skip)
       LIMIT toInteger($limit)
       RETURN post, post_media`,
      { username, limit, skip }
    );
    const postMediaArr: (PostMedia & { post: Post & { timeAgo: string } })[] =
      [];
    const posts = result.records.forEach((record) => {
      const post = new PostCon(record.get('post')).getObject();
      const timeAgo = dayjs(post.created_on).fromNow();
      record.get('post_media').forEach((m) => {
        postMediaArr.push({
          ...new PostMediaCon(m).getObject(),
          post: { ...post, timeAgo },
        });
      });
    });

    const hasMore = result.records.length > limit;
    const nextPage = hasMore ? page + 1 : null;

    return { posts_media: postMediaArr, hasMore, nextPage };
  }

  async deactivateAccount(userId: string) {
    const result = await this.neo4jService.write(
      `MATCH (user:USER {id: $userId})
      SET user.is_active = false
      RETURN user`,
      { userId }
    );
    await this.participantModel.deleteOne({ userid: userId });
    return result.records.length > 0;
  }

  async getBookmarkedPosts(
    userId: string,
    page: number = 0
  ): Promise<{ bookmarks: Post[]; hasMore: boolean; nextPage: number }> {
    const limit = 10;
    const skip = page * limit;
    const result = await this.neo4jService.read(
      `MATCH (user:USER {id: $userId})-[:BOOKMARKED]->(post:POST)
       OPTIONAL MATCH (post)-[:HAS_MEDIA]->(media:POST_MEDIA)
       WITH user, post, collect(media) as post_media
       ORDER BY post.created_on DESC
       SKIP ${skip}
       LIMIT ${limit + 1}
       RETURN post, post_media, user`,
      { userId }
    );

    const posts = result.records.map((record) => {
      const post = new PostCon(record.get('post')).getObject();
      const { password, ...restUser } = new UserCon(
        record.get('user')
      ).getObject();
      const timeAgo = dayjs(post.created_on).fromNow();
      const media = record
        .get('post_media')
        .map((m) => new PostMediaCon(m).getObject());
      return { ...post, timeAgo, creator: restUser, post_media: media };
    });

    const hasMore = result.records.length > limit;
    const nextPage = hasMore ? page + 1 : null;

    return { bookmarks: posts, hasMore, nextPage };
  }

  async getUserHomeFeed(
    userId: string | null,
    page: number = 0,
    limit: number = 25
  ): Promise<{ posts: Post[]; hasMore: boolean; nextPage: number }> {
    const skip = page * limit;

    if (!userId) {
      const result = await this.neo4jService.read(
        `MATCH (post:POST)
         WITH post
         ORDER BY post.likes_count DESC, post.created_at DESC
         WITH collect(post)[toInteger($skip)..toInteger(toInteger($skip) + toInteger($limit))] AS paginatedPosts
         UNWIND paginatedPosts AS paginatedPost
         OPTIONAL MATCH (paginatedPost)-[:HAS_MEDIA]->(media:POST_MEDIA)
         OPTIONAL MATCH (paginatedPost)<-[:POSTED]-(creator:USER)
         RETURN paginatedPost, collect(DISTINCT media) as post_media, creator
         LIMIT toInteger($limit)`,
        { skip, limit: limit + 1 }
      );

      return this.processQueryResults(result, limit, page);
    }

    const result = await this.neo4jService.read(
      `MATCH (user:USER {id: $userId})
       MATCH (post:POST)
       WHERE (
         EXISTS((user)-[:FOLLOWS]->(:USER)-[:POSTED]->(post))
         OR
         EXISTS((user)-[:FOLLOWS]->(:USER)-[:FOLLOWS]->(:USER)-[:POSTED]->(post))
       )
       AND NOT (user)-[:SEEN {seen_at: $seen_at}]->(post)
       WITH post, user
       ORDER BY post.created_at DESC
       WITH collect(post)[toInteger($skip)..toInteger(toInteger($skip) + toInteger($limit))] AS paginatedPosts
       UNWIND paginatedPosts AS paginatedPost
       OPTIONAL MATCH (paginatedPost)-[:HAS_MEDIA]->(media:POST_MEDIA)
       OPTIONAL MATCH (paginatedPost)<-[:POSTED]-(creator:USER)
       RETURN paginatedPost, collect(DISTINCT media) as post_media, creator
       LIMIT toInteger($limit)`,
      { userId, skip, seen_at: new Date().toISOString(), limit: limit + 1 }
    );

    await this.neo4jService.write(
      `MATCH (user:USER {id: $userId})
       UNWIND $postIds as postId
       MATCH (post:POST {id: postId})
       WHERE NOT (user)-[:SEEN]->(post)
       CREATE (user)-[:SEEN {seen_at: $seen_at}]->(post)`,
      {
        userId,
        postIds: result.records.map(
          (record) => new PostCon(record.get('paginatedPost')).getObject().id
        ),
        seen_at: new Date().toISOString(),
      }
    );

    return this.processQueryResults(result, limit, page);
  }

  private processQueryResults(result: any, limit: number, page: number) {
    const posts = result.records.slice(0, limit).map((record) => {
      const post = new PostCon(record.get('paginatedPost')).getObject();
      const media = record
        .get('post_media')
        .map((m) => new PostMediaCon(m).getObject());
      const creator = new UserCon(record.get('creator')).getObject();
      return { ...post, media, creator };
    });

    const hasMore = result.records.length > limit;
    const nextPage = hasMore ? page + 1 : null;

    return { posts, hasMore, nextPage };
  }

  async getParticipantByName(
    query: string,
    userId: string
  ): Promise<Omit<ParticipantDocument, 'participatedRooms'>[]> {
    const participants = await this.participantModel
      .find({
        name: { $regex: query, $options: 'i' },
      })
      .select('-participatedRooms')
      .limit(10);
    return participants.filter((participant) => participant.userid !== userId);
  }

  async followUser(followerId: string, followeeId: string): Promise<boolean> {
    const result = await this.neo4jService.write(
      `
      MATCH (follower:USER {id: $followerId})
      MATCH (followee:USER {id: $followeeId})
      CREATE (follower)-[:FOLLOWS]->(followee)
      SET follower.following_count = follower.following_count + toInteger(1)
      SET followee.followers_count = followee.followers_count + toInteger(1)
      RETURN follower, followee
      `,
      { followerId, followeeId }
    );

    return result.records.length > 0;
  }

  async unfollowUser(followerId: string, followeeId: string): Promise<boolean> {
    const result = await this.neo4jService.write(
      `
      MATCH (follower:USER {id: $followerId})-[r:FOLLOWS]->(followee:USER {id: $followeeId})
      DELETE r
      SET follower.following_count = toInteger(follower.following_count) - 1
      SET followee.followers_count = toInteger(followee.followers_count) - 1
      RETURN follower, followee
      `,
      { followerId, followeeId }
    );

    return result.records.length > 0;
  }

  async getWhoToFollow(userId?: string): Promise<User[]> {
    if (!userId) {
      const cachedTopUsers = await this.redis.get('top_followed_users');
      if (cachedTopUsers) {
        return JSON.parse(cachedTopUsers);
      }
      const topUsersQuery = await this.neo4jService.read(
        `MATCH (user:USER)
         RETURN user
         ORDER BY user.followers_count DESC
         LIMIT 5`
      );
      const topUsers = topUsersQuery.records.map((record) =>
        new UserCon(record.get('user')).getObject()
      );
      await this.redis.set(
        'top_followed_users',
        JSON.stringify(topUsers),
        'EX',
        3600
      );
      return topUsers;
    }
    const query = await this.neo4jService.read(
      `MATCH (user:USER {id: $userId})-[:FOLLOWS]->(following:USER)-[:FOLLOWS]->(suggested:USER)
       WHERE NOT (user)-[:FOLLOWS]->(suggested) AND suggested.id <> $userId
       RETURN DISTINCT suggested
       LIMIT 5`,
      { userId }
    );
    const result = query.records.map((record) =>
      new UserCon(record.get('suggested')).getObject()
    );
    if (result.length === 0) {
      const topUsersQuery = await this.neo4jService.read(
        `MATCH (user:USER)
         WHERE user.id <> $userId
         RETURN user 
         ORDER BY user.followers_count DESC
         LIMIT 5`,
        { userId }
      );
      return topUsersQuery.records.map((record) =>
        new UserCon(record.get('user')).getObject()
      );
    }
    return result;
  }

  async getUserSessions(userId: string): Promise<AuthSession[]> {
    const result = await this.neo4jService.read(
      `MATCH (user:USER {id: $userId})-[:HAS_SESSION]->(session:SESSION)
       RETURN session
       ORDER BY session.last_seen_on DESC`,
      { userId }
    );

    return result.records.map((record) =>
      new AuthSessionCon(record.get('session')).getObject()
    );
  }

  async searchUser(query: string): Promise<User[]> {
    const loweredQuery = query.toLowerCase();
    const result = await this.neo4jService.read(
      `MATCH (user:USER)
       WHERE toLower(user.full_name) CONTAINS $query 
       OR toLower(user.username) CONTAINS $query
       RETURN user
       LIMIT 10`,
      { query: loweredQuery }
    );

    return result.records.map((record) =>
      new UserCon(record.get('user')).getObject()
    );
  }
}
