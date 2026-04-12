import { Transform } from 'class-transformer';

export const ObjectId = () => {
  return Transform((value) => value.obj._id.toString());
};
