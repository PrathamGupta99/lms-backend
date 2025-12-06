import { Body, Controller, HttpCode, HttpStatus, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserOnlyGuard } from '../auth/guards/user-only.guard';
import { CurrentUser } from '../common/decorators/user.decorator';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { SubmitAnswerDto } from './dto/submit-answer.dto';
import { TestsService } from './tests.service';

@Controller('tests/:testId/sessions/:sessionId/questions')
export class AnswersController {
  constructor(private readonly testsService: TestsService) {}

  @Post(':questionId/answer')
  @UseGuards(JwtAuthGuard, UserOnlyGuard)
  @HttpCode(HttpStatus.OK)
  async submitAnswer(
    @Param('testId') testId: string,
    @Param('sessionId') sessionId: string,
    @Param('questionId') questionId: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: SubmitAnswerDto,
  ) {
    return this.testsService.submitAnswer(testId, sessionId, questionId, user.sub, dto);
  }
}
