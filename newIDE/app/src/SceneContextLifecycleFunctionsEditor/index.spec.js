// @flow
import * as React from 'react';
// $FlowFixMe[missing-export] The react-test-renderer libdef is outdated.
import TestRenderer, { act } from 'react-test-renderer';

import SceneContextLifecycleFunctionsEditor from '.';

jest.mock('@lingui/react', () => {
  const React = require('react');
  return {
    I18n: ({ children }: any): React.Node =>
      children({
        i18n: {
          _: descriptor =>
            typeof descriptor === 'string'
              ? descriptor
              : descriptor.id || descriptor.message || '',
        },
      }),
    Trans: ({ children }: any): React.Node => <>{children}</>,
  };
});

jest.mock('../UI/Dialog', () => {
  const React = require('react');
  return ({ children, open, title }: any): React.Node =>
    open ? (
      <div id="dialog">
        <div id="dialog-title">{title}</div>
        {children}
      </div>
    ) : null;
});

jest.mock(
  '../EventsFunctionsExtensionEditor/ExtensionFunctionSelectorDialog',
  () => {
    const React = require('react');
    return {
      FunctionListItem: ({ functionName, disabled, onChoose }: any) => (
        <button
          id={`choose-${functionName}`}
          disabled={disabled}
          onClick={() =>
            onChoose({
              functionType: global.gd.EventsFunction.Action,
              name: functionName,
            })
          }
        />
      ),
    };
  }
);

jest.mock('../UI/EditorMosaic', () => {
  const React = require('react');
  const MockEditorMosaic = React.forwardRef(
    ({ editors }: any, ref: any): React.Node => {
      const [
        isFunctionsListCollapsed,
        setFunctionsListCollapsed,
      ] = React.useState(false);
      React.useImperativeHandle(ref, () => ({
        isEditorCollapsed: (editorName: string) =>
          editorName === 'functions-list' && isFunctionsListCollapsed,
        collapseEditor: (editorName: string) => {
          if (editorName === 'functions-list') {
            setFunctionsListCollapsed(true);
          }
          return true;
        },
        uncollapseEditor: (editorName: string) => {
          if (editorName === 'functions-list') {
            setFunctionsListCollapsed(false);
          }
          return true;
        },
      }));
      return (
        <div id="mock-editor-mosaic">
          {!isFunctionsListCollapsed &&
            editors['functions-list'].renderEditor()}
          {editors['events-sheet'].renderEditor()}
        </div>
      );
    }
  );
  return {
    __esModule: true,
    default: MockEditorMosaic,
    mosaicContainsNode: () => true,
  };
});

jest.mock('../EventsFunctionsList/EventsFunctionsTreeView', () => {
  const React = require('react');
  return ({
    items,
    selectedItems,
    buildMenuTemplate,
    canMoveSelectionToItem,
    headerControls,
    renderRightComponent,
  }: any): React.Node => {
    const rootItem = items[0];
    const functionItems = rootItem.children.filter(item => !item.isPlaceholder);
    const functionItem = selectedItems[0] || functionItems[0];
    const rootMenu = buildMenuTemplate(rootItem, 0);
    const functionMenu = functionItem ? buildMenuTemplate(functionItem, 0) : [];
    return (
      <>
        {headerControls}
        {renderRightComponent(rootItem)}
        {functionItem && (
          <button
            id="delete-selected-lifecycle-function"
            onClick={functionMenu[functionMenu.length - 1].click}
          />
        )}
        <div
          id="shared-events-functions-tree-view"
          data-root-name={rootItem.name}
          data-function-count={functionItems.length}
          data-menu-count={functionMenu.length}
          data-add-count={rootMenu.length}
          data-can-move={
            functionItem
              ? canMoveSelectionToItem(functionItem, 'inside')
              : false
          }
        />
      </>
    );
  };
});

const makeEditor = (name: string): any => ({ name });

