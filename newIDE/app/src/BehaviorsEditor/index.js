// @flow
import { Trans } from '@lingui/macro';
import { t } from '@lingui/macro';
import { type I18n as I18nType } from '@lingui/core';
import * as React from 'react';
import TextField from '../UI/TextField';
import IconButton from '../UI/IconButton';
import EmptyMessage from '../UI/EmptyMessage';
import { MiniToolbarText } from '../UI/MiniToolbar';
import HelpIcon from '../UI/HelpIcon';
import NewBehaviorDialog from './NewBehaviorDialog';
import BehaviorsEditorService from './BehaviorsEditorService';
import Window from '../Utils/Window';
import { Column, Line } from '../UI/Grid';
import RaisedButton from '../UI/RaisedButton';
import { type ResourceManagementProps } from '../ResourcesList/ResourceSource';
import DismissableTutorialMessage from '../Hints/DismissableTutorialMessage';
import { ColumnStackLayout } from '../UI/Layout';
import { LineStackLayout } from '../UI/Layout';
import useForceUpdate from '../Utils/UseForceUpdate';
import { Accordion, AccordionHeader, AccordionBody } from '../UI/Accordion';
import { EmptyPlaceholder } from '../UI/EmptyPlaceholder';
import PreferencesContext from '../MainFrame/Preferences/PreferencesContext';
import ScrollView, { type ScrollViewInterface } from '../UI/ScrollView';
import { IconContainer } from '../UI/IconContainer';
import { getBehaviorTutorialIds } from '../Utils/GDevelopServices/Tutorial';
import {
  addBehaviorToObject,
  listObjectsBehaviorsTypes,
} from '../Utils/Behavior';
import { sendBehaviorAdded } from '../Utils/Analytics/EventSender';
import ElementWithMenu from '../UI/Menu/ElementWithMenu';
import ThreeDotsMenu from '../UI/CustomSvgIcons/ThreeDotsMenu';
import Trash from '../UI/CustomSvgIcons/Trash';
import Add from '../UI/CustomSvgIcons/Add';
import Clipboard from '../Utils/Clipboard';
import { SafeExtractor } from '../Utils/SafeExtractor';
import {
  serializeToJSObject,
  unserializeFromJSObject,
} from '../Utils/Serializer';
import useAlertDialog from '../UI/Alert/useAlertDialog';
import PasteIcon from '../UI/CustomSvgIcons/Clipboard';
import CopyIcon from '../UI/CustomSvgIcons/Copy';
import ResponsiveFlatButton from '../UI/ResponsiveFlatButton';
import { useResponsiveWindowSize } from '../UI/Responsive/ResponsiveWindowMeasurer';
import QuickCustomizationPropertiesVisibilityDialog from '../QuickCustomization/QuickCustomizationPropertiesVisibilityDialog';
import Text from '../UI/Text';
import { ProjectScopedContainersAccessor } from '../InstructionOrExpression/EventsScope';
import { getAllVisibleBehaviorNames } from '../Utils/Behavior';

const gd: libGDevelop = global.gd;

const BEHAVIORS_CLIPBOARD_KIND = 'Behaviors';

export const useBehaviorOverridingAlertDialog = (): ((
  existingBehaviorNames: Array<string>
) => Promise<boolean>) => {
  const { showConfirmation } = useAlertDialog();
  return async (existingBehaviorNames: Array<string>): Promise<boolean> => {
    return await showConfirmation({
      title: t`Existing behaviors`,
      message: t`These behaviors are already attached to the object:${'\n\n - ' +
        existingBehaviorNames.join('\n\n - ') +
        '\n\n'}Do you want to replace their property values?`,
      confirmButtonLabel: t`Replace`,
      dismissButtonLabel: t`Omit`,
    });
  };
};

type BehaviorConfigurationEditorInterface = {||};
type BehaviorConfigurationEditorProps = {|
  project: gdProject,
  object: gdObject | null,
  behaviors: Array<gdBehavior>,
  isChildObject: boolean,
  resourceManagementProps: ResourceManagementProps,
  projectScopedContainersAccessor: ProjectScopedContainersAccessor,
  onBehaviorsUpdated: () => void,
  onChangeBehaviorName: (behavior: gdBehavior, newName: string) => void,
  onRemoveBehavior: (behaviorName: string) => void,
  copyBehavior: (behaviorName: string) => void,
  canPasteBehaviors: boolean,
  pasteBehaviors: () => Promise<void>,
  openExtension: (behaviorType: string) => void,
  openBehaviorPropertiesQuickCustomizationDialog: (
    behaviorName: string
  ) => void,
  isListLocked: boolean,
  layersContainer: gdLayersContainer,
|};

