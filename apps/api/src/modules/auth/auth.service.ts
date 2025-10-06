import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { compareHash } from '@/lib/crypto';
import { LoginDto } from './dto/login-dto';
import { SignUpDto } from './dto/signup-dto';
import { UsersService } from '../users/users.service';
import type { Response } from 'express';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private userService: UsersService,
    private jwtService: JwtService,
  ) {}
  async signUp(data: SignUpDto) {
    return await this.userService.create(data);
  }

  async login({ email, password }: LoginDto, response: Response) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new BadRequestException('Invalid credentials');
    }
    const isPasswordValid = await compareHash(password, user.password);
    if (!isPasswordValid) {
      throw new BadRequestException('Invalid credentials');
    }
    const payload = { email: user.email, sub: user.id, role: user.role };
    const accessToken = this.jwtService.sign(payload);

    response.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      expires: new Date(Date.now() + 8 * 60 * 60 * 1000),
      sameSite: 'lax',
    });

    return {
      access_token: accessToken,
    };
  }
}
