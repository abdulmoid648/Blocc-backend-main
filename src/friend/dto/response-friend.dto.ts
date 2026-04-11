import { Expose, Transform } from 'class-transformer';
import { ObjectId } from 'src/_cores/decorators/object-id.decorator';

// export class ResponseFriendDto {
//   @Expose()
//   @ObjectId()
//   _id: string;
//   @Expose()
//   name: string;
//   @Expose()
//   @Transform(({ obj }) =>
//     obj?.avatar?.public_id
//       ? `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v${obj?.avatar?.version}/${obj?.avatar?.display_name}.${obj?.avatar?.format}`
//       : null,
//   )
//   avatarUrl: string;
// }

export class ResponseFriendDto {
  @Expose()
  @ObjectId()
  _id: string;
  @Expose()
  @Transform(({ obj }) => obj?._id)
  senderId: string;
  @Expose()
  @Transform(({ obj }) => obj?.name)
  senderName: string;
  @Expose()
  @Transform(({ obj }) => obj?.email)
  senderEmail: string;
  @Expose()
  @Transform(({ obj }) =>
    obj?.avatar?.public_id
      ? `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v${obj?.avatar?.version}/${obj?.avatar?.display_name}.${obj?.avatar?.format}`
      : null,
  )
  senderAvatarUrl: string;
  @Expose()
  @Transform(({ obj }) =>
    obj?.coverPhoto?.public_id
      ? `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v${obj?.coverPhoto?.version}/${obj?.coverPhoto?.display_name}.${obj?.coverPhoto?.format}`
      : null,
  )
  senderCoverPhotoUrl: string;
  @Expose()
  createdAt: Date;
  @Expose()
  updatedAt: Date;
}
