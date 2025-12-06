import * as bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

export const hashPassword = async (plain: string): Promise<string> => {
  const hashed = await bcrypt.hash(plain, SALT_ROUNDS);
  return hashed;
};

export const comparePassword = async (plain: string, hash: string): Promise<boolean> => {
  const isMatch = await bcrypt.compare(plain, hash);
  return isMatch;
};
