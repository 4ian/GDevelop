// @flow
import * as React from 'react';
import Button from '@material-ui/core/Button';
import { Spacer } from './Grid';
import GDevelopThemeContext from './Theme/ThemeContext';

const styles = {
  justifyContent: 'start',
  minWidth: 0, // Ensure we can use the button with just an icon.
  minHeight: 30, // Ensure it stays the same size with and without label.
};

type Props = {|
  label: React.Node,
  onClick: ?(ev: any) => void | Promise<void>,
  icon: React.Node,
  isActive: boolean,
  hideLabel?: boolean,
|};

const VerticalTabButton = ({
  label,
  icon,
  onClick,
  isActive,
  hideLabel,
}: Props) => {
  const GDevelopTheme = React.useContext(GDevelopThemeContext);

  return (
    <Button
      variant="text"
      size="small"
      style={{
        ...styles,
        backgroundColor: isActive
          ? GDevelopTheme.home.tabs.selectedBackgroundColor
          : undefined,
      }}
      fullWidth
      onClick={onClick}
      color={isActive ? 'primary' : 'default'}
    >
      {icon}
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
