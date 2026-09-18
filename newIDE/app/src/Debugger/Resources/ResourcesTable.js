// @flow
import { t, Trans } from '@lingui/macro';
import * as React from 'react';
import classNames from 'classnames';
import {
  AutoSizer,
  Table as RVTable,
  Column as RVColumn,
  SortDirection,
} from 'react-virtualized';
import Tooltip from '@material-ui/core/Tooltip';
import { I18n } from '@lingui/react';
import type { I18n as I18nType } from '@lingui/core';
import StatusChip from '../../UI/StatusChip';
import EmptyMessage from '../../UI/EmptyMessage';
import { renderSortableHeader } from '../../UI/VirtualizedTableSortableHeader';
import { getDefaultResourceThumbnailForKind } from '../../ResourcesList';
import { formatGameTime } from '../ProfilerRecording/ProfilerRecordingAggregation';
import {
  describeOrigin,
  formatBytes,
  formatDurationMs,
  getLoadDurationMs,
  sortResources,
  type ResourceLoadRecord,
  type ResourceLoadStatus,
  type ResourcesSortKey,
} from './ResourcesDebugTypes';
import classes from './Resources.module.css';

/**
 * The words of the runtime, not those of the network: a game reads most of its
 * resources from the disk or from a cache, where nothing is "downloaded".
 * `loaded` also means "received, not parsed yet", which "Downloaded" hid.
 */
export const getStatusLabel = (status: ResourceLoadStatus): React.Node => {
  switch (status) {
    case 'not-loaded':
      return <Trans>Not loaded</Trans>;
    case 'loading':
      return <Trans>Loading</Trans>;
    case 'loaded':
      return <Trans>Loaded</Trans>;
    case 'processing':
      return <Trans>Processing</Trans>;
    case 'ready':
      return <Trans>Ready</Trans>;
    case 'error':
      return <Trans>Error</Trans>;
    default:
      return status;
  }
};

/** What a status means, for the ones that are not obvious. */
export const getStatusDescription = (
  status: ResourceLoadStatus
): React.Node => {
  switch (status) {
    case 'loaded':
      return <Trans>Received, not parsed yet.</Trans>;
    case 'processing':
      return (
        <Trans>Being parsed by the game (decoded, sent to the GPU...).</Trans>
      );
    case 'ready':
      return <Trans>Usable by the game.</Trans>;
    default:
      return null;
  }
};

export const getStatusTone = (
  status: ResourceLoadStatus
): 'neutral' | 'success' | 'error' | 'warning' | 'info' | 'progress' => {
  switch (status) {
    case 'ready':
      return 'success';
    case 'loaded':
      return 'info';
    case 'loading':
    case 'processing':
      return 'progress';
    case 'error':
      return 'error';
    default:
      return 'neutral';
  }
};

type Props = {|
  records: Array<ResourceLoadRecord>,
  selectedResourceName: ?string,
  onSelectResource: (?string) => void,
|};

const ROW_HEIGHT = 32;
const HEADER_HEIGHT = 30;

/**
 * Every resource of the game with its state, in a table sorted by clicking
 * the headers.
 */
