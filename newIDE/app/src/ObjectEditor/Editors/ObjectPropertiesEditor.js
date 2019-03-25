// @flow
import { Trans } from '@lingui/macro';

import * as React from 'react';
import PropertiesEditor from '../../PropertiesEditor';
import propertiesMapToSchema from '../../PropertiesEditor/PropertiesMapToSchema';
import EmptyMessage from '../../UI/EmptyMessage';
import { type EditorProps } from './EditorProps.flow';
import { Column } from '../../UI/Grid';

type Props = EditorProps;

export default class ObjectPropertiesEditor extends React.Component<Props> {
  render() {
    const {
      object,
      project,
      resourceSources,
      onChooseResource,
      resourceExternalEditors,
    } = this.props;
    const properties = object.getProperties(project);

    const propertiesSchema = propertiesMapToSchema(
      properties,
      object => object.getProperties(project),
      (object, name, value) => object.updateProperty(name, value, project)
    );

    return (
      <Column>
        {propertiesSchema.length ? (
          <PropertiesEditor
            schema={propertiesSchema}
            instances={[object]}
            project={project}
            resourceSources={resourceSources}
            onChooseResource={onChooseResource}
            resourceExternalEditors={resourceExternalEditors}
          />
        ) : (
          <EmptyMessage>
            <Trans>
              There is nothing to configure for this object. You can still use
              events to interact with the object.
            </Trans>
          </EmptyMessage>
        )}
      </Column>
    );
  }
}
