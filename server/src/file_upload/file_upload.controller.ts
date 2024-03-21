import {
  Body,
  Controller,
  MaxFileSizeValidator,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileUploadService } from './file_upload.service';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';

@Controller('file-upload')
export class FileUploadController {
  constructor(private readonly fileUploadService: FileUploadService) {}

  @Post()
  @UseInterceptors(FilesInterceptor('files'))
  async uploadFile(
    @UploadedFiles()
    files: Express.Multer.File[],
    @Body() body: any,
  ) {
    return { fileLength: files.length, body: body };
    // await this.fileUploadService.upload(file.originalname, file.buffer);
  }
}
