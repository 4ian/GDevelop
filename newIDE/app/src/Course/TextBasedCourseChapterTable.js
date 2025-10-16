// @flow

import * as React from 'react';
import GDevelopThemeContext from '../UI/Theme/GDevelopThemeContext';
import { ColumnStackLayout } from '../UI/Layout';
import { MarkdownText } from '../UI/MarkdownText';
import {
  Table,
  TableBody,
  TableHeader,
  TableHeaderColumn,
  TableRow,
  TableRowColumn,
} from '../UI/Table';

type Props = {|
  header?: Array<string>,
  rows: Array<Array<string>>,
  caption?: string,
|};

const styles = {
  container: {
    width: '100%',
    overflowX: 'auto',
    margin: '12px 0',
  },
};

const TextBasedCourseChapterTable = ({ header, rows, caption }: Props) => {
  const gdevelopTheme = React.useContext(GDevelopThemeContext);

  const columnCount = React.useMemo(() => {
    const maxColumnsFromRows = rows.reduce(
      (maxColumns, row) => (row.length > maxColumns ? row.length : maxColumns),
      0
    );
    if (header && header.length) {
      return Math.max(header.length, maxColumnsFromRows);
    }
    return maxColumnsFromRows;
  }, [header, rows]);

  if (!header && rows.length === 0) return null;

  const columnIndexes = React.useMemo(
    () => (columnCount > 0 ? Array.from({ length: columnCount }, (_, i) => i) : []),
    [columnCount]
  );

  return (
    <ColumnStackLayout noMargin>
      <div style={styles.container}>
        <Table>
          {header && header.length > 0 && (
            <TableHeader>
              <TableRow>
                {columnIndexes.map(columnIndex => (
                  <TableHeaderColumn key={`header-${columnIndex}`}>
                    {(header && header[columnIndex]) || ''}
                  </TableHeaderColumn>
                ))}
              </TableRow>
            </TableHeader>
          )}
          <TableBody>
            {rows.map((row, rowIndex) => (
              <TableRow key={`row-${rowIndex}`}>
                {columnIndexes.length > 0
                  ? columnIndexes.map(columnIndex => (
                      <TableRowColumn
                        key={`row-${rowIndex}-cell-${columnIndex}`}
                        style={{ whiteSpace: 'pre-wrap' }}
                      >
                        {row[columnIndex] || ''}
                      </TableRowColumn>
                    ))
                  : row.map((cell, cellIndex) => (
                      <TableRowColumn
                        key={`row-${rowIndex}-cell-${cellIndex}`}
                        style={{ whiteSpace: 'pre-wrap' }}
                      >
                        {cell}
                      </TableRowColumn>
                    ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {caption && (
        <div style={{ color: gdevelopTheme.text.color.secondary }}>
          <MarkdownText source={caption} />
        </div>
      )}
    </ColumnStackLayout>
  );
};

export default TextBasedCourseChapterTable;
