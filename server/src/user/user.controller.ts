import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { Request } from 'express';
import { jwtAuthTokenPayload } from '@/auth/entities/auth.entity';
import { JwtAuthGuard } from '@/auth/guards/jwt.guard';

@UseGuards(JwtAuthGuard)
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // @Get()
  // async findAllUser(@Query('name') query: string) {
  //   return await this.userService.findAllUsers(query);
  // }

  @Get('me')
  async getMe(@Req() req: Request) {
    const user = req.user as jwtAuthTokenPayload;
    const result = await this.userService.getUser({ email: user.email });
    const resAppUser = result.userTokens;
    const resProfileUser = result.user;
    return {
      user: {
        profile_img: resProfileUser.profile_img,
        id: resAppUser.id,
        first_name: resProfileUser.first_name,
        last_name: resProfileUser.last_name,
        full_name: resProfileUser.full_name,
        email: resProfileUser.email,
        username: resProfileUser.username,
      },
    };
  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.userService.findOne(id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string) {
  //   return this.userService.update(+id);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.userService.remove(+id);
  // }
}
