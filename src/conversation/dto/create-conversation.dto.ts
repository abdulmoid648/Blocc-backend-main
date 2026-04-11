import { IsArray, IsMongoId, IsNotEmpty, IsOptional } from 'class-validator';
import { MediaType } from 'src/_cores/globals/class';

export class CreateGroupConversationDto {
  @IsArray()
  @IsMongoId({ each: true })
  participantIds: string[];
  @IsOptional()
  groupAvatar: MediaType;
  @IsNotEmpty()
  groupName: string;
}