const BehaviorConfigurationEditor = React.forwardRef<
  BehaviorConfigurationEditorProps,
  BehaviorConfigurationEditorInterface
>(
  (
    {
      project,
      object,
      behaviors,
      isChildObject,
      resourceManagementProps,
      projectScopedContainersAccessor,
      onBehaviorsUpdated,
      onChangeBehaviorName,
      onRemoveBehavior,
      copyBehavior,
      canPasteBehaviors,
      pasteBehaviors,
      openExtension,
      openBehaviorPropertiesQuickCustomizationDialog,
      isListLocked,
      layersContainer,
    },
    ref
  ) => {
    const { values } = React.useContext(PreferencesContext);
    const forceUpdate = useForceUpdate();

    if (behaviors.length === 0) {
      return null;
    }
    const behaviorName = behaviors[0].getName();
    const behaviorTypeName = behaviors[0].getTypeName();

    if (behaviors[0].isDefaultBehavior()) {
      return null;
    }

    const expanded = !behaviors[0].isFolded();

    const behaviorMetadata = gd.MetadataProvider.getBehaviorMetadata(
      gd.JsPlatform.get(),
      behaviorTypeName
    );
    if (gd.MetadataProvider.isBadBehaviorMetadata(behaviorMetadata)) {
      return (
        <Accordion
          defaultExpanded
          id={`behavior-parameters-${behaviorName}`}
          ref={ref}
        >
          <AccordionHeader
            actions={[
              <IconButton
                key="delete"
                onClick={ev => {
                  ev.stopPropagation();
                  onRemoveBehavior(behaviorName);
                }}
              >
                <Trash />
              </IconButton>,
            ]}
          >
            <MiniToolbarText firstChild>
              <Trans>Unknown behavior</Trans>{' '}
            </MiniToolbarText>
            <Column noMargin expand>
              <TextField margin="none" value={behaviorName} disabled />
            </Column>
          </AccordionHeader>
          <AccordionBody>
            <EmptyMessage>
              <Trans>
                This behavior is unknown. It might be a behavior that was
                defined in an extension and that was later removed. You should
                delete it.
              </Trans>
            </EmptyMessage>
          </AccordionBody>
        </Accordion>
      );
    }

    const BehaviorComponent = BehaviorsEditorService.getEditor(
      behaviorTypeName
    );
    const tutorialIds = getBehaviorTutorialIds(behaviorTypeName);
    const enabledTutorialIds = tutorialIds.filter(
      tutorialId => !values.hiddenTutorialHints[tutorialId]
    );
    const iconUrl = behaviorMetadata.getIconFilename();

    return (
      <Accordion
        expanded={expanded}
        onChange={(_, newExpanded) => {
          behaviors[0].setFolded(!newExpanded);
          forceUpdate();
        }}
        id={`behavior-parameters-${behaviorName}`}
        ref={ref}
      >
        <AccordionHeader
          actions={[
            <HelpIcon
              key="help"
              size="small"
              helpPagePath={behaviorMetadata.getHelpPath()}
            />,
            <ElementWithMenu
              key="menu"
              element={
                <IconButton size="small">
                  <ThreeDotsMenu />
                </IconButton>
              }
              buildMenuTemplate={(i18n: I18nType) => [
                {
                  label: i18n._(t`Delete`),
                  click: () => onRemoveBehavior(behaviorName),
                  enabled: !isListLocked,
                },
                {
                  label: i18n._(t`Copy`),
                  click: () => copyBehavior(behaviorName),
                },
                {
                  label: i18n._(t`Paste`),
                  click: pasteBehaviors,
                  // TODO Allow to paste behaviors that are already in the list.
                  enabled: canPasteBehaviors && !isListLocked,
                },
                ...(project.hasEventsBasedBehavior(behaviorTypeName)
                  ? [
                      { type: 'separator' },
                      {
                        label: i18n._(t`Edit this behavior`),
                        click: () => openExtension(behaviorTypeName),
                      },
                    ]
                  : []),
                ...(!Window.isDev()
                  ? []
                  : [
                      { type: 'separator' },
                      {
                        label: i18n._(t`Quick Customization settings`),
                        click: () =>
                          openBehaviorPropertiesQuickCustomizationDialog(
                            behaviorName
                          ),
                      },
                    ]),
              ]}
            />,
          ]}
        >
          {iconUrl ? (
            <IconContainer
              src={iconUrl}
              alt={behaviorMetadata.getFullName()}
              size={20}
            />
          ) : null}
          <Column expand>
            <TextField
              value={behaviorName}
              translatableHintText={t`Behavior name`}
              margin="none"
              fullWidth
              disabled
              onChange={(e, text) => {
                if (behaviors.length === 1) {
                  onChangeBehaviorName(behaviors[0], text);
                }
              }}
              id={`behavior-${behaviorName}-name-text-field`}
            />
          </Column>
        </AccordionHeader>
        <AccordionBody>
          <Column
            expand
            noMargin
            // Avoid Physics2 behavior overflow on small screens
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
              <BehaviorComponent
                behaviors={behaviors}
                project={project}
                object={object}
                layersContainer={layersContainer}
                resourceManagementProps={resourceManagementProps}
                projectScopedContainersAccessor={
                  projectScopedContainersAccessor
                }
                onBehaviorUpdated={onBehaviorsUpdated}
              />
            </Line>
          </Column>
        </AccordionBody>
      </Accordion>
    );
  }
);

