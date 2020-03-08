// @flow
import { Trans } from '@lingui/macro';
import React, { Component } from 'react';
import {
  AutoSizer,
  Table as RVTable,
  Column as RVColumn,
} from 'react-virtualized';
import ThemeConsumer from '../../UI/Theme/ThemeConsumer';
import SearchBar from '../../UI/SearchBar';
const gd = global.gd;

type State = {|
  searchText: string,
|};

type Props = {|
  instances: gdInitialInstancesContainer,
  selectedInstances: Array<gdInitialInstance>,
  onSelectInstances: (Array<gdInitialInstance>) => void,
  freezeUpdate: boolean,
  style?: ?Object,
|};

type RenderedRowInfo = {
  instance: gdInitialInstance,
  name: string,
  locked: string,
  x: string,
  y: string,
  angle: string,
  layer: string,
  zOrder: string,
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
  },
};

export default class InstancesList extends Component<Props, State> {
  state = {
    searchText: '',
  };
  renderedRows: Array<RenderedRowInfo> = [];
  instanceRowRenderer: ?typeof gd.InitialInstanceJSFunctor;
  table: ?typeof RVTable;
  _searchBar = React.createRef<SearchBar>();

  shouldComponentUpdate(nextProps: Props) {
    // Rendering the component is costly as it iterates over
    // every instances, so the prop freezeUpdate allows to ask the component to stop
    // updating, for example when hidden.
    return !nextProps.freezeUpdate;
  }

  componentWillReceiveProps(nextProps: Props) {
    // If the component was frozen and is now allowed to update,
    // force the table to be refreshed to reflect changes (new instances,
    // or selection changes).
    if (!nextProps.freezeUpdate && this.props.freezeUpdate) {
      if (this.table) this.table.forceUpdateGrid();
    }
  }

  componentDidMount() {
    if (this._searchBar.current) this._searchBar.current.focus();
  }

  componentWillMount() {
    // Functor used to display an instance row
    this.instanceRowRenderer = new gd.InitialInstanceJSFunctor();
    this.instanceRowRenderer.invoke = instancePtr => {
      const { searchText } = this.state;
      const instance = gd.wrapPointer(instancePtr, gd.InitialInstance);

      const name: string = instance.getObjectName();
      if (
        !searchText ||
        name.toLowerCase().indexOf(searchText.toLowerCase()) !== -1
      ) {
        this.renderedRows.push({
          instance,
          name,
          locked: instance.isLocked() ? '🔒' : '',
          x: instance.getX().toFixed(2),
          y: instance.getY().toFixed(2),
          angle: instance.getAngle().toFixed(2),
          layer: instance.getLayer(),
          zOrder: instance.getZOrder(),
        });
      }
    };
  }

  componentWillUnmount() {
    if (this.instanceRowRenderer) this.instanceRowRenderer.delete();
  }

  _onRowClick = ({ index }: { index: number }) => {
    if (!this.renderedRows[index]) return;
    this.props.onSelectInstances([this.renderedRows[index].instance]);
  };

  _rowGetter = ({ index }: { index: number }) => {
    return this.renderedRows[index];
  };

  _rowClassName = ({ index }: { index: number }) => {
    if (index < 0) {
      return 'tableHeaderRow';
    } else {
      const row = this.renderedRows[index];
      if (row && this.props.selectedInstances.indexOf(row.instance) !== -1)
        return 'tableSelectedRow';

      return index % 2 === 0 ? 'tableEvenRow' : 'tableOddRow';
    }
  };

  _selectFirstInstance = () => {
    if (this.renderedRows.length) {
      this.props.onSelectInstances([this.renderedRows[0].instance]);
    }
  };

  render() {
    const { searchText } = this.state;
    const { instances, style } = this.props;

    this.renderedRows.length = 0;
    instances.iterateOverInstances(this.instanceRowRenderer);

    // Force RVTable component to be mounted again if instances
    // has been changed. Avoid accessing to invalid objects that could
    // crash the app.
    const tableKey = instances.ptr;

    return (
      <ThemeConsumer>
        {muiTheme => (
          <div style={{ ...styles.container, ...style }}>
            <div style={{ flex: 1 }}>
              <AutoSizer>
                {({ height, width }) => (
                  <RVTable
                    ref={table => (this.table = table)}
                    key={tableKey}
                    headerHeight={30}
                    height={height}
                    className={muiTheme.tableRootClassName}
                    headerClassName={'tableHeaderColumn'}
                    rowCount={this.renderedRows.length}
                    rowGetter={this._rowGetter}
                    rowHeight={35}
                    onRowClick={this._onRowClick}
                    rowClassName={this._rowClassName}
                    width={width}
                  >
                    <RVColumn
                      label={<Trans>Object name</Trans>}
                      dataKey="name"
                      width={width * 0.35}
                      className={'tableColumn'}
                    />
                    <RVColumn
                      label=""
                      dataKey="locked"
                      width={width * 0.05}
                      className={'tableColumn'}
                    />
                    <RVColumn
                      label={<Trans>X</Trans>}
                      dataKey="x"
                      width={width * 0.1}
                      className={'tableColumn'}
                    />
                    <RVColumn
                      label={<Trans>Y</Trans>}
                      dataKey="y"
                      width={width * 0.1}
                      className={'tableColumn'}
                    />
                    <RVColumn
                      label={<Trans>Angle</Trans>}
                      dataKey="angle"
                      width={width * 0.1}
                      className={'tableColumn'}
                    />
                    <RVColumn
                      label={<Trans>Layer</Trans>}
                      dataKey="layer"
                      width={width * 0.2}
                      className={'tableColumn'}
                    />
                    <RVColumn
                      label={<Trans>Z Order</Trans>}
                      dataKey="zOrder"
                      width={width * 0.1}
                      className={'tableColumn'}
                    />
                  </RVTable>
                )}
              </AutoSizer>
            </div>
            <SearchBar
              value={searchText}
              onChange={searchText =>
                this.setState({
                  searchText,
                })
              }
              onRequestSearch={this._selectFirstInstance}
              ref={this._searchBar}
            />
          </div>
        )}
      </ThemeConsumer>
    );
  }
}
