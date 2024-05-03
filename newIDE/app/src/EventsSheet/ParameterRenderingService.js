// @flow
import { t } from '@lingui/macro';
import * as React from 'react';
import {
  type ParameterInlineRenderer,
  type ParameterInlineRendererProps,
} from './ParameterFields/ParameterInlineRenderer.flow';
import DefaultField, {
  renderInlineDefaultField,
} from './ParameterFields/DefaultField';
import RelationalOperatorField, {
  renderInlineRelationalOperator,
} from './ParameterFields/RelationalOperatorField';
import OperatorField, {
  renderInlineOperator,
} from './ParameterFields/OperatorField';
import MouseField, { renderInlineMouse } from './ParameterFields/MouseField';
import KeyField, { renderInlineKey } from './ParameterFields/KeyField';
import ObjectField, {
  renderInlineObjectWithThumbnail,
} from './ParameterFields/ObjectField';
import YesNoField, { renderInlineYesNo } from './ParameterFields/YesNoField';
import TrueFalseField, {
  renderInlineTrueFalse,
} from './ParameterFields/TrueFalseField';
import ExpressionField from './ParameterFields/ExpressionField';
import StringField from './ParameterFields/StringField';
import StringWithSelectorField from './ParameterFields/StringWithSelectorField';
import BehaviorField from './ParameterFields/BehaviorField';
import SceneVariableField, {
  renderInlineSceneVariable,
} from './ParameterFields/SceneVariableField';
import GlobalVariableField, {
  renderInlineGlobalVariable,
} from './ParameterFields/GlobalVariableField';
import ObjectVariableField, {
  renderInlineObjectVariable,
} from './ParameterFields/ObjectVariableField';
import LayerField from './ParameterFields/LayerField';
import ImageResourceField from './ParameterFields/ImageResourceField';
import AudioResourceField from './ParameterFields/AudioResourceField';
import VideoResourceField from './ParameterFields/VideoResourceField';
import JsonResourceField from './ParameterFields/JsonResourceField';
import SpineResourceField from './ParameterFields/SpineResourceField';
import BitmapFontResourceField from './ParameterFields/BitmapFontResourceField';
import FontResourceField from './ParameterFields/FontResourceField';
import ColorExpressionField from './ParameterFields/ColorExpressionField';
import ForceMultiplierField, {
  renderInlineForceMultiplier,
} from './ParameterFields/ForceMultiplierField';
import SceneNameField from './ParameterFields/SceneNameField';
import LayerEffectNameField from './ParameterFields/LayerEffectNameField';
import LayerEffectParameterNameField from './ParameterFields/LayerEffectParameterNameField';
import ObjectEffectNameField from './ParameterFields/ObjectEffectNameField';
import ObjectEffectParameterNameField from './ParameterFields/ObjectEffectParameterNameField';
import ObjectPointNameField from './ParameterFields/ObjectPointNameField';
import ObjectAnimationNameField from './ParameterFields/ObjectAnimationNameField';
import FunctionParameterNameField from './ParameterFields/FunctionParameterNameField';
import ExternalLayoutNameField from './ParameterFields/ExternalLayoutNameField';
import { type MessageDescriptor } from '../Utils/i18n/MessageDescriptor.flow';
import LeaderboardIdField, {
  renderInlineLeaderboardIdField,
} from './ParameterFields/LeaderboardIdField';
import IdentifierField from './ParameterFields/IdentifierField';
import TilemapResourceField from './ParameterFields/TilemapResourceField';
import TilesetResourceField from './ParameterFields/TilesetResourceField';
import Model3DResourceField from './ParameterFields/Model3DResourceField';
import AtlasResourceField from './ParameterFields/AtlasResourceField';

const gd: libGDevelop = global.gd;

