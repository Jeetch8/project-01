import { IsString, IsNotEmpty, IsOptional, IsArray } from 'class-validator';
import { jwtAuthTokenPayload } from '@/auth/entities/auth.entity';

export class CreatePostDto {
  @IsString()
  @IsNotEmpty()
  caption: string;

  @IsArray()
  @IsOptional()
  media?: Express.Multer.File[];

  @IsString()
  @IsNotEmpty()
  audience: string;
}

export class ToggleLikeDto {
  @IsString()
  @IsNotEmpty()
  postId: string;
}

export class CommentOnPostDto {
  @IsString()
  @IsNotEmpty()
  postId: string;

  @IsString()
  @IsNotEmpty()
  comment: string;

  @IsArray()
  @IsOptional()
  media?: Express.Multer.File[];
}

export class CreatePostPayload {
  caption: string;
  media: (string | Express.Multer.File)[];
  requestUser: jwtAuthTokenPayload;
  audience: string;
}
