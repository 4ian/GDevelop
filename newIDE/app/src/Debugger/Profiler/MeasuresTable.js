// @flow
import { Trans } from '@lingui/macro';

import * as React from 'react';
import classNames from 'classnames';
import { Column as RVColumn, SortDirection } from 'react-virtualized';
import { type ProfilerMeasuresSection } from '..';
import {
  compareMeasures,
  type ComparedMeasuresSection,
} from '../ProfilerRecording/ProfilerRecordingAggregation';
import ChevronArrowRight from '../../UI/CustomSvgIcons/ChevronArrowRight';
import ChevronArrowBottom from '../../UI/CustomSvgIcons/ChevronArrowBottom';
import SortableVirtualizedTable, {
  numberCellClassName,
  useTableSort,
} from '../../UI/SortableVirtualizedTable';
import classes from './Profiler.module.css';
import {
  formatMilliseconds,
  formatSignedDelta,
  formatSignedPercent,
} from '../../Utils/FormatMeasures';

type Props = {|
  profilerMeasures: ?ProfilerMeasuresSection,
  /** The same sections in the recording pinned as the reference, if any. */
  baselineMeasures?: ?ProfilerMeasuresSection,
  /** The height of the table (it is virtualized, so it needs one). */
  height?: number,
|};

type ProfilerRowData = {|
  name: string,
  time: number,
  /** Null when this section is not in the recording being looked at. */
  ownTime: ?number,
  /** Null when there is no reference, or the section is not in it. */
  baselineTime: ?number,
  /** How much longer (or shorter) than the reference, in milliseconds. */
  deltaMs: ?number,
  /** The same, relative to the reference. */
  deltaPercent: ?number,
  parentPercent: number,
  totalPercent: number,
  /** The share of the total time, drawn as a bar behind the row. */
  totalShare: number,
  depth: number,
  hasSubsections: boolean,
  path: string,
  isCollapsed: boolean,
|};

type SortKey = 'name' | 'time' | 'parentPercent' | 'totalPercent' | 'deltaMs';

const ROW_HEIGHT = 28;
const minimumWidths = { table: 360, name: 140, number: 72 };

const formatTime = (row: ProfilerRowData) => formatMilliseconds(row.time);
const formatPercent = (row: ProfilerRowData, percent: number) =>
  row.time ? `${percent.toFixed(1)}%` : '-';
/** A time that may be missing on one side: a dash, never a zero. */
const formatOptionalTime = (timeMs: ?number) => formatMilliseconds(timeMs);
/** Signed, so that lighter and heavier are told apart at a glance. */
const formatDelta = (row: ProfilerRowData) => {
  const formattedDelta = formatSignedDelta(row.deltaMs, formatMilliseconds);
  return row.deltaMs == null || row.deltaPercent == null
    ? formattedDelta
    : `${formattedDelta} (${formatSignedPercent(row.deltaPercent)})`;
};

/**
 * The tree of the sections measured during a frame, as a table like the one
 * of the instances: the columns sort the sections of each level, the arrows
 * fold the sections.
 */
