import { Injectable } from '@nestjs/common';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FileUploadService {
  private readonly s3Client = new S3Client({
    region: this.configService.get('AWS_S3_REGION'),
    credentials: {
      accessKeyId: this.configService.get('AWS_S3_ACCESS_KEY_ID'),
      secretAccessKey: this.configService.get('AWS_S3_SECRET_ACCESS_KEY'),
    },
  });

  constructor(private readonly configService: ConfigService) {}

  // async upload(files: { fileName: string; file: Buffer }[]) {
  //   for (const { fileName, file } of files) {
  //     await this.s3Client.send(
  //       new PutObjectCommand({
  //         Bucket: this.configService.get('AWS_S3_BUCKET'),
  //         Key: fileName,
  //         Body: file,
  //       }),
  //     );
  //   }
  // }
}
