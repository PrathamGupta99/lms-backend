import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { QuestionsService } from './questions.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';
import { QuestionDocument } from './schemas/question.schema';

@Controller('questions')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.Admin)
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateQuestionDto): Promise<QuestionDocument> {
    return this.questionsService.createQuestion(dto);
  }

  @Get()
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('difficulty') difficulty?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : undefined;
    const limitNum = limit ? parseInt(limit, 10) : undefined;
    const difficultyNum = difficulty ? parseInt(difficulty, 10) : undefined;
    return this.questionsService.getAllQuestions({
      page: pageNum,
      limit: limitNum,
      difficulty: difficultyNum,
    });
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<QuestionDocument> {
    return this.questionsService.getQuestionById(id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateQuestionDto): Promise<QuestionDocument> {
    return this.questionsService.updateQuestion(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    return this.questionsService.deleteQuestion(id);
  }
}
