import { Logger, OnModuleInit } from '@nestjs/common';
import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AiModelService } from './ai-model.service';
import { CreateAiModelDto } from './dto/create-ai-model.dto';
import { LLMSpecificModel } from '@lmstudio/sdk';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class AiModelGateway implements OnModuleInit {
  constructor(private readonly service: AiModelService) {}

  private readonly logger = new Logger('IA Model Socket');
  @WebSocketServer()
  private readonly server: Server;

  onModuleInit() {
    this.server.on('connection', (socket: Socket) => {
      this.logger.log(`User connected: ${socket.id}`);

      socket.on('disconnect', () => {
        this.logger.log(`User disconnected: ${socket.id}`);
      });
    });
  }

  model: LLMSpecificModel | null = null;

  @SubscribeMessage('ai-chat')
  async handleMessage(client: Socket, payload: string) {
    let data: CreateAiModelDto;
    try {
      data = typeof payload === 'string' ? JSON.parse(payload) : payload;
    } catch (err) {
      this.logger.error('Error al parsear JSON:', err);
      return 'Error: Payload inválido';
    }

    const { userInput, history = [] } = data;

    this.model = await this.service.getModel();

    history.push({ role: 'user', content: userInput });

    // Generar respuesta
    const prediction = this.model.respond(history);

    let message = '';

    for await (const { content } of prediction) {
      message += content;
      client.emit('ai-message', content);
    }

    client.emit('ai-done', message);
  }
}
