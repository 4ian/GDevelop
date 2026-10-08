// @flow
import * as React from 'react';
import { action } from '@storybook/addon-actions';

import VariablesContainerInspector from '../../../Debugger/Inspectors/VariablesContainerInspector';
import TimersInspector from '../../../Debugger/Inspectors/TimersInspector';
import RawContentInspector from '../../../Debugger/Inspectors/RawContentInspector';
import FixedHeightFlexContainer from '../../FixedHeightFlexContainer';
import paperDecorator from '../../PaperDecorator';

export default {
  title: 'Debugger/Inspectors',
  decorators: [paperDecorator],
};

const mockVariablesContainer = {
  _variables: {
    items: {
      Score: {
        _type: 'number',
        _value: 9500,
        _str: '',
        _bool: false,
        _children: {},
        _childrenArray: [],
      },
      PlayerName: {
        _type: 'string',
        _value: 0,
        _str: 'Hero',
        _bool: false,
        _children: {},
        _childrenArray: [],
      },
      IsGameOver: {
        _type: 'boolean',
        _value: 0,
        _str: '',
        _bool: false,
        _children: {},
        _childrenArray: [],
      },
      Inventory: {
        _type: 'structure',
        _value: 0,
        _str: '',
        _bool: false,
        _children: {
          Sword: {
            _type: 'number',
            _value: 1,
            _str: '',
            _bool: false,
            _children: {},
            _childrenArray: [],
          },
          Shield: {
            _type: 'number',
            _value: 2,
            _str: '',
            _bool: false,
            _children: {},
            _childrenArray: [],
          },
          Potions: {
            _type: 'array',
            _value: 0,
            _str: '',
            _bool: false,
            _children: {},
            _childrenArray: [
              {
                _type: 'string',
                _value: 0,
                _str: 'Health',
                _bool: false,
                _children: {},
                _childrenArray: [],
              },
              {
                _type: 'string',
                _value: 0,
                _str: 'Mana',
                _bool: false,
                _children: {},
                _childrenArray: [],
              },
            ],
          },
        },
        _childrenArray: [],
      },
      Positions: {
        _type: 'array',
        _value: 0,
        _str: '',
        _bool: false,
        _children: {},
        _childrenArray: [
          {
            _type: 'structure',
            _value: 0,
            _str: '',
            _bool: false,
            _children: {
              X: {
                _type: 'number',
                _value: 100,
                _str: '',
                _bool: false,
                _children: {},
                _childrenArray: [],
              },
              Y: {
                _type: 'number',
                _value: 200,
                _str: '',
                _bool: false,
                _children: {},
                _childrenArray: [],
              },
            },
            _childrenArray: [],
          },
        ],
      },
    },
  },
};

const mockTimers = {
  items: {
    GameTimer: { _time: 45.5, _paused: false },
    SpawnTimer: { _time: 2.3, _paused: false },
    PausedTimer: { _time: 10.0, _paused: true },
  },
};

const mockRawData = {
  name: 'Player',
  x: 150.5,
  y: 300.2,
  angle: 45,
  zOrder: 10,
  hidden: false,
  layer: '',
  _variables: mockVariablesContainer._variables,
  _behaviors: [
    {
      _name: 'PlatformerObject',
      _type: 'PlatformBehavior::PlatformerObjectBehavior',
    },
    { _name: 'Health', _type: 'Health::Health' },
  ],
};

const noop = () => false;

export const VariablesContainer = () => (
  <FixedHeightFlexContainer height={400}>
    <VariablesContainerInspector
      variablesContainer={mockVariablesContainer}
      onEdit={action('onEdit')}
      onCall={action('onCall')}
    />
  </FixedHeightFlexContainer>
);

export const VariablesContainerEmpty = () => (
  <FixedHeightFlexContainer height={200}>
    <VariablesContainerInspector
      variablesContainer={{ _variables: { items: {} } }}
      onEdit={noop}
      onCall={noop}
    />
  </FixedHeightFlexContainer>
);

export const Timers = () => (
  <FixedHeightFlexContainer height={200}>
    <TimersInspector timers={mockTimers} />
  </FixedHeightFlexContainer>
);

export const TimersEmpty = () => (
  <FixedHeightFlexContainer height={100}>
    <TimersInspector timers={{ items: {} }} />
  </FixedHeightFlexContainer>
);

export const RawContent = () => (
  <FixedHeightFlexContainer height={400}>
    <RawContentInspector gameData={mockRawData} onEdit={noop} />
  </FixedHeightFlexContainer>
);

export const RawContentNull = () => (
  <FixedHeightFlexContainer height={100}>
    <RawContentInspector gameData={null} onEdit={noop} />
  </FixedHeightFlexContainer>
);
