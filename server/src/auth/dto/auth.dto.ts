import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsJWT,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
  IsUrl,
  Matches,
  ValidateIf,
} from 'class-validator';
import { emailRegex, passwordRegex } from '@/utils/Regex';
import { OmitType } from '@nestjs/mapped-types';
import { AuthProvider, Gender } from '@/user/user.entity';

export class LocalLoginPayloadDto {
  @IsEmail({}, { message: 'Invalid email' })
  email: string;

  @Matches(passwordRegex, {
    message:
      'Password should have 1 number, 1 symbol, 1 lowercase and uppercase letter',
  })
  password: string;
}

export class RegisterPayloadDto {
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Invalid email' })
  email: string;

  @IsNotEmpty({ message: 'Password is required' })
  @Matches(passwordRegex, {
    message:
      'Password should have 1 number, 1 symbol, 1 lowercase and uppercase letter',
  })
  password: string;

  @IsNotEmpty({ message: 'First name is required' })
  @IsString({ message: 'First name is invalid' })
  first_name: string;

  @IsNotEmpty({ message: 'Last name is required' })
  @IsString({ message: 'Last naem is invalid' })
  last_name: string;

  @IsDateString({}, { message: 'Date of birth is invalid' })
  date_of_birth?: string;

  @IsNotEmpty({ message: 'Username is required' })
  @IsUrl({}, { message: 'Profile image is not valid' })
  profile_img: string;

  @IsEnum(AuthProvider, { message: 'Invalid auth provider' })
  auth_provider: AuthProvider;

  @IsEnum(Gender, { message: 'Gender is required' })
  gender?: Gender;
}

export class RegisterLocalPayloadDto extends OmitType(RegisterPayloadDto, [
  'auth_provider',
] as const) {}

export class RegisterSSOPayloadDto extends OmitType(RegisterPayloadDto, [
  'password',
  'auth_provider',
]) {}

export class ResetPasswordDto {
  @IsStrongPassword(
    {
      minLength: 8,
      minLowercase: 1,
      minNumbers: 1,
      minSymbols: 1,
      minUppercase: 1,
    },
    { message: 'Password is not strong' }
  )
  password: string;

  @ValidateIf((o) => o.password === o.confirmPassword, {
    message: 'Passwords are not equal',
  })
  confirmPassword: string;

  @IsJWT()
  token: string;
}

export class RequestResetPasswordDto {
  @IsEmail({}, { message: 'Invalid email' })
  email: string;
}
