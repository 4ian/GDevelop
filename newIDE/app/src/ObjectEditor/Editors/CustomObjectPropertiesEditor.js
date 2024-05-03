// @flow
import { Trans } from '@lingui/macro';
import { t } from '@lingui/macro';
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
import PreferencesContext from '../../MainFrame/Preferences/PreferencesContext';
import AnimationList, {
  type AnimationListInterface,
} from './SpriteEditor/AnimationList';
import PointsEditor from './SpriteEditor/PointsEditor';
import CollisionMasksEditor from './SpriteEditor/CollisionMasksEditor';
import {
  hasAnyFrame,
  getFirstAnimationFrame,
  setCollisionMaskOnAllFrames,
} from './SpriteEditor/Utils/SpriteObjectHelper';
import { getMatchingCollisionMask } from './SpriteEditor/CollisionMasksEditor/CollisionMaskHelper';
import ResourcesLoader from '../../ResourcesLoader';
import ScrollView, { type ScrollViewInterface } from '../../UI/ScrollView';
import FlatButton from '../../UI/FlatButton';
import RaisedButton from '../../UI/RaisedButton';
import FlatButtonWithSplitMenu from '../../UI/FlatButtonWithSplitMenu';
import { ResponsiveLineStackLayout } from '../../UI/Layout';
import { useResponsiveWindowSize } from '../../UI/Responsive/ResponsiveWindowMeasurer';
import Add from '../../UI/CustomSvgIcons/Add';
import Dialog from '../../UI/Dialog';
import HelpButton from '../../UI/HelpButton';

const gd: libGDevelop = global.gd;

type Props = EditorProps;

