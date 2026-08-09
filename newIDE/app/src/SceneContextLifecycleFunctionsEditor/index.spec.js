// @flow
import * as React from 'react';
// $FlowFixMe[missing-export] The react-test-renderer libdef is outdated.
import TestRenderer, { act } from 'react-test-renderer';

import SceneContextLifecycleFunctionsEditor from '.';

jest.mock('../EventsFunctionsList/EventsFunctionsTreeView', () => {
  const React = require('react');
  return ({
    items,
    buildMenuTemplate,
    canMoveSelectionToItem,
  }: any): React.Node => {
    const functionItem = items[0].children[0];
    return (
      <div
        id="shared-events-functions-tree-view"
        data-root-name={items[0].name}
        data-function-count={items[0].children.length}
        data-menu-count={buildMenuTemplate(functionItem, 0).length}
        data-can-move={canMoveSelectionToItem(functionItem, 'inside')}
      />
    );
  };
});

const makeEditor = (name: string): any => ({ name });

describe('SceneContextLifecycleFunctionsEditor', () => {
  it('mounts fixed functions on demand and keeps their editor instances', () => {
    const lifecycleEditorRef: any = React.createRef<any>();
    const onSelectedFunctionChanged = (jest.fn(): any);
    const editors = {
      sceneLoad: makeEditor('sceneLoad'),
      sceneSignal: makeEditor('sceneSignal'),
      sceneUpdate: makeEditor('sceneUpdate'),
      sceneUnload: makeEditor('sceneUnload'),
    };
    const renderFunctionEditor = ({
      lifecycleFunctionName,
      editorRef,
    }: any): React.Node => {
      editorRef(editors[lifecycleFunctionName]);
      return <div id={`function-editor-${lifecycleFunctionName}`} />;
    };
    let renderer: any = null;

    act(() => {
      renderer = TestRenderer.create(
        <SceneContextLifecycleFunctionsEditor
          ref={lifecycleEditorRef}
          ownerKind="scene"
          ownerName="Test scene"
          onSelectedFunctionChanged={onSelectedFunctionChanged}
          renderFunctionEditor={renderFunctionEditor}
        />
      );
    });
    if (!renderer) throw new Error('The lifecycle editor was not rendered.');

    expect(lifecycleEditorRef.current.getSelectedEditor()).toBe(
      editors.sceneUpdate
    );
    expect(
      renderer.root.findByProps({ id: 'shared-events-functions-tree-view' })
        .props
    ).toMatchObject({
      'data-root-name': 'Test scene',
      'data-function-count': 4,
      'data-menu-count': 0,
      'data-can-move': false,
    });
    expect(
      renderer.root.findAllByProps({ id: 'function-editor-sceneSignal' })
    ).toHaveLength(0);

    act(() => {
      expect(
        lifecycleEditorRef.current.selectFunctionByName('sceneSignal')
      ).toBe(true);
    });

    expect(lifecycleEditorRef.current.getSelectedEditor()).toBe(
      editors.sceneSignal
    );
    expect(
      renderer.root.findAllByProps({ id: 'function-editor-sceneUpdate' })
    ).toHaveLength(1);
    expect(
      renderer.root.findAllByProps({ id: 'function-editor-sceneSignal' })
    ).toHaveLength(1);
    expect(lifecycleEditorRef.current.selectFunctionByName('unknown')).toBe(
      false
    );
    expect(onSelectedFunctionChanged).toHaveBeenCalledTimes(2);
  });
});
