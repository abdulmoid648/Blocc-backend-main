import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { MediaType } from 'src/_cores/globals/class';
import { MessageDocument } from 'src/message/schemas/message.schema';
import { UserDocument } from 'src/user/schemas/user.schema';

export type ConversationDocument = HydratedDocument<Conversation>;

@Schema({ timestamps: true })
export class Conversation {
  @Prop({ type: [mongoose.Schema.Types.ObjectId], ref: 'User' })
  participants: UserDocument[];

  @Prop({ default: false })
  isGroup: boolean;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  groupOwner?: UserDocument;

  @Prop()
  groupAvatar?: MediaType;
  @Prop()
  groupName?: string;
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Message' })
  lastMessage?: MessageDocument;
  @Prop({ default: null })
  lastMessageAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

export const ConversationSchema = SchemaFactory.createForClass(Conversation);
