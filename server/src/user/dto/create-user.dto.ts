import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsJWT,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
} from 'class-validator';
import { auth_provider as AuthProvider, gender } from '@prisma/client';

export class UserProfileDto {
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

  @IsEnum(gender, { message: 'Gender is required' })
  gender?: gender;
}

export class AppUserDto {
  @IsEmail({}, { message: 'email is required' })
  email: string;

  @IsString({ message: 'password is required' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/,
    {
      message: 'Password is too weak',
    }
  )
  password: string;

  auth_provider: AuthProvider;
}

// export class CreateUserDto {
//   @IsString({ message: 'first_name is required' })
//   first_name: string;

//   @IsString({ message: 'last_name is required' })
//   last_name: string;

//   @IsString({ message: 'username is required' })
//   username: string;

//   @IsDateString({}, { message: 'date_of_birth is required' })
//   date_of_birth: string;

//   @IsString()
//   @IsOptional()
//   profile_img?: string;

//   @IsString()
//   @IsOptional()
//   banner_img?: string;

//   @IsEmail({}, { message: 'email is required' })
//   email: string;

//   @IsString({ message: 'password is required' })
//   @Matches(
//     /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/,
//     {
//       message: 'Password is too weak',
//     }
//   )
//   password: string;

//   @IsString()
//   provider: string;
// }

// export class CreateTempUserDto {
//   @IsString({ message: 'first_name is required' })
//   first_name: string;

//   @IsString({ message: 'last_name is required' })
//   last_name: string;

//   @IsDateString({}, { message: 'date_of_birth is required' })
//   date_of_birth: string;

//   @IsEmail()
//   email: string;

//   @IsJWT()
//   email_verification_token: string;
// }
