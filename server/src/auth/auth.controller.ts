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
  Put,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Request, Response } from 'express';
import { addTimeToCurrentTime } from '@/utils/helpers';
import {
  LocalLoginPayloadDto,
  RegisterLocalPayloadDto,
  RequestResetPasswordDto,
  ResetPasswordDto,
} from './dto/auth.dto';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { GithubAuthGuard } from './guards/github-auth.guard';
import { Neo4jService } from 'nest-neo4j/dist';
import { AuthProvider } from '@/user/user.entity';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private neo4jService: Neo4jService
  ) {}

  @Get('test')
  async testroute() {
    return await this.neo4jService.read('MATCH (n:Person) RETURN n');
  }

  @HttpCode(200)
  @Post('login/local')
  async login(
    @Res({ passthrough: true }) res: Response,
    @Body() authPayload: LocalLoginPayloadDto
  ) {
    const { access_token } =
      await this.authService.validateLocalLogin(authPayload);
    // this.attachAccessToken(res, access_token);
    return { message: 'Logged in successfully', access_token };
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
  @Patch('verify-email')
  async verifyEmail(@Body() { token }: { token: string }) {
    if (!token) throw new BadRequestException('Invalid token provided');
    await this.authService.validateEmailVerificationToken(token);
    return { message: 'Email verified successfully' };
  }

  @Patch('logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    // res.clearCookie('AUTH_ACCESS_TOKEN', {
    //   httpOnly: true,
    //   secure: true, // use secure in production
    //   sameSite: 'strict',
    // });
    return { message: 'Logged out successfully' };
  }

  @Get('check-token')
  async checkToken(@Req() req: Request) {
    const token = req.cookies['AUTH_ACCESS_TOKEN'];
    if (!token) {
      throw new BadRequestException('No token found');
    }
    await this.authService.validateAccessToken(token);
    return { message: 'Token is valid' };
  }

  @Patch('request-reset-password')
  async requestResetPassword(@Body() { email }: RequestResetPasswordDto) {
    await this.authService.sendResetPasswordToken({ email });
    return { msg: 'Email sent' };
  }

  @Patch('reset-password')
  async resetPasword(@Body() { password, token }: ResetPasswordDto) {
    await this.authService.resetUserPasswordWithtoken({
      token,
      password,
    });
    return { message: 'Password reseted' };
  }

  @Get('login/google')
  @UseGuards(GoogleAuthGuard)
  async loginGoogle() {}

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async handleGoogleRedirect(@Req() req: Request, @Res() res: Response) {
    const user = req.user as any;
    const { access_token } = await this.authService.handleSSORegisterORLogin(
      user,
      AuthProvider.GOOGLE
    );
    this.attachAccessToken(req.res, access_token);
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
    const { access_token } = await this.authService.handleSSORegisterORLogin(
      user,
      AuthProvider.GOOGLE
    );
    this.attachAccessToken(req.res, access_token);
    // return { access_token };
    return res.redirect('http://localhost:5173');
  }

  async attachAccessToken(res: Response, refreshToken: string) {
    res.cookie('AUTH_ACCESS_TOKEN', refreshToken, {
      httpOnly: true,
      secure: true, // use secure in production
      sameSite: 'strict',
      maxAge: addTimeToCurrentTime(7, 'days').valueOf(),
      expires: addTimeToCurrentTime(7, 'days'),
    });
  }
}
