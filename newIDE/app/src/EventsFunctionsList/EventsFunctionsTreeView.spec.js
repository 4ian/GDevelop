// @flow
import * as React from 'react';
// $FlowFixMe[missing-export] The react-test-renderer libdef is outdated.
import TestRenderer, { act } from 'react-test-renderer';

import EventsFunctionsTreeView from './EventsFunctionsTreeView';

jest.mock('react-virtualized', () => {
  const React = require('react');
  return {
    AutoSizer: ({ children }: any): React.Node => children({ height: 320 }),
  };
});
jest.mock('../UI/Background', () => {
  const React = require('react');
  return ({ children }: any): React.Node => <div>{children}</div>;
});
jest.mock('../UI/CompactSearchBar', () => {
  const React = require('react');
  return ({ value, onChange }: any): React.Node => (
    <input
      id="function-search"
      value={value}
      onChange={(event) => onChange(event.target.value)}
    />
  );
});
jest.mock('../UI/TreeView', () => {
  const React = require('react');
  const TreeView = React.forwardRef<any, any>(
    ({ items, searchText }: any, ref: any): React.Node => (
      <div
        ref={ref}
        id="shared-function-tree"
        data-item-count={items.length}
        data-search-text={searchText}
      />
    )
  );
  return {
    __esModule: true,
    default: TreeView,
  };
});
jest.mock('../UI/Grid', () => {
  const React = require('react');
  return {
    Column: ({ children }: any): React.Node => <div>{children}</div>,
    Line: ({ children }: any): React.Node => <div>{children}</div>,
  };
});
jest.mock('../UI/Layout', () => {
  const React = require('react');
  return {
    LineStackLayout: ({ children }: any): React.Node => <div>{children}</div>,
  };
});

describe('EventsFunctionsTreeView', () => {
  it('shares the searchable tree shell independently of the function owner', () => {
    const props: any = {
      listKey: 'test-functions',
      treeViewRef: { current: null },
      items: [{ id: 'function' }],
      selectedItems: [],
      getItemName: (item) => item.id,
      getItemThumbnail: () => null,
      getItemChildren: () => null,
      getItemId: (item) => item.id,
      onSelectItems: jest.fn(),
      onRenameItem: jest.fn(),
      buildMenuTemplate: () => [],
      onMoveSelectionToItem: jest.fn(),
      reactDndType: 'TEST_FUNCTION',
      headerControls: <div id="owner-header-controls" />,
    };
    const renderer: any = TestRenderer.create(
      <EventsFunctionsTreeView {...props} />
    );

    expect(
      renderer.root.findByProps({ id: 'shared-function-tree' }).props
    ).toMatchObject({
      'data-item-count': 1,
      'data-search-text': '',
    });
    expect(
      renderer.root.findAllByProps({ id: 'owner-header-controls' })
    ).toHaveLength(1);

    act(() => {
      renderer.root
        .findByProps({ id: 'function-search' })
        .props.onChange({ target: { value: 'signal' } });
    });

    expect(
      renderer.root.findByProps({ id: 'shared-function-tree' }).props[
        'data-search-text'
      ]
    ).toBe('signal');
  });
});
