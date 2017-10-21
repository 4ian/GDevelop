import React, { Component } from 'react';
import { Line, Column } from '../../UI/Grid';
import PropertiesEditor from '../../PropertiesEditor';
import propertiesMapToSchema from '../../PropertiesEditor/PropertiesMapToSchema';

export default class AdMobEditor extends Component {
  render() {
    const { object, project } = this.props;

    const properties = object.getProperties(project);
    const propertiesSchema = propertiesMapToSchema(
      properties,
      object => object.getProperties(project),
      (object, name, value) => object.updateProperty(name, value, project)
    );

    return (
      <Column>
        <Line>
          <PropertiesEditor schema={propertiesSchema} instances={[object]} />
        </Line>
      </Column>
    );
  }
}
