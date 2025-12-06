/* eslint-disable @typescript-eslint/no-unsafe-call */
import { IsInt, Min } from 'class-validator';

export class SubmitAnswerDto {
  @IsInt()
  @Min(0)
  selectedAnswerIndex!: number;
}
