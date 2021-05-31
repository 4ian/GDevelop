// @flow
import { Trans } from '@lingui/macro';
import { I18n } from '@lingui/react';

import * as React from 'react';
import PropertiesEditor from '../../PropertiesEditor';
import propertiesMapToSchema from '../../PropertiesEditor/PropertiesMapToSchema';
import EmptyMessage from '../../UI/EmptyMessage';
import { type EditorProps } from './EditorProps.flow';
import { Column, Line } from '../../UI/Grid';
import {
  getExtraObjectsInformation,
  getObjectTutorialHints,
} from '../../Hints';
import AlertMessage from '../../UI/AlertMessage';
import { ColumnStackLayout } from '../../UI/Layout';
import DismissableTutorialMessage from '../../Hints/DismissableTutorialMessage';

const gd: libGDevelop = global.gd;

type Props = EditorProps;

export default class ObjectPropertiesEditor extends React.Component<Props> {
  render(): React.Node {
    const {
      object,
      project,
      resourceSources,
      onChooseResource,
      resourceExternalEditors,
    } = this.props;

    // TODO: Workaround a bad design of ObjectJsImplementation. When getProperties
    // and associated methods are redefined in JS, they have different arguments (
    // see ObjectJsImplementation C++ implementation). If called directly here from JS,
    // the arguments will be mismatched. To workaround this, always case the object to
    // a base gdObject to ensure C++ methods are called.
    const objectAsGdObject = gd.castObject(object, gd.gdObject);
    const properties = objectAsGdObject.getProperties();

    const propertiesSchema = propertiesMapToSchema(
      properties,
      object => object.getProperties(),
      (object, name, value) => object.updateProperty(name, value)
    );

    const extraInformation = getExtraObjectsInformation()[
      objectAsGdObject.getType()
    ];

    const tutorialHints = getObjectTutorialHints(objectAsGdObject.getType());

    return (
      <I18n>
        {({ i18n }) => (
          <ColumnStackLayout>
            {tutorialHints.map(tutorialHint => (
              <DismissableTutorialMessage
                key={tutorialHint.identifier}
                tutorialHint={tutorialHint}
              />
            ))}
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
                  instances={[objectAsGdObject]}
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
          </ColumnStackLayout>
        )}
      </I18n>
    );
  }
}
