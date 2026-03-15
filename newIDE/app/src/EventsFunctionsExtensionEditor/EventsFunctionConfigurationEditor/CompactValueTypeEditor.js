// @flow
import { t } from '@lingui/macro';
import { I18n } from '@lingui/react';
import * as React from 'react';
import SelectOption from '../../UI/SelectOption';
import CompactObjectTypeSelector from '../../ObjectTypeSelector/CompactObjectTypeSelector';
import CompactBehaviorTypeSelector from '../../BehaviorTypeSelector/CompactBehaviorTypeSelector';
import { ColumnStackLayout } from '../../UI/Layout';
import ChoicesEditor, { type Choice } from '../../ChoicesEditor';
import useForceUpdate from '../../Utils/UseForceUpdate';
import CompactResourceTypeSelectField from './CompactResourceTypeSelectField';
import CompactSelectField from '../../UI/CompactSelectField';
import CompactSemiControlledTextField from '../../UI/CompactSemiControlledTextField';
import CompactPropertiesEditorRowField from '../../CompactPropertiesEditor/CompactPropertiesEditorRowField';

type Props = {|
  project: gdProject,
  eventsFunctionsExtension: gdEventsFunctionsExtension | null,
  valueTypeMetadata: gdValueTypeMetadata,
  onTypeUpdated: () => void,
  disabled?: boolean,
  isTypeSelectorShown: boolean,
  isExpressionType?: boolean,
  getLastObjectParameterObjectType: () => string,
|};

const getExtraInfoArray = (type: gdValueTypeMetadata): Array<string> => {
  const extraInfoJson = type.getExtraInfo();
  let array: Array<string> = [];
  try {
    if (extraInfoJson !== '') array = JSON.parse(extraInfoJson);
    if (!Array.isArray(array)) array = [];
  } catch (e) {
    console.error('Cannot parse parameter extraInfo: ', e);
  }
  return array;
};

const getIdentifierScope = (scopedIdentifier: string) =>
  scopedIdentifier.startsWith('object') ? 'object' : 'scene';

const getIdentifierName = (scopedIdentifier: string) =>
  scopedIdentifier.startsWith('object')
    ? scopedIdentifier.substring('object'.length)
    : scopedIdentifier.substring('scene'.length);

const convertTypeToSelectorValue = (value: string) =>
  value.endsWith('Resource') ? 'jsonResource' : value;

const convertParameterTypeToPropertyType = (value: string) =>
  value.substring(0, value.length - 'Resource'.length);