type UseManageBehaviorsState = {|
  // Operations:
  changeBehaviorName: (behavior: gdBehavior, newName: string) => void,
  removeBehavior: (behaviorName: string) => void,
  copyBehavior: (behaviorName: string) => void,
  copyAllBehaviors: () => void,
  pasteBehaviors: () => Promise<void>,
  openNewBehaviorDialog: () => void,
  resetJustAddedBehaviorName: () => void,

  // Visual state:
  newBehaviorDialog: React.Node,
  justAddedBehaviorName: ?string,
|};

/**
 * A hook allowing to add/remove/modify behaviors of an object.
 */
export const useManageObjectBehaviors = ({
  project,
  projectScopedContainersAccessor,
  objects,
  isChildObject,
  eventsFunctionsExtension,
  onUpdate,
  onSizeUpdated,
  onBehaviorsUpdated,
  onUpdateBehaviorsSharedData,
  onWillInstallExtension,
  onExtensionInstalled,
  allVisibleBehaviorNames,
}: {
  project: gdProject,
  projectScopedContainersAccessor: ProjectScopedContainersAccessor,
  objects: Array<gdObject>,
  isChildObject: boolean,
  eventsFunctionsExtension: gdEventsFunctionsExtension | null,
  onUpdate: () => void,
  onSizeUpdated?: ?() => void,
  onBehaviorsUpdated?: ?() => void,
  onUpdateBehaviorsSharedData: () => void,
  onWillInstallExtension: (extensionNames: Array<string>) => void,
  onExtensionInstalled: (extensionNames: Array<string>) => void,
  allVisibleBehaviorNames: Array<string>,
}): UseManageBehaviorsState => {
  const [
    justAddedBehaviorName,
    setJustAddedBehaviorName,
  ] = React.useState<?string>(null);
  const [newBehaviorDialogOpen, setNewBehaviorDialogOpen] = React.useState(
    false
  );

  const openNewBehaviorDialog = React.useCallback(() => {
    setNewBehaviorDialogOpen(true);
  }, []);

  const showBehaviorOverridingConfirmation = useBehaviorOverridingAlertDialog();

  const addBehavior = React.useCallback(
    (type: string, defaultName: string) => {
      let wasAnyBehaviorAdded = false;
      for (const object of objects) {
        const wasBehaviorAdded = addBehaviorToObject(
          project,
          object,
          type,
          defaultName,
          /* shouldSkipExistingBehaviorSilently= */ objects.length > 1
        );
        wasAnyBehaviorAdded ||= wasBehaviorAdded;
      }

      if (wasAnyBehaviorAdded) {
        setNewBehaviorDialogOpen(false);
        sendBehaviorAdded({
          behaviorType: type,
          parentEditor: 'behaviors-editor',
        });
        setJustAddedBehaviorName(defaultName);
      }

      onUpdate();
      if (onSizeUpdated) onSizeUpdated();
      onUpdateBehaviorsSharedData();
      if (onBehaviorsUpdated) onBehaviorsUpdated();
    },
    [
      onUpdate,
      objects,
      onBehaviorsUpdated,
      onSizeUpdated,
      onUpdateBehaviorsSharedData,
      project,
    ]
  );

  const changeBehaviorName = React.useCallback(
    (behavior: gdBehavior, newName: string) => {
      for (const object of objects) {
        // TODO: This is disabled for now as there is no proper refactoring
        // of events after a behavior renaming. Once refactoring is available,
        // the text field can be enabled again and refactoring calls added here
        // (or in a parent).
        // Renaming a behavior is something that is really rare anyway! :)

        if (object.hasBehaviorNamed(newName)) return;
        // TODO Add a refactor operation to update the behavior name in overridings of object instances
        object.renameBehavior(behavior.getName(), newName);
      }
      onUpdate();
      if (onBehaviorsUpdated) onBehaviorsUpdated();
    },
    [onUpdate, objects, onBehaviorsUpdated]
  );

  const removeBehavior = React.useCallback(
    (behaviorName: string) => {
      let message =
        "Are you sure you want to remove this behavior? This can't be undone.";
      const allDependentBehaviorsSet = new Set<string>();
      for (const object of objects) {
        const dependentBehaviors = gd.WholeProjectRefactorer.findDependentBehaviorNames(
          project,
          object,
          behaviorName
        ).toJSArray();
        for (const dependentBehavior of dependentBehaviors) {
          allDependentBehaviorsSet.add(dependentBehavior);
        }
      }
      const allDependentBehaviors = [...allDependentBehaviorsSet];
      if (allDependentBehaviors.length > 0) {
        message +=
          '\nDependent behaviors will be removed too: ' +
          [...allDependentBehaviors].join(', ');
      }
      const answer = Window.showConfirmDialog(message);

      if (answer) {
        for (const object of objects) {
          // TODO Add a refactor operation to remove the behavior overridings in object instances
          object.removeBehavior(behaviorName);
          for (const behaviorName of allDependentBehaviors) {
            object.removeBehavior(behaviorName);
          }
        }
        if (onSizeUpdated) onSizeUpdated();
      }
      if (onBehaviorsUpdated) onBehaviorsUpdated();
    },
    [objects, onBehaviorsUpdated, onSizeUpdated, project]
  );

  const copyBehavior = React.useCallback(
    (behaviorName: string) => {
      const object = objects[0];
      if (!object) {
        return;
      }
      const behavior = object.getBehavior(behaviorName);
      Clipboard.set(BEHAVIORS_CLIPBOARD_KIND, [
        {
          name: behaviorName,
          type: behavior.getTypeName(),
          serializedBehavior: serializeToJSObject(behavior),
        },
      ]);
      onUpdate();
    },
    [onUpdate, objects]
  );

  const copyAllBehaviors = React.useCallback(
    () => {
      const object = objects[0];
      if (!object) {
        return;
      }
      Clipboard.set(
        BEHAVIORS_CLIPBOARD_KIND,
        allVisibleBehaviorNames
          .map(behaviorName => {
            const behavior = object.getBehavior(behaviorName);
            if (behavior.isDefaultBehavior()) {
              return null;
            }
            return {
              name: behaviorName,
              type: behavior.getTypeName(),
              serializedBehavior: serializeToJSObject(behavior),
            };
          })
          .filter(Boolean)
      );
      onUpdate();
    },
    [objects, allVisibleBehaviorNames, onUpdate]
  );

  const pasteBehaviors = React.useCallback(
    async () => {
      if (objects.length === 0) {
        return;
      }
      const clipboardContent = Clipboard.get(BEHAVIORS_CLIPBOARD_KIND);
      const behaviorContents = SafeExtractor.extractArray(clipboardContent);
      if (!behaviorContents) return;

      const newNamedBehaviors: Array<{
        name: string,
        type: string,
        serializedBehavior: string,
      }> = [];
      const existingNamedBehaviors: Array<{
        name: string,
        type: string,
        serializedBehavior: string,
      }> = [];
      const existingBehaviorFullNames: Array<string> = [];
      behaviorContents.forEach(behaviorContent => {
        const name = SafeExtractor.extractStringProperty(
          behaviorContent,
          'name'
        );
        const type = SafeExtractor.extractStringProperty(
          behaviorContent,
          'type'
        );
        const serializedBehavior = SafeExtractor.extractObjectProperty(
          behaviorContent,
          'serializedBehavior'
        );
        if (!name || !type || !serializedBehavior) {
          return;
        }

        for (const object of objects) {
          if (
            !gd.ObjectTools.isBehaviorCompatibleWithObject(
              project.getCurrentPlatform(),
              object.getType(),
              type
            )
          ) {
            return;
          }
        }

        if (objects.every(object => object.hasBehaviorNamed(name))) {
          const existingBehavior = objects[0].getBehavior(name);
          if (existingBehavior.getTypeName() !== type) {
            return;
          }
          const behaviorMetadata = gd.MetadataProvider.getBehaviorMetadata(
            project.getCurrentPlatform(),
            type
          );
          existingNamedBehaviors.push({ name, type, serializedBehavior });
          existingBehaviorFullNames.push(behaviorMetadata.getFullName());
        } else {
          newNamedBehaviors.push({ name, type, serializedBehavior });
        }
      });

      let firstAddedBehaviorName: string | null = null;
      newNamedBehaviors.forEach(({ name, type, serializedBehavior }) => {
        for (const object of objects) {
          object.addNewBehavior(project, type, name);
          if (object.hasBehaviorNamed(name)) {
            if (!firstAddedBehaviorName) {
              firstAddedBehaviorName = name;
            }
            const behavior = object.getBehavior(name);
            unserializeFromJSObject(behavior, serializedBehavior);
          }
        }
      });
      for (const object of objects) {
        // Add missing required behaviors as a 2nd step because these behaviors
        // could have been in the array.
        newNamedBehaviors.forEach(({ name }) => {
          gd.WholeProjectRefactorer.addRequiredBehaviorsFor(
            project,
            object,
            name
          );
        });
      }

      let shouldOverrideBehaviors = false;
      if (existingNamedBehaviors.length > 0) {
        shouldOverrideBehaviors = await showBehaviorOverridingConfirmation(
          existingBehaviorFullNames
        );

        if (shouldOverrideBehaviors) {
          existingNamedBehaviors.forEach(
            ({ name, type, serializedBehavior }) => {
              for (const object of objects) {
                if (object.hasBehaviorNamed(name)) {
                  const behavior = object.getBehavior(name);
                  // Property values can be replaced directly because the type has been check earlier.
                  unserializeFromJSObject(behavior, serializedBehavior);
                }
              }
            }
          );
        }
      }

      onUpdate();
      if (firstAddedBehaviorName) {
        setJustAddedBehaviorName(firstAddedBehaviorName);
        if (onSizeUpdated) onSizeUpdated();
        onUpdateBehaviorsSharedData();
      } else if (existingNamedBehaviors.length === 1) {
        setJustAddedBehaviorName(existingNamedBehaviors[0].name);
      }
      if (firstAddedBehaviorName || shouldOverrideBehaviors) {
        if (onBehaviorsUpdated) onBehaviorsUpdated();
      }
    },
    [
      onUpdate,
      objects,
      onBehaviorsUpdated,
      onSizeUpdated,
      onUpdateBehaviorsSharedData,
      project,
      showBehaviorOverridingConfirmation,
    ]
  );

  const objectType = React.useMemo(
    () => {
      let type = null;
      for (const object of objects) {
        const objectType = projectScopedContainersAccessor
          .get()
          .getObjectsContainersList()
          .getTypeOfObject(object.getName());
        if (type === null || objectType === type) {
          type = objectType;
        } else {
          return '';
        }
      }
      return type || '';
    },
    [objects, projectScopedContainersAccessor]
  );

  const newBehaviorDialog = newBehaviorDialogOpen && (
    <NewBehaviorDialog
      open
      objectType={objectType}
      objectBehaviorsTypes={listObjectsBehaviorsTypes(objects)}
      isChildObject={isChildObject}
      onClose={() => setNewBehaviorDialogOpen(false)}
      onChoose={addBehavior}
      project={project}
      eventsFunctionsExtension={eventsFunctionsExtension}
      onWillInstallExtension={onWillInstallExtension}
      onExtensionInstalled={onExtensionInstalled}
      shouldShowCapabilityBehaviors={false}
    />
  );

  const resetJustAddedBehaviorName = React.useCallback(() => {
    setJustAddedBehaviorName(null);
  }, []);

  return {
    changeBehaviorName,
    removeBehavior,
    copyBehavior,
    copyAllBehaviors,
    pasteBehaviors,
    newBehaviorDialog,
    openNewBehaviorDialog,
    justAddedBehaviorName,
    resetJustAddedBehaviorName,
  };
};

