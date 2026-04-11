import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { NOTIFICATION_TYPE } from 'src/_cores/globals/constants';
import { UserDocument } from 'src/user/schemas/user.schema';

export type NotificationDocument = HydratedDocument<Notification>;

@Schema({ timestamps: true })
export class Notification {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  sender: UserDocument;
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  receiver: UserDocument;

  @Prop({ enum: NOTIFICATION_TYPE })
  type: INotificationType; // "friend_request", "comment", "like"
  @Prop()
  content: string;
  @Prop({ default: false })
  isRead: boolean;

  @Prop({ type: mongoose.Schema.Types.ObjectId })
  linkToId: mongoose.Schema.Types.ObjectId;

  createdAt: Date;
  updatedAt: Date;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
