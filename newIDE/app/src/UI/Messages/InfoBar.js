// @flow
import * as React from 'react';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Snackbar from '@material-ui/core/Snackbar';
import { useScreenType } from '../Responsive/ScreenTypeMeasurer';
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
  const screenType = useScreenType();

  React.useEffect(
    () => {
      if (duration <= 0) return;
      if (visible) {
        const timeout = setTimeout(() => {
          hide();
        }, duration);
        return () => clearTimeout(timeout);
      }
    },
    [visible, hide, duration]
  );

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
            <Button color="secondary" size="small" onClick={onActionClick}>
              {actionLabel}
            </Button>
          ) : null}
          {closable && (
            <IconButton color="secondary" size="small" onClick={hide}>
              <CrossSVG />
            </IconButton>
          )}
        </>
      }
    />
  );
};

export default InfoBar;
