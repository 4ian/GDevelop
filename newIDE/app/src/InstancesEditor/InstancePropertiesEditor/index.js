import React, { Component } from 'react';
import Background from '../../UI/Background';
import enumerateLayers from '../../LayersList/EnumerateLayers';
import EmptyMessage from '../../UI/EmptyMessage';
import PropertiesEditor from '../../PropertiesEditor';
import propertiesMapToSchema from '../../PropertiesEditor/PropertiesMapToSchema';
import VariablesList from '../../VariablesList';

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
        onEditButtonClick: instance =>
          this.props.onEditObjectByName(instance.getObjectName()),
      },
      {
        name: 'Position',
        type: 'row',
        children: [
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
        ],
      },
      {
        name: 'Angle',
        valueType: 'number',
        getValue: instance => instance.getAngle(),
        setValue: (instance, newValue) => instance.setAngle(newValue),
      },
      {
        name: 'Lock position/angle in the editor',
        valueType: 'boolean',
        getValue: instance => instance.isLocked(),
        setValue: (instance, newValue) => instance.setLocked(newValue),
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
        name: 'Custom size',
        type: 'row',
        children: [
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
      {
        name: 'Custom size?',
        valueType: 'boolean',
        getValue: instance => instance.hasCustomSize(),
        setValue: (instance, newValue) => instance.setHasCustomSize(newValue),
      },
    ];
  }

  _renderEmpty() {
    return (
      <EmptyMessage>
        Click on an instance in the scene to display its properties
      </EmptyMessage>
    );
  }

  _renderInstancesProperties() {
    const { project, layout, instances } = this.props;
    const objectVariables = layout.getObject(instances[0].getObjectName()).getVariables();
    const objectVariablesMeta ={}
    for (let i = 0; i < objectVariables.count(); i++) { 
      const name = objectVariables.getNameAt(i);
      const value = 0 //crashes--> objectVariables.getAt(i).getValue();
      objectVariablesMeta[name]={value}
    }
    console.log(objectVariablesMeta)
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
        Instance Variables:
        <VariablesList
          objectVariablesMeta={objectVariablesMeta}
          variablesContainer={instances[0].getVariables()}
          emptyExplanationMessage={''}
          emptyExplanationSecondMessage={''}
          onSizeUpdated={
            () =>
              this.forceUpdate() /*Force update to ensure dialog is properly positionned*/
          }
        />
      </div>
    );
  }

  render() {
    const { instances } = this.props;

    return (
      <Background>
        {!instances || !instances.length
          ? this._renderEmpty()
          : this._renderInstancesProperties()}
      </Background>
    );
  }
}
