import { Controller, Get, Param } from '@nestjs/common';
import { Types } from 'mongoose';
import { TestsService } from './tests.service';

@Controller('tests/public')
export class PublicTestsController {
  constructor(private readonly testsService: TestsService) {}

  @Get(':uniqueURL')
  async getByUniqueUrl(@Param('uniqueURL') uniqueURL: string) {
    const test = await this.testsService.getByUniqueUrl(uniqueURL);
    const testId = (test._id as Types.ObjectId).toHexString();
    return {
      testId,
      name: test.name,
      description: test.description,
      uniqueURL: test.uniqueURL,
    };
  }
}
