import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Neo4jService } from 'nest-neo4j/dist';
import {
  COMMUNITY_ROLES_KEY,
  CommunityRole,
} from '../decorators/community-roles.decorator';

@Injectable()
export class CommunityRolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private neo4jService: Neo4jService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<CommunityRole[]>(
      COMMUNITY_ROLES_KEY,
      [context.getHandler(), context.getClass()]
    );
    if (!requiredRoles) {
      return true;
    }
    const { user, params } = context.switchToHttp().getRequest();
    const communityId = params.id;

    const result = await this.neo4jService.read(
      `
      MATCH (u:USER {id: $userId}) <-[r:ADMIN|MODERATOR|MEMBER]- (c:Community {id: $communityId})
      RETURN type(r) as role
      `,
      { userId: user.userId, communityId }
    );

    if (result.records.length === 0) {
      return false;
    }

    const userRole = result.records[0].get('role') as CommunityRole;
    return requiredRoles.includes(userRole);
  }
}
