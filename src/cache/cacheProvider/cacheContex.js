import { useContext } from 'react';
import { CacheContext } from '.';

export const useCacheContext = () => {
  const context = useContext(CacheContext);
  if (context === undefined) {
    throw new Error('useCacheContext was used outside of its Provider');
  }
  return context;
};


