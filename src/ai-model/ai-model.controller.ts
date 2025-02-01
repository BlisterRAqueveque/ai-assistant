import { Body, Controller, Post } from '@nestjs/common';
import { AiModelService } from './ai-model.service';
import { CreateAiModelDto } from './dto/create-ai-model.dto';

@Controller('ai-model')
export class AiModelController {
  constructor(private readonly aiModelService: AiModelService) {}

  @Post('generate-ai')
  create(@Body() createAiModelDto: CreateAiModelDto) {
    return this.aiModelService.create(createAiModelDto);
  }
}
