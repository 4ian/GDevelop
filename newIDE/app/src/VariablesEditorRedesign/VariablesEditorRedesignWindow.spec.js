// @flow
import * as React from 'react';
// $FlowFixMe[missing-export] The react-test-renderer libdef is outdated.
import TestRenderer, { act } from 'react-test-renderer';

import VariablesEditorRedesignWindow, {
  getFilteredVariableRows,
  REFERENCE_GEOMETRY,
  type RedesignVariable,
} from './VariablesEditorRedesignWindow';

const searchVariables: Array<RedesignVariable> = [
  {
    id: 'stats',
    scopeId: 'scene',
    name: 'stats',
    type: 'structure',
    children: [
      {
        id: 'speed',
        scopeId: 'scene',
        name: 'speed',
        type: 'number',
        value: 400,
      },
      {
        id: 'hp',
        scopeId: 'scene',
        name: 'hp',
        type: 'number',
        value: 100,
      },
    ],
  },
  {
    id: 'key-spawn',
    scopeId: 'scene',
    name: 'keySpawn',
    type: 'number',
    value: 3,
  },
];

describe('VariablesEditorRedesignWindow', () => {
  it('keeps the two reference canvases at their documented geometry', () => {
    expect(REFERENCE_GEOMETRY).toEqual({
      overview: { width: 1040, height: 660 },
      dialog: { x: 24, y: 20, width: 992, height: 620 },
      search: { width: 1040, height: 470 },
      rowHeight: 36,
    });
  });

  it('matches names and paths while preserving matching ancestors', () => {
    const rows = getFilteredVariableRows({
      variables: searchVariables,
      query: 'sp',
      visibleScopeIds: new Set(['scene']),
      expandedIds: new Set(),
    });

    expect(rows.map(row => row.variable.id)).toEqual([
      'stats',
      'speed',
      'key-spawn',
    ]);
    expect(rows[0].ancestorMatch).toBe(true);
    expect(rows.filter(row => row.directMatch)).toHaveLength(2);
  });

  it('adds a variable and returns the independent model on Apply', () => {
    const onApply = (jest.fn(): any);
    const renderer = TestRenderer.create(
      <VariablesEditorRedesignWindow
        initialVariables={searchVariables}
        onApply={onApply}
      />
    );

    const root = renderer.root;
    act(() => {
      root.findByProps({ 'aria-label': 'Add variable' }).props.onClick();
    });
    act(() => {
      root.findByProps({ children: 'Apply' }).props.onClick();
    });

    expect(onApply).toHaveBeenCalledTimes(1);
    expect(onApply.mock.calls[0][0]).toHaveLength(3);
    expect(onApply.mock.calls[0][0][2]).toMatchObject({
      name: 'Variable',
      scopeId: 'scene',
      type: 'number',
      value: 0,
    });
  });

  it('edits a matching value inline in the search reference window', () => {
    const renderer = TestRenderer.create(
      <VariablesEditorRedesignWindow
        variant="search"
        initialVariables={searchVariables}
      />
    );

    const speedInput = renderer.root.findByProps({
      'aria-label': 'speed value',
    });
    act(() => {
      speedInput.props.onChange({ currentTarget: { value: '450' } });
    });

    expect(
      renderer.root.findByProps({ 'aria-label': 'speed value' }).props.value
    ).toBe('450');
  });
});
