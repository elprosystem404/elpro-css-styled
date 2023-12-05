// ......................................
////  compose
// ......................................

export const compose =
  (...fns) =>
  (arg) =>
    fns.reduceRight((acc, fn) => (fn ? fn(acc) : acc), arg);

// ......................................
////  partition
// ......................................

const accept = ([x, ...xs], fn, index = 0) => {
  if (undef(x)) return [];
  if (fn(x, index)) {
    return [x, ...accept(xs, fn, (index += 1))];
  } else {
    return [...accept(xs, fn, (index += 1))];
  }
};

const reject = ([x, ...xs], fn, index = 0) => {
  if (undef(x)) return [];
  if (!fn(x, index)) {
    return [x, ...reject(xs, fn, (index += 1))];
  } else {
    return [...reject(xs, fn, (index += 1))];
  }
};

// ......................................
////  partition
// ......................................

export const partition = (xs, fn) => [accept(xs, fn), reject(xs, fn)];

export const def = (x) => typeof x !== 'undefined' && x !== null;
export const undef = (x) => !def(x);

//--- pattern
export const labelPattern = /label:\s*([^\s;\n{]+)\s*(;|$)/g;
export const lineBreakPattern = /(\r\n|\n|\r)/gm;
export const removeCommentPattern = /\/\*[\s\S]*?\*\//g;
export const inLineCommentsPattern = /(\/\/).*?__\$__/gm;


//--- regex
export const newRegexExp = (pattern, flag = '') => {
  const regex = new RegExp(pattern, flag);
  regex.lastIndex = 0;
  return regex;
};
export const regExp = {
  regex: (pattern, flag) => newRegexExp(pattern, flag),
  match: (str, pattern, flag) => str.match(regExp.regex(pattern, flag)) || [],
  test: (str, pattern, flag) => regExp.regex(pattern, flag).test(str),
  exec: (str, pattern, flag) => regExp.regex(pattern, flag).exec(str) || [],
};

//--- object
export const ownkey = (obj) => Object.keys(obj)[0];
export const ownValue = (obj) => Object.values(obj)[0];
export const arrayOwnProperties = (obj) =>
  isArray(obj) ? obj : Object.keys(obj).map((m) => ({ [m]: obj[m] }));

//--- remove
export const removeDoubleSpace = (x) =>
  isArray(x)
    ? x.map((str) => str.replace(/\s{2,}/g, ' '))
    : x.replace(/\s{2,}/g, ' ');
export const removeLabel = (str) => str.replace(labelPattern, '');
export const removeSpace = (str) => str.split(/\s+/).join('');
export const removeLineBreak = (str) => str.replaceAll(lineBreakPattern, '');

//--- is
export const isArray = (x) => Array.isArray(x);
export const isObject = (x) =>
  x != null && !Array.isArray(x) && typeof x === 'object';
export const isString = (x) => def(x) && typeof x === 'string';
export const isFunc = (x) => def(x) && typeof x === 'function';
export const isBrowser = typeof document !== 'undefined';
export const isPlainObject = (x) =>
  x !== null &&
  typeof x === 'object' &&
  x.constructor.name === Object.name &&
  !('props' in x && x.$$typeof);
export const isFalsish = (x) =>
  x === undefined || x === null || x === false || x === '';

//---  Memoize

export const memoize = (func, src) => {
  const cache = {};
  return (...args) => {
    const key = JSON.stringify(args);
    if (!cache[key]) {
      cache[key] = func(...args);
    }
    console.log('memodized...', `[ ${src} ]`);
    return cache[key];
  };
};
