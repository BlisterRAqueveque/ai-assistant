import { Module } from '@nestjs/common';
import { AiModelModule } from './ai-model/ai-model.module';

@Module({
  imports: [AiModelModule],
})
export class AppModule {}