const MeasuresTable = ({
  profilerMeasures,
  baselineMeasures,
  height = 320,
}: Props): null | React.Node => {
  const [collapsedPaths, setCollapsedPaths] = React.useState<{
    [string]: boolean,
  }>({});
  const { sortBy, sortDirection, onSort } = useTableSort<SortKey>('time');

  const toggleSection = (path: string) => {
    setCollapsedPaths({ ...collapsedPaths, [path]: !collapsedPaths[path] });
  };

  // Always built from a compared tree, even without a reference: the same
  // code then serves both, the reference times being simply null.
  const comparedMeasures: ?ComparedMeasuresSection = React.useMemo(
    () =>
      profilerMeasures || baselineMeasures
        ? compareMeasures(profilerMeasures, baselineMeasures)
        : null,
    [profilerMeasures, baselineMeasures]
  );

  const rows: Array<ProfilerRowData> = React.useMemo(
    () => {
      if (!comparedMeasures) return [];
      const totalTime = comparedMeasures.time || 0;
      const sign = sortDirection === SortDirection.ASC ? 1 : -1;
      const getDeltaMs = (section: ComparedMeasuresSection): ?number =>
        section.time == null || section.baselineTime == null
          ? null
          : section.time - section.baselineTime;
      const sortNames = (subsections: {
        [string]: ComparedMeasuresSection,
      }): Array<string> =>
        Object.keys(subsections).sort((nameA, nameB) => {
          if (sortBy === 'name') return sign * nameA.localeCompare(nameB);
          if (sortBy === 'deltaMs') {
            // Sections missing on one side have no difference: they go last,
            // whichever way the column is sorted.
            const deltaA = getDeltaMs(subsections[nameA]);
            const deltaB = getDeltaMs(subsections[nameB]);
            if (deltaA == null && deltaB == null) {
              return nameA.localeCompare(nameB);
            }
            if (deltaA == null) return 1;
            if (deltaB == null) return -1;
            return sign * (deltaA - deltaB) || nameA.localeCompare(nameB);
          }
          // The shares of the parent and of the total sort like the time,
          // among siblings.
          return (
            sign *
              ((subsections[nameA].time || 0) -
                (subsections[nameB].time || 0)) || nameA.localeCompare(nameB)
          );
        });

      const flatten = (
        name: string,
        parentSection: ?ComparedMeasuresSection,
        section: ComparedMeasuresSection,
        depth: number,
        path: string
      ): Array<ProfilerRowData> => {
        const parentPercent =
          parentSection && section.time && parentSection.time
            ? (section.time / parentSection.time) * 100
            : 100;
        const totalPercent =
          section.time && totalTime !== 0
            ? (section.time / totalTime) * 100
            : 100;
        const isCollapsed = !!collapsedPaths[path];
        const deltaMs = getDeltaMs(section);
        const row: ProfilerRowData = {
          name,
          time: section.time || 0,
          ownTime: section.time,
          baselineTime: section.baselineTime,
          deltaMs,
          deltaPercent:
            deltaMs != null && section.baselineTime
              ? (deltaMs / section.baselineTime) * 100
              : null,
          parentPercent,
          totalPercent,
          totalShare: section.time
            ? Math.max(0, Math.min(100, totalPercent))
            : 0,
          depth,
          hasSubsections: !!Object.keys(section.subsections).length,
          path,
          isCollapsed,
        };
        if (isCollapsed) return [row];
        return [
          row,
          ...sortNames(section.subsections).flatMap(subsectionName =>
            flatten(
              subsectionName,
              section,
              section.subsections[subsectionName],
              depth + 1,
              `${path}>${depth}.${subsectionName}`
            )
          ),
        ];
      };
      return flatten('All', null, comparedMeasures, 0, '');
    },
    [comparedMeasures, collapsedPaths, sortBy, sortDirection]
  );

  if (!comparedMeasures) return null;
  const isCompared = !!baselineMeasures;

  return (
    <div className={classes.measuresTable} style={{ height }}>
      <SortableVirtualizedTable
        rows={rows}
        rowHeight={ROW_HEIGHT}
        sortBy={sortBy}
        sortDirection={sortDirection}
        onSort={onSort}
        getRowClassName={row =>
          classNames(
            classes.shareRow,
            { [classes.rootRow]: row.depth === 0 },
            {
              // A section of one run only (a renamed group, a scene that was
              // not played): dimmed, never hidden.
              [classes.oneSidedRow]:
                isCompared && (row.ownTime == null || row.baselineTime == null),
            }
          )
        }
        getRowStyle={row => ({ '--profiler-share': `${row.totalShare}%` })}
        onRowClick={row => {
          if (row.hasSubsections) toggleSection(row.path);
        }}
        minimumWidth={minimumWidths.table}
      >
        {width => (
          <>
            <RVColumn
              label={<Trans>Section name</Trans>}
              dataKey="name"
              width={Math.max(width * 0.55, minimumWidths.name)}
              flexGrow={1}
              className="tableColumn"
              cellRenderer={({ rowData }) => (
                <span
                  className={classes.nameCell}
                  style={{ paddingLeft: rowData.depth * 12 }}
                >
                  {rowData.hasSubsections ? (
                    <button
                      type="button"
                      className={classes.toggle}
                      onClick={event => {
                        event.stopPropagation();
                        toggleSection(rowData.path);
                      }}
                    >
                      {rowData.isCollapsed ? (
                        <ChevronArrowRight />
                      ) : (
                        <ChevronArrowBottom />
                      )}
                    </button>
                  ) : (
                    <span className={classes.togglePlaceholder} />
                  )}
                  {/*
                    The name is wrapped in a span to prevent crashes when Google
                    Translate translates the website.
                    See https://github.com/4ian/GDevelop/issues/3453.
                  */}
                  <span className={classes.name} title={rowData.name}>
                    {rowData.name}
                  </span>
                </span>
              )}
            />
            <RVColumn
              label={<Trans>Time (ms)</Trans>}
              dataKey="time"
              width={Math.max(width * 0.15, minimumWidths.number)}
              className={classNames('tableColumn', numberCellClassName)}
              cellDataGetter={({ rowData }) => formatTime(rowData)}
            />
            <RVColumn
              label={<Trans>% of parent</Trans>}
              dataKey="parentPercent"
              width={Math.max(width * 0.15, minimumWidths.number)}
              className={classNames(
                'tableColumn tableColumnSecondary',
                numberCellClassName
              )}
              cellDataGetter={({ rowData }) =>
                formatPercent(rowData, rowData.parentPercent)
              }
            />
            <RVColumn
              label={<Trans>% of total</Trans>}
              dataKey="totalPercent"
              width={Math.max(width * 0.15, minimumWidths.number)}
              className={classNames(
                'tableColumn tableColumnSecondary',
                numberCellClassName
              )}
              cellDataGetter={({ rowData }) =>
                formatPercent(rowData, rowData.totalPercent)
              }
            />
            {isCompared && (
              <RVColumn
                label={<Trans>Reference</Trans>}
                dataKey="baselineTime"
                width={Math.max(width * 0.15, minimumWidths.number)}
                className={classNames(
                  'tableColumn tableColumnSecondary',
                  numberCellClassName
                )}
                cellDataGetter={({ rowData }) =>
                  formatOptionalTime(rowData.baselineTime)
                }
              />
            )}
            {isCompared && (
              <RVColumn
                label={<Trans>Difference</Trans>}
                dataKey="deltaMs"
                width={Math.max(width * 0.2, minimumWidths.number)}
                className={classNames('tableColumn', numberCellClassName)}
                cellDataGetter={({ rowData }) => formatDelta(rowData)}
              />
            )}
          </>
        )}
      </SortableVirtualizedTable>
    </div>
  );
};

export default MeasuresTable;
