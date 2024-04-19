import {
  Body,
  Controller,
  Get,
  Put,
  Req,
  UseGuards,
  Query,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { Request } from 'express';
import { jwtAuthTokenPayload } from '@/auth/entities/auth.entity';
import { JwtAuthGuard } from '@/auth/guards/jwt.guard';
import { User } from './user.entity';
import { BadRequestException } from '@nestjs/common';

@UseGuards(JwtAuthGuard)
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  async getMe(@Req() req: Request) {
    const user = req.user as jwtAuthTokenPayload;
    const result = await this.userService.getUser({ email: user.email });
    if (!result.user) {
      throw new UnauthorizedException('User not found');
    }
    const res = { ...result.user };
    const { password, auth_provider, ...resProfileUser } = res;
    return {
      user: {
        ...resProfileUser,
      },
    };
  }

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

  @Get('liked-posts')
  async getLikedPosts(@Req() req: Request, @Query('page') page: number = 0) {
    const user = req.user as jwtAuthTokenPayload;
    const result = await this.userService.getLikedPosts(user.userId, page);
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

  @Get('feed')
  async getUserFeed(@Req() req: Request, @Query('page') page: number = 0) {
    const user = req.user as jwtAuthTokenPayload;
    const result = await this.userService.getUserFeed(
      user.userId,
      Number(page)
    );
    return result;
  }
}
