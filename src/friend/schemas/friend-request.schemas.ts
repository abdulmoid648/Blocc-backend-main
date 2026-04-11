import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { FRIEND_REQUEST_STATUS } from 'src/_cores/globals/constants';
import { UserDocument } from 'src/user/schemas/user.schema';

export type FriendRequestDocument = HydratedDocument<FriendRequest>;

@Schema({ timestamps: true })
export class FriendRequest {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  sender: UserDocument;
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  receiver: UserDocument;
  @Prop({ default: 'pending', enum: FRIEND_REQUEST_STATUS })
  status: IFriendRequestStatus;
}

export const FriendRequestSchema = SchemaFactory.createForClass(FriendRequest);
