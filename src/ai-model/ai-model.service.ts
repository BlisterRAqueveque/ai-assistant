import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { CreateAiModelDto } from './dto/create-ai-model.dto';
import { UpdateAiModelDto } from './dto/update-ai-model.dto';
import { firstValueFrom } from 'rxjs';
import { envs } from '@/configuration';
import { Model } from './entities/model.response';
import { LLMSpecificModel, LMStudioClient } from '@lmstudio/sdk';

@Injectable()
export class AiModelService {
  constructor(private readonly httpService: HttpService) {}
  private readonly logger = new Logger('AI Model');

  model: LLMSpecificModel | null = null;
  async create(data: CreateAiModelDto) {
    const { userInput } = data;

    this.model = await this.getModel();

    const chatHistory = [];
    chatHistory.push({ role: 'user', content: userInput });

    // Generar respuesta
    const prediction = this.model.respond(chatHistory);
    let reply = '';

    for await (const { content } of prediction) {
      reply += content;
      process.stdout.write(content);
    }
    return reply;
  }
  private async getModelId() {
    try {
      const direction = envs.AI_URL + 'models/';
      //> Conseguimos los modelos disponibles
      const model = await firstValueFrom(
        this.httpService.get<{ data: Model[] }>(direction),
      );
      return model.data.data[0].id;
    } catch (err) {
      this.logger.error('Error during response');
      throw new BadRequestException('Server error on response');
    }
  }
  private async getModel() {
    const idModel = await this.getModelId();
    const client = new LMStudioClient();
    //> Obtenemos los modelos cargados
    const models = await client.llm.listLoaded();
    if (models.length == 0) {
      //> Si no hay ninguno, cargamos uno
      return client.llm.load(`lmstudio-community/${idModel}`);
    } else {
      //> Sino, tomamos el primero de todos
      return client.llm.get(models[0].identifier);
    }
  }
}
