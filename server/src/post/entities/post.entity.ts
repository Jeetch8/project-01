import { Node } from 'neo4j-driver';

export interface Post {
  id: string;
  caption: string;
  likes_count: number;
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

interface PostComment {
  id: string;
  caption: string;
  likes_count: number;
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

export class PostCon {
  constructor(private readonly node: Node) {}

  get id() {
    return (<Record<string, any>>this.node.properties).id;
  }

  getObject(): Post {
    const { id, caption, likes_count, creator_id, created_on, updated_on } = <
      Record<string, any>
    >this.node.properties;
    return {
      id,
      caption,
      likes_count,
      created_on,
      updated_on,
    };
  }
}

// //   interface Community {
// //     id: string;
// //     user_joined_community: UserJoinedCommunity[];
// //   }

// //   interface Thread {
// //     id: string;
// //     creator_id: string;
// //     creator: UserProfile;
// //     thread_posts_mapping: ThreadPostsMapping[];
// //   }

// interface LikedPost {
//   id: string;
//   post_id: string;
//   user_id: string;
//   post: Post;
//   user: UserProfile;
// }

// interface Messages {
//   id: string;
// }

// interface Follower {
//   id: string;
//   following_user_id: string;
//   followee_user_id: string;
//   following_user: UserProfile;
//   followed_user: UserProfile;
// }

// interface BookmarkCategory {
//   id: string;
//   title: string;
//   description?: string;
//   user_id: string;
//   user: UserProfile;
//   bookmark: Bookmark[];
// }

// interface Bookmark {
//   id: string;
//   bookmark_category_id: string;
//   post_id: string;
//   bookmark_category: BookmarkCategory;
//   post: Post;
// }

// interface Replies {
//   id: string;
//   user_id: string;
//   comment_id: string;
//   post_id: string;
//   user: UserProfile;
//   comment: PostComment;
//   post: Post;
// }

//   interface UserJoinedCommunity {
//     id: string;
//     user_id: string;
//     community_id: string;
//     position?: number;
//     user: UserProfile;
//     community: Community;
//   }
