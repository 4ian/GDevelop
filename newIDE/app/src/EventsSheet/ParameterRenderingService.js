// @flow
import * as React from 'react';
import DefaultField from './ParameterFields/DefaultField';
import RelationalOperatorField from './ParameterFields/RelationalOperatorField';
import OperatorField from './ParameterFields/OperatorField';
import MouseField from './ParameterFields/MouseField';
import KeyField from './ParameterFields/KeyField';
import ObjectField, {
  renderObjectWithThumbnail,
} from './ParameterFields/ObjectField';
import YesNoField from './ParameterFields/YesNoField';
import TrueFalseField from './ParameterFields/TrueFalseField';
import ExpressionField from './ParameterFields/ExpressionField';
import StringField from './ParameterFields/StringField';
import StringWithSelectorField from './ParameterFields/StringWithSelectorField';
import BehaviorField from './ParameterFields/BehaviorField';

import SceneVariableField, {
  renderSceneVariable,
} from './ParameterFields/SceneVariableField';
import GlobalVariableField, {
  renderGlobalVariable,
} from './ParameterFields/GlobalVariableField';
import ObjectVariableField, {
  renderObjectVariable,
} from './ParameterFields/ObjectVariableField';

import LayerField from './ParameterFields/LayerField';
import AudioResourceField from './ParameterFields/AudioResourceField';
import ColorExpressionField from './ParameterFields/ColorExpressionField';
import ForceMultiplierField, {
  renderForceMultiplierString,
} from './ParameterFields/ForceMultiplierField';
const gd = global.gd;

const components = {
  default: DefaultField,
  mouse: MouseField,
  object: ObjectField,
  relationalOperator: RelationalOperatorField,
  operator: OperatorField,
  yesorno: YesNoField,
  trueorfalse: TrueFalseField,
  expression: ExpressionField,
  string: StringField,
  stringWithSelector: StringWithSelectorField,
  behavior: BehaviorField,
  scenevar: SceneVariableField,
  globalvar: GlobalVariableField,
  objectvar: ObjectVariableField,
  layer: LayerField,
  key: KeyField,
  file: DefaultField, //TODO
  musicfile: AudioResourceField,
  soundfile: AudioResourceField,
  color: ColorExpressionField,
  police: DefaultField, //TODO
  joyaxis: DefaultField, //TODO
  forceMultiplier: ForceMultiplierField,
};

const stringRenderers = {
  forceMultiplier: renderForceMultiplierString,
  globalvar: renderGlobalVariable,
  scenevar: renderSceneVariable,
  objectvar: renderObjectVariable,
  object: renderObjectWithThumbnail,
};

export default {
  components,
  getParameterComponent: (type: string) => {
    const fieldType = gd.ParameterMetadata.isObject(type) ? 'object' : type;

    if (components.hasOwnProperty(fieldType)) return components[fieldType];
    else return components.default;
  },
  renderParameterString: (
    type: string,
    value: string,
    renderObjectThumnail: string => React.Node
  ) => {
    return stringRenderers[type]
      ? stringRenderers[type](value, renderObjectThumnail)
      : value;
  },
};
