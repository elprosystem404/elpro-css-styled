import {
  isObject,
  removeDoubleSpace,
  removeCommentPattern,
  inLineCommentsPattern,
} from '../utils';

// ......................................
////   Patterns
// ......................................

// ......................................
////  remove Comment
// ......................................

const replacementInLineComments = (str) => (match, p1, p2, p3) => {
  const preserveHTTP = str.substring(p2 - 10, p2);
  return preserveHTTP.includes('http') ? match : '';
};

//---  e.g. // ...COMMENTS
const removeInLineComments = (str) => {
  return str.replaceAll(inLineCommentsPattern, replacementInLineComments(str));
};

//---  e.g. /* COMMENTS */
const removeMultLineComments = (str) => {
  return str.replaceAll(removeCommentPattern, '');
};

// ......................................
////  remove Comment
// ......................................

//---  single-line or multi-line
export const removeComments = (str) => {
  /*--- remove all comments  */
  return removeInLineComments(removeMultLineComments(`__$__${str}__$__`));
};

// ......................................
////  insert Marks
// ......................................

const removeMarks = (str, marks) => {
  return str.replaceAll(marks, '');
};

const breakLine = (str, mark) => {
  return str
    .replaceAll('\n', '  \n  ')
    .replaceAll('\\n', '  \\n  ')
    .replaceAll('\n', mark)
    .replaceAll('\r', mark)
    .replaceAll('\\n', mark);
};

const insertMarks = (args) => {
  return Array.isArray(args)
    ? args.map((str) => breakLine(str, '__$__'))
    : breakLine(args, '__$__');
};

const createValuesMarks = (values) => {
  return values.flat().map((v) => (typeof v === 'function' ? '__F__' : v));
};

const finalizeRules = (str) => {
  return removeDoubleSpace(removeMarks(removeComments(str), '__$__')).trim();
};

const interpolations = (args, values) => {
  const argsMarks = insertMarks(args);
  const strRaw = String.raw({ raw: argsMarks }, ...values);

  return finalizeRules(strRaw);
};

// ......................................
////  create Rules
// ......................................

export const createRules = (args, ...values) => {
  values = Array.isArray(values) ? values.flat() : [values].flat();
  if (!args) {
    return '';
  }
  if (values.flat().length) {
    if (isObject(args)) {
      return args;
    } else {
      const valuesMarks = createValuesMarks(values);
      const rules = interpolations(args, valuesMarks);
      return rules;
    }
  } else {
    const rules = interpolations(args, values);
    return rules;
  }
};
