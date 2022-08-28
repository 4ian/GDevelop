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
import { getObjectTutorialIds } from '../../Utils/GDevelopServices/Tutorial';
import AlertMessage from '../../UI/AlertMessage';
import { ColumnStackLayout } from '../../UI/Layout';
import DismissableTutorialMessage from '../../Hints/DismissableTutorialMessage';
import { mapFor } from '../../Utils/MapFor';
import ObjectsEditorService from '../ObjectsEditorService';
import Text from '../../UI/Text';
import useForceUpdate from '../../Utils/UseForceUpdate';
import { Accordion, AccordionHeader, AccordionBody } from '../../UI/Accordion';
import { IconContainer } from '../../UI/IconContainer';
import HelpIcon from '../../UI/HelpIcon';
import PreferencesContext from '../../MainFrame/Preferences/PreferencesContext';

const gd: libGDevelop = global.gd;

type Props = EditorProps;

const CustomObjectPropertiesEditor = (props: Props) => {
  const forceUpdate = useForceUpdate();

  const {
    object,
    project,
    resourceSources,
    onChooseResource,
    resourceExternalEditors,
    unsavedChanges,
  } = props;

  const customObjectConfiguration = gd.asCustomObjectConfiguration(object);
  const properties = customObjectConfiguration.getProperties();

  const propertiesSchema = propertiesMapToSchema(
    properties,
    object => object.getProperties(),
    (object, name, value) => object.updateProperty(name, value)
  );

  const extraInformation = getExtraObjectsInformation()[
    customObjectConfiguration.getType()
  ];

  const { values } = React.useContext(PreferencesContext);
  const tutorialIds = getObjectTutorialIds(customObjectConfiguration.getType());

  const eventBasedObject = project.hasEventsBasedObject(
    customObjectConfiguration.getType()
  )
    ? project.getEventsBasedObject(customObjectConfiguration.getType())
    : null;

  return (
    <I18n>
      {({ i18n }) => (
        <ColumnStackLayout>
          {tutorialIds.map(tutorialId => (
            <DismissableTutorialMessage
              key={tutorialId}
              tutorialId={tutorialId}
            />
          ))}
          {propertiesSchema.length || eventBasedObject.getObjectsCount() ? (
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
                instances={[customObjectConfiguration]}
                project={project}
                resourceSources={resourceSources}
                onChooseResource={onChooseResource}
                resourceExternalEditors={resourceExternalEditors}
              />
              {eventBasedObject &&
                mapFor(0, eventBasedObject.getObjectsCount(), i => {
                  const childObject = eventBasedObject.getObjectAt(i);
                  const childObjectConfiguration = customObjectConfiguration.getChildObjectConfiguration(
                    childObject.getName()
                  );
                  const editorConfiguration = ObjectsEditorService.getEditorConfiguration(
                    project,
                    childObjectConfiguration.getType()
                  );
                  const EditorComponent = editorConfiguration.component;
                  
                  const objectMetadata = gd.MetadataProvider.getObjectMetadata(
                    gd.JsPlatform.get(),
                    childObjectConfiguration.getType()
                  );
                  const iconUrl = objectMetadata.getIconFilename();
                  const tutorialIds = getObjectTutorialIds(childObjectConfiguration.getType());
                  const enabledTutorialIds = tutorialIds.filter(
                    tutorialId => !values.hiddenTutorialHints[tutorialId]
                  );

                  return (
                    <Accordion key={childObject.getName()} defaultExpanded>
                    <AccordionHeader
                      actions={[
                        <HelpIcon
                          key="help"
                          size="small"
                          helpPagePath={objectMetadata.getHelpPath()}
                        />,
                      ]}
                    >
                      {iconUrl ? (
                        <IconContainer
                          src={iconUrl}
                          alt={childObject.getName()}
                          size={20}
                        />
                      ) : null}
                      <Column expand>
                        <Text size="block-title">
                          {childObject.getName()}
                        </Text>
                      </Column>
                    </AccordionHeader>
                    <AccordionBody>
                      <Column
                        expand
                        noMargin
                        noOverflowParent
                      >
                        {enabledTutorialIds.length ? (
                          <Line>
                            <ColumnStackLayout expand>
                              {tutorialIds.map(tutorialId => (
                                <DismissableTutorialMessage
                                  key={tutorialId}
                                  tutorialId={tutorialId}
                                />
                              ))}
                            </ColumnStackLayout>
                          </Line>
                        ) : null}
                        <Line>
                          <EditorComponent
                            object={childObjectConfiguration}
                            project={project}
                            resourceSources={resourceSources}
                            onChooseResource={onChooseResource}
                            resourceExternalEditors={resourceExternalEditors}
                            onSizeUpdated={
                              forceUpdate /*Force update to ensure dialog is properly positionned*/
                            }
                            objectName={childObject.getName()}
                          />
                        </Line>
                      </Column>
                    </AccordionBody>
                  </Accordion>
                  );
                })}
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

export default CustomObjectPropertiesEditor;
