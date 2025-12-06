import { Controller, HttpCode, HttpStatus, Param, Post } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserOnlyGuard } from '../auth/guards/user-only.guard';
import { UseGuards } from '@nestjs/common';

// Temporary stub to enforce role-only access for test-taking endpoints.
@Controller('tests')
export class TestsStubController {
  @Post(':testId/start')
  @UseGuards(JwtAuthGuard, UserOnlyGuard)
  @HttpCode(HttpStatus.OK)
  startTestStub(@Param('testId') testId: string) {
    return { message: `Start test ${testId} (stub)`, status: 'ok' };
  }

  @Post(':testId/questions/:questionId/answer')
  @UseGuards(JwtAuthGuard, UserOnlyGuard)
  @HttpCode(HttpStatus.OK)
  answerStub(@Param('testId') testId: string, @Param('questionId') questionId: string) {
    return { message: `Answer question ${questionId} for test ${testId} (stub)`, status: 'ok' };
  }
}
