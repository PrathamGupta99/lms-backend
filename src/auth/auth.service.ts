import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService, SafeUser } from '../users/users.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { UserRole } from '../users/schemas/user.schema';
import { hashPassword, comparePassword } from './utils/password.util';
import { JwtPayload } from './interfaces/jwt-payload.interface';

export interface AuthResponse {
  user: SafeUser;
  token: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterUserDto): Promise<AuthResponse> {
    const passwordHash = await hashPassword(dto.password);

    const user = await this.usersService.createUser({
      email: dto.email,
      passwordHash,
      name: dto.name,
      role: UserRole.Admin, // public registration always creates admin
    });

    const token = this.signToken(user);
    return { user, token };
  }

  async login(dto: LoginUserDto): Promise<AuthResponse> {
    const existing = await this.usersService.findByEmail(dto.email);
    if (!existing) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isMatch = await comparePassword(dto.password, existing.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const user = this.usersService.toSafeUser(existing);
    const token = this.signToken(user);
    return { user, token };
  }

  private signToken(user: SafeUser): string {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };
    return this.jwtService.sign(payload);
  }
}
