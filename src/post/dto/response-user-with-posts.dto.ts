import { Expose, Transform, Type } from 'class-transformer';
import { ResponsePostDto, MediaType } from './response-post.dto';
import { ResponseUserDto } from 'src/user/dto/response-user.dto';
import { ObjectId } from 'src/_cores/decorators/object-id.decorator';

export class ResponseAuthorDto {
  @Expose() @ObjectId() _id!: string;
  @Expose() name!: string;
  @Expose() email!: string;
  @Expose() bio!: string;
  @Expose() createdAt!: Date;
  @Expose() friendsCount!: number;

  @Expose()
  @Transform(({ obj }: { obj: any }) => {
    const avatar = obj?.avatar as Partial<MediaType> | undefined;
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

  @Expose()
  @Transform(({ obj }: { obj: any }) => {
    const coverPhoto = obj?.coverPhoto as Partial<MediaType> | undefined;
    if (!coverPhoto) return null;

    if (coverPhoto.url) return coverPhoto.url;

    const cloud = process.env.CLOUDINARY_NAME;
    if (!cloud || !coverPhoto.public_id) return null;

    const kind = coverPhoto.resource_type === 'video' ? 'video' : 'image';
    const v = coverPhoto.version ? `v${coverPhoto.version}/` : '';
    const id = coverPhoto.public_id;
    const ext = coverPhoto.format ? `.${coverPhoto.format}` : '';

    return `https://res.cloudinary.com/${cloud}/${kind}/upload/${v}${id}${ext}`;
  })
  coverPhoto!: string;
  @Expose()
  isActive: boolean;

  @Expose()
  isFriend: boolean;
  @Expose()
  isSentFriendRequest: boolean;
}

export class ResponseUserWithPostsDto {
  @Expose()
  @Type(() => ResponseAuthorDto)
  author!: ResponseAuthorDto;

  @Expose()
  @Type(() => ResponseUserDto)
  users!: ResponseUserDto[];

  @Expose()
  @Type(() => ResponsePostDto)
  posts!: ResponsePostDto[];

  @Expose() hasNextPage!: boolean;
  @Expose() cursor!: Date | null;
}
