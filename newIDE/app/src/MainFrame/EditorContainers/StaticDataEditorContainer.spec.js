// @flow

import { StaticDataEditorContainer } from './StaticDataEditorContainer';

jest.mock('../../EmbeddedGame/EmbeddedGameFrame', () => ({
  setEditorHotReloadNeeded: jest.fn(),
}));
jest.mock('../../StaticData/StaticDataDialog', () => ({
  StaticDataEditor: () => null,
}));

describe('StaticDataEditorContainer', () => {
  test('immediately queues Static Data auto-saves from the editor', async () => {
    const onAutoSaveStaticData: any = jest.fn(() => Promise.resolve(true));
    const triggerUnsavedChanges: any = jest.fn();
    const container = new StaticDataEditorContainer(
      ({
        project: {},
        onAutoSaveStaticData,
        unsavedChanges: { triggerUnsavedChanges },
      }: any)
    );

    const editor: any = container.render();
    editor.props.onChange({ value: 'first' });
    editor.props.onChange({ value: 'second' });
    await container.autoSaveChain;

    expect(onAutoSaveStaticData).toHaveBeenCalledTimes(1);
    expect(onAutoSaveStaticData).toHaveBeenCalledWith({ value: 'second' });
    expect(triggerUnsavedChanges).not.toHaveBeenCalled();
  });

  test('keeps the project dirty when isolated auto-save is unavailable', async () => {
    const onAutoSaveStaticData: any = jest.fn(() => Promise.resolve(false));
    const triggerUnsavedChanges: any = jest.fn();
    const container = new StaticDataEditorContainer(
      ({
        onAutoSaveStaticData,
        unsavedChanges: { triggerUnsavedChanges },
      }: any)
    );

    container.onStaticDataChanged({ value: 'test' });
    await container.autoSaveChain;

    expect(triggerUnsavedChanges).toHaveBeenCalledTimes(1);
  });

  test('keeps the project dirty when isolated auto-save rejects', async () => {
    const onAutoSaveStaticData: any = jest.fn(() =>
      Promise.reject(new Error('Write failed'))
    );
    const triggerUnsavedChanges: any = jest.fn();
    const container = new StaticDataEditorContainer(
      ({
        onAutoSaveStaticData,
        unsavedChanges: { triggerUnsavedChanges },
      }: any)
    );
    const consoleError = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    container.onStaticDataChanged({ value: 'test' });
    await container.autoSaveChain;

    expect(triggerUnsavedChanges).toHaveBeenCalledTimes(1);
    consoleError.mockRestore();
  });
});
