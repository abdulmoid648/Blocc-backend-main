import { Module } from '@nestjs/common';
import { ConversationService } from './conversation.service';
import { ConversationController } from './conversation.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Conversation,
  ConversationSchema,
} from './schemas/conversation.schema';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Conversation.name, schema: ConversationSchema },
    ]),
    UserModule,
  ],
  controllers: [ConversationController],
  providers: [ConversationService],
  exports: [ConversationService],
})
export class ConversationModule {}
