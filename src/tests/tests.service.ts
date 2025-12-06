import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { nanoid } from 'nanoid';
import { Test, TestDocument } from './schemas/test.schema';
import { TestSession, TestSessionDocument } from './schemas/test-session.schema';
import { CreateTestDto } from './dto/create-test.dto';
import { UpdateTestDto } from './dto/update-test.dto';
import { AdaptiveTestService } from './utils/adaptive-test.service';
import { QuestionsService } from '../questions/questions.service';
import { SubmitAnswerDto } from './dto/submit-answer.dto';
import { MAX_QUESTIONS, START_DIFFICULTY } from './constants';
import { UserDocument } from '../users/schemas/user.schema';

@Injectable()
export class TestsService {
  constructor(
    @InjectModel(Test.name) private readonly testModel: Model<TestDocument>,
    @InjectModel(TestSession.name) private readonly sessionModel: Model<TestSessionDocument>,
    private readonly adaptiveService: AdaptiveTestService,
    private readonly questionsService: QuestionsService,
  ) {}

  async createTest(dto: CreateTestDto, createdBy: string): Promise<TestDocument> {
    const uniqueURL = nanoid(12);
    const created = await this.testModel.create({
      name: dto.name,
      description: dto.description,
      uniqueURL,
      createdBy: new Types.ObjectId(createdBy),
    });
    return created;
  }

  async listTests(): Promise<TestDocument[]> {
    return this.testModel.find().sort({ createdAt: -1 }).exec();
  }

  async getByUniqueUrl(uniqueURL: string): Promise<TestDocument> {
    const test = await this.testModel.findOne({ uniqueURL }).exec();
    if (!test) {
      throw new NotFoundException('Test not found');
    }
    return test;
  }

  async getTestById(id: string): Promise<TestDocument> {
    const test = await this.testModel.findById(id).exec();
    if (!test) {
      throw new NotFoundException('Test not found');
    }
    return test;
  }

  async updateTest(id: string, dto: UpdateTestDto): Promise<TestDocument> {
    const test = await this.getTestById(id);
    if (dto.name !== undefined) {
      test.name = dto.name;
    }
    if (dto.description !== undefined) {
      test.description = dto.description;
    }
    await test.save();
    return test;
  }

