import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Story, StoryDocument } from './schemas/story.schema';
import { CreateStoryDto } from './dto/create-story.dto';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { UserDocument } from 'src/user/schemas/user.schema';

@Injectable()
export class StoryService {
  constructor(
    @InjectModel(Story.name) private storyModel: Model<StoryDocument>,
    private cloudinaryService: CloudinaryService,
  ) {}

  async createStory(
    user: UserDocument,
    createStoryDto: CreateStoryDto,
    file?: Express.Multer.File,
  ): Promise<Story> {
    if (!file && !createStoryDto.sharedPostId && !createStoryDto.caption) {
      throw new BadRequestException('Story must contain either media, a shared post, or text caption.');
    }

    let media: any[] = [];
    if (file) {
      const uploadResult = await this.cloudinaryService.uploadFile(file);
      media = [{
        url: uploadResult.secure_url,
        type: file.mimetype.startsWith('video') ? 'video' : 'image',
      }];
    }

    let backgroundGradient = ['#a18cd1', '#fbc2eb']; // Default gradient
    if (createStoryDto.backgroundGradient) {
      try {
        backgroundGradient = JSON.parse(createStoryDto.backgroundGradient);
      } catch (e) {
        backgroundGradient = createStoryDto.backgroundGradient.split(',').map((c) => c.trim());
      }
    }

    const storyData: Partial<Story> = {
      author: user._id as any,
      media: media.length > 0 ? media : undefined,
      caption: createStoryDto.caption,
      sharedPost: createStoryDto.sharedPostId as any,
      backgroundGradient,
    };

    const newStory = new this.storyModel(storyData);
    return newStory.save();
  }

  async getFeed(userId: string): Promise<any[]> {
    // Standard implementation: Fetch active stories and populate authors
    // The TTL index will auto-delete expired stories directly from the DB,
    // so we just fetch all existing stories (since indexing applies dynamically)
    const stories = await this.storyModel
      .find()
      .populate('author', 'name avatarUrl username')
      .populate({
         path: 'sharedPost',
         populate: { path: 'author', select: 'name avatarUrl' }
      })
      .sort({ createdAt: -1 })
      .exec();
    
    return stories;
  }
}
