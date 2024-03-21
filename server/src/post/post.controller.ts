import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  UseInterceptors,
  UploadedFiles,
  ParseFilePipe,
  FileTypeValidator,
  MaxFileSizeValidator,
  ParseFilePipeBuilder,
} from '@nestjs/common';
import { PostService } from './post.service';
import { JwtAuthGuard } from '@/auth/guards/jwt.guard';
import { Request } from 'express';
import {
  FileFieldsInterceptor,
  FilesInterceptor,
} from '@nestjs/platform-express';
import { AuthRequest, jwtAuthTokenPayload } from '@/auth/entities/auth.entity';

@UseGuards(JwtAuthGuard)
@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Post('create')
  @UseInterceptors(FilesInterceptor('postimage', 4))
  async createPost(
    @Req() req: AuthRequest,
    @UploadedFiles(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: 'image/*',
        })
        .addMaxSizeValidator({
          maxSize: 4000 * 1000,
          message: 'Max size cannot exceed 4mb',
        })
        .build({ fileIsRequired: false })
      // new ParseFilePipe({
      //   validators: [
      //     new FileTypeValidator({ fileType: 'image/*' }),
      //     new MaxFileSizeValidator({
      //       maxSize: 4000 * 1000,
      //       message: 'Max size cannot exceed 4mb',
      //     }),
      //   ],
      // })
    )
    postimage: Array<Express.Multer.File>,
    @Body() body
  ) {
    const requestUser: jwtAuthTokenPayload = req.user;
    const newPost = await this.postService.createPost({
      requestUser,
      media: postimage,
      caption: body.caption,
    });
    return { message: 'Post created', post: newPost };
    // return await this.postService.createPost()
  }

  @Delete(':postid')
  async deletePost(@Param() params: Request['params']) {
    await this.postService.deletePost(params.postid);
  }

  @Patch('like')
  async likePost(@Body() body: { postId: string }, @Req() req: AuthRequest) {
    const requestUser: jwtAuthTokenPayload = req.user;
    await this.postService.likePost(body.postId, requestUser.userId);
    return { message: 'Post liked' };
  }
}
