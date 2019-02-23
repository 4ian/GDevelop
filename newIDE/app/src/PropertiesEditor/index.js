// @flow
import * as React from 'react';
import SemiControlledTextField from '../UI/SemiControlledTextField';
import InlineCheckbox from '../UI/InlineCheckbox';
import ResourceSelector from '../ResourcesList/ResourceSelector';
import ResourcesLoader from '../ResourcesLoader';
import Subheader from 'material-ui/Subheader';
import FlatButton from 'material-ui/FlatButton';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import Edit from 'material-ui/svg-icons/image/edit';
import IconButton from 'material-ui/IconButton';
import {
  type ResourceKind,
  type ResourceSource,
  type ChooseResourceFunction,
} from '../ResourcesList/ResourceSource.flow';
import { type ResourceExternalEditor } from '../ResourcesList/ResourceExternalEditor.flow';

// An "instance" here is the objects for which properties are shown
export type Instance = Object; // This could be improved using generics.
export type Instances = Array<Instance>;

// "Value" fields are fields displayed in the properties.
export type ValueFieldCommonProperties = {|
  name: string,
  getLabel?: Instance => string,
  disabled?: boolean,
  onEditButtonClick?: Instance => void,
  onClick?: Instance => void,
|};

// "Primitive" value fields are "simple" fields.
export type PrimitiveValueField =
  | {|
      valueType: 'number',
      getValue: Instance => number,
      setValue: (instance: Instance, newValue: number) => void,
      ...ValueFieldCommonProperties,
    |}
  | {|
      valueType: 'string',
      getValue: Instance => string,
      setValue: (instance: Instance, newValue: string) => void,
      getChoices?: ?() => Array<{| value: string, label: string |}>,
      ...ValueFieldCommonProperties,
    |}
  | {|
      valueType: 'boolean',
      getValue: Instance => boolean,
      setValue: (instance: Instance, newValue: boolean) => void,
      ...ValueFieldCommonProperties,
    |};

// "Resource" fields are showing a resource selector.
type ResourceField = {|
  valueType: 'resource',
  resourceKind: ResourceKind,
  getValue: Instance => string,
  setValue: (instance: Instance, newValue: string) => void,
  ...ValueFieldCommonProperties,
|};

// A value field is a primitive or a resource.
export type ValueField = PrimitiveValueField | ResourceField;

// A field can be a primitive, a resource or a list of fields
export type Field =
  | PrimitiveValueField
  | ResourceField
  | {|
      name: string,
      type: 'row' | 'column',
      children: Array<Object>,
    |};

// The schema is the tree of all fields.
export type Schema = Array<Field>;

// Mandatory props in any case when using the component
type MandatoryProps = {|
  onInstancesModified?: Instances => void,
  instances: Instances,
  schema: Schema,
  mode?: 'column' | 'row',
|};

type Props =
  // Mandatory props in all cases:
  | MandatoryProps
  // Props to be used when you want to display resources:
  | {|
      ...MandatoryProps,
      project: gdProject,
      resourceSources: Array<ResourceSource>,
      onChooseResource: ChooseResourceFunction,
      resourceExternalEditors: Array<ResourceExternalEditor>,
    |};

const styles = {
  columnContainer: {
    display: 'flex',
    flexDirection: 'column',
  },
  rowContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  fieldContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  field: {
    flex: 1,
    width: 'auto',
  },
  subPropertiesEditorContainer: {
    marginLeft: 15,
  },
  subHeader: {
    paddingLeft: 0,
  },
};

const getFieldValue = (
  instances: Instances,
  field: ValueField,
  defaultValue?: any
): any => {
  if (!instances[0]) {
    console.log(
      'getFieldValue was called with an empty list of instances (or containing undefined). This is a bug that should be fixed'
    );
    return defaultValue;
  }

  let value = field.getValue(instances[0]);
  for (var i = 1; i < instances.length; ++i) {
    if (value !== field.getValue(instances[i])) {
      if (typeof defaultValue !== 'undefined') value = defaultValue;
      break;
    }
  }

  return value;
};

const getFieldLabel = (instances: Instances, field: ValueField): any => {
  if (!instances[0]) {
    console.log(
      'PropertiesEditor._getFieldLabel was called with an empty list of instances (or containing undefined). This is a bug that should be fixed'
    );
    return field.name;
  }

  if (field.getLabel) return field.getLabel(instances[0]);

  return field.name;
};

export default class PropertiesEditor extends React.Component<Props, {||}> {
  _onInstancesModified = (instances: Instances) => {
    // This properties editor is dealing with fields that are
    // responsible to update their state (see field.setValue).

    if (this.props.onInstancesModified)
      this.props.onInstancesModified(instances);
    else this.forceUpdate();
  };

