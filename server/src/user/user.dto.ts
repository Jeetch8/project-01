import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsJWT,
  IsString,
  IsUrl,
  Matches,
} from 'class-validator';
import { AuthProvider, Gender } from './user.entity';
import { PickType } from '@nestjs/mapped-types';

export class UserAuthDto {
  @IsString({ message: 'password is required' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/,
    {
      message: 'Password is too weak',
    }
  )
  password: string;

  @IsEnum(AuthProvider)
  auth_provider: AuthProvider;

  @IsJWT()
  forgot_password_token?: string;

  @IsDateString()
  forgot_password_token_expiry?: string;

  @IsJWT()
  email_verification_token?: string;

  @IsDateString()
  email_verification_expiry?: string;
}

export class UserDto {
  @IsString({ message: 'first_name is required' })
  first_name: string;

  @IsString({ message: 'last_name is required' })
  last_name: string;

  @IsString({ message: 'username is required' })
  username: string;

  @IsDateString({}, { message: 'date_of_birth is required' })
  date_of_birth?: string;

  @IsUrl()
  profile_img: string;

  @IsEnum(Gender, { message: 'Gender is required' })
  gender?: Gender;

  @IsEmail({}, { message: 'email is required' })
  email: string;

  @IsString()
  bio?: string;

  @IsUrl()
  banner_img?: string;

  @IsString()
  location?: string;
}

export class UpdateProfileDto extends PickType(UserDto, [
  'first_name',
  'last_name',
  'date_of_birth',
  'gender',
  'profile_img',
  'bio',
  'banner_img',
]) {}

export class UpdateAccountInfoDto extends PickType(UserDto, [
  'username',
  'email',
  'gender',
  'date_of_birth',
  'location',
]) {}

export class ChangePasswordDto {
  @IsString({ message: 'old password is required' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/,
    {
      message: 'Password is too weak',
    }
  )
  password: string;

  @IsString({ message: 'new_password is required' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/,
    {
      message: 'Password is too weak',
    }
  )
  new_password: string;
}
