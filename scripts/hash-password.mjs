// Creates an APP_PASSWORD_HASH value interactively.
// The password is read from the terminal without echo and never passes through command arguments.
import { randomBytes, scrypt } from 'node:crypto';
import { stdin, stdout } from 'node:process';

const COST = 32768;
const BLOCK_SIZE = 8;
const PARALLELIZATION = 1;
const KEY_LENGTH = 32;

function readHidden(prompt) {
  return new Promise((resolve, reject) => {
    if (!stdin.isTTY) {
      reject(new Error('Run this script directly in an interactive terminal.'));
      return;
    }
    stdout.write(prompt);
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding('utf8');
    let value = '';
    const onData = (chunk) => {
      for (const char of chunk) {
        if (char === '\r' || char === '\n') {
          stdin.setRawMode(false);
          stdin.pause();
          stdin.off('data', onData);
          stdout.write('\n');
          resolve(value);
          return;
        }
        if (char === '\u0003') {
          stdin.setRawMode(false);
          stdout.write('\n');
          process.exit(130);
        }
        if (char === '\u007f' || char === '\b') {
          value = value.slice(0, -1);
        } else {
          value += char;
        }
      }
    };
    stdin.on('data', onData);
  });
}

function derive(password, salt) {
  return new Promise((resolve, reject) => {
    scrypt(
      password,
      salt,
      KEY_LENGTH,
      { N: COST, r: BLOCK_SIZE, p: PARALLELIZATION, maxmem: 256 * COST * BLOCK_SIZE },
      (error, key) => (error ? reject(error) : resolve(key)),
    );
  });
}

async function main() {
  const password = await readHidden('Password: ');
  if (password.length < 12) {
    console.error('The password must be at least 12 characters.');
    process.exit(1);
  }
  const confirmation = await readHidden('Repeat password: ');
  if (password !== confirmation) {
    console.error('The passwords do not match.');
    process.exit(1);
  }
  const salt = randomBytes(16);
  const key = await derive(password, salt);
  const hash = [
    'scrypt',
    COST,
    BLOCK_SIZE,
    PARALLELIZATION,
    salt.toString('base64'),
    key.toString('base64'),
  ].join(':');
  console.log('\nCopy this line into .env.local or the Vercel env:');
  console.log(`APP_PASSWORD_HASH=${hash}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
