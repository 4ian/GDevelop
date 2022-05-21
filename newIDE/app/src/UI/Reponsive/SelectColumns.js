// @flow
import * as React from 'react';
import { Line } from '../Grid';

type Props<TColumnName> = {|
  columnsRenderer: { [TColumnName]: () => React.Node },
  getColumns: () => Array<TColumnName>,
|};

export const SelectColumns = (props: Props<string>) => {
  const columns = props.getColumns();
  return (
    <Line noMargin expand>
      {columns.map((columnName) =>
        props.columnsRenderer[columnName]
          ? props.columnsRenderer[columnName]()
          : null
      )}
    </Line>
  );
};
