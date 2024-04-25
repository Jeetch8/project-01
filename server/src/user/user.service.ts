import { Injectable, NotFoundException } from '@nestjs/common';
import { Neo4jService } from 'nest-neo4j/dist';
import {
  ChangePasswordDto,
  UpdateAccountInfoDto,
  UserAuthDto,
  UserDto,
} from './user.dto';
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
import { Post, PostCon, PostMediaCon } from '@/post/entities/post.entity';
import { InjectModel, Schema } from '@nestjs/mongoose';
import mongoose, { Model, Types } from 'mongoose';
import { Participant, ParticipantDocument } from '@/schemas/Participant.schema';
import { hashPassword } from '@/utils/helpers';

@Injectable()
export class UserService {
  constructor(
    private neo4jService: Neo4jService,
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

  async getUser({
    email,
    userId,
    username,
  }: {
    email?: string;
    userId?: string;
    username?: string;
  }): Promise<{ user: User | undefined; userTokens: UserToken | undefined }> {
    let searchWith: string | undefined;
    if (userId) searchWith = 'id: $userId';
    else if (email) searchWith = 'email: $email';
    else if (username) searchWith = 'username: $username';
    else return { user: undefined, userTokens: undefined };
    const result = await this.neo4jService.read(
      `MATCH (user:USER {${searchWith}}) -[:TOKENS]-> (token:USER_TOKENS)
      RETURN user, token`,
      {
        userId,
        email: email?.toLocaleLowerCase(),
        username,
      }
    );
    if (!result.records.length)
      return { user: undefined, userTokens: undefined };
    return {
      user: new UserCon(result.records[0].get('user')).getObject(),
      userTokens: new UserTokenCon(result.records[0].get('token')).getObject(),
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

  async searchUsersByFullName(query: string): Promise<User[]> {
    const result = await this.neo4jService.read(
      `MATCH (user:USER)
      WHERE toLower(user.full_name) CONTAINS toLower($query)
      RETURN user
      LIMIT 10`,
      { query }
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
    userId: string,
    page: number = 0,
    limit: number = 10
  ): Promise<{ posts: Post[]; hasMore: boolean; nextPage: number }> {
    const skip = page * limit;
    const result = await this.neo4jService.read(
      `MATCH (user:USER {id: $userId})-[:POSTED]->(post:POST)
       OPTIONAL MATCH (post)-[:HAS_MEDIA]->(media:POST_MEDIA)
       WITH post, collect(media) as post_media
       ORDER BY post.created_on DESC
       SKIP ${skip}
       LIMIT ${limit + 1}
       RETURN post, post_media`,
      { userId }
    );

    const posts = result.records.map((record) => {
      const post = new PostCon(record.get('post')).getObject();
      const media = record
        .get('post_media')
        .map((m) => new PostMediaCon(m).getObject());
      return { ...post, post_media: media };
    });

    const hasMore = result.records.length > limit;
    const nextPage = hasMore ? page + 1 : null;

    return { posts, hasMore, nextPage };
  }

  async getLikedPosts(
    userId: string,
    username?: string,
    page: number = 0,
    limit: number = 10
  ): Promise<{ posts: Post[]; hasMore: boolean; nextPage: number }> {
    const skip = page * limit;
    let searchWith: string;
    if (userId) searchWith = 'id: $userId';
    else if (username) searchWith = 'username: $username';
    else return { posts: [], hasMore: false, nextPage: null };
    const result = await this.neo4jService.read(
      `MATCH (user:USER {${searchWith}})-[:LIKED]->(post:POST)
       OPTIONAL MATCH (post)-[:HAS_MEDIA]->(media:POST_MEDIA)
       WITH post, collect(media) as post_media
       ORDER BY post.created_on DESC
       SKIP ${skip}
       LIMIT ${limit + 1}
       RETURN post, post_media`,
      { userId, username }
    );

    const posts = result.records.map((record) => {
      const post = new PostCon(record.get('post')).getObject();
      const media = record
        .get('post_media')
        .map((m) => new PostMediaCon(m).getObject());
      return { ...post, post_media: media };
    });

    const hasMore = result.records.length > limit;
    const nextPage = hasMore ? page + 1 : null;

    return { posts, hasMore, nextPage };
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
       WITH post, collect(media) as post_media
       ORDER BY post.created_on DESC
       SKIP ${skip}
       LIMIT ${limit + 1}
       RETURN post, post_media`,
      { userId }
    );

    const posts = result.records.map((record) => {
      const post = new PostCon(record.get('post')).getObject();
      const media = record
        .get('post_media')
        .map((m) => new PostMediaCon(m).getObject());
      return { ...post, post_media: media };
    });

    const hasMore = result.records.length > limit;
    const nextPage = hasMore ? page + 1 : null;

    return { bookmarks: posts, hasMore, nextPage };
  }

  async getUserFeed(
    userId?: string,
    username?: string,
    page: number = 0
  ): Promise<{ feed: Post[]; hasMore: boolean; nextPage: number }> {
    const limit = 10;
    const skip = page * limit;
    let searchWith: string;
    if (userId) searchWith = 'id: $userId';
    else if (username) searchWith = 'username: $username';
    else return { feed: [], hasMore: false, nextPage: null };
    const result = await this.neo4jService.read(
      `MATCH (user:USER {${searchWith}})-[:FOLLOWS]->(followedUser:USER)-[:POSTED]->(post:POST)
       OPTIONAL MATCH (post)-[:HAS_MEDIA]->(media:POST_MEDIA)
       WITH post, collect(media) as post_media
       ORDER BY post.created_on DESC
       LIMIT ${limit + 1}
       RETURN post, post_media`,
      { userId, username, skip }
    );

    const posts = result.records.map((record) => {
      const post = new PostCon(record.get('post')).getObject();
      const media = record
        .get('post_media')
        .map((m) => new PostMediaCon(m).getObject());
      return { ...post, post_media: media };
    });

    const hasMore = posts.length > limit;
    const nextPage = hasMore ? page + 1 : null;

    return { feed: posts.slice(0, limit), hasMore, nextPage };
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
      WHERE NOT (follower)-[:FOLLOWS]->(followee) AND follower.id <> followee.id
      CREATE (follower)-[:FOLLOWS]->(followee)
      SET follower.following_count = follower.following_count + 1
      SET followee.followers_count = followee.followers_count + 1
      RETURN follower, followee
      `,
      { followerId, followeeId }
    );

    return result.records.length > 0;
  }

  // Add this method to the UserService class
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
}
