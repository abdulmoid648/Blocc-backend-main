import { Global, Module } from '@nestjs/common';
import { ResourceService } from './resource.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Post, PostSchema } from 'src/post/schemas/post.schema';
import { User, UserSchema } from 'src/user/schemas/user.schema';
import { Comment, CommentSchema } from 'src/comment/schemas/comment.schema';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Post.name, schema: PostSchema },
      { name: User.name, schema: UserSchema },
      { name: Comment.name, schema: CommentSchema },
    ]),
  ],
  providers: [ResourceService],
  exports: [ResourceService],
})
export class ResourceModule {}
