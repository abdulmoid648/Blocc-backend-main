import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './user/user.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { PostModule } from './post/post.module';
import { ResourceModule } from './resource/resource.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { ReactionModule } from './reaction/reaction.module';
import { CommentModule } from './comment/comment.module';
import { FriendModule } from './friend/friend.module';
import { ConversationModule } from './conversation/conversation.module';
import { MessageModule } from './message/message.module';
import { NotificationModule } from './notification/notification.module';
import { StoryModule } from './story/story.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URL'),
      }),
      inject: [ConfigService],
    }),
    UserModule,
    AuthModule,
    PostModule,
    ResourceModule,
    CloudinaryModule,
    ReactionModule,
    CommentModule,
    FriendModule,
    ConversationModule,
    MessageModule,
    NotificationModule,
    StoryModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
