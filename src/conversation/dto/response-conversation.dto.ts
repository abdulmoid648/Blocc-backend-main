import { Expose, Transform, Type } from 'class-transformer';
import { ObjectId } from 'src/_cores/decorators/object-id.decorator';

export class ParticipantDto {
  @Expose()
  @ObjectId()
  _id: string;
  @Expose()
  email: string;
  @Expose()
  name: string;
  @Expose()
  @Transform(({ obj }) =>
    obj?.avatar?.public_id
      ? `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v${obj?.avatar?.version}/${obj?.avatar?.display_name}.${obj?.avatar?.format}`
      : null,
  )
  avatarUrl: string;
}

export class ResponseConversationDto {
  @Expose()
  @ObjectId()
  _id: string;
  @Expose()
  isGroup: boolean;

  @Expose()
  @Type(() => ParticipantDto)
  participants: ParticipantDto[];

  @Expose()
  @Transform(({ obj }) => obj?.groupOwner?._id)
  groupOwnerId: string;
  @Expose()
  @Transform(({ obj }) => obj?.groupOwner?.name)
  groupOwnerName: string;
  @Expose()
  @Transform(({ obj }) => obj?.groupOwner?.email)
  groupOwnerEmail: string;

  @Expose()
  groupName: string;
  @Expose()
  @Transform(({ obj }) =>
    obj?.groupAvatar?.public_id
      ? `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/upload/v${obj?.groupAvatar?.version}/${obj?.groupAvatar?.display_name}.${obj?.groupAvatar?.format}`
      : null,
  )
  groupAvatarUrl: string;
  @Expose()
  @Transform(({ obj }) => obj?.lastMessage?.text)
  lastMessage: string;
  @Expose()
  @ObjectId()
  @Transform(({ obj }) => obj?.lastMessage?.sender?._id)
  senderIdLastMessage: string;
  @Expose()
  @Transform(({ obj }) => obj?.lastMessage?.sender?.name)
  senderLastMessage: string;
  @Expose()
  lastMessageAt: string;
  @Expose()
  isLastMessageSeen: boolean;
  @Expose()
  createdAt: Date;
  @Expose()
  updatedAt: Date;
}
