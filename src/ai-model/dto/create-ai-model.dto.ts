import { IsString } from "class-validator";

export class CreateAiModelDto {
  @IsString()
  userInput: string;
}
