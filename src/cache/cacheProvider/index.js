/* eslint-disable react-hooks/rules-of-hooks */
import { createContext, useContext } from 'react';

const isBrowser = typeof document !== 'undefined';


// ......................................
////  Cache Style Context
// ......................................

export const CacheStyleContext = createContext();

// ......................................
////  CACHE CONTEXT
// ......................................

export const CacheProvider = CacheStyleContext.Provider;

// ......................................
////  USE CACHE CONTEXT
// ......................................

export let useCacheStyle = function fn(props) {
  return useContext(CacheStyleContext);
};
