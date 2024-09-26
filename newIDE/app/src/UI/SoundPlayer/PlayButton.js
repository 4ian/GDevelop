// @flow

import * as React from 'react';
import IconButton from '@material-ui/core/IconButton';
import Play from '../CustomSvgIcons/Play';
import Pause from '../CustomSvgIcons/Pause';
import { makeStyles } from '@material-ui/styles';
import GDevelopThemeContext from '../Theme/GDevelopThemeContext';

type Props = {|
  primary?: boolean,
  isPlaying: boolean,
  onClick: () => void,
|};

const PlayButton = (props: Props) => {
  const gdevelopTheme = React.useContext(GDevelopThemeContext);

  const classes = makeStyles({
    root: {
      color:
        gdevelopTheme.soundPlayer.playButton[
          props.primary ? 'primary' : 'secondary'
        ].color,
      backgroundColor:
        gdevelopTheme.soundPlayer.playButton[
          props.primary ? 'primary' : 'secondary'
        ].backgroundColor,
      outlineColor:
        gdevelopTheme.soundPlayer.playButton[
          props.primary ? 'primary' : 'secondary'
        ].borderColor,
      outlineWidth: 2,
      outlineStyle: 'solid',
    },
  })();
  return (
    <IconButton
      classes={classes}
      onClick={props.onClick}
    >
      {props.isPlaying ? <Pause /> : <Play />}
    </IconButton>
  );
};

export default PlayButton;
