// @flow
import * as React from 'react';
import { instructionMissingParameter } from './ClassNames';

/**
 * Displayed when a parameter is missing (i.e: empty and not optional)
 */
export default (): React.Element<'span'> => (
  <span className={instructionMissingParameter} />
);
