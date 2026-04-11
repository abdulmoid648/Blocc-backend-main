import { IsOptional } from 'class-validator';
import { MediaType } from 'src/_cores/globals/class';

export class UpdateMessageDto {
  @IsOptional()
  text: string;
  @IsOptional()
  mediaFiles: MediaType[];
}
