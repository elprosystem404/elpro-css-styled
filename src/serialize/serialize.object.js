import { isFalsish, isFunc, isPlainObject } from '../utils';
import { unitlessKeys } from '../utils/unitlessKeys';
import { serializeString } from './serialize.string';



const isUpper = (c) => c >= 'A' && c <= 'Z';


// ......................................
//// add Unit If Needed
// ......................................

function addUnitIfNeeded(name, value) {
  if (value == null || typeof value === 'boolean' || value === '') {
    return '';
  }
  if (
    typeof value === 'number' &&
    value !== 0 &&
    !(name in unitlessKeys) &&
    !name.startsWith('--')
  ) {
    return `${value}px`;
  }

  return String(value).trim();
}


// ......................................
//// hyphenate
// ......................................

export  function hyphenate(string) {
  let output = '';

  for (let i = 0; i < string.length; i++) {
    const c = string[i];
    // Check for CSS variable prefix
    if (i === 1 && c === '-' && string[0] === '-') {
      return string;
    }

    if (isUpper(c)) {
      output += '-' + c.toLowerCase();
    } else {
      output += c;
    }
  }

  return output.startsWith('ms-') ? '-' + output : output;
}


// ......................................
////  obj To CssString
// ......................................

export const objToCssString = (obj) => {
  const rules = [];

  for (const key in obj) {
    const val = obj[key];
    if (!obj.hasOwnProperty(key) || isFalsish(val)) continue;

    if ((Array.isArray(val) ) || isFunc(val)) {
      rules.push(`${hyphenate(key)}:`, val, ';');
    } else if (isPlainObject(val)) {
      rules.push(`${key} {`, ...objToCssString(val), '}');
    } else { 
      rules.push(`${hyphenate(key)}: ${addUnitIfNeeded(key, val)};`);
    }
  }

  return rules.join('');
};

// ......................................
////  serialize Object
// ......................................

export const serializeObject = (args, classnameRoot) => {
 return serializeString (objToCssString(args), classnameRoot)
};



