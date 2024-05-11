import { Module } from '@nestjs/common';
import { CommunityController } from './community.controller';
import { CommunityService } from './community.service';
import { CommunityRolesGuard } from './guards/community-roles.guard';
import { PostModule } from '@/post/post.module';
import { GoogleAIModule } from '@/lib/googleAI/googleAI.module';

@Module({
  imports: [PostModule, GoogleAIModule],
  controllers: [CommunityController],
  providers: [CommunityService, CommunityRolesGuard],
})
export class CommunityModule {}
