import { IParticipant } from '@server/src/socket/socket.types';

export enum IAuthProvider {
  LOCAL = 'local',
  GOOGLE = 'google',
  GITHUB = 'github',
}

export interface IUserToken {
  id: string;
  forgot_password_token?: string;
  forgot_password_token_expiry?: string;
  email_verification_token?: string;
  email_verification_expiry?: string;
}

export enum IGender {
  MALE = 'male',
  FEMALE = 'female',
}

export interface IUserSession {
  id: string;
  device: string;
  browser: string;
  location: string;
  ip_address: string;
  operating_system: string;
  last_seen_on: string;
  signed_in_on: string;
}

export interface IUser {
  id: string;
  signup_date: string;
  email: string;
  password?: string;
  auth_provider: IAuthProvider;
  email_verified: boolean;
  first_name: string;
  last_name: string;
  full_name: string;
  username: string;
  profile_img: string;
  gender?: IGender;
  date_of_birth?: string;
  banner_img?: string;
  bio?: string;
  location?: string;
  following_count?: number;
  followers_count?: number;
}

export enum IMediaType {
  IMAGE = 'image',
  VIDEO = 'video',
  AUDIO = 'audio',
  DOCUMENT = 'document',
}

export interface IPostMedia {
  id: string;
  media_type: IMediaType;
  tags?: string;
  alt?: string;
  original_media_url: string;
  modified_media_url: string;
}

export interface IPost {
  id: string;
  caption: string;
  likes_count: number;
  comments_count: number;
  created_on: string;
  updated_on: string;
}

export interface IFeedPost {
  id: string;
  creator: Pick<
    IUser,
    'id' | 'first_name' | 'last_name' | 'profile_img' | 'username' | 'full_name'
  >;
  media: IPostMedia[];
  caption: string;
  liked: boolean;
  bookmarked: boolean;
  isCommunityPost?: boolean;
  roleInCommunity?: string;
  communityName?: string;
  comments_count: number;
  likes_count: number;
  created_on: string;
  updated_on: string;
  timeAgo: string;
}

export interface IPostPage extends IFeedPost {
  comments: IPostPage[];
}

export type ISchemaPost = Omit<IFeedPost, 'creator' | 'comments' | 'media'>;

export interface ICommunity {
  id: string;
  name: string;
  banner_img: string;
  members_count: number;
  description: string;
  members: IParticipant[] | string[];
}
