import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateUserDto {
  @IsString()
  id: string;
  @IsNotEmpty()
  createdAt: Date;
  @IsNotEmpty()
  updatedAt: Date;
  @IsNotEmpty()
  name: string;
  @IsEmail()
  email: string;
  @IsNotEmpty()
  password: string;
}
