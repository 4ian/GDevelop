// @flow
import * as React from 'react';
import { action } from '@storybook/addon-actions';

import { getPaperDecorator } from '../../PaperDecorator';
import FixedHeightFlexContainer from '../../FixedHeightFlexContainer';
import DragAndDropContextProvider from '../../../UI/DragAndDrop/DragAndDropContextProvider';
import { AutoSizer } from 'react-virtualized';

import TreeView from '../../../UI/TreeView';
import { Column, Line } from '../../../UI/Grid';
import TextField from '../../../UI/TextField';
import sample from 'lodash/sample';
import Toggle from '../../../UI/Toggle';
import Text from '../../../UI/Text';
import { ResponsiveLineStackLayout } from '../../../UI/Layout';

export default {
  title: 'UI Building Blocks/TreeView',
  component: TreeView,
  decorators: [getPaperDecorator('dark')],
};

type Node = {|
  name: string,
  id: string,
  isRoot?: boolean,
  children?: Node[],
|};

const nodes: Node[] = [
  {
    name: 'Section 1',
    id: 'section',
    isRoot: true,
    children: [
      {
        name: 'Root #1',
        id: 'root-1',
        children: [
          {
            children: [
              { id: 'child-2', name: 'Child #2' },
              { id: 'child-3', name: 'Child #3' },
            ],
            id: 'child-4',
            name: 'Child #4',
          },
          {
            children: [{ id: 'child-5', name: 'Child #5' }],
            id: 'child-6',
            name: 'Child #6',
          },
        ],
      },
      {
        name: 'Root #2',
        id: 'root-2',
        children: [
          {
            children: [
              { id: 'child-7', name: 'Child #7' },
              { id: 'child-8', name: 'Child #8' },
            ],
            id: 'child-9',
            name: 'Child #9',
          },
          {
            children: [{ id: 'child-10', name: 'Child #10' }],
            id: 'child-11',
            name: 'Child #11',
          },
        ],
      },
      {
        name: 'Root #3',
        id: 'root-3',
        children: [
          {
            children: [
              { id: 'child-12', name: 'Child #12' },
              { id: 'child-13', name: 'Child #13' },
            ],
            id: 'child-14',
            name: 'Child #14',
          },
          {
            children: [{ id: 'child-15', name: 'Child #15' }],
            id: 'child-16',
            name: 'Child #16',
          },
        ],
      },
      {
        name: 'Root #4',
        id: 'root-4',
        children: [
          {
            children: [
              { id: 'child-17', name: 'Child #17' },
              { id: 'child-18', name: 'Child #18' },
            ],
            id: 'child-19',
            name: 'Child #19',
          },
          {
            children: [{ id: 'child-20', name: 'Child #20' }],
            id: 'child-21',
            name: 'Child #21',
          },
        ],
      },
      {
        name: 'Root #5',
        id: 'root-5',
        children: [
          {
            children: [
              { id: 'child-22', name: 'Child #22' },
              { id: 'child-23', name: 'Child #23' },
            ],
            id: 'child-24',
            name: 'Child #24',
          },
          {
            children: [{ id: 'child-25', name: 'Child #25' }],
            id: 'child-26',
            name: 'Child #26',
          },
        ],
      },
    ],
  },
  {
    name: 'Section 2',
    id: 'section-2',
    isRoot: true,
    children: [
      {
        name: 'Root #6',
        id: 'root-6',
        children: [
          {
            children: [
              { id: 'child-27', name: 'Child #27' },
              { id: 'child-28', name: 'Child #28' },
            ],
            id: 'child-29',
            name: 'Child #29',
          },
          {
            children: [{ id: 'child-30', name: 'Child #30' }],
            id: 'child-31',
            name: 'Child #31',
          },
        ],
      },
      {
        name: 'Root #7',
        id: 'root-7',
        children: [
          {
            children: [
              { id: 'child-32', name: 'Child #32' },
              { id: 'child-33', name: 'Child #33' },
            ],
            id: 'child-34',
            name: 'Child #34',
          },
          {
            children: [{ id: 'child-35', name: 'Child #35' }],
            id: 'child-36',
            name: 'Child #36',
          },
        ],
      },
      {
        name: 'Root #8',
        id: 'root-8',
        children: [
          {
            children: [
              { id: 'child-37', name: 'Child #37' },
              { id: 'child-38', name: 'Child #38' },
            ],
            id: 'child-39',
            name: 'Child #39',
          },
          {
            children: [{ id: 'child-40', name: 'Child #40' }],
            id: 'child-41',
            name: 'Child #41',
          },
        ],
      },
      {
        name: 'Root #9',
        id: 'root-9',
        children: [
          {
            children: [
              { id: 'child-42', name: 'Child #42' },
              { id: 'child-43', name: 'Child #43' },
            ],
            id: 'child-44',
            name: 'Child #44',
          },
          {
            children: [{ id: 'child-45', name: 'Child #45' }],
            id: 'child-46',
            name: 'Child #46',
          },
        ],
      },
      {
        name: 'Root #10',
        id: 'root-10',
        children: [
          {
            children: [
              { id: 'child-47', name: 'Child #47' },
              { id: 'child-48', name: 'Child #48' },
            ],
            id: 'child-49',
            name: 'Child #49',
          },
          {
            children: [{ id: 'child-50', name: 'Child #50' }],
            id: 'child-51',
            name: 'Child #51',
          },
        ],
      },
      {
        name: 'Root #11',
        id: 'root-11',
        children: [
          {
            children: [
              { id: 'child-52', name: 'Child #52' },
              { id: 'child-53', name: 'Child #53' },
            ],
            id: 'child-54',
            name: 'Child #54',
          },
          {
            children: [{ id: 'child-55', name: 'Child #55' }],
            id: 'child-56',
            name: 'Child #56',
          },
        ],
      },
      {
        name: 'Root #12',
        id: 'root-12',
        children: [
          {
            children: [
              { id: 'child-57', name: 'Child #57' },
              { id: 'child-58', name: 'Child #58' },
            ],
            id: 'child-59',
            name: 'Child #59',
          },
          {
            children: [{ id: 'child-60', name: 'Child #60' }],
            id: 'child-61',
            name: 'Child #61',
          },
        ],
      },
      {
        name: 'Root #13',
        id: 'root-13',
        children: [
          {
            children: [
              { id: 'child-62', name: 'Child #62' },
              { id: 'child-63', name: 'Child #63' },
            ],
            id: 'child-64',
            name: 'Child #64',
          },
          {
            children: [{ id: 'child-65', name: 'Child #65' }],
            id: 'child-66',
            name: 'Child #66',
          },
        ],
      },
    ],
  },
  {
    name: 'Root #14',
    id: 'root-14',
    children: [
      {
        children: [
          { id: 'child-67', name: 'Child #67' },
          { id: 'child-68', name: 'Child #68' },
        ],
        id: 'child-69',
        name: 'Child #69',
      },
      {
        children: [{ id: 'child-70', name: 'Child #70' }],
        id: 'child-71',
        name: 'Child #71',
      },
    ],
  },
  {
    name: 'Root #15',
    id: 'root-15',
    children: [
      {
        children: [
          { id: 'child-72', name: 'Child #72' },
          { id: 'child-73', name: 'Child #73' },
        ],
        id: 'child-74',
        name: 'Child #74',
      },
      {
        children: [{ id: 'child-75', name: 'Child #75' }],
        id: 'child-76',
        name: 'Child #76',
      },
    ],
  },
  {
    name: 'Root #16',
    id: 'root-16',
    children: [
      {
        children: [
          { id: 'child-77', name: 'Child #77' },
          { id: 'child-78', name: 'Child #78' },
        ],
        id: 'child-79',
        name: 'Child #79',
      },
      {
        children: [{ id: 'child-80', name: 'Child #80' }],
        id: 'child-81',
        name: 'Child #81',
      },
    ],
  },
  {
    name: 'Root #17',
    id: 'root-17',
    children: [
      {
        children: [
          { id: 'child-82', name: 'Child #82' },
          { id: 'child-83', name: 'Child #83' },
        ],
        id: 'child-84',
        name: 'Child #84',
      },
      {
        children: [{ id: 'child-85', name: 'Child #85' }],
        id: 'child-86',
        name: 'Child #86',
      },
    ],
  },
  {
    name: 'Root #18',
    id: 'root-18',
    children: [
      {
        children: [
          { id: 'child-87', name: 'Child #87' },
          { id: 'child-88', name: 'Child #88' },
        ],
        id: 'child-89',
        name: 'Child #89',
      },
      {
        children: [{ id: 'child-90', name: 'Child #90' }],
        id: 'child-91',
        name: 'Child #91',
      },
    ],
  },
  {
    name: 'Root #19',
    id: 'root-19',
    children: [
      {
        children: [
          { id: 'child-92', name: 'Child #92' },
          { id: 'child-93', name: 'Child #93' },
        ],
        id: 'child-94',
        name: 'Child #94',
      },
      {
        children: [{ id: 'child-95', name: 'Child #95' }],
        id: 'child-96',
        name: 'Child #96',
      },
    ],
  },
  {
    name: 'Root #20',
    id: 'root-20',
    children: [
      {
        children: [
          { id: 'child-97', name: 'Child #97' },
          { id: 'child-98', name: 'Child #98' },
        ],
        id: 'child-99',
        name: 'Child #99',
      },
      {
        children: [{ id: 'child-100', name: 'Child #100' }],
        id: 'child-101',
        name: 'Child #101',
      },
    ],
  },
  {
    name: 'Root #21',
    id: 'root-21',
    children: [
      {
        children: [
          { id: 'child-102', name: 'Child #102' },
          { id: 'child-103', name: 'Child #103' },
        ],
        id: 'child-104',
        name: 'Child #104',
      },
      {
        children: [{ id: 'child-105', name: 'Child #105' }],
        id: 'child-106',
        name: 'Child #106',
      },
    ],
  },
  {
    name: 'Root #200',
    id: 'root-22000',
  },
];
export const Default = () => {
  const [searchText, setSearchText] = React.useState<string>('');
  const [multiSelect, setMultiSelect] = React.useState<boolean>(true);
  const [selectedItems, setSelectedItems] = React.useState<Node[]>([]);
  const onSelectItems = (items: Node[]) => {
    setSelectedItems(items.filter(item => !item.isRoot));
  };
  return (
    <DragAndDropContextProvider>
      <Column noMargin expand>
        <ResponsiveLineStackLayout expand>
          <Line expand noMargin>
            <TextField
              fullWidth
              type="text"
              value={searchText}
              onChange={(e, text) => {
                setSearchText(text);
              }}
              hintText={'Filter'}
            />
          </Line>
          <Line noMargin>
            <Toggle
              label={<Text>Allow multi selection</Text>}
              labelPosition="right"
              toggled={multiSelect}
              onToggle={() => setMultiSelect(!multiSelect)}
            />
          </Line>
        </ResponsiveLineStackLayout>
        <FixedHeightFlexContainer height={400}>
          <AutoSizer>
            {({ height, width }) => (
              <Line expand>
                <Column expand noMargin>
                  <TreeView
                    multiSelect={multiSelect}
                    height={height}
                    width={width}
                    items={nodes}
                    searchText={searchText}
                    getItemId={node => node.id}
                    getItemName={node => node.name}
                    onEditItem={action('Edit item')}
                    selectedItems={selectedItems}
                    onSelectItems={onSelectItems}
                    onRenameItem={action('Rename item')}
                    getItemThumbnail={node =>
                      node.children
                        ? null
                        : sample([
                            'res/unknown32.png',
                            'res/view24.png',
                            'res/bug24.png',
                            'res/save_all24.png',
                          ])
                    }
                    // $FlowIgnore
                    getItemChildren={node => node.children}
                    buildMenuTemplate={() => [{ label: 'salut' }]}
                    onMoveSelectionToItem={action('Drop selection on item')}
                    canMoveSelectionToItem={() => Math.random() > 0.2}
                    reactDndType="demo"
                    shouldSelectUponContextMenuOpening
                  />
                </Column>
              </Line>
            )}
          </AutoSizer>
        </FixedHeightFlexContainer>
      </Column>
    </DragAndDropContextProvider>
  );
};
