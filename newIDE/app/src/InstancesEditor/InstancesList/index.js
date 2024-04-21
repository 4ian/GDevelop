// @flow
import { t, Trans } from '@lingui/macro';
import React, { Component } from 'react';
import {
  AutoSizer,
  Table as RVTable,
  Column as RVColumn,
  SortDirection,
} from 'react-virtualized';
import IconButton from '../../UI/IconButton';
import KeyboardShortcuts from '../../UI/KeyboardShortcuts';
import GDevelopThemeContext from '../../UI/Theme/GDevelopThemeContext';
import SearchBar, { type SearchBarInterface } from '../../UI/SearchBar';
import RemoveCircle from '../../UI/CustomSvgIcons/RemoveCircle';
import Lock from '../../UI/CustomSvgIcons/Lock';
import LockOpen from '../../UI/CustomSvgIcons/LockOpen';
import { toFixedWithoutTrailingZeros } from '../../Utils/Mathematics';
import ErrorBoundary from '../../UI/ErrorBoundary';
import useForceUpdate from '../../Utils/UseForceUpdate';
import { Column, Line } from '../../UI/Grid';
const gd = global.gd;

const minimumWidths = {
  table: 400,
  objectName: 80,
  icon: 40,
  numberProperty: 40,
  layerName: 50,
};

type RenderedRowInfo = {
  instance: gdInitialInstance,
  name: string,
  locked: boolean,
  x: string,
  y: string,
  angle: string,
  layer: string,
  zOrder: string,
};

const styles = {
  container: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  tableContainer: {
    flex: 1,
    overflowX: 'auto',
    overflowY: 'hidden',
  },
};

const compareStrings = (x: string, y: string, direction: number): number => {
  x = x.toLowerCase();
  y = y.toLowerCase();

  if (x < y) return direction * 1;
  if (x > y) return direction * -1;
  return 0;
};

export type InstancesListInterface = {|
  forceUpdate: () => void,
|};

type State = {|
  searchText: string,
  sortBy: string,
  sortDirection: SortDirection,
|};

type Props = {|
  instances: gdInitialInstancesContainer,
  selectedInstances: Array<gdInitialInstance>,
  onSelectInstances: (Array<gdInitialInstance>, boolean) => void,
|};

class InstancesList extends Component<Props, State> {
  state = {
    searchText: '',
    sortBy: '',
    sortDirection: SortDirection.ASC,
  };
  renderedRows: Array<RenderedRowInfo> = [];
  instanceRowRenderer: ?typeof gd.InitialInstanceJSFunctor;
  table: ?typeof RVTable;
  _searchBar = React.createRef<SearchBarInterface>();
  _keyboardShortcuts = new KeyboardShortcuts({
    isActive: () => false,
    shortcutCallbacks: {},
  });

