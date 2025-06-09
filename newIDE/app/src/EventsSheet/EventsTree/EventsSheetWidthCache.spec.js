// @flow
import EventsSheetWidthCache from './EventsSheetWidthCache';
import { makeTestProject } from '../../fixtures/TestProject';

const gd: libGDevelop = global.gd;

describe('EventsSheetWidthCache', () => {
  beforeEach(() => {
    EventsSheetWidthCache.clearCache();
    EventsSheetWidthCache.setDefaultWidth(0); // Reset default width
  });

  test('should set and get width for a tab', () => {
    const tabId = 'test-tab';
    const width = 800;

    EventsSheetWidthCache.setWidth(tabId, width);
    expect(EventsSheetWidthCache.getWidth(tabId)).toBe(width);
  });

  test('should return default width when no width is set for a tab', () => {
    const defaultWidth = 1024;
    EventsSheetWidthCache.setDefaultWidth(defaultWidth);

    expect(EventsSheetWidthCache.getWidth('non-existent-tab')).toBe(
      defaultWidth
    );
  });

  test('should set and get conditions width for a tab', () => {
    const tabId = 'test-tab';
    const width = 400;

    EventsSheetWidthCache.setConditionsWidth(tabId, width);
    expect(EventsSheetWidthCache.getConditionsWidth(tabId)).toBe(width);
  });

  test('should set and get actions width for a tab', () => {
    const tabId = 'test-tab';
    const width = 600;

    EventsSheetWidthCache.setActionsWidth(tabId, width);
    expect(EventsSheetWidthCache.getActionsWidth(tabId)).toBe(width);
  });

  test('should clear all caches but keep default width', () => {
    const tabId = 'test-tab';
    const defaultWidth = 1024;

    EventsSheetWidthCache.setDefaultWidth(defaultWidth);
    EventsSheetWidthCache.setWidth(tabId, 800);
    EventsSheetWidthCache.setConditionsWidth(tabId, 400);
    EventsSheetWidthCache.setActionsWidth(tabId, 600);

    EventsSheetWidthCache.clearCache();

    // After clearing cache, getWidth should return defaultWidth for non-existent tabs
    expect(EventsSheetWidthCache.getWidth(tabId)).toBe(defaultWidth);
    expect(EventsSheetWidthCache.getConditionsWidth(tabId)).toBe(0);
    expect(EventsSheetWidthCache.getActionsWidth(tabId)).toBe(0);
  });

  test('should clear only specific tab cache', () => {
    const tabId1 = 'test-tab-1';
    const tabId2 = 'test-tab-2';
    const defaultWidth = 1024;

    EventsSheetWidthCache.setDefaultWidth(defaultWidth);

    // Set values for both tabs
    EventsSheetWidthCache.setWidth(tabId1, 800);
    EventsSheetWidthCache.setConditionsWidth(tabId1, 400);
    EventsSheetWidthCache.setActionsWidth(tabId1, 600);

    EventsSheetWidthCache.setWidth(tabId2, 900);
    EventsSheetWidthCache.setConditionsWidth(tabId2, 500);
    EventsSheetWidthCache.setActionsWidth(tabId2, 700);

    // Clear only tab1
    EventsSheetWidthCache.clearTabCache(tabId1);

    // Check tab1 returns default width and cleared conditions/actions
    expect(EventsSheetWidthCache.getWidth(tabId1)).toBe(defaultWidth);
    expect(EventsSheetWidthCache.getConditionsWidth(tabId1)).toBe(0);
    expect(EventsSheetWidthCache.getActionsWidth(tabId1)).toBe(0);

    // Check tab2 values are preserved
    expect(EventsSheetWidthCache.getWidth(tabId2)).toBe(900);
    expect(EventsSheetWidthCache.getConditionsWidth(tabId2)).toBe(500);
    expect(EventsSheetWidthCache.getActionsWidth(tabId2)).toBe(700);
  });

  test('should maintain width when switching between external events', () => {
    const { project } = makeTestProject(gd);

    // Create two external events
    const externalEvents1 = project.insertNewExternalEvents(
      'ExternalEvents1',
      0
    );
    const externalEvents2 = project.insertNewExternalEvents(
      'ExternalEvents2',
      1
    );

    const tabId1 = 'ExternalEvents1';
    const tabId2 = 'ExternalEvents2';
    const initialWidth = 800;
    const conditionsWidth = 400;

    // Set initial width for first external events
    EventsSheetWidthCache.setWidth(tabId1, initialWidth);
    EventsSheetWidthCache.setConditionsWidth(tabId1, conditionsWidth);

    // Add a condition to the first external events
    const condition = new gd.Instruction();
    condition.setType('BuiltinCommonInstructions::JsCode');
    condition.setParametersCount(1);
    condition.setParameter(0, 'return true;');
    const event = new gd.StandardEvent();
    externalEvents1.getEvents().insertEvent(event, 0);
    event.getConditions().insert(condition);

    // Switch to second external events and set its width
    EventsSheetWidthCache.setWidth(tabId2, initialWidth);
    EventsSheetWidthCache.setConditionsWidth(tabId2, conditionsWidth);

    // Switch back to first external events and verify width is maintained
    expect(EventsSheetWidthCache.getWidth(tabId1)).toBe(initialWidth);
    expect(EventsSheetWidthCache.getConditionsWidth(tabId1)).toBe(
      conditionsWidth
    );

    // Add another condition to the first external events
    const condition2 = new gd.Instruction();
    condition2.setType('BuiltinCommonInstructions::JsCode');
    condition2.setParametersCount(1);
    condition2.setParameter(0, 'return false;');
    event.getConditions().insert(condition2);

    // Update conditions width after adding new condition
    const newConditionsWidth = 600;
    EventsSheetWidthCache.setConditionsWidth(tabId1, newConditionsWidth);

    // Switch between external events multiple times to verify width is maintained
    expect(EventsSheetWidthCache.getWidth(tabId2)).toBe(initialWidth);
    expect(EventsSheetWidthCache.getConditionsWidth(tabId2)).toBe(
      conditionsWidth
    );

    expect(EventsSheetWidthCache.getWidth(tabId1)).toBe(initialWidth);
    expect(EventsSheetWidthCache.getConditionsWidth(tabId1)).toBe(
      newConditionsWidth
    );

    expect(EventsSheetWidthCache.getWidth(tabId2)).toBe(initialWidth);
    expect(EventsSheetWidthCache.getConditionsWidth(tabId2)).toBe(
      conditionsWidth
    );

    // Clean up
    project.removeExternalEvents('ExternalEvents1');
    project.removeExternalEvents('ExternalEvents2');
  });

  test('should maintain width when switching between external events with conditions and actions', () => {
    const { project } = makeTestProject(gd);

    // Create two external events
    const externalEvents1 = project.insertNewExternalEvents(
      'ExternalEvents1',
      0
    );
    const externalEvents2 = project.insertNewExternalEvents(
      'ExternalEvents2',
      1
    );

    const tabId1 = 'ExternalEvents1';
    const tabId2 = 'ExternalEvents2';
    const initialWidth = 800;
    const conditionsWidth = 400;
    const actionsWidth = 600;

    // Set initial width for first external events
    EventsSheetWidthCache.setWidth(tabId1, initialWidth);
    EventsSheetWidthCache.setConditionsWidth(tabId1, conditionsWidth);
    EventsSheetWidthCache.setActionsWidth(tabId1, actionsWidth);

    // Add a condition and action to the first external events
    const condition = new gd.Instruction();
    condition.setType('BuiltinCommonInstructions::JsCode');
    condition.setParametersCount(1);
    condition.setParameter(0, 'return true;');

    const action = new gd.Instruction();
    action.setType('BuiltinCommonInstructions::JsCode');
    action.setParametersCount(1);
    action.setParameter(0, 'console.log("test");');

    const event = new gd.StandardEvent();
    externalEvents1.getEvents().insertEvent(event, 0);
    event.getConditions().insert(condition);
    event.getActions().insert(action);

    // Switch to second external events and set its width
    EventsSheetWidthCache.setWidth(tabId2, initialWidth);
    EventsSheetWidthCache.setConditionsWidth(tabId2, conditionsWidth);
    EventsSheetWidthCache.setActionsWidth(tabId2, actionsWidth);

    // Switch back to first external events and verify width is maintained
    expect(EventsSheetWidthCache.getWidth(tabId1)).toBe(initialWidth);
    expect(EventsSheetWidthCache.getConditionsWidth(tabId1)).toBe(
      conditionsWidth
    );
    expect(EventsSheetWidthCache.getActionsWidth(tabId1)).toBe(actionsWidth);

    // Add another condition and action to the first external events
    const condition2 = new gd.Instruction();
    condition2.setType('BuiltinCommonInstructions::JsCode');
    condition2.setParametersCount(1);
    condition2.setParameter(0, 'return false;');

    const action2 = new gd.Instruction();
    action2.setType('BuiltinCommonInstructions::JsCode');
    action2.setParametersCount(1);
    action2.setParameter(0, 'console.log("test2");');

    event.getConditions().insert(condition2);
    event.getActions().insert(action2);

    // Update widths after adding new condition and action
    const newConditionsWidth = 600;
    const newActionsWidth = 800;
    EventsSheetWidthCache.setConditionsWidth(tabId1, newConditionsWidth);
    EventsSheetWidthCache.setActionsWidth(tabId1, newActionsWidth);

    // Switch between external events multiple times to verify width is maintained
    expect(EventsSheetWidthCache.getWidth(tabId2)).toBe(initialWidth);
    expect(EventsSheetWidthCache.getConditionsWidth(tabId2)).toBe(
      conditionsWidth
    );
    expect(EventsSheetWidthCache.getActionsWidth(tabId2)).toBe(actionsWidth);

    expect(EventsSheetWidthCache.getWidth(tabId1)).toBe(initialWidth);
    expect(EventsSheetWidthCache.getConditionsWidth(tabId1)).toBe(
      newConditionsWidth
    );
    expect(EventsSheetWidthCache.getActionsWidth(tabId1)).toBe(newActionsWidth);

    expect(EventsSheetWidthCache.getWidth(tabId2)).toBe(initialWidth);
    expect(EventsSheetWidthCache.getConditionsWidth(tabId2)).toBe(
      conditionsWidth
    );
    expect(EventsSheetWidthCache.getActionsWidth(tabId2)).toBe(actionsWidth);

    // Clean up
    project.removeExternalEvents('ExternalEvents1');
    project.removeExternalEvents('ExternalEvents2');
  });

  test('should maintain width when switching between external events without conditions or actions', () => {
    const { project } = makeTestProject(gd);

    // Create two external events
    const externalEvents1 = project.insertNewExternalEvents(
      'ExternalEvents1',
      0
    );
    const externalEvents2 = project.insertNewExternalEvents(
      'ExternalEvents2',
      1
    );

    const tabId1 = 'ExternalEvents1';
    const tabId2 = 'ExternalEvents2';
    const initialWidth = 800;

    // Set initial width for first external events
    EventsSheetWidthCache.setWidth(tabId1, initialWidth);

    // Switch to second external events and set its width
    EventsSheetWidthCache.setWidth(tabId2, initialWidth);

    // Switch back to first external events and verify width is maintained
    expect(EventsSheetWidthCache.getWidth(tabId1)).toBe(initialWidth);
    expect(EventsSheetWidthCache.getConditionsWidth(tabId1)).toBe(0);
    expect(EventsSheetWidthCache.getActionsWidth(tabId1)).toBe(0);

    // Update width
    const newWidth = 1000;
    EventsSheetWidthCache.setWidth(tabId1, newWidth);

    // Switch between external events multiple times to verify width is maintained
    expect(EventsSheetWidthCache.getWidth(tabId2)).toBe(initialWidth);
    expect(EventsSheetWidthCache.getConditionsWidth(tabId2)).toBe(0);
    expect(EventsSheetWidthCache.getActionsWidth(tabId2)).toBe(0);

    expect(EventsSheetWidthCache.getWidth(tabId1)).toBe(newWidth);
    expect(EventsSheetWidthCache.getConditionsWidth(tabId1)).toBe(0);
    expect(EventsSheetWidthCache.getActionsWidth(tabId1)).toBe(0);

    expect(EventsSheetWidthCache.getWidth(tabId2)).toBe(initialWidth);
    expect(EventsSheetWidthCache.getConditionsWidth(tabId2)).toBe(0);
    expect(EventsSheetWidthCache.getActionsWidth(tabId2)).toBe(0);

    // Clean up
    project.removeExternalEvents('ExternalEvents1');
    project.removeExternalEvents('ExternalEvents2');
  });
});
