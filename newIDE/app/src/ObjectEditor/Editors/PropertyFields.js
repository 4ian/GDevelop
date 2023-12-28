// @flow
import * as React from 'react';
import SemiControlledTextField from '../../UI/SemiControlledTextField';
import useForceUpdate from '../../Utils/UseForceUpdate';
import Checkbox from '../../UI/Checkbox';
import ResourceSelector from '../../ResourcesList/ResourceSelector';
import FormHelperText from '@material-ui/core/FormHelperText';
import InputAdornment from '@material-ui/core/InputAdornment';
import Tooltip from '@material-ui/core/Tooltip';
import { MarkdownText } from '../../UI/MarkdownText';
import MeasurementUnitDocumentation from '../../PropertiesEditor/MeasurementUnitDocumentation';
import { getMeasurementUnitShortLabel } from '../../PropertiesEditor/PropertiesMapToSchema';
import { type ResourceManagementProps } from '../../ResourcesList/ResourceSource';
import ResourcesLoader from '../../ResourcesLoader';
import { Column, Line } from '../../UI/Grid';

const gd: libGDevelop = global.gd;

type PropertyFieldProps = {|
  objectConfiguration: gdObjectConfiguration,
  propertyName: string,
  onChange?: () => void,
|};

export const PropertyField = ({
  objectConfiguration,
  propertyName,
  onChange,
}: PropertyFieldProps) => {
  const forceUpdate = useForceUpdate();
  const properties = objectConfiguration.getProperties();

  const updateProperty = React.useCallback(
    (value: string) => {
      const oldValue = objectConfiguration
        .getProperties()
        .get(propertyName)
        .getValue();
      objectConfiguration.updateProperty(propertyName, value);
      const newValue = objectConfiguration
        .getProperties()
        .get(propertyName)
        .getValue();
      if (onChange && newValue !== oldValue) {
        onChange();
      }
      forceUpdate();
    },
    [objectConfiguration, propertyName, onChange, forceUpdate]
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
        floatingLabelFixed
        floatingLabelText={property.getLabel()}
        onChange={updateProperty}
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

export const PropertyCheckbox = ({
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
  onChange: (value: string) => void,
|};

export const PropertyResourceSelector = ({
  objectConfiguration,
  propertyName,
  project,
  resourceManagementProps,
  onChange,
}: PropertyResourceSelectorProps) => {
  const forceUpdate = useForceUpdate();
  const { current: resourcesLoader } = React.useRef(ResourcesLoader);
  const properties = objectConfiguration.getProperties();

  const onChangeProperty = React.useCallback(
    (propertyName: string, newValue: string) => {
      objectConfiguration.updateProperty(propertyName, newValue);
      onChange(newValue);
      forceUpdate();
    },
    [objectConfiguration, onChange, forceUpdate]
  );

  // Note that property is a temporary - don't access it in callbacks.
  const property = properties.get(propertyName);
  const extraInfos = property.getExtraInfo();
  const value = property.getValue();
  const label = property.getLabel();

  return (
    <ResourceSelector
      project={project}
      // $FlowExpectedError
      resourceKind={extraInfos.size() > 0 ? extraInfos.at(0) : ''}
      floatingLabelText={label}
      resourceManagementProps={resourceManagementProps}
      initialResourceName={value}
      onChange={newValue => {
        if (newValue !== value) onChangeProperty(propertyName, newValue);
      }}
      resourcesLoader={resourcesLoader}
      fullWidth
    />
  );
};
