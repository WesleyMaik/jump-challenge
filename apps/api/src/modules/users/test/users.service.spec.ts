import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../users.service';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma, User } from '@prisma/client';
import { generateHash } from '@/lib/crypto';

jest.mock('@/lib/crypto', () => ({
  generateHash: jest.fn(),
}));

const mockPrismaService = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

const mockUser: User = {
  id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  email: 'john.doe@email.com',
  name: 'John Doe',
  role: 'CLIENT',
  password: 'hashedpassword123',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const createUserDto = {
  email: 'john.doe@email.com',
  name: 'John Doe',
  role: 'CLIENT' as const,
  password: 'password123',
};

describe('UsersService', () => {
  let service: UsersService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAll', () => {
    it('should return an array of users', async () => {
      const mockUsers = [mockUser];
      mockPrismaService.user.findMany.mockResolvedValue(mockUsers);

      const result = await service.getAll();

      expect(result).toEqual(mockUsers);
      expect(prisma.user.findMany).toHaveBeenCalledTimes(1);
    });

    it('should return an empty array when no users exist', async () => {
      mockPrismaService.user.findMany.mockResolvedValue([]);

      const result = await service.getAll();

      expect(result).toEqual([]);
      expect(prisma.user.findMany).toHaveBeenCalledTimes(1);
    });
  });

  describe('getById', () => {
    it('should return a user when a valid ID is provided', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.getById(mockUser.id);

      expect(result).toEqual(mockUser);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: mockUser.id },
      });
    });

    it('should throw a User not found when user is not found', async () => {
      const invalidId = 'invalid-uuid';
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.getById(invalidId)).rejects.toThrow(
        'User not found.',
      );
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: invalidId },
      });
    });
  });

  describe('create', () => {
    it('should create a new user with hashed password and return it', async () => {
      const hashedPassword = 'hashedpassword123';
      (generateHash as jest.Mock).mockResolvedValue(hashedPassword);
      mockPrismaService.user.create.mockResolvedValue(mockUser);

      const result = await service.create(createUserDto);

      expect(result).toEqual(mockUser);
      expect(generateHash).toHaveBeenCalledWith(createUserDto.password);
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          ...createUserDto,
          password: hashedPassword,
        },
      });
      expect(prisma.user.create).toHaveBeenCalledTimes(1);
    });

    it('should throw a Email already in use if the email is already in use', async () => {
      const hashedPassword = 'hashedpassword123';
      (generateHash as jest.Mock).mockResolvedValue(hashedPassword);

      const prismaError = new Prisma.PrismaClientKnownRequestError(
        'Unique constraint failed',
        { code: 'P2002', clientVersion: 'x.x.x' },
      );
      mockPrismaService.user.create.mockRejectedValue(prismaError);

      await expect(service.create(createUserDto)).rejects.toThrow(
        'Email already in use.',
      );
    });
  });

  describe('update', () => {
    it('should update a user and return it', async () => {
      const userId = mockUser.id;
      const updateUserDto = {
        name: 'Updated Name',
      };
      const updatedUser = { ...mockUser, ...updateUserDto };
      mockPrismaService.user.update.mockResolvedValue(updatedUser);

      const result = await service.update(userId, updateUserDto);

      expect(result).toEqual(updatedUser);
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: updateUserDto,
      });
    });

    it('should throw Invalid user data on validation error', async () => {
      const userId = mockUser.id;
      const invalidData = { name: 'Test' };
      const prismaError = new Prisma.PrismaClientValidationError(
        'Validation failed',
        { clientVersion: 'x.x.x' },
      );
      mockPrismaService.user.update.mockRejectedValue(prismaError);

      await expect(service.update(userId, invalidData)).rejects.toThrow(
        'Invalid user data.',
      );
    });

    it('should throw User not found when user does not exist', async () => {
      const userId = 'non-existent-id';
      const updateData = { name: 'Test' };
      const prismaError = new Prisma.PrismaClientKnownRequestError(
        'Record not found',
        { code: 'P2025', clientVersion: 'x.x.x' },
      );
      mockPrismaService.user.update.mockRejectedValue(prismaError);

      await expect(service.update(userId, updateData)).rejects.toThrow(
        'User not found.',
      );
    });

    it('should throw Email already in use when email is already in use', async () => {
      const userId = mockUser.id;
      const updateData = { name: 'Doe John' };
      const prismaError = new Prisma.PrismaClientKnownRequestError(
        'Unique constraint failed',
        { code: 'P2002', clientVersion: 'x.x.x' },
      );
      mockPrismaService.user.update.mockRejectedValue(prismaError);

      await expect(service.update(userId, updateData)).rejects.toThrow(
        'Email already in use.',
      );
    });
  });

  describe('delete', () => {
    it('should delete a user and return it', async () => {
      mockPrismaService.user.delete.mockResolvedValue(mockUser);

      const result = await service.delete(mockUser.id);

      expect(result).toEqual(mockUser);
      expect(prisma.user.delete).toHaveBeenCalledWith({
        where: { id: mockUser.id },
      });
      expect(prisma.user.delete).toHaveBeenCalledTimes(1);
    });

    it('should throw User not found when user does not exist', async () => {
      const userId = 'non-existent-id';
      const prismaError = new Prisma.PrismaClientKnownRequestError(
        'Record not found',
        { code: 'P2025', clientVersion: 'x.x.x' },
      );
      mockPrismaService.user.delete.mockRejectedValue(prismaError);

      await expect(service.delete(userId)).rejects.toThrow('User not found.');
    });
  });
});
