// @flow
import { t, Trans } from '@lingui/macro';
import * as React from 'react';
import { LineStackLayout } from '../../UI/Layout';
import Background from '../../UI/Background';
import EmptyMessage from '../../UI/EmptyMessage';
import StartRecordingPlaceholder from '../StartRecordingPlaceholder';
import Text from '../../UI/Text';
import SearchBar from '../../UI/SearchBar';
import Chip from '../../UI/Chip';
import IconButton from '../../UI/IconButton';
import Refresh from '../../UI/CustomSvgIcons/Refresh';
import ChevronArrowBottom from '../../UI/CustomSvgIcons/ChevronArrowBottom';
import ChevronArrowRight from '../../UI/CustomSvgIcons/ChevronArrowRight';
import { usePollingRequest } from '../../Utils/UsePollingRequest';
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
  getMemoryLimitBytes,
  resourceLoadStatuses,
  type ResourcesDebugState,
  type ResourcesFilters,
  type ResourceLoadStatus,
} from './ResourcesDebugTypes';
import classes from './Resources.module.css';
import { formatBytes } from '../../Utils/FormatMeasures';

/** How often the game is asked for its resources while the panel is shown. */
export const RESOURCES_POLLING_INTERVAL_MS = 1500;

type Props = {|
  resourcesDebugState: ?ResourcesDebugState,
  lastError: ?string,
  onRefresh: () => Promise<void>,
  isPollingEnabled: boolean,
  recordingStore: ProfilerRecordingStore,
  debuggerId: DebuggerId,
  canRecord: boolean,
  onStartRecording: () => void,
  /** The artificial memory limit, shared with the performance panel. */
  artificialLimitMegabytes: ?number,
  onChangeArtificialLimitMegabytes: (?number) => void,
  /** The resources of the recording pinned as the reference, if any. */
  baselineResourcesDebugState?: ?ResourcesDebugState,
|};

const toggleInArray = <T>(array: Array<T>, value: T): Array<T> =>
  array.includes(value)
    ? array.filter(item => item !== value)
    : [...array, value];

/**
 * "Not loaded" resources have no kind and no other status: this filter is
 * exclusive, selecting it clears the other filters (and the other way around).
 */
const notLoadedStatus: ResourceLoadStatus = 'not-loaded';

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
  canRecord,
  onStartRecording,
  artificialLimitMegabytes,
  onChangeArtificialLimitMegabytes,
  baselineResourcesDebugState,
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
  const recording = useProfilerRecording(recordingStore, debuggerId);

  // Asked at once when the polling starts, then at a pace: a slow answer
  // does not stack requests.
  const refreshNow = usePollingRequest(
    onRefresh,
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
    // Named in lower case: the identifier of a message is the sentence
    // itself, so an interpolated value must read well inside it.
    const errorMessage = lastError;
    if (!lastError && !isPollingEnabled) {
      // Nothing was recorded yet: the button that fills this panel is right
      // here, as in the profiler and the performance panels.
      return (
        <StartRecordingPlaceholder
          description={
            <Trans>
              Record a running preview to see the resources it loads.
            </Trans>
          }
          canRecord={canRecord}
          onStartRecording={onStartRecording}
        />
      );
    }
    return (
      <Background>
        <EmptyMessage>
          {lastError ? (
            <Trans>
              The game did not answer: it may be too old to report its
              resources. ({errorMessage})
            </Trans>
          ) : (
            <Trans>Waiting for the game to report its resources...</Trans>
          )}
        </EmptyMessage>
      </Background>
    );
  }

  const kinds = Object.keys(resourcesDebugState.totals.byKind).sort();
  const isShowingEverything =
    !filters.kinds.length && !filters.statuses.length && !filters.searchText;
  const statusesWithResources: Array<ResourceLoadStatus> = resourceLoadStatuses.filter(
    status => (resourcesDebugState.totals.byStatus[status] || 0) > 0
  );
  // Named in lower case: the identifier of a message is the sentence itself,
  // so an interpolated value must read well inside it.
  const shownResourcesCount = filteredRecords.length;
  const allResourcesCount = resourcesDebugState.resources.length;
  const shownMemory = formatBytes(filteredMemoryBytes);

  return (
    <Background>
      {/* Focusable, so that the F shortcut works as soon as the panel or one
          of its rows is used. */}
      <div className={classes.panel} onKeyDown={onKeyDown} tabIndex={-1}>
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
          </div>
          <div className={classes.chips}>
            <Chip
              size="small"
              label={<Trans>See all</Trans>}
              color={isShowingEverything ? 'primary' : 'default'}
              variant={isShowingEverything ? 'default' : 'outlined'}
              onClick={() => setFilters(emptyResourcesFilters)}
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
                    statuses: filters.statuses.filter(
                      status => status !== notLoadedStatus
                    ),
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
                  setFilters(
                    status === notLoadedStatus
                      ? {
                          ...filters,
                          kinds: [],
                          statuses: filters.statuses.includes(notLoadedStatus)
                            ? []
                            : [notLoadedStatus],
                        }
                      : {
                          ...filters,
                          statuses: toggleInArray(
                            filters.statuses.filter(
                              otherStatus => otherStatus !== notLoadedStatus
                            ),
                            status
                          ),
                        }
                  )
                }
              />
            ))}
            <div className={classes.chipsEnd}>
              <Text noMargin size="body-small" color="secondary">
                <Trans>
                  {shownResourcesCount} of {allResourcesCount} resources,{' '}
                  {shownMemory}
                </Trans>
              </Text>
              <IconButton
                size="small"
                tooltip={t`Refresh now`}
                onClick={refreshNow}
                disabled={!isPollingEnabled}
              >
                <Refresh />
              </IconButton>
            </div>
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
          baselineRecords={
            baselineResourcesDebugState
              ? baselineResourcesDebugState.resources
              : null
          }
        />
        <div className={classes.section} style={{ paddingBottom: 0 }}>
          <LineStackLayout
            noMargin
            alignItems="center"
            justifyContent="space-between"
          >
            <IconButton
              size="small"
              onClick={() => setIsTimelineShown(!isTimelineShown)}
              tooltip={
                isTimelineShown ? t`Hide the timeline` : t`Show the timeline`
              }
            >
              {isTimelineShown ? <ChevronArrowBottom /> : <ChevronArrowRight />}
            </IconButton>
          </LineStackLayout>
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
          baselineRecords={
            baselineResourcesDebugState
              ? baselineResourcesDebugState.resources
              : null
          }
          selectedResourceName={selectedResourceName}
          onSelectResource={setSelectedResourceName}
        />
      </div>
    </Background>
  );
};

export default ResourcesPanel;
