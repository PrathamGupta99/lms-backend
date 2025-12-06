/* eslint-disable @typescript-eslint/no-unsafe-call */
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  Validate,
} from 'class-validator';
import { CorrectAnswerIndexConstraint } from '../validators/correct-answer.validator';

export class UpdateQuestionDto {
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  questionText?: string;

  @IsOptional()
  @IsArray()
  @ArrayMinSize(2)
  @IsString({ each: true })
  options?: string[];

  @IsOptional()
  @IsInt()
  @Validate(CorrectAnswerIndexConstraint)
  correctAnswerIndex?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  difficulty?: number;

  @IsOptional()
  @IsNumber()
  @Min(0.0001)
  weight?: number;
}
