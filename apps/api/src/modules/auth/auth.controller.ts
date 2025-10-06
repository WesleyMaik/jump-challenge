import { Body, Controller, Post, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login-dto';
import { SignUpDto } from './dto/signup-dto';
import type { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  async register(@Body() req: SignUpDto) {
    return await this.authService.signUp({
      name: req.name,
      email: req.email,
      password: req.password,
    });
  }

  @Post('login')
  async login(
    @Body() req: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    await this.authService.login(
      {
        email: req.email,
        password: req.password,
      },
      response,
    );

    return { message: 'Login successful' };
  }
}
