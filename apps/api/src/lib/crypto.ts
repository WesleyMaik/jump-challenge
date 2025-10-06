import { compare, hash } from 'bcrypt';

export async function generateHash(plainText: string): Promise<string> {
  return await hash(plainText, 12);
}

export async function compareHash(
  plainText: string,
  hash: string,
): Promise<boolean> {
  return await compare(plainText, hash);
}
