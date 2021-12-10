// @flow
import * as React from 'react';
import Snackbar from '@material-ui/core/Snackbar';
import { useScreenType } from '../Reponsive/ScreenTypeMeasurer';

type Props = {|
  message: React.Node,
  touchScreenMessage?: React.Node,
  visible: boolean,
  hide: () => void,
|};

const InfoBar = ({ visible, touchScreenMessage, message, hide }: Props) => {
  const screenType = useScreenType();

  React.useEffect(
    () => {
      if (visible) {
        const timeout = setTimeout(() => {
          hide();
        }, 3000);
        return () => clearTimeout(timeout);
      }
    },
    [visible, hide]
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
