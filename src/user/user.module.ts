import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import {
  FriendRequest,
  FriendRequestSchema,
} from 'src/friend/schemas/friend-request.schemas';
import { Post, PostSchema } from 'src/post/schemas/post.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: FriendRequest.name, schema: FriendRequestSchema },
      { name: Post.name, schema: PostSchema },
    ]),
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
