import React, { Component } from 'react';
import { mapFor } from '../../Utils/MapFor';
import PropertiesEditor from '../../PropertiesEditor';
const gd = global.gd;

export default class AdMobEditor extends Component {
  render() {
    const { object, project } = this.props;

    const properties = object.getProperties(project);
    const propertyNames = properties.keys();
    const schema = mapFor(0, propertyNames.size(), i => {
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
          const rawValue = object.getProperties(project).get(name).getValue();
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

          instance.updateProperty(name, value, project);
        },
      };
    });

    return (
      <PropertiesEditor
        schema={schema}
        project={project}
        layout={null /*TODO*/}
        instances={[object]}
      />
    );
  }
}
