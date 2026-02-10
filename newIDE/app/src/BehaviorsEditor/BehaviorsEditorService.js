// @flow
import BehaviorPropertiesEditor from './Editors/BehaviorPropertiesEditor';
import Physics2Editor from './Editors/Physics2Editor';
import Physics3DEditor from './Editors/Physics3DEditor';

/**
 * A service returning editor components for each behavior type.
 */
const BehaviorsEditorService = {
  // $FlowFixMe[signature-verification-failure]
  getEditor(behaviorType: string) {
    // $FlowFixMe[object-this-reference]
    if (!this.components[behaviorType]) {
      return BehaviorPropertiesEditor; // Default properties editor
    }
    // $FlowFixMe[object-this-reference]
    return this.components[behaviorType].component; // Custom  behavior editor
  },
  components: {
    'Physics2::Physics2Behavior': {
      component: Physics2Editor,
    },
    'Physics3D::Physics3DBehavior': {
      component: Physics3DEditor,
    },
  },
};

export default BehaviorsEditorService;
