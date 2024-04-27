import { Module } from '@nestjs/common';
import { CommunityController } from './community.controller';
import { CommunityService } from './community.service';
import { CommunityRolesGuard } from './guards/community-roles.guard';

@Module({
  controllers: [CommunityController],
  providers: [CommunityService, CommunityRolesGuard],
})
export class CommunityModule {}
