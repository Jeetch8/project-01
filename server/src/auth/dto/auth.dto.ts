import {
  IsDateString,
  IsEnum,
  IsJWT,
  IsString,
  IsStrongPassword,
  IsUrl,
  Matches,
  ValidateIf,
} from 'class-validator';
import { emailRegex, passwordRegex } from '@/utils/Regex';
import { auth_provider, gender } from '@prisma/client';
import { OmitType, PickType } from '@nestjs/mapped-types';

export class LocalLoginPayloadDto {
  @Matches(emailRegex, { message: 'Invalid email' })
  email: string;

  @Matches(passwordRegex, {
    message:
      'Password should have 1 number, 1 symbol, 1 lowercase and uppercase letter',
  })
  password: string;
}

export class RegisterPayloadDto {
  @Matches(emailRegex, { message: 'Invalid email' })
  email: string;

  @Matches(passwordRegex, {
    message:
      'Password should have 1 number, 1 symbol, 1 lowercase and uppercase letter',
  })
  password: string;

  @IsString({ message: 'First name is invalid' })
  first_name: string;

  @IsString({ message: 'Last naem is invalid' })
  last_name: string;

  @IsDateString({}, { message: 'Date of birth is invalid' })
  date_of_birth?: string;

  @IsUrl({}, { message: 'Profile image is not valid' })
  profile_img: string;

  @IsEnum(auth_provider, { message: 'Invalid auth provider' })
  auth_provider: auth_provider;

  @IsEnum(gender, { message: 'Gender is required' })
  gender?: gender;
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

  @ValidateIf((o) => o.password === o.confirmPassword, {message:"Passwords are not equal"})
  confirmPassword: string;

  @IsJWT()
  token: string;
}
