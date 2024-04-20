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
} from '@nestjs/common';
import { UserService } from './user.service';
import { Request } from 'express';
import { jwtAuthTokenPayload } from '@/auth/entities/auth.entity';
import { JwtAuthGuard } from '@/auth/guards/jwt.guard';
import { User } from './user.entity';

@UseGuards(JwtAuthGuard)
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Put('profile')
  async updateUser(@Req() req: Request, @Body() body: Partial<User>) {
    const user = req.user as jwtAuthTokenPayload;
    const result = await this.userService.updateUser(user.userId, body);
    return {
      user: {
        ...result,
      },
    };
  }

  @Get()
  async searchUsers(@Query('query') query: string, @Req() req: Request) {
    if (!query) {
      throw new BadRequestException('Search query is required');
    }
    const user = req.user as jwtAuthTokenPayload;
    const participants = await this.userService.getParticipantByName(
      query,
      user.userId
    );
    return { users: participants };
  }

  @Get('posts')
  async getUserPosts(@Req() req: Request, @Query('page') page: number = 0) {
    const user = req.user as jwtAuthTokenPayload;
    const result = await this.userService.getUserPosts(user.userId, page);
    return result;
  }

  @Get('bookmarks')
  async getBookmarkedPosts(
    @Req() req: Request,
    @Query('page') page: number = 0
  ) {
    const user = req.user as jwtAuthTokenPayload;
    const result = await this.userService.getBookmarkedPosts(user.userId, page);
    return result;
  }

  @Patch('follow')
  async followUser(
    @Req() req: Request,
    @Body('userId') userIdToFollow: string
  ) {
    const user = req.user as jwtAuthTokenPayload;

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

  @Get(':username')
  async getUser(@Req() req: Request, @Param('username') username: string) {
    let result;
    if (username === 'me') {
      const user = req.user as jwtAuthTokenPayload;
      result = await this.userService.getUser({ email: user.email });
      if (!result.user) {
        throw new UnauthorizedException('User not found');
      }
    } else {
      result = await this.userService.getUser({ username });
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
    };
  }

  @Get(':username/liked-posts')
  async getLikedPosts(
    @Req() req: Request,
    @Param('username') username?: string,
    @Query('page') page: number = 0
  ) {
    const user = req.user as jwtAuthTokenPayload;
    const result = await this.userService.getLikedPosts(
      user.userId,
      username,
      page
    );
    return result;
  }

  @Get(':username/feed')
  async getUserFeed(
    @Req() req: Request,
    @Param('username') username?: string,
    @Query('page') page: number = 0
  ) {
    const user = req.user as jwtAuthTokenPayload;
    const result = await this.userService.getUserFeed(
      user.userId,
      username,
      Number(page)
    );
    return result;
  }
}
