// @flow
import * as React from 'react';
import { Line } from '../Grid';
import GDevelopThemeContext from '../Theme/GDevelopThemeContext';

const styles = {
  columnContainer: {
    display: 'flex',
  },
};

type Props<TColumnName> = {|
  columnsRenderer: { [TColumnName]: () => React.Node },
  getColumns: () => Array<{ columnName: TColumnName, ratio?: number }>,
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
      {columns.map(({ columnName }, index) => {
        const columnRenderer = columnsRenderer[columnName];
        const columnRatio = columns[index].ratio || 1;
        if (!columnRenderer) return null;
        const isFirst = index === 0;
        const isLast = index === columns.length - 1;
        // Handle padding between columns, depending on the column ratio.
        // This is to avoid having the border jump when switching between columns.
        const paddingLeft = isFirst
          ? 0
          : columnRatio > 1
          ? columnsPadding * (columnRatio + 1)
          : columnsPadding;
        const paddingRight = isLast
          ? 0
          : columnRatio > 1
          ? columnsPadding * (columnRatio + 1)
          : columnsPadding;
        return (
          <div
            style={{
              ...styles.columnContainer,
              flex: columnRatio,
              paddingLeft,
              paddingRight,
              borderRight: !isLast
                ? `2px solid ${gdevelopTheme.dialog.separator}`
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
