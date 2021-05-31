// @flow
import * as React from 'react';
import { instructionInvalidParameter } from './ClassNames';

type Props = {| children: React.Node, isEmpty?: boolean |};

/**
 * Displayed when a parameter is invalid
 */
export default ({ children, isEmpty }: Props): React.Element<'span'> =>
  isEmpty ? (
    <span className={instructionInvalidParameter}>&lt; {children} &gt;</span>
  ) : (
    <span className={instructionInvalidParameter}>{children}</span>
  );
