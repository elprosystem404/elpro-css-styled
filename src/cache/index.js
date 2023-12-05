import { newRegexExp,  ownValue,  ownkey, regExp, removeDoubleSpace, removeLabel } from '../utils';

const isBrowser = typeof document !== 'undefined';

export const insertDocument = (cache) => {
  const date = new Date();
  cache.document = {
    isBrowser,
    environment: isBrowser ? 'client' : 'server',
    created_at: date.toLocaleString('pt-BR', {
      timeZone: 'America/Sao_Paulo',
    }),
    id: `${cache.key}-${date.getTime() + Math.random()}`,
  };
};

//---
const stylesToCssString = (styles) => {
  return styles.reduce((acc, prev) => {
    const key = ownkey(prev);
    const classname = key.startsWith('.') ? key : `.${key}`;
    const value = ownValue(prev);
    const css = ` ${classname} { ${removeLabel(value)} }`;
    acc += css;
    return acc.trim();
  }, '');
};

export const registerStyles = (cache, serialized) => {
  if (!serialized.styles) {
    return cache;
  }

  //--- 'serialized.name' contains classnameHash
  cache.registered = {
    ...cache.registered,
    [serialized.name]: removeDoubleSpace(stylesToCssString(serialized.styles)),
  };
};

// ......................................
////  insert Styles
// ......................................

export const insertStyles = (cache, serialized) => {
  const name = serialized.name;
  const propKey = name.startsWith('.') ? name.slice(1) : name;
  const classnameHash = propKey.replace(`${cache.key}-`, '');
  serialized.styles.forEach((element) => {
    const key = ownkey(element);
    const value = ownValue(element);
    cache.insert(cache, {
      name: classnameHash,
      styles: { [key]: value },
    });
  });

  registerStyles(cache, {
    name: classnameHash,
    styles: serialized.styles,
  });

  insertDocument(cache);
  return cache;
};

// ......................................
////  insert Styles Server
// ......................................

export const insertStylesServer = (cache, serialized) => {
  let insert = [];
  registerStyles(cache, serialized);
  serialized.styles.forEach((element) => {
    const key = Object.keys(element)[0];
    insert.push({
      name: key.startsWith('.') ? key.slice(1) : key,
      styles: element,
    });
  });

  insertDocument(cache);
  const _cache = cache.insert(cache, {
    name: serialized.name,
    styles: insert,
  });
  return _cache;
};

/*---e.g. ["elpro", "_E_", ".elpro-165cwbw", "elpro-165cwbw" ]*/
const getClassnameHash = (attr) => {
  const arr = attr.split(' ');
  const key = arr[0];
  const str = arr[2] || arr[1];
  const hash = str
    .replace(`${key}-`, '')
    .match(/[0-9a-z]+/)[0]
    .trim();

  return hash;
};

// ......................................
////  Global cache
// ......................................

//--- Global cache
let insertedStyled = isBrowser ? {} : [];
let insertedCss = isBrowser ? {} : [];

// ......................................
////  processCreateCacheStyle
// ......................................

const processCreateCacheStyle = (key, inserted, src) => {
  let registered = {};
  let insert;
  let compact = false;
  const nodesToHydrate = [];

  if (isBrowser) {
    const ssrStyles = document.querySelectorAll(
      `style[data-e-style^="${key} "]`
      );

    let classnameHash = undefined;

    Array.prototype.forEach.call(ssrStyles, (node, i) => {
      const dataAttribute = node.getAttribute('data-e-style');

      const cssText = node.innerHTML;
      classnameHash = getClassnameHash(dataAttribute);
 
      //--- for 'Process Instance' to identify whether it exists in cache or not
      registered[classnameHash] = registered[classnameHash]
        ? (registered[classnameHash] += ` ${cssText}`)
        : ` ${cssText}`;
      registered[classnameHash] = registered[classnameHash].trim();
      inserted = { ...inserted, [classnameHash]: true };

      compact = true;
      nodesToHydrate.push(node);
    });
    // client
    insert = (cache, serialized) => {
      if (!cache.inserted[serialized.name]) {
        compact = true;
        inserted = { ...cache.inserted, [serialized.name]: true };
        cache.inserted = inserted;
        //--- saving to global cache
        if (key === 'css') {
          insertedCss = cache.inserted;
        } else {
          insertedStyled = cache.inserted;
        }
        return cache;
      }
    };
  } else {
    // server
    insert = (cache, serialized) => {
      if (!cache.compact) {
        //--- prevents duplicate insertion
        const hasCach = cache.inserted.findIndex(
          (elel) => elel.name === serialized.name
        );
        if (hasCach >= 0) {
          return cache;
        }

        inserted = serialized.styles.flat();
        cache.inserted = [...cache.inserted, ...inserted];
        //--- saving to global cache
        if (key === 'css') {
          insertedCss = cache.inserted;
        } else {
          insertedStyled = cache.inserted;
        }

        return cache;
      }
    };
  }

  const cache = {
    src,
    document: {},
    key: key,
    compact,
    sheet: { tags: nodesToHydrate },
    registered: registered,
    inserted: inserted,
    insert,
  };
  insertDocument(cache);

  return cache;
};

// ......................................
////  createCacheStyle
// ......................................

const createCacheStyle = (options, src) => {
  const key = options && options.key ? options.key : 'css';
  return src === '_CSS'
    ? processCreateCacheStyle(key, insertedCss, src)
    : processCreateCacheStyle(key, insertedStyled, src);
};

export default createCacheStyle;
