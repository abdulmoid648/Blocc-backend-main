import { IsOptional } from 'class-validator';
import { MediaType } from 'src/_cores/globals/class';

export class UpdateConversationDto {
  @IsOptional()
  groupName: string;
  @IsOptional()
  groupAvatar: MediaType;
}
