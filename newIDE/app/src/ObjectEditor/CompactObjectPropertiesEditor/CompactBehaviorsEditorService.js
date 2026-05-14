// @flow
import { CompactBehaviorPropertiesEditor } from './CompactBehaviorPropertiesEditor';
import { type CompactBehaviorPropertiesEditorProps } from './CompactBehaviorPropertiesEditorProps.flow';
import CompactAnchorBehaviorEditor from './CompactAnchorBehaviorEditor';

/**
 * A service returning editor components for each behavior type.
 */
const CompactBehaviorsEditorService = {
  getEditor(
    behaviorType: string
  ): React.ComponentType<CompactBehaviorPropertiesEditorProps> {
    // $FlowFixMe[object-this-reference]
    if (!this.components[behaviorType]) {
      return CompactBehaviorPropertiesEditor; // Default properties editor
    }
    // $FlowFixMe[object-this-reference]
    return this.components[behaviorType].component; // Custom  behavior editor
  },
  components: {
    'AnchorBehavior::AnchorBehavior': {
      component: CompactAnchorBehaviorEditor,
    },
  },
};

export default CompactBehaviorsEditorService;
