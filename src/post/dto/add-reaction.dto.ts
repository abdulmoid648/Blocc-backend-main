import { IsIn, IsMongoId, IsNotEmpty } from 'class-validator';
import { REACTION_TYPES } from 'src/_cores/globals/constants';

export class AddReactionDto {
  @IsNotEmpty()
  @IsMongoId()
  postId: string;
  @IsIn(REACTION_TYPES)
  type: IReactionType;
}