  async deleteTest(id: string): Promise<void> {
    const result = await this.testModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('Test not found');
    }
    // Sessions cleanup can be added later if desired
  }

  async previewTest(testId: string, sampleSize = 5) {
    const test = await this.getTestById(testId);
    const questions = await this.questionsService.getSampleQuestions(sampleSize);
    return {
      previewOnly: true,
      testId: (test._id as Types.ObjectId).toHexString(),
      name: test.name,
      description: test.description,
      questions: questions.map((q) => ({
        id: (q._id as Types.ObjectId).toHexString(),
        questionText: q.questionText,
        options: q.options,
        difficulty: q.difficulty,
        weight: q.weight,
      })),
    };
  }

  async getResults(testId: string) {
    const testObjectId = new Types.ObjectId(testId);
    const sessions = await this.sessionModel
      .find({ testId: testObjectId, status: 'completed' })
      .sort({ updatedAt: -1 })
      .populate<{ userId: UserDocument }>('userId', 'email name role')
      .exec();

    return sessions.map((session) => {
      const user = session.userId as unknown as UserDocument;
      const userId = (user._id as Types.ObjectId).toHexString();
      const sessionId = (session._id as Types.ObjectId).toHexString();
      return {
        sessionId,
        user: {
          id: userId,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        score: session.score,
        questionsCount: session.questionsAsked.length,
        completedAt: session.updatedAt,
      };
    });
  }

  async startTestSession(testId: string, userId: string) {
    const test = await this.getTestById(testId);
    const initialDifficulty = START_DIFFICULTY;
    const initialQuestion = await this.questionsService.getRandomByDifficulty(initialDifficulty);

    const testIdString =
      test._id instanceof Types.ObjectId ? test._id.toHexString() : String(test._id);
    const testObjectId = new Types.ObjectId(testIdString);
    const session = await this.sessionModel.create({
      testId: testObjectId,
      userId: new Types.ObjectId(userId),
      status: 'in-progress',
      currentDifficulty: initialDifficulty,
      score: 0,
      questionsAsked: [],
      consecutiveCorrectDifficulty10Count: 0,
    });

    const sessionId = (session._id as Types.ObjectId).toHexString();
    const questionId = (initialQuestion._id as Types.ObjectId).toHexString();

    return {
      sessionId,
      testId: testIdString,
      question: {
        id: questionId,
        questionText: initialQuestion.questionText,
        options: initialQuestion.options,
        difficulty: initialQuestion.difficulty,
        weight: initialQuestion.weight,
      },
    };
  }

  async submitAnswer(
    testId: string,
    sessionId: string,
    questionId: string,
    userId: string,
    dto: SubmitAnswerDto,
  ) {
    const session = await this.sessionModel.findById(sessionId).exec();
    if (!session || session.testId.toString() !== testId || session.userId.toString() !== userId) {
      throw new NotFoundException('Session not found');
    }
    if (session.status !== 'in-progress') {
      throw new BadRequestException('Session already completed');
    }

    const question = await this.questionsService.getQuestionById(questionId);
    const isCorrect = question.correctAnswerIndex === dto.selectedAnswerIndex;

    const updatedQuestions = [
      ...session.questionsAsked.map((q) => ({ ...q })),
      {
        questionId: question._id as Types.ObjectId,
        chosenAnswerIndex: dto.selectedAnswerIndex,
        isCorrect,
        difficultyAtTime: session.currentDifficulty,
        weight: question.weight,
      },
    ];

    const score = this.adaptiveService.calculateScore(
      updatedQuestions.map((q) => ({
        difficultyAtTime: q.difficultyAtTime,
        isCorrect: q.isCorrect,
        weight: q.weight,
        selectedAnswerIndex: q.chosenAnswerIndex,
      })),
    );

    let consecutiveCorrectDifficulty10Count = session.consecutiveCorrectDifficulty10Count;
    if (session.currentDifficulty === 10 && isCorrect) {
      consecutiveCorrectDifficulty10Count += 1;
    } else if (!isCorrect) {
      consecutiveCorrectDifficulty10Count = 0;
    }

    const nextDifficulty = this.adaptiveService.getNextDifficulty(
      session.currentDifficulty,
      isCorrect,
    );

    const shouldEnd = this.adaptiveService.shouldEndTest({
      questionsAsked: updatedQuestions.map((q) => ({
        difficultyAtTime: q.difficultyAtTime,
        isCorrect: q.isCorrect,
        weight: q.weight,
        selectedAnswerIndex: q.chosenAnswerIndex,
      })),
      consecutiveCorrectDifficulty10Count,
    });

    session.questionsAsked = updatedQuestions;
    session.score = score;
    session.currentDifficulty = nextDifficulty;
    session.consecutiveCorrectDifficulty10Count = consecutiveCorrectDifficulty10Count;
    session.status = shouldEnd ? 'completed' : 'in-progress';
    await session.save();

    if (shouldEnd || session.questionsAsked.length >= MAX_QUESTIONS) {
      session.status = 'completed';
      await session.save();
      const sessionIdCompleted = (session._id as Types.ObjectId).toHexString();
      return {
        completed: true,
        sessionId: sessionIdCompleted,
        score: session.score,
        totalQuestions: session.questionsAsked.length,
        questionsAsked: session.questionsAsked,
      };
    }

    const nextQuestion = await this.questionsService.getRandomByDifficulty(nextDifficulty);

    const nextQuestionId = (nextQuestion._id as Types.ObjectId).toHexString();
    const inProgressSessionId = (session._id as Types.ObjectId).toHexString();
    return {
      completed: false,
      sessionId: inProgressSessionId,
      question: {
        id: nextQuestionId,
        questionText: nextQuestion.questionText,
        options: nextQuestion.options,
        difficulty: nextQuestion.difficulty,
        weight: nextQuestion.weight,
      },
      score: session.score,
      totalQuestions: session.questionsAsked.length,
    };
  }

  async getSessionById(sessionId: string) {
    const session = await this.sessionModel.findById(sessionId).exec();
    if (!session) {
      throw new NotFoundException('Session not found');
    }
    return {
      id: session._id instanceof Types.ObjectId ? session._id.toHexString() : String(session._id),
      testId:
        session.testId instanceof Types.ObjectId
          ? session.testId.toHexString()
          : String(session.testId),
      userId:
        session.userId instanceof Types.ObjectId
          ? session.userId.toHexString()
          : String(session.userId),
      status: session.status,
      score: session.score,
      currentDifficulty: session.currentDifficulty,
      questionsAsked: session.questionsAsked,
      consecutiveCorrectDifficulty10Count: session.consecutiveCorrectDifficulty10Count,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
    };
  }
}
