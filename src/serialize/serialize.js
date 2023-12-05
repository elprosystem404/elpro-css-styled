import {
  arrayOwnProperties,
  regExp,
  removeDoubleSpace,
} from '../utils/index.js';
import { serializeObject } from './serialize.object.js';
import { serializeString } from './serialize.string.js';

// ......................................
////  prettier
// ......................................

const prettierString = (str) => removeDoubleSpace(str).trim();

export const prettier = (obj) => {
  return Object.entries(obj).reduce((acc, [key, value]) => {
    return {
      ...acc,
      [prettierString(key)]: prettierString(value),
    };
  }, {});
};

const getLabelHash = (str) => {
  const match = str.split(' ');
  return match[0];
};

// ......................................
////  resolver Atrules
// ......................................

// const _resolverAtrules = ([current, ...tail], result = {}) => {
//   if (!current) {
//     return result;
//   }
//   const [key, value] = current;

//   const match = regExp.match(key, /@(.*?)\)/gm, '');
//   const matchString = key.replace(match[0], '').replaceAll(' :', ':');

//   const stringKey = removeDoubleSpace(matchString.trim());

//   if (stringKey.includes('@')) {
//     return _resolverAtrules([[stringKey, value], ...tail], result);
//   } else {
//     const labelHash = getLabelHash(key);
//     const str = ` ${stringKey} { label: ${labelHash}; ${value} } `;

//     result[match[0]] = result[match[0]]
//       ? (result[match[0]] += str)
//       : (result[match[0]] = str);
//     return _resolverAtrules(tail, result);
//   }
// };

// ......................................
////  resolver Keyframes
// ......................................

const resolverKeyframes = (array) => {
  return array.reduce((acc, [key, value]) => {
    if (!value) {
      return acc;
    }
    const propArray = key.split(' ');
    const prop = `${propArray[propArray.length - 2]}`;
    const rulename = `${propArray[propArray.length - 1]}`;
    const labelHash = getLabelHash(key);
    const str = `label: ${labelHash}; ${value} `;

    acc[`@keyframes ${rulename}`] = acc[`@keyframes ${rulename}`]
      ? (acc[`@keyframes ${rulename}`] += str)
      : (acc[`@keyframes ${rulename}`] = str);
    return acc;
  }, {});
};

// ......................................
////  resolver Rulename
// ......................................

const resolverRulename = (array) => {
  return array.reduce((acc, [key, value]) => {
    const labelHash = getLabelHash(key);
    const k = key.includes('@') ? key.match(/@.*/gm)[0].trim() : key;
    return { ...acc, [k]: `label: ${labelHash}; ${value}` };
  }, {});
};

const resolverAtrules = (atrules) => {

  return atrules.reduce((acc, [key, value]) => {
    const labelHash = getLabelHash(value);
    return {
      ...acc,
      [key]: `label: ${labelHash}; ${value}`,
    };
  }, {});
};

// ......................................
////  resolver
// ......................................

const resolver = (styles) => {

  const serialized = styles.reduce((acc, prev) => {
    const key = prev.name.includes('@') ? prev.name : prev.props.join(' ');
    const value = prev.value.join(' ');
   
    return {
      ...acc,
      [key]: value,
    };
  }, {});

  //--- rules
  const rules = Object.entries(serialized).reduce(
    (acc, [key, value]) => {
  
      const prop = regExp.test(key, /@(.*?)\)/gm, '')
        ? 'atrule'
        : regExp.test(key, /@keyframes/gm, '')
        ? 'keyframes'
        : 'rulename';

      acc[prop] = { ...acc[prop], [key]: value };
      return acc;
    },
    {
      rulename: {},
      atrule: {},
      keyframes: {},
    }
  );

  const rulenames = resolverRulename(Object.entries(rules.rulename));
  const atrules = resolverAtrules(Object.entries(rules.atrule));
  const keyframes = resolverKeyframes(Object.entries(rules.keyframes));
  
  return prettier({ ...rulenames, ...atrules, ...keyframes });
};

// ......................................
////  serializeResolver
// ......................................

const serializeResolver = (styles) => arrayOwnProperties(resolver(styles));

// ......................................
////  serialize
// ......................................

export const serialize = (args, classnameRoot) => {

  return typeof args === 'string'
    ? {
        name: classnameRoot,
        styles: serializeResolver(serializeString(args, classnameRoot)),
      }
    : {
        name: classnameRoot,
        styles: serializeResolver(serializeObject(args, classnameRoot)),
      };
};
