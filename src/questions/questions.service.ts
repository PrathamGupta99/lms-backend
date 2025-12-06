import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Question, QuestionDocument } from './schemas/question.schema';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';

@Injectable()
export class QuestionsService {
  constructor(
    @InjectModel(Question.name) private readonly questionModel: Model<QuestionDocument>,
  ) {}

  async createQuestion(dto: CreateQuestionDto): Promise<QuestionDocument> {
    this.assertCorrectAnswerIndex(dto.correctAnswerIndex, dto.options);
    const created = await this.questionModel.create(dto);
    return created;
  }

  async getAllQuestions(params?: {
    page?: number;
    limit?: number;
    difficulty?: number;
  }): Promise<{ data: QuestionDocument[]; total: number; page: number; limit: number }> {
    const page = params?.page && params.page > 0 ? params.page : 1;
    const limit = params?.limit && params.limit > 0 ? Math.min(params.limit, 100) : 50;
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {};
    if (params?.difficulty) {
      filter.difficulty = params.difficulty;
    }

    const [data, total] = await Promise.all([
      this.questionModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).exec(),
      this.questionModel.countDocuments(filter).exec(),
    ]);

    return { data, total, page, limit };
  }

  async getQuestionById(id: string): Promise<QuestionDocument> {
    const question = await this.questionModel.findById(id).exec();
    if (!question) {
      throw new NotFoundException('Question not found');
    }
    return question;
  }

  async updateQuestion(id: string, dto: UpdateQuestionDto): Promise<QuestionDocument> {
    const question = await this.getQuestionById(id);

    if (dto.options) {
      this.assertCorrectAnswerIndex(
        dto.correctAnswerIndex ?? question.correctAnswerIndex,
        dto.options,
      );
      question.options = dto.options;
    }

    if (dto.correctAnswerIndex !== undefined) {
      this.assertCorrectAnswerIndex(dto.correctAnswerIndex, dto.options ?? question.options);
      question.correctAnswerIndex = dto.correctAnswerIndex;
    }

    if (dto.questionText !== undefined) {
      question.questionText = dto.questionText;
    }
    if (dto.difficulty !== undefined) {
      question.difficulty = dto.difficulty;
    }
    if (dto.weight !== undefined) {
      question.weight = dto.weight;
    }

    await question.save();
    return question;
  }

  async deleteQuestion(id: string): Promise<void> {
    const result = await this.questionModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('Question not found');
    }
  }

  async getRandomByDifficulty(difficulty: number): Promise<QuestionDocument> {
    const [question] = (await this.questionModel
      .aggregate([{ $match: { difficulty } }, { $sample: { size: 1 } }])
      .exec()) as QuestionDocument[];
    if (!question) {
      throw new NotFoundException('No question found for this difficulty');
    }
    return question;
  }

  private assertCorrectAnswerIndex(index: number, options: string[]): void {
    if (!Array.isArray(options) || options.length < 2) {
      throw new BadRequestException('Options must include at least two entries');
    }
    if (!Number.isInteger(index) || index < 0 || index >= options.length) {
      throw new BadRequestException('correctAnswerIndex must point to one of the options');
    }
  }

  async getSampleQuestions(limit = 5): Promise<QuestionDocument[]> {
    const sampleSize = limit > 0 ? Math.min(limit, 20) : 5;
    const docs = (await this.questionModel
      .aggregate([{ $sample: { size: sampleSize } }])
      .exec()) as QuestionDocument[];
    return docs;
  }
}
