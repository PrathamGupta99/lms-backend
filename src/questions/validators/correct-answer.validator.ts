import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'CorrectAnswerIndex', async: false })
export class CorrectAnswerIndexConstraint implements ValidatorConstraintInterface {
  validate(value: number, args: ValidationArguments): boolean {
    const optionsCandidate = (args.object as { options?: unknown }).options;
    if (!Array.isArray(optionsCandidate) || optionsCandidate.length < 2) {
      return false;
    }
    return Number.isInteger(value) && value >= 0 && value < optionsCandidate.length;
  }

  defaultMessage(): string {
    return 'correctAnswerIndex must be a valid index for the options array';
  }
}

export function IsCorrectAnswerIndex(validationOptions?: ValidationOptions) {
  return function (object: unknown, propertyName: string) {
    const target = (object as Record<string, unknown>).constructor as new (
      ...args: unknown[]
    ) => unknown;
    registerDecorator({
      name: 'IsCorrectAnswerIndex',
      target,
      propertyName,
      options: validationOptions,
      validator: CorrectAnswerIndexConstraint,
    });
  };
}
