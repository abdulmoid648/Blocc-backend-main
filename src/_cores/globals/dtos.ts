import { IsNotEmpty, IsNumber } from 'class-validator';

export class UploadMediaDto {
  @IsNotEmpty()
  public_id: string;
  @IsNumber()
  version: number;
  @IsNotEmpty()
  display_name: string;
  @IsNotEmpty()
  format: string;
  @IsNotEmpty()
  resource_type: string;
}
