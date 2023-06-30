// @flow
import { Trans } from '@lingui/macro';
import { t } from '@lingui/macro';
import { I18n } from '@lingui/react';
import * as React from 'react';
import SelectField from '../../UI/SelectField';
import SelectOption from '../../UI/SelectOption';
import SemiControlledTextField from '../../UI/SemiControlledTextField';
import ObjectTypeSelector from '../../ObjectTypeSelector';
import BehaviorTypeSelector from '../../BehaviorTypeSelector';
import { ColumnStackLayout, ResponsiveLineStackLayout } from '../../UI/Layout';
import StringArrayEditor from '../../StringArrayEditor';
import useForceUpdate from '../../Utils/UseForceUpdate';
import CapabilitiesEditor from './CapabilitiesEditor';

type Props = {|
  project: gdProject,
  valueTypeMetadata: gdValueTypeMetadata,
  onTypeUpdated: () => void,
  disabled?: boolean,
  isTypeSelectorShown: boolean,
  isExpressionType?: boolean,
  getLastObjectParameterObjectType: () => ?gdObjectType,
|};

const getExtraInfoArray = (type: gdValueTypeMetadata) => {
  const extraInfoJson = type.getExtraInfo();
  let array = [];
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

export default function ValueTypeEditor({
  project,
  valueTypeMetadata,
  disabled,
  isTypeSelectorShown,
  onTypeUpdated,
  getLastObjectParameterObjectType,
  isExpressionType,
}: Props) {
  const forceUpdate = useForceUpdate();

  return (
    <I18n>
      {({ i18n }) => (
        <ColumnStackLayout noMargin expand>
          <ResponsiveLineStackLayout noMargin>
            {isTypeSelectorShown && (
              <SelectField
                floatingLabelText={<Trans>Type</Trans>}
                value={valueTypeMetadata.getName()}
                onChange={(e, i, value: string) => {
                  valueTypeMetadata.setName(value);
                  valueTypeMetadata.setOptional(false);
                  valueTypeMetadata.setDefaultValue('');
                  forceUpdate();
                  onTypeUpdated();
                }}
                disabled={disabled}
                fullWidth
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
                <SelectOption value="key" label={t`Keyboard Key (text)`} />
                <SelectOption value="mouse" label={t`Mouse button (text)`} />
                <SelectOption value="color" label={t`Color (text)`} />
                <SelectOption value="layer" label={t`Layer (text)`} />
                <SelectOption value="sceneName" label={t`Scene name (text)`} />
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
                <SelectOption value="identifier" label={t`Identifier (text)`} />
                <SelectOption value="scenevar" label={t`Scene variable`} />
                {!isExpressionType && (
                  <SelectOption
                    value="objectListOrEmptyIfJustDeclared"
                    label={t`Created objects`}
                  />
                )}
              </SelectField>
            )}
            {valueTypeMetadata.isObject() && (
              <ObjectTypeSelector
                project={project}
                value={valueTypeMetadata.getObjectType().getName()}
                onChange={(value: string) => {
                  valueTypeMetadata.getObjectType.setName(value);
                  forceUpdate();
                  onTypeUpdated();
                }}
                disabled={disabled}
              />
            )}
            {valueTypeMetadata.isBehavior() && (
              <BehaviorTypeSelector
                project={project}
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
              <SelectField
                floatingLabelText={<Trans>Default value</Trans>}
                value={
                  valueTypeMetadata.getDefaultValue() === 'yes' ? 'yes' : 'no'
                }
                onChange={(e, i, value) => {
                  valueTypeMetadata.setOptional(true);
                  valueTypeMetadata.setDefaultValue(value);
                  forceUpdate();
                  onTypeUpdated();
                }}
                fullWidth
              >
                <SelectOption value="yes" label={t`Yes`} />
                <SelectOption value="no" label={t`No`} />
              </SelectField>
            )}
            {valueTypeMetadata.getName() === 'trueorfalse' && (
              <SelectField
                floatingLabelText={<Trans>Default value</Trans>}
                value={
                  valueTypeMetadata.getDefaultValue() === 'True'
                    ? 'True'
                    : 'False'
                }
                onChange={(e, i, value) => {
                  valueTypeMetadata.setOptional(true);
                  valueTypeMetadata.setDefaultValue(value);
                  forceUpdate();
                  onTypeUpdated();
                }}
                fullWidth
              >
                <SelectOption value="True" label={t`True`} />
                <SelectOption value="False" label={t`False`} />
              </SelectField>
            )}
            {valueTypeMetadata.getName() === 'identifier' && (
              <SelectField
                floatingLabelText={<Trans>Scope</Trans>}
                value={getIdentifierScope(valueTypeMetadata.getExtraInfo())}
                onChange={(e, i, value) => {
                  const identifierName = getIdentifierName(
                    valueTypeMetadata.getExtraInfo()
                  );
                  valueTypeMetadata.setExtraInfo(value + identifierName);
                  forceUpdate();
                  onTypeUpdated();
                }}
                fullWidth
              >
                <SelectOption value="scene" label={t`Scene`} />
                <SelectOption value="object" label={t`Object`} />
              </SelectField>
            )}
            {valueTypeMetadata.getName() === 'identifier' && (
              <SemiControlledTextField
                commitOnBlur
                floatingLabelText={<Trans>Identifier name</Trans>}
                floatingLabelFixed
                value={getIdentifierName(valueTypeMetadata.getExtraInfo())}
                onChange={value => {
                  const scope = getIdentifierScope(
                    valueTypeMetadata.getExtraInfo()
                  );
                  valueTypeMetadata.setExtraInfo(scope + value);
                  forceUpdate();
                  onTypeUpdated();
                }}
                fullWidth
              />
            )}
          </ResponsiveLineStackLayout>
          {valueTypeMetadata.getName() === 'stringWithSelector' && (
            <StringArrayEditor
              disabled={disabled}
              extraInfo={getExtraInfoArray(valueTypeMetadata)}
              setExtraInfo={(newExtraInfo: Array<string>) => {
                valueTypeMetadata.setExtraInfo(JSON.stringify(newExtraInfo));
                forceUpdate();
                onTypeUpdated();
              }}
            />
          )}
          {valueTypeMetadata.isObject() &&
            valueTypeMetadata.getObjectType().getName().length === 0 && (
              <CapabilitiesEditor
                objectType={valueTypeMetadata.getObjectType()}
              />
            )}
        </ColumnStackLayout>
      )}
    </I18n>
  );
}
