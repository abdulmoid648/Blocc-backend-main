import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { MediaType } from 'src/_cores/globals/class';

export type UserDocument = HydratedDocument<User>;

export type IRole = 'user' | 'admin' | 'superadmin';

export type AuthProvider = 'local' | 'google';

@Schema()
export class User {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: false }) // optional for Google users
  password?: string;

  @Prop({ default: 'user' })
  role: IRole;
  @Prop({ default: false })
  isOnline: boolean;

  @Prop()
  bio?: string;

  @Prop()
  avatar?: MediaType;

  @Prop()
  coverPhoto?: MediaType;

  @Prop()
  birthdate?: Date;

  @Prop()
  phoneNumber?: string;

  @Prop({ type: [mongoose.Schema.Types.ObjectId], ref: 'User', default: [] })
  friends: UserDocument[];

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ required: false, unique: true, sparse: true })
  googleId?: string;

  @Prop({ default: 'local' })
  authProvider: AuthProvider;
}

export const UserSchema = SchemaFactory.createForClass(User);
