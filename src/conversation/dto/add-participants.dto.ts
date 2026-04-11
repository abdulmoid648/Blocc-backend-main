import { IsArray, IsMongoId } from 'class-validator';

export class AddParticipantsDto {
  @IsArray()
  @IsMongoId({ each: true })
  participantIds: string[];
}
