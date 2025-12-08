import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument, UserRole } from './schemas/user.schema';
import { UpdateUserDto } from './dto/update-user.dto';
import { hashPassword } from '../auth/utils/password.util';

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
    name: string;
    role: UserRole;
    password?: string;
    passwordHash?: string;
  }): Promise<SafeUser> {
    const email = params.email.toLowerCase();
    const existing = await this.userModel.findOne({ email }).lean();
    if (existing) {
      throw new BadRequestException('User with this email already exists');
    }

    const passwordHash =
      params.passwordHash ?? (params.password ? await hashPassword(params.password) : undefined);
    if (!passwordHash) {
      throw new BadRequestException('Password is required');
    }

    const created = await this.userModel.create({ ...params, email, passwordHash });
    return this.toSafeUser(created);
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email: email.toLowerCase() }).exec();
  }

  async findByIdOrThrow(id: string): Promise<UserDocument> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findAll(): Promise<SafeUser[]> {
    const users = await this.userModel.find().sort({ createdAt: -1 }).exec();
    return users.map((u) => this.toSafeUser(u));
  }

  async updateUser(id: string, dto: UpdateUserDto): Promise<SafeUser> {
    const user = await this.findByIdOrThrow(id);

    if (dto.name) {
      user.name = dto.name;
    }
    if (dto.role) {
      user.role = dto.role;
    }
    if (dto.password) {
      user.passwordHash = await hashPassword(dto.password);
    }

    await user.save();
    return this.toSafeUser(user);
  }

  async deleteUser(id: string): Promise<void> {
    const result = await this.userModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('User not found');
    }
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
