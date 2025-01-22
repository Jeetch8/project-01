import {
  Body,
  Controller,
  Get,
  Put,
  Req,
  UseGuards,
  Query,
  UnauthorizedException,
  Patch,
  BadRequestException,
  Param,
  NotFoundException,
  Delete,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import { Request } from 'express';
import { AuthRequest, jwtAuthTokenPayload } from '@/auth/entities/auth.entity';
import { JwtAuthGuard } from '@/auth/guards/jwt.guard';
import {
  ChangePasswordDto,
  UpdateAccountInfoDto,
  UpdateProfileDto,
} from './user.dto';
import { AttachUserToRequest } from '@/auth/Interceptors/AttachUserToRequest.decorator';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('search')
  async searchUsers(@Query('query') query: string, @Req() req: AuthRequest) {
    if (!query) {
      throw new BadRequestException('Search query is required');
    }
    const users = await this.userService.searchUser(query);
    return { users };
  }

  @Put('profile')
  async updateUser(@Req() req: AuthRequest, @Body() body: UpdateProfileDto) {
    const user = req.user;
    const result = await this.userService.updateUser(user.userId, body);
    return {
      user: {
        ...result,
      },
    };
  }

  @Get('who-to-follow')
  @UseGuards(JwtAuthGuard)
  async getWhoToFollow(@Req() req: AuthRequest) {
    const user = req.user;
    const result = await this.userService.getWhoToFollow(user.userId);
    return { users: result };
  }

  @Patch('account-info')
  @UseGuards(JwtAuthGuard)
  async updateAccountInfo(
    @Req() req: AuthRequest,
    @Body() body: UpdateAccountInfoDto
  ) {
    const user = req.user;
    const result = await this.userService.updateAccountInfo(user.userId, body);
    return {
      user: result,
    };
  }

  @Patch('change-password')
  @UseGuards(JwtAuthGuard)
  async changePassword(
    @Req() req: AuthRequest,
    @Body() body: ChangePasswordDto
  ) {
    const user = req.user;
    const result = await this.userService.changePassword(user.userId, body);
    return {
      user: { ...result },
    };
  }

  @Get('bookmarks')
  @UseGuards(JwtAuthGuard)
  async getBookmarkedPosts(
    @Req() req: AuthRequest,
    @Query('page') page: number = 0
  ) {
    const user = req.user;
    const result = await this.userService.getBookmarkedPosts(user.userId, page);
    return result;
  }

  @Patch('follow')
  @UseGuards(JwtAuthGuard)
  async followUser(
    @Req() req: AuthRequest,
    @Body('userId') userIdToFollow: string
  ) {
    const user = req.user;

    if (!userIdToFollow) {
      throw new BadRequestException('User ID to follow is required');
    }

    const result = await this.userService.followUser(
      user.userId,
      userIdToFollow
    );

    if (result) {
      return { message: 'User followed successfully' };
    } else {
      throw new BadRequestException('Unable to follow user');
    }
  }

  @Patch('unfollow')
  @UseGuards(JwtAuthGuard)
  async unfollowUser(
    @Req() req: AuthRequest,
    @Body('userId') userIdToUnfollow: string
  ) {
    const user = req.user;

    if (!userIdToUnfollow) {
      throw new BadRequestException('User ID to unfollow is required');
    }

    const result = await this.userService.unfollowUser(
      user.userId,
      userIdToUnfollow
    );

    if (result) {
      return { message: 'User unfollowed successfully' };
    } else {
      throw new BadRequestException('Unable to unfollow user');
    }
  }

  @Delete('deactivate')
  @UseGuards(JwtAuthGuard)
  async deactivateAccount(@Req() req: Request) {
    const user = req.user as jwtAuthTokenPayload;
    const result = await this.userService.deactivateAccount(user.userId);
    return { message: 'User deactivated successfully' };
  }

  @Get('sessions')
  @UseGuards(JwtAuthGuard)
  async getUserSessions(@Req() req: Request) {
    const user_ip = req.ip;
    const user = req.user as jwtAuthTokenPayload;
    const sessions = await this.userService.getUserSessions(user.userId);
    return { sessions, user_ip };
  }

  @Get('home/feed')
  async getUserHomeFeed(
    @Req() req: AuthRequest,
    @Query('page') page: number = 0
  ) {
    const requestUser: jwtAuthTokenPayload = req.user;
    const isAuthenticated = !!requestUser;

    const result = await this.userService.getUserHomeFeed(
      isAuthenticated ? requestUser.userId : null,
      page
    );
    return result;
  }

  @Get(':username')
  @UseInterceptors(AttachUserToRequest)
  async getUser(@Req() req: AuthRequest, @Param('username') username: string) {
    let result;
    const user = req.user;
    if (username === 'me') {
      result = await this.userService.getUser(
        { email: user.email },
        user.userId
      );
      if (!result.user) {
        throw new UnauthorizedException('User not found');
      }
    } else {
      result = await this.userService.getUser({ username }, user.userId);
      if (!result.user) {
        throw new NotFoundException('User not found');
      }
    }
    const res = { ...result.user };
    const { password, auth_provider, ...resProfileUser } = res;
    return {
      user: {
        ...resProfileUser,
      },
      doesFollow: result.doesFollow,
    };
  }

  @Get(':username/liked-posts')
  async getLikedPosts(
    @Param('username') username?: string,
    @Query('page') page: number = 0
  ) {
    if (!username) {
      throw new BadRequestException('Username is required');
    }
    const result = await this.userService.getLikedPosts(username, page);
    return result;
  }

  @Get(':username/posts')
  async getUserPosts(
    @Query('page') page: number = 0,
    @Param('username') username: string
  ) {
    if (!username) {
      throw new BadRequestException('Username is required');
    }
    const result = await this.userService.getUserPosts(username, page);
    return result;
  }

  @Get(':username/media')
  async getUserCreatedPostMedia(
    @Query('page') page: number = 0,
    @Param('username') username: string
  ) {
    if (!username) {
      throw new BadRequestException('Username is required');
    }
    const result = await this.userService.getUserCreatedPostMedia(
      username,
      page
    );
    return result;
  }
}
