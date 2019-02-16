import { Trans } from '@lingui/macro';
import React, { Component } from 'react';
import { AutoSizer, Table, Column } from 'react-virtualized';
import ThemeConsumer from '../../UI/Theme/ThemeConsumer';
const gd = global.gd;

export default class InstancesList extends Component {
  shouldComponentUpdate(nextProps) {
    // Rendering the component is costly as it iterates over
    // every instances, so the prop freezeUpdate allows to ask the component to stop
    // updating, for example when hidden.
    return !nextProps.freezeUpdate;
  }

  componentWillReceiveProps(nextProps) {
    // If the component was frozen and is now allowed to update,
    // force the table to be refreshed to reflect changes (new instances,
    // or selection changes).
    if (!nextProps.freezeUpdate && this.props.freezeUpdate) {
      if (this.table) this.table.forceUpdateGrid();
    }
  }

  componentWillMount() {
    this.renderedRows = [];

    // Functor used to display an instance row
    this.instanceRowRenderer = new gd.InitialInstanceJSFunctor();
    this.instanceRowRenderer.invoke = instancePtr => {
      const instance = gd.wrapPointer(instancePtr, gd.InitialInstance);

      this.renderedRows.push({
        instance,
        name: instance.getObjectName(),
        locked: instance.isLocked() ? '🔒' : '',
        x: instance.getX().toFixed(2),
        y: instance.getY().toFixed(2),
        angle: instance.getAngle().toFixed(2),
        layer: instance.getLayer(),
        zOrder: instance.getZOrder(),
      });
    };
  }

  componentWillUnmount() {
    this.instanceRowRenderer.delete();
  }

  _onRowClick = ({ index }) => {
    if (!this.renderedRows[index]) return;
    this.props.onSelectInstances([this.renderedRows[index].instance]);
  };

  _rowGetter = ({ index }) => {
    return this.renderedRows[index];
  };

  _rowClassName = ({ index }) => {
    if (index < 0) {
      return 'tableHeaderRow';
    } else {
      const row = this.renderedRows[index];
      if (row && this.props.selectedInstances.indexOf(row.instance) !== -1)
        return 'tableSelectedRow';

      return index % 2 === 0 ? 'tableEvenRow' : 'tableOddRow';
    }
  };

  render() {
    const { instances } = this.props;

    this.renderedRows.length = 0;
    instances.iterateOverInstances(this.instanceRowRenderer);

    // Force Table component to be mounted again if instances
    // has been changed. Avoid accessing to invalid objects that could
    // crash the app.
    const tableKey = instances.ptr;

    return (
      <ThemeConsumer>
        {muiTheme => (
          <AutoSizer>
            {({ height, width }) => (
              <Table
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
                <Column
                  label={<Trans>Object name</Trans>}
                  dataKey="name"
                  width={width * 0.35}
                  className={'tableColumn'}
                />
                <Column
                  label=""
                  dataKey="locked"
                  width={width * 0.05}
                  className={'tableColumn'}
                />
                <Column
                  label={<Trans>X</Trans>}
                  dataKey="x"
                  width={width * 0.1}
                  className={'tableColumn'}
                />
                <Column
                  label={<Trans>Y</Trans>}
                  dataKey="y"
                  width={width * 0.1}
                  className={'tableColumn'}
                />
                <Column
                  label={<Trans>Angle</Trans>}
                  dataKey="angle"
                  width={width * 0.1}
                  className={'tableColumn'}
                />
                <Column
                  label={<Trans>Layer</Trans>}
                  dataKey="layer"
                  width={width * 0.2}
                  className={'tableColumn'}
                />
                <Column
                  label={<Trans>Z Order</Trans>}
                  dataKey="zOrder"
                  width={width * 0.1}
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
