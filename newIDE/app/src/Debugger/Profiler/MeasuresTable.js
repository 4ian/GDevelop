// @flow
import { Trans } from '@lingui/macro';

import * as React from 'react';
import { AutoSizer, Table, Column } from 'react-virtualized';
import flatMap from 'lodash/flatMap';
import { type ProfilerMeasuresSection } from '..';
import IconButton from '../../UI/IconButton';
import ChevronArrowRight from '../../UI/CustomSvgIcons/ChevronArrowRight';
import ChevronArrowBottom from '../../UI/CustomSvgIcons/ChevronArrowBottom';

const styles = {
  indent: {
    display: 'flex',
    alignItems: 'center',
  },
};

type Props = {|
  profilerMeasures: ?ProfilerMeasuresSection,
|};

type ProfilerRowData = {|
  name: string,
  time: string,
  parentPercent: string,
  totalPercent: string,
  depth: number,
  hasSubsections: boolean,
  path: string,
  isCollapsed: boolean,
|};

const MeasuresTable = (props: Props) => {
  const [collapsedPaths, setCollapsedPaths] = React.useState({});

  const convertToDataRows = (
    name: string,
    parentSection: ?ProfilerMeasuresSection,
    section: ProfilerMeasuresSection,
    depth: number = 0,
    path: string = ''
  ): Array<ProfilerRowData> => {
    const { profilerMeasures } = props;

    const parentPercent =
      parentSection && section.time && parentSection.time !== 0
        ? (section.time / parentSection.time) * 100
        : 100;
    const totalPercent =
      profilerMeasures && section.time && profilerMeasures.time !== 0
        ? (section.time / profilerMeasures.time) * 100
        : 100;
    const isCollapsed = isSectionCollapsed(path);

    return [
      {
        name,
        time: section.time ? `${section.time.toFixed(2)}ms` : '?',
        parentPercent: `${parentPercent.toFixed(2)}%`,
        totalPercent: `${totalPercent.toFixed(2)}%`,
        depth,
        hasSubsections: !!Object.keys(section.subsections).length,
        path,
        isCollapsed,
      },
      ...(isCollapsed
        ? []
        : flatMap(section.subsections, (subsection, subsectionName) =>
            convertToDataRows(
              subsectionName,
              section,
              subsection,
              depth + 1,
              `${path}>${depth}.${subsectionName}`
            )
          )),
    ];
  };

  const isSectionCollapsed = (path: string) => {
    return collapsedPaths[path];
  };

  const toggleSection = (path: string) => {
    setCollapsedPaths({
      ...collapsedPaths,
      [path]: !collapsedPaths[path],
    });
  };

  const rowClassName = ({ index }: { index: number }) => {
    if (index < 0) {
      return 'tableHeaderRow';
    } else {
      return index % 2 === 0 ? 'tableEvenRow' : 'tableOddRow';
    }
  };

  const renderSectionNameCell = ({ rowData }: { rowData: ProfilerRowData }) => {
    return (
      <div style={styles.indent}>
        <div style={{ width: rowData.depth * 8 }} />
        {rowData.hasSubsections ? (
          <IconButton onClick={() => toggleSection(rowData.path)}>
            {rowData.isCollapsed ? (
              <ChevronArrowRight />
            ) : (
              <ChevronArrowBottom />
            )}
          </IconButton>
        ) : (
          <div style={{ width: 24 }} />
        )}
        {/*
          The name is wrapped in a span to prevent crashes when Google Translate
          translates the website. See https://github.com/4ian/GDevelop/issues/3453.
        */}
        <span>{rowData.name}</span>
      </div>
    );
  };

  const { profilerMeasures } = props;
  if (!profilerMeasures) return null;

  const dataRows = convertToDataRows('All', null, profilerMeasures);

  return (
    <AutoSizer>
      {({ height, width }) => (
        <Table
          headerHeight={30}
          height={height}
          className={`gd-table`}
          headerClassName={'tableHeaderColumn'}
          rowCount={dataRows.length}
          rowGetter={({ index }) => dataRows[index]}
          rowHeight={35}
          onRowClick={() => {}}
          rowClassName={rowClassName}
          width={width}
        >
          <Column
            label={<Trans>Section name</Trans>}
            dataKey="name"
            width={width * 0.4}
            className={'tableColumn'}
            cellRenderer={renderSectionNameCell}
          />
          <Column
            label={<Trans>Time (ms)</Trans>}
            dataKey="time"
            width={width * 0.2}
            className={'tableColumn'}
          />
          <Column
            label={<Trans>% of parent</Trans>}
            dataKey="parentPercent"
            width={width * 0.2}
            className={'tableColumn'}
          />
          <Column
            label={<Trans>% of total</Trans>}
            dataKey="totalPercent"
            width={width * 0.2}
            className={'tableColumn'}
          />
        </Table>
      )}
    </AutoSizer>
  );
};

export default MeasuresTable;
