import {
  Controller,
  Post,
  UseGuards,
  Req,
  Res,
  Body,
  Get,
  BadRequestException,
  HttpCode,
  Patch,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Request, Response } from 'express';
import { addTimeToCurrentTime } from '@/utils/helpers';
import {
  LocalLoginPayloadDto,
  RegisterLocalPayloadDto,
  RegisterPayloadDto,
  RequestResetPasswordDto,
  ResetPasswordDto,
} from './dto/auth.dto';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { auth_provider } from '@prisma/client';
import { GithubAuthGuard } from './guards/github-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(200)
  @Post('login/local')
  async login(
    @Res({ passthrough: true }) res: Response,
    @Body() authPayload: LocalLoginPayloadDto
  ) {
    const { access_token, refresh_token } =
      await this.authService.validateLocalLogin(authPayload);
    this.attachRefreshToken(res, refresh_token);
    return { access_token };
  }

  @Post('register/local')
  async register(
    @Res({ passthrough: true }) res: Response,
    @Body() registerPayload: RegisterLocalPayloadDto
  ) {
    await this.authService.registerLocalUser(registerPayload);
    return { message: 'user registered' };
  }

  @HttpCode(200)
  @Post('verify-email')
  async verifyEmail(@Body() { token }: { token: string }) {
    if (!token) throw new BadRequestException('Invalid token provided');
    await this.authService.validateEmailVerificationToken(token);
    return { message: 'Email verified successfully' };
  }

  @Patch('logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('AUTH_REFRESH_TOKEN', {
      httpOnly: true,
      secure: true, // use secure in production
      sameSite: 'strict',
    });
    return { message: 'Logged out successfully' };
  }

  @Patch('request-reset-password')
  async requestResetPassword(@Body() { email }: RequestResetPasswordDto) {
    await this.authService.sendResetPasswordToken({ email });
    return { msg: 'Email sent' };
  }

  @Post('reset-password')
  async resetPasword(@Body() { password, token }: ResetPasswordDto) {
    const res = await this.authService.resetUserPasswordWithtoken({
      token,
      password,
    });
  }

  @Get('login/google')
  @UseGuards(GoogleAuthGuard)
  async loginGoogle() {}

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

  async attachRefreshToken(res: Response, refreshToken: string) {
    res.cookie('AUTH_REFRESH_TOKEN', refreshToken, {
      httpOnly: true,
      secure: true, // use secure in production
      sameSite: 'strict',
      maxAge: addTimeToCurrentTime(7, 'days').valueOf(),
      expires: addTimeToCurrentTime(7, 'days'),
    });
  }
}
