import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type QuestionAsked = {
  questionId: Types.ObjectId;
  chosenAnswerIndex: number;
  isCorrect: boolean;
  difficultyAtTime: number;
  weight: number;
};

@Schema({ timestamps: true })
export class TestSession {
  @Prop({ type: Types.ObjectId, ref: 'Test', required: true })
  testId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId!: Types.ObjectId;

  @Prop({ required: true, enum: ['in-progress', 'completed'] })
  status!: 'in-progress' | 'completed';

  @Prop({ required: true })
  currentDifficulty!: number;

  @Prop({
    type: [
      {
        questionId: { type: Types.ObjectId, ref: 'Question', required: true },
        chosenAnswerIndex: { type: Number, required: true },
        isCorrect: { type: Boolean, required: true },
        difficultyAtTime: { type: Number, required: true },
        weight: { type: Number, required: true },
      },
    ],
    default: [],
  })
  questionsAsked!: QuestionAsked[];

  @Prop({ required: true, default: 0 })
  score!: number;

  @Prop({ required: true, default: 0 })
  consecutiveCorrectDifficulty10Count!: number;

  createdAt!: Date;
  updatedAt!: Date;
}

export type TestSessionDocument = TestSession & Document;
export const TestSessionSchema = SchemaFactory.createForClass(TestSession);
