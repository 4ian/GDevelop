// @flow
import * as React from 'react';
import { act } from 'react-dom/test-utils';
import renderer from 'react-test-renderer';
import useProjectManagerHistory, {
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
  const call = <T>(
    callback: (result: UseProjectManagerHistoryResult) => T
  ): T => {
    const result = resultRef.current;
    if (!result) throw new Error('Expected a result.');
    let returnValue: T = (undefined: any);
    act(() => {
      returnValue = callback(result);
    });
    return returnValue;
  };
  return { resultRef, rerenderWithProject, call };
};

const noopApplyRenameCommand = (
  command: ProjectManagerRenameCommand,
  direction: 'undo' | 'redo'
) => {};

describe('useProjectManagerHistory', () => {
  const makeProject = () => {
    // $FlowFixMe[invalid-constructor]
    const project = new gd.ProjectHelper.createNewGDJSProject();
    project.insertNewLayout('Scene1', 0);
    project.insertNewLayout('Scene2', 1);
    return project;
  };

  it('has nothing to undo/redo and does not crash when there is no project yet', () => {
    const { resultRef, call } = renderProjectManagerHistoryTester(null);
    const result = resultRef.current;
    if (!result) throw new Error('Expected a result.');

    expect(result.canUndo).toBe(false);
    expect(result.canRedo).toBe(false);

    // recordStep/recordRename/undo must be safe no-ops without a project.
    call(r => r.recordStep('scenes', 'ADD', 'SomeScene'));
    expect(call(r => r.undo(null, noopApplyRenameCommand))).toBe(null);
  });

  it('seeds its cache once a project becomes available, so the very first action is correctly undoable', () => {
    // The hook is normally mounted once for the whole app, before any
    // project is loaded - reproduce that by starting with no project and
    // only providing one on a later render.
    const project = makeProject();
    const { rerenderWithProject, call } = renderProjectManagerHistoryTester(
      null
    );
    rerenderWithProject(project);

    project.insertNewLayout('Scene3', 2);
    call(r => r.recordStep('scenes', 'ADD', 'Scene3'));

    expect(call(r => r.canUndo)).toBe(true);
    const change = call(r => r.undo(project, noopApplyRenameCommand));

    // Without seeding the cache from the real project on the transition
    // above, the "before" value for this very first step would be empty,
    // and this undo would silently do nothing.
    expect(change).toEqual({ targetKey: 'scenes', itemName: 'Scene3' });
    expect(project.getLayoutsCount()).toBe(2);
    expect(project.hasLayoutNamed('Scene3')).toBe(false);

    project.delete();
  });

  it('undoes and redoes the creation of a scene', () => {
    const project = makeProject();
    const { call } = renderProjectManagerHistoryTester(project);

    project.insertNewLayout('Scene3', 2);
    call(r => r.recordStep('scenes', 'ADD', 'Scene3'));

    expect(call(r => r.canUndo)).toBe(true);
    expect(call(r => r.canRedo)).toBe(false);

    const undoChange = call(r => r.undo(project, noopApplyRenameCommand));
    expect(undoChange).toEqual({ targetKey: 'scenes', itemName: 'Scene3' });
    expect(project.getLayoutsCount()).toBe(2);
    expect(project.hasLayoutNamed('Scene3')).toBe(false);

    expect(call(r => r.canUndo)).toBe(false);
    expect(call(r => r.canRedo)).toBe(true);

    const redoChange = call(r => r.redo(project, noopApplyRenameCommand));
    expect(redoChange).toEqual({ targetKey: 'scenes', itemName: 'Scene3' });
    expect(project.getLayoutsCount()).toBe(3);
    expect(project.hasLayoutNamed('Scene3')).toBe(true);

    project.delete();
  });

  it('never destroys and recreates a scene unrelated to the step being undone/redone', () => {
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
    call(r => r.recordStep('scenes', 'ADD', 'Scene3'));
    call(r => r.undo(project, noopApplyRenameCommand));
    call(r => r.redo(project, noopApplyRenameCommand));

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

  it('undoes and redoes the deletion of a scene, restoring its exact content', () => {
    const project = makeProject();
    const scene2 = project.getLayout('Scene2');
    scene2.setBackgroundColor(10, 20, 30);
    const { call } = renderProjectManagerHistoryTester(project);

    project.removeLayout('Scene2');
    call(r => r.recordStep('scenes', 'DELETE', 'Scene2'));

    const undoChange = call(r => r.undo(project, noopApplyRenameCommand));
    expect(undoChange).toEqual({ targetKey: 'scenes', itemName: 'Scene2' });
    expect(project.getLayoutsCount()).toBe(2);
    expect(project.hasLayoutNamed('Scene2')).toBe(true);
    // The serialized snapshot restores the scene's own content, not just
    // its name.
    const restoredScene2 = project.getLayout('Scene2');
    expect(restoredScene2.getBackgroundColorRed()).toBe(10);
    expect(restoredScene2.getBackgroundColorGreen()).toBe(20);
    expect(restoredScene2.getBackgroundColorBlue()).toBe(30);

    const redoChange = call(r => r.redo(project, noopApplyRenameCommand));
    expect(redoChange).toEqual({ targetKey: 'scenes', itemName: 'Scene2' });
    expect(project.getLayoutsCount()).toBe(1);
    expect(project.hasLayoutNamed('Scene2')).toBe(false);

    project.delete();
  });

  it('reverses a rename through the given callback, revealing the name the item actually has after each direction', () => {
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
    call(r => r.recordRename(command));

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

    const undoChange = call(r => r.undo(project, applyRenameCommand));
    expect(applyRenameCommand).toHaveBeenCalledWith(command, 'undo');
    // The item is back to its old name after undo - that's what should be
    // revealed, not the (stale) post-rename name.
    expect(undoChange).toEqual({ targetKey: 'scenes', itemName: 'Scene1' });
    expect(project.hasLayoutNamed('Scene1')).toBe(true);
    expect(project.hasLayoutNamed('GameScene')).toBe(false);

    const redoChange = call(r => r.redo(project, applyRenameCommand));
    expect(applyRenameCommand).toHaveBeenCalledWith(command, 'redo');
    expect(redoChange).toEqual({ targetKey: 'scenes', itemName: 'GameScene' });
    expect(project.hasLayoutNamed('GameScene')).toBe(true);

    project.delete();
  });

  it('undoes and redoes the creation of an external layout and of external events', () => {
    const project = makeProject();
    const { call } = renderProjectManagerHistoryTester(project);

    project.insertNewExternalLayout('ExternalLayout1', 0);
    call(r => r.recordStep('externalLayouts', 'ADD', 'ExternalLayout1'));
    project.insertNewExternalEvents('ExternalEvents1', 0);
    call(r => r.recordStep('externalEvents', 'ADD', 'ExternalEvents1'));

    // Undo is a single stack shared across target kinds: the most recent
    // action (the external events) is undone first.
    const firstUndo = call(r => r.undo(project, noopApplyRenameCommand));
    expect(firstUndo).toEqual({
      targetKey: 'externalEvents',
      itemName: 'ExternalEvents1',
    });
    expect(project.getExternalEventsCount()).toBe(0);
    expect(project.getExternalLayoutsCount()).toBe(1);

    const secondUndo = call(r => r.undo(project, noopApplyRenameCommand));
    expect(secondUndo).toEqual({
      targetKey: 'externalLayouts',
      itemName: 'ExternalLayout1',
    });
    expect(project.getExternalLayoutsCount()).toBe(0);

    project.delete();
  });
});
