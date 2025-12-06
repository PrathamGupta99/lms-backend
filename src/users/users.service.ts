import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument, UserRole } from './schemas/user.schema';

export type SafeUser = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private readonly userModel: Model<UserDocument>) {}

  async createUser(params: {
    email: string;
    passwordHash: string;
    name: string;
    role: UserRole;
  }): Promise<SafeUser> {
    const email = params.email.toLowerCase();
    const existing = await this.userModel.findOne({ email }).lean();
    if (existing) {
      throw new BadRequestException('User with this email already exists');
    }

    const created = await this.userModel.create({ ...params, email });
    return this.toSafeUser(created);
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email: email.toLowerCase() }).exec();
  }

  toSafeUser(user: UserDocument): SafeUser {
    const id = (user._id as Types.ObjectId).toHexString();
    return {
      id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
