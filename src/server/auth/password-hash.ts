import { scrypt, timingSafeEqual } from 'node:crypto';

// Format: scrypt:N:r:p:saltBase64:keyBase64. Colons are used because Next.js expands $VAR in .env files.
const HASH_PATTERN = /^scrypt:(\d+):(\d+):(\d+):([A-Za-z0-9+/]+={0,2}):([A-Za-z0-9+/]+={0,2})$/;

export type ParsedPasswordHash = {
  cost: number;
  blockSize: number;
  parallelization: number;
  salt: Buffer;
  key: Buffer;
};

function isPowerOfTwo(value: number): boolean {
  return value > 1 && (value & (value - 1)) === 0;
}

export function parsePasswordHash(value: string): ParsedPasswordHash | null {
  const match = HASH_PATTERN.exec(value);
  if (!match) return null;
  const [, n, r, p, saltText, keyText] = match;
  const cost = Number(n);
  const blockSize = Number(r);
  const parallelization = Number(p);
  if (!isPowerOfTwo(cost) || cost < 2 ** 14 || cost > 2 ** 20) return null;
  if (blockSize < 1 || blockSize > 32 || parallelization < 1 || parallelization > 16) return null;
  const salt = Buffer.from(saltText ?? '', 'base64');
  const key = Buffer.from(keyText ?? '', 'base64');
  if (salt.length < 16 || key.length < 32 || key.length > 64) return null;
  return { cost, blockSize, parallelization, salt, key };
}

function deriveKey(password: string, hash: ParsedPasswordHash): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(
      password,
      hash.salt,
      hash.key.length,
      {
        N: hash.cost,
        r: hash.blockSize,
        p: hash.parallelization,
        maxmem: 256 * hash.cost * hash.blockSize,
      },
      (error, derived) => (error ? reject(error) : resolve(derived)),
    );
  });
}

export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  const parsed = parsePasswordHash(storedHash);
  if (!parsed) return false;
  const derived = await deriveKey(password, parsed);
  return derived.length === parsed.key.length && timingSafeEqual(derived, parsed.key);
}
