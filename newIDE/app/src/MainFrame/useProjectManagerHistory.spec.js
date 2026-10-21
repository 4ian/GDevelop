// @flow
import * as React from 'react';
import { act } from 'react-dom/test-utils';
import renderer from 'react-test-renderer';
import useProjectManagerHistory, {
  type ProjectManagerHistoryApplyOptions,
  type ProjectManagerHistoryTargetKey,
  type ProjectManagerRenameCommand,
  type UseProjectManagerHistoryResult,
} from './useProjectManagerHistory';

const gd: libGDevelop = global.gd;

const ProjectManagerHistoryTester = ({
  project,
  resultRef,
}: {|
  project: ?gdProject,
  resultRef: {| current: ?UseProjectManagerHistoryResult |},
|}) => {
  const result = useProjectManagerHistory(project);
  resultRef.current = result;
  return null;
};

const renderProjectManagerHistoryTester = (project: ?gdProject) => {
  const resultRef = { current: (null: ?UseProjectManagerHistoryResult) };
  let testRenderer;
  act(() => {
    testRenderer = renderer.create(
      <ProjectManagerHistoryTester project={project} resultRef={resultRef} />
    );
  });
  const rerenderWithProject = (newProject: ?gdProject) => {
    act(() => {
      testRenderer.update(
        <ProjectManagerHistoryTester
          project={newProject}
          resultRef={resultRef}
        />
      );
    });
  };
  // Call a method of the latest result inside act(), so the state update it
  // triggers is flushed (and resultRef refreshed) before the call returns.
  const call = async <T>(
    callback: (result: UseProjectManagerHistoryResult) => T | Promise<T>
  ): Promise<T> => {
    const result = resultRef.current;
    if (!result) throw new Error('Expected a result.');
    let returnValue: T = (undefined: any);
    await act(async () => {
      returnValue = await callback(result);
    });
    return returnValue;
  };
  return { resultRef, rerenderWithProject, call };
};

const noopApplyRenameCommand = (
  command: ProjectManagerRenameCommand,
  direction: 'undo' | 'redo'
) => {};
const noopOptions: ProjectManagerHistoryApplyOptions = {
  applyRenameCommand: noopApplyRenameCommand,
};

