// @flow
import { Trans } from '@lingui/macro';

import * as React from 'react';
import classNames from 'classnames';
import {
  AutoSizer,
  Table as RVTable,
  Column as RVColumn,
  SortDirection,
} from 'react-virtualized';
import { type ProfilerMeasuresSection } from '..';
import ChevronArrowRight from '../../UI/CustomSvgIcons/ChevronArrowRight';
import ChevronArrowBottom from '../../UI/CustomSvgIcons/ChevronArrowBottom';
import { renderSortableHeader } from '../../UI/VirtualizedTableSortableHeader';
import classes from './Profiler.module.css';

type Props = {|
  profilerMeasures: ?ProfilerMeasuresSection,
  /** The height of the table (it is virtualized, so it needs one). */
  height?: number,
|};

type ProfilerRowData = {|
  name: string,
  time: number,
  parentPercent: number,
  totalPercent: number,
  /** The share of the total time, drawn as a bar behind the row. */
  totalShare: number,
  depth: number,
  hasSubsections: boolean,
  path: string,
  isCollapsed: boolean,
|};

type SortKey = 'name' | 'time' | 'parentPercent' | 'totalPercent';

const ROW_HEIGHT = 28;
const HEADER_HEIGHT = 30;
const minimumWidths = { table: 360, name: 140, number: 72 };

const formatTime = (row: ProfilerRowData) =>
  row.time ? `${row.time.toFixed(2)} ms` : '?';
const formatPercent = (row: ProfilerRowData, percent: number) =>
  row.time ? `${percent.toFixed(1)}%` : '-';

/**
 * The tree of the sections measured during a frame, as a table like the one
 * of the instances: the columns sort the sections of each level, the arrows
 * fold the sections.
 */
const MeasuresTable = ({
  profilerMeasures,
  height = 320,
}: Props): null | React.Node => {
  const [collapsedPaths, setCollapsedPaths] = React.useState<{
    [string]: boolean,
  }>({});
  const [sortBy, setSortBy] = React.useState<SortKey>('time');
  const [sortDirection, setSortDirection] = React.useState<'ASC' | 'DESC'>(
    SortDirection.DESC
  );

  const toggleSection = (path: string) => {
    setCollapsedPaths({ ...collapsedPaths, [path]: !collapsedPaths[path] });
  };

  const rows: Array<ProfilerRowData> = React.useMemo(
    () => {
      if (!profilerMeasures) return [];
      const totalTime = profilerMeasures.time;
      const sign = sortDirection === SortDirection.ASC ? 1 : -1;
      const sortNames = (subsections: {
        [string]: ProfilerMeasuresSection,
      }): Array<string> =>
        Object.keys(subsections).sort((nameA, nameB) => {
          if (sortBy === 'name') return sign * nameA.localeCompare(nameB);
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
        parentSection: ?ProfilerMeasuresSection,
        section: ProfilerMeasuresSection,
        depth: number,
        path: string
      ): Array<ProfilerRowData> => {
        const parentPercent =
          parentSection && section.time && parentSection.time !== 0
            ? (section.time / parentSection.time) * 100
            : 100;
        const totalPercent =
          section.time && totalTime !== 0
            ? (section.time / totalTime) * 100
            : 100;
        const isCollapsed = !!collapsedPaths[path];
        const row: ProfilerRowData = {
          name,
          time: section.time || 0,
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
      return flatten('All', null, profilerMeasures, 0, '');
    },
    [profilerMeasures, collapsedPaths, sortBy, sortDirection]
  );

  if (!profilerMeasures) return null;

  return (
    <div className={classes.measuresTable} style={{ height }}>
      <AutoSizer>
        {({ width, height: tableHeight }) => (
          <RVTable
            headerHeight={HEADER_HEIGHT}
            height={tableHeight}
            className="gd-table"
            headerClassName="tableHeaderColumn"
            headerStyle={{
              backgroundColor: 'var(--table-header-background-color)',
            }}
            rowCount={rows.length}
            rowGetter={({ index }) => rows[index]}
            rowHeight={ROW_HEIGHT}
            rowClassName={({ index }) =>
              index < 0
                ? 'tableHeaderRow'
                : classNames(
                    index % 2 === 0 ? 'tableEvenRow' : 'tableOddRow',
                    classes.shareRow,
                    { [classes.rootRow]: rows[index].depth === 0 }
                  )
            }
            rowStyle={({ index }) =>
              index < 0
                ? {}
                : { '--profiler-share': `${rows[index].totalShare}%` }
            }
            onRowClick={({ rowData }) => {
              if (rowData.hasSubsections) toggleSection(rowData.path);
            }}
            sort={({ sortBy: newSortBy, sortDirection: newSortDirection }) => {
              setSortBy(newSortBy);
              setSortDirection(newSortDirection);
            }}
            sortBy={sortBy}
            sortDirection={sortDirection}
            width={Math.max(width, minimumWidths.table)}
          >
            <RVColumn
              label={<Trans>Section name</Trans>}
              dataKey="name"
              width={Math.max(width * 0.55, minimumWidths.name)}
              flexGrow={1}
              className="tableColumn"
              headerRenderer={renderSortableHeader}
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
              className={classNames('tableColumn', classes.numberCell)}
              headerRenderer={renderSortableHeader}
              cellDataGetter={({ rowData }) => formatTime(rowData)}
            />
            <RVColumn
              label={<Trans>% of parent</Trans>}
              dataKey="parentPercent"
              width={Math.max(width * 0.15, minimumWidths.number)}
              className={classNames(
                'tableColumn tableColumnSecondary',
                classes.numberCell
              )}
              headerRenderer={renderSortableHeader}
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
                classes.numberCell
              )}
              headerRenderer={renderSortableHeader}
              cellDataGetter={({ rowData }) =>
                formatPercent(rowData, rowData.totalPercent)
              }
            />
          </RVTable>
        )}
      </AutoSizer>
    </div>
  );
};

export default MeasuresTable;
