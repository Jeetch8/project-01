import { Controller, Post, UseGuards, Req, Res, Body } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { Response } from 'express';
import { addTimeToCurrentTime } from '@/utils/helpers';
import { LocalLoginPayloadDto, RegisterPayloadDto } from './dto/auth.dto';
import { LocalAuthGuard } from './guards/local_strategy.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login/local')
  // @UseGuards(LocalAuthGuard)
  async login(@Res() res: Response, @Body() authPayload: LocalLoginPayloadDto) {
    const { accessToken, refreshToken } =
      await this.authService.validateLocalLogin(authPayload);
    this.attachRefreshToken(res, refreshToken);
    return { accessToken };
  }

  @Post('register/local')
  async register(
    @Res() res: Response,
    @Body() registerPayload: RegisterPayloadDto
  ) {
    const { access_token, refresh_token } =
      await this.authService.registerUserLocal(registerPayload);
    await this.attachRefreshToken(res, refresh_token);
    return { access_token };
  }

  @Post('logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('refresh_token');
    return { message: 'Logged out successfully' };
  }

  async attachRefreshToken(res: Response, refreshToken: string) {
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: true, // use secure in production
      sameSite: 'strict',
      maxAge: addTimeToCurrentTime(7, 'days').valueOf(),
    });
  }
}
