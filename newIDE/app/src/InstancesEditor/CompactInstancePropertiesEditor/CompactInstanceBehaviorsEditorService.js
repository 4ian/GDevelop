// @flow
import { CompactInstanceBehaviorPropertiesEditor } from './CompactInstanceBehaviorPropertiesEditor';
import { type CompactInstanceBehaviorPropertiesEditorProps } from './CompactInstanceBehaviorPropertiesEditorProps.flow';
import CompactInstanceAnchorBehaviorEditor from './CompactAnchorInstanceBehaviorEditor';

/**
 * A service returning editor components for each behavior type.
 */
const CompactBehaviorsEditorService = {
  getEditor(
    behaviorType: string
  ): React.ComponentType<CompactInstanceBehaviorPropertiesEditorProps> {
    // $FlowFixMe[object-this-reference]
    if (!this.components[behaviorType]) {
      return CompactInstanceBehaviorPropertiesEditor; // Default properties editor
    }
    // $FlowFixMe[object-this-reference]
    return this.components[behaviorType].component; // Custom  behavior editor
  },
  components: {
    'AnchorBehavior::AnchorBehavior': {
      component: CompactInstanceAnchorBehaviorEditor,
    },
  },
};

export default CompactBehaviorsEditorService;
