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
import EmptyMessage from '../../UI/EmptyMessage';
import PropertiesEditor from '../../PropertiesEditor';

const styles = {
  container: { display: 'flex', flexDirection: 'column', flex: 1 },
};

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
        ],
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
      const choices = property
        .getExtraInfo()
        .toJSArray()
        .map(value => ({ value, label: value }));

      return {
        name,
        valueType,
        getChoices: valueType === 'choice' ? () => choices : undefined,
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
        <PropertiesEditor
          schema={this.schema.concat(propertyFields)}
          project={project}
          layout={layout}
          instances={instances}
        />
      </div>
    );
  }

  render() {
    const { instances } = this.props;

    return (
      <Paper style={styles.container}>
        {!instances || !instances.length
          ? this._renderEmpty()
          : this._renderInstancesProperties()}
      </Paper>
    );
  }
}
