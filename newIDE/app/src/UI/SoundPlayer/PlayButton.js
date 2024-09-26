// @flow

import * as React from 'react';
import IconButton from '@material-ui/core/IconButton';
import Play from '../CustomSvgIcons/Play';
import Pause from '../CustomSvgIcons/Pause';

type Props = {|
  primary?: boolean,
  isPlaying: boolean,
  onClick: () => void,
|};

const PlayButton = (props: Props) => {
  return (
    <IconButton
      color={props.primary ? 'primary' : 'secondary'}
      onClick={props.onClick}
    >
      {props.isPlaying ? <Pause /> : <Play />}
    </IconButton>
  );
};

export default PlayButton;
