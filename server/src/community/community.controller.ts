import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  Put,
  Query,
} from '@nestjs/common';
import { CommunityService } from './community.service';
import { JwtAuthGuard } from '@/auth/guards/jwt.guard';
import { AuthRequest } from '@/auth/entities/auth.entity';
import { CreateCommunityDto, UpdateCommunityDto } from './dto/community.dto';
import {
  CommunityRoles,
  CommunityRole,
} from './decorators/community-roles.decorator';
import { CommunityRolesGuard } from './guards/community-roles.guard';
import { GoogleAIService } from '@/lib/googleAI/googleAI.service';

@UseGuards(JwtAuthGuard)
@Controller('community')
export class CommunityController {
  constructor(
    private readonly communityService: CommunityService,
    private readonly googleAIService: GoogleAIService
  ) {}

  @Post()
  async createCommunity(
    @Body() createCommunityDto: CreateCommunityDto,
    @Req() req: AuthRequest
  ) {
    const newCommunity = await this.communityService.createCommunity({
      ...createCommunityDto,
      creatorId: req.user.userId,
    });
    return { message: 'Community created', community: newCommunity };
  }

  @Put(':id/member/:userId')
  async addMember(
    @Param('id') communityId: string,
    @Param('userId') userId: string
  ) {
    await this.communityService.addMember(communityId, userId);
    return { message: 'Member added to community' };
  }

  @Delete(':id/member/:userId')
  async removeMember(
    @Param('id') communityId: string,
    @Param('userId') userId: string
  ) {
    await this.communityService.removeMember(communityId, userId);
    return { message: 'Member removed from community' };
  }

  @Put(':id/moderator/:userId')
  async addModerator(
    @Param('id') communityId: string,
    @Param('userId') userId: string
  ) {
    await this.communityService.addModerator(communityId, userId);
    return { message: 'Moderator added to community' };
  }

  @Delete(':id/moderator/:userId')
  async removeModerator(
    @Param('id') communityId: string,
    @Param('userId') userId: string
  ) {
    await this.communityService.removeModerator(communityId, userId);
    return { message: 'Moderator removed from community' };
  }

  @Patch(':id')
  async editCommunity(
    @Param('id') id: string,
    @Body() updateCommunityDto: UpdateCommunityDto
  ) {
    const updatedCommunity = await this.communityService.editCommunity(
      id,
      updateCommunityDto
    );
    return { message: 'Community updated', community: updatedCommunity };
  }

  @Get(':id/members')
  async getCommunityMembers(
    @Param('id') id: string,
    @Query('query') query: string,
    @Query('page') page: number = 0,
    @Query('role') role: string = 'All',
    @Query('limit') limit: number = 25
  ) {
    const members = await this.communityService.getCommunityMembers(
      id,
      query,
      page,
      role,
      limit
    );
    return { members };
  }

  @Get(':id/posts')
  async getCommunityPosts(@Param('id') id: string) {
    const posts = await this.communityService.getCommunityPosts(id);
    return { posts };
  }

  @Post(':id/pin/:postId')
  @UseGuards(CommunityRolesGuard)
  @CommunityRoles(CommunityRole.ADMIN, CommunityRole.MODERATOR)
  async pinPost(
    @Param('id') communityId: string,
    @Param('postId') postId: string
  ) {
    await this.communityService.pinPost(communityId, postId);
    return { message: 'Post pinned successfully' };
  }

  @Post(':id/join')
  @UseGuards(JwtAuthGuard)
  async joinCommunity(
    @Param('id') communityId: string,
    @Req() req: AuthRequest
  ) {
    await this.communityService.joinCommunity(communityId, req.user.userId);
    return { message: 'Joined community successfully' };
  }

  @Post(':id/leave')
  @UseGuards(JwtAuthGuard)
  async leaveCommunity(
    @Param('id') communityId: string,
    @Req() req: AuthRequest
  ) {
    await this.communityService.leaveCommunity(communityId, req.user.userId);
    return { message: 'Left community successfully' };
  }

  @Delete(':id')
  @UseGuards(CommunityRolesGuard)
  @CommunityRoles(CommunityRole.ADMIN)
  async deleteCommunity(@Param('id') id: string) {
    await this.communityService.deleteCommunity(id);
    return { message: 'Community deleted successfully' };
  }

  @Delete(':id/post/:postId')
  @UseGuards(CommunityRolesGuard)
  @CommunityRoles(CommunityRole.ADMIN, CommunityRole.MODERATOR)
  async deletePostFromCommunity(@Param('postId') postId: string) {
    await this.communityService.deletePostFromCommunity(postId);
    return { message: 'Post deleted from community successfully' };
  }

  @Patch(':id/member/:userId/role')
  @UseGuards(CommunityRolesGuard)
  @CommunityRoles(CommunityRole.ADMIN)
  async editMemberRole(
    @Param('id') communityId: string,
    @Param('userId') userId: string,
    @Body('role') newRole: 'MODERATOR' | 'MEMBER'
  ) {
    await this.communityService.editMemberRole(communityId, userId, newRole);
    return { message: `Member role updated to ${newRole}` };
  }

  @Get('search')
  async searchCommunities(@Query('query') query: string) {
    const communities = await this.communityService.searchCommunities(query);
    return { communities };
  }

  @Get('user/community-list')
  async getUserCommunities(@Req() req: AuthRequest) {
    const user = req.user;
    const communities = await this.communityService.getUserCommunityList(
      user.userId
    );
    return { communities };
  }

  @Get('feed/mixed')
  async getMixedFeed(@Query('page') page: number = 0, @Req() req: AuthRequest) {
    const res = await this.communityService.getMixedFeed(req.user.userId, page);
    return { ...res };
  }

  @Get(':id')
  async getCommunity(@Param('id') id: string, @Req() req: AuthRequest) {
    const { community, userRoleInCommunity } =
      await this.communityService.getCommunity(id, req.user.userId);
    return {
      community,
      userRoleInCommunity,
    };
  }
}
