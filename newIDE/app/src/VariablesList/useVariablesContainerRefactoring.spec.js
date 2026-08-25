// @flow
import * as React from 'react';
import { act } from 'react-dom/test-utils';
import renderer from 'react-test-renderer';
import useVariablesContainerRefactoring from './useVariablesContainerRefactoring';
import { makeObjectGroupMergedVariablesContainer } from '../Utils/VariablesUtils';

const gd: libGDevelop = global.gd;

type HookResult = {|
  onVariablesUpdated: () => void,
  flushPendingRefactoring: () => void,
|};

const Tester = ({
  project,
  variablesContainer,
  initialInstances,
  objectGroup,
  objectsContainer,
  globalObjectsContainer,
  hookRef,
}: {|
  project: gdProject,
  variablesContainer: gdVariablesContainer,
  initialInstances: gdInitialInstancesContainer,
  objectGroup: gdObjectGroup,
  objectsContainer: gdObjectsContainer,
  globalObjectsContainer: gdObjectsContainer | null,
  hookRef: {| current: HookResult | null |},
|}) => {
  hookRef.current = useVariablesContainerRefactoring({
    project,
    variablesContainer,
    initialInstances,
    objectName: null,
    eventsBasedObject: null,
    enabled: true,
    objectGroup,
    objectsContainer,
    globalObjectsContainer,
  });
  return null;
};

const setUpProjectWithObjectGroup = () => {
  const project = gd.ProjectHelper.createNewGDJSProject();
  const layout = project.insertNewLayout('Scene', 0);
  const objectsContainer = layout.getObjects();
  const objectA = objectsContainer.insertNewObject(
    project,
    'Sprite',
    'ObjectA',
    0
  );
  const objectB = objectsContainer.insertNewObject(
    project,
    'Sprite',
    'ObjectB',
    1
  );
  objectA
    .getVariables()
    .insertNew('Health', 0)
    .setValue(100);
  objectB
    .getVariables()
    .insertNew('Health', 0)
    .setValue(100);
  const objectGroup = objectsContainer.getObjectGroups().insertNew('Group', 0);
  objectGroup.addObject('ObjectA');
  objectGroup.addObject('ObjectB');

  const mergeGroupVariableContainers = () =>
    makeObjectGroupMergedVariablesContainer(
      gd.ObjectsContainersList.makeNewObjectsContainersListForProjectAndLayout(
        project,
        layout
      ),
      objectGroup
    );

  return {
    project,
    layout,
    objectsContainer,
    objectA,
    objectB,
    objectGroup,
    mergeGroupVariableContainers,
  };
};

const renderTester = (
  {
    project,
    layout,
    objectsContainer,
    objectGroup,
  }: {
    project: gdProject,
    layout: gdLayout,
    objectsContainer: gdObjectsContainer,
    objectGroup: gdObjectGroup,
    ...
  },
  groupVariablesContainer: gdVariablesContainer
) => {
  const hookRef: {| current: HookResult | null |} = { current: null };
  const makeElement = (variablesContainer: gdVariablesContainer) => (
    <Tester
      project={project}
      variablesContainer={variablesContainer}
      initialInstances={layout.getInitialInstances()}
      objectGroup={objectGroup}
      objectsContainer={objectsContainer}
      globalObjectsContainer={project.getObjects()}
      hookRef={hookRef}
    />
  );
  let testRenderer;
  act(() => {
    testRenderer = renderer.create(makeElement(groupVariablesContainer));
  });
  return {
    hookRef,
    unmount: () => {
      act(() => {
        testRenderer.unmount();
      });
    },
    updateVariablesContainer: (variablesContainer: gdVariablesContainer) => {
      act(() => {
        testRenderer.update(makeElement(variablesContainer));
      });
    },
  };
};

