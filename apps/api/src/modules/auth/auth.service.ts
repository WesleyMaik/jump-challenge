import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { compareHash } from '@/lib/crypto';
import { LoginDto } from './dto/login-dto';
import { SignUpDto } from './dto/signup-dto';
import { UsersService } from '../users/users.service';

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

  async login({ email, password }: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new Error('Invalid credentials');
    }
    const isPasswordValid = await compareHash(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }
    const payload = { email: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
