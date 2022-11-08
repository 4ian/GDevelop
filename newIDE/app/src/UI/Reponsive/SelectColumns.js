// @flow
import * as React from 'react';
import { Line } from '../Grid';
import GDevelopThemeContext from '../Theme/ThemeContext';

const styles = {
  columnContainer: {
    display: 'flex',
    flex: 1,
  },
};

type Props<TColumnName> = {|
  columnsRenderer: { [TColumnName]: () => React.Node },
  getColumns: () => Array<TColumnName>,
|};

const columnsPadding = 4;

export const SelectColumns = ({
  columnsRenderer,
  getColumns,
}: Props<string>) => {
  const gdevelopTheme = React.useContext(GDevelopThemeContext);
  const columns = getColumns();
  return (
    <Line noMargin expand>
      {columns.map((columnName, index) => {
        const columnRenderer = columnsRenderer[columnName];
        if (!columnRenderer) return null;
        const isFirst = index === 0;
        const isLast = index === columns.length - 1;
        return (
          <div
            style={{
              ...styles.columnContainer,
              paddingLeft: isFirst ? 0 : columnsPadding,
              paddingRight: isLast ? 0 : columnsPadding,
              borderLeft: !isFirst
                ? `1px solid ${gdevelopTheme.dialog.separator}`
                : undefined,
              borderRight: !isLast
                ? `1px solid ${gdevelopTheme.dialog.separator}`
                : undefined,
            }}
            key={columnName}
          >
            {columnRenderer()}
          </div>
        );
      })}
    </Line>
  );
};
