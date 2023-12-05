import { compose } from '../utils';

const parseCssArray =
  (fn) =>
  ([head, ...tail], result = []) => {
    let index = 0;
    if (!head) {
      return result;
    }
    let array = [head, ...tail];
    const current = head; //.trim()
    const next = tail[0];

    const [cssString, nextArray] = fn(current, next, index, array);

    // console.log({ current, next, array, cssString, nextArray });
    result.push(cssString);
    tail = nextArray ? nextArray : tail;

    return parseCssArray(fn)(tail, result);
  };

// ......................................
////  accumulateMultValues
// ......................................

const accumulateMultValues = ([head, ...tail], fn, result = []) => {
  if (!head) {
    return result;
  }
  if (fn(head)) {
    return accumulateMultValues([], fn, [...result, head]);
  }
  return accumulateMultValues(tail, fn, [...result, head]);
};

// ......................................
////  declFn
// ......................................

const filterArray = (index, limiter, array) => {
  return array.filter((_, i) => i < index || i > index + limiter);
};

/*--- declarations with multiple values e.g. border: 2mm rgba(211, 220,50,.8);*/
const declFn = (current, next, index, array) => {
  if (next && current.endsWith(':')) {
    const slice = array.slice(index + 1);
    const accumulated = accumulateMultValues(slice, (x) =>
      x.trim().endsWith(';')
    );

    const cssString = `${current} ${accumulated.join(' ')}`;
    const filteredArray = filterArray(index, accumulated.length, array);

    return [cssString, filteredArray];
  }
  return [current];
};

// ......................................
////  classnamesFn
// ......................................

/*--- 
 classnames with multiple names
  e.g. .class-1 .class-2 , element attribules .... || @keyframes
 */
const classnamesFn = (current, next, index, array) => {
  //--- ignore atrules for example @media because it doesn't have multiple classes
  if (
    current.startsWith('.') ||
    current.startsWith('&.') ||
    current.startsWith('&:') ||
    current.includes('@')
  ) {
    if (next && next !== '{') {
      const slice = array.slice(index + 1);
      const accumulated = accumulateMultValues(slice, (x) =>
        x.trim().endsWith('{')
      ).slice(0, -1);

      const cssString = `${current} ${accumulated.join(' ')}`;

      const filteredArray = filterArray(index, accumulated.length, array);
      return [cssString, filteredArray];
    }
    //--- single clasname
    return [current];
  }

  return [current];
};

// ......................................
////  stringToArray
// ......................................

const stringToArray = (str) =>
  str
    .split(' ')
    .filter(Boolean)
    .filter((f) => !f.includes('undefined'));

// ......................................
////  sanitizeArray
// ......................................

const sanitizeArray = compose(
  parseCssArray(classnamesFn),
  parseCssArray(declFn),
  stringToArray
);

// ......................................
////  css To Array
// ......................................

export const cssToArray = (str) => {

  return sanitizeArray(str);
};
