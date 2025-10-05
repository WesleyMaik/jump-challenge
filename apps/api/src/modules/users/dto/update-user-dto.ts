import { IsNotEmpty } from 'class-validator';

export class UpdateUserDto {
  @IsNotEmpty()
  name: string;
  @IsNotEmpty()
  password: string;
}
