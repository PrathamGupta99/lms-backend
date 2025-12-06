import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum UserRole {
  Admin = 'admin',
  User = 'user',
}

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email!: string;

  @Prop({ required: true })
  passwordHash!: string;

  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ required: true, enum: UserRole, default: UserRole.User })
  role!: UserRole;

  createdAt!: Date;
  updatedAt!: Date;
}

export type UserDocument = User & Document;

export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.index({ email: 1 }, { unique: true });
