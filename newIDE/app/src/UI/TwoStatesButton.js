// @flow

import * as React from 'react';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import Button from '@material-ui/core/Button';
import { dataObjectToProps } from '../Utils/HTMLDataset';
import { focusButton } from './Button';

type Props = {|
  leftButton: {| label: React.Node, value: string, id?: string |},
  rightButton: {| label: React.Node, value: string, id?: string |},
  onChange: string => void,
  value: string,
|};

export type TwoStatesButtonInterface = {| focusLeftButton: () => void |};

const TwoStatesButton = React.forwardRef<Props, TwoStatesButtonInterface>(
  ({ leftButton, rightButton, onChange, value }, ref) => {
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
      <ButtonGroup>
        <Button
          id={leftButton.id}
          {...dataObjectToProps(leftButtonDataset)}
          variant={isLeft ? 'contained' : 'outlined'}
          color={isLeft ? 'secondary' : 'default'}
          onClick={() => onChange(leftButton.value)}
          ref={leftButtonRef}
        >
          {leftButton.label}
        </Button>
        <Button
          id={rightButton.id}
          {...dataObjectToProps(rightButtonDataset)}
          variant={!isLeft ? 'contained' : 'outlined'}
          color={!isLeft ? 'secondary' : 'default'}
          onClick={() => onChange(rightButton.value)}
        >
          {rightButton.label}
        </Button>
      </ButtonGroup>
    );
  }
);

export default TwoStatesButton;
