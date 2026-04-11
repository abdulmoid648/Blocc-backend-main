import { Expose, Transform } from 'class-transformer';
import { ObjectId } from 'src/_cores/decorators/object-id.decorator';

export class ResponseFriendRequestDto {
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
  @Transform(({ obj }) => obj?.sender?.email)
  senderEmail: string;
  @Expose()
  @Transform(({ obj }) =>
    obj?.sender?.avatar?.public_id
      ? `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v${obj?.sender?.avatar?.version}/${obj?.sender?.avatar?.display_name}.${obj?.sender?.avatar?.format}`
      : null,
  )
  senderAvatarUrl: string;
  @Expose()
  @Transform(({ obj }) =>
    obj?.sender?.coverPhoto?.public_id
      ? `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v${obj?.sender?.coverPhoto?.version}/${obj?.sender?.coverPhoto?.display_name}.${obj?.sender?.coverPhoto?.format}`
      : null,
  )
  senderCoverPhotoUrl: string;
  @Expose()
  createdAt: Date;
  @Expose()
  updatedAt: Date;
}
