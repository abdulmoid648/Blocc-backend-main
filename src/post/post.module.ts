import { Module } from '@nestjs/common';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Post, PostSchema } from './schemas/post.schema';
import { ReactionModule } from 'src/reaction/reaction.module';
import { PostGateway } from './post.gateway';
import { UserModule } from 'src/user/user.module';
import {
  FriendRequest,
  FriendRequestSchema,
} from 'src/friend/schemas/friend-request.schemas';
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Post.name, schema: PostSchema },
      { name: FriendRequest.name, schema: FriendRequestSchema },
    ]),
    ReactionModule,
    UserModule,
  ],
  controllers: [PostController],
  providers: [PostService, PostGateway],
  exports: [PostService],
})
export class PostModule {}
