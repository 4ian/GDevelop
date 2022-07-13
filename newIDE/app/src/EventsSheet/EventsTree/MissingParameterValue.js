// @flow
import * as React from 'react';
import { instructionMissingParameter } from './ClassNames';

/**
 * Displayed when a parameter is missing (i.e: empty and not optional)
 */
const MissingParameterValue = () => (
  <span className={instructionMissingParameter} />
);

export default MissingParameterValue;
