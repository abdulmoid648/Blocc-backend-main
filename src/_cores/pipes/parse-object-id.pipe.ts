import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { isValidObjectId } from 'mongoose';

@Injectable()
export class ParseObjectIdPipe implements PipeTransform {
  transform(value: string) {
    if (!isValidObjectId(value)) {
      throw new BadRequestException(`The object id: ${value} invalid`);
    }
    return value;
  }
}
