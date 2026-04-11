import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { UserDocument } from 'src/user/schemas/user.schema';
import { PostDocument } from 'src/post/schemas/post.schema';

export type StoryDocument = HydratedDocument<Story>;

@Schema({ timestamps: true })
export class Story {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  author: any;

  @Prop()
  caption: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Post' })
  sharedPost: any;

  @Prop({ default: [] })
  media: any[];

  @Prop({ type: [String], default: ['#a18cd1', '#fbc2eb'] })
  backgroundGradient: string[];

  // TTL index to automatically delete the record after 24 hours
  @Prop({ type: Date, expires: '24h', default: Date.now })
  expiresAt: Date;

  createdAt: Date;
  updatedAt: Date;
}

export const StorySchema = SchemaFactory.createForClass(Story);
