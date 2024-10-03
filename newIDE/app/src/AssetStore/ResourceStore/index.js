// @flow
import * as React from 'react';
import { t, Trans } from '@lingui/macro';
import { AutoSizer } from 'react-virtualized';
import { FixedSizeList as List } from 'react-window';
import SearchBar from '../../UI/SearchBar';
import { Column, Line } from '../../UI/Grid';
import {
  type ResourceV2,
  type AudioResourceV2,
  type FontResourceV2,
  type Resource,
} from '../../Utils/GDevelopServices/Asset';
import { type ResourceKindSupportedByResourceStore } from './ResourceStoreContext';
import { ResourceStoreContext } from './ResourceStoreContext';
import AudioResourceLine from './AudioResourceLine';
import { ResponsivePaperOrDrawer } from '../../UI/ResponsivePaperOrDrawer';
import ScrollView from '../../UI/ScrollView';
import Tune from '../../UI/CustomSvgIcons/Tune';
import Subheader from '../../UI/Subheader';
import { LineStackLayout } from '../../UI/Layout';
import IconButton from '../../UI/IconButton';
import { ResourceStoreFilterPanel } from './ResourceStoreFilterPanel';
import SoundPlayer, { type SoundPlayerInterface } from '../../UI/SoundPlayer';
import FontResourceLine from './FontResourceLine';
import { BoxSearchResults } from '../../UI/Search/BoxSearchResults';
import { ResourceCard } from './ResourceCard';
import EmptyMessage from '../../UI/EmptyMessage';
import PlaceholderError from '../../UI/PlaceholderError';

const AudioResourceStoreRow = ({
  index,
  style,
  data,
}: {|
  index: number,
  style: Object,
  data: {|
    items: AudioResourceV2[],
    onClickPlay: number => void,
    selectedResourceIndex: number,
  |},
|}) => {
  const resource = data.items[index];
  if (resource.type !== 'audio') return null;
  return (
    <div style={style}>
      <AudioResourceLine
        audioResource={resource}
        isSelected={data.selectedResourceIndex === index}
        isPlaying={false}
        onClickPlay={() => data.onClickPlay(index)}
      />
    </div>
  );
};

const FontResourceStoreRow = ({
  index,
  style,
  data,
}: {|
  index: number,
  style: Object,
  data: {|
    items: FontResourceV2[],
    selectedResourceIndex: number,
    onSelect: number => void,
  |},
|}) => {
  const resource = data.items[index];
  if (resource.type !== 'font') return null;
  return (
    <div style={style}>
      <FontResourceLine
        fontResource={resource}
        isSelected={data.selectedResourceIndex === index}
        onSelect={() => data.onSelect(index)}
      />
    </div>
  );
};

type ResourceListAndFiltersProps<T> = {|
  selectedResourceIndex?: ?number,
  onSelectResource: (?number) => void,
  searchResults: ?Array<T>,
  isFiltersPanelOpen: boolean,
  setIsFiltersPanelOpen: boolean => void,
  error: ?Error,
  onRetry: () => void,
|};

const AudioResourceListAndFilters = ({
  searchResults,
  isFiltersPanelOpen,
  setIsFiltersPanelOpen,
  error,
  onRetry,
  selectedResourceIndex,
  onSelectResource,
}: ResourceListAndFiltersProps<ResourceV2>) => {
  const soundPlayerRef = React.useRef<?SoundPlayerInterface>(null);
  const selectedResource =
    searchResults && typeof selectedResourceIndex === 'number'
      ? searchResults[selectedResourceIndex]
      : null;

  const onClickPlay = React.useCallback(
    (newResourceIndex: number) => {
      if (
        newResourceIndex === selectedResourceIndex &&
        soundPlayerRef.current
      ) {
        soundPlayerRef.current.playPause(true);
      }
      onSelectResource(newResourceIndex);
    },
    [onSelectResource, selectedResourceIndex]
  );

  const onSkipForward = React.useCallback(
    () => {
      onSelectResource(
        typeof selectedResourceIndex === 'number'
          ? selectedResourceIndex + 1
          : 0
      );
    },
    [selectedResourceIndex, onSelectResource]
  );
  const onSkipBack = React.useCallback(
    () => {
      onSelectResource(
        typeof selectedResourceIndex === 'number'
          ? Math.max(selectedResourceIndex - 1, 0)
          : 0
      );
    },
    [selectedResourceIndex, onSelectResource]
  );

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
            {error ? (
              <PlaceholderError onRetry={onRetry}>
                <Trans>An error occurred while loading audio resources.</Trans>{' '}
                <Trans>
                  Please check your internet connection or try again later.
                </Trans>
              </PlaceholderError>
            ) : (
              !!searchResults &&
              (searchResults.length === 0 ? (
                <EmptyMessage>
                  <Trans>
                    Your search and filters did not return any result.
                  </Trans>
                </EmptyMessage>
              ) : (
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
                        selectedResourceIndex,
                      }}
                    >
                      {AudioResourceStoreRow}
                    </List>
                  )}
                </AutoSizer>
              ))
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
                    <Trans>Filters</Trans>
                  </Subheader>
                </Line>
              </Column>
              <Line justifyContent="space-between" alignItems="center">
                <ResourceStoreFilterPanel resourceKind="audio" />
              </Line>
            </Column>
          </ScrollView>
        </ResponsivePaperOrDrawer>
      </Line>
      <SoundPlayer
        ref={soundPlayerRef}
        soundSrc={selectedResource ? selectedResource.url : null}
        onSoundLoaded={onSoundLoaded}
        onSkipBack={
          typeof selectedResourceIndex === 'number' &&
          searchResults &&
          selectedResourceIndex <= 0
            ? undefined
            : onSkipBack
        }
        onSkipForward={
          typeof selectedResourceIndex === 'number' &&
          searchResults &&
          selectedResourceIndex >= searchResults.length - 1
            ? undefined
            : onSkipForward
        }
      />
    </>
  );
};

