import { Expose, Transform } from 'class-transformer';
import { ObjectId } from 'src/_cores/decorators/object-id.decorator';

export class ResponseNotificationDto {
  @Expose()
  @ObjectId()
  _id: string;

  @Expose()
  @Transform(({ obj }) => obj?.sender?._id)
  senderId: string;
  @Expose()
  @Transform(({ obj }) => obj?.sender?.name)
  senderName: string;
  @Expose()
  @Transform(({ obj }) =>
    obj?.sender?.avatar?.public_id
      ? `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v${obj?.sender?.avatar?.version}/${obj?.sender?.avatar?.display_name}.${obj?.sender?.avatar?.format}`
      : null,
  )
  senderAvatarUrl: string;
  @Expose()
  receiver: string;
  @Expose()
  type: string;
  @Expose()
  content: string;
  @Expose()
  isRead: boolean;
  @Expose()
  linkToId: string;
  @Expose()
  createdAt: Date;
  @Expose()
  updatedAt: Date;
}
