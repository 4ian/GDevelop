// @flow
import * as React from 'react';
import Button from '@material-ui/core/Button';
import { Spacer } from './Grid';

const styles = {
  button: {
    justifyContent: 'start',
    minWidth: 0, // Ensure we can use the button with just an icon.
    minHeight: 30, // Ensure it stays the same size with and without label.
    padding: '4px 6px', // Ensure same padding applied no matter the button variant.
    fontWeight: 400,
    transition: 'none', // Disable transition to avoid desync between label and icon color.
  },
  buttonWithoutLabel: {
    marginTop: 10,
    justifyContent: 'center',
  },
  iconWrapperWithoutLabel: {
    justifyContent: 'center',
    display: 'flex',
  },
  iconWrapperWithLabel: {
    padding: '3px 8px',
    justifyContent: 'center',
    display: 'flex',
  },
};

type Props = {|
  label: React.Node,
  onClick: ?(ev: any) => void | Promise<void>,
  getIcon: (color: string) => React.Node,
  isActive: boolean,
  hideLabel?: boolean,
|};

const VerticalTabButton = ({
  label,
  getIcon,
  onClick,
  isActive,
  hideLabel,
}: Props) => {
  return (
    <Button
      variant={isActive ? 'contained' : 'text'}
      size="small"
      style={{
        ...styles.button,
        ...(hideLabel ? styles.buttonWithoutLabel : {}),
      }}
      fullWidth
      onClick={onClick}
      color={isActive ? 'primary' : 'default'}
    >
      <div
        style={
          hideLabel
            ? styles.iconWrapperWithoutLabel
            : styles.iconWrapperWithLabel
        }
      >
        {getIcon(isActive ? 'default' : 'secondary')}
      </div>
      {!hideLabel && (
        <>
          <Spacer />
          {label}
        </>
      )}
    </Button>
  );
};

export default VerticalTabButton;
