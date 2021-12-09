// @flow
import * as React from 'react';
import Snackbar from '@material-ui/core/Snackbar';
import { useScreenType } from '../Reponsive/ScreenTypeMeasurer';

type Props = {|
  message: React.Node,
  touchScreenMessage?: React.Node,
  show: boolean,
  hideInfoBar: () => void,
|};

const InfoBar = ({ show, touchScreenMessage, message, hideInfoBar }: Props) => {
  const screenType = useScreenType();

  React.useEffect(
    () => {
      if (show) {
        setTimeout(() => {
          hideInfoBar();
        }, 3000);
      }
    },
    [show, hideInfoBar]
  );

  return (
    <Snackbar
      open={show}
      message={
        screenType === 'touch' && touchScreenMessage
          ? touchScreenMessage
          : message
      }
    />
  );
};

export default InfoBar;
