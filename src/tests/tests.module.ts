import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TestsController } from './tests.controller';
import { TestsService } from './tests.service';
import { Test, TestSchema } from './schemas/test.schema';
import { TestSession, TestSessionSchema } from './schemas/test-session.schema';
import { AuthModule } from '../auth/auth.module';
import { PublicTestsController } from './public-tests.controller';
import { AdaptiveTestService } from './utils/adaptive-test.service';
import { TestSessionsController } from './test-sessions.controller';
import { QuestionsModule } from '../questions/questions.module';
import { AnswersController } from './answers.controller';
import { SessionsController } from './sessions.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Test.name, schema: TestSchema },
      { name: TestSession.name, schema: TestSessionSchema },
    ]),
    AuthModule,
    QuestionsModule,
  ],
  controllers: [
    TestsController,
    PublicTestsController,
    TestSessionsController,
    AnswersController,
    SessionsController,
  ],
  providers: [TestsService, AdaptiveTestService],
  exports: [TestsService, AdaptiveTestService],
})
export class TestsModule {}
