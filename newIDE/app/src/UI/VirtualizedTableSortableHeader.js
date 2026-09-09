// @flow
import * as React from 'react';
import SortArrowUp from './CustomSvgIcons/SortArrowUp';
import SortArrowDown from './CustomSvgIcons/SortArrowDown';

/**
 * The header of a sortable column of a react-virtualized `Table`: the label,
 * and an arrow on the column the rows are sorted by. Pass it as
 * `headerRenderer` of a `Column`.
 */
export const renderSortableHeader = ({
  dataKey,
  label,
  sortBy,
  sortDirection,
}: {
  dataKey: string,
  label: React.Node,
  sortBy: string,
  sortDirection: string,
}): React.Node => {
  const isActive = dataKey === sortBy;
  return (
    <span
      style={{
        color: isActive
          ? 'var(--theme-text-default-color)'
          : 'var(--table-text-color-header)',
        display: 'flex',
        alignItems: 'center',
        gap: 4,
      }}
    >
      {label}
      {isActive &&
        (sortDirection === 'ASC' ? (
          <SortArrowUp style={{ width: 12, height: 12, display: 'block' }} />
        ) : (
          <SortArrowDown style={{ width: 12, height: 12, display: 'block' }} />
        ))}
    </span>
  );
};
