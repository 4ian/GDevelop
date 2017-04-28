import React, { Component } from 'react';
import TextField from 'material-ui/TextField';
import Checkbox from 'material-ui/Checkbox';
import Subheader from 'material-ui/Subheader';
import FlatButton from 'material-ui/FlatButton';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import Paper from 'material-ui/Paper';
import enumerateLayers from '../../LayersList/EnumerateLayers';
import { mapFor } from '../../Utils/MapFor';
import EditorBar from '../../UI/EditorBar';
import EmptyMessage from '../../UI/EmptyMessage';

export default class InstancePropertiesEditor extends Component {
  constructor() {
    super();

    this.schema = [
      {
        name: 'Object name',
        valueType: 'string',
        disabled: true,
        getValue: instance => instance.getObjectName(),
        setValue: (instance, newValue) => instance.setObjectName(newValue),
      },
      {
        name: 'X',
        valueType: 'number',
        getValue: instance => instance.getX(),
        setValue: (instance, newValue) => instance.setX(newValue),
      },
      {
        name: 'Y',
        valueType: 'number',
        getValue: instance => instance.getY(),
        setValue: (instance, newValue) => instance.setY(newValue),
      },
      {
        name: 'Angle',
        valueType: 'number',
        getValue: instance => instance.getAngle(),
        setValue: (instance, newValue) => instance.setAngle(newValue),
      },
      {
        name: 'Z Order',
        valueType: 'number',
        getValue: instance => instance.getZOrder(),
        setValue: (instance, newValue) => instance.setZOrder(newValue),
      },
      {
        name: 'Layer',
        valueType: 'string',
        getChoices: (project, layout) => enumerateLayers(layout),
        getValue: instance => instance.getLayer(),
        setValue: (instance, newValue) => instance.setLayer(newValue),
      },
      {
        name: 'Locked',
        valueType: 'boolean',
        getValue: instance => instance.isLocked(),
        setValue: (instance, newValue) => instance.setLocked(newValue),
      },
      {
        name: 'Instance variables',
        children: [
          {
            name: 'Edit variables',
            getLabel: instance =>
              'Edit variables (' + instance.getVariables().count() + ')',
            onClick: instance => this.props.editInstanceVariables(instance),
          },
        ]
      },
      {
        name: 'Custom size',
        children: [
          {
            name: 'Enabled?',
            valueType: 'boolean',
            getValue: instance => instance.hasCustomSize(),
            setValue: (instance, newValue) =>
              instance.setHasCustomSize(newValue),
          },
          {
            name: 'Width',
            valueType: 'number',
            getValue: instance => instance.getCustomWidth(),
            setValue: (instance, newValue) => instance.setCustomWidth(newValue),
          },
          {
            name: 'Height',
            valueType: 'number',
            getValue: instance => instance.getCustomHeight(),
            setValue: (instance, newValue) =>
              instance.setCustomHeight(newValue),
          },
        ],
      },
    ];
  }

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
          checked={this._getFieldValue(this.props.instances, field)}
          onCheck={(event, newValue) => {
            this.props.instances.forEach(i => field.setValue(i, !!newValue));
            this.props.onInstancesModified(this.props.instances);
          }}
          disabled={field.disabled}
        />
      );
    } else if (field.valueType === 'number') {
      return (
        <TextField
          value={this._getFieldValue(this.props.instances, field)}
          key={field.name}
          floatingLabelText={field.name}
          floatingLabelFixed={true}
          onChange={(event, newValue) => {
            this.props.instances.forEach(i =>
              field.setValue(i, parseFloat(newValue) || 0));
            this.props.onInstancesModified(this.props.instances);
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
              field.setValue(i, newValue || ''));
            this.props.onInstancesModified(this.props.instances);
          }}
          fullWidth
          disabled={field.disabled}
        />
      );
    }
  };

  _renderSelectField = field => {
    const { project, layout } = this.props;
    const children = field
      .getChoices(project, layout)
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
              field.setValue(i, parseFloat(newValue) || 0));
            this.props.onInstancesModified(this.props.instances);
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
              field.setValue(i, newValue || ''));
            this.props.onInstancesModified(this.props.instances);
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
        onTouchTap={() => field.onClick(this.props.instances[0])}
      />
    );
  };

  _renderFields(schema) {
    return schema.map(field => {
      if (field.getChoices && field.getValue)
        return this._renderSelectField(field);
      if (field.getValue) return this._renderEditField(field);
      if (field.onClick) return this._renderButton(field);
      if (field.children) {
        return (
          <div key={field.name}>
            <Subheader style={{ paddingLeft: 0 }}>{field.name}</Subheader>
            <div style={{ marginLeft: 15 }}>
              {this._renderFields(field.children)}
            </div>
          </div>
        );
      }

      return null;
    });
  }

  _renderEmpty() {
    return (
      <EmptyMessage>
        Click on an instance on the scene to display its properties
      </EmptyMessage>
    );
  }

  _renderInstancesProperties() {
    const { project, layout, instances } = this.props;

    //TODO: multiple instances support
    const properties = instances[0].getCustomProperties(project, layout);
    const propertyNames = properties.keys();
    const propertyFields = mapFor(0, propertyNames.size(), i => {
      const name = propertyNames.at(i);
      const property = properties.get(name);
      const valueType = property.getType().toLowerCase();

      return {
        name,
        valueType,
        getValue: instance => {
          // Instance custom properties are always stored as string, cast them if necessary
          const rawValue = instance
            .getCustomProperties(project, layout)
            .get(name)
            .getValue();
          if (valueType === 'boolean') {
            return rawValue === 'true';
          } else if (valueType === 'number') {
            return parseFloat(rawValue);
          }

          return rawValue;
        },
        setValue: (instance, newValue) => {
          // Instance custom properties are always stored as string, cast them if necessary
          let value;
          if (typeof newValue === 'boolean') {
            value = newValue ? '1' : '0';
          } else {
            value = '' + newValue;
          }

          instance.updateCustomProperty(name, value, project, layout);
        },
      };
    });

    return (
      <div
        style={{ padding: 10, overflowY: 'scroll', overflowX: 'hidden' }}
        key={instances.map(instance => '' + instance.ptr).join(';')}
      >
        {this._renderFields(this.schema.concat(propertyFields))}
      </div>
    );
  }

  render() {
    const { instances } = this.props;

    return (
      <Paper style={{ display: 'flex', flexDirection: 'column' }}>
        <EditorBar title="Properties" showMenuIconButton={false} />
        {!instances || !instances.length
          ? this._renderEmpty()
          : this._renderInstancesProperties()}
      </Paper>
    );
  }
}
