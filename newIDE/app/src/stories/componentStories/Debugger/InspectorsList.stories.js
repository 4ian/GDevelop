// @flow
import * as React from 'react';
import { action } from '@storybook/addon-actions';

import InspectorsList from '../../../Debugger/InspectorsList';
import FixedHeightFlexContainer from '../../FixedHeightFlexContainer';
import paperDecorator from '../../PaperDecorator';
import type {
  InspectorDescription,
  GameData,
} from '../../../Debugger/GDJSInspectorDescriptions';

export default {
  title: 'Debugger/InspectorsList',
  component: InspectorsList,
  decorators: [paperDecorator],
};

const mockGameData: GameData = {
  _variables: {
    _variables: {
      items: [{ name: 'Score', value: 100 }, { name: 'Level', value: 3 }],
    },
  },
  _sceneStack: {
    _stack: [
      {
        _name: 'Game',
        _variables: {
          _variables: {
            items: [{ name: 'Timer', value: 60 }],
          },
        },
        _layers: {
          items: [
            { _name: '', _defaultZOrder: 0 },
            { _name: 'UI', _defaultZOrder: 100 },
          ],
        },
        _instances: {
          items: [
            { name: 'Player', x: 100, y: 200, id: 1 },
            { name: 'Enemy', x: 300, y: 200, id: 2 },
            { name: 'Enemy', x: 500, y: 200, id: 3 },
          ],
        },
      },
    ],
  },
};

const mockGetInspectorDescriptions = (
  gameData: GameData
): Array<InspectorDescription> => [
  {
    label: 'Global variables',
    key: '_variables',
    renderInspector: () => <div>Global variables inspector</div>,
  },
  {
    label: 'Scenes',
    key: ['_sceneStack', '_stack'],
    renderInspector: () => <div>Scenes inspector</div>,
    getSubInspectors: (stackData: GameData) =>
      stackData && Array.isArray(stackData)
        ? stackData.map((scene, index) => ({
            label: scene._name || `Scene ${index}`,
            key: String(index),
            renderInspector: () => <div>Scene {scene._name} inspector</div>,
            getSubInspectors: () => [
              {
                label: 'Scene variables',
                key: '_variables',
                renderInspector: () => <div>Scene variables</div>,
              },
              {
                label: 'Layers',
                key: '_layers',
                renderInspector: () => <div>Layers</div>,
              },
              {
                label: 'Instances',
                key: '_instances',
                renderInspector: () => <div>Instances</div>,
              },
            ],
          }))
        : [],
  },
];

export const Default = () => (
  <FixedHeightFlexContainer height={400}>
    <InspectorsList
      gameData={mockGameData}
      getInspectorDescriptions={mockGetInspectorDescriptions}
      selectedInspectorFullPath={[]}
      onChooseInspector={action('onChooseInspector')}
    />
  </FixedHeightFlexContainer>
);

export const WithSelection = () => (
  <FixedHeightFlexContainer height={400}>
    <InspectorsList
      gameData={mockGameData}
      getInspectorDescriptions={mockGetInspectorDescriptions}
      selectedInspectorFullPath={['_sceneStack', '_stack', '0']}
      onChooseInspector={action('onChooseInspector')}
    />
  </FixedHeightFlexContainer>
);

export const Empty = () => (
  <FixedHeightFlexContainer height={200}>
    <InspectorsList
      gameData={null}
      getInspectorDescriptions={() => []}
      selectedInspectorFullPath={[]}
      onChooseInspector={action('onChooseInspector')}
    />
  </FixedHeightFlexContainer>
);
