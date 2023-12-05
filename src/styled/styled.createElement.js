import React from 'react';

import {
  isArray,
  isObject,
  removeDoubleSpace,
  removeLineBreak,
} from '../utils';

import {cache, createCache } from '.';

import { applyFuncObject, applyFuncString } from './styled.css';
import { createRules } from '../css/create.rules';
import { useCacheStyle } from '../cache/cacheProvider';
import { createInstanceWithCache } from '../css/create-instance';

//----------- STYLED

// ......................................
////  create Element With Component (utils)
// ......................................

const attributes = (attrs) => {
  const { prefixer, className, ..._attrs } = attrs;
  return _attrs
    ? {
        prefixer: prefixer ? prefixer : '',
        className: className
          ? isArray(className)
            ? className.join(' ')
            : className
          : '',
        attrs: _attrs ? _attrs : {},
      }
    : {};
};

// ......................................
////  create Element With Component
// ......................................

function createElementWithComponent(tag) {
  const componentCreator = (getRules, attrs) => {
    const StyledComponent = React.forwardRef(function StyledComponent(
      props,
      ref
    ) {
      const options = { key: cache.key };

      //--- ???? prefixer, attributes etc ...
      const { prefixer, className, attrs: _attrs } = attributes(attrs);

      const rules = typeof getRules === 'function' ? getRules(props) : getRules;

      const { css } = createInstanceWithCache(cache, options);

      const classNameRoot = css(rules);

      const { ref: refProps, className: classNameProps, children, key } = props;

      return React.createElement(
        `${tag}`,
        {
          ref,
          className: `${classNameRoot} ${className} ${
            classNameProps ? classNameProps : ''
          } `.trim(),
          ..._attrs,
        },
        children
      );
    });
    return StyledComponent;
  };
  return componentCreator;
}

// ......................................
////  create Element With Object
// ......................................

export const createElementWithObject = (tag, args, attr, fnsValues) => {
  const obj = args;
  return createElementWithComponent(tag)(applyFuncObject(obj), attr);
};

// ......................................
////  create Element With String
// ......................................

export const createElementWithString = (tag, args, attr, fnsValues) => {
  const rules = createRules(args, fnsValues);

  //--- case function in string css
  return createElementWithComponent(tag)(applyFuncString(rules, fnsValues), {});
};

// ......................................
////  create Component Fn
// ......................................

export const createComponentFn = (component, fn) => {
  const ComponentCreator = ({ children, ...props }) => {
  
  
    //--- wrapped CacheStyleProvider defined in '_app.js'
    const cacheContext = useCacheStyle();
    const cache =
    cacheContext && cacheContext.cache ? cacheContext.cache : createCache();
      
    //--- fn:  applyFunc
    const rules = fn(props);
 
    const { css } = createInstanceWithCache(cache);

    const classname = css(rules);
    return component({ children, className: classname });
  };

  return ComponentCreator;
};
