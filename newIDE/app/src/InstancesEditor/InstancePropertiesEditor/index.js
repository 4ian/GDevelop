import React, { Component } from 'react';
import Paper from 'material-ui/Paper';
import enumerateLayers from '../../LayersList/EnumerateLayers';
import EmptyMessage from '../../UI/EmptyMessage';
import PropertiesEditor from '../../PropertiesEditor';
import propertiesMapToSchema from '../../PropertiesEditor/PropertiesMapToSchema';

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
        getChoices: () => enumerateLayers(this.props.layout),
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
    const instanceSchema = propertiesMapToSchema(
      properties,
      instance => instance.getCustomProperties(project, layout),
      (instance, name, value) =>
        instance.updateCustomProperty(name, value, project, layout)
    );

    return (
      <div
        style={{ padding: 10, overflowY: 'scroll', overflowX: 'hidden' }}
        key={instances.map(instance => '' + instance.ptr).join(';')}
      >
        <PropertiesEditor
          schema={this.schema.concat(instanceSchema)}
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
