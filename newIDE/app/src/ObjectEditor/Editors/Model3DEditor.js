// @flow

import * as React from 'react';
import { Trans } from '@lingui/macro';
import { t } from '@lingui/macro';
import { type EditorProps } from './EditorProps.flow';
import { ColumnStackLayout, ResponsiveLineStackLayout } from '../../UI/Layout';
import Text from '../../UI/Text';
import SemiControlledTextField from '../../UI/SemiControlledTextField';
import useForceUpdate from '../../Utils/UseForceUpdate';
import ResourceSelector from '../../ResourcesList/ResourceSelector';
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
import { type ResourceManagementProps } from '../../ResourcesList/ResourceSource';
import ResourcesLoader from '../../ResourcesLoader';

const gd: libGDevelop = global.gd;

export const hasLight = (layout: ?gd.Layout) => {
  if (!layout) {
    return true;
  }
  for (let layerIndex = 0; layerIndex < layout.getLayersCount(); layerIndex++) {
    const layer = layout.getLayerAt(layerIndex);
    if (layer.getRenderingType() === '2d') {
      continue;
    }
    const effects = layer.getEffects();
    for (
      let effectIndex = 0;
      effectIndex < effects.getEffectsCount();
      effectIndex++
    ) {
      const effect = effects.getEffectAt(effectIndex);
      const type = effect.getEffectType();
      if (
        type === 'Scene3D::AmbientLight' ||
        type === 'Scene3D::DirectionalLight' ||
        type === 'Scene3D::HemisphereLight'
      ) {
        return true;
      }
    }
  }
  return false;
};

type PropertyFieldProps = {|
  objectConfiguration: gdObjectConfiguration,
  propertyName: string,
|};

const PropertyField = ({
  objectConfiguration,
  propertyName,
}: PropertyFieldProps) => {
  const forceUpdate = useForceUpdate();
  const properties = objectConfiguration.getProperties();

  const onChangeProperty = React.useCallback(
    (property: string, value: string) => {
      objectConfiguration.updateProperty(property, value);
      forceUpdate();
    },
    [objectConfiguration, forceUpdate]
  );

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
            <InputAdornment position="end">{endAdornment.label}</InputAdornment>
          </Tooltip>
        }
      />
    </Column>
  );
};

const PropertyCheckbox = ({
  objectConfiguration,
  propertyName,
}: PropertyFieldProps) => {
  const forceUpdate = useForceUpdate();
  const properties = objectConfiguration.getProperties();

  const onChangeProperty = React.useCallback(
    (property: string, value: string) => {
      objectConfiguration.updateProperty(property, value);
      forceUpdate();
    },
    [objectConfiguration, forceUpdate]
  );

  const property = properties.get(propertyName);
  return (
    <Checkbox
      checked={property.getValue() === 'true'}
      label={
        <React.Fragment>
          <Line noMargin>{property.getLabel()}</Line>
          <FormHelperText style={{ display: 'inline' }}>
            <MarkdownText source={property.getDescription()} />
          </FormHelperText>
        </React.Fragment>
      }
      onCheck={(_, value) => {
        onChangeProperty(propertyName, value ? '1' : '0');
      }}
    />
  );
};

type PropertyResourceSelectorProps = {|
  objectConfiguration: gdObjectConfiguration,
  propertyName: string,
  project: gd.Project,
  resourceManagementProps: ResourceManagementProps,
|};

const PropertyResourceSelector = ({
  objectConfiguration,
  propertyName,
  project,
  resourceManagementProps,
}: PropertyResourceSelectorProps) => {
  const forceUpdate = useForceUpdate();
  const { current: resourcesLoader } = React.useRef(ResourcesLoader);
  const properties = objectConfiguration.getProperties();

  const onChangeProperty = React.useCallback(
    (property: string, value: string) => {
      objectConfiguration.updateProperty(property, value);
      forceUpdate();
    },
    [objectConfiguration, forceUpdate]
  );

  const property = properties.get(propertyName);
  const extraInfos = property.getExtraInfo();
  return (
    <ResourceSelector
      project={project}
      // $FlowExpectedError
      resourceKind={extraInfos.size() > 0 ? extraInfos.at(0) : ''}
      floatingLabelText={property.getLabel()}
      resourceManagementProps={resourceManagementProps}
      initialResourceName={property.getValue()}
      onChange={value => onChangeProperty(propertyName, value)}
      resourcesLoader={resourcesLoader}
      fullWidth
    />
  );
};

const Model3DEditor = ({
  objectConfiguration,
  project,
  layout,
  resourceManagementProps,
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

  return (
    <ColumnStackLayout noMargin>
      <PropertyResourceSelector
        objectConfiguration={objectConfiguration}
        propertyName="modelResourceName"
        project={project}
        resourceManagementProps={resourceManagementProps}
      />
      <Text size="block-title" noMargin>
        <Trans>Default orientation</Trans>
      </Text>
      <ResponsiveLineStackLayout expand noColumnMargin>
        <PropertyField
          objectConfiguration={objectConfiguration}
          propertyName="rotationX"
        />
        <PropertyField
          objectConfiguration={objectConfiguration}
          propertyName="rotationY"
        />
        <PropertyField
          objectConfiguration={objectConfiguration}
          propertyName="rotationZ"
        />
      </ResponsiveLineStackLayout>
      <Text size="block-title" noMargin>
        <Trans>Default size</Trans>
      </Text>
      <ResponsiveLineStackLayout expand noColumnMargin>
        <PropertyField
          objectConfiguration={objectConfiguration}
          propertyName="width"
        />
        <PropertyField
          objectConfiguration={objectConfiguration}
          propertyName="height"
        />
        <PropertyField
          objectConfiguration={objectConfiguration}
          propertyName="depth"
        />
      </ResponsiveLineStackLayout>
      <ColumnStackLayout noMargin expand>
        <PropertyCheckbox
          objectConfiguration={objectConfiguration}
          propertyName="keepAspectRatio"
        />
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
            label={t`Emit all ambient light`}
            value="StandardWithoutMetalness"
            key="StandardWithoutMetalness"
          />
          <SelectOption
            label={t`Keep model material`}
            value="KeepOriginal"
            key="KeepOriginal"
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
    </ColumnStackLayout>
  );
};

export default Model3DEditor;
