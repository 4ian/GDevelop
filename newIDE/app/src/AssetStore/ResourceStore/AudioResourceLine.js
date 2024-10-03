// @flow

import * as React from 'react';
import { type AudioResourceV2 } from '../../Utils/GDevelopServices/Asset';
import { ColumnStackLayout, LineStackLayout } from '../../UI/Layout';
import PlayButton from '../../UI/SoundPlayer/PlayButton';
import { formatDuration } from '../../Utils/Duration';
import Text from '../../UI/Text';
import Paper from '../../UI/Paper';
import GDevelopThemeContext from '../../UI/Theme/GDevelopThemeContext';
import { textEllipsisStyle } from '../../UI/TextEllipsis';
import { useResponsiveWindowSize } from '../../UI/Responsive/ResponsiveWindowMeasurer';

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
  const { isMobile } = useResponsiveWindowSize();
  const gdevelopTheme = React.useContext(GDevelopThemeContext);
  return (
    <Paper
      background={isSelected ? 'light' : 'medium'}
      style={{ ...styles.paper, borderColor: gdevelopTheme.palette.secondary }}
      variant={isSelected ? 'outlined' : undefined}
    >
      <LineStackLayout
        noMargin
        expand
        alignItems="center"
        justifyContent={isMobile ? 'space-between' : 'flex-start'}
      >
        <LineStackLayout noMargin alignItems="center">
          <PlayButton onClick={onClickPlay} isPlaying={isPlaying} />
          <div
            style={{ overflow: 'hidden', width: isMobile ? 'unset' : 400 }}
          >
            <ColumnStackLayout noMargin>
              <Text noMargin size="sub-title" style={textEllipsisStyle}>
                {audioResource.name}
              </Text>
              <Text
                noMargin
                color="secondary"
                style={textEllipsisStyle}
                size="body-small"
              >
                {audioResource.authors}
              </Text>
            </ColumnStackLayout>
          </div>
        </LineStackLayout>
        <Text noMargin size="sub-title" color="secondary">
          {formatDuration(audioResource.metadata.duration)}
        </Text>
      </LineStackLayout>
    </Paper>
  );
};

export default AudioResourceLine;
