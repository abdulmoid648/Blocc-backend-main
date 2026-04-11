import { Expose, Transform, Type } from 'class-transformer';
import { ObjectId } from 'src/_cores/decorators/object-id.decorator';
import { PostDocument } from '../schemas/post.schema';

// Explicitly type the object inside MediaType transform
export class MediaType {
  @Expose()
  @Transform(({ obj }: { obj: Partial<MediaType> }) => {
    if (obj?.url) return obj.url;

    const cloud = process.env.CLOUDINARY_NAME;
    if (!cloud || !obj?.public_id) return null;

    const kind = obj.resource_type === 'video' ? 'video' : 'image';
    const v = obj.version ? `v${obj.version}/` : '';
    const id = obj.public_id;
    const ext = obj.format ? `.${obj.format}` : '';

    return `https://res.cloudinary.com/${cloud}/${kind}/upload/${v}${id}${ext}`;
  })
  url!: string;

  @Expose() public_id!: string;
  @Expose() version!: number;
  @Expose() display_name!: string;
  @Expose() format!: string;
  @Expose() resource_type!: 'image' | 'video';
}

export class ResponsePostDto {
  @Expose() @ObjectId() _id!: string;
  @Expose() backgroundColor!: string;
  @Expose() content!: string;

  @Expose()
  @Transform(({ obj }) => obj.reactionsCount)
  reactionsCount!: Map<IReactionType, number>;

  @Expose()
  @Type(() => MediaType)
  mediaFiles!: MediaType[];

  @Expose() privacy!: IPrivacy;
  @Expose() createdAt!: Date;
  @Expose() updatedAt!: Date;

  @Expose()
  @Transform(({ obj }: { obj: PostDocument }) => obj?.author?._id)
  authorId!: string;

  @Expose()
  @Transform(({ obj }: { obj: PostDocument }) => obj?.author?.name)
  authorName!: string;

  @Expose()
  @Transform(({ obj }: { obj: PostDocument }) => obj?.author?.email)
  authorEmail!: string;

  // ✅ Safe and typed avatar transformer
  @Expose()
  @Transform(({ obj }: { obj: PostDocument }) => {
    const avatar = obj?.author?.avatar as Partial<MediaType> | undefined;
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
  avatar!: string;

  @Expose() myReaction!: IReactionType;
  @Expose() isFollowing!: boolean;
  @Expose() followRequested!: boolean;
}
