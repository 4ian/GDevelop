// @flow
import Physics2Editor from '../BehaviorsEditor/Editors/Physics2Editor';

const components = {
  physics2: Physics2Editor,
};

export default {
  components,
  getDialogComponent: (property: Object) => {
    const extraInfoArray = property.getExtraInfo().toJSArray();
    if (!extraInfoArray) return null;

    if (components.hasOwnProperty(extraInfoArray[0]))
      return components[extraInfoArray[0]];

    return null;
  },
};
