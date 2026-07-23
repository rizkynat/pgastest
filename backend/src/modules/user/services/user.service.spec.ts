import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { PrismaService } from '../../../prisma/prisma.service';

describe('UserService', () => {
  let service: UserService;
  let prisma: any;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  };

  const mockUser = {
    id: 'b1bf6d86-afee-43d1-8a3f-d13fe3147824',
    email: 'test@example.com',
    password: '$2b$10$jEEstRcnSFaYO/JOao.zfeUzB7spE9p/YN5FWnw2aL24UT0jCL4ze',
    createdAt: new Date('2025-10-09T15:18:29.155Z'),
    updatedAt: new Date('2025-10-09T15:18:29.155Z'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);

    prisma = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findByEmail', () => {
    it('should find a user by email', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.findByEmail('test@example.com');

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
      expect(prisma.user.findUnique).toHaveBeenCalledTimes(1);

      expect(result).toEqual(mockUser);
    });

    it('should return null when user is not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      const result = await service.findByEmail('nonexistent@example.com');

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'nonexistent@example.com' },
      });

      expect(result).toBeNull();
    });

    it('should handle different email formats', async () => {
      const emails = ['user@example.com', 'test.user@domain.co.uk', 'name+tag@example.org'];

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      for (const email of emails) {
        await service.findByEmail(email);

        expect(prisma.user.findUnique).toHaveBeenCalledWith({
          where: { email },
        });
      }

      expect(prisma.user.findUnique).toHaveBeenCalledTimes(emails.length);
    });

    it('should handle database errors', async () => {
      mockPrismaService.user.findUnique.mockRejectedValue(new Error('Database connection failed'));

      await expect(service.findByEmail('test@example.com')).rejects.toThrow(
        'Database connection failed',
      );

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
    });
  });

  describe('create', () => {
    it('should create and save a new user', async () => {
      const userData = {
        full_name: 'New User',
        email: 'newuser@example.com',
        password: '$2b$10$hashedPassword',
      };

      const createdUser = {
        ...userData,
        id: 'c2cf7e97-bfff-54e2-9b4g-e24gf4258935',
        createdAt: new Date('2025-10-09T15:18:29.155Z'),
        updatedAt: new Date('2025-10-09T15:18:29.155Z'),
      };

      mockPrismaService.user.create.mockResolvedValue(createdUser);

      const result = await service.create(userData);

      expect(prisma.user.create).toHaveBeenCalledWith({ data: userData });
      expect(result).toEqual(createdUser);
    });

    it('should create user with only required fields', async () => {
      const userData = {
        full_name: 'Minimal User',
        email: 'minimal@example.com',
        password: '$2b$10$anotherHash',
      };

      mockPrismaService.user.create.mockResolvedValue({
        ...userData,
        id: 'd3d3d3d3-3333-3333-3333-333333333333',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await service.create(userData);

      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          full_name: expect.any(String),
          email: expect.any(String),
          password: expect.any(String),
        },
      });
    });

    it('should handle save errors', async () => {
      const userData = {
        full_name: 'Error User',
        email: 'error@example.com',
        password: '$2b$10$hash',
      };

      mockPrismaService.user.create.mockRejectedValue(new Error('Duplicate key error'));

      await expect(service.create(userData)).rejects.toThrow('Duplicate key error');

      expect(prisma.user.create).toHaveBeenCalledWith({ data: userData });
    });

    it('should properly hash and store password', async () => {
      const userData = {
        full_name: 'Secure User',
        email: 'secure@example.com',
        password: '$2b$10$jEEstRcnSFaYO/JOao.zfeUzB7spE9p/YN5FWnw2aL24UT0jCL4ze',
      };

      const savedUser = {
        ...userData,
        id: 'e4e4e4e4-4444-4444-4444-444444444444',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.user.create.mockResolvedValue(savedUser);

      const result = await service.create(userData);

      expect(result.password).toBe(userData.password);
      expect(result.password).toMatch(/^\$2b\$/);
    });
  });

  describe('findById', () => {
    it('should find a user by id', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.findById('b1bf6d86-afee-43d1-8a3f-d13fe3147824');

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'b1bf6d86-afee-43d1-8a3f-d13fe3147824' },
      });
      expect(prisma.user.findUnique).toHaveBeenCalledTimes(1);

      expect(result).toEqual(mockUser);
    });

    it('should return null when user is not found by id', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      const result = await service.findById('nonexistent-uuid');

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'nonexistent-uuid' },
      });

      expect(result).toBeNull();
    });

    it('should handle different UUID formats', async () => {
      const uuids = [
        'a1a1a1a1-1111-1111-1111-111111111111',
        'b2b2b2b2-2222-2222-2222-222222222222',
        'c3c3c3c3-3333-3333-3333-333333333333',
      ];

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      for (const uuid of uuids) {
        await service.findById(uuid);

        expect(prisma.user.findUnique).toHaveBeenCalledWith({
          where: { id: uuid },
        });
      }

      expect(prisma.user.findUnique).toHaveBeenCalledTimes(uuids.length);
    });

    it('should handle database errors when finding by id', async () => {
      mockPrismaService.user.findUnique.mockRejectedValue(new Error('Database timeout'));

      await expect(service.findById('b1bf6d86-afee-43d1-8a3f-d13fe3147824')).rejects.toThrow(
        'Database timeout',
      );
    });

    it('should return complete user object with all fields', async () => {
      const completeUser = {
        id: 'f5f5f5f5-5555-5555-5555-555555555555',
        email: 'complete@example.com',
        password: '$2b$10$completeHash',
        createdAt: new Date('2025-10-09T15:18:29.155Z'),
        updatedAt: new Date('2025-10-09T16:30:45.678Z'),
      };

      mockPrismaService.user.findUnique.mockResolvedValue(completeUser);

      const result = await service.findById('f5f5f5f5-5555-5555-5555-555555555555');

      expect(result).toEqual(completeUser);
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('email');
      expect(result).toHaveProperty('password');
      expect(result).toHaveProperty('createdAt');
      expect(result).toHaveProperty('updatedAt');
    });
  });
});
