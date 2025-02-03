import { IsOptional, IsString } from 'class-validator';

export class CreateAiModelDto {
  @IsString()
  userInput: string;
  @IsOptional()
  history: { role: string; content: string }[];
}
