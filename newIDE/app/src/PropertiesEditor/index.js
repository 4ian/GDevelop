// @flow
import * as React from 'react';
import SemiControlledTextField from '../UI/SemiControlledTextField';
import InlineCheckbox from '../UI/InlineCheckbox';
import Subheader from 'material-ui/Subheader';
import FlatButton from 'material-ui/FlatButton';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import Edit from 'material-ui/svg-icons/image/edit';
import IconButton from 'material-ui/IconButton';

export type Instance = Object; // This could be improved using generics.
export type Instances = Array<Instance>;
export type ValueFieldCommonProperties = {|
  name: string,
  getChoices?: ?() => Array<{| value: string, label: string |}>,
  getLabel?: Instance => string,
  disabled?: boolean,
  onEditButtonClick?: Instance => void,
  onClick?: Instance => void,
|};
export type ValueField =
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
      ...ValueFieldCommonProperties,
    |}
  | {|
      valueType: 'boolean',
      getValue: Instance => boolean,
      setValue: (instance: Instance, newValue: boolean) => void,
      ...ValueFieldCommonProperties,
    |}
  | {|
      valueType: 'choice',
      getValue: Instance => string,
      setValue: (instance: Instance, newValue: string) => void,
      ...ValueFieldCommonProperties,
    |};
export type Field =
  | ValueField
  | {|
      name: string,
      type: 'row' | 'column',
      children: Array<Object>,
    |};
export type Schema = Array<Field>;

type Props = {|
  onInstancesModified?: Instances => void,
  instances: Instances,
  schema: Schema,
  mode?: 'column' | 'row',
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

export default class PropertiesEditor extends React.Component<Props, {||}> {
  _onInstancesModified = (instances: Instances) => {
    // This properties editor is dealing with fields that are
    // responsible to update their state (see field.setValue).

    if (this.props.onInstancesModified)
      this.props.onInstancesModified(instances);
    else this.forceUpdate();
  };

  _getFieldValue(instances: Instances, field: ValueField, defaultValue?: any): any {
    if (!instances[0]) {
      console.log(
        'PropertiesEditor._getFieldValue was called with an empty list of instances (or containing undefined). This is a bug that should be fixed'
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
  }

  _getFieldLabel(instances: Instances, field: ValueField): any {
    if (!instances[0]) {
      console.log(
        'PropertiesEditor._getFieldLabel was called with an empty list of instances (or containing undefined). This is a bug that should be fixed'
      );
      return field.name;
    }

    if (field.getLabel) return field.getLabel(instances[0]);

    return field.name;
  }

  _renderEditField = (field: ValueField) => {
    if (field.name === 'PLEASE_ALSO_SHOW_EDIT_BUTTON_THANKS') return null; // This special property was used in GDevelop 4 IDE to ask for a Edit button to be shown, ignore it.

    if (field.valueType === 'boolean') {
      return (
        <InlineCheckbox
          label={this._getFieldLabel(this.props.instances, field)}
          key={field.name}
          checked={this._getFieldValue(this.props.instances, field)}
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
          value={this._getFieldValue(this.props.instances, field)}
          key={field.name}
          id={field.name}
          floatingLabelText={this._getFieldLabel(this.props.instances, field)}
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
            value={this._getFieldValue(
              this.props.instances,
              field,
              '(Multiple values)'
            )}
            id={field.name}
            floatingLabelText={this._getFieldLabel(this.props.instances, field)}
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
          value={this._getFieldValue(this.props.instances, field)}
          key={field.name}
          floatingLabelText={this._getFieldLabel(this.props.instances, field)}
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
          value={this._getFieldValue(
            this.props.instances,
            field,
            '(Multiple values)'
          )}
          key={field.name}
          floatingLabelText={this._getFieldLabel(this.props.instances, field)}
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
        label={this._getFieldLabel(this.props.instances, field)}
        onClick={() => {
          if (field.onClick) field.onClick(this.props.instances[0]);
        }}
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
          } else {
            if (field.getChoices && field.getValue)
              return this._renderSelectField(field);
            if (field.getValue) return this._renderEditField(field);
            if (field.onClick) return this._renderButton(field);
          }

          return null;
        })}
      </div>
    );
  }
}
