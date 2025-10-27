import { AuthService } from '../auth.service';
import { prisma } from '../../config/prisma';

jest.mock('@backend/config/prisma', () => ({
  prisma: {
    user: {
      create: jest.fn(),
      findUnique: jest.fn(),
    },
  },
}));

describe('AuthService', () => {
  const authService = new AuthService();

  it('should create a new user', async () => {
    const user = {
      id: '1',
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      token: 'token',
      confirmed: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    (prisma.user.create as jest.Mock).mockResolvedValue(user);

    const createdUser = await authService.createUser(
      user.name,
      user.email,
      user.password
    );

    expect(createdUser).toBeDefined();
    expect(createdUser.name).toBe(user.name);
    expect(createdUser.email).toBe(user.email);
    expect(prisma.user.create).toHaveBeenCalledTimes(1);
  });
});