describe('useProjectManagerHistory', () => {
  const makeProject = () => {
    // $FlowFixMe[invalid-constructor]
    const project = new gd.ProjectHelper.createNewGDJSProject();
    project.insertNewLayout('Scene1', 0);
    project.insertNewLayout('Scene2', 1);
    return project;
  };

  it('has nothing to undo/redo and does not crash when there is no project yet', async () => {
    const { resultRef, call } = renderProjectManagerHistoryTester(null);
    const result = resultRef.current;
    if (!result) throw new Error('Expected a result.');

    expect(result.canUndo).toBe(false);
    expect(result.canRedo).toBe(false);

    // recordAddition/recordRename/undo must be safe no-ops without a project.
    await call(r => r.recordAddition('scenes', 'SomeScene'));
    expect(await call(r => r.undo(null, noopOptions))).toBe(null);
  });

  it('seeds its cache once a project becomes available, so the very first action is correctly undoable', async () => {
    // The hook is normally mounted once for the whole app, before any
    // project is loaded - reproduce that by starting with no project and
    // only providing one on a later render.
    const project = makeProject();
    const { rerenderWithProject, call } = renderProjectManagerHistoryTester(
      null
    );
    rerenderWithProject(project);

    project.insertNewLayout('Scene3', 2);
    await call(r => r.recordAddition('scenes', 'Scene3'));

    expect(await call(r => r.canUndo)).toBe(true);
    const change = await call(r => r.undo(project, noopOptions));

    // Without seeding the cache from the real project on the transition
    // above, the "before" value for this very first step would be empty,
    // and this undo would silently do nothing.
    expect(change).toEqual({ targetKey: 'scenes', itemName: 'Scene3' });
    expect(project.getLayoutsCount()).toBe(2);
    expect(project.hasLayoutNamed('Scene3')).toBe(false);

    project.delete();
  });

  it('undoes and redoes the creation of a scene', async () => {
    const project = makeProject();
    const { call } = renderProjectManagerHistoryTester(project);

    project.insertNewLayout('Scene3', 2);
    await call(r => r.recordAddition('scenes', 'Scene3'));

    expect(await call(r => r.canUndo)).toBe(true);
    expect(await call(r => r.canRedo)).toBe(false);

    const undoChange = await call(r => r.undo(project, noopOptions));
    expect(undoChange).toEqual({ targetKey: 'scenes', itemName: 'Scene3' });
    expect(project.getLayoutsCount()).toBe(2);
    expect(project.hasLayoutNamed('Scene3')).toBe(false);

    expect(await call(r => r.canUndo)).toBe(false);
    expect(await call(r => r.canRedo)).toBe(true);

    const redoChange = await call(r => r.redo(project, noopOptions));
    expect(redoChange).toEqual({ targetKey: 'scenes', itemName: 'Scene3' });
    expect(project.getLayoutsCount()).toBe(3);
    expect(project.hasLayoutNamed('Scene3')).toBe(true);

    project.delete();
  });

  it('never destroys and recreates a scene unrelated to the step being undone/redone', async () => {
    // A regression test for a real memory-safety bug: undoing/redoing the
    // creation of one scene must not touch any other scene's underlying
    // object - otherwise any editor already open for it (holding
    // references to its instances, events, instructions...) is left
    // pointing at destroyed memory, crashing on next use.
    const project = makeProject();
    const scene1 = project.getLayout('Scene1');
    const event = scene1
      .getEvents()
      .insertNewEvent(project, 'BuiltinCommonInstructions::Standard', 0);
    const condition = new gd.Instruction();
    condition.setType('BuiltinCommonInstructions::Once');
    gd.asStandardEvent(event)
      .getConditions()
      .insert(condition, 0);
    condition.delete();
    const conditionPtrBefore = gd
      .asStandardEvent(scene1.getEvents().getEventAt(0))
      .getConditions()
      .get(0).ptr;

    const removedNames = [];
    const originalRemoveLayout = project.removeLayout.bind(project);
    project.removeLayout = (name: string) => {
      removedNames.push(name);
      originalRemoveLayout(name);
    };

    const { call } = renderProjectManagerHistoryTester(project);
    project.insertNewLayout('Scene3', 2);
    await call(r => r.recordAddition('scenes', 'Scene3'));
    await call(r => r.undo(project, noopOptions));
    await call(r => r.redo(project, noopOptions));

    expect(removedNames).not.toContain('Scene1');
    expect(removedNames).not.toContain('Scene2');

    const conditionPtrAfter = gd
      .asStandardEvent(
        project
          .getLayout('Scene1')
          .getEvents()
          .getEventAt(0)
      )
      .getConditions()
      .get(0).ptr;
    expect(conditionPtrAfter).toBe(conditionPtrBefore);

    project.delete();
  });

  it('undoes and redoes the deletion of a scene, restoring its exact content', async () => {
    const project = makeProject();
    const scene2 = project.getLayout('Scene2');
    scene2.setBackgroundColor(10, 20, 30);
    const { call } = renderProjectManagerHistoryTester(project);

    await call(r => r.recordDeletion('scenes', 'Scene2'));
    project.removeLayout('Scene2');

    const undoChange = await call(r => r.undo(project, noopOptions));
    expect(undoChange).toEqual({ targetKey: 'scenes', itemName: 'Scene2' });
    expect(project.getLayoutsCount()).toBe(2);
    expect(project.hasLayoutNamed('Scene2')).toBe(true);
    // The serialized snapshot restores the scene's own content, not just
    // its name.
    const restoredScene2 = project.getLayout('Scene2');
    expect(restoredScene2.getBackgroundColorRed()).toBe(10);
    expect(restoredScene2.getBackgroundColorGreen()).toBe(20);
    expect(restoredScene2.getBackgroundColorBlue()).toBe(30);

    const redoChange = await call(r => r.redo(project, noopOptions));
    expect(redoChange).toEqual({ targetKey: 'scenes', itemName: 'Scene2' });
    expect(project.getLayoutsCount()).toBe(1);
    expect(project.hasLayoutNamed('Scene2')).toBe(false);

    project.delete();
  });

  it('reverses a rename through the given callback, revealing the name the item actually has after each direction', async () => {
    const project = makeProject();
    const { call } = renderProjectManagerHistoryTester(project);

    const command: ProjectManagerRenameCommand = {
      type: 'renameScene',
      oldName: 'Scene1',
      newName: 'GameScene',
    };
    // The caller already renamed the item before calling recordRename -
    // simulate that the same way MainFrame's renameLayout does.
    project.getLayout('Scene1').setName('GameScene');
    await call(r => r.recordRename(command));

    const applyRenameCommand: (
      command: ProjectManagerRenameCommand,
      direction: 'undo' | 'redo'
    ) => void = (jest.fn((appliedCommand, direction) => {
      const fromName =
        direction === 'undo' ? appliedCommand.newName : appliedCommand.oldName;
      const toName =
        direction === 'undo' ? appliedCommand.oldName : appliedCommand.newName;
      project.getLayout(fromName).setName(toName);
    }): any);

    const undoChange = await call(r => r.undo(project, { applyRenameCommand }));
    expect(applyRenameCommand).toHaveBeenCalledWith(command, 'undo');
    // The item is back to its old name after undo - that's what should be
    // revealed, not the (stale) post-rename name.
    expect(undoChange).toEqual({ targetKey: 'scenes', itemName: 'Scene1' });
    expect(project.hasLayoutNamed('Scene1')).toBe(true);
    expect(project.hasLayoutNamed('GameScene')).toBe(false);

    const redoChange = await call(r => r.redo(project, { applyRenameCommand }));
    expect(applyRenameCommand).toHaveBeenCalledWith(command, 'redo');
    expect(redoChange).toEqual({ targetKey: 'scenes', itemName: 'GameScene' });
    expect(project.hasLayoutNamed('GameScene')).toBe(true);

    project.delete();
  });

  it('undoes and redoes the creation of an external layout and of external events', async () => {
    const project = makeProject();
    const { call } = renderProjectManagerHistoryTester(project);

    project.insertNewExternalLayout('ExternalLayout1', 0);
    await call(r => r.recordAddition('externalLayouts', 'ExternalLayout1'));
    project.insertNewExternalEvents('ExternalEvents1', 0);
    await call(r => r.recordAddition('externalEvents', 'ExternalEvents1'));

    // Undo is a single stack shared across target kinds: the most recent
    // action (the external events) is undone first.
    const firstUndo = await call(r => r.undo(project, noopOptions));
    expect(firstUndo).toEqual({
      targetKey: 'externalEvents',
      itemName: 'ExternalEvents1',
    });
    expect(project.getExternalEventsCount()).toBe(0);
    expect(project.getExternalLayoutsCount()).toBe(1);

    const secondUndo = await call(r => r.undo(project, noopOptions));
    expect(secondUndo).toEqual({
      targetKey: 'externalLayouts',
      itemName: 'ExternalLayout1',
    });
    expect(project.getExternalLayoutsCount()).toBe(0);

    project.delete();
  });

  it('restores a deleted scene with the content it had when deleted, not when the history was seeded', async () => {
    const project = makeProject();
    const { call } = renderProjectManagerHistoryTester(project);
    // Edited after the history was seeded, like in its own editor.
    project.getLayout('Scene2').setBackgroundColor(10, 20, 30);

    await call(r => r.recordDeletion('scenes', 'Scene2'));
    project.removeLayout('Scene2');
    await call(r => r.undo(project, noopOptions));
    expect(project.getLayout('Scene2').getBackgroundColorRed()).toBe(10);

    // Edited again after the undo: the redo/undo must keep that edit.
    project.getLayout('Scene2').setBackgroundColor(40, 50, 60);
    await call(r => r.redo(project, noopOptions));
    expect(project.hasLayoutNamed('Scene2')).toBe(false);
    await call(r => r.undo(project, noopOptions));
    expect(project.getLayout('Scene2').getBackgroundColorRed()).toBe(40);

    project.delete();
  });

  it('keeps a renamed scene when undoing an addition made after the rename', async () => {
    const project = makeProject();
    const { call } = renderProjectManagerHistoryTester(project);

    project.getLayout('Scene1').setName('GameScene');
    await call(r =>
      r.recordRename({
        type: 'renameScene',
        oldName: 'Scene1',
        newName: 'GameScene',
      })
    );
    project.insertNewLayout('Scene3', 2);
    await call(r => r.recordAddition('scenes', 'Scene3'));

    const scene1Ptr = project.getLayout('GameScene').ptr;
    await call(r => r.undo(project, noopOptions));
    expect(project.hasLayoutNamed('Scene3')).toBe(false);
    expect(project.hasLayoutNamed('GameScene')).toBe(true);
    expect(project.hasLayoutNamed('Scene1')).toBe(false);
    expect(project.getLayout('GameScene').ptr).toBe(scene1Ptr);

    project.delete();
  });

  it('restores the first scene of the game when the deletion of that scene is undone', async () => {
    const project = makeProject();
    project.setFirstLayout('Scene1');
    const { call } = renderProjectManagerHistoryTester(project);

    await call(r => r.recordDeletion('scenes', 'Scene1'));
    project.setFirstLayout('');
    project.removeLayout('Scene1');

    await call(r => r.undo(project, noopOptions));
    expect(project.getFirstLayout()).toBe('Scene1');
    await call(r => r.redo(project, noopOptions));
    expect(project.getFirstLayout()).toBe('');

    project.delete();
  });

  it('applies one step for two undos started at the same time, and keeps a step recorded while an undo waits', async () => {
    const project = makeProject();
    const { call, resultRef } = renderProjectManagerHistoryTester(project);
    project.insertNewLayout('Scene3', 2);
    await call(r => r.recordAddition('scenes', 'Scene3'));
    project.insertNewLayout('Scene4', 3);
    await call(r => r.recordAddition('scenes', 'Scene4'));

    const waitResolvers = [];
    const onWillRemoveItems = () =>
      new Promise<void>(resolve => {
        waitResolvers.push(resolve);
      });
    const options: ProjectManagerHistoryApplyOptions = {
      applyRenameCommand: noopApplyRenameCommand,
      onWillRemoveItems,
    };
    const appliedCount = await call<number>(async r => {
      const first = r.undo(project, options);
      const second = r.undo(project, options);
      // Recorded while the first undo waits for the tabs to close.
      project.insertNewLayout('Scene5', 4);
      if (resultRef.current)
        resultRef.current.recordAddition('scenes', 'Scene5');
      waitResolvers.forEach(resolve => resolve());
      const results = await Promise.all([first, second]);
      return results.filter(Boolean).length;
    });
    expect(appliedCount).toBeLessThanOrEqual(1);
    expect(project.hasLayoutNamed('Scene3')).toBe(true);
    expect(project.hasLayoutNamed('Scene5')).toBe(true);

    // The step recorded during the wait is the next one to undo.
    await call(r =>
      r.undo(project, { applyRenameCommand: noopApplyRenameCommand })
    );
    expect(project.hasLayoutNamed('Scene5')).toBe(false);
    expect(project.hasLayoutNamed('Scene3')).toBe(true);

    project.delete();
  });

  it('only removes the added item when undoing an addition, keeping items added later without being recorded', async () => {
    const project = makeProject();
    const { call } = renderProjectManagerHistoryTester(project);
    project.insertNewExternalEvents('A', 0);
    await call(r => r.recordAddition('externalEvents', 'A'));
    // Duplicated (or pasted, or created by the AI) without a record.
    project.insertNewExternalEvents('A2', 1);

    await call(r => r.undo(project, noopOptions));
    expect(project.hasExternalEventsNamed('A')).toBe(false);
    expect(project.hasExternalEventsNamed('A2')).toBe(true);
    await call(r => r.redo(project, noopOptions));
    expect(project.hasExternalEventsNamed('A')).toBe(true);
    expect(project.hasExternalEventsNamed('A2')).toBe(true);

    project.delete();
  });

  it('tells which items an undo/redo is about to remove, before removing them', async () => {
    const project = makeProject();
    const { call } = renderProjectManagerHistoryTester(project);
    project.insertNewLayout('Scene3', 2);
    await call(r => r.recordAddition('scenes', 'Scene3'));

    const removals = [];
    const onWillRemoveItems = jest.fn(
      async (
        targetKey: ProjectManagerHistoryTargetKey,
        itemNames: Array<string>
      ) => {
        removals.push({
          targetKey,
          itemNames,
          stillThere: itemNames.every(name => project.hasLayoutNamed(name)),
        });
      }
    );
    await call(r =>
      r.undo(project, {
        applyRenameCommand: noopApplyRenameCommand,
        onWillRemoveItems,
      })
    );
    expect(removals).toEqual([
      { targetKey: 'scenes', itemNames: ['Scene3'], stillThere: true },
    ]);
    expect(project.hasLayoutNamed('Scene3')).toBe(false);

    // Nothing is removed by the redo of an addition.
    await call(r =>
      r.redo(project, {
        applyRenameCommand: noopApplyRenameCommand,
        onWillRemoveItems,
      })
    );
    expect(onWillRemoveItems).toHaveBeenCalledTimes(1);

    project.delete();
  });
});
