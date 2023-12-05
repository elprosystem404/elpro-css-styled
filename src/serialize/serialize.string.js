import sanitize from '../sanitize';
import { memoize, partition } from '../utils';

import { cssToArray } from './serialize.cssToArray';
import { replaceProps, replaceName } from './serialize.replace';
import { extractToChunks, tokenizer } from './serialize.tokenizer';

// ......................................
////  hasChildren
// ......................................

export const hasChildren = (obj) => {
  return obj.children.length ? true : false;
};

// ......................................
////   tokenizer Root Children Child
// ......................................

let count = 0;
const tokenizerRootChildrenChild = (child, props, result = []) => {
  if (count === 30) {
    return result;
  }

  const value = child.value;
  const tokenized = tokenizer(value);
  const rootChildren = createRoot(tokenized, value, props);
  props = [...props, child.name].flat();

  //--- children
  if (hasChildren(rootChildren)) {
    return tokenized
      .map((m) => {
        return tokenizerRootChildrenChild(
          m,
          props,
          [
            ...result,
            {
              ...rootChildren,
              type: '',
              name: child.name,
              props: props,
            },
          ].flat()
        );
      })
      .flat();
  } else {
    //--- root
    return [
      ...result.flat(),
      {
        ...rootChildren,
        type: '',
        name: child.name,
        props: props,
      },
    ].flat();
  }
};

const getNameAtrules = (props) => {
  return props.filter((f) => f.includes('@'))[0];
};

// ......................................
////  tokenizerRootChildren
// ......................................

const tokenizerRootChildren = (child, tokenized, rootChildren) => {
  const children = tokenized
    .map((m) => tokenizerRootChildrenChild(m, rootChildren.props))
    .flat();

  return [
    ...children.map((child) => {
      const props = child.props.flat();
      const name = props.join(' ').includes('@')
        ? getNameAtrules(props)
        : child.name;
      return {
        ...child,
        props,
        name: name,
        type: 'children-root-children',
      };
    }),
  ];
};

// ......................................
////  processChildren
// ......................................

const processChildren = (child, classnameRoot) => {
  const { value, name } = child;
  const classname = [`${classnameRoot}`, name];

  if (
    name.includes('@') &&
    !name.includes('@media') &&
    !name.includes('@document')
  ) {
    return [
      {
        children: [],
        name: name,
        props: classname, //[classnameRoot],
        type: 'children-root-atrule',
        value: child.value,
      },
    ];
  }

  //--- root with children
  const tokenized = tokenizer(value);
  const rootChildren = createRoot(tokenized, value, classname);
  // console.log({child, tokenized, rootChildren, value});
  if (hasChildren(rootChildren)) {
    const rootChildrenChild = tokenizerRootChildren(
      child,
      tokenized,
      rootChildren
    );

    const props = rootChildren.props.flat();
    const name = child.name;

    return [
      {
        ...rootChildren,
        children: [],
        name: name,
        props: props,
        type: 'children-root',
      },
      ...rootChildrenChild,
    ].flat();
  } else {
    //--- root without children
    const props = rootChildren.props.flat();
    const _name = child.name;

    return [
      {
        ...rootChildren,
        name: _name,
        props: props,
        type: 'children-root',
      },
    ].flat();
  }
};

// ......................................
////  value Root
// ......................................

const valueRoot = (tokenized, init) =>
  tokenized.reduce((acc, tokens) => {
    acc = acc.replaceAll(`${tokens.name} { ${tokens.value.join(' ')} }`, '');
    return acc;
  }, init);

// ......................................
////   create Root
// ......................................

const createRoot = (tokenized, array, props) => {
  const init = array.join(' ');
  props = props.flat();
  const name = props[props.length - 1];
  const value = valueRoot(tokenized, init).split(' ').filter(Boolean);

  return {
    children: tokenized.map((child) => processChildren(child, name)).flat(),
    name: name,
    props: props,
    type: 'root',
    value: value,
  };
};

// ......................................
////  parseProps
// ......................................

const parseProps = (childrens, classnameRoot) => {
  return childrens.reduce((acc, child) => {
    const propsArray = child.props.map((str) => str.trim());

    if (propsArray.length === 1) {
      return [...acc, child];
    }

    if (child.name.includes('@')) {
      const props = replaceProps.sigleSelectors(
        propsArray.filter((f) => !f.includes('@'))
      );

      const name = child.name; //replaceName(child.name, classnameRoot);

      return [...acc, { ...child, props, name }];
    }

    //--- mult selectors
    if (child.name.includes(',')) {
      const [propsRoot, propsMult] = replaceProps.multSlectors(propsArray);

      const props = propsMult;
      const name = replaceName(child.name, propsRoot);

      return [...acc, { ...child, props, name }];
    }

    //--- sigle selectors
    const props = replaceProps.sigleSelectors(propsArray);
    const name = replaceName(child.name, classnameRoot);

    return [...acc, { ...child, props, name }];
  }, []);
};

// ......................................
////  flat Atrules
// ......................................

const flatAtrules = (atrules) => {
  const childrenValue = atrules.reduce((acc, prev) => {
    const name = prev.name;
    const classname = prev.props.join(' ');
    const value = prev.value.join(' ');
    const str = `${classname} { ${value} } `;
    acc[name] = acc[name]
      ? (acc[name] += [...new Set([str])])
      : (acc[name] = [...new Set([str])]);
    return acc;
  }, {});

  return Object.entries(childrenValue).map(([name, value]) => {
    const atruleValue = Array.isArray(value)
      ? value.map((v) => v.trim())
      : [value.trim()];
    return {
      children: [],
      name,
      props: [],
      type: '@media',
      value: atruleValue,
    };
  });
};

// ......................................
////  flat Atrules
// ......................................

const compiledChildren = (children, classnameRoot) => {
  const compiled = parseProps(children, classnameRoot);
  const [atrulesClassnames, regularClassnames] = partition(
    compiled,
    (elel, indx) => elel.name.includes('@') && !elel.name.includes('@keyframes')
  );

  return [...regularClassnames, ...flatAtrules(atrulesClassnames)];
};

// ......................................
////  compile
// ......................................

const compile = (cssArray, classnameRoot) => {
  //--- an array of existing classes in css template strings
  const tokenized = tokenizer(cssArray);

  //--- root class created with classnameRoot
  const root = createRoot(tokenized, cssArray, [`.${classnameRoot}`]);

  //--- classes belonging to root class
  const childrens = compiledChildren(root.children, classnameRoot);

  const compiled = [{ ...root, children: [] }, ...childrens];

  return compiled;
};

// ......................................
////  compiled (memoize)
// ......................................

const compiled = memoize((cssString, classnameRoot) => {
  const string = sanitize(cssString);

  const cssArray = cssToArray(string);
  const _compile = compile(cssArray, [classnameRoot]);

  return _compile;
}, 'compile');

// ......................................
////  serialize String
// ......................................

export const serializeString = (cssString, classnameRoot = 'css') => {
  return compiled(cssString, classnameRoot);
};
