// @flow
import * as React from 'react';
import Snackbar from '@material-ui/core/Snackbar';
import { useScreenType } from '../Reponsive/ScreenTypeMeasurer';

type Props = {|
  message: React.Node,
  touchScreenMessage?: React.Node,
  visible: boolean,
  duration?: number,
  hide: () => void,
|};

const InfoBar = ({
  visible,
  touchScreenMessage,
  message,
  hide,
  duration = 3000,
}: Props) => {
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

  return (
    <Snackbar
      open={visible}
      message={
        screenType === 'touch' && touchScreenMessage
          ? touchScreenMessage
          : message
      }
    />
  );
};

export default InfoBar;