const components = {
  default: DefaultField,
  mouse: MouseField,
  object: ObjectField,
  relationalOperator: RelationalOperatorField,
  operator: OperatorField,
  yesorno: YesNoField,
  trueorfalse: TrueFalseField,
  number: ExpressionField,
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
  imageResource: ImageResourceField,
  videoResource: VideoResourceField,
  jsonResource: JsonResourceField,
  bitmapFontResource: BitmapFontResourceField,
  fontResource: FontResourceField,
  model3DResource: Model3DResourceField,
  atlasResource: AtlasResourceField,
  spineResource: SpineResourceField,
  color: ColorExpressionField,
  police: DefaultField, //TODO
  forceMultiplier: ForceMultiplierField,
  sceneName: SceneNameField,
  layerEffectName: LayerEffectNameField,
  layerEffectParameterName: LayerEffectParameterNameField,
  objectEffectName: ObjectEffectNameField,
  objectEffectParameterName: ObjectEffectParameterNameField,
  objectPointName: ObjectPointNameField,
  objectAnimationName: ObjectAnimationNameField,
  functionParameterName: FunctionParameterNameField,
  externalLayoutName: ExternalLayoutNameField,
  leaderboardId: LeaderboardIdField,
  identifier: IdentifierField,
  tilemapResource: TilemapResourceField,
  tilesetResource: TilesetResourceField,
};
const inlineRenderers: { [string]: ParameterInlineRenderer } = {
  default: renderInlineDefaultField,
  forceMultiplier: renderInlineForceMultiplier,
  globalvar: renderInlineGlobalVariable,
  scenevar: renderInlineSceneVariable,
  objectvar: renderInlineObjectVariable,
  key: renderInlineKey,
  mouse: renderInlineMouse,
  object: renderInlineObjectWithThumbnail,
  yesorno: renderInlineYesNo,
  trueorfalse: renderInlineTrueFalse,
  operator: renderInlineOperator,
  relationalOperator: renderInlineRelationalOperator,
  leaderboardId: renderInlineLeaderboardIdField,
};
const userFriendlyTypeName: { [string]: MessageDescriptor } = {
  mouse: t`Mouse button`,
  object: t`Object`,
  relationalOperator: t`Relational operator`,
  operator: t`Operator`,
  yesorno: t`Yes or No`,
  trueorfalse: t`True or False`,
  expression: t`Number`,
  number: t`Number`,
  string: t`String`,
  stringWithSelector: t`String`,
  behavior: t`Behavior`,
  scenevar: t`Scene variable`,
  globalvar: t`Global variable`,
  objectvar: t`Object variable`,
  layer: t`Layer`,
  key: t`Keyboard key`,
  musicfile: t`Audio resource`,
  soundfile: t`Audio resource`,
  imageResource: t`Image resource`,
  videoResource: t`Video resource`,
  bitmapFontResource: t`Bitmap font resource`,
  fontResource: t`Font resource`,
  jsonResource: t`JSON resource`,
  tilemapResource: t`Tile map resource`,
  atlasResource: t`Atlas resource`,
  spineResource: t`Spine json resource`,
  color: t`Color`,
  forceMultiplier: t`Instant or permanent force`,
  sceneName: t`Scene name`,
  layerEffectName: t`Layer effect name`,
  layerEffectParameterName: t`Layer effect property name`,
  objectEffectName: t`Object effect name`,
  objectEffectParameterName: t`Object effect property name`,
  objectPointName: t`Object point name`,
  objectAnimationName: t`Object animation name`,
  functionParameterName: t`Parameter name`,
  externalLayoutName: t`Name of the external layout`,
  identifier: t`Identifier`,
};

const ParameterRenderingService = {
  components,
  getParameterComponent: (rawType: string) => {
    const fieldType = gd.ParameterMetadata.isObject(rawType)
      ? 'object'
      : rawType;

    if (components.hasOwnProperty(fieldType)) return components[fieldType];
    else return components.default;
  },
  renderInlineParameter: (props: ParameterInlineRendererProps): React.Node => {
    const rawType = props.parameterMetadata.getType();
    const fieldType = gd.ParameterMetadata.isObject(rawType)
      ? 'object'
      : rawType;

    const inlineRenderer =
      inlineRenderers[fieldType] || inlineRenderers.default;
    return inlineRenderer(props);
  },
  getUserFriendlyTypeName: (rawType: string): ?MessageDescriptor => {
    const fieldType = gd.ParameterMetadata.isObject(rawType)
      ? 'object'
      : rawType;

    return userFriendlyTypeName[fieldType] || null;
  },
};

export default ParameterRenderingService;
