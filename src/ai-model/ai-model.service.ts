import { envs } from '@/configuration';
import { LLMSpecificModel, LMStudioClient } from '@lmstudio/sdk';
import { HttpService } from '@nestjs/axios';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { CreateAiModelDto } from './dto/create-ai-model.dto';
import { Model } from './entities/model.response';

@Injectable()
export class AiModelService {
  constructor(private readonly httpService: HttpService) {}
  private readonly logger = new Logger('AI Model');

  model: LLMSpecificModel | null = null;
  async create(data: CreateAiModelDto) {
    const { userInput, history = [] } = data;

    this.model = await this.getModel();

    history.push({ role: 'user', content: userInput });

    // Generar respuesta
    const prediction = this.model.respond(history);

    for await (const { content } of prediction) {
      return content;
    }
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
  async getModel() {
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
