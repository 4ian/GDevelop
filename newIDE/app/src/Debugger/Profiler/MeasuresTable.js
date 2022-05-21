// @flow
import { Trans } from '@lingui/macro';

import * as React from 'react';
import { AutoSizer, Table, Column } from 'react-virtualized';
import ThemeConsumer from '../../UI/Theme/ThemeConsumer';
import flatMap from 'lodash/flatMap';
import { type ProfilerMeasuresSection } from '..';
import IconButton from '../../UI/IconButton';
import ExpandMore from '@material-ui/icons/ExpandMore';
import ChevronRight from '@material-ui/icons/ChevronRight';

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

type State = {|
  collapsedPaths: { [string]: boolean },
|};

export default class MeasuresTable extends React.Component<Props, State> {
  state = {
    collapsedPaths: {},
  };

  _convertToDataRows = (
    name: string,
    parentSection: ?ProfilerMeasuresSection,
    section: ProfilerMeasuresSection,
    depth: number = 0,
    path: string = ''
  ): Array<ProfilerRowData> => {
    const { profilerMeasures } = this.props;

    const parentPercent =
      parentSection && section.time && parentSection.time !== 0
        ? (section.time / parentSection.time) * 100
        : 100;
    const totalPercent =
      profilerMeasures && section.time && profilerMeasures.time !== 0
        ? (section.time / profilerMeasures.time) * 100
        : 100;
    const isCollapsed = this._isSectionCollapsed(path);

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
            this._convertToDataRows(
              subsectionName,
              section,
              subsection,
              depth + 1,
              `${path}>${depth}.${subsectionName}`
            )
          )),
    ];
  };

  _isSectionCollapsed = (path: string) => {
    return this.state.collapsedPaths[path];
  };

  _toggleSection = (path: string) => {
    this.setState((state) => ({
      collapsedPaths: {
        ...state.collapsedPaths,
        [path]: !state.collapsedPaths[path],
      },
    }));
  };

  _rowClassName = ({ index }: { index: number }) => {
    if (index < 0) {
      return 'tableHeaderRow';
    } else {
      return index % 2 === 0 ? 'tableEvenRow' : 'tableOddRow';
    }
  };

  _renderSectionNameCell = ({ rowData }: { rowData: ProfilerRowData }) => {
    return (
      <div style={styles.indent}>
        <div style={{ width: rowData.depth * 8 }} />
        {rowData.hasSubsections ? (
          <IconButton onClick={() => this._toggleSection(rowData.path)}>
            {rowData.isCollapsed ? <ChevronRight /> : <ExpandMore />}
          </IconButton>
        ) : (
          <div style={{ width: 24 }} />
        )}
        {rowData.name}
      </div>
    );
  };

  render() {
    const { profilerMeasures } = this.props;
    if (!profilerMeasures) return null;

    const dataRows = this._convertToDataRows('All', null, profilerMeasures);

    return (
      <ThemeConsumer>
        {(muiTheme) => (
          <AutoSizer>
            {({ height, width }) => (
              <Table
                headerHeight={30}
                height={height}
                className={`gd-table ${muiTheme.tableRootClassName}`}
                headerClassName={'tableHeaderColumn'}
                rowCount={dataRows.length}
                rowGetter={({ index }) => dataRows[index]}
                rowHeight={35}
                onRowClick={() => {}}
                rowClassName={this._rowClassName}
                width={width}
              >
                <Column
                  label={<Trans>Section name</Trans>}
                  dataKey="name"
                  width={width * 0.4}
                  className={'tableColumn'}
                  cellRenderer={this._renderSectionNameCell}
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
        )}
      </ThemeConsumer>
    );
  }
}
