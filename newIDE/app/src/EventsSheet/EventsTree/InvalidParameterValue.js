// @flow
import * as React from 'react';
import Tooltip from '@material-ui/core/Tooltip';
import { tooltipEnterDelay } from '../../UI/Tooltip';
import { instructionInvalidParameter } from './ClassNames';

type Props = {|
  children: React.Node,
  isEmpty?: boolean,
  errorMessage?: React.Node,
|};

/**
 * Displayed when a parameter is invalid
 */
const InvalidParameterValue = ({
  children,
  isEmpty,
  errorMessage,
}: Props): React.MixedElement => {
  const invalidParameter = isEmpty ? (
    <span className={instructionInvalidParameter}>&lt; {children} &gt;</span>
  ) : (
    <span className={instructionInvalidParameter}>{children}</span>
  );

  return errorMessage ? (
    <Tooltip
      title={errorMessage}
      enterDelay={tooltipEnterDelay}
      placement="top"
    >
      {invalidParameter}
    </Tooltip>
  ) : (
    invalidParameter
  );
};

export default InvalidParameterValue;
