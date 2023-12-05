
import createCacheStyle, {
  insertStyles,
  insertStylesServer,
} from '../cache';
import { createHash } from '../hash/createHash';
import { serialize } from '../serialize/serialize';
import { insertStyleSheet } from '../style-sheet/style-sheet-insertRules';

import { ownValue , ownkey, removeDoubleSpace, removeLabel} from '../utils';
import { createRules } from './create.rules';

// ......................................
////  utils
// ......................................

const isBrowser = typeof document !== 'undefined';

// ......................................
////  create Css String To Style
// ......................................

//--- creates the css string that will be inserted in the style tag
export const createCssStringToStyle = (array) => {
  return array.map((m) => {
    const key = ownkey(m);
    const classname = key.startsWith('@') ? key : `${key}`;
    const value = ownValue(m);
    const str = `${classname} { ${removeLabel(value)} }`;
    return removeDoubleSpace(str);
  });
};

// ......................................
////  process Styles
// ......................................

const processStyles = (cache, serialized) => {
  if (isBrowser) {
    //--- insertStyles
    insertStyles(
      cache,
      {
        name: serialized.name,
        styles: serialized.styles,
      },
      false
    );

    //--- createStyleSheet
    insertStyleSheet(cache, {
      name: serialized.name,
      styles: createCssStringToStyle(serialized.styles),
    });

    console.log('[CLIENT]: INSERTED...', { serialized, eCache: cache });
  } else {
    //--- insertStylesServer (cache.inserted is an array on the server)
    insertStylesServer(
      cache,
      {
        name: serialized.name,
        styles: serialized.styles,
      },
      false
    );

    console.log('          ');
    // console.log(
    //   `   [SERVER]: INSERTED...`,
    //   JSON.stringify({ serialized, eCache: cache }, null, 2)
    // );
  }

  return serialized.name.startsWith('.')
    ? serialized.name.slice(1)
    : serialized.name;
};

//--- debug
const processInstanceDebug = (cache, rules, classnameRoot) => {
  const serialized = serialize(rules, classnameRoot);
  console.log({
    processInstance: serialized,
    rules,
    cache,
  });
};

// ......................................
////  process Instance
// ......................................

const processInstance = (cache, rules, classnameRoot) => {
  if (isBrowser) {
    // //--- debug
    // // processInstanceDebug(cache, rules, classnameRoot);
    // // return classnameRoot;

    //--- Because in cache inserted the key is just the hash
    const classnameHash = classnameRoot.replace(`${cache.key}-`, '');

    //--- client
    if (cache.inserted && cache.inserted[classnameHash]) {
      console.log('[CLIENT]: CACHE...', { classnameRoot, eCache: cache });
      return classnameRoot;
    } else {
      const serialized = serialize(rules, classnameRoot);
      return processStyles(cache, serialized);
    }
  } else {
    //--- server
    if (classnameRoot.startsWith('css-')) {
      return classnameRoot;
    }

    const serialized = serialize(rules, classnameRoot);
    return processStyles(cache, serialized);
  }
};

// ......................................
////  ccsInstance
// ......................................

const ccsInstance = (cache, args, values) => {
  const key = cache.key;
  const rules = createRules(args, values);

  const hash = createHash(rules);

  const classnameRoot = `${key}-${hash}`;

  return processInstance(cache, rules, classnameRoot);
};

// ......................................
////  create Instance ('css')
// ......................................

let createInstance = (options) => {
  let cache = createCacheStyle(options, '_CSS');

  let css = (args, ...values) => {
    const classname = ccsInstance(cache, args, values);

    return classname;
  };

  return { css, cache };
};

// ......................................
////  create Instance With Cache by STYLED-V2
// ......................................

export const createInstanceWithCache = (cache, options) => {
  cache.key = cache.key
    ? cache.key
    : options && options.key
    ? options.key
    : 'css';

  let css = (args, ...values) => {
    const classname = ccsInstance(cache, args, values);

    return classname;
  };

  return { css, cache };
};

export default createInstance;
