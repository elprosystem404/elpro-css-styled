import { isArray, removeDoubleSpace } from '../utils';
import { sanitizeCriticalChars } from './sanitize.critical.chars';
import { prettify } from './sanitize.prettify';

// ......................................
////  sanitizeString
// ......................................

const sanitizeString = (str) => {
  const sanitized = sanitizeCriticalChars(str);
 
  const string = prettify(sanitized);

  return string
};

// ......................................
////  sanitize
// ......................................

export const sanitize = (x) => {
  if (!x) {
    return isArray(x) ? [] : '';
  }

  return isArray(x) ? x.map((_x) => sanitizeString(_x)) : sanitizeString(x);
};