export default function CompactValueTypeEditor({
  project,
  eventsFunctionsExtension,
  valueTypeMetadata,
  disabled,
  isTypeSelectorShown,
  onTypeUpdated,
  getLastObjectParameterObjectType,
  isExpressionType,
}: Props): React.Node {
  const forceUpdate = useForceUpdate();

  const type = convertTypeToSelectorValue(valueTypeMetadata.getName());

  return (
    <I18n>
      {({ i18n }) => (
        <ColumnStackLayout noMargin expand>
          {isTypeSelectorShown && (
            <CompactPropertiesEditorRowField
              label={i18n._(t`Type`)}
              field={
                <CompactSelectField
                  value={type}
                  onChange={value => {
                    valueTypeMetadata.setName(value);
                    valueTypeMetadata.setOptional(false);
                    valueTypeMetadata.setDefaultValue('');
                    forceUpdate();
                    onTypeUpdated();
                  }}
                  disabled={disabled}
                >
                  {!isExpressionType && (
                    <SelectOption value="objectList" label={t`Objects`} />
                  )}
                  {!isExpressionType && (
                    <SelectOption
                      value="behavior"
                      label={t`Behavior (for the previous object)`}
                    />
                  )}
                  <SelectOption value="expression" label={t`Number`} />
                  <SelectOption value="string" label={t`String (text)`} />
                  <SelectOption
                    value="stringWithSelector"
                    label={t`String from a list of options (text)`}
                  />
                  <SelectOption
                    value="numberWithChoices"
                    label={t`Number from a list of options (number)`}
                  />
                  <SelectOption
                    value="keyboardKey"
                    label={t`Keyboard Key (text)`}
                  />
                  <SelectOption
                    value="mouseButton"
                    label={t`Mouse button (text)`}
                  />
                  {type === 'key' && (
                    <SelectOption
                      value="key"
                      label={t`Keyboard Key (deprecated)`}
                    />
                  )}
                  {type === 'mouse' && (
                    <SelectOption
                      value="mouse"
                      label={t`Mouse button (deprecated)`}
                    />
                  )}
                  <SelectOption value="color" label={t`Color (text)`} />
                  <SelectOption value="layer" label={t`Layer (text)`} />
                  <SelectOption
                    value="sceneName"
                    label={t`Scene name (text)`}
                  />
                  {!isExpressionType && (
                    <SelectOption
                      value="yesorno"
                      label={t`Yes or No (boolean)`}
                    />
                  )}
                  {!isExpressionType && (
                    <SelectOption
                      value="trueorfalse"
                      label={t`True or False (boolean)`}
                    />
                  )}
                  <SelectOption
                    value="objectPointName"
                    label={t`Object point (text)`}
                  />
                  <SelectOption
                    value="objectAnimationName"
                    label={t`Object animation (text)`}
                  />
                  <SelectOption
                    value="layerEffectName"
                    label={t`Layer effect (text)`}
                  />
                  <SelectOption
                    value="layerEffectParameterName"
                    label={t`Layer effect property (text)`}
                  />
                  <SelectOption
                    value="objectEffectName"
                    label={t`Object effect (text)`}
                  />
                  <SelectOption
                    value="objectEffectParameterName"
                    label={t`Object effect property (text)`}
                  />
                  <SelectOption
                    value="leaderboardId"
                    label={t`Leaderboard (text)`}
                  />
                  <SelectOption
                    value="identifier"
                    label={t`Identifier (text)`}
                  />
                  <SelectOption value="variable" label={t`Variable`} />
                  <SelectOption
                    value="scenevar"
                    label={t`Scene variable (deprecated)`}
                  />
                  {!isExpressionType && (
                    <SelectOption
                      value="objectListOrEmptyIfJustDeclared"
                      label={t`Created objects`}
                    />
                  )}
                  {!isExpressionType && (
                    <SelectOption value="jsonResource" label={t`Resource`} />
                  )}
                </CompactSelectField>
              }
            />
          )}
          {valueTypeMetadata.isObject() && (
            <CompactObjectTypeSelector
              project={project}
              eventsFunctionsExtension={eventsFunctionsExtension}
              value={valueTypeMetadata.getExtraInfo()}
              onChange={(value: string) => {
                valueTypeMetadata.setExtraInfo(value);
                forceUpdate();
                onTypeUpdated();
              }}
              disabled={disabled}
            />
          )}
          {valueTypeMetadata.isBehavior() && (
            <CompactBehaviorTypeSelector
              project={project}
              eventsFunctionsExtension={eventsFunctionsExtension}
              objectType={getLastObjectParameterObjectType()}
              value={valueTypeMetadata.getExtraInfo()}
              onChange={(value: string) => {
                valueTypeMetadata.setExtraInfo(value);
                forceUpdate();
                onTypeUpdated();
              }}
              disabled={disabled}
            />
          )}
          {valueTypeMetadata.getName() === 'yesorno' && (
            <CompactPropertiesEditorRowField
              label={i18n._(t`Default value`)}
              field={
                <CompactSelectField
                  value={
                    valueTypeMetadata.getDefaultValue() === 'yes' ? 'yes' : 'no'
                  }
                  onChange={value => {
                    valueTypeMetadata.setOptional(true);
                    valueTypeMetadata.setDefaultValue(value);
                    forceUpdate();
                    onTypeUpdated();
                  }}
                >
                  <SelectOption value="yes" label={t`Yes`} />
                  <SelectOption value="no" label={t`No`} />
                </CompactSelectField>
              }
            />
          )}
          {valueTypeMetadata.getName() === 'trueorfalse' && (
            <CompactPropertiesEditorRowField
              label={i18n._(t`Default value`)}
              field={
                <CompactSelectField
                  value={
                    valueTypeMetadata.getDefaultValue() === 'True'
                      ? 'True'
                      : 'False'
                  }
                  onChange={value => {
                    valueTypeMetadata.setOptional(true);
                    valueTypeMetadata.setDefaultValue(value);
                    forceUpdate();
                    onTypeUpdated();
                  }}
                >
                  <SelectOption value="True" label={t`True`} />
                  <SelectOption value="False" label={t`False`} />
                </CompactSelectField>
              }
            />
          )}
          {valueTypeMetadata.getName() === 'identifier' && (
            <CompactPropertiesEditorRowField
              label={i18n._(t`Scope`)}
              field={
                <CompactSelectField
                  value={getIdentifierScope(valueTypeMetadata.getExtraInfo())}
                  onChange={value => {
                    const identifierName = getIdentifierName(
                      valueTypeMetadata.getExtraInfo()
                    );
                    valueTypeMetadata.setExtraInfo(value + identifierName);
                    forceUpdate();
                    onTypeUpdated();
                  }}
                >
                  <SelectOption value="scene" label={t`Scene`} />
                  <SelectOption value="object" label={t`Object`} />
                </CompactSelectField>
              }
            />
          )}
          {valueTypeMetadata.getName() === 'identifier' && (
            <CompactPropertiesEditorRowField
              label={i18n._(t`Identifier name`)}
              field={
                <CompactSemiControlledTextField
                  commitOnBlur
                  value={getIdentifierName(valueTypeMetadata.getExtraInfo())}
                  onChange={value => {
                    const scope = getIdentifierScope(
                      valueTypeMetadata.getExtraInfo()
                    );
                    valueTypeMetadata.setExtraInfo(scope + value);
                    forceUpdate();
                    onTypeUpdated();
                  }}
                />
              }
            />
          )}
          {valueTypeMetadata.getName().endsWith('Resource') && (
            <CompactResourceTypeSelectField
              value={convertParameterTypeToPropertyType(
                valueTypeMetadata.getName()
              )}
              onChange={value => {
                valueTypeMetadata.setName(value + 'Resource');
                forceUpdate();
                onTypeUpdated();
              }}
              fullWidth
            />
          )}
          {(valueTypeMetadata.getName() === 'stringWithSelector' ||
            valueTypeMetadata.getName() === 'numberWithChoices') && (
            <ChoicesEditor
              disabled={disabled}
              choices={getExtraInfoArray(valueTypeMetadata).map(value => ({
                value,
                label: '',
              }))}
              hideLabels
              setChoices={(choices: Array<Choice>) => {
                // TODO Handle labels (and search "choice label")
                valueTypeMetadata.setExtraInfo(
                  JSON.stringify(choices.map(choice => choice.value))
                );
                forceUpdate();
                onTypeUpdated();
              }}
              isNumber={valueTypeMetadata.getName() === 'numberWithChoices'}
            />
          )}
        </ColumnStackLayout>
      )}
    </I18n>
  );
}
