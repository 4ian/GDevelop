// @flow

import { ConstantsEditorContainer } from './ConstantsEditorContainer';

jest.mock('../../EmbeddedGame/EmbeddedGameFrame', () => ({
  setEditorHotReloadNeeded: jest.fn(),
}));
jest.mock('../../Constants/ConstantsDialog', () => ({
  ConstantsEditor: () => null,
}));

describe('ConstantsEditorContainer', () => {
  test('immediately queues Constants auto-saves from the editor', async () => {
    const onAutoSaveConstants: any = jest.fn(() => Promise.resolve(true));
    const triggerUnsavedChanges: any = jest.fn();
    const container = new ConstantsEditorContainer(
      ({
        project: {},
        onAutoSaveConstants,
        unsavedChanges: { triggerUnsavedChanges },
      }: any)
    );

    const editor: any = container.render();
    editor.props.onChange({ value: 'first' });
    editor.props.onChange({ value: 'second' });
    await container.autoSaveChain;

    expect(onAutoSaveConstants).toHaveBeenCalledTimes(1);
    expect(onAutoSaveConstants).toHaveBeenCalledWith({ value: 'second' });
    expect(triggerUnsavedChanges).not.toHaveBeenCalled();
  });

  test('keeps the project dirty when isolated auto-save is unavailable', async () => {
    const onAutoSaveConstants: any = jest.fn(() => Promise.resolve(false));
    const triggerUnsavedChanges: any = jest.fn();
    const container = new ConstantsEditorContainer(
      ({
        onAutoSaveConstants,
        unsavedChanges: { triggerUnsavedChanges },
      }: any)
    );

    container.onConstantsChanged({ value: 'test' });
    await container.autoSaveChain;

    expect(triggerUnsavedChanges).toHaveBeenCalledTimes(1);
  });

  test('keeps the project dirty when isolated auto-save rejects', async () => {
    const onAutoSaveConstants: any = jest.fn(() =>
      Promise.reject(new Error('Write failed'))
    );
    const triggerUnsavedChanges: any = jest.fn();
    const container = new ConstantsEditorContainer(
      ({
        onAutoSaveConstants,
        unsavedChanges: { triggerUnsavedChanges },
      }: any)
    );
    const consoleError = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    container.onConstantsChanged({ value: 'test' });
    await container.autoSaveChain;

    expect(triggerUnsavedChanges).toHaveBeenCalledTimes(1);
    consoleError.mockRestore();
  });
});