const FontResourceListAndFilters = ({
  searchResults,
  isFiltersPanelOpen,
  setIsFiltersPanelOpen,
  error,
  onRetry,
  selectedResourceIndex,
  onSelectResource,
}: ResourceListAndFiltersProps<ResourceV2>) => {
  return (
    <Line expand>
      <Column noMargin noOverflowParent expand>
        <Line noMargin expand>
          {error ? (
            <PlaceholderError onRetry={onRetry}>
              <Trans>An error occurred while loading fonts.</Trans>{' '}
              <Trans>
                Please check your internet connection or try again later.
              </Trans>
            </PlaceholderError>
          ) : (
            !!searchResults &&
            (searchResults.length === 0 ? (
              <EmptyMessage>
                <Trans>
                  Your search and filters did not return any result.
                  <br />
                  If you need support for a specific language, please contact
                  us.
                </Trans>
              </EmptyMessage>
            ) : (
              <AutoSizer>
                {({ height, width }) => (
                  <List
                    height={height}
                    width={width}
                    overscanCount={10}
                    itemCount={searchResults.length}
                    itemSize={130}
                    itemData={{
                      items: searchResults,
                      selectedResourceIndex,
                      onSelect: onSelectResource,
                    }}
                  >
                    {FontResourceStoreRow}
                  </List>
                )}
              </AutoSizer>
            ))
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
                  <Trans>Filters</Trans>
                </Subheader>
              </Line>
            </Column>
            <Line justifyContent="space-between" alignItems="center">
              <ResourceStoreFilterPanel resourceKind="font" />
            </Line>
          </Column>
        </ScrollView>
      </ResponsivePaperOrDrawer>
    </Line>
  );
};

const SvgResourceListAndFilters = ({
  searchResults,
  isFiltersPanelOpen,
  setIsFiltersPanelOpen,
  error,
  onRetry,
  selectedResourceIndex,
  onSelectResource,
}: ResourceListAndFiltersProps<Resource>) => {
  return (
    <Line
      expand
      overflow={
        'hidden' /* Somehow required on Chrome/Firefox to avoid children growing (but not on Safari) */
      }
      noMargin
    >
      <BoxSearchResults
        baseSize={128}
        spacing={8}
        onRetry={onRetry}
        error={error}
        searchItems={searchResults}
        renderSearchItem={(resource, size, index) => (
          <ResourceCard
            size={size}
            resource={resource}
            onChoose={() => onSelectResource(index)}
            isSelected={selectedResourceIndex === index}
          />
        )}
      />
    </Line>
  );
};

type Props = {
  selectedResourceIndex?: ?number,
  onSelectResource: (?number) => void,
  resourceKind: ResourceKindSupportedByResourceStore,
};

export const ResourceStore = ({
  onSelectResource,
  selectedResourceIndex,
  resourceKind,
}: Props) => {
  const {
    searchResults,
    fetchResourcesAndFilters,
    searchText,
    error,
    setSearchText,
    setSearchResourceKind,
  } = React.useContext(ResourceStoreContext);
  const [isFiltersPanelOpen, setIsFiltersPanelOpen] = React.useState<boolean>(
    false
  );
  React.useEffect(
    () => {
      setSearchResourceKind(resourceKind);
    },
    [resourceKind, setSearchResourceKind]
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

  React.useEffect(
    () => {
      onSelectResource(null);
    },
    [searchResults, onSelectResource]
  );

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
        {(resourceKind === 'audio' || resourceKind === 'font') && (
          <IconButton
            onClick={() => setIsFiltersPanelOpen(!isFiltersPanelOpen)}
            selected={isFiltersPanelOpen}
            size="small"
          >
            <Tune />
          </IconButton>
        )}
      </LineStackLayout>
      {resourceKind === 'audio' && (
        <AudioResourceListAndFilters
          error={error}
          selectedResourceIndex={selectedResourceIndex}
          onSelectResource={onSelectResource}
          onRetry={fetchResourcesAndFilters}
          isFiltersPanelOpen={isFiltersPanelOpen}
          setIsFiltersPanelOpen={setIsFiltersPanelOpen}
          searchResults={
            // $FlowIgnore - search results should return results for audio resources only.
            searchResultsForResourceKind
          }
        />
      )}
      {resourceKind === 'font' && (
        <FontResourceListAndFilters
          error={error}
          selectedResourceIndex={selectedResourceIndex}
          onSelectResource={onSelectResource}
          onRetry={fetchResourcesAndFilters}
          isFiltersPanelOpen={isFiltersPanelOpen}
          setIsFiltersPanelOpen={setIsFiltersPanelOpen}
          searchResults={
            // $FlowIgnore - search results should return results for font resources only.
            searchResultsForResourceKind
          }
        />
      )}
      {resourceKind === 'svg' && (
        <SvgResourceListAndFilters
          error={error}
          selectedResourceIndex={selectedResourceIndex}
          onSelectResource={onSelectResource}
          onRetry={fetchResourcesAndFilters}
          isFiltersPanelOpen={false}
          setIsFiltersPanelOpen={() => {}}
          searchResults={
            // $FlowIgnore - search results should return results for svg resources only.
            searchResultsForResourceKind
          }
        />
      )}
    </Column>
  );
};
