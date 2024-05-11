import { Module } from '@nestjs/common';
import { GoogleAIService } from './googleAI.service';

@Module({
  providers: [GoogleAIService],
  exports: [GoogleAIService],
})
export class GoogleAIModule {}
