// @flow
import { getDependencyCycleCreatedByObject } from './ExtensionDependencyCycle';

const gd: libGDevelop = global.gd;

// The detection logic is exhaustively tested in
// Core/tests/EventsBasedObjectDependencyFinder.cpp. These tests only cover
// the wrapping done by `getDependencyCycleCreatedByObject`.
describe('getDependencyCycleCreatedByObject', () => {
  let project: gdProject;
  let extensionA: gdEventsFunctionsExtension;
  let extensionB: gdEventsFunctionsExtension;
  let objectA: gdEventsBasedObject;
  let objectB: gdEventsBasedObject;

  beforeEach(() => {
    project = gd.ProjectHelper.createNewGDJSProject();
    extensionA = project.insertNewEventsFunctionsExtension('A', 0);
    extensionB = project.insertNewEventsFunctionsExtension('B', 1);
    objectA = extensionA.getEventsBasedObjects().insertNew('ObjectA', 0);
    objectB = extensionB.getEventsBasedObjects().insertNew('ObjectB', 0);

    // B depends on A.
    objectB.getObjects().insertNewObject(project, 'A::ObjectA', 'Child', 0);
  });

  afterEach(() => {
    project.delete();
  });

  it('returns null when not editing an events-based object', () => {
    expect(
      getDependencyCycleCreatedByObject(project, null, null, 'B::ObjectB')
    ).toBe(null);
  });

  it('returns null for an object not creating a cycle', () => {
    expect(
      getDependencyCycleCreatedByObject(
        project,
        extensionB,
        objectB,
        'A::ObjectA'
      )
    ).toBe(null);
  });

  it('returns the cycle for an object creating a cycle between extensions', () => {
    expect(
      getDependencyCycleCreatedByObject(
        project,
        extensionA,
        objectA,
        'B::ObjectB'
      )
    ).toEqual({
      kind: 'extension-dependency',
      extensionNames: ['A', 'B', 'A'],
    });
  });

  it('returns a containment cycle for an object containing itself', () => {
    expect(
      getDependencyCycleCreatedByObject(
        project,
        extensionA,
        objectA,
        'A::ObjectA'
      )
    ).toEqual({ kind: 'object-containment' });
  });
});
