import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Question {
  @Prop({ required: true, trim: true })
  questionText!: string;

  @Prop({
    type: [String],
    required: true,
    validate: [(v: string[]) => v.length >= 2, 'Options must have at least 2 entries'],
  })
  options!: string[];

  @Prop({
    required: true,
    min: 0,
    validate: [
      {
        validator: function (this: Question, value: number) {
          return Array.isArray(this.options) && value >= 0 && value < this.options.length;
        },
        message: 'correctAnswerIndex must point to a valid option',
      },
    ],
  })
  correctAnswerIndex!: number;

  @Prop({ required: true, min: 1, max: 10 })
  difficulty!: number;

  @Prop({ required: true, min: 0.0001 })
  weight!: number;

  createdAt!: Date;
  updatedAt!: Date;
}

export type QuestionDocument = Question & Document;
export const QuestionSchema = SchemaFactory.createForClass(Question);