const CustomObjectPropertiesEditor = (props: Props) => {
  const forceUpdate = useForceUpdate();

  const {
    objectConfiguration,
    project,
    layout,
    object,
    objectName,
    resourceManagementProps,
    onSizeUpdated,
    onObjectUpdated,
    unsavedChanges,
    renderObjectNameField,
    isChildObject,
  } = props;

  const { isMobile } = useResponsiveWindowSize();

  const customObjectConfiguration = gd.asCustomObjectConfiguration(
    objectConfiguration
  );
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

  const animations = customObjectConfiguration.getAnimations();

  // The matching collision mask only takes the first sprite of the first
  // animation of the object. We consider this is enough to start with, and
  // the user can then edit the collision mask for further needs.
  const onCreateMatchingSpriteCollisionMask = React.useCallback(
    async () => {
      const firstSprite = getFirstAnimationFrame(animations);
      if (!firstSprite) {
        return;
      }
      const firstSpriteResourceName = firstSprite.getImageName();
      const firstAnimationResourceSource = ResourcesLoader.getResourceFullUrl(
        project,
        firstSpriteResourceName,
        {}
      );
      let matchingCollisionMask = null;
      try {
        matchingCollisionMask = await getMatchingCollisionMask(
          firstAnimationResourceSource
        );
      } catch (e) {
        console.error(
          'Unable to create a matching collision mask for the sprite, fallback to full image collision mask.',
          e
        );
      }
      setCollisionMaskOnAllFrames(animations, matchingCollisionMask);
      forceUpdate();
    },
    [animations, project, forceUpdate]
  );

  const scrollView = React.useRef<?ScrollViewInterface>(null);
  const animationList = React.useRef<?AnimationListInterface>(null);

  const [
    justAddedAnimationName,
    setJustAddedAnimationName,
  ] = React.useState<?string>(null);
  const justAddedAnimationElement = React.useRef<?any>(null);

  React.useEffect(
    () => {
      if (
        scrollView.current &&
        justAddedAnimationElement.current &&
        justAddedAnimationName
      ) {
        scrollView.current.scrollTo(justAddedAnimationElement.current);
        setJustAddedAnimationName(null);
        justAddedAnimationElement.current = null;
      }
    },
    [justAddedAnimationName]
  );

  const [pointsEditorOpen, setPointsEditorOpen] = React.useState(false);
  const [
    collisionMasksEditorOpen,
    setCollisionMasksEditorOpen,
  ] = React.useState(false);

  return (
    <I18n>
      {({ i18n }) => (
        <>
          <ScrollView ref={scrollView}>
            <ColumnStackLayout noMargin>
              {renderObjectNameField && renderObjectNameField()}
              {tutorialIds.map(tutorialId => (
                <DismissableTutorialMessage
                  key={tutorialId}
                  tutorialId={tutorialId}
                />
              ))}
              {propertiesSchema.length ||
              (eventBasedObject &&
                (eventBasedObject.getObjectsCount() ||
                  eventBasedObject.isAnimatable())) ? (
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
                    resourceManagementProps={resourceManagementProps}
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
                      const tutorialIds = getObjectTutorialIds(
                        childObjectConfiguration.getType()
                      );
                      const enabledTutorialIds = tutorialIds.filter(
                        tutorialId => !values.hiddenTutorialHints[tutorialId]
                      );
                      // TODO EBO: Add a protection against infinite loops in case
                      // of object cycles (thought it should be forbidden).
                      return (
                        <Accordion key={childObject.getName()} defaultExpanded>
                          <AccordionHeader>
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
                            <Column expand noMargin noOverflowParent>
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
                              <Line noMargin>
                                <Column expand>
                                  <EditorComponent
                                    isChildObject
                                    objectConfiguration={
                                      childObjectConfiguration
                                    }
                                    project={project}
                                    layout={layout}
                                    resourceManagementProps={
                                      resourceManagementProps
                                    }
                                    onSizeUpdated={
                                      forceUpdate /*Force update to ensure dialog is properly positioned*/
                                    }
                                    objectName={
                                      objectName + ' ' + childObject.getName()
                                    }
                                  />
                                </Column>
                              </Line>
                            </Column>
                          </AccordionBody>
                        </Accordion>
                      );
                    })}
                  {eventBasedObject && eventBasedObject.isAnimatable() && (
                    <Column expand>
                      <Text size="block-title">
                        <Trans>Animations</Trans>
                      </Text>
                      <AnimationList
                        ref={animationList}
                        animations={animations}
                        project={project}
                        layout={layout}
                        object={object}
                        objectName={objectName}
                        resourceManagementProps={resourceManagementProps}
                        onSizeUpdated={onSizeUpdated}
                        onObjectUpdated={onObjectUpdated}
                        isAnimationListLocked={false}
                        scrollView={scrollView}
                        onCreateMatchingSpriteCollisionMask={
                          onCreateMatchingSpriteCollisionMask
                        }
                      />
                    </Column>
                  )}
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
          </ScrollView>
          {eventBasedObject &&
            eventBasedObject.isAnimatable() &&
            !isChildObject && (
              <Column noMargin>
                <ResponsiveLineStackLayout
                  justifyContent="space-between"
                  noColumnMargin
                >
                  {!isMobile ? ( // On mobile, use only 1 button to gain space.
                    <ResponsiveLineStackLayout noMargin noColumnMargin>
                      <FlatButton
                        label={<Trans>Edit collision masks</Trans>}
                        onClick={() => setCollisionMasksEditorOpen(true)}
                        disabled={!hasAnyFrame(animations)}
                      />
                      <FlatButton
                        label={<Trans>Edit points</Trans>}
                        onClick={() => setPointsEditorOpen(true)}
                        disabled={!hasAnyFrame(animations)}
                      />
                    </ResponsiveLineStackLayout>
                  ) : (
                    <FlatButtonWithSplitMenu
                      label={<Trans>Edit collision masks</Trans>}
                      onClick={() => setCollisionMasksEditorOpen(true)}
                      disabled={!hasAnyFrame(animations)}
                      buildMenuTemplate={i18n => [
                        {
                          label: i18n._(t`Edit points`),
                          disabled: !hasAnyFrame(animations),
                          click: () => setPointsEditorOpen(true),
                        },
                      ]}
                    />
                  )}
                  <RaisedButton
                    label={<Trans>Add an animation</Trans>}
                    primary
                    onClick={() => {
                      if (!animationList.current) {
                        return;
                      }
                      animationList.current.addAnimation();
                    }}
                    icon={<Add />}
                  />
                </ResponsiveLineStackLayout>
              </Column>
            )}
          {pointsEditorOpen && (
            <Dialog
              title={<Trans>Edit points</Trans>}
              actions={[
                <FlatButton
                  key="close"
                  label={<Trans>Close</Trans>}
                  primary
                  onClick={() => setPointsEditorOpen(false)}
                />,
              ]}
              secondaryActions={[
                <HelpButton
                  helpPagePath="/objects/sprite/edit-points"
                  key="help"
                />,
              ]}
              onRequestClose={() => setPointsEditorOpen(false)}
              maxWidth="lg"
              flexBody
              fullHeight
              open={pointsEditorOpen}
            >
              <PointsEditor
                animations={animations}
                resourcesLoader={ResourcesLoader}
                project={project}
                onPointsUpdated={onObjectUpdated}
                onRenamedPoint={(oldName, newName) =>
                  // TODO EBO Refactor event-based object events when a point is renamed.
                  layout &&
                  object &&
                  gd.WholeProjectRefactorer.renameObjectPoint(
                    project,
                    layout,
                    object,
                    oldName,
                    newName
                  )
                }
              />
            </Dialog>
          )}
          {collisionMasksEditorOpen && (
            <Dialog
              title={<Trans>Edit collision masks</Trans>}
              actions={[
                <FlatButton
                  key="close"
                  label={<Trans>Close</Trans>}
                  primary
                  onClick={() => setCollisionMasksEditorOpen(false)}
                />,
              ]}
              secondaryActions={[
                <HelpButton
                  helpPagePath="/objects/sprite/collision-mask"
                  key="help"
                />,
              ]}
              maxWidth="lg"
              flexBody
              fullHeight
              onRequestClose={() => setCollisionMasksEditorOpen(false)}
              open={collisionMasksEditorOpen}
            >
              <CollisionMasksEditor
                animations={animations}
                resourcesLoader={ResourcesLoader}
                project={project}
                onMasksUpdated={onObjectUpdated}
                onCreateMatchingSpriteCollisionMask={
                  onCreateMatchingSpriteCollisionMask
                }
              />
            </Dialog>
          )}
        </>
      )}
    </I18n>
  );
};

export default CustomObjectPropertiesEditor;
