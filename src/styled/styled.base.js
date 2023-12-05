import { isObject } from '../utils';
import {
  createComponentFn,
  createElementWithObject,
  createElementWithString,
} from './styled.createElement';
import { applyFuncObject, applyFuncString } from './styled.css';
import { createRules } from '../css/create.rules';

// ......................................
////  attrs
// ......................................

function attrs(tag) {
  return function attrs(attr) {
    //--- parameters passed to styledV2
    return function (args, ...values) {
      if (isObject(args)) {
        return createElementWithObject(tag, args, attr, []);
      } else {
        return createElementWithString(tag, args, attr, values);
      }
    };
  };
}

// ......................................
////  tagFn
// ......................................

function tagFn(tag) {
  //--- parameters passed to styledV2
  return function tags(args, ...values) {
    if (isObject(args)) {
      return createElementWithObject(tag, args, {}, []);
    } else {
      return createElementWithString(tag, args, {}, values);
    }
  };
}

const defineProperty = (obj, prop) => {
  Object.defineProperty(obj, 'attrs', {
    value: attrs(prop),
    enumerable: true,
    writable: true,
  });
};

let target = {};
const tagElement = (tag) => {
  target[tag] = tagFn(tag);
  defineProperty(target[tag], tag);
  return target;
};

// ......................................
////  styledV2Fn
// ......................................

function styledV2Fn(component) {
  //--- parameters passed to styledV2
  return function (args, ...values) {
    const rules = createRules(args, values);

    if (isObject(args)) {
      return createComponentFn(component, applyFuncObject(rules));
    } else {
      return createComponentFn(component, applyFuncString(rules, values));
    }
  };
}

const handler = {
  get(target, tag) {
    target = tagElement(tag);
    return target[tag];
  },
  apply: function (target, thisArg, argumentsList) {
    return target(argumentsList[0]);
  },
};

// ......................................
////  styled V2
// ......................................

let styledV2;

styledV2 = new Proxy(styledV2Fn, handler);

export { styledV2 };
