import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Comment } from 'src/comment/schemas/comment.schema';
import { Post } from 'src/post/schemas/post.schema';
import { User } from 'src/user/schemas/user.schema';

@Injectable()
export class ResourceService {
  // Inject all model of this application
  constructor(
    @InjectModel(Post.name) private postModel: Model<Post>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Comment.name) private commentModel: Model<Comment>,
  ) {}

  async getResource(resourceType: string, resourceId: string) {
    switch (resourceType) {
      case 'users': {
        const user = await this.userModel.findById(resourceId);
        if (!user) throw new NotFoundException('User not found');
        return user._id.toString();
      }
      case 'posts': {
        const post = await this.postModel.findById(resourceId);
        if (!post) throw new NotFoundException('Post not found');
        return post.author._id.toString();
      }
      case 'comments': {
        const comment = await this.commentModel.findById(resourceId);
        if (!comment) throw new NotFoundException('Comment not found');
        return comment.userComment._id.toString();
      }

      default:
        throw new Error('Resource not found');
    }
  }
}
