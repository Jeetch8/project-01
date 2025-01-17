import { MailService } from '@/lib/mail/mail.service';
import { Global, Module } from '@nestjs/common';

const mockMailService = {
  sendEmailVerificationEmail: jest.fn().mockResolvedValueOnce(true),
  sendResetPasswordToken: jest.fn().mockResolvedValueOnce(true),
};

@Global()
@Module({
  providers: [
    {
      provide: MailService,
      useValue: mockMailService,
    },
  ],
  exports: [MailService],
})
class TestModule {}
