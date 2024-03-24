import { Injectable, NotFoundException } from '@nestjs/common';
import { Neo4jService } from 'nest-neo4j/dist';
import { UserAuthDto, UserDto } from './user.dto';
import { createId } from '@paralleldrive/cuid2';
import {
  UserCon,
  User,
  UserToken,
  UserTokenCon,
  createUserTokensObj,
  createUserObj,
} from './user.entity';

@Injectable()
export class UserService {
  constructor(private neo4jService: Neo4jService) {}

  async create_user({
    first_name,
    last_name,
    date_of_birth,
    gender,
    profile_img,
    email,
  }: Omit<
    User,
    'full_name' | 'id' | 'signup_date' | 'email_verified' | 'username'
  >) {
    const username = await this.generate_unique_username(first_name, last_name);
    return await this.neo4jService
      .write(
        `CREATE (user:USER {${this.createUserPropertiesString({
          first_name,
          last_name,
          profile_img,
          gender,
          date_of_birth,
          username,
          email,
          id: createId(),
          full_name: first_name + last_name,
          email_verified: false,
          signup_date: new Date().toISOString(),
        })}})
      RETURN user`
      )
      .then((res) => {
        return new UserCon(res.records[0].get('user')).getObject();
      });
  }

  async create_user_token(
    {
      email_verification_expiry,
      email_verification_token,
    }: Omit<UserToken, 'id'>,
    { email, userId }: { email?: string; userId?: string }
  ) {
    const searchWith = userId ? 'id: $userId' : 'email: $email';
    const userTokenStr = await this.createUserTokenPropertiesString({
      email_verification_expiry,
      email_verification_token,
    });
    const res = await this.neo4jService.write(
      `MATCH (user:USER {${searchWith}}) 
      CREATE (auth:USER_TOKEN {${userTokenStr}}) <-[:TOKENS]- (user)
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
  }: {
    email?: string;
    userId?: string;
  }): Promise<{ user: User | undefined; userTokens: UserToken | undefined }> {
    const searchWith = userId ? 'id: $userId' : 'email: $email';
    const result = await this.neo4jService.read(
      `MATCH (user:USER {${searchWith}}) -[:TOKENS]-> (token:USER_TOKEN)
      RETURN user, token`,
      {
        userId,
        email,
      }
    );
    if (!result.records.length)
      return { user: undefined, userTokens: undefined };
    return {
      user: new UserCon(result.records[0].get('user')).getObject(),
      userTokens: new UserTokenCon(result.records[0].get('token')).getObject(),
    };
  }

  async updateUserToken(userId: string, userToken: Partial<UserToken>) {}

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

  createUserPropertiesString(user: Partial<User>) {
    const userObj = createUserObj(user);
    let resultStr = '';
    Object.entries(userObj).forEach((e) => {
      resultStr += e[1] === undefined ? `${e[0]}: '',` : `${e[0]}: '${e[1]}',`;
    });
    if (resultStr.endsWith(',')) resultStr = resultStr.slice(0, -1);
    return resultStr;
  }

  createUserTokenPropertiesString(userToken: Partial<UserToken>) {
    const userTokensObj = createUserTokensObj(userToken);
    let resultStr = '';
    Object.entries(userTokensObj).forEach((e) => {
      resultStr += e[1] === undefined ? `${e[0]}: '',` : `${e[0]}: '${e[1]}',`;
    });
    if (resultStr.endsWith(',')) resultStr = resultStr.slice(0, -1);
    return resultStr;
  }

  // async getUserToken(email: string): Promise<UserToken> {
  //   const res = await this.neo4jService.read(
  //     `MATCH (user:USER {email:${email}}) -[:AUTH]-> (auth:AUTH)
  //     RETURN auth`
  //   );
  //   return new UserCon(res.records[0].get('auth')).getObject();
  // }
}
