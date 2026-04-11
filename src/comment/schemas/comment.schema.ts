import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { PostDocument } from 'src/post/schemas/post.schema';
import { UserDocument } from 'src/user/schemas/user.schema';

export type CommentDocument = HydratedDocument<Comment>;

@Schema({ timestamps: true })
export class Comment {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Post' })
  post: PostDocument;
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' })
  parent: CommentDocument | null;
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  userComment: UserDocument;
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  replyToUser: UserDocument | null;

  @Prop({ required: true })
  content: string;

  createdAt: Date;
  updatedAt: Date;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);
