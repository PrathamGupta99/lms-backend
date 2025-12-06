import { Module } from '@nestjs/common';
import { TestsStubController } from './tests.stub.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [TestsStubController],
})
export class TestsModule {}
