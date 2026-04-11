import { Module } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CommentController } from './comment.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Comment, CommentSchema } from './schemas/comment.schema';
import { PostModule } from 'src/post/post.module';
import { UserModule } from 'src/user/user.module';
import { CommentGateway } from './comment.gateway';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Comment.name, schema: CommentSchema }]),
    PostModule,
    UserModule,
  ],
  controllers: [CommentController],
  providers: [CommentService, CommentGateway],
})
export class CommentModule {}
