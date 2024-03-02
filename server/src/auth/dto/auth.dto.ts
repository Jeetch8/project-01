import { IsDateString, IsString, IsUrl, Matches } from 'class-validator';
import { emailRegex, passwordRegex } from '@/utils/Regex';

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
  date_of_birth: string;

  @IsUrl({}, { message: 'Profile image is not valid' })
  profile_img: string;
}
