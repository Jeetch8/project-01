import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { Neo4jService } from 'nest-neo4j/dist';
import { Community, CommunityCon } from './entities/community.entity';
import { createId } from '@paralleldrive/cuid2';
import { Post, PostCon } from '@/post/entities/post.entity';
import { User, UserCon } from '@/user/user.entity';
import { PostService } from '@/post/post.service';
import { PostMedia, PostMediaCon } from '@/post/entities/post.entity';
import { jwtAuthTokenPayload } from '@/auth/entities/auth.entity';

@Injectable()
export class CommunityService {
  constructor(
    private neo4jService: Neo4jService,
    private postService: PostService
  ) {}

  async getCommunity(id: string): Promise<Community> {
    const result = await this.neo4jService.read(
      'MATCH (c:Community) WHERE c.id = $id RETURN c',
      { id }
    );
    if (result.records.length === 0) {
      throw new NotFoundException('Community not found');
    }
    return new CommunityCon(result.records[0].get('c')).getObject();
  }

  async createCommunity(communityData: {
    title: string;
    description: string;
    image: string;
    rules: string;
    creatorId: string;
    moderators?: string[];
    members?: string[];
  }): Promise<Community> {
    const {
      title,
      description,
      image,
      rules,
      creatorId,
      moderators = [],
      members = [],
    } = communityData;

    const membersStr = members
      .map(
        (member, ind) =>
          `CREATE (c) -[ab${ind}:MEMBER { joined_at: datetime()}]-> (:USER {id: '${member}'})`
      )
      .join('\n');
    const moderatorsStr = moderators
      .map(
        (moderator, ind) =>
          `CREATE  (c) -[gd${ind}:MEMBER { joined_at: datetime()}]-> (:USER {id: '${moderator}'})`
      )
      .join('\n');

    const newCommunity = await this.neo4jService
      .write(
        `
        MATCH (creator:USER {id: $creatorId})
        CREATE (c:Community {
          id: $id,
          title: $title,
          description: $description,
          image: $image,
          rules: $rules,
          createdAt: datetime(),
          updatedAt: datetime()
        })
        CREATE (c)-[:ADMIN {joined_at: datetime()}]->(creator)
        ${membersStr}
        ${moderatorsStr}
        RETURN c
        `,
        {
          id: createId(),
          title,
          description,
          image,
          rules,
          creatorId,
          moderators,
          members,
        }
      )
      .then((res) => {
        const record = res.records[0];
        return new CommunityCon(record.get('community')).getObject();
      });

    return newCommunity;
  }

  async createPostInCommunity(postData: {
    communityId: string;
    requestUser: jwtAuthTokenPayload;
    caption: string;
    media: Express.Multer.File[];
  }): Promise<Post> {
    const { communityId, requestUser, caption, media } = postData;
    const newPost = await this.postService.createPost({
      caption,
      media,
      requestUser,
    });

    await this.neo4jService.write(
      `
      MATCH (c:Community {id: $communityId}), (p:POST {id: $postId})
      CREATE (c)-[:COMMUNITY_POST]->(p)
      `,
      { communityId, postId: newPost.id }
    );

    return newPost;
  }

  async addMember(communityId: string, userId: string): Promise<Community> {
    return await this.neo4jService
      .write(
        `
      MATCH (u:USER {id: $userId}), (c:Community {id: $communityId})
      WHERE NOT (u)-[:MEMBER|:MODERATOR|:ADMIN]->(c)
      CREATE (u)-[:MEMBER {joined_at: datetime()}]->(c)
      RETURN c
      `,
        { userId, communityId }
      )
      .then((res) => {
        const record = res.records[0];
        return new CommunityCon(record.get('c')).getObject();
      });
  }

  async removeMember(communityId: string, userId: string): Promise<Community> {
    return await this.neo4jService
      .write(
        `
      MATCH (u:USER {id: $userId})-[r:MEMBER|:MODERATOR]->(c:Community {id: $communityId})
      DELETE r
      `,
        { userId, communityId }
      )
      .then((res) => {
        const record = res.records[0];
        return new CommunityCon(record.get('c')).getObject();
      });
  }

  async addModerator(communityId: string, userId: string): Promise<Community> {
    return await this.neo4jService
      .write(
        `
      MATCH (u:USER {id: $userId})-[r:MEMBER]->(c:Community {id: $communityId})
      DELETE r
      CREATE (u)-[:MODERATOR {joined_at: datetime()}]->(c)
      RETURN c
      `,
        { userId, communityId }
      )
      .then((res) => {
        const record = res.records[0];
        return new CommunityCon(record.get('c')).getObject();
      });
  }

  async removeModerator(
    communityId: string,
    userId: string
  ): Promise<Community> {
    return await this.neo4jService
      .write(
        `
      MATCH (u:USER {id: $userId})-[r:MODERATOR]->(c:Community {id: $communityId})
      DELETE r
      CREATE (u)-[:MEMBER {joined_at: datetime()}]->(c)
      `,
        { userId, communityId }
      )
      .then((res) => {
        const record = res.records[0];
        return new CommunityCon(record.get('c')).getObject();
      });
  }