const ResourcesTable = ({
  records,
  selectedResourceName,
  onSelectResource,
}: Props): React.Node => {
  const [sortBy, setSortBy] = React.useState<ResourcesSortKey>(
    'estimatedMemoryBytes'
  );
  const [sortDirection, setSortDirection] = React.useState<'ASC' | 'DESC'>(
    SortDirection.DESC
  );
  const sortedRecords = React.useMemo(
    () => sortResources(records, sortBy, sortDirection),
    [records, sortBy, sortDirection]
  );

  if (!records.length) {
    return (
      <EmptyMessage>
        <Trans>No resource matches the filters.</Trans>
      </EmptyMessage>
    );
  }

  return (
    <I18n>
      {({ i18n }: {| i18n: I18nType |}) => (
        <div className={classes.table}>
          <AutoSizer>
            {({ width, height }) => (
              <RVTable
                width={width}
                height={height}
                headerHeight={HEADER_HEIGHT}
                rowHeight={ROW_HEIGHT}
                rowCount={sortedRecords.length}
                rowGetter={({ index }) => sortedRecords[index]}
                sort={({
                  sortBy: newSortBy,
                  sortDirection: newSortDirection,
                }) => {
                  setSortBy(newSortBy);
                  setSortDirection(newSortDirection);
                }}
                sortBy={sortBy}
                sortDirection={sortDirection}
                className="gd-table"
                headerClassName="tableHeaderColumn"
                headerStyle={{
                  backgroundColor: 'var(--table-header-background-color)',
                }}
                rowClassName={({ index }) =>
                  index < 0
                    ? 'tableHeaderRow'
                    : sortedRecords[index].name === selectedResourceName
                    ? 'tableSelectedRow'
                    : index % 2 === 0
                    ? 'tableEvenRow'
                    : 'tableOddRow'
                }
                onRowClick={({ rowData }) =>
                  onSelectResource(
                    rowData.name === selectedResourceName ? null : rowData.name
                  )
                }
                scrollToIndex={
                  selectedResourceName
                    ? sortedRecords.findIndex(
                        record => record.name === selectedResourceName
                      )
                    : undefined
                }
              >
                <RVColumn
                  label={i18n._(t`Kind`)}
                  dataKey="kind"
                  width={48}
                  headerRenderer={renderSortableHeader}
                  cellRenderer={({ rowData }) => (
                    <Tooltip title={rowData.kind}>
                      <img
                        className={classes.kindIcon}
                        alt={rowData.kind}
                        src={getDefaultResourceThumbnailForKind(rowData.kind)}
                      />
                    </Tooltip>
                  )}
                />
                <RVColumn
                  label={i18n._(t`Name`)}
                  dataKey="name"
                  width={180}
                  flexGrow={2}
                  headerRenderer={renderSortableHeader}
                  cellRenderer={({ rowData }) => (
                    <div
                      className={classNames('tableColumn', classes.cell)}
                      title={rowData.name}
                    >
                      {rowData.name}
                      {rowData.errorMessage ? (
                        <div className={classes.errorMessage}>
                          {rowData.errorMessage}
                        </div>
                      ) : null}
                    </div>
                  )}
                />
                <RVColumn
                  label={i18n._(t`File`)}
                  dataKey="file"
                  width={140}
                  flexGrow={2}
                  headerRenderer={renderSortableHeader}
                  cellRenderer={({ rowData }) => (
                    <div
                      className={classNames('tableColumn', classes.cell)}
                      title={rowData.file}
                    >
                      {rowData.file}
                    </div>
                  )}
                />
                <RVColumn
                  label={i18n._(t`Status`)}
                  dataKey="status"
                  width={110}
                  headerRenderer={renderSortableHeader}
                  cellRenderer={({ rowData }) => {
                    const statusDescription = getStatusDescription(
                      rowData.status
                    );
                    const statusChip = (
                      <StatusChip
                        tone={getStatusTone(rowData.status)}
                        loading={
                          rowData.status === 'loading' ||
                          rowData.status === 'processing'
                        }
                        label={getStatusLabel(rowData.status)}
                      />
                    );
                    return statusDescription ? (
                      <Tooltip title={statusDescription}>
                        <span>{statusChip}</span>
                      </Tooltip>
                    ) : (
                      statusChip
                    );
                  }}
                />
                <RVColumn
                  label={i18n._(t`Size`)}
                  dataKey="transferBytes"
                  width={80}
                  headerRenderer={renderSortableHeader}
                  className={classNames('tableColumn', classes.numberCell)}
                  cellRenderer={({ rowData }) => {
                    const transferredSize = formatBytes(rowData.transferBytes);
                    return (
                      <Tooltip
                        title={
                          rowData.decodedBytes == null &&
                          rowData.transferBytes == null ? (
                            <Trans>
                              Unknown: the size could not be read for this file.
                            </Trans>
                          ) : (
                            // Named in lower case: the identifier of a message
                            // is the sentence itself.
                            <Trans>
                              Size of the file ({transferredSize} transferred
                              over the network)
                            </Trans>
                          )
                        }
                      >
                        <div
                          className={classNames(
                            classes.cell,
                            classes.numberCell
                          )}
                        >
                          {rowData.decodedBytes != null
                            ? formatBytes(rowData.decodedBytes)
                            : rowData.transferBytes != null
                            ? formatBytes(rowData.transferBytes)
                            : i18n._(t`unknown`)}
                        </div>
                      </Tooltip>
                    );
                  }}
                />
                <RVColumn
                  label={i18n._(t`Memory`)}
                  dataKey="estimatedMemoryBytes"
                  width={90}
                  headerRenderer={renderSortableHeader}
                  className={classNames('tableColumn', classes.numberCell)}
                  cellRenderer={({ rowData }) => (
                    <Tooltip
                      title={
                        rowData.metrics && rowData.metrics.width
                          ? `${rowData.metrics.width}×${rowData.metrics
                              .height || 0} px (estimated)`
                          : rowData.metrics && rowData.metrics.durationInSeconds
                          ? `${rowData.metrics.durationInSeconds.toFixed(
                              1
                            )} s (estimated)`
                          : i18n._(t`Estimated`)
                      }
                    >
                      <div
                        className={classNames(classes.cell, classes.numberCell)}
                      >
                        {formatBytes(rowData.estimatedMemoryBytes)}
                      </div>
                    </Tooltip>
                  )}
                />
                <RVColumn
                  label={i18n._(t`Load time`)}
                  dataKey="loadDurationMs"
                  width={80}
                  headerRenderer={renderSortableHeader}
                  className={classNames('tableColumn', classes.numberCell)}
                  cellRenderer={({ rowData }) => (
                    <div
                      className={classNames(classes.cell, classes.numberCell)}
                    >
                      {formatDurationMs(getLoadDurationMs(rowData))}
                    </div>
                  )}
                />
                <RVColumn
                  label={i18n._(t`Started at`)}
                  dataKey="loadStartedAtMs"
                  width={80}
                  headerRenderer={renderSortableHeader}
                  className={classNames('tableColumn', classes.numberCell)}
                  cellRenderer={({ rowData }) => (
                    <div
                      className={classNames(classes.cell, classes.numberCell)}
                    >
                      {rowData.loadStartedAtMs != null
                        ? formatGameTime(rowData.loadStartedAtMs)
                        : '-'}
                    </div>
                  )}
                />
                <RVColumn
                  label={i18n._(t`Requested by`)}
                  dataKey="origin"
                  width={150}
                  flexGrow={1}
                  headerRenderer={renderSortableHeader}
                  cellRenderer={({ rowData }) => {
                    const requestersDescription = rowData.requesters
                      .map(describeOrigin)
                      .join('\n');
                    const originDescription = describeOrigin(rowData.origin);
                    return (
                      <Tooltip
                        title={
                          <span style={{ whiteSpace: 'pre-line' }}>
                            {originDescription
                              ? i18n._(t`Loaded by: ${originDescription}`) +
                                '\n'
                              : ''}
                            {i18n._(t`Referenced by:`)}
                            {'\n'}
                            {requestersDescription || '-'}
                          </span>
                        }
                      >
                        <div className={classes.cell}>
                          {originDescription || i18n._(t`Not loaded yet`)}
                          {rowData.requesters.length > 1
                            ? ` +${rowData.requesters.length - 1}`
                            : ''}
                        </div>
                      </Tooltip>
                    );
                  }}
                />
              </RVTable>
            )}
          </AutoSizer>
        </div>
      )}
    </I18n>
  );
};

export default ResourcesTable;
