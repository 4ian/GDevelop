// @flow
import * as React from 'react';
import Button from '@material-ui/core/Button';
import { Spacer } from './Grid';

export const verticalTabButtonSize = 30;

const styles = {
  button: {
    justifyContent: 'start',
    minWidth: 0, // Ensure we can use the button with just an icon.
    minHeight: verticalTabButtonSize, // Ensure it stays the same size with and without label.
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
  getIcon: ({ color: string, fontSize: 'inherit' | 'small' }) => React.Node,
  isActive: boolean,
  hideLabel?: boolean,
  id?: string,
|};

const VerticalTabButton = ({
  label,
  getIcon,
  onClick,
  isActive,
  hideLabel,
  id,
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
      id={id}
      disableElevation
    >
      <div
        style={
          hideLabel
            ? styles.iconWrapperWithoutLabel
            : styles.iconWrapperWithLabel
        }
      >
        {getIcon({
          color: isActive ? 'inherit' : 'secondary',
          fontSize: 'small',
        })}
      </div>
      {!hideLabel && (
        <>
          <Spacer />
          {/* span element is required to prevent browser auto translators to crash the app - See https://github.com/4ian/GDevelop/issues/3453 */}
          <span>{label}</span>
        </>
      )}
    </Button>
  );
};

export default VerticalTabButton;
