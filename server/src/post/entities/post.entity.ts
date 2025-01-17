import { createObjectPropertiesString } from '@/utils/helpers';
import { Node } from 'neo4j-driver';

export interface Post {
  id: string;
  caption: string;
  likes_count: number;
  comments_count: number;
  embedding: number[];
  created_on: Date;
  updated_on: Date;
}

export enum MediaType {
  IMAGE = 'image',
  VIDEO = 'video',
  AUDIO = 'audio',
  DOCUMENT = 'document',
}

export interface PostMedia {
  id: string;
  post_id: string;
  media_type: MediaType;
  tags?: string;
  alt?: string;
  original_media_url: string;
  modified_media_url: string;
  creator_id: string;
}

export interface UserSession {
  id: string;
  device: string;
  browser: string;
  location: string;
  ip_address: string;
  operating_system: string;
  last_seen_on: Date;
  signed_in_on: Date;
}

interface Notification {
  id: string;
  type?: string;
  reference_id?: string;
}

export class PostMediaCon {
  constructor(private readonly node: Node) {}

  get id() {
    return (<Record<string, any>>this.node.properties).id;
  }

  getObject(): PostMedia {
    const {
      id,
      post_id,
      media_type,
      tags,
      alt,
      original_media_url,
      modified_media_url,
      creator_id,
    } = <Record<string, any>>this.node.properties;
    return {
      id,
      post_id,
      media_type,
      tags,
      alt,
      original_media_url,
      modified_media_url,
      creator_id,
    };
  }
}

export const createPostObj = (post: Partial<Post>): Post => {
  return {
    id: post?.id,
    caption: post?.caption,
    likes_count: post?.likes_count || 0,
    comments_count: post?.comments_count || 0,
    embedding: post?.embedding || [],
    created_on: post?.created_on,
    updated_on: post?.updated_on,
  };
};

export const createPostMediaObj = (
  postMedia: Partial<PostMedia>
): PostMedia => {
  return {
    id: postMedia?.id,
    post_id: postMedia?.post_id,
    media_type: postMedia?.media_type,
    tags: postMedia?.tags,
    alt: postMedia?.alt,
    original_media_url: postMedia?.original_media_url,
    modified_media_url: postMedia?.modified_media_url,
    creator_id: postMedia?.creator_id,
  };
};

export class PostCon {
  constructor(private readonly node: Node) {}

  get id() {
    return (<Record<string, any>>this.node.properties).id;
  }

  getObject(): Post {
    const {
      id,
      caption,
      likes_count,
      comments_count,
      created_on,
      updated_on,
      embedding,
    } = <Record<string, any>>this.node.properties;
    return {
      id,
      caption,
      likes_count,
      comments_count,
      created_on,
      embedding,
      updated_on,
    };
  }
}

export const createPostPropertiesString = (post: Partial<Post>) => {
  return createObjectPropertiesString(createPostObj(post));
};

export const createPostMediaPropertiesString = (
  postMedia: Partial<PostMedia>
) => {
  return createObjectPropertiesString(createPostMediaObj(postMedia));
};
