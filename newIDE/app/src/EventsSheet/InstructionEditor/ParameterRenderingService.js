import DefaultField from './ParameterFields/DefaultField';
import RelationalOperatorField from './ParameterFields/RelationalOperatorField';
import OperatorField from './ParameterFields/OperatorField';
import MouseField from './ParameterFields/MouseField';
import KeyField from './ParameterFields/KeyField';
import ObjectField from './ParameterFields/ObjectField';
import YesNoField from './ParameterFields/YesNoField';
import TrueFalseField from './ParameterFields/TrueFalseField';
import ExpressionField from './ParameterFields/ExpressionField';
import StringField from './ParameterFields/StringField';
import BehaviorField from './ParameterFields/BehaviorField';
import SceneVariableField from './ParameterFields/SceneVariableField';
import GlobalVariableField from './ParameterFields/GlobalVariableField';
import ObjectVariableField from './ParameterFields/ObjectVariableField';
import LayerField from './ParameterFields/LayerField';
const gd = global.gd;

export default {
  components: {
    default: DefaultField,
    mouse: MouseField,
    object: ObjectField,
    relationalOperator: RelationalOperatorField,
    operator: OperatorField,
    yesorno: YesNoField,
    trueorfalse: TrueFalseField,
    expression: ExpressionField,
    string: StringField,
    behavior: BehaviorField,
    scenevar: SceneVariableField,
    globalvar: GlobalVariableField,
    objectvar: ObjectVariableField,
    layer: LayerField,
    key: KeyField,
    file: DefaultField, //TODO
    musicfile: DefaultField, //TODO
    soundfile: DefaultField, //TODO
    color: DefaultField, //TODO
    police: DefaultField, //TODO
    joyaxis: DefaultField, //TODO
  },
  getParameterComponent: function(type) {
    const fieldType = gd.ParameterMetadata.isObject(type) ? 'object' : type;

    if (this.components.hasOwnProperty(fieldType))
      return this.components[fieldType];
    else return this.components.default;
  },
};
