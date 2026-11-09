/**
 * Reversible Bijective Feistel Obfuscation for Order IDs.
 * Generates aesthetic, non-sequential Stripe-style order tokens: `ord_k9Xm2Lpd`.
 */

const BASE_ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

function generateShuffledAlphabet(salt: string): string {
  const chars = BASE_ALPHABET.split('');
  let hash = 0;
  for (let i = 0; i < salt.length; i++) {
    hash = (Math.imul(hash, 31) + salt.charCodeAt(i)) >>> 0;
  }
  for (let i = chars.length - 1; i > 0; i--) {
    hash = (Math.imul(hash, 1664525) + 1013904223) >>> 0;
    const j = hash % (i + 1);
    const temp = chars[i];
    chars[i] = chars[j];
    chars[j] = temp;
  }
  return chars.join('');
}

const ALPHABET = generateShuffledAlphabet("vieguard-order-salt-2026");
const ROUND_KEYS = [0x9e3779b9, 0x7f4a7c15, 0x3c6ef372, 0xdaa66d2b];

function roundFunction(val: number, key: number): number {
  let x = (val ^ key) >>> 0;
  x = Math.imul(x, 0x45d9f3b) >>> 0;
  x = (x ^ (x >>> 7)) >>> 0;
  x = Math.imul(x, 0x119de1f3) >>> 0;
  return (x & 0xffff) >>> 0;
}

function feistelEncrypt(val: number): number {
  let l = (val >>> 16) & 0xffff;
  let r = val & 0xffff;

  for (let i = 0; i < 4; i++) {
    const newL = r;
    const newR = (l ^ roundFunction(r, ROUND_KEYS[i])) & 0xffff;
    l = newL;
    r = newR;
  }
  return (((l << 16) >>> 0) | r) >>> 0;
}

function feistelDecrypt(val: number): number {
  let l = (val >>> 16) & 0xffff;
  let r = val & 0xffff;

  for (let i = 3; i >= 0; i--) {
    const prevR = l;
    const prevL = (r ^ roundFunction(l, ROUND_KEYS[i])) & 0xffff;
    l = prevL;
    r = prevR;
  }
  return (((l << 16) >>> 0) | r) >>> 0;
}

function uintToBase62(val: number): string {
  let n = val >>> 0;
  const chars: string[] = [];
  const base = 62;
  for (let i = 0; i < 6; i++) {
    chars.push(ALPHABET[n % base]);
    n = Math.floor(n / base);
  }
  return chars.join('');
}

function base62ToUint(str: string): number {
  const base = 62;
  let n = 0;
  let power = 1;
  for (let i = 0; i < str.length; i++) {
    const idx = ALPHABET.indexOf(str[i]);
    if (idx === -1) return -1;
    n += idx * power;
    power *= base;
  }
  return n >>> 0;
}

export function encodeOrderId(id: number | string | bigint): string {
  const num = Number(id);
  if (!Number.isInteger(num) || num <= 0 || num > 0x7fffffff) {
    return String(id);
  }
  const mixed = feistelEncrypt(num);
  const code = uintToBase62(mixed);
  return `ord_${code}`;
}

export function decodeOrderId(input: string | number | undefined | null): number | null {
  if (input === undefined || input === null) return null;
  const str = String(input).trim();
  if (/^\d+$/.test(str)) {
    const val = parseInt(str, 10);
    return val > 0 ? val : null;
  }
  if (!str.startsWith('ord_')) return null;
  const raw = str.slice(4);
  if (raw.length !== 6) return null;
  const mixed = base62ToUint(raw);
  if (mixed < 0) return null;
  const original = feistelDecrypt(mixed);
  if (original <= 0 || original > 0x7fffffff) return null;
  return original;
}
