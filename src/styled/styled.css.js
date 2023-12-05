import { createRules } from '../css/create.rules';
import { removeDoubleSpace } from '../utils';

// ......................................
////  apply Func Case Function
// ......................................

export const applyFuncCaseFunction = (props) => (value) => {
  return typeof value === 'function' ? value(props) : value;
};

// ......................................
////  access To Values
// ......................................

const accessToValues = (obj, fn) => {
  if (Array.isArray(obj)) {
    for (let i = 0; i < obj.length; i++) {
      accessToValues(obj[i], fn);
    }
  } else if (typeof obj === 'object') {
    for (const key in obj) {
      obj[key] = fn(obj[key]);
      accessToValues(obj[key], fn);
    }
  }

  return obj;
};

// ......................................
////  css Object
// ......................................

//--- props => parameter applied in function in 'createElementWithComponent'
export const applyFuncObject = (obj) => (props) => {
  return accessToValues(obj, applyFuncCaseFunction(props));
};

// ......................................
////  apply function in string case
// ......................................

const irregularCommas = (str) => {
  return str
    .replaceAll(/(;){1,}/gm, '; ')
    .replaceAll(/;\s{1,};/gm, '; ')
    .replaceAll('};', '}')
    .trim();
};

// ......................................
//// apply function To Values
// ......................................

const applyFunctionToValues = (props, fnValues, args) => {
  const newValues = fnValues.reduce((acc, fn, index) => {
    //--- applying the function by passing the props
    const rules = createRules(fn(props));

    if (!rules) {
      return (acc = acc.replace('__F__', ''));
    }

    const str = rules.endsWith(';') ? `${rules}  ` : `${rules};`;
    return (acc = acc.replace('__F__', str));
  }, args);

  //--- Fixes irregular commas after applying the function
  return removeDoubleSpace(irregularCommas(newValues));
};

// ......................................
////  apply function in string case
// ......................................

export const applyFuncString = (rules, values) => (props) => {
  //--- props => parameter applied in function in 'createElementWithComponent'
  if (!values.length) {
    return rules;
  }
  //--- only applies the function if there are functions
  const fnValues = values.flat().filter((f) => typeof f === 'function');

  if (!fnValues.length) {
    return rules;
  }

  //--- applying the function passing the props
  return applyFunctionToValues(props, fnValues, rules);
};
