import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { UserRole } from '../../users/schemas/user.schema';

@Injectable()
export class UserOnlyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<{ user?: { role?: UserRole } }>();
    const user = request.user;
    if (user?.role === UserRole.User) {
      return true;
    }
    throw new ForbiddenException('Only normal users can perform this action');
  }
}
