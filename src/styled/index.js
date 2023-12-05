import createCacheStyle from '../cache';
import { styledV2 } from './styled.base';

let cache = createCacheStyle;

const createCache = (options, src) => {
  cache = createCacheStyle(options, src);
  return cache;
};

export { createCache, cache, styledV2 };
