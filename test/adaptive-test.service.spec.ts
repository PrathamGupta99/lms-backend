import { AdaptiveTestService } from '../src/tests/utils/adaptive-test.service';

describe('AdaptiveTestService', () => {
  const service = new AdaptiveTestService();

  it('raises and lowers difficulty within bounds', () => {
    expect(service.getNextDifficulty(5, true)).toBe(6);
    expect(service.getNextDifficulty(10, true)).toBe(10);
    expect(service.getNextDifficulty(1, false)).toBe(1);
    expect(service.getNextDifficulty(5, false)).toBe(4);
  });

  it('ends when 20 questions answered', () => {
    const questions = Array.from({ length: 20 }).map(() => ({
      difficultyAtTime: 5,
      isCorrect: true,
      weight: 1,
      selectedAnswerIndex: 0,
    }));
    const shouldEnd = service.shouldEndTest({
      questionsAsked: questions,
      consecutiveCorrectDifficulty10Count: 0,
    });
    expect(shouldEnd).toBe(true);
  });

  it('ends on first incorrect at difficulty 1', () => {
    const questions = [
      { difficultyAtTime: 1, isCorrect: false, weight: 1, selectedAnswerIndex: 0 },
    ];
    const shouldEnd = service.shouldEndTest({
      questionsAsked: questions,
      consecutiveCorrectDifficulty10Count: 0,
    });
    expect(shouldEnd).toBe(true);
  });

  it('ends on 3 consecutive correct at difficulty 10', () => {
    const questions = [
      { difficultyAtTime: 10, isCorrect: true, weight: 1, selectedAnswerIndex: 0 },
      { difficultyAtTime: 10, isCorrect: true, weight: 1, selectedAnswerIndex: 0 },
      { difficultyAtTime: 10, isCorrect: true, weight: 1, selectedAnswerIndex: 0 },
    ];
    const shouldEnd = service.shouldEndTest({
      questionsAsked: questions,
      consecutiveCorrectDifficulty10Count: 3,
    });
    expect(shouldEnd).toBe(true);
  });

  it('calculates score from correct answers only', () => {
    const questions = [
      { difficultyAtTime: 5, isCorrect: true, weight: 2, selectedAnswerIndex: 0 },
      { difficultyAtTime: 6, isCorrect: false, weight: 5, selectedAnswerIndex: 1 },
      { difficultyAtTime: 7, isCorrect: true, weight: 3, selectedAnswerIndex: 0 },
    ];
    expect(service.calculateScore(questions)).toBe(5);
  });
});
