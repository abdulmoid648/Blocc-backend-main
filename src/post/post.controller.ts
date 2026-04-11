import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { AuthGuard } from 'src/_cores/guards/auth.guard';
import { RoleGuard } from 'src/_cores/guards/role.guard';
import { Roles } from 'src/_cores/decorators/role.decorator';
import { TransformDTO } from 'src/_cores/interceptors/transform-dto.interceptor';
import { ResponsePostDto } from './dto/response-post.dto';
import { CurrentUser } from 'src/_cores/decorators/current-user.decorator';
import { ParseObjectIdPipe } from 'src/_cores/pipes/parse-object-id.pipe';
import { UploadMediaDto } from 'src/_cores/globals/dtos';
import { DeleteMediaDto } from './dto/delete-media.dto';
import { AddReactionDto } from './dto/add-reaction.dto';
import { RemoveReactionDto } from './dto/remove-reaction.dto';
import { ResponsePostReactionDto } from './dto/response-post-reaction.dto';
import { ResponseUserWithPostsDto } from './dto/response-user-with-posts.dto';

@Controller('posts')
// @TransformDTO(ResponsePostDto)
@UseGuards(AuthGuard, RoleGuard)
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Post('delete-reaction')
  @TransformDTO(ResponsePostDto)
  deleteReaction(
    @Body() removeReactionDto: RemoveReactionDto,
    @CurrentUser() currentUser: IUserPayload,
  ) {
    return this.postService.removeReaction(removeReactionDto, currentUser);
  }

  @Post()
  @TransformDTO(ResponsePostDto)
  create(
    @Body() createPostDto: CreatePostDto,
    @CurrentUser() currentUser: IUserPayload,
  ) {
    return this.postService.create(createPostDto, currentUser);
  }

  @Post('reaction')
  @TransformDTO(ResponsePostDto)
  addReaction(
    @Body() addReactionDto: AddReactionDto,
    @CurrentUser() currentUser: IUserPayload,
  ) {
    return this.postService.addReaction(addReactionDto, currentUser);
  }

  @Patch(':id/upload')
  @TransformDTO(ResponsePostDto)
  uploadMedia(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() uploadMediaDtos: UploadMediaDto[],
  ) {
    return this.postService.uploadMedia(id, uploadMediaDtos);
  }

  @Patch(':id/replace')
  @TransformDTO(ResponsePostDto)
  replaceMedia(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() uploadMediaDtos: UploadMediaDto[],
  ) {
    return this.postService.replaceMedia(id, uploadMediaDtos);
  }

  @Delete(':id/upload')
  @TransformDTO(ResponsePostDto)
  deleteMedia(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() deleteMediaDto: DeleteMediaDto,
  ) {
    return this.postService.removeMedia(id, deleteMediaDto);
  }

  @Get()
  @TransformDTO(ResponsePostDto)
  findAll(
    @CurrentUser() currentUser: IUserPayload,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('cursor') cursor: string,
    @Query('userId') userId?: string, // 👈 optional userId param
  ) {
    console.log('userId:', userId);
    return this.postService.findAll(userId ?? '', currentUser, limit, cursor);
  }

  @Get(':id/reaction')
  @TransformDTO(ResponsePostReactionDto)
  findOneWithReaction(@Param('id', ParseObjectIdPipe) id: string) {
    return this.postService.findOneWithReaction(id);
  }

  @Get(':id')
  @TransformDTO(ResponsePostDto)
  findOne(
    @Param('id', ParseObjectIdPipe) id: string,
    @CurrentUser() currentUser: IUserPayload,
  ) {
    return this.postService.findOneWithMyReaction(id, currentUser);
  }

  @Patch(':id')
  @Roles('admin', 'user')
  @TransformDTO(ResponsePostDto)
  update(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() updatePostDto: UpdatePostDto,
  ) {
    return this.postService.update(id, updatePostDto);
  }

  @Delete(':id')
  @TransformDTO(ResponsePostDto)
  remove(@Param('id', ParseObjectIdPipe) id: string) {
    return this.postService.remove(id);
  }
  @Get('user/:userId')
  @TransformDTO(ResponseUserWithPostsDto)
  async getPostsByUser(
    @Param('userId', ParseObjectIdPipe) userId: string,
    @CurrentUser() currentUser: IUserPayload,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('cursor') cursor: string,
  ) {
    return await this.postService.findPostsByUser(
      userId,
      currentUser,
      limit,
      cursor,
    );
  }
}
