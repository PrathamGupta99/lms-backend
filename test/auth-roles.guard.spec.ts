import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from '../src/auth/guards/roles.guard';
import { UserOnlyGuard } from '../src/auth/guards/user-only.guard';
import { UserRole } from '../src/users/schemas/user.schema';

const mockExecutionContext = (user: { role?: UserRole } | null): ExecutionContext =>
  ({
    getHandler: () => null,
    getClass: () => null,
    switchToHttp: () => ({
      getRequest: () => ({ user }),
    }),
  }) as unknown as ExecutionContext;

describe('RolesGuard', () => {
  it('allows when role matches', () => {
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue([UserRole.Admin]),
    } as unknown as Reflector;
    const guard = new RolesGuard(reflector);
    const canActivate = guard.canActivate(mockExecutionContext({ role: UserRole.Admin }));
    expect(canActivate).toBe(true);
  });

  it('denies when role missing', () => {
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue([UserRole.Admin]),
    } as unknown as Reflector;
    const guard = new RolesGuard(reflector);
    expect(() => guard.canActivate(mockExecutionContext({ role: UserRole.User }))).toThrow();
  });
});

describe('UserOnlyGuard', () => {
  const guard = new UserOnlyGuard();

  it('allows normal users', () => {
    const ctx = mockExecutionContext({ role: UserRole.User });
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('blocks admins', () => {
    const ctx = mockExecutionContext({ role: UserRole.Admin });
    expect(() => guard.canActivate(ctx)).toThrow();
  });
});
