import {
  Controller,
  Post,
  UseGuards,
  Req,
  Res,
  Body,
  Get,
  BadRequestException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Request, Response } from 'express';
import { addTimeToCurrentTime } from '@/utils/helpers';
import { LocalLoginPayloadDto, RegisterPayloadDto } from './dto/auth.dto';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { app_user, auth_provider } from '@prisma/client';
import { GithubAuthGuard } from './guards/github-auth.guard';

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
      await this.authService.registerUser(registerPayload);
    await this.attachRefreshToken(res, refresh_token);
    return { access_token };
  }

  @Post('logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('refresh_token');
    return { message: 'Logged out successfully' };
  }

  async attachRefreshToken(res: Response, refreshToken: string) {
    res.cookie('AUTH_REFRESH_TOKEN', refreshToken, {
      httpOnly: true,
      secure: true, // use secure in production
      sameSite: 'strict',
      maxAge: addTimeToCurrentTime(7, 'days').valueOf(),
    });
  }

  @Get('login/google')
  @UseGuards(GoogleAuthGuard)
  async loginGoogle(@Req() req: Request) {}

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async handleGoogleRedirect(@Req() req: Request, @Res() res: Response) {
    const user = req.user as any;
    const { refresh_token, access_token } =
      await this.authService.handleSSORegisterORLogin(
        user,
        auth_provider.google
      );
    this.attachRefreshToken(req.res, refresh_token);
    // return { access_token };
    return res.redirect('http://localhost:5173');
  }

  @Get('login/github')
  @UseGuards(GithubAuthGuard)
  async loginGithub(@Req() req: Request) {}

  @Get('github/callback')
  @UseGuards(GithubAuthGuard)
  async handleGithubRedirect(@Req() req: Request, @Res() res: Response) {
    const user = req.user as any;
    if (!user.email) {
      throw new BadRequestException('Github Email is not visible');
    }
    const { refresh_token, access_token } =
      await this.authService.handleSSORegisterORLogin(
        user,
        auth_provider.google
      );
    this.attachRefreshToken(req.res, refresh_token);
    // return { access_token };
    return res.redirect('http://localhost:5173');
  }
}
