import { Expose, Transform, Type } from 'class-transformer';
import { ObjectId } from 'src/_cores/decorators/object-id.decorator';

class SeenByDto {
  @Expose()
  @Transform(({ obj }) => obj?._id)
  seenById: string;
  @Expose()
  @Transform(({ obj }) => obj?.name)
  seenByName: string;
  @Expose()
  @Transform(({ obj }) =>
    obj?.avatar?.public_id
      ? `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v${obj?.avatar?.version}/${obj?.avatar?.display_name}.${obj?.avatar?.format}`
      : null,
  )
  seenByAvatarUrl: string;
}

export class ResponseMessageDto {
  @Expose()
  @ObjectId()
  _id: string;
  @Expose()
  @ObjectId()
  @Transform(({ obj }) => obj?.conversation)
  conversation: string;
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
  text: string;
  @Expose()
  @Transform(({ obj }) =>
    obj?.mediaFiles?.map((file) =>
      file?.public_id
        ? `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v${file?.version}/${file?.display_name}.${file?.format}`
        : null,
    ),
  )
  mediaFiles: string[];
  @Expose()
  isDelete: string;

  @Expose()
  @Type(() => SeenByDto)
  seenBy: SeenByDto[];
  @Expose()
  createdAt: Date;
  @Expose()
  updatedAt: Date;
}
