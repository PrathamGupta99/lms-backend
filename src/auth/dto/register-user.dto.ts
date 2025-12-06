/* eslint-disable @typescript-eslint/no-unsafe-call */
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class RegisterUserDto {
  @IsEmail()
  email!: string;

  @MinLength(8)
  password!: string;

  @IsNotEmpty()
  name!: string;
}
