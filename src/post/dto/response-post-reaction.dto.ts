import { Expose, Transform } from 'class-transformer';
import { ObjectId } from 'src/_cores/decorators/object-id.decorator';

export class ResponsePostReactionDto {
  @Expose()
  @ObjectId()
  _id: string;
  @Expose()
  @ObjectId()
  post: string;
  @Expose()
  @Transform(({ obj }) => obj?.user?._id)
  userId: string;
  @Expose()
  @Transform(({ obj }) => obj?.user?.name)
  userName: string;
  @Expose()
  @Transform(({ obj }) =>
    obj?.user?.avatar?.public_id
      ? `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v${obj?.user?.avatar?.version}/${obj?.user?.avatar?.display_name}.${obj?.user?.avatar?.format}`
      : null,
  )
  userAvatarUrl: string;
  @Expose()
  type: string;
  @Expose()
  createdAt: Date;
  @Expose()
  updatedAt: Date;
}
