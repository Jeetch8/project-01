import { SetMetadata } from '@nestjs/common';

export const COMMUNITY_ROLES_KEY = 'community_roles';
export enum CommunityRole {
  ADMIN = 'ADMIN',
  MODERATOR = 'MODERATOR',
  MEMBER = 'MEMBER',
}

export const CommunityRoles = (...roles: CommunityRole[]) =>
  SetMetadata(COMMUNITY_ROLES_KEY, roles);
