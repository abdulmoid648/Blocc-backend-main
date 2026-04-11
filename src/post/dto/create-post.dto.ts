import {
  IsHexColor,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreatePostDto {
  @IsOptional()
  @IsHexColor()
  backgroundColor: string;
  @IsNotEmpty()
  @IsString()
  content: string;
  @IsOptional()
  @IsIn(['public', 'private', 'friends'])
  privacy: IPrivacy;
}
