import { objToCssString } from '../serialize/serialize.object';
import { memoize, removeSpace } from '../utils';

export function murmur2(str) {
  if (!str) return '0';
  var h = 0;
  // Mix 4 bytes at a time into the hash
  var k,
    i = 0,
    len = str.length;
  for (; len >= 4; ++i, len -= 4) {
    k =
      (str.charCodeAt(i) & 0xff) |
      ((str.charCodeAt(++i) & 0xff) << 8) |
      ((str.charCodeAt(++i) & 0xff) << 16) |
      ((str.charCodeAt(++i) & 0xff) << 24);

    k =
      /* Math.imul(k, m): */
      (k & 0xffff) * 0x5bd1e995 + (((k >>> 16) * 0xe995) << 16);
    k ^= /* k >>> r: */ k >>> 24;

    h =
      /* Math.imul(k, m): */
      ((k & 0xffff) * 0x5bd1e995 + (((k >>> 16) * 0xe995) << 16)) ^
      /* Math.imul(h, m): */
      ((h & 0xffff) * 0x5bd1e995 + (((h >>> 16) * 0xe995) << 16));
  }

  // Handle the last few bytes of the input array

  switch (len) {
    case 3:
      h ^= (str.charCodeAt(i + 2) & 0xff) << 16;
    case 2:
      h ^= (str.charCodeAt(i + 1) & 0xff) << 8;
    case 1:
      h ^= str.charCodeAt(i) & 0xff;
      h =
        /* Math.imul(h, m): */
        (h & 0xffff) * 0x5bd1e995 + (((h >>> 16) * 0xe995) << 16);
  }

  // Do a few final mixes of the hash to ensure the last few
  // bytes are well-incorporated.

  h ^= h >>> 13;
  h =
    /* Math.imul(h, m): */
    (h & 0xffff) * 0x5bd1e995 + (((h >>> 16) * 0xe995) << 16);

  return ((h ^ (h >>> 15)) >>> 0).toString(36);
}

// ......................................
////  createHash
// ......................................

const _createHash = (string) => {
  let charArray = string.split('');
  const hash = charArray.reduce((hash, char) => {
    return hash + char.charCodeAt(0) || hash;
  }, 0);
  return hash < 0 ? (hash * -1).toString() : hash.toString();
};

const hashInObject = (value) => {
  const hashKey = _createHash(removeSpace(Object.keys(value).join('')));
  const hashValue = _createHash(removeSpace(Object.values(value).join('')));
  const hash = `${hashKey}-${hashValue}`;
  return hash.toString();
};

const completeHash = (value) => {
  if (typeof value === 'object') {
    const hash = hashInObject(value);
    const target = objToCssString(value);
    return {
      uniqueKey: murmur2(removeSpace(target)),
      context: hash,
      value,
    };
  }
  const hash = hashInObject({ css: value });
  const target = value;
  return {
    uniqueKey: murmur2(removeSpace(target)),
    context: hash,
    value,
  };
};

const createHashMemoized = memoize((string) => {
  return murmur2(string);
}, 'hash');

// ......................................
////  createHash
// ......................................

export const createHash = (value, opt = false) => {
  if (!value) {
    return '';
  }
  if (!opt) {
    const string = typeof value === 'string' ? value : objToCssString(value);
    return createHashMemoized(removeSpace(string));
  }
  return completeHash(value);
};

export const SEED = 5381;

// When we have separate strings it's useful to run a progressive
// version of djb2 where we pretend that we're still looping over
// the same string
export const phash = (h, x) => {
  let i = x.length;

  while (i) {
    h = (h * 33) ^ x.charCodeAt(--i);
  }

  return h;
};

// This is a djb2 hashing function
export const hash = (x) => {
  return phash(SEED, x);
};
