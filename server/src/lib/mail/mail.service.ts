import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  private async sendEmail(
    to: string,
    subject: string,
    text: string,
    html: string
  ) {
    await this.mailerService.sendMail({
      to,
      subject,
      text,
      html,
    });
  }

  async sendEmailVerificationEmail(to: string, token: string) {
    const subject = 'Verify your email';
    const text = `Click on the link to verify your email: ${token}`;
    const html = `<a href="${process.env.FRONTEND_URL}/verify-email?token=${token}">Click here to verify your email</a>`;
    await this.sendEmail(to, subject, text, html);
  }

  async sendResetPasswordToken(to: string, token: string) {
    const subject = 'Password request request';
    const text = `Click on the link to reset password: ${token}`;
    const html = `<a href="${process.env.FRONTEND_URL}/password-reset?token=${token}">Click here to verify your email</a>`;
    await this.sendEmail(to, subject, text, html);
  }
}
