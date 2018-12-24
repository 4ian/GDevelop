// @flow
import Physics2Editor from '../BehaviorsEditor/Editors/Physics2Editor';

const components = {
  physics2: Physics2Editor,
};

export default {
  components,
  getDialogComponent: (type: string) => {
    if (components.hasOwnProperty(type)) return components[type];
    else return null;
  },
};
