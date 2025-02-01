import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AiModelService } from './ai-model.service';
import { AiModelController } from './ai-model.controller';

@Module({
  imports: [HttpModule],
  controllers: [AiModelController],
  providers: [AiModelService],
})
export class AiModelModule {}
