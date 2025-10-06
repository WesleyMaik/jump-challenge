/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../auth.service';
import { PrismaService } from '../../prisma/prisma.service';
import { UsersService } from '../../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { BadRequestException } from '@nestjs/common';
import { compareHash } from '@/lib/crypto';
import { LoginDto } from '../dto/login-dto';
import { SignUpDto } from '../dto/signup-dto';
import type { Response } from 'express';

jest.mock('@/lib/crypto', () => ({
  compareHash: jest.fn(),
}));

const mockPrismaService = {
  user: {
    findUnique: jest.fn(),
  },
};

const mockUsersService = {
  create: jest.fn(),
};

const mockJwtService = {
  sign: jest.fn(),
};

const mockResponse = {
  cookie: jest.fn(),
} as unknown as Response;

const mockUser = {
  id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  email: 'john.doe@email.com',
  name: 'John Doe',
  role: 'CLIENT',
  password: 'hashedpassword123',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockUserWithoutPassword = {
  id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  email: 'john.doe@email.com',
  name: 'John Doe',
  role: 'CLIENT',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const signUpDto: SignUpDto = {
  email: 'john.doe@email.com',
  name: 'John Doe',
  password: 'password123',
};

const loginDto: LoginDto = {
  email: 'john.doe@email.com',
  password: 'password123',
};

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;
  let usersService: UsersService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('signUp', () => {
    it('should create a new user successfully', async () => {
      mockUsersService.create.mockResolvedValue(mockUserWithoutPassword);

      const result = await service.signUp(signUpDto);

      expect(result).toEqual(mockUserWithoutPassword);
      expect(usersService.create).toHaveBeenCalledWith(signUpDto);
      expect(usersService.create).toHaveBeenCalledTimes(1);
    });

    it('should throw an error when user creation fails', async () => {
      const error = new Error('Email already in use.');
      mockUsersService.create.mockRejectedValue(error);

      await expect(service.signUp(signUpDto)).rejects.toThrow(
        'Email already in use.',
      );
      expect(usersService.create).toHaveBeenCalledWith(signUpDto);
    });

    it('should pass all signup data to users service', async () => {
      const customSignUpDto: SignUpDto = {
        email: 'test@example.com',
        name: 'Test User',
        password: 'testpassword',
      };
      mockUsersService.create.mockResolvedValue(mockUserWithoutPassword);

      await service.signUp(customSignUpDto);

      expect(usersService.create).toHaveBeenCalledWith(customSignUpDto);
    });
  });

  describe('login', () => {
    beforeEach(() => {
      (mockResponse.cookie as jest.Mock).mockClear();
    });

    it('should login successfully with valid credentials', async () => {
      const accessToken = 'jwt-token-123';
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      (compareHash as jest.Mock).mockResolvedValue(true);
      mockJwtService.sign.mockReturnValue(accessToken);

      const result = await service.login(loginDto, mockResponse);

      expect(result).toEqual({ access_token: accessToken });
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: loginDto.email },
      });
      expect(compareHash).toHaveBeenCalledWith(
        loginDto.password,
        mockUser.password,
      );
      expect(jwtService.sign).toHaveBeenCalledWith({
        email: mockUser.email,
        sub: mockUser.id,
        role: mockUser.role,
      });
    });

    it('should set httpOnly cookie with correct options', async () => {
      const accessToken = 'jwt-token-123';
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      (compareHash as jest.Mock).mockResolvedValue(true);
      mockJwtService.sign.mockReturnValue(accessToken);

      await service.login(loginDto, mockResponse);

      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'access_token',
        accessToken,
        {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          expires: expect.any(Date),
          sameSite: 'strict',
        },
      );
    });

    it('should throw BadRequestException when user is not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.login(loginDto, mockResponse)).rejects.toThrow(
        new BadRequestException('Invalid credentials'),
      );
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: loginDto.email },
      });
      expect(compareHash).not.toHaveBeenCalled();
      expect(jwtService.sign).not.toHaveBeenCalled();
      expect(mockResponse.cookie).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when password is invalid', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      (compareHash as jest.Mock).mockResolvedValue(false);

      await expect(service.login(loginDto, mockResponse)).rejects.toThrow(
        new BadRequestException('Invalid credentials'),
      );
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: loginDto.email },
      });
      expect(compareHash).toHaveBeenCalledWith(
        loginDto.password,
        mockUser.password,
      );
      expect(jwtService.sign).not.toHaveBeenCalled();
      expect(mockResponse.cookie).not.toHaveBeenCalled();
    });

    it('should handle database errors properly', async () => {
      const databaseError = new Error('Database connection failed');
      mockPrismaService.user.findUnique.mockRejectedValue(databaseError);

      await expect(service.login(loginDto, mockResponse)).rejects.toThrow(
        'Database connection failed',
      );
      expect(compareHash).not.toHaveBeenCalled();
      expect(jwtService.sign).not.toHaveBeenCalled();
    });

    it('should handle compareHash errors properly', async () => {
      const hashError = new Error('Hash comparison failed');
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      (compareHash as jest.Mock).mockRejectedValue(hashError);

      await expect(service.login(loginDto, mockResponse)).rejects.toThrow(
        'Hash comparison failed',
      );
      expect(jwtService.sign).not.toHaveBeenCalled();
    });

    it('should create JWT payload with correct user data', async () => {
      const accessToken = 'jwt-token-123';
      const customUser = {
        ...mockUser,
        id: 'custom-id',
        email: 'custom@email.com',
        role: 'ADMIN',
      };
      mockPrismaService.user.findUnique.mockResolvedValue(customUser);
      (compareHash as jest.Mock).mockResolvedValue(true);
      mockJwtService.sign.mockReturnValue(accessToken);

      await service.login(loginDto, mockResponse);

      expect(jwtService.sign).toHaveBeenCalledWith({
        email: customUser.email,
        sub: customUser.id,
        role: customUser.role,
      });
    });

    it('should set cookie expiration to 8 hours from now', async () => {
      const accessToken = 'jwt-token-123';
      const beforeTest = Date.now();
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      (compareHash as jest.Mock).mockResolvedValue(true);
      mockJwtService.sign.mockReturnValue(accessToken);

      await service.login(loginDto, mockResponse);

      const cookieCall = (mockResponse.cookie as jest.Mock).mock.calls[0];
      const cookieOptions = cookieCall[2];
      const expirationTime = cookieOptions.expires.getTime();
      const expectedExpiration = beforeTest + 8 * 60 * 60 * 1000;

      expect(expirationTime).toBeGreaterThanOrEqual(expectedExpiration - 1000);
      expect(expirationTime).toBeLessThanOrEqual(expectedExpiration + 1000);
    });
  });
});
