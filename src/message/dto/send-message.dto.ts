import { IsArray, IsOptional } from 'class-validator';
import { MediaType } from 'src/_cores/globals/class';

export class SendMessageDto {
  @IsOptional()
  text: string;
  @IsOptional()
  @IsArray()
  mediaFiles: MediaType[];
}
