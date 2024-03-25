// @flow

import * as React from 'react';
import { Trans } from '@lingui/macro';
import { t } from '@lingui/macro';
import { type EditorProps } from './EditorProps.flow';
import { ColumnStackLayout, ResponsiveLineStackLayout } from '../../UI/Layout';
import Text from '../../UI/Text';
import SemiControlledTextField from '../../UI/SemiControlledTextField';
import useForceUpdate from '../../Utils/UseForceUpdate';
import ResourceSelectorWithThumbnail from '../../ResourcesList/ResourceSelectorWithThumbnail';
import Checkbox from '../../UI/Checkbox';
import { Column, Line } from '../../UI/Grid';
import FormHelperText from '@material-ui/core/FormHelperText';
import InputAdornment from '@material-ui/core/InputAdornment';
import Tooltip from '@material-ui/core/Tooltip';
import { MarkdownText } from '../../UI/MarkdownText';
import SelectField from '../../UI/SelectField';
import SelectOption from '../../UI/SelectOption';
import MeasurementUnitDocumentation from '../../PropertiesEditor/MeasurementUnitDocumentation';
import { getMeasurementUnitShortLabel } from '../../PropertiesEditor/PropertiesMapToSchema';
import AlertMessage from '../../UI/AlertMessage';
import { hasLight } from './Model3DEditor';

const facesProperties = [
  {
    id: 'frontFace',
    blockName: <Trans>Front face</Trans>,
    visibilityProperty: 'frontFaceVisible',
    resourceRepeatProperty: 'frontFaceResourceRepeat',
    resourceNameProperty: 'frontFaceResourceName',
    newResourceNameSuffix: 'Front',
  },
  {
    id: 'backFace',
    blockName: <Trans>Back face</Trans>,
    visibilityProperty: 'backFaceVisible',
    resourceRepeatProperty: 'backFaceResourceRepeat',
    resourceNameProperty: 'backFaceResourceName',
    newResourceNameSuffix: 'Back',
  },
  {
    id: 'leftFace',
    blockName: <Trans>Left face</Trans>,
    visibilityProperty: 'leftFaceVisible',
    resourceRepeatProperty: 'leftFaceResourceRepeat',
    resourceNameProperty: 'leftFaceResourceName',
    newResourceNameSuffix: 'Left',
  },
  {
    id: 'rightFace',
    blockName: <Trans>Right face</Trans>,
    visibilityProperty: 'rightFaceVisible',
    resourceRepeatProperty: 'rightFaceResourceRepeat',
    resourceNameProperty: 'rightFaceResourceName',
    newResourceNameSuffix: 'Right',
  },
  {
    id: 'topFace',
    blockName: <Trans>Top face</Trans>,
    visibilityProperty: 'topFaceVisible',
    resourceRepeatProperty: 'topFaceResourceRepeat',
    resourceNameProperty: 'topFaceResourceName',
    newResourceNameSuffix: 'Top',
  },
  {
    id: 'bottomFace',
    blockName: <Trans>Bottom face</Trans>,
    visibilityProperty: 'bottomFaceVisible',
    resourceRepeatProperty: 'bottomFaceResourceRepeat',
    resourceNameProperty: 'bottomFaceResourceName',
    newResourceNameSuffix: 'Bottom',
  },
];

