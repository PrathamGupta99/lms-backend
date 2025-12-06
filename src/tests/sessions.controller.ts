import { Controller, Get, Param, UseGuards, ForbiddenException } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/user.decorator';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { TestsService } from './tests.service';
import { UserRole } from '../users/schemas/user.schema';

@Controller('sessions')
@UseGuards(JwtAuthGuard)
export class SessionsController {
  constructor(private readonly testsService: TestsService) {}

  @Get(':sessionId')
  async getSession(@Param('sessionId') sessionId: string, @CurrentUser() user: JwtPayload) {
    const session = await this.testsService.getSessionById(sessionId);

    const isOwner = session.userId.toString() === user.sub;
    const isAdmin = user.role === UserRole.Admin;
    if (!isOwner && !isAdmin) {
      throw new ForbiddenException('Access denied');
    }

    return session;
  }
}
