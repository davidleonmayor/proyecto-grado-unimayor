import { hashPassword, checkPassword } from '../password';

describe('password utils', () => {
  it('should hash a password', async () => {
    const password = 'password123';
    const hashedPassword = await hashPassword(password);
    expect(hashedPassword).not.toBe(password);
    expect(hashedPassword).toBeDefined();
  });

  it('should check a password', async () => {
    const password = 'password123';
    const hashedPassword = await hashPassword(password);
    const isMatch = await checkPassword(password, hashedPassword);
    expect(isMatch).toBe(true);
  });

  it('should return false for a wrong password', async () => {
    const password = 'password123';
    const wrongPassword = 'wrongpassword';
    const hashedPassword = await hashPassword(password);
    const isMatch = await checkPassword(wrongPassword, hashedPassword);
    expect(isMatch).toBe(false);
  });
});
