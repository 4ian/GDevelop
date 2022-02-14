// @flow
import { useEffect } from 'react';

export const useTimeout = (callback: any, delay: number) => {
  useEffect(
    () => {
      const id = setTimeout(callback, delay);
      return () => clearTimeout(id);
    },
    [callback, delay]
  );
};