type Props = {|
  project: gdProject,
  eventsFunctionsExtension: gdEventsFunctionsExtension | null,
  objects: Array<gdObject>,
  layersContainer: gdLayersContainer,
  isChildObject: boolean,
  onUpdateBehaviorsSharedData: () => void,
  onSizeUpdated?: ?() => void,
  resourceManagementProps: ResourceManagementProps,
  projectScopedContainersAccessor: ProjectScopedContainersAccessor,
  onBehaviorsUpdated: () => void,
  openBehaviorEvents: (
    extensionName: string,
    behaviorName: string
  ) => Promise<void>,
  onWillInstallExtension: (extensionNames: Array<string>) => void,
  onExtensionInstalled: (extensionNames: Array<string>) => void,
  isListLocked: boolean,
|};

const BehaviorsEditor = (props: Props): React.Node => {
  const { isMobile } = useResponsiveWindowSize();
  const scrollView = React.useRef<?ScrollViewInterface>(null);
  const justAddedBehaviorAccordionElement = React.useRef<?BehaviorConfigurationEditorInterface>(
    null
  );

  const {
    objects,
    isChildObject,
    project,
    projectScopedContainersAccessor,
    eventsFunctionsExtension,
    layersContainer,
    onSizeUpdated,
    onBehaviorsUpdated,
    onUpdateBehaviorsSharedData,
    openBehaviorEvents,
    onWillInstallExtension,
    onExtensionInstalled,
    isListLocked,
  } = props;
  const forceUpdate = useForceUpdate();

  const [
    selectedQuickCustomizationPropertiesBehavior,
    setSelectedQuickCustomizationPropertiesBehavior,
  ] = React.useState<?gdBehavior>(null);

  const allVisibleBehaviorNames = getAllVisibleBehaviorNames(objects);
  const {
    changeBehaviorName,
    removeBehavior,
    copyBehavior,
    copyAllBehaviors,
    pasteBehaviors,
    newBehaviorDialog,
    openNewBehaviorDialog,
    justAddedBehaviorName,
    resetJustAddedBehaviorName,
  } = useManageObjectBehaviors({
    project,
    projectScopedContainersAccessor,
    objects,
    isChildObject,
    eventsFunctionsExtension,
    onUpdate: forceUpdate,
    onSizeUpdated,
    onBehaviorsUpdated,
    onUpdateBehaviorsSharedData,
    onWillInstallExtension,
    onExtensionInstalled,
    allVisibleBehaviorNames,
  });

  React.useEffect(
    () => {
      if (
        scrollView.current &&
        justAddedBehaviorAccordionElement.current &&
        justAddedBehaviorName
      ) {
        scrollView.current.scrollTo(justAddedBehaviorAccordionElement.current);
        resetJustAddedBehaviorName();
        justAddedBehaviorAccordionElement.current = null;
      }
    },
    [justAddedBehaviorName, resetJustAddedBehaviorName]
  );

  const openExtension = React.useCallback(
    (behaviorType: string) => {
      const elements = behaviorType.split('::');
      if (elements.length !== 2) {
        return;
      }
      const extensionName = elements[0];
      const behaviorName = elements[1];

      if (
        !extensionName ||
        !project.hasEventsFunctionsExtensionNamed(extensionName)
      ) {
        return;
      }
      openBehaviorEvents(extensionName, behaviorName);
    },
    [openBehaviorEvents, project]
  );

  const openBehaviorPropertiesQuickCustomizationDialog = React.useCallback(
    (behaviorName: string) => {
      const object = objects[0];
      if (!object) {
        return;
      }
      if (!object.hasBehaviorNamed(behaviorName)) return;
      const behavior = object.getBehavior(behaviorName);

      setSelectedQuickCustomizationPropertiesBehavior(behavior);
    },
    [objects]
  );

  const isClipboardContainingBehaviors = Clipboard.has(
    BEHAVIORS_CLIPBOARD_KIND
  );

  return (
    <Column noMargin expand useFullHeight noOverflowParent>
      {allVisibleBehaviorNames.length === 0 ? (
        isListLocked ? (
          <Column noMargin expand justifyContent="center">
            <Text size="block-title" align="center">
              <Trans>No behavior</Trans>
            </Text>
            <Text align="center" noMargin>
              <Trans>There is no behavior to set up for this object.</Trans>
            </Text>
          </Column>
        ) : (
          <Column noMargin expand justifyContent="center">
            <EmptyPlaceholder
              title={<Trans>Add your first behavior</Trans>}
              description={
                <Trans>
                  Behaviors add features to objects in a matter of clicks.
                </Trans>
              }
              helpPagePath="/behaviors"
              tutorialId="intro-behaviors-and-functions"
              actionButtonId="add-behavior-button"
              actionLabel={
                isMobile ? <Trans>Add</Trans> : <Trans>Add a behavior</Trans>
              }
              onAction={openNewBehaviorDialog}
              secondaryActionIcon={<PasteIcon />}
              secondaryActionLabel={
                isClipboardContainingBehaviors ? <Trans>Paste</Trans> : null
              }
              onSecondaryAction={() => {
                pasteBehaviors();
              }}
            />
          </Column>
        )
      ) : (
        <React.Fragment>
          <ScrollView ref={scrollView}>
            {allVisibleBehaviorNames.map((behaviorName, index) => {
              const behaviors = objects.map(object =>
                object.getBehavior(behaviorName)
              );

              const ref =
                justAddedBehaviorName === behaviorName
                  ? justAddedBehaviorAccordionElement
                  : null;

              return (
                <BehaviorConfigurationEditor
                  ref={ref}
                  key={behaviorName}
                  project={project}
                  object={objects.length === 1 ? objects[0] : null}
                  layersContainer={layersContainer}
                  isChildObject={isChildObject}
                  behaviors={behaviors}
                  copyBehavior={copyBehavior}
                  onRemoveBehavior={removeBehavior}
                  onBehaviorsUpdated={onBehaviorsUpdated}
                  onChangeBehaviorName={changeBehaviorName}
                  openExtension={openExtension}
                  openBehaviorPropertiesQuickCustomizationDialog={
                    openBehaviorPropertiesQuickCustomizationDialog
                  }
                  canPasteBehaviors={isClipboardContainingBehaviors}
                  pasteBehaviors={pasteBehaviors}
                  resourceManagementProps={props.resourceManagementProps}
                  projectScopedContainersAccessor={
                    props.projectScopedContainersAccessor
                  }
                  isListLocked={isListLocked}
                />
              );
            })}
          </ScrollView>
          <Column>
            <LineStackLayout noMargin>
              <LineStackLayout expand>
                <ResponsiveFlatButton
                  key={'copy-all-behaviors'}
                  leftIcon={<CopyIcon />}
                  label={
                    isMobile ? (
                      <Trans>Copy all</Trans>
                    ) : (
                      <Trans>Copy all behaviors</Trans>
                    )
                  }
                  onClick={() => {
                    copyAllBehaviors();
                  }}
                />
                <ResponsiveFlatButton
                  key={'paste-behaviors'}
                  leftIcon={<PasteIcon />}
                  label={<Trans>Paste</Trans>}
                  onClick={() => {
                    pasteBehaviors();
                  }}
                  disabled={!isClipboardContainingBehaviors || isListLocked}
                />
              </LineStackLayout>
              <LineStackLayout justifyContent="flex-end" expand>
                <RaisedButton
                  key="add-behavior-line"
                  label={
                    isMobile ? (
                      <Trans>Add</Trans>
                    ) : (
                      <Trans>Add a behavior</Trans>
                    )
                  }
                  primary
                  onClick={openNewBehaviorDialog}
                  icon={<Add />}
                  id="add-behavior-button"
                  disabled={isListLocked}
                />
              </LineStackLayout>
            </LineStackLayout>
          </Column>
        </React.Fragment>
      )}
      {newBehaviorDialog}
      {!!selectedQuickCustomizationPropertiesBehavior && (
        <QuickCustomizationPropertiesVisibilityDialog
          open={!!selectedQuickCustomizationPropertiesBehavior}
          onClose={() => setSelectedQuickCustomizationPropertiesBehavior(null)}
          propertyNames={selectedQuickCustomizationPropertiesBehavior
            .getProperties()
            .keys()
            .toJSArray()}
          propertiesQuickCustomizationVisibilities={selectedQuickCustomizationPropertiesBehavior.getPropertiesQuickCustomizationVisibilities()}
        />
      )}
    </Column>
  );
};

export default BehaviorsEditor;