  _renderInputField = (field: ValueField) => {
    if (field.name === 'PLEASE_ALSO_SHOW_EDIT_BUTTON_THANKS') return null; // This special property was used in GDevelop 4 IDE to ask for a Edit button to be shown, ignore it.

    if (field.valueType === 'boolean') {
      return (
        <InlineCheckbox
          label={getFieldLabel(this.props.instances, field)}
          key={field.name}
          checked={getFieldValue(this.props.instances, field)}
          onCheck={(event, newValue) => {
            this.props.instances.forEach(i => field.setValue(i, !!newValue));
            this._onInstancesModified(this.props.instances);
          }}
          disabled={field.disabled}
        />
      );
    } else if (field.valueType === 'number') {
      const { setValue } = field;
      return (
        <SemiControlledTextField
          value={getFieldValue(this.props.instances, field)}
          key={field.name}
          id={field.name}
          floatingLabelText={getFieldLabel(this.props.instances, field)}
          floatingLabelFixed
          onChange={newValue => {
            this.props.instances.forEach(i =>
              setValue(i, parseFloat(newValue) || 0)
            );
            this._onInstancesModified(this.props.instances);
          }}
          type="number"
          style={styles.field}
          disabled={field.disabled}
        />
      );
    } else {
      const { onEditButtonClick, setValue } = field;
      return (
        <div style={styles.fieldContainer} key={field.name}>
          <SemiControlledTextField
            value={getFieldValue(
              this.props.instances,
              field,
              '(Multiple values)'
            )}
            id={field.name}
            floatingLabelText={getFieldLabel(this.props.instances, field)}
            floatingLabelFixed
            onChange={newValue => {
              this.props.instances.forEach(i => setValue(i, newValue || ''));
              this._onInstancesModified(this.props.instances);
            }}
            style={styles.field}
            disabled={field.disabled}
          />
          {onEditButtonClick && (
            <IconButton
              disabled={this.props.instances.length !== 1}
              onClick={() => onEditButtonClick(this.props.instances[0])}
            >
              <Edit />
            </IconButton>
          )}
        </div>
      );
    }
  };

  _renderSelectField = (field: ValueField) => {
    if (!field.getChoices || !field.getValue) return;

    const children = field
      .getChoices()
      .map(({ value, label }) => (
        <MenuItem key={value} value={value} primaryText={label} />
      ));

    if (field.valueType === 'number') {
      const { setValue } = field;
      return (
        <SelectField
          value={getFieldValue(this.props.instances, field)}
          key={field.name}
          floatingLabelText={getFieldLabel(this.props.instances, field)}
          floatingLabelFixed
          onChange={(event, index, newValue) => {
            this.props.instances.forEach(i =>
              setValue(i, parseFloat(newValue) || 0)
            );
            this._onInstancesModified(this.props.instances);
          }}
          style={styles.field}
          disabled={field.disabled}
        >
          {children}
        </SelectField>
      );
    } else {
      return (
        <SelectField
          value={getFieldValue(
            this.props.instances,
            field,
            '(Multiple values)'
          )}
          key={field.name}
          floatingLabelText={getFieldLabel(this.props.instances, field)}
          floatingLabelFixed
          onChange={(event, index, newValue) => {
            this.props.instances.forEach(i =>
              field.setValue(i, newValue || '')
            );
            this._onInstancesModified(this.props.instances);
          }}
          style={styles.field}
          disabled={field.disabled}
        >
          {children}
        </SelectField>
      );
    }
  };

  _renderButton = (field: ValueField) => {
    //TODO: multi selection handling
    return (
      <FlatButton
        key={field.name}
        fullWidth
        primary
        label={getFieldLabel(this.props.instances, field)}
        onClick={() => {
          if (field.onClick) field.onClick(this.props.instances[0]);
        }}
      />
    );
  };

  _renderResourceField = (field: ResourceField) => {
    if (!this.props.project) {
      console.error(
        'You tried to display a resource field in a PropertiesEditor that does not support display resources. If you need to display resources, pass additional props (project, resourceSources, etc...)'
      );
      return;
    }

    const { setValue } = field;
    return (
      <ResourceSelector
        key={field.name}
        project={this.props.project}
        resourceSources={this.props.resourceSources}
        onChooseResource={this.props.onChooseResource}
        resourceExternalEditors={this.props.resourceExternalEditors}
        resourcesLoader={ResourcesLoader}
        resourceKind={field.resourceKind}
        fullWidth
        initialResourceName={getFieldValue(
          this.props.instances,
          field,
          '(Multiple values)' //TODO
        )}
        onChange={newValue => {
          this.props.instances.forEach(i => setValue(i, newValue));
          this._onInstancesModified(this.props.instances);
        }}
        floatingLabelText={getFieldLabel(this.props.instances, field)}
      />
    );
  };

  render() {
    const { mode } = this.props;

    return (
      <div
        style={mode === 'row' ? styles.rowContainer : styles.columnContainer}
      >
        {this.props.schema.map(field => {
          if (field.children) {
            if (field.type === 'row') {
              return (
                <PropertiesEditor
                  key={field.name}
                  schema={field.children}
                  instances={this.props.instances}
                  mode="row"
                />
              );
            }

            return (
              <div key={field.name}>
                <Subheader style={styles.subHeader}>{field.name}</Subheader>
                <div style={styles.subPropertiesEditorContainer}>
                  <PropertiesEditor
                    schema={field.children}
                    instances={this.props.instances}
                    mode="column"
                  />
                </div>
              </div>
            );
          } else if (field.valueType === 'resource') {
            return this._renderResourceField(field);
          } else {
            if (field.getChoices && field.getValue)
              return this._renderSelectField(field);
            if (field.getValue) return this._renderInputField(field);
            if (field.onClick) return this._renderButton(field);
          }

          return null;
        })}
      </div>
    );
  }
}
