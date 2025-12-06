import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { TestsService } from './tests.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';
import { CreateTestDto } from './dto/create-test.dto';
import { UpdateTestDto } from './dto/update-test.dto';
import { CurrentUser } from '../common/decorators/user.decorator';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { Test } from './schemas/test.schema';

@Controller('tests')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.Admin)
export class TestsController {
  constructor(private readonly testsService: TestsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createTest(@Body() dto: CreateTestDto, @CurrentUser() user: JwtPayload): Promise<Test> {
    return this.testsService.createTest(dto, user.sub);
  }

  @Get()
  async listTests(): Promise<Test[]> {
    return this.testsService.listTests();
  }

  @Get(':id')
  async getTest(@Param('id') id: string): Promise<Test> {
    return this.testsService.getTestById(id);
  }

  @Get(':id/preview')
  async previewTest(@Param('id') id: string) {
    return this.testsService.previewTest(id);
  }

  @Get(':id/results')
  async getResults(@Param('id') id: string) {
    return this.testsService.getResults(id);
  }

  @Put(':id')
  async updateTest(@Param('id') id: string, @Body() dto: UpdateTestDto): Promise<Test> {
    return this.testsService.updateTest(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteTest(@Param('id') id: string): Promise<void> {
    return this.testsService.deleteTest(id);
  }
}
