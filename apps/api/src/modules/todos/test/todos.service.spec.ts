import { Test, TestingModule } from '@nestjs/testing';
import { TodosService } from '../todos.service';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma, Todo, Status } from '@prisma/client';

const mockPrismaService = {
  todo: {
    findUnique: jest.fn(),
    create: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
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
      expect(prisma.todo.findMany).toHaveBeenCalledTimes(1);
    });

    it('should return an empty array when no todos exist', async () => {
      mockPrismaService.todo.findMany.mockResolvedValue([]);

      const result = await service.getAll();

      expect(result).toEqual([]);
      expect(prisma.todo.findMany).toHaveBeenCalledTimes(1);
    });
  });

  describe('getById', () => {
    it('should return a todo when a valid ID is provided', async () => {
      mockPrismaService.todo.findUnique.mockResolvedValue(mockTodo);

      const result = await service.getById(mockTodo.id);

      expect(result).toEqual(mockTodo);
      expect(prisma.todo.findUnique).toHaveBeenCalledWith({
        where: { id: mockTodo.id },
      });
    });

    it('should throw a Todo not found when todo is not found', async () => {
      const invalidId = 'invalid-uuid';
      mockPrismaService.todo.findUnique.mockResolvedValue(null);

      await expect(service.getById(invalidId)).rejects.toThrow(
        'Todo not found.',
      );
      expect(prisma.todo.findUnique).toHaveBeenCalledWith({
        where: { id: invalidId },
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

      const result = await service.create(createTodoDto);

      expect(result).toEqual(mockTodo);
      expect(prisma.todo.create).toHaveBeenCalledWith({
        data: createTodoDto,
      });
      expect(prisma.todo.create).toHaveBeenCalledTimes(1);
    });

    it('should throw Invalid user ID if the user ID is invalid', async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError(
        'Foreign key constraint failed',
        { code: 'P2003', clientVersion: 'x.x.x' },
      );
      mockPrismaService.todo.create.mockRejectedValue(prismaError);

      await expect(service.create(createTodoDto)).rejects.toThrow(
        'Invalid user ID.',
      );
    });
  });

  describe('update', () => {
    it('should update a todo and return it', async () => {
      const todoId = mockTodo.id;
      const updateTodoDto = {
        title: 'Updated Title',
      };
      const updatedTodo = { ...mockTodo, ...updateTodoDto };
      mockPrismaService.todo.update.mockResolvedValue(updatedTodo);

      const result = await service.update(todoId, updateTodoDto);

      expect(result).toEqual(updatedTodo);
      expect(prisma.todo.update).toHaveBeenCalledWith({
        where: { id: todoId },
        data: updateTodoDto,
      });
    });

    it('should throw Invalid todo data on validation error', async () => {
      const todoId = mockTodo.id;
      const invalidData = { title: 'Test' };
      const prismaError = new Prisma.PrismaClientValidationError(
        'Validation failed',
        { clientVersion: 'x.x.x' },
      );
      mockPrismaService.todo.update.mockRejectedValue(prismaError);

      await expect(service.update(todoId, invalidData)).rejects.toThrow(
        'Invalid todo data.',
      );
    });

    it('should throw Todo not found when todo does not exist', async () => {
      const todoId = 'non-existent-id';
      const updateData = { title: 'Test' };
      const prismaError = new Prisma.PrismaClientKnownRequestError(
        'Record not found',
        { code: 'P2025', clientVersion: 'x.x.x' },
      );
      mockPrismaService.todo.update.mockRejectedValue(prismaError);

      await expect(service.update(todoId, updateData)).rejects.toThrow(
        'Todo not found.',
      );
    });
  });

  describe('delete', () => {
    it('should delete a todo and return it', async () => {
      mockPrismaService.todo.delete.mockResolvedValue(mockTodo);

      const result = await service.delete(mockTodo.id);

      expect(result).toEqual(mockTodo);
      expect(prisma.todo.delete).toHaveBeenCalledWith({
        where: { id: mockTodo.id },
      });
      expect(prisma.todo.delete).toHaveBeenCalledTimes(1);
    });

    it('should throw Todo not found when todo does not exist', async () => {
      const todoId = 'non-existent-id';
      const prismaError = new Prisma.PrismaClientKnownRequestError(
        'Record not found',
        { code: 'P2025', clientVersion: 'x.x.x' },
      );
      mockPrismaService.todo.delete.mockRejectedValue(prismaError);

      await expect(service.delete(todoId)).rejects.toThrow('Todo not found.');
    });
  });
});