describe('SceneContextLifecycleFunctionsEditor', () => {
  it('adds, selects and deletes optional lifecycle functions', async () => {
    const lifecycleEditorRef: any = React.createRef<any>();
    const onSelectedFunctionChanged = (jest.fn(): any);
    const onLifecycleFunctionsChanged = (jest.fn(): any);
    const editors = {
      sceneLoad: makeEditor('sceneLoad'),
      sceneSignal: makeEditor('sceneSignal'),
      sceneUpdate: makeEditor('sceneUpdate'),
      sceneUnload: makeEditor('sceneUnload'),
    };
    const functions: { [string]: any } = {
      sceneLoad: { getEvents: () => ({ getEventsCount: () => 0 }) },
      sceneSignal: { getEvents: () => ({ getEventsCount: () => 0 }) },
      sceneUpdate: { getEvents: () => ({ getEventsCount: () => 0 }) },
      sceneUnload: { getEvents: () => ({ getEventsCount: () => 0 }) },
    };
    const presentFunctions = new Set<string>(['sceneUpdate']);
    const lifecycleFunctions = {
      hasByName: (name: string) => presentFunctions.has(name),
      getByName: (name: string) => functions[name],
      insertByName: (name: string) => {
        presentFunctions.add(name);
        return functions[name];
      },
      removeByName: (name: string) => presentFunctions.delete(name),
    };
    const owner = ({
      getLifecycleEventsFunctions: () => lifecycleFunctions,
    }: any);
    const openParametersByLifecycleFunctionName: {
      [string]: ?() => void,
    } = {};
    const renderFunctionEditor = ({
      lifecycleFunctionName,
      editorRef,
      onOpenParameters,
    }: any): React.Node => {
      editorRef(editors[lifecycleFunctionName]);
      openParametersByLifecycleFunctionName[
        lifecycleFunctionName
      ] = onOpenParameters;
      return <div id={`function-editor-${lifecycleFunctionName}`} />;
    };
    const renderFunctionParameters = (jest.fn(({ lifecycleFunctionName }) => (
      <div id={`function-parameters-${lifecycleFunctionName}`} />
    )): any);
    let renderer: any = null;

    act(() => {
      renderer = TestRenderer.create(
        <SceneContextLifecycleFunctionsEditor
          ref={lifecycleEditorRef}
          ownerKind="scene"
          ownerName="Test scene"
          owner={owner}
          onSelectedFunctionChanged={onSelectedFunctionChanged}
          onLifecycleFunctionsChanged={onLifecycleFunctionsChanged}
          renderFunctionEditor={renderFunctionEditor}
          renderFunctionParameters={renderFunctionParameters}
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
      'data-function-count': 1,
      'data-menu-count': 1,
      'data-add-count': 1,
      'data-can-move': false,
    });
    expect(
      renderer.root.findAllByProps({ id: 'function-editor-sceneSignal' })
    ).toHaveLength(0);
    expect(openParametersByLifecycleFunctionName.sceneUpdate).toBeNull();
    expect(lifecycleEditorRef.current.selectFunctionByName('sceneSignal')).toBe(
      false
    );

    act(() => {
      renderer.root
        .findByProps({ id: 'add-scene-lifecycle-function-button' })
        .props.onClick();
    });

    expect(renderer.root.findAllByProps({ id: 'dialog' })).toHaveLength(1);
    expect(
      renderer.root.findByProps({ id: 'choose-sceneUpdate' }).props.disabled
    ).toBe(true);
    expect(
      renderer.root.findByProps({ id: 'choose-sceneSignal' }).props.disabled
    ).toBe(false);

    act(() => {
      renderer.root.findByProps({ id: 'choose-sceneSignal' }).props.onClick();
    });

    expect(onLifecycleFunctionsChanged).toHaveBeenCalledTimes(1);
    expect(presentFunctions.has('sceneSignal')).toBe(true);
    expect(lifecycleEditorRef.current.getSelectedEditor()).toBe(
      editors.sceneSignal
    );
    expect(
      renderer.root.findAllByProps({ id: 'function-editor-sceneUpdate' })
    ).toHaveLength(1);
    expect(
      renderer.root.findAllByProps({ id: 'function-editor-sceneSignal' })
    ).toHaveLength(1);
    expect(openParametersByLifecycleFunctionName.sceneSignal).toEqual(
      expect.any(Function)
    );
    const functionSettingsButtons = renderer.root.findAll(
      node =>
        node.type === 'button' && node.props.id === 'function-settings-button'
    );
    expect(functionSettingsButtons).toHaveLength(1);

    act(() => {
      functionSettingsButtons[0].props.onClick();
    });

    expect(renderer.root.findAllByProps({ id: 'dialog' })).toHaveLength(1);
    expect(
      renderer.root.findAllByProps({ id: 'function-parameters-sceneSignal' })
    ).toHaveLength(1);
    expect(renderFunctionParameters).toHaveBeenCalledWith({
      lifecycleFunctionName: 'sceneSignal',
    });
    expect(lifecycleEditorRef.current.selectFunctionByName('unknown')).toBe(
      false
    );
    expect(onSelectedFunctionChanged).toHaveBeenCalledTimes(2);

    await act(async () => {
      await renderer.root
        .findByProps({ id: 'delete-selected-lifecycle-function' })
        .props.onClick();
    });
    expect(presentFunctions.has('sceneSignal')).toBe(false);
    expect(onLifecycleFunctionsChanged).toHaveBeenCalledTimes(2);
    expect(lifecycleEditorRef.current.getSelectedEditor()).toBe(
      editors.sceneUpdate
    );

    expect(lifecycleEditorRef.current.isFunctionsListCollapsed()).toBe(false);
    act(() => {
      expect(lifecycleEditorRef.current.toggleFunctionsList()).toBe(true);
    });
    expect(lifecycleEditorRef.current.isFunctionsListCollapsed()).toBe(true);
    act(() => {
      expect(lifecycleEditorRef.current.toggleFunctionsList()).toBe(false);
    });
    expect(lifecycleEditorRef.current.isFunctionsListCollapsed()).toBe(false);
  });
});
