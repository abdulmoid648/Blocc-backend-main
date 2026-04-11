import { Expose, Transform } from 'class-transformer';
import { ObjectId } from 'src/_cores/decorators/object-id.decorator';

export class ResponseUserDto {
  @Expose()
  @ObjectId()
  _id: string;
  @Expose()
  name: string;
  @Expose()
  email: string;
  @Expose()
  role: string;
  @Expose()
  bio: string;
  @Expose()
  birthdate: Date;
  @Expose()
  phoneNumber: string;
  @Expose()
  @Transform(({ obj }) =>
    obj?.avatar?.public_id
      ? `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v${obj?.avatar?.version}/${obj?.avatar?.display_name}.${obj?.avatar?.format}`
      : null,
  )
  avatarUrl: string;
  @Expose()
  @Transform(({ obj }) =>
    obj?.coverPhoto?.public_id
      ? `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v${obj?.coverPhoto?.version}/${obj?.coverPhoto?.display_name}.${obj?.coverPhoto?.format}`
      : null,
  )
  coverPhotoUrl: string;
  @Expose()
  isActive: boolean;

  @Expose()
  isFriend: boolean;
  @Expose()
  isSentFriendRequest: boolean;
}
