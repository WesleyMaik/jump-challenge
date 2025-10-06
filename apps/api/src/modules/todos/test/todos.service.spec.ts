import { Test, TestingModule } from '@nestjs/testing';
import { TodosService } from '../todos.service';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma, Todo, Status } from '@prisma/client';

const mockPrismaService = {
  todo: {
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
  },
};

const mockTodo: Todo = {
  id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  title: 'Test Todo',
  description: 'This is a test todo',
  status: Status.IN_PROGRESS,
  userId: 'user-id-123',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const createTodoDto = {
  title: 'Test Todo',
  description: 'This is a test todo',
  status: Status.IN_PROGRESS,
  userId: 'user-id-123',
};

describe('TodosService', () => {
  let service: TodosService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TodosService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<TodosService>(TodosService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAll', () => {
    it('should return an array of todos', async () => {
      const mockTodos = [mockTodo];
      mockPrismaService.todo.findMany.mockResolvedValue(mockTodos);

      const result = await service.getAll();

      expect(result).toEqual(mockTodos);
      expect(prisma.todo.findMany).toHaveBeenCalledWith({
        orderBy: {
          createdAt: 'desc',
        },
      });
    });

    it('should return an empty array when no todos exist', async () => {
      mockPrismaService.todo.findMany.mockResolvedValue([]);

      const result = await service.getAll();

      expect(result).toEqual([]);
      expect(prisma.todo.findMany).toHaveBeenCalledTimes(1);
    });
  });

  describe('getByIdAndUserId', () => {
    it('should return a todo when a valid ID and userId are provided', async () => {
      mockPrismaService.todo.findFirst.mockResolvedValue(mockTodo);

      const result = await service.getByIdAndUserId(
        mockTodo.id,
        mockTodo.userId,
      );

      expect(result).toEqual(mockTodo);
      expect(prisma.todo.findFirst).toHaveBeenCalledWith({
        where: {
          id: mockTodo.id,
          userId: mockTodo.userId,
        },
      });
    });

    it('should throw Todo not found when todo is not found', async () => {
      const invalidId = 'invalid-uuid';
      const userId = 'user-id-123';
      mockPrismaService.todo.findFirst.mockResolvedValue(null);

      await expect(service.getByIdAndUserId(invalidId, userId)).rejects.toThrow(
        'Todo not found.',
      );
      expect(prisma.todo.findFirst).toHaveBeenCalledWith({
        where: {
          id: invalidId,
          userId: userId,
        },
      });
    });
  });

  describe('getByUserId', () => {
    it('should return todos for a specific user', async () => {
      const mockTodos = [mockTodo];
      mockPrismaService.todo.findMany.mockResolvedValue(mockTodos);

      const result = await service.getByUserId('user-id-123');

      expect(result).toEqual(mockTodos);
      expect(prisma.todo.findMany).toHaveBeenCalledWith({
        where: {
          userId: 'user-id-123',
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    });

    it('should return an empty array when user has no todos', async () => {
      mockPrismaService.todo.findMany.mockResolvedValue([]);

      const result = await service.getByUserId('user-id-123');

      expect(result).toEqual([]);
      expect(prisma.todo.findMany).toHaveBeenCalledTimes(1);
    });
  });

  describe('create', () => {
    it('should create a new todo and return it', async () => {
      mockPrismaService.todo.create.mockResolvedValue(mockTodo);

      const result = await service.create(createTodoDto, mockTodo.userId);

      expect(result).toEqual(mockTodo);
      expect(prisma.todo.create).toHaveBeenCalledWith({
        data: {
          ...createTodoDto,
          userId: mockTodo.userId,
        },
      });
      expect(prisma.todo.create).toHaveBeenCalledTimes(1);
    });

    it('should throw Invalid user ID if the user ID is invalid', async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError(
        'Foreign key constraint failed',
        { code: 'P2003', clientVersion: 'x.x.x' },
      );
      mockPrismaService.todo.create.mockRejectedValue(prismaError);

      await expect(
        service.create(createTodoDto, mockTodo.userId),
      ).rejects.toThrow('Invalid user ID.');
    });
  });

  describe('updateByIdAndUserId', () => {
    it('should update a todo and return it', async () => {
      const updateTodoDto = { title: 'Updated Todo' };
      const updatedTodo = { ...mockTodo, ...updateTodoDto };

      mockPrismaService.todo.updateMany.mockResolvedValue({ count: 1 });
      mockPrismaService.todo.findFirst.mockResolvedValue(updatedTodo);

      const result = await service.updateByIdAndUserId(
        mockTodo.id,
        updateTodoDto,
        mockTodo.userId,
      );

      expect(result).toEqual(updatedTodo);
      expect(prisma.todo.updateMany).toHaveBeenCalledWith({
        where: {
          id: mockTodo.id,
          userId: mockTodo.userId,
        },
        data: updateTodoDto,
      });
    });

    it('should throw Todo not found when todo does not exist', async () => {
      const updateTodoDto = { title: 'Updated Todo' };
      mockPrismaService.todo.updateMany.mockResolvedValue({ count: 0 });

      await expect(
        service.updateByIdAndUserId('invalid-id', updateTodoDto, 'user-id'),
      ).rejects.toThrow('Todo not found.');
    });

    it('should throw Invalid todo data on validation error', async () => {
      const invalidData = { title: '' };
      const prismaError = new Prisma.PrismaClientValidationError(
        'Validation failed',
        { clientVersion: 'x.x.x' },
      );
      mockPrismaService.todo.updateMany.mockRejectedValue(prismaError);

      await expect(
        service.updateByIdAndUserId(mockTodo.id, invalidData, mockTodo.userId),
      ).rejects.toThrow('Invalid todo data.');
    });
  });

  describe('deleteByIdAndUserId', () => {
    it('should delete a todo and return success message', async () => {
      mockPrismaService.todo.deleteMany.mockResolvedValue({ count: 1 });

      const result = await service.deleteByIdAndUserId(
        mockTodo.id,
        mockTodo.userId,
      );

      expect(result).toEqual({ message: 'Todo deleted successfully' });
      expect(prisma.todo.deleteMany).toHaveBeenCalledWith({
        where: {
          id: mockTodo.id,
          userId: mockTodo.userId,
        },
      });
      expect(prisma.todo.deleteMany).toHaveBeenCalledTimes(1);
    });

    it('should throw Todo not found when todo does not exist', async () => {
      mockPrismaService.todo.deleteMany.mockResolvedValue({ count: 0 });

      await expect(
        service.deleteByIdAndUserId('invalid-id', 'user-id'),
      ).rejects.toThrow('Todo not found.');
    });
  });
});
