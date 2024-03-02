import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { AppUserDto, UserProfileDto } from './dto/create-user.dto';
import { PrismaService } from '@/prisma.service';
import { Neo4jService } from 'nest-neo4j/dist';
import { handlePrismaError } from '@/utils/prisma-error-handler';

@Injectable()
export class UserService {
  constructor(
    private prismaService: PrismaService,
    private neo4jService: Neo4jService
  ) {}

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

  async findByEmail(email: string) {
    return await this.prismaService.app_user.findUnique({
      where: {
        email: email.toLowerCase(),
      },
    });
  }

  async create_user_profile({
    first_name,
    last_name,
    username,
    date_of_birth,
    profile_img,
    email,
  }: UserProfileDto) {
    const res = await this.prismaService.user_profile.create({
      data: {
        first_name,
        last_name,
        full_name: first_name + ' ' + last_name,
        username,
        date_of_birth: date_of_birth,
        profile_img,
        email,
      },
    });
    await this.neo4jService.write(
      `CREATE (u:User {id: "${res.id}", full_name: "${res.full_name}"})`
    );
    return res;
  }

  async findAllUsers(query: string) {
    return this.prismaService.user_profile.findMany({
      where: {
        username: {
          contains: query,
        },
        full_name: {
          contains: query,
        },
      },
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

  findOne(id: string) {
    return this.prismaService.user_profile.findUnique({
      where: {
        id,
      },
    });
  }

  findOneAppUser(id: string) {
    return this.prismaService.app_user.findUnique({
      where: {
        id,
      },
    });
  }

  findOneAppUserByEmail(email: string) {
    return this.prismaService.app_user.findUnique({
      where: {
        email: email.toLowerCase(),
      },
    });
  }

  update(id: number) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
