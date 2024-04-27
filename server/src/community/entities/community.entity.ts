import { Post } from '@/post/entities/post.entity';
import { User } from '@/user/user.entity';
import { createObjectPropertiesString } from '@/utils/helpers';
import { Node } from 'neo4j-driver';

export interface Community {
  id: string;
  title: string;
  description: string;
  image: string;
  rules: string;
  //   members: User | string[];
  //   posts: Post | string[];
  //   admins: User | string[];
  //   moderators: User | string[];
  //   pinnedPost: Post;
  createdAt: Date;
  updatedAt: Date;
}

export class CommunityCon {
  constructor(private readonly node: Node) {}

  get id() {
    return (<Record<string, any>>this.node.properties).id;
  }

  getObject(): Community {
    return createCommunityObj({ ...this.node.properties });
  }
}

const createCommunityObj = (communityData: Partial<Community>): Community => {
  return {
    id: communityData.id,
    title: communityData.title,
    description: communityData.description,
    image: communityData.image,
    rules: communityData.rules,
    // members: communityData.members,
    // posts: communityData.posts,
    // admins: communityData.admins,
    // moderators: communityData.moderators,
    createdAt: communityData.createdAt,
    updatedAt: communityData.updatedAt,
  };
};

export const createCommunityPropertiesString = (
  community: Partial<Community>
) => {
  return createObjectPropertiesString(createCommunityObj(community));
};
