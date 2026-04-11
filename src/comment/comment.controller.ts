import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { CurrentUser } from 'src/_cores/decorators/current-user.decorator';
import { AuthGuard } from 'src/_cores/guards/auth.guard';
import { ParseObjectIdPipe } from 'src/_cores/pipes/parse-object-id.pipe';
import { TransformDTO } from 'src/_cores/interceptors/transform-dto.interceptor';
import { ResponseCommentDto } from './dto/response-comment.dto';
import { RoleGuard } from 'src/_cores/guards/role.guard';
import { Roles } from 'src/_cores/decorators/role.decorator';

@Controller('comments')
@UseGuards(AuthGuard, RoleGuard)
@TransformDTO(ResponseCommentDto)
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post()
  create(
    @Body() createCommentDto: CreateCommentDto,
    @CurrentUser() currentUser: IUserPayload,
  ) {
    return this.commentService.create(createCommentDto, currentUser);
  }

  @Get('/post/:postId')
  getComments(@Param('postId', ParseObjectIdPipe) postId: string) {
    return this.commentService.getComments(postId);
  }

  @Patch(':id')
  @Roles('admin', 'user')
  update(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() updateCommentDto: UpdateCommentDto,
  ) {
    return this.commentService.update(id, updateCommentDto);
  }

  @Delete(':id')
  @Roles('admin', 'user')
  remove(@Param('id', ParseObjectIdPipe) id: string) {
    return this.commentService.remove(id);
  }
}
