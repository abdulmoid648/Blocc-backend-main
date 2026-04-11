import { Expose, Transform, Type } from 'class-transformer';
import { ObjectId } from 'src/_cores/decorators/object-id.decorator';
import { CommentDocument } from '../schemas/comment.schema';
import { MediaType } from 'src/post/dto/response-post.dto';

export class ResponseCommentDto {
  @Expose()
  @ObjectId()
  _id: string;

  @Expose()
  @ObjectId()
  @Transform(({ obj }) => obj.post)
  postId: string;
  @Expose()
  @ObjectId()
  @Transform(({ obj }) => (obj?.parent ? obj?.parent : null))
  parent: string;

  @Expose()
  @Transform(({ obj }) => obj?.userComment?._id)
  userCommentId: string;
  @Expose()
  @Transform(({ obj }) => obj?.userComment?.name)
  userCommentName: string;
  //   TODO: avatar
  @Expose()
  @Transform(({ obj }: { obj: CommentDocument }) => {
    const avatar = obj?.userComment?.avatar as Partial<MediaType> | undefined;
    if (!avatar) return null;

    if (avatar.url) return avatar.url;

    const cloud = process.env.CLOUDINARY_NAME;
    if (!cloud || !avatar.public_id) return null;

    const kind = avatar.resource_type === 'video' ? 'video' : 'image';
    const v = avatar.version ? `v${avatar.version}/` : '';
    const id = avatar.public_id;
    const ext = avatar.format ? `.${avatar.format}` : '';

    return `https://res.cloudinary.com/${cloud}/${kind}/upload/${v}${id}${ext}`;
  })
  userAvatar!: string;

  @Expose()
  @Transform(({ obj }) => obj?.replyToUser?._id)
  replyToUserId: string;
  @Expose()
  @Transform(({ obj }) => obj?.replyToUser?.name)
  replyToUserName: string;
  //   TODO: avatar

  @Expose()
  content: string;

  @Expose()
  createdAt: Date;
  @Expose()
  updatedAt: Date;

  @Expose()
  @Type(() => ResponseCommentDto)
  replies: ResponseCommentDto[];
}
