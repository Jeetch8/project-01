import { Node } from 'neo4j-driver';

export class UserCon {
  constructor(private readonly node: Node) {}

  get id() {
    return (<Record<string, any>>this.node.properties).id;
  }

  getObject(): User {
    return createUserObj({ ...this.node.properties });
  }
}

export class UserTokenCon {
  constructor(private readonly node: Node) {}

  get id() {
    return (<Record<string, any>>this.node.properties).id;
  }

  getObject(): UserToken {
    const {
      id,
      forgot_password_token,
      forgot_password_token_expiry,
      email_verification_token,
      email_verification_expiry,
    } = <Record<string, any>>this.node.properties;
    return {
      id,
      forgot_password_token,
      forgot_password_token_expiry,
      email_verification_token,
      email_verification_expiry,
    };
  }
}

export enum AuthProvider {
  LOCAL = 'local',
  GOOGLE = 'google',
  GITHUB = 'github',
}

export interface UserToken {
  id: string;
  forgot_password_token?: string;
  forgot_password_token_expiry?: string;
  email_verification_token?: string;
  email_verification_expiry?: string;
}

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
}

export interface User {
  id: string | undefined;
  signup_date: string | undefined;
  email: string | undefined;
  password?: string | undefined;
  auth_provider: AuthProvider | undefined;
  email_verified: boolean | undefined;
  first_name: string | undefined;
  last_name: string | undefined;
  full_name: string | undefined;
  username: string | undefined;
  profile_img: string | undefined;
  gender?: Gender | undefined;
  date_of_birth?: string | undefined;
  banner_img?: string | undefined;
  bio?: string | undefined;
  location?: string | undefined;
}

export const createUserObj = (userData: Partial<User>): User => {
  return {
    id: userData.id,
    signup_date: userData.signup_date,
    email: userData.email,
    password: userData.password,
    auth_provider: userData.auth_provider,
    email_verified: userData.email_verified,
    first_name: userData.first_name,
    last_name: userData.last_name,
    full_name: userData.full_name,
    username: userData.username,
    profile_img: userData.profile_img,
    gender: userData.gender,
    date_of_birth: userData.date_of_birth,
    banner_img: userData.banner_img,
    bio: userData.bio,
    location: userData.location,
  };
};

export const createUserTokensObj = (
  userData: Partial<UserToken>
): UserToken => {
  return {
    id: userData.id,
    forgot_password_token: userData.forgot_password_token,
    forgot_password_token_expiry: userData.forgot_password_token_expiry,
    email_verification_token: userData.email_verification_token,
    email_verification_expiry: userData.email_verification_expiry,
  };
};
