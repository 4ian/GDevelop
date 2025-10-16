// @flow

import * as React from 'react';
import GDevelopThemeContext from '../UI/Theme/GDevelopThemeContext';
import { ColumnStackLayout } from '../UI/Layout';
import { MarkdownText } from '../UI/MarkdownText';

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
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    minWidth: 320,
  },
  cell: {
    padding: '8px 12px',
    textAlign: 'left',
    verticalAlign: 'top',
    fontSize: 14,
    lineHeight: 1.5,
  },
};

const TextBasedCourseChapterTable = ({ header, rows, caption }: Props) => {
  const gdevelopTheme = React.useContext(GDevelopThemeContext);

  const isDarkMode = gdevelopTheme.palette.type === 'dark';
  const borderColor = isDarkMode
    ? 'rgba(255, 255, 255, 0.1)'
    : 'rgba(15, 23, 42, 0.15)';
  const headerBackground = isDarkMode
    ? 'rgba(148, 163, 184, 0.12)'
    : 'rgba(15, 23, 42, 0.06)';
  const alternatingRowBackground = isDarkMode
    ? 'rgba(148, 163, 184, 0.08)'
    : 'rgba(15, 23, 42, 0.03)';

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

  return (
    <ColumnStackLayout noMargin>
      <div style={styles.container}>
        <table style={{ ...styles.table, border: `1px solid ${borderColor}` }}>
          {header && header.length > 0 && (
            <thead>
              <tr>
                {header.map((cell, cellIndex) => (
                  <th
                    key={`header-${cellIndex}`}
                    style={{
                      ...styles.cell,
                      borderBottom: `1px solid ${borderColor}`,
                      borderRight:
                        cellIndex === columnCount - 1
                          ? 'none'
                          : `1px solid ${borderColor}`,
                      backgroundColor: headerBackground,
                      color: gdevelopTheme.text.color.primary,
                      fontWeight: 600,
                    }}
                  >
                    {cell}
                  </th>
                ))}
              </tr>
            </thead>
          )}
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={`row-${rowIndex}`}>
                {Array.from({ length: (columnCount || row.length || 1) }).map((_, cellIndex) => (
                  <td
                    key={`row-${rowIndex}-cell-${cellIndex}`}
                    style={{
                      ...styles.cell,
                      borderTop:
                        rowIndex === 0 && header
                          ? 'none'
                          : `1px solid ${borderColor}`,
                      borderBottom: `1px solid ${borderColor}`,
                      borderRight:
                        cellIndex === (columnCount || row.length || 1) - 1
                          ? 'none'
                          : `1px solid ${borderColor}`,
                      backgroundColor:
                        rowIndex % 2 === 1 ? alternatingRowBackground : undefined,
                      color: gdevelopTheme.text.color.primary,
                      whiteSpace: 'pre-wrap',
                    }}
                  >
                    {row[cellIndex] || ''}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
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
