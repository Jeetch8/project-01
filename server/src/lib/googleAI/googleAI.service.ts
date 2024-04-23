import { Injectable } from '@nestjs/common';
import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';

@Injectable()
export class GoogleAIService {
  private googleGenerativeAI: GoogleGenerativeAI;
  private textEmbeddingModel: GenerativeModel;

  constructor() {
    this.googleGenerativeAI = new GoogleGenerativeAI(
      process.env.GOOGLE_GENERATIVE_AI_API_KEY
    );
    this.textEmbeddingModel = this.googleGenerativeAI.getGenerativeModel({
      model: 'text-embedding-004',
    });
  }

  async getEmbedding(text: string): Promise<number[]> {
    const embedding = await this.textEmbeddingModel.embedContent(text);
    return embedding.embedding.values;
  }
}
