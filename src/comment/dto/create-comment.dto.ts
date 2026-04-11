import { IsMongoId, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateCommentDto {
  @IsNotEmpty()
  @IsMongoId()
  postId: string;
  @IsOptional()
  @IsMongoId()
  parentCommentId: string | null;
  @IsOptional()
  @IsMongoId()
  replyToUserId: string | null;
  @IsNotEmpty()
  content: string;
}
