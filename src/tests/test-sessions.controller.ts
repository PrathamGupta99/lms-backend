import { Controller, HttpCode, HttpStatus, Param, Post, UseGuards } from '@nestjs/common';
import { TestsService } from './tests.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserOnlyGuard } from '../auth/guards/user-only.guard';
import { CurrentUser } from '../common/decorators/user.decorator';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

@Controller('tests')
export class TestSessionsController {
  constructor(private readonly testsService: TestsService) {}

  @Post(':testId/start')
  @UseGuards(JwtAuthGuard, UserOnlyGuard)
  @HttpCode(HttpStatus.CREATED)
  async startTest(@Param('testId') testId: string, @CurrentUser() user: JwtPayload) {
    return this.testsService.startTestSession(testId, user.sub);
  }
}
