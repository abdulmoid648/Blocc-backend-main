import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { StoryService } from './story.service';
import { CreateStoryDto } from './dto/create-story.dto';
import { AuthGuard } from 'src/_cores/guards/auth.guard';
import { RoleGuard } from 'src/_cores/guards/role.guard';
import { CurrentUser } from 'src/_cores/decorators/current-user.decorator';

@Controller('stories')
@UseGuards(AuthGuard, RoleGuard)
export class StoryController {
  constructor(private readonly storyService: StoryService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  create(
    @UploadedFile() file: Express.Multer.File,
    @Body() createStoryDto: CreateStoryDto,
    @CurrentUser() currentUser: any, // Use mapped user object from AuthGuard
  ) {
    return this.storyService.createStory(currentUser, createStoryDto, file);
  }

  @Get('feed')
  getFeed(@CurrentUser() currentUser: any) {
    return this.storyService.getFeed(currentUser._id);
  }
}
