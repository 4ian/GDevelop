// @flow
import BehaviorPropertiesEditor from './Editors/BehaviorPropertiesEditor';
import { type BehaviorEditorProps } from './Editors/BehaviorEditorProps.flow';
import Physics2Editor from './Editors/Physics2Editor';
import Physics3DEditor from './Editors/Physics3DEditor';
import AnchorBehaviorEditor from './Editors/AnchorBehaviorEditor';

/**
 * A service returning editor components for each behavior type.
 */
const BehaviorsEditorService = {
  getEditor(behaviorType: string): React.ComponentType<BehaviorEditorProps> {
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
    'AnchorBehavior::AnchorBehavior': {
      component: AnchorBehaviorEditor,
    },
  },
};

export default BehaviorsEditorService;
