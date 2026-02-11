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
import { ResourceStoreContext } from './ResourceStoreContext';

const styles = {
  paper: { display: 'flex', padding: 8, flex: 1 },
  clickableLine: { flex: 1, maxWidth: '100%' },
};

type Props = {|
  audioResource: AudioResourceV2,
  onClickPlay: () => void,
  onClickLine: () => void,
  isPlaying: boolean,
  isSelected: boolean,
|};

const AudioResourceLine = ({
  audioResource,
  onClickPlay,
  onClickLine,
  isPlaying,
  isSelected,
}: Props) => {
  const { isMobile } = useResponsiveWindowSize();
  const gdevelopTheme = React.useContext(GDevelopThemeContext);
  const { getAuthorsDisplayLinks } = React.useContext(ResourceStoreContext);
  return (
    <Paper
      background={isSelected ? 'light' : 'medium'}
      style={{ ...styles.paper, borderColor: gdevelopTheme.palette.secondary }}
      variant={isSelected ? 'outlined' : undefined}
    >
      <div style={styles.clickableLine} onClick={onClickLine}>
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
                  {getAuthorsDisplayLinks(audioResource)} -{' '}
                  {audioResource.license.replace(', click for details', '')}
                </Text>
              </ColumnStackLayout>
            </div>
          </LineStackLayout>
          <Text noMargin size="sub-title" color="secondary">
            {formatDuration(audioResource.metadata.duration)}
          </Text>
        </LineStackLayout>
      </div>
    </Paper>
  );
};

export default AudioResourceLine;
