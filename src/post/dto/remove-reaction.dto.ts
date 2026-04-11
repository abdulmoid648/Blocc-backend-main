import { IsMongoId, IsNotEmpty } from 'class-validator';

export class RemoveReactionDto {
  @IsNotEmpty()
  @IsMongoId()
  postId: string;
}
