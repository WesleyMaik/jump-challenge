import { IsNotEmpty, IsString, IsOptional, IsEnum } from 'class-validator';
import { Status } from '@prisma/client';

export class CreateTodoDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsOptional()
  @IsEnum(Status)
  status?: Status;

  @IsNotEmpty()
  @IsString()
  userId: string;
}
