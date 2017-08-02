import DefaultField from './ParameterFields/DefaultField';
import RelationalOperatorField from './ParameterFields/RelationalOperatorField';
import MouseField from './ParameterFields/MouseField';
import ObjectField from './ParameterFields/ObjectField';
import YesNoField from './ParameterFields/YesNoField';
import TrueFalseField from './ParameterFields/TrueFalseField';
const gd = global.gd;

export default {
  components: {
    default: DefaultField,
    mouse: MouseField,
    object: ObjectField,
    relationalOperator: RelationalOperatorField,
    yesorno: YesNoField,
    trueorfalse: TrueFalseField,
  },
  getParameterComponent: function(type) {
    const fieldType = gd.ParameterMetadata.isObject(type) ? 'object' : type;

    if (this.components.hasOwnProperty(fieldType))
      return this.components[fieldType];
    else
      return this.components.default;
  },
};
