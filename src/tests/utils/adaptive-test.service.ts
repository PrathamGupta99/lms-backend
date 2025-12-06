import { Injectable } from '@nestjs/common';

export interface QuestionAskedState {
  difficultyAtTime: number;
  isCorrect: boolean;
  weight: number;
  selectedAnswerIndex: number;
}

export interface ShouldEndTestInput {
  questionsAsked: QuestionAskedState[];
  consecutiveCorrectDifficulty10Count: number;
}

@Injectable()
export class AdaptiveTestService {
  getNextDifficulty(previous: number, isCorrect: boolean): number {
    if (isCorrect) {
      return Math.min(previous + 1, 10);
    }
    return Math.max(previous - 1, 1);
  }

  shouldEndTest(state: ShouldEndTestInput): boolean {
    const totalQuestions = state.questionsAsked.length;
    if (totalQuestions >= 20) {
      return true;
    }

    const last = state.questionsAsked[totalQuestions - 1];
    if (last) {
      const isDifficultyOneAndWrong = last.difficultyAtTime === 1 && !last.isCorrect;
      if (isDifficultyOneAndWrong) {
        return true;
      }
    }

    if (state.consecutiveCorrectDifficulty10Count >= 3) {
      return true;
    }

    return false;
  }

  calculateScore(questionsAsked: QuestionAskedState[]): number {
    return questionsAsked.reduce((acc, q) => (q.isCorrect ? acc + q.weight : acc), 0);
  }
}
