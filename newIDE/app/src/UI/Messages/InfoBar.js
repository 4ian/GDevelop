// @flow
import * as React from 'react';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Snackbar from '@material-ui/core/Snackbar';
import { useScreenType } from '../Responsive/ScreenTypeMeasurer';
import GDevelopThemeContext from '../Theme/GDevelopThemeContext';
import CrossSVG from '../CustomSvgIcons/Cross';

type Props = {|
  message: React.Node,
  touchScreenMessage?: React.Node,
  visible: boolean,
  duration?: number,
  hide: () => void,
  actionLabel?: React.Node,
  closable?: boolean,
  onActionClick?: () => void | Promise<void>,
|};

const InfoBar = ({
  visible,
  touchScreenMessage,
  message,
  hide,
  actionLabel,
  onActionClick,
  closable,
  duration = 3000,
}: Props) => {
  const gdevelopTheme = React.useContext(GDevelopThemeContext);
  const screenType = useScreenType();

  React.useEffect(
    () => {
      if (visible) {
        const timeout = setTimeout(() => {
          hide();
        }, duration);
        return () => clearTimeout(timeout);
      }
    },
    [visible, hide, duration]
  );

  const buttonColor =
    gdevelopTheme.palette.type === 'light' ? 'secondary' : 'primary';

  return (
    <Snackbar
      open={visible}
      message={
        screenType === 'touch' && touchScreenMessage
          ? touchScreenMessage
          : message
      }
      action={
        <>
          {actionLabel && onActionClick ? (
            <Button color={buttonColor} size="small" onClick={onActionClick}>
              {actionLabel}
            </Button>
          ) : null}
          {closable && (
            <IconButton onClick={hide} size="small">
              <CrossSVG color={buttonColor} />
            </IconButton>
          )}
        </>
      }
    />
  );
};

export default InfoBar;
