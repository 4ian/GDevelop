// @flow

import * as React from 'react';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import Button from '@material-ui/core/Button';
import { dataObjectToProps } from '../Utils/HTMLDataset';
import { focusButton } from './Button';
import { Spacer } from './Grid';

type Props = {|
  leftButton: {|
    icon?: React.Node,
    label: React.Node,
    value: string,
    id?: string,
  |},
  rightButton: {|
    icon?: React.Node,
    label: React.Node,
    value: string,
    id?: string,
  |},
  onChange: string => void,
  value: string,
  disabled?: boolean,
|};

export type TwoStatesButtonInterface = {| focusLeftButton: () => void |};

const TwoStatesButton: React.ComponentType<{
  ...Props,
  +ref?: React.RefSetter<TwoStatesButtonInterface>,
}> = React.forwardRef<Props, TwoStatesButtonInterface>(
  ({ leftButton, rightButton, onChange, value, disabled }, ref) => {
    // $FlowFixMe[value-as-type]
    const leftButtonRef = React.useRef<?Button>(null);

    const focusLeftButton = React.useCallback(() => {
      if (leftButtonRef.current) focusButton(leftButtonRef.current);
    }, []);

    React.useImperativeHandle(ref, () => ({
      focusLeftButton,
    }));

    const isLeft = value === leftButton.value;
    const leftButtonDataset = isLeft ? { effective: 'true' } : undefined;
    const rightButtonDataset = !isLeft ? { effective: 'true' } : undefined;
    return (
      <ButtonGroup size="small" disableElevation disabled={disabled}>
        <Button
          id={leftButton.id}
          // $FlowFixMe[incompatible-type]
          {...dataObjectToProps(leftButtonDataset)}
          variant={isLeft ? 'contained' : 'outlined'}
          color={isLeft ? 'secondary' : 'default'}
          onClick={() => onChange(leftButton.value)}
          ref={leftButtonRef}
        >
          {leftButton.icon}
          {leftButton.icon && leftButton.label && <Spacer />}
          {leftButton.label}
        </Button>
        <Button
          id={rightButton.id}
          // $FlowFixMe[incompatible-type]
          {...dataObjectToProps(rightButtonDataset)}
          variant={!isLeft ? 'contained' : 'outlined'}
          color={!isLeft ? 'secondary' : 'default'}
          onClick={() => onChange(rightButton.value)}
        >
          {rightButton.icon}
          {rightButton.icon && rightButton.label && <Spacer />}
          {rightButton.label}
        </Button>
      </ButtonGroup>
    );
  }
);

export default TwoStatesButton;
