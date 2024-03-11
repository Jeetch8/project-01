import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { AppUserDto, UserProfileDto } from './dto/create-user.dto';
import { PrismaService } from '@/prisma.service';
import { handlePrismaError } from '@/utils/prisma-error-handler';
import { app_user } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(private prismaService: PrismaService) {}

  async create_app_user(
    { email, password, auth_provider }: AppUserDto,
    user_profile_id: string
  ) {
    return handlePrismaError(() =>
      this.prismaService.app_user.create({
        data: {
          email: email.toLowerCase(),
          password,
          user_profile_id,
          auth_provider,
        },
      })
    );
  }

  async findUser({ email, userId }: { email?: string; userId?: string }) {
    let app_user = email
      ? await this.findOneAppUserByEmail(email)
      : await this.findOneAppUser(userId);
    if (!app_user) throw new NotFoundException('User not found');
    let user_profile = await this.findUserProfileById(app_user.user_profile_id);
    return { app_user, user_profile };
  }

  async create_user_profile({
    first_name,
    last_name,
    date_of_birth,
    gender,
    profile_img,
  }: UserProfileDto) {
    const res = await this.prismaService.user_profile.create({
      data: {
        username: await this.generate_unique_username(first_name, last_name),
        full_name: first_name + ' ' + last_name,
        first_name,
        last_name,
        profile_img,
      },
    });
    return res;
  }

  async findAllUsers(query: string) {
    return this.prismaService.user_profile.findMany({
      // where: {
      //   username: {
      //     contains: query,
      //   },
      //   full_name: {
      //     contains: query,
      //   },
      // },
    });
  }

  async is_username_unique(username: string) {
    const check_username = await this.prismaService.user_profile.findUnique({
      where: {
        username,
      },
    });
    return check_username ? false : true;
  }

  async generate_unique_username(first_name: string, last_name: string) {
    let temp_username =
      first_name + last_name + Math.random().toString(36).substring(2, 7);
    while (!this.is_username_unique(temp_username)) {
      const random_number =
        first_name + last_name + Math.random().toString(36).substring(2, 7);
      temp_username = temp_username + random_number;
    }
    return temp_username;
  }

  findOneAppUser(id: string) {
    return this.prismaService.app_user.findUnique({
      where: {
        id,
      },
    });
  }

  async findOneAppUserByEmail(email: string) {
    return await this.prismaService.app_user.findUnique({
      where: {
        email: email.toLowerCase(),
      },
    });
  }

  async findUserProfileById(id: string) {
    return await this.prismaService.user_profile.findUnique({
      where: {
        id,
      },
    });
  }

  async updateAppUser(id: string, data: Partial<app_user>) {
    return await handlePrismaError(() =>
      this.prismaService.app_user.update({
        where: {
          id,
        },
        data,
      })
    );
  }

  async tempService() {
    return 'somethign';
  }
}
