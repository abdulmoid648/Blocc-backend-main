import { IsOptional, IsString, IsArray } from 'class-validator';

export class CreateStoryDto {
  @IsOptional()
  @IsString()
  caption?: string;

  @IsOptional()
  @IsString()
  sharedPostId?: string;

  @IsOptional()
  backgroundGradient?: string; // We'll accept a JSON stringified array or comma-separated string from FormData
}
