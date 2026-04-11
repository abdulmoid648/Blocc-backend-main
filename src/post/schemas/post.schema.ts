import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { MediaType } from 'src/_cores/globals/class';
import { UserDocument } from 'src/user/schemas/user.schema';

export type PostDocument = HydratedDocument<Post>;

@Schema({ timestamps: true })
export class Post {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  author: UserDocument;
  @Prop({ default: '#fff' })
  backgroundColor: string;
  @Prop()
  content: string;
  @Prop({ default: [] })
  mediaFiles: MediaType[];
  @Prop({ default: {} })
  reactionsCount: Map<IReactionType, number>;
  @Prop({ enum: ['public', 'private', 'friends'], default: 'public' })
  privacy: IPrivacy;

  createdAt: Date;
  updatedAt: Date;
}

export const PostSchema = SchemaFactory.createForClass(Post);
