// @flow

const editorIdentifiers = [
  'Scene',
  'EventsSheet',
  'Home',
  'ExternalEvents',
  'ExternalLayout',
  'Extension',
  'Resources',
];

const topLevelKeys = [
  'id',
  'flow',
  'editorSwitches',
  'endDialog',
  'availableLocales',
];
const flowStepKeys = [
  'elementToHighlightId',
  'id',
  'isTriggerFlickering',
  'isCheckpoint',
  'deprecated',
  'nextStepTrigger',
  'shortcuts',
  'dialog',
  'mapProjectData',
  'tooltip',
  'skippable',
  'isOnClosableDialog',
];
export const checkInAppTutorialFileJsonSchema = (object: Object) => {
  const errors = [];
  topLevelKeys.forEach(topLevelKey => {
    if (!object[topLevelKey]) {
      errors.push(`Top level key ${topLevelKey} missing in file.`);
    }
  });
  if (object.editorSwitches) {
    Object.keys(object.editorSwitches).forEach(editorSwitchKey => {
      const editorSwitch = object.editorSwitches[editorSwitchKey];
      if (!editorSwitch.editor) {
        errors.push(
          `Editor switch ${editorSwitchKey} doesn't have editor key.`
        );
      }
      if (!editorIdentifiers.includes(editorSwitch.editor)) {
        errors.push(
          `Editor switch ${editorSwitchKey} with identifier ${
            editorSwitch.editor
          } unknown.`
        );
      }
    });
  }
  if (object.flow) {
    object.flow.forEach((step, index) => {
      const stepKeys = Object.keys(step);
      const unknownStepKeys = stepKeys.filter(
        stepKey => !flowStepKeys.includes(stepKey)
      );
      if (unknownStepKeys.length) {
        errors.push(
          `Flow step with id ${step.id ||
            'unknown'} at index ${index} has unknown key(s) ${unknownStepKeys.join(
            ','
          )})`
        );
      }
    });
  }
  return errors;
};
