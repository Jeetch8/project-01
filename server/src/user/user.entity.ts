import { createObjectPropertiesString } from '@/utils/helpers';
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

export class AuthSessionCon {
  constructor(private readonly node: Node) {}

  get id() {
    return (<Record<string, any>>this.node.properties).id;
  }

  getObject(): AuthSession {
    const {
      id,
      device_name,
      browser,
      os,
      ip_address,
      location,
      logged_in,
      logged_in_date,
      last_logged_in_date,
    } = <Record<string, any>>this.node.properties;
    return createAuthSessionObj({
      id,
      device_name,
      browser,
      os,
      ip_address,
      location,
      logged_in,
      logged_in_date,
      last_logged_in_date,
    });
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
  id: string;
  signup_date: string;
  email: string;
  password?: string;
  auth_provider: AuthProvider;
  email_verified: boolean;
  first_name: string;
  last_name: string;
  full_name: string;
  username: string;
  profile_img: string;
  gender?: Gender;
  date_of_birth?: string;
  banner_img?: string;
  bio?: string;
  following_count: number;
  followers_count: number;
  location?: string;
}
export interface AuthSession {
  id: string;
  device_name: string;
  browser: string;
  os: string;
  ip_address: string;
  location: string;
  logged_in: boolean;
  logged_in_date: string;
  last_logged_in_date: string;
}

export const createAuthSessionObj = (
  authSessionData: Partial<AuthSession>
): AuthSession => {
  return {
    id: authSessionData.id,
    device_name: authSessionData.device_name,
    browser: authSessionData.browser,
    os: authSessionData.os,
    ip_address: authSessionData.ip_address,
    location: authSessionData.location,
    logged_in: authSessionData.logged_in,
    logged_in_date: authSessionData.logged_in_date,
    last_logged_in_date: authSessionData.last_logged_in_date,
  };
};

export const createAuthSessionPropertiesString = (
  authSession: Partial<AuthSession>
) => {
  return createObjectPropertiesString(createAuthSessionObj(authSession));
};

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
    following_count: userData.following_count,
    followers_count: userData.followers_count,
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

export const createUserPropertiesString = (user: Partial<User>) => {
  return createObjectPropertiesString(createUserObj(user));
};

export const createUserTokenPropertiesString = (
  userToken: Partial<UserToken>
) => {
  return createObjectPropertiesString(createUserTokensObj(userToken));
};
