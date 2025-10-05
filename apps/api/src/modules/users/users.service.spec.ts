import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';

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

  describe('findOne', () => {
    it('should return a user when a valid ID is provided', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      const result = await service.getById(mockUser.id);

      expect(result).toEqual(mockUser);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: mockUser.id },
      });
    });

    it('should throw a NotFoundException when an invalid ID is provided', async () => {
      const invalidId = 'invalid-uuid';
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.getById(invalidId)).rejects.toThrow(
        NotFoundException,
      );
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: invalidId },
      });
    });
  });

  describe('create', () => {
    it('should create a new user and return it', async () => {
      const createUserDto = mockUser;
      mockPrismaService.user.create.mockResolvedValue(mockUser);

      const result = await service.create(createUserDto);

      expect(result).toEqual(mockUser);
      expect(prisma.user.create).toHaveBeenCalledWith({ data: createUserDto });
      expect(prisma.user.create).toHaveBeenCalledTimes(1);
    });

    it('should throw a ConflictException if the email is already in use', async () => {
      const createUserDto = mockUser;
      const prismaError = new Prisma.PrismaClientKnownRequestError(
        'Unique constraint failed',
        { code: 'P2002', clientVersion: 'x.x.x' },
      );
      mockPrismaService.user.create.mockRejectedValue(prismaError);

      await expect(service.create(createUserDto)).rejects.toThrow(
        ConflictException,
      );
      expect(prisma.user.create).toHaveBeenCalledWith({ data: createUserDto });
    });
  });

  describe('update', () => {
    it('should update a user and return it', async () => {
      const userId = mockUser.id;
      const updateUserDto = {
        name: 'Updated Name',
        password: 'updatedpassword123',
      };
      mockPrismaService.user.update.mockResolvedValue(mockUser);

      const result = await service.update(userId, updateUserDto);

      expect(result).toEqual(mockUser);
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: {
          name: updateUserDto.name,
          password: updateUserDto.password,
        },
      });
    });
  });

  describe('delete', () => {
    it('should delete a user and return it', async () => {
      const deleteUserDto = mockUser;
      mockPrismaService.user.delete.mockResolvedValue(mockUser);

      const result = await service.delete(deleteUserDto.id);

      expect(result).toEqual(mockUser);
      expect(prisma.user.delete).toHaveBeenCalledWith({
        where: { id: deleteUserDto.id },
      });
      expect(prisma.user.delete).toHaveBeenCalledTimes(1);
    });
  });
});
