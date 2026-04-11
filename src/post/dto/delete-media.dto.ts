import { IsNotEmpty } from 'class-validator';

export class DeleteMediaDto {
  @IsNotEmpty()
  mediaId: string;
}
