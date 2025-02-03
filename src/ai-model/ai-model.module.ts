import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AiModelService } from './ai-model.service';
import { AiModelGateway } from './ai-model.gateway';

@Module({
  imports: [HttpModule],
  providers: [AiModelService, AiModelGateway],
})
export class AiModelModule {}
