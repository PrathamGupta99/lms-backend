import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Model } from 'mongoose';
import { QuestionsService } from '../src/questions/questions.service';
import { QuestionDocument } from '../src/questions/schemas/question.schema';

const mockQuestion = (overrides: Partial<QuestionDocument> = {} as QuestionDocument) =>
  ({
    _id: 'q1',
    questionText: 'Sample?',
    options: ['A', 'B'],
    correctAnswerIndex: 0,
    difficulty: 5,
    weight: 1,
    ...overrides,
  } as unknown as QuestionDocument);

describe('QuestionsService', () => {
  let service: QuestionsService;
  let model: Partial<Model<QuestionDocument>>;

  beforeEach(() => {
    model = {
      findById: jest.fn(),
      create: jest.fn(),
      findByIdAndDelete: jest.fn(),
      aggregate: jest.fn(),
      find: jest.fn(),
      countDocuments: jest.fn(),
    };
    service = new QuestionsService(model as Model<QuestionDocument>);
  });

  it('creates a question with valid correctAnswerIndex', async () => {
    const dto = {
      questionText: 'Q',
      options: ['x', 'y'],
      correctAnswerIndex: 1,
      difficulty: 3,
      weight: 1,
    };
    (model.create as jest.Mock).mockResolvedValue(mockQuestion(dto as QuestionDocument));
    const created = await service.createQuestion(dto);
    expect(created.correctAnswerIndex).toBe(1);
    expect(model.create).toHaveBeenCalled();
  });

  it('throws when correctAnswerIndex invalid on create', async () => {
    const dto = {
      questionText: 'Q',
      options: ['x', 'y'],
      correctAnswerIndex: 5,
      difficulty: 3,
      weight: 1,
    };
    await expect(service.createQuestion(dto as any)).rejects.toThrow(BadRequestException);
  });

  it('gets random by difficulty', async () => {
    const sample = mockQuestion({ difficulty: 5 });
    (model.aggregate as jest.Mock).mockReturnValue({ exec: jest.fn().mockResolvedValue([sample]) });
    const q = await service.getRandomByDifficulty(5);
    expect(q).toBe(sample);
    expect(model.aggregate).toHaveBeenCalled();
  });

  it('throws when random by difficulty returns none', async () => {
    (model.aggregate as jest.Mock).mockReturnValue({ exec: jest.fn().mockResolvedValue([]) });
    await expect(service.getRandomByDifficulty(5)).rejects.toThrow(NotFoundException);
  });
});
