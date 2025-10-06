import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { generateHash } from '@/lib/crypto';
import { PrismaService } from '@/modules/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user-dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getAll() {
    try {
      const users = await this.prisma.user.findMany();
      return users;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async getById(id: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          id,
        },
      });

      if (!user) {
        throw new NotFoundException('User not found.');
      }

      return user;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException('User not found.');
        }
      }
      throw error;
    }
  }

  async create(data: CreateUserDto) {
    try {
      const hashedPassword = await generateHash(data.password);
      const user = await this.prisma.user.create({
        data: {
          ...data,
          password: hashedPassword,
        },
      });
      return user;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Email already in use.');
      }
      throw error;
    }
  }

  async update(id: string, data: Partial<UpdateUserDto>) {
    try {
      const user = await this.prisma.user.update({
        where: {
          id,
        },
        data,
      });
      return user;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientValidationError) {
        throw new BadRequestException('Invalid user data.');
      }

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException('User not found.');
        }

        if (error.code === 'P2002') {
          throw new ConflictException('Email already in use.');
        }
      }

      throw error;
    }
  }

  async delete(id: string) {
    try {
      const user = await this.prisma.user.delete({
        where: {
          id,
        },
      });

      if (!user) {
        throw new NotFoundException('User not found.');
      }

      return user;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException('User not found.');
        }
      }
      console.error(error);
      throw error;
    }
  }
}