const Cube3DEditor = ({
  objectConfiguration,
  project,
  layout,
  resourceManagementProps,
  objectName,
  renderObjectNameField,
}: EditorProps) => {
  const forceUpdate = useForceUpdate();
  const properties = objectConfiguration.getProperties();

  const onChangeProperty = React.useCallback(
    (property: string, value: string) => {
      objectConfiguration.updateProperty(property, value);
      forceUpdate();
    },
    [objectConfiguration, forceUpdate]
  );

  const facesOrientationChoices = properties
    .get('facesOrientation')
    .getExtraInfo()
    .toJSArray()
    .map(value => ({ value, label: value }));
  const backFaceUpThroughWhichAxisRotationChoices = properties
    .get('backFaceUpThroughWhichAxisRotation')
    .getExtraInfo()
    .toJSArray()
    .map(value => ({ value, label: value }));

  return (
    <ColumnStackLayout noMargin>
      {renderObjectNameField && renderObjectNameField()}
      <Text size="block-title" noMargin>
        <Trans>Default size</Trans>
      </Text>
      <ResponsiveLineStackLayout expand noColumnMargin>
        {['width', 'height', 'depth'].map(propertyName => {
          const property = properties.get(propertyName);
          const measurementUnit = property.getMeasurementUnit();
          const endAdornment = {
            label: getMeasurementUnitShortLabel(measurementUnit),
            tooltipContent: (
              <MeasurementUnitDocumentation
                label={measurementUnit.getLabel()}
                description={measurementUnit.getDescription()}
                elementsWithWords={measurementUnit.getElementsWithWords()}
              />
            ),
          };
          return (
            <Column noMargin expand key={propertyName}>
              <SemiControlledTextField
                commitOnBlur
                floatingLabelFixed
                floatingLabelText={property.getLabel()}
                onChange={value => onChangeProperty(propertyName, value)}
                value={property.getValue()}
                endAdornment={
                  <Tooltip title={endAdornment.tooltipContent}>
                    <InputAdornment position="end">
                      {endAdornment.label}
                    </InputAdornment>
                  </Tooltip>
                }
                id={`cube3d-object-${propertyName}`}
              />
            </Column>
          );
        })}
      </ResponsiveLineStackLayout>
      <Text size="block-title" noMargin>
        <Trans>Settings</Trans>
      </Text>
      <ColumnStackLayout noMargin expand>
        <Checkbox
          checked={
            properties.get('enableTextureTransparency').getValue() === 'true'
          }
          label={
            <React.Fragment>
              <Line noMargin>
                {properties.get('enableTextureTransparency').getLabel()}
              </Line>
              <FormHelperText style={{ display: 'inline' }}>
                <MarkdownText
                  source={properties
                    .get('enableTextureTransparency')
                    .getDescription()}
                />
              </FormHelperText>
            </React.Fragment>
          }
          onCheck={(_, value) => {
            onChangeProperty('enableTextureTransparency', value ? '1' : '0');
          }}
        />
        <SelectField
          value={properties.get('facesOrientation').getValue()}
          floatingLabelText={properties.get('facesOrientation').getLabel()}
          helperMarkdownText={properties
            .get('facesOrientation')
            .getDescription()}
          onChange={(event, index, newValue) => {
            onChangeProperty('facesOrientation', newValue);
          }}
        >
          {facesOrientationChoices.map(choice => (
            <SelectOption
              label={choice.label}
              value={choice.value}
              key={choice.value}
            />
          ))}
        </SelectField>
        <SelectField
          value={properties
            .get('backFaceUpThroughWhichAxisRotation')
            .getValue()}
          floatingLabelText={properties
            .get('backFaceUpThroughWhichAxisRotation')
            .getLabel()}
          helperMarkdownText={properties
            .get('backFaceUpThroughWhichAxisRotation')
            .getDescription()}
          onChange={(event, index, newValue) => {
            onChangeProperty('backFaceUpThroughWhichAxisRotation', newValue);
          }}
        >
          {backFaceUpThroughWhichAxisRotationChoices.map(choice => (
            <SelectOption
              label={choice.label}
              value={choice.value}
              key={choice.value}
            />
          ))}
        </SelectField>
        <SelectField
          value={properties.get('materialType').getValue()}
          floatingLabelText={properties.get('materialType').getLabel()}
          helperMarkdownText={properties.get('materialType').getDescription()}
          onChange={(event, index, newValue) => {
            onChangeProperty('materialType', newValue);
          }}
        >
          <SelectOption
            label={t`No lighting effect`}
            value="Basic"
            key="Basic"
          />
          <SelectOption
            label={t`React to lights`}
            value="StandardWithoutMetalness"
            key="StandardWithoutMetalness"
          />
        </SelectField>
        {properties.get('materialType').getValue() !== 'Basic' &&
          !hasLight(layout) && (
            <AlertMessage kind="error">
              <Trans>
                Make sure to set up a light in the effects of the layer or chose
                "No lighting effect" - otherwise the object will appear black.
              </Trans>
            </AlertMessage>
          )}
      </ColumnStackLayout>
      {facesProperties.map(faceProperty => (
        <React.Fragment key={faceProperty.id}>
          <Text size="block-title">{faceProperty.blockName}</Text>
          <ColumnStackLayout noMargin>
            <ColumnStackLayout noMargin>
              <Checkbox
                checked={
                  properties.get(faceProperty.visibilityProperty).getValue() ===
                  'true'
                }
                label={properties
                  .get(faceProperty.visibilityProperty)
                  .getLabel()}
                onCheck={(_, value) => {
                  onChangeProperty(
                    faceProperty.visibilityProperty,
                    value ? '1' : '0'
                  );
                }}
                id={`cube3d-object-${faceProperty.visibilityProperty}`}
              />
              <Checkbox
                checked={
                  properties
                    .get(faceProperty.resourceRepeatProperty)
                    .getValue() === 'true'
                }
                label={properties
                  .get(faceProperty.resourceRepeatProperty)
                  .getLabel()}
                onCheck={(_, value) => {
                  onChangeProperty(
                    faceProperty.resourceRepeatProperty,
                    value ? '1' : '0'
                  );
                }}
                id={`cube3d-object-${faceProperty.resourceRepeatProperty}`}
              />
            </ColumnStackLayout>
            <ResourceSelectorWithThumbnail
              project={project}
              resourceKind="image"
              floatingLabelText={properties
                .get(faceProperty.resourceNameProperty)
                .getLabel()}
              resourceManagementProps={resourceManagementProps}
              resourceName={properties
                .get(faceProperty.resourceNameProperty)
                .getValue()}
              defaultNewResourceName={
                objectName + '_' + faceProperty.newResourceNameSuffix
              }
              onChange={value =>
                onChangeProperty(faceProperty.resourceNameProperty, value)
              }
              id={`cube3d-object-${faceProperty.resourceNameProperty}`}
            />
          </ColumnStackLayout>
        </React.Fragment>
      ))}
    </ColumnStackLayout>
  );
};

export default Cube3DEditor;
