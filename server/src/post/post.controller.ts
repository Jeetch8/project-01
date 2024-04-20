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
  ParseFilePipeBuilder,
  Query,
  Put,
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
  }

  @Delete(':postid')
  async deletePost(@Param() params: Request['params']) {
    await this.postService.deletePost(params.postid);
  }

  @Patch(':postid/toggle-like')
  async toggleLikePost(
    @Param() params: Request['params'],
    @Req() req: AuthRequest
  ) {
    const requestUser: jwtAuthTokenPayload = req.user;
    await this.postService.toggleLikePost(params.postid, requestUser.userId);
    return { message: 'Post liked' };
  }

  @Get(':postid/comments')
  async getPostComments(
    @Param('postid') postId: string,
    @Query('page') page: number = 0,
    @Query('limit') limit: number = 10
  ) {
    const result = await this.postService.getPostComments(postId, page, limit);
    return result;
  }

  @Patch(':postId/toggle-bookmark')
  async toggleBookmarkPost(
    @Param('postId') postId: string,
    @Req() req: AuthRequest
  ) {
    const requestUser: jwtAuthTokenPayload = req.user;
    const result = await this.postService.toggleBookmarkPost(
      postId,
      requestUser.userId
    );
    return { message: result };
  }

  @Get(':postId')
  async getPost(@Param('postId') postId: string, @Req() req: AuthRequest) {
    const requestUser: jwtAuthTokenPayload = req.user;
    const result = await this.postService.getPost(postId, requestUser.userId);
    return result;
  }

  @Put(':postId/comment')
  @UseInterceptors(FilesInterceptor('commentimage', 4))
  async commentOnPost(
    @Param('postId') postId: string,
    @Req() req: AuthRequest,
    @Body() body: { comment: string },
    @UploadedFiles(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: 'image/*',
        })
        .addMaxSizeValidator({
          maxSize: 2000 * 1000,
          message: 'Max size cannot exceed 2mb',
        })
        .build({ fileIsRequired: false })
    )
    commentimage: Array<Express.Multer.File>
  ) {
    const requestUser: jwtAuthTokenPayload = req.user;
    const result = await this.postService.commentOnPost({
      postId,
      userId: requestUser.userId,
      comment: body.comment,
      media: commentimage,
    });
    return { message: 'Comment added successfully', post: result };
  }

  @Get('feed')
  async getFeedPosts(
    @Req() req: AuthRequest,
    @Query('page') page: number = 0,
    @Query('limit') limit: number = 10
  ) {
    const requestUser: jwtAuthTokenPayload = req.user;
    const result = await this.postService.getFeedPosts(
      requestUser.userId,
      page,
      limit
    );
    return result;
  }
}
