// @flow
import * as React from 'react';
import { t, Trans } from '@lingui/macro';
import SearchBar from '../../UI/SearchBar';
import { Column, Line } from '../../UI/Grid';
import {
  type ResourceV2,
  type AudioResourceV2,
} from '../../Utils/GDevelopServices/Asset';
import { ResourceStoreContext } from './ResourceStoreContext';
import AudioResourceLine from './AudioResourceLine';
import { FixedSizeList as List } from 'react-window';
import { AutoSizer } from 'react-virtualized';
import { ResponsivePaperOrDrawer } from '../../UI/ResponsivePaperOrDrawer';
import ScrollView from '../../UI/ScrollView';
import Tune from '../../UI/CustomSvgIcons/Tune';
import Subheader from '../../UI/Subheader';
import { LineStackLayout } from '../../UI/Layout';
import IconButton from '../../UI/IconButton';
import { ResourceStoreFilterPanel } from './ResourceStoreFilterPanel';
import SoundPlayer, { type SoundPlayerInterface } from '../../UI/SoundPlayer';

const AudioResourceStoreRow = ({
  index,
  style,
  data,
}: {|
  index: number,
  style: Object,
  data: {|
    items: AudioResourceV2[],
    onClickPlay: AudioResourceV2 => void,
    selectedResource: AudioResourceV2,
  |},
|}) => {
  const resource = data.items[index];
  if (resource.type !== 'audio') return null;
  return (
    <div style={style}>
      <AudioResourceLine
        audioResource={resource}
        isSelected={data.selectedResource === resource}
        isPlaying={false}
        onClickPlay={() => data.onClickPlay(resource)}
      />
    </div>
  );
};

type AudioResourceListAndFiltersProps = {|
  searchResults: ?Array<ResourceV2>,
  isFiltersPanelOpen: boolean,
  setIsFiltersPanelOpen: boolean => void,
|};

const AudioResourceListAndFilters = ({
  searchResults,
  isFiltersPanelOpen,
  setIsFiltersPanelOpen,
}: AudioResourceListAndFiltersProps) => {
  const soundPlayerRef = React.useRef<?SoundPlayerInterface>(null);
  const [
    playingAudioResource,
    setPlayingAudioResource,
  ] = React.useState<?AudioResourceV2>(null);

  const onClickPlay = React.useCallback((newAudioResource: AudioResourceV2) => {
    setPlayingAudioResource(audioResource => {
      if (newAudioResource === audioResource && soundPlayerRef.current) {
        soundPlayerRef.current.playPause(true);
      }
      return newAudioResource;
    });
  }, []);

  const onSoundLoaded = React.useCallback(() => {
    if (soundPlayerRef.current) {
      soundPlayerRef.current.playPause(true);
    }
  }, []);

  return (
    <>
      <Line expand>
        <Column noMargin noOverflowParent expand>
          <Line noMargin expand>
            {!!searchResults && (
              <AutoSizer>
                {({ height, width }) => (
                  <List
                    height={height}
                    width={width}
                    overscanCount={10}
                    itemCount={searchResults.length}
                    itemSize={66}
                    itemData={{
                      items: searchResults,
                      onClickPlay,
                      selectedResource: playingAudioResource,
                    }}
                  >
                    {AudioResourceStoreRow}
                  </List>
                )}
              </AutoSizer>
            )}
          </Line>
        </Column>
        <ResponsivePaperOrDrawer
          onClose={() => setIsFiltersPanelOpen(false)}
          open={isFiltersPanelOpen}
        >
          <ScrollView>
            <Column>
              <Column noMargin>
                <Line alignItems="center">
                  <Tune />
                  <Subheader>
                    <Trans>Object filters</Trans>
                  </Subheader>
                </Line>
              </Column>
              <Line justifyContent="space-between" alignItems="center">
                <ResourceStoreFilterPanel />
              </Line>
            </Column>
          </ScrollView>
        </ResponsivePaperOrDrawer>
      </Line>
      <SoundPlayer
        ref={soundPlayerRef}
        soundSrc={playingAudioResource ? playingAudioResource.url : null}
        onSoundLoaded={onSoundLoaded}
      />
    </>
  );
};
type Props = {
  onChoose: ResourceV2 => void,
  resourceKind: string,
};

export const ResourceStore = ({ onChoose, resourceKind }: Props) => {
  const {
    searchResults,
    fetchResourcesAndFilters,
    searchText,
    setSearchText,
  } = React.useContext(ResourceStoreContext);
  const [isFiltersPanelOpen, setIsFiltersPanelOpen] = React.useState<boolean>(
    false
  );

  React.useEffect(
    () => {
      fetchResourcesAndFilters();
    },
    [fetchResourcesAndFilters]
  );

  const searchResultsForResourceKind = searchResults
    ? searchResults.filter(resource => resource.type === resourceKind)
    : null;

  return (
    <Column expand noMargin>
      <LineStackLayout>
        <Column expand noMargin>
          <SearchBar
            value={searchText}
            onChange={setSearchText}
            onRequestSearch={() => {}}
            placeholder={t`Search resources`}
          />
        </Column>
        <IconButton
          onClick={() => setIsFiltersPanelOpen(!isFiltersPanelOpen)}
          selected={isFiltersPanelOpen}
          size="small"
        >
          <Tune />
        </IconButton>
      </LineStackLayout>
      {resourceKind === 'audio' && (
        <AudioResourceListAndFilters
          isFiltersPanelOpen={isFiltersPanelOpen}
          setIsFiltersPanelOpen={setIsFiltersPanelOpen}
          searchResults={searchResultsForResourceKind}
        />
      )}
    </Column>
  );
};
