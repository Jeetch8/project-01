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
import { FilesInterceptor } from '@nestjs/platform-express';
import { AuthRequest, jwtAuthTokenPayload } from '@/auth/entities/auth.entity';

@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Get('search')
  async searchPosts(
    @Query('query') query: string,
    @Query('page') page: number = 0,
    @Query('limit') limit: number = 20
  ) {
    const result = await this.postService.searchPosts(query, page, limit);
    return result;
  }

  @Post('create')
  @UseGuards(JwtAuthGuard)
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
      audience: body.audience,
    });
    return { message: 'Post created', post: newPost };
  }

  @Delete(':postid')
  @UseGuards(JwtAuthGuard)
  async deletePost(@Param() params: Request['params']) {
    await this.postService.deletePost(params.postid);
  }

  @Patch(':postid/toggle-like')
  @UseGuards(JwtAuthGuard)
  async toggleLikePost(
    @Param() params: Request['params'],
    @Req() req: AuthRequest
  ) {
    const requestUser: jwtAuthTokenPayload = req.user;
    await this.postService.toggleLikePost(params.postid, requestUser.userId);
    return { message: 'Post liked' };
  }

  @Get(':postId')
  async getPost(@Param('postId') postId: string, @Req() req: AuthRequest) {
    const requestUser: jwtAuthTokenPayload = req.user;
    const result = await this.postService.getPost(postId, requestUser.userId);
    return result;
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
  @UseGuards(JwtAuthGuard)
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

  @Put(':postId/comment')
  @UseGuards(JwtAuthGuard)
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

  @Get('trending-post')
  async getTredingPosts() {
    const result = await this.postService.getTrendingPost();
    return { posts: result };
  }
}
