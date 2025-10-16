// @flow

import * as React from 'react';
import {
  type TextBasedCourseChapterCodeItem,
  type TextBasedCourseChapterTextItem,
} from '../Utils/GDevelopServices/Asset';
import { ColumnStackLayout } from '../UI/Layout';
import {
  Table,
  TableBody,
  TableHeader,
  TableHeaderColumn,
  TableRow,
  TableRowColumn,
} from '../UI/Table';
import { MarkdownText } from '../UI/MarkdownText';
import TextBasedCourseChapterCodeBlock from './TextBasedCourseChapterCodeBlock';

type Props = {|
  header?: Array<TextBasedCourseChapterTextItem>,
  rows: Array<
    Array<TextBasedCourseChapterTextItem | TextBasedCourseChapterCodeItem>
  >,
|};

const styles = {
  container: {
    width: '100%',
    overflowX: 'auto',
    margin: '12px 0',
  },
};

const renderTableCellContent = (
  cell: TextBasedCourseChapterTextItem | TextBasedCourseChapterCodeItem
) => {
  if (cell.type === 'text') {
    return <MarkdownText allowParagraphs source={cell.text} />;
  }
  if (cell.type === 'code') {
    return (
      <TextBasedCourseChapterCodeBlock
        code={cell.code}
        language={cell.language}
        simpleVersion
      />
    );
  }
  return null;
};

const TextBasedCourseChapterTable = ({ header, rows }: Props) => {
  const columnCount = React.useMemo(
    () => {
      const maxColumnsFromRows = rows.reduce(
        (maxColumns, row) =>
          row.length > maxColumns ? row.length : maxColumns,
        0
      );
      if (header && header.length) {
        return Math.max(header.length, maxColumnsFromRows);
      }
      return maxColumnsFromRows;
    },
    [header, rows]
  );

  const columnIndexes = React.useMemo(
    () =>
      columnCount > 0 ? Array.from({ length: columnCount }, (_, i) => i) : [],
    [columnCount]
  );

  if (!header && rows.length === 0) return null;

  return (
    <ColumnStackLayout noMargin>
      <div style={styles.container}>
        <Table>
          {header && header.length > 0 && (
            <TableHeader>
              <TableRow>
                {columnIndexes.map(columnIndex => (
                  <TableHeaderColumn key={`header-${columnIndex}`}>
                    {(header && header[columnIndex].text) || ''}
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
                      >
                        {renderTableCellContent(row[columnIndex])}
                      </TableRowColumn>
                    ))
                  : row.map((cell, cellIndex) => (
                      <TableRowColumn key={`row-${rowIndex}-cell-${cellIndex}`}>
                        {renderTableCellContent(cell)}
                      </TableRowColumn>
                    ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </ColumnStackLayout>
  );
};

export default TextBasedCourseChapterTable;
