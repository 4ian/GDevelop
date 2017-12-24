import React, { Component } from 'react';
import TextField from 'material-ui/TextField';
import Checkbox from 'material-ui/Checkbox';
import Subheader from 'material-ui/Subheader';
import FlatButton from 'material-ui/FlatButton';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';

const styles = {
  checkbox: {
    marginTop: 10,
  },
};

export default class PropertiesEditor extends Component {
  _onInstancesModified = instances => {
    // This properties editor is dealing with fields that are
    // responsible to update their state (see field.setValue).

    if (this.props.onInstancesModified)
      this.props.onInstancesModified(instances);
    else this.forceUpdate();
  };

  _getFieldValue(instances, field, defaultValue) {
    let value = field.getValue(instances[0]);
    for (var i = 1; i < instances.length; ++i) {
      if (value !== field.getValue(instances[i])) {
        if (typeof defaultValue !== 'undefined') value = defaultValue;
        break;
      }
    }

    return value;
  }

  _renderEditField = field => {
    if (field.valueType === 'boolean') {
      return (
        <Checkbox
          label={field.name}
          key={field.name}
          style={styles.checkbox}
          checked={this._getFieldValue(this.props.instances, field)}
          onCheck={(event, newValue) => {
            this.props.instances.forEach(i => field.setValue(i, !!newValue));
            this._onInstancesModified(this.props.instances);
          }}
          disabled={field.disabled}
        />
      );
    } else if (field.valueType === 'number') {
      return (
        <TextField
          value={this._getFieldValue(this.props.instances, field)}
          key={field.name}
          id={field.name}
          floatingLabelText={field.name}
          floatingLabelFixed={true}
          onChange={(event, newValue) => {
            this.props.instances.forEach(i =>
              field.setValue(i, parseFloat(newValue) || 0)
            );
            this._onInstancesModified(this.props.instances);
          }}
          type="number"
          fullWidth
          disabled={field.disabled}
        />
      );
    } else {
      return (
        <TextField
          value={this._getFieldValue(
            this.props.instances,
            field,
            '(Multiple values)'
          )}
          key={field.name}
          floatingLabelText={field.name}
          floatingLabelFixed={true}
          onChange={(event, newValue) => {
            this.props.instances.forEach(i =>
              field.setValue(i, newValue || '')
            );
            this._onInstancesModified(this.props.instances);
          }}
          fullWidth
          disabled={field.disabled}
        />
      );
    }
  };

  _renderSelectField = field => {
    const children = field
      .getChoices()
      .map(({ value, label }) => (
        <MenuItem key={value} value={value} primaryText={label} />
      ));

    if (field.valueType === 'number') {
      return (
        <SelectField
          value={this._getFieldValue(this.props.instances, field)}
          key={field.name}
          floatingLabelText={field.name}
          floatingLabelFixed={true}
          onChange={(event, index, newValue) => {
            this.props.instances.forEach(i =>
              field.setValue(i, parseFloat(newValue) || 0)
            );
            this._onInstancesModified(this.props.instances);
          }}
          fullWidth
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
          floatingLabelText={field.name}
          floatingLabelFixed={true}
          onChange={(event, index, newValue) => {
            this.props.instances.forEach(i =>
              field.setValue(i, newValue || '')
            );
            this._onInstancesModified(this.props.instances);
          }}
          fullWidth
          disabled={field.disabled}
        >
          {children}
        </SelectField>
      );
    }
  };

  _renderButton = field => {
    //TODO: multi selection handling
    return (
      <FlatButton
        key={field.name}
        fullWidth
        primary
        label={field.getLabel(this.props.instances[0])}
        onClick={() => field.onClick(this.props.instances[0])}
      />
    );
  };

  render() {
    return (
      <div>
        {this.props.schema.map(field => {
          if (field.getChoices && field.getValue)
            return this._renderSelectField(field);
          if (field.getValue) return this._renderEditField(field);
          if (field.onClick) return this._renderButton(field);
          if (field.children) {
            return (
              <div key={field.name}>
                <Subheader style={{ paddingLeft: 0 }}>{field.name}</Subheader>
                <div style={{ marginLeft: 15 }}>
                  <PropertiesEditor
                    schema={field.children}
                    instances={this.props.instances}
                  />
                </div>
              </div>
            );
          }

          return null;
        })}
      </div>
    );
  }
}
