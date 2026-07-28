// @flow
import { validateEventsJson } from './McpEventKnowledge';

const gd: libGDevelop = global.gd;

describe('McpEventKnowledge', () => {
  it('does not validate object-picking cardinality', () => {
    // $FlowFixMe[invalid-constructor]
    const project = new gd.ProjectHelper.createNewGDJSProject();
    const layout = project.insertNewLayout('Level1', 0);
    layout.getObjects().insertNewObject(project, 'Sprite', 'Mover', 0);
    layout.getObjects().insertNewObject(project, 'Sprite', 'Target', 1);
    const firstTargetInstance = layout
      .getInitialInstances()
      .insertNewInitialInstance();
    firstTargetInstance.setObjectName('Target');
    const secondTargetInstance = layout
      .getInitialInstances()
      .insertNewInitialInstance();
    secondTargetInstance.setObjectName('Target');

    try {
      const validation = validateEventsJson({
        project,
        sceneName: 'Level1',
        eventsJson: JSON.stringify([
          {
            type: 'BuiltinCommonInstructions::Standard',
            conditions: [
              {
                type: { value: 'SceneJustBegins' },
                parameters: [''],
              },
            ],
            actions: [
              {
                type: { value: 'AddForceTowardObject' },
                parameters: ['Mover', 'Target', '100', '0'],
              },
            ],
          },
        ]),
      });

      expect(validation.valid).toBe(true);
      expect(
        validation.issues.find(
          issue =>
            issue.instructionType === 'AddForceTowardObject' &&
            issue.parameterIndex === 1
        )
      ).toBeUndefined();
    } finally {
      project.delete();
    }
  });
});
