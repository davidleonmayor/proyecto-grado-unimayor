import request from 'supertest';
import Server from '../../server';
import { prisma } from '../../config/prisma';
import { checkPassword } from '../../auth/utils/password';

// Mock the password utility
jest.mock('@backend/auth/utils/password', () => ({
  ...jest.requireActual('@backend/auth/utils/password'),
  checkPassword: jest.fn(),
}));

// Mock the prisma client
jest.mock('@backend/config/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  },
}));

// Mock the AuthEmail module
jest.mock('@backend/email/AuthEmail', () => ({
  AuthEmail: {
    sendConfirmationEmail: jest.fn(),
  },
}));

const server = new Server();
const app = server['app'];

describe('Auth Controller', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/create-account', () => {
    it('should create a new user and return it', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password123!',
      };

      const user = {
        id: '1',
        ...userData,
        token: 'token',
        confirmed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.user.create as jest.Mock).mockResolvedValue(user);

      const response = await request(app)
        .post('/api/auth/create-account')
        .send(userData);

      expect(response.status).toBe(201);
      expect(response.body.user.name).toBe(userData.name);
      expect(response.body.user.email).toBe(userData.email);
      expect(response.body.message).toBe(
        'Usuario registrado correctamente. Revisa tu email para confirmar tu cuenta.'
      );
    });
  });

  describe('POST /api/auth/confirm-account', () => {
    it('should confirm the account', async () => {
      const user = {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password123!',
        token: '123456',
        confirmed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(user);
      (prisma.user.update as jest.Mock).mockResolvedValue({ ...user, confirmed: true, token: null });

      const response = await request(app)
        .post('/api/auth/confirm-account')
        .send({ token: '123456' });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Cuenta confirmada exitosamente. Ya puedes iniciar sesión.');
    });
  });

  describe('POST /api/auth/login', () => {
    const loginCredentials = {
      email: 'test@example.com',
      password: 'Password123!',
    };

    it('should login the user and return a token', async () => {
      const user = {
        id: '1',
        name: 'Test User',
        email: loginCredentials.email,
        password: 'hashedpassword',
        token: null,
        confirmed: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(user);
      (checkPassword as jest.Mock).mockResolvedValue(true);

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginCredentials);

      expect(response.status).toBe(200);
      expect(response.body.token).toBeDefined();
    });
  });
});