  // This should be updated, see https://reactjs.org/blog/2018/03/27/update-on-async-rendering.html.
  UNSAFE_componentWillMount() {
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
          locked: instance.isLocked(),
          x: toFixedWithoutTrailingZeros(instance.getX(), 2),
          y: toFixedWithoutTrailingZeros(instance.getY(), 2),
          angle: toFixedWithoutTrailingZeros(instance.getAngle(), 2),
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

    this.props.onSelectInstances(
      [this.renderedRows[index].instance],
      this._keyboardShortcuts.shouldMultiSelect()
    );
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

  _renderLockCell = ({
    rowData: { instance },
  }: {
    rowData: RenderedRowInfo,
  }) => {
    return (
      <IconButton
        size="small"
        onClick={() => {
          if (instance.isSealed()) {
            instance.setSealed(false);
            instance.setLocked(false);
            return;
          }
          if (instance.isLocked()) {
            instance.setSealed(true);
            return;
          }
          instance.setLocked(true);
        }}
      >
        {instance.isLocked() && instance.isSealed() ? (
          <RemoveCircle />
        ) : instance.isLocked() ? (
          <Lock />
        ) : (
          <LockOpen />
        )}
      </IconButton>
    );
  };

  _selectFirstInstance = () => {
    if (this.renderedRows.length) {
      this.props.onSelectInstances([this.renderedRows[0].instance], false);
    }
  };

  _sort = ({
    sortBy,
    sortDirection,
  }: {
    sortBy: string,
    sortDirection: SortDirection,
  }) => {
    this.setState({ sortBy, sortDirection });
  };

  _orderRenderedRows = () => {
    this.renderedRows.sort(
      (a: RenderedRowInfo, b: RenderedRowInfo): number => {
        const direction =
          this.state.sortDirection === SortDirection.ASC ? 1 : -1;

        switch (this.state.sortBy) {
          case 'name':
            return compareStrings(a.name, b.name, direction);
          case 'x':
            return direction * (parseFloat(a.x) - parseFloat(b.x));
          case 'y':
            return direction * (parseFloat(a.y) - parseFloat(b.y));
          case 'angle':
            return direction * (parseFloat(a.angle) - parseFloat(b.angle));
          case 'layer':
            return compareStrings(a.layer, b.layer, direction);
          case 'locked':
            return direction * (Number(a.locked) - Number(b.locked));
          case 'zOrder':
            return direction * (parseFloat(a.zOrder) - parseFloat(b.zOrder));

          default:
            return 0;
        }
      }
    );
  };

  render() {
    const { searchText, sortBy, sortDirection } = this.state;
    const { instances } = this.props;

    if (!this.instanceRowRenderer) return null;

    this.renderedRows.length = 0;
    instances.iterateOverInstances(this.instanceRowRenderer);
    this._orderRenderedRows();

    // Force RVTable component to be mounted again if instances
    // has been changed. Avoid accessing to invalid objects that could
    // crash the app.
    const tableKey = instances.ptr;

    return (
      <GDevelopThemeContext.Consumer>
        {gdevelopTheme => (
          <div style={styles.container}>
            <Line>
              <Column expand>
                <SearchBar
                  value={searchText}
                  onChange={searchText =>
                    this.setState({
                      searchText,
                    })
                  }
                  onRequestSearch={this._selectFirstInstance}
                  ref={this._searchBar}
                  placeholder={t`Search instances`}
                  autoFocus="desktop"
                />
              </Column>
            </Line>
            <div
              style={styles.tableContainer}
              onKeyDown={this._keyboardShortcuts.onKeyDown}
              onKeyUp={this._keyboardShortcuts.onKeyUp}
            >
              <AutoSizer>
                {({ height, width }) => (
                  <RVTable
                    ref={table => (this.table = table)}
                    key={tableKey}
                    headerHeight={30}
                    height={height}
                    className={`gd-table`}
                    headerClassName={'tableHeaderColumn'}
                    rowCount={this.renderedRows.length}
                    rowGetter={this._rowGetter}
                    rowHeight={32}
                    onRowClick={this._onRowClick}
                    rowClassName={this._rowClassName}
                    sort={this._sort}
                    sortBy={sortBy}
                    sortDirection={sortDirection}
                    width={Math.max(width, minimumWidths.table)}
                  >
                    <RVColumn
                      label={<Trans>Object name</Trans>}
                      dataKey="name"
                      width={Math.max(width * 0.35, minimumWidths.objectName)}
                      className={'tableColumn'}
                    />
                    <RVColumn
                      label=""
                      dataKey="locked"
                      width={Math.max(
                        width * 0.05,
                        minimumWidths.numberProperty
                      )}
                      className={'tableColumn'}
                      cellRenderer={this._renderLockCell}
                    />
                    <RVColumn
                      label={<Trans>X</Trans>}
                      dataKey="x"
                      width={Math.max(
                        width * 0.1,
                        minimumWidths.numberProperty
                      )}
                      className={'tableColumn'}
                    />
                    <RVColumn
                      label={<Trans>Y</Trans>}
                      dataKey="y"
                      width={Math.max(
                        width * 0.1,
                        minimumWidths.numberProperty
                      )}
                      className={'tableColumn'}
                    />
                    <RVColumn
                      label={<Trans>Angle</Trans>}
                      dataKey="angle"
                      width={Math.max(
                        width * 0.1,
                        minimumWidths.numberProperty
                      )}
                      className={'tableColumn'}
                    />
                    <RVColumn
                      label={<Trans>Layer</Trans>}
                      dataKey="layer"
                      width={Math.max(width * 0.2, minimumWidths.layerName)}
                      className={'tableColumn'}
                    />
                    <RVColumn
                      label={<Trans>Z Order</Trans>}
                      dataKey="zOrder"
                      width={Math.max(
                        width * 0.1,
                        minimumWidths.numberProperty
                      )}
                      className={'tableColumn'}
                    />
                  </RVTable>
                )}
              </AutoSizer>
            </div>
          </div>
        )}
      </GDevelopThemeContext.Consumer>
    );
  }
}

const InstancesListWithErrorBoundary = React.forwardRef<
  Props,
  InstancesListInterface
>((props, ref) => {
  const forceUpdate = useForceUpdate();
  React.useImperativeHandle(ref, () => ({
    forceUpdate,
  }));

  return (
    <ErrorBoundary
      componentTitle={<Trans>Instances list</Trans>}
      scope="scene-editor-instances-list"
    >
      <InstancesList {...props} />
    </ErrorBoundary>
  );
});

export default InstancesListWithErrorBoundary;
