// @flow
import * as React from 'react';
// $FlowFixMe[missing-export] The react-test-renderer libdef is outdated.
import TestRenderer, { act } from 'react-test-renderer';

import {
  FunctionsListToggleButton,
  addFunctionsListToggleButtonToToolbar,
} from './FunctionsListToggleButton';
import {
  SplitEditorToolbar,
  getSplitEditorToolbar,
} from '../MainFrame/Toolbar/SplitEditorToolbar';

jest.mock('../UI/IconButton', () => {
  const React = require('react');
  return ({ children, tooltip, ...props }: any): React.Node => (
    <button {...props}>{children}</button>
  );
});

describe('FunctionsListToggleButton', () => {
  it('toggles its accessible state and delegates the panel resize', () => {
    const isFunctionsListCollapsed = (jest.fn(() => false): any);
    const onToggleFunctionsList = (jest.fn(() => true): any);
    let renderer: any = null;

    act(() => {
      renderer = TestRenderer.create(
        <FunctionsListToggleButton
          isFunctionsListCollapsed={isFunctionsListCollapsed}
          onToggleFunctionsList={onToggleFunctionsList}
        />
      );
    });
    if (!renderer) throw new Error('The toggle button was not rendered.');

    const button = renderer.root.findByType('button');
    expect(button.props['aria-label']).toBe('Hide function list');

    act(() => button.props.onClick());

    expect(onToggleFunctionsList).toHaveBeenCalledTimes(1);
    expect(renderer.root.findByType('button').props['aria-label']).toBe(
      'Show function list'
    );
  });

  it('adds the button to the navigation slot without replacing toolbars', () => {
    const leadingToolbar = <span id="leading" />;
    const trailingToolbar = <span id="trailing" />;
    const toolbar = addFunctionsListToggleButtonToToolbar(
      <SplitEditorToolbar
        leadingToolbar={leadingToolbar}
        trailingToolbar={trailingToolbar}
      />,
      {
        isFunctionsListCollapsed: () => false,
        onToggleFunctionsList: () => true,
      }
    );
    const splitToolbar = getSplitEditorToolbar(toolbar);

    expect(splitToolbar.navigationToolbar).not.toBeNull();
    expect(splitToolbar.leadingToolbar).toBe(leadingToolbar);
    expect(splitToolbar.trailingToolbar).toBe(trailingToolbar);
  });
});
