// @flow

import * as React from 'react';
import { type AudioResourceV2 } from '../../Utils/GDevelopServices/Asset';
import { ColumnStackLayout, LineStackLayout } from '../../UI/Layout';
import PlayButton from '../../UI/SoundPlayer/PlayButton';
import { formatDuration } from '../../Utils/Duration';
import Text from '../../UI/Text';
import Paper from '../../UI/Paper';
import GDevelopThemeContext from '../../UI/Theme/GDevelopThemeContext';

const styles = {
  paper: { display: 'flex', padding: 8, flex: 1 },
};

type Props = {|
  audioResource: AudioResourceV2,
  onClickPlay: () => void,
  isPlaying: boolean,
  isSelected: boolean,
|};

const AudioResourceLine = ({
  audioResource,
  onClickPlay,
  isPlaying,
  isSelected,
}: Props) => {
  const gdevelopTheme = React.useContext(GDevelopThemeContext);
  return (
    <Paper
      background={isSelected ? 'light' : 'medium'}
      style={{ ...styles.paper, borderColor: gdevelopTheme.palette.secondary }}
      variant={isSelected ? 'outlined' : undefined}
    >
      <LineStackLayout noMargin expand>
        <PlayButton onClick={onClickPlay} isPlaying={isPlaying} />
        <ColumnStackLayout noMargin>
          <Text noMargin>{audioResource.name}</Text>
          <Text noMargin color="secondary">
            {audioResource.authors}
          </Text>
        </ColumnStackLayout>
        <Text noMargin>{formatDuration(audioResource.metadata.duration)}</Text>
      </LineStackLayout>
    </Paper>
  );
};

export default AudioResourceLine;
