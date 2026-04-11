import { ClassConstructor, plainToInstance } from 'class-transformer';

export function transformDto<T>(dto: ClassConstructor<T>, instance: any) {
  return plainToInstance(dto, instance, {
    excludeExtraneousValues: true,
  });
}
