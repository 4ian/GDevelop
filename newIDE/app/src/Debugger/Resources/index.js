// @flow
import { t, Trans } from '@lingui/macro';
import * as React from 'react';
import Background from '../../UI/Background';
import EmptyMessage from '../../UI/EmptyMessage';
import Text from '../../UI/Text';
import SearchBar from '../../UI/SearchBar';
import Chip from '../../UI/Chip';
import IconButton from '../../UI/IconButton';
import FlatButton from '../../UI/FlatButton';
import Refresh from '../../UI/CustomSvgIcons/Refresh';
import ChevronArrowBottom from '../../UI/CustomSvgIcons/ChevronArrowBottom';
import ChevronArrowRight from '../../UI/CustomSvgIcons/ChevronArrowRight';
import { useInterval } from '../../Utils/UseInterval';
import { type DebuggerId } from '../../ExportAndShare/PreviewLauncher.flow';
import {
  ProfilerRecordingStore,
  useProfilerRecording,
} from '../ProfilerRecording/ProfilerRecordingStore';
import { getRecordingTimeBounds } from '../ProfilerRecording/ProfilerRecordingAggregation';
import MemoryBar from './MemoryBar';
import LoadTimeline from './LoadTimeline';
import ResourcesTable, { getStatusLabel } from './ResourcesTable';
import {
  emptyResourcesFilters,
  filterResources,
  formatBytes,
  getMemoryLimitBytes,
  resourceLoadStatuses,
  type ResourcesDebugState,
  type ResourcesFilters,
  type ResourceLoadStatus,
} from './ResourcesDebugTypes';
import classes from './Resources.module.css';

/** How often the game is asked for its resources while the panel is shown. */
export const RESOURCES_POLLING_INTERVAL_MS = 1500;

type Props = {|
  resourcesDebugState: ?ResourcesDebugState,
  lastError: ?string,
  onRefresh: () => Promise<void>,
  isPollingEnabled: boolean,
  recordingStore: ProfilerRecordingStore,
  debuggerId: DebuggerId,
  /** The artificial memory limit, shared with the performance panel. */
  artificialLimitMegabytes: ?number,
  onChangeArtificialLimitMegabytes: (?number) => void,
|};

const toggleInArray = <T>(array: Array<T>, value: T): Array<T> =>
  array.includes(value)
    ? array.filter(item => item !== value)
    : [...array, value];

/**
 * The resources of the running game: how much memory they take, when they
 * were loaded, and everything about each of them in a table.
 */
