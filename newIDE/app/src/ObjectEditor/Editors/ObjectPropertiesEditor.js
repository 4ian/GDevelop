// @flow
import { Trans } from '@lingui/macro';
import { I18n } from '@lingui/react';

import * as React from 'react';
import PropertiesEditor from '../../PropertiesEditor';
import propertiesMapToSchema from '../../PropertiesEditor/PropertiesMapToSchema';
import EmptyMessage from '../../UI/EmptyMessage';
import { type EditorProps } from './EditorProps.flow';
import { Column, Line } from '../../UI/Grid';
import { getExtraObjectsInformation } from '../../Hints';
import AlertMessage from '../../UI/AlertMessage';

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

    const extraInformation = getExtraObjectsInformation()[object.getType()];

    return (
      <I18n>
        {({ i18n }) => (
          <Column>
            {propertiesSchema.length ? (
              <React.Fragment>
                {extraInformation ? (
                  <Line>
                    <Column noMargin>
                      {extraInformation.map(({ kind, message }, index) => (
                        <AlertMessage kind={kind} key={index}>
                          {i18n._(message)}
                        </AlertMessage>
                      ))}
                    </Column>
                  </Line>
                ) : null}
                <PropertiesEditor
                  unsavedChanges={this.props.unsavedChanges}
                  schema={propertiesSchema}
                  instances={[object]}
                  project={project}
                  resourceSources={resourceSources}
                  onChooseResource={onChooseResource}
                  resourceExternalEditors={resourceExternalEditors}
                />
              </React.Fragment>
            ) : (
              <EmptyMessage>
                <Trans>
                  There is nothing to configure for this object. You can still
                  use events to interact with the object.
                </Trans>
              </EmptyMessage>
            )}
          </Column>
        )}
      </I18n>
    );
  }
}