describe('useVariablesContainerRefactoring (for an object group)', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });
  afterEach(() => {
    jest.useRealTimers();
  });

  it('applies a variable removal to the group objects after the debounce delay', () => {
    const setup = setUpProjectWithObjectGroup();
    const groupVariablesContainer = setup.mergeGroupVariableContainers();
    expect(groupVariablesContainer.has('Health')).toBe(true);

    const { hookRef, unmount } = renderTester(setup, groupVariablesContainer);

    groupVariablesContainer.remove('Health');
    act(() => {
      if (hookRef.current) hookRef.current.onVariablesUpdated();
    });
    act(() => {
      jest.advanceTimersByTime(250);
    });

    expect(setup.objectA.getVariables().has('Health')).toBe(false);
    expect(setup.objectB.getVariables().has('Health')).toBe(false);

    unmount();
    setup.project.delete();
  });

  it('applies (not drops) a pending variable removal when unmounted before the debounce delay', () => {
    const setup = setUpProjectWithObjectGroup();
    const groupVariablesContainer = setup.mergeGroupVariableContainers();

    const { hookRef, unmount } = renderTester(setup, groupVariablesContainer);

    groupVariablesContainer.remove('Health');
    act(() => {
      if (hookRef.current) hookRef.current.onVariablesUpdated();
    });
    // Unmount right away, without waiting for the debounce delay
    // (like when another object is selected just after an edit).
    unmount();

    expect(setup.objectA.getVariables().has('Health')).toBe(false);
    expect(setup.objectB.getVariables().has('Health')).toBe(false);

    setup.project.delete();
  });

  it('applies (not drops) a pending variable addition when the container is rebuilt before the debounce delay', () => {
    const setup = setUpProjectWithObjectGroup();
    const groupVariablesContainer = setup.mergeGroupVariableContainers();

    const { hookRef, unmount, updateVariablesContainer } = renderTester(
      setup,
      groupVariablesContainer
    );

    groupVariablesContainer.insertNew('Shield', 1).setValue(50);
    act(() => {
      if (hookRef.current) hookRef.current.onVariablesUpdated();
    });
    // Flush the pending refactoring (like done before rebuilding the
    // merged container) and swap to a rebuilt container.
    act(() => {
      if (hookRef.current) hookRef.current.flushPendingRefactoring();
    });

    expect(setup.objectA.getVariables().has('Shield')).toBe(true);
    expect(setup.objectB.getVariables().has('Shield')).toBe(true);

    const rebuiltGroupVariablesContainer = setup.mergeGroupVariableContainers();
    expect(rebuiltGroupVariablesContainer.has('Shield')).toBe(true);
    updateVariablesContainer(rebuiltGroupVariablesContainer);

    // Ensure an edit on the rebuilt container is applied against the new
    // snapshot (and does not re-apply or resurrect anything).
    rebuiltGroupVariablesContainer.remove('Health');
    act(() => {
      if (hookRef.current) hookRef.current.onVariablesUpdated();
    });
    act(() => {
      jest.advanceTimersByTime(250);
    });

    expect(setup.objectA.getVariables().has('Health')).toBe(false);
    expect(setup.objectB.getVariables().has('Health')).toBe(false);
    expect(setup.objectA.getVariables().has('Shield')).toBe(true);
    expect(setup.objectB.getVariables().has('Shield')).toBe(true);

    unmount();
    setup.project.delete();
  });

  it('applies a pending edit to the container it was made on, even if the container changed before the debounce delay', () => {
    const setup = setUpProjectWithObjectGroup();
    const groupVariablesContainer = setup.mergeGroupVariableContainers();

    const { hookRef, unmount, updateVariablesContainer } = renderTester(
      setup,
      groupVariablesContainer
    );

    groupVariablesContainer.get('Health').setValue(42);
    act(() => {
      if (hookRef.current) hookRef.current.onVariablesUpdated();
    });
    // Swap the container without flushing explicitly: the pending
    // refactoring must be applied (to the old container) at cleanup.
    const rebuiltGroupVariablesContainer = setup.mergeGroupVariableContainers();
    updateVariablesContainer(rebuiltGroupVariablesContainer);

    expect(
      setup.objectA
        .getVariables()
        .get('Health')
        .getValue()
    ).toBe(42);
    expect(
      setup.objectB
        .getVariables()
        .get('Health')
        .getValue()
    ).toBe(42);

    unmount();
    setup.project.delete();
  });
});