  async editCommunity(
    communityId: string,
    updateData: Partial<Community>
  ): Promise<Community> {
    const { title, description, image, rules } = updateData;
    const result = await this.neo4jService.write(
      `
      MATCH (c:Community {id: $communityId})
      SET c += {
        title: $title,
        description: $description,
        image: $image,
        rules: $rules,
        updatedAt: datetime()
      }
      RETURN c
      `,
      { communityId, title, description, image, rules }
    );
    return new CommunityCon(result.records[0].get('c')).getObject();
  }

  async deleteCommunity(communityId: string): Promise<void> {
    await this.neo4jService.write(
      `
      MATCH (c:Community {id: $communityId})
      DETACH DELETE c
      `,
      { communityId }
    );
  }

  async getCommunityMembers(communityId: string): Promise<User[]> {
    const result = await this.neo4jService.read(
      `
      MATCH (u:USER)-[:MEMBER|:MODERATOR|:ADMIN]->(c:Community {id: $communityId})
      RETURN u
      `,
      { communityId }
    );
    return result.records.map((record) =>
      new UserCon(record.get('u')).getObject()
    );
  }

  async getCommunityPosts(
    communityId: string,
    page: number = 0,
    limit: number = 25
  ): Promise<{ posts: Post[]; hasMore: boolean; nextPage: number }> {
    const skip = page * limit;
    const result = await this.neo4jService.read(
      `
      MATCH (c:Community {id: $communityId})-[:COMMUNITY_POST]->(p:POST)
      RETURN p
      ORDER BY p.created_on DESC
      SKIP $skip
      LIMIT $limit
      `,
      { communityId, skip, limit: limit + 1 }
    );
    const posts = result.records
      .slice(0, limit)
      .map((record) => new PostCon(record.get('p')).getObject());
    const hasMore = result.records.length > limit;
    const nextPage = hasMore ? page + 1 : null;
    return { posts, hasMore, nextPage };
  }

  async getLatestPosts(
    communityId: string,
    page: number = 0,
    limit: number = 25
  ): Promise<{ posts: Post[]; hasMore: boolean; nextPage: number }> {
    return this.getCommunityPosts(communityId, page, limit);
  }

  async getTopPosts(
    communityId: string,
    page: number = 0,
    limit: number = 25
  ): Promise<{ posts: Post[]; hasMore: boolean; nextPage: number }> {
    const skip = page * limit;
    const result = await this.neo4jService.read(
      `
      MATCH (c:Community {id: $communityId})-[:COMMUNITY_POST]->(p:POST)
      RETURN p
      ORDER BY p.likes_count DESC, p.created_on DESC
      SKIP $skip
      LIMIT $limit
      `,
      { communityId, skip, limit: limit + 1 }
    );
    const posts = result.records
      .slice(0, limit)
      .map((record) => new PostCon(record.get('p')).getObject());
    const hasMore = result.records.length > limit;
    const nextPage = hasMore ? page + 1 : null;
    return { posts, hasMore, nextPage };
  }

  async getPostMedias(
    communityId: string,
    page: number = 0,
    limit: number = 25
  ): Promise<{ medias: PostMedia[]; hasMore: boolean; nextPage: number }> {
    const skip = page * limit;
    const result = await this.neo4jService.read(
      `
      MATCH (c:Community {id: $communityId})-[:COMMUNITY_POST]->(p:POST)-[:HAS_MEDIA]->(m:POST_MEDIA)
      RETURN m
      ORDER BY p.created_on DESC
      SKIP $skip
      LIMIT $limit
      `,
      { communityId, skip, limit: limit + 1 }
    );
    const medias = result.records
      .slice(0, limit)
      .map((record) => new PostMediaCon(record.get('m')).getObject());
    const hasMore = result.records.length > limit;
    const nextPage = hasMore ? page + 1 : null;
    return { medias, hasMore, nextPage };
  }

  async pinPost(communityId: string, postId: string): Promise<void> {
    await this.neo4jService.write(
      `
      MATCH (c:Community {id: $communityId}), (p:POST {id: $postId})
      MERGE (c)-[:PINNED_POST]->(p)
      `,
      { communityId, postId }
    );
  }

  async joinCommunity(communityId: string, userId: string): Promise<void> {
    await this.neo4jService.write(
      `
      MATCH (u:USER {id: $userId}), (c:Community {id: $communityId})
      WHERE NOT (u)-[:ADMIN|MODERATOR|MEMBER]->(c)
      CREATE (u)-[:MEMBER {joined_at: datetime()}]->(c)
      `,
      { userId, communityId }
    );
  }

  async leaveCommunity(communityId: string, userId: string): Promise<void> {
    await this.neo4jService.write(
      `
      MATCH (u:USER {id: $userId})-[r:MEMBER]->(c:Community {id: $communityId})
      DELETE r
      `,
      { userId, communityId }
    );
  }

  async deletePostFromCommunity(postId: string): Promise<void> {
    await this.postService.deletePost(postId);
  }

  async getUserRole(communityId: string, userId: string): Promise<string> {
    const result = await this.neo4jService.read(
      `
      MATCH (u:USER {id: $userId})-[r:ADMIN|MODERATOR|MEMBER]->(c:Community {id: $communityId})
      RETURN type(r) as role
      `,
      { userId, communityId }
    );

    if (result.records.length === 0) {
      throw new ForbiddenException('User is not a member of this community');
    }

    return result.records[0].get('role');
  }
}
