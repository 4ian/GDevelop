// @flow
import { Trans } from '@lingui/macro';
import { I18n } from '@lingui/react';

import * as React from 'react';
import PropertiesEditor from '../../PropertiesEditor';
import propertiesMapToSchema from '../../PropertiesEditor/PropertiesMapToSchema';
import EmptyMessage from '../../UI/EmptyMessage';
import { type EditorProps } from './EditorProps.flow';
import { Line } from '../../UI/Grid';
import { getExtraObjectsInformation } from '../../Hints';
import { getObjectTutorialIds } from '../../Utils/GDevelopServices/Tutorial';
import AlertMessage from '../../UI/AlertMessage';
import { ColumnStackLayout } from '../../UI/Layout';
import DismissableTutorialMessage from '../../Hints/DismissableTutorialMessage';

const gd: libGDevelop = global.gd;

type Props = EditorProps;

const ObjectPropertiesEditor = (props: Props) => {
  const {
    objectConfiguration,
    project,
    resourceManagementProps,
    unsavedChanges,
    renderObjectNameField,
  } = props;

  // TODO: Workaround a bad design of ObjectJsImplementation. When getProperties
  // and associated methods are redefined in JS, they have different arguments (
  // see ObjectJsImplementation C++ implementation). If called directly here from JS,
  // the arguments will be mismatched. To workaround this, always cast the object to
  // a base gdObject to ensure C++ methods are called.
  const objectConfigurationAsGd = gd.castObject(
    objectConfiguration,
    gd.ObjectConfiguration
  );
  const properties = objectConfigurationAsGd.getProperties();

  const propertiesSchema = propertiesMapToSchema(
    properties,
    object => object.getProperties(),
    (object, name, value) => object.updateProperty(name, value)
  );

  const extraInformation = getExtraObjectsInformation()[
    objectConfigurationAsGd.getType()
  ];

  const tutorialIds = getObjectTutorialIds(objectConfigurationAsGd.getType());

  return (
    <I18n>
      {({ i18n }) => (
        <ColumnStackLayout noMargin>
          {renderObjectNameField && renderObjectNameField()}
          {tutorialIds.map(tutorialId => (
            <DismissableTutorialMessage
              key={tutorialId}
              tutorialId={tutorialId}
            />
          ))}
          {propertiesSchema.length ? (
            <React.Fragment>
              {extraInformation ? (
                <Line>
                  <ColumnStackLayout noMargin>
                    {extraInformation.map(({ kind, message }, index) => (
                      <AlertMessage kind={kind} key={index}>
                        {i18n._(message)}
                      </AlertMessage>
                    ))}
                  </ColumnStackLayout>
                </Line>
              ) : null}
              <PropertiesEditor
                unsavedChanges={unsavedChanges}
                schema={propertiesSchema}
                instances={[objectConfigurationAsGd]}
                project={project}
                resourceManagementProps={resourceManagementProps}
              />
            </React.Fragment>
          ) : (
            <EmptyMessage>
              <Trans>
                There is nothing to configure for this object. You can still use
                events to interact with the object.
              </Trans>
            </EmptyMessage>
          )}
        </ColumnStackLayout>
      )}
    </I18n>
  );
};

export default ObjectPropertiesEditor;
