// @noflow
import * as React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import Toolbar from './Toolbar';

jest.mock('../UI/IconButton', () => {
  const React = require('react');
  return function MockIconButton(props) {
    return React.createElement(
      'button',
      {
        id: props.id,
        onClick: props.onClick,
      },
      props.children
    );
  };
});
jest.mock('../UI/Toolbar', () => {
  const React = require('react');
  return {
    ToolbarGroup: props => React.createElement('div', null, props.children),
  };
});
jest.mock('../UI/ToolbarSeparator', () => () => null);
jest.mock('./ToolbarCommands', () => () => null);
jest.mock('../UI/Menu/ElementWithMenu', () => props => props.element);
jest.mock('../KeyboardShortcuts', () => ({
  getShortcutDisplayName: () => '',
  useShortcutMap: () => ({ OPEN_SCENE_VARIABLES: '' }),
}));

const makeProps = (onOpenLayoutEditor?: ?() => void) => ({
  onAddStandardEvent: jest.fn(),
  onAddSubEvent: jest.fn(),
  canAddSubEvent: false,
  onAddLocalVariable: jest.fn(),
  canAddLocalVariable: false,
  onAddCommentEvent: jest.fn(),
  allEventsMetadata: [],
  onAddEvent: jest.fn(),
  onToggleInvertedCondition: jest.fn(),
  onToggleDisabledEvent: jest.fn(),
  canToggleEventDisabled: false,
  canToggleInstructionInverted: false,
  onRemove: jest.fn(),
  canRemove: false,
  undo: jest.fn(),
  canUndo: false,
  redo: jest.fn(),
  canRedo: false,
  onOpenLayoutEditor,
  onToggleSearchPanel: jest.fn(),
  onToggleGraphPreview: jest.fn(),
  isGraphPreviewVisible: false,
  moveEventsIntoNewGroup: jest.fn(),
  canMoveEventsIntoNewGroup: false,
  onOpenSceneVariables: jest.fn(),
});

describe('EventsSheet Toolbar', () => {
  it('shows the associated scene button only when the editor provides one', () => {
    const onOpenLayoutEditor = jest.fn();
    const component = TestRenderer.create(
      <Toolbar {...makeProps(onOpenLayoutEditor)} />
    );
    const associatedSceneButtons = component.root.findAll(
      node =>
        node.type === 'button' &&
        node.props.id === 'toolbar-open-layout-editor-button'
    );

    expect(associatedSceneButtons).toHaveLength(1);
    act(() => associatedSceneButtons[0].props.onClick());
    expect(onOpenLayoutEditor).toHaveBeenCalledTimes(1);

    act(() => component.update(<Toolbar {...makeProps()} />));
    expect(
      component.root.findAll(
        node =>
          node.type === 'button' &&
          node.props.id === 'toolbar-open-layout-editor-button'
      )
    ).toHaveLength(0);
  });
});
