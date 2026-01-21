// @flow
import * as React from 'react';
import { instructionDeprecatedParameter } from './ClassNames';

type Props = {| children: React.Node |};

/**
 * Displayed when a parameter uses a deprecated expression
 */
const DeprecatedParameterValue = ({ children }: Props) => (
  <span className={instructionDeprecatedParameter}>{children}</span>
);

export default DeprecatedParameterValue;
