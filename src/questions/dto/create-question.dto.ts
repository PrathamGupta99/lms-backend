/* eslint-disable @typescript-eslint/no-unsafe-call */
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsString,
  Max,
  Min,
  Validate,
} from 'class-validator';
import { CorrectAnswerIndexConstraint } from '../validators/correct-answer.validator';

export class CreateQuestionDto {
  @IsNotEmpty()
  @IsString()
  questionText!: string;

  @IsArray()
  @ArrayMinSize(2)
  @IsString({ each: true })
  options!: string[];

  @IsInt()
  @Validate(CorrectAnswerIndexConstraint)
  correctAnswerIndex!: number;

  @IsInt()
  @Min(1)
  @Max(10)
  difficulty!: number;

  @IsNumber()
  @Min(0.0001)
  weight!: number;
}
