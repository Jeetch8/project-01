import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-github2';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(configService: ConfigService) {
    super({
      clientID: configService.getOrThrow('GITHUB_AUTH_CLIENT_ID'),
      clientSecret: configService.getOrThrow('GITHUB_AUTH_CLIENT_SECRET'),
      callbackURL: configService.getOrThrow('GITHUB_AUTH_REDIRECT_URI'),
      scope: ['read:user', 'read:email'],
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: any,
    done: VerifyCallback
  ) {
    console.log(profile, _accessToken, _refreshToken);
    const { name, email, avatar_url, gender } = profile._json;
    const nameArr = name.trim().split(' ');
    const user = {
      first_name: nameArr[0],
      last_name: nameArr[1],
      email,
      profile_img: avatar_url,
      gender,
    };
    done(null, user);
  }
}
