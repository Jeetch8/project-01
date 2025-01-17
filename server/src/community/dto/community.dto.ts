import { IsString, IsUrl, IsArray, IsOptional } from 'class-validator';

export class CreateCommunityDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsUrl()
  image: string;

  @IsString()
  rules: string;

  @IsArray()
  @IsOptional()
  moderators?: string[];

  @IsArray()
  @IsOptional()
  members?: string[];
}

export class CreatePostInCommunityDto {
  @IsString()
  caption: string;
}

export class UpdateCommunityDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsUrl()
  @IsOptional()
  image?: string;

  @IsString()
  @IsOptional()
  rules?: string;
}