const ResourcesPanel = ({
  resourcesDebugState,
  lastError,
  onRefresh,
  isPollingEnabled,
  recordingStore,
  debuggerId,
  artificialLimitMegabytes,
  onChangeArtificialLimitMegabytes,
}: Props): React.Node => {
  const [filters, setFilters] = React.useState<ResourcesFilters>(
    emptyResourcesFilters
  );
  const [
    selectedResourceName,
    setSelectedResourceName,
  ] = React.useState<?string>(null);
  const [isTimelineShown, setIsTimelineShown] = React.useState(true);
  const [focusRequest, setFocusRequest] = React.useState<?{|
    resourceName: string,
    requestId: number,
  |}>(null);

  const onKeyDown = (event: SyntheticKeyboardEvent<HTMLDivElement>) => {
    // F: look at the selected resource on the timeline (like in the editors).
    if (
      (event.key === 'f' || event.key === 'F') &&
      selectedResourceName &&
      !(event.target instanceof HTMLInputElement)
    ) {
      event.preventDefault();
      setIsTimelineShown(true);
      setFocusRequest({
        resourceName: selectedResourceName,
        requestId: (focusRequest ? focusRequest.requestId : 0) + 1,
      });
    }
  };
  const isRefreshInFlightRef = React.useRef(false);
  const recording = useProfilerRecording(recordingStore, debuggerId);

  const refresh = React.useCallback(
    async () => {
      // A slow answer must not stack requests.
      if (isRefreshInFlightRef.current) return;
      isRefreshInFlightRef.current = true;
      try {
        await onRefresh();
      } finally {
        isRefreshInFlightRef.current = false;
      }
    },
    [onRefresh]
  );

  React.useEffect(
    () => {
      if (isPollingEnabled) refresh();
    },
    [isPollingEnabled, refresh]
  );
  useInterval(
    () => {
      refresh();
    },
    isPollingEnabled ? RESOURCES_POLLING_INTERVAL_MS : null
  );

  const filteredRecords = React.useMemo(
    () =>
      resourcesDebugState
        ? filterResources(resourcesDebugState.resources, filters)
        : [],
    [resourcesDebugState, filters]
  );
  const filteredMemoryBytes = React.useMemo(
    () =>
      filteredRecords.reduce(
        (total, record) => total + (record.estimatedMemoryBytes || 0),
        0
      ),
    [filteredRecords]
  );
  const limitBytes = getMemoryLimitBytes(
    resourcesDebugState,
    artificialLimitMegabytes
  );
  const profilerRecordingRange = recording
    ? getRecordingTimeBounds(recording)
    : null;

  if (!resourcesDebugState) {
    return (
      <Background>
        <EmptyMessage>
          {lastError ? (
            <Trans>
              The game did not answer: it may be too old to report its
              resources. ({lastError})
            </Trans>
          ) : isPollingEnabled ? (
            <Trans>Waiting for the game to report its resources...</Trans>
          ) : (
            <Trans>
              Record a running preview to see the resources it loads.
            </Trans>
          )}
        </EmptyMessage>
      </Background>
    );
  }

  const kinds = Object.keys(resourcesDebugState.totals.byKind).sort();
  const statusesWithResources: Array<ResourceLoadStatus> = resourceLoadStatuses.filter(
    status => (resourcesDebugState.totals.byStatus[status] || 0) > 0
  );

  return (
    <Background>
      <div className={classes.panel} onKeyDown={onKeyDown}>
        <div className={classes.header}>
          <div className={classes.headerRow}>
            <div style={{ flex: 1, minWidth: 160 }}>
              <SearchBar
                value={filters.searchText}
                onChange={searchText => setFilters({ ...filters, searchText })}
                onRequestSearch={() => {}}
                placeholder={t`Search a resource by name, file or scene`}
                aspect="integrated-search-bar"
              />
            </div>
            <Text noMargin size="body-small" color="secondary">
              <Trans>
                {filteredRecords.length} of{' '}
                {resourcesDebugState.resources.length} resources,{' '}
                {formatBytes(filteredMemoryBytes)}
              </Trans>
            </Text>
            <IconButton
              size="small"
              tooltip={t`Refresh now`}
              onClick={refresh}
              disabled={!isPollingEnabled}
            >
              <Refresh />
            </IconButton>
          </div>
          <div className={classes.chips}>
            <FlatButton
              label={<Trans>See all</Trans>}
              onClick={() => setFilters(emptyResourcesFilters)}
              disabled={
                !filters.kinds.length &&
                !filters.statuses.length &&
                !filters.searchText
              }
            />
            {kinds.map(kind => (
              <Chip
                key={kind}
                size="small"
                label={`${kind} (${resourcesDebugState.totals.byKind[kind]})`}
                color={filters.kinds.includes(kind) ? 'primary' : 'default'}
                variant={filters.kinds.includes(kind) ? 'default' : 'outlined'}
                onClick={() =>
                  setFilters({
                    ...filters,
                    kinds: toggleInArray(filters.kinds, kind),
                  })
                }
              />
            ))}
            {statusesWithResources.map(status => (
              <Chip
                key={status}
                size="small"
                label={
                  <span>
                    {getStatusLabel(status)} (
                    {resourcesDebugState.totals.byStatus[status] || 0})
                  </span>
                }
                color={
                  filters.statuses.includes(status) ? 'secondary' : 'default'
                }
                variant={
                  filters.statuses.includes(status) ? 'default' : 'outlined'
                }
                onClick={() =>
                  setFilters({
                    ...filters,
                    statuses: toggleInArray(filters.statuses, status),
                  })
                }
              />
            ))}
          </div>
        </div>
        <MemoryBar
          state={resourcesDebugState}
          records={filteredRecords}
          limitBytes={limitBytes}
          artificialLimitMegabytes={artificialLimitMegabytes}
          onChangeArtificialLimitMegabytes={onChangeArtificialLimitMegabytes}
          selectedResourceName={selectedResourceName}
          onSelectResource={setSelectedResourceName}
        />
        <div className={classes.section} style={{ paddingBottom: 0 }}>
          <div className={classes.sectionTitleRow}>
            <IconButton
              size="small"
              onClick={() => setIsTimelineShown(!isTimelineShown)}
              tooltip={
                isTimelineShown ? t`Hide the timeline` : t`Show the timeline`
              }
            >
              {isTimelineShown ? <ChevronArrowBottom /> : <ChevronArrowRight />}
            </IconButton>
          </div>
        </div>
        {isTimelineShown && (
          <LoadTimeline
            state={resourcesDebugState}
            records={filteredRecords}
            profilerRecordingRange={profilerRecordingRange}
            selectedResourceName={selectedResourceName}
            onSelectResource={setSelectedResourceName}
            focusRequest={focusRequest}
          />
        )}
        <ResourcesTable
          records={filteredRecords}
          selectedResourceName={selectedResourceName}
          onSelectResource={setSelectedResourceName}
        />
      </div>
    </Background>
  );
};

export default ResourcesPanel;
