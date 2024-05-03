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
  listObjectBehaviorsTypes,
} from '../Utils/Behavior';
import { sendBehaviorAdded } from '../Utils/Analytics/EventSender';
import ElementWithMenu from '../UI/Menu/ElementWithMenu';
import ThreeDotsMenu from '../UI/CustomSvgIcons/ThreeDotsMenu';
import Trash from '../UI/CustomSvgIcons/Trash';
import Add from '../UI/CustomSvgIcons/Add';
import { mapVector } from '../Utils/MapFor';
import Clipboard, { SafeExtractor } from '../Utils/Clipboard';
import {
  serializeToJSObject,
  unserializeFromJSObject,
} from '../Utils/Serializer';
import useAlertDialog from '../UI/Alert/useAlertDialog';
import PasteIcon from '../UI/CustomSvgIcons/Clipboard';
import CopyIcon from '../UI/CustomSvgIcons/Copy';
import ResponsiveFlatButton from '../UI/ResponsiveFlatButton';
import { useResponsiveWindowSize } from '../UI/Responsive/ResponsiveWindowMeasurer';

const gd: libGDevelop = global.gd;

const BEHAVIORS_CLIPBOARD_KIND = 'Behaviors';

export const useBehaviorOverridingAlertDialog = () => {
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
  object: gdObject,
  behavior: gdBehavior,
  resourceManagementProps: ResourceManagementProps,
  onBehaviorsUpdated: () => void,
  onChangeBehaviorName: (behavior: gdBehavior, newName: string) => void,
  onRemoveBehavior: (behaviorName: string) => void,
  copyBehavior: (behaviorName: string) => void,
  canPasteBehaviors: boolean,
  pasteBehaviors: () => Promise<void>,
  openExtension: (behaviorType: string) => void,
|};

const BehaviorConfigurationEditor = React.forwardRef<
  BehaviorConfigurationEditorProps,
  BehaviorConfigurationEditorInterface
>(
  (
    {
      project,
      object,
      behavior,
      resourceManagementProps,
      onBehaviorsUpdated,
      onChangeBehaviorName,
      onRemoveBehavior,
      copyBehavior,
      canPasteBehaviors,
      pasteBehaviors,
      openExtension,
    },
    ref
  ) => {
    const { values } = React.useContext(PreferencesContext);
    const forceUpdate = useForceUpdate();
    const behaviorName = behavior.getName();
    const behaviorTypeName = behavior.getTypeName();

    if (behavior.isDefaultBehavior()) {
      return null;
    }

    const expanded = !behavior.isFolded();

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
          behavior.setFolded(!newExpanded);
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
                },
                {
                  label: i18n._(t`Copy`),
                  click: () => copyBehavior(behaviorName),
                },
                {
                  label: i18n._(t`Paste`),
                  click: pasteBehaviors,
                  enabled: canPasteBehaviors,
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
              onChange={(e, text) => onChangeBehaviorName(behavior, text)}
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
                behavior={behavior}
                project={project}
                object={object}
                resourceManagementProps={resourceManagementProps}
                onBehaviorUpdated={onBehaviorsUpdated}
              />
            </Line>
          </Column>
        </AccordionBody>
      </Accordion>
    );
  }
);

type Props = {|
  project: gdProject,
  eventsFunctionsExtension?: gdEventsFunctionsExtension,
  object: gdObject,
  onUpdateBehaviorsSharedData: () => void,
  onSizeUpdated?: ?() => void,
  resourceManagementProps: ResourceManagementProps,
  onBehaviorsUpdated: () => void,
  openBehaviorEvents: (
    extensionName: string,
    behaviorName: string
  ) => Promise<void>,
|};

const BehaviorsEditor = (props: Props) => {
  const { isMobile } = useResponsiveWindowSize();
  const scrollView = React.useRef<?ScrollViewInterface>(null);
  const [
    justAddedBehaviorName,
    setJustAddedBehaviorName,
  ] = React.useState<?string>(null);
  const justAddedBehaviorAccordionElement = React.useRef<?BehaviorConfigurationEditorInterface>(
    null
  );

  React.useEffect(
    () => {
      if (
        scrollView.current &&
        justAddedBehaviorAccordionElement.current &&
        justAddedBehaviorName
      ) {
        scrollView.current.scrollTo(justAddedBehaviorAccordionElement.current);
        setJustAddedBehaviorName(null);
        justAddedBehaviorAccordionElement.current = null;
      }
    },
    [justAddedBehaviorName]
  );

  const [newBehaviorDialogOpen, setNewBehaviorDialogOpen] = React.useState(
    false
  );

  const showBehaviorOverridingConfirmation = useBehaviorOverridingAlertDialog();

  const {
    object,
    project,
    eventsFunctionsExtension,
    onSizeUpdated,
    onBehaviorsUpdated,
    onUpdateBehaviorsSharedData,
    openBehaviorEvents,
  } = props;
  // As for now, any default behavior is hidden,
  // it avoids to get behavior metadata to check the "hidden" flag.
  const allVisibleBehaviors = object
    .getAllBehaviorNames()
    .toJSArray()
    .map(behaviorName => object.getBehavior(behaviorName))
    .filter(behavior => !behavior.isDefaultBehavior());
  const forceUpdate = useForceUpdate();

  const addBehavior = React.useCallback(
    (type: string, defaultName: string) => {
      const wasBehaviorAdded = addBehaviorToObject(
        project,
        object,
        type,
        defaultName
      );

      if (wasBehaviorAdded) {
        setNewBehaviorDialogOpen(false);
        sendBehaviorAdded({
          behaviorType: type,
          parentEditor: 'behaviors-editor',
        });
        setJustAddedBehaviorName(defaultName);
      }

      forceUpdate();
      if (onSizeUpdated) onSizeUpdated();
      onUpdateBehaviorsSharedData();
      if (onBehaviorsUpdated) onBehaviorsUpdated();
    },
    [
      forceUpdate,
      object,
      onBehaviorsUpdated,
      onSizeUpdated,
      onUpdateBehaviorsSharedData,
      project,
    ]
  );

  const onChangeBehaviorName = React.useCallback(
    (behavior: gdBehavior, newName: string) => {
      // TODO: This is disabled for now as there is no proper refactoring
      // of events after a behavior renaming. Once refactoring is available,
      // the text field can be enabled again and refactoring calls added here
      // (or in a parent).
      // Renaming a behavior is something that is really rare anyway! :)

      if (object.hasBehaviorNamed(newName)) return;
      object.renameBehavior(behavior.getName(), newName);
      forceUpdate();
      if (onBehaviorsUpdated) onBehaviorsUpdated();
    },
    [forceUpdate, object, onBehaviorsUpdated]
  );

  const onRemoveBehavior = React.useCallback(
    (behaviorName: string) => {
      let message =
        "Are you sure you want to remove this behavior? This can't be undone.";
      const dependentBehaviors = gd.WholeProjectRefactorer.findDependentBehaviorNames(
        project,
        object,
        behaviorName
      ).toJSArray();
      if (dependentBehaviors.length > 0) {
        message +=
          '\nDependent behaviors will be removed too: ' +
          dependentBehaviors.join(', ');
      }
      const answer = Window.showConfirmDialog(message);

      if (answer) {
        object.removeBehavior(behaviorName);
        dependentBehaviors.forEach(name => object.removeBehavior(name));
        if (onSizeUpdated) onSizeUpdated();
      }
      if (onBehaviorsUpdated) onBehaviorsUpdated();
    },
    [object, onBehaviorsUpdated, onSizeUpdated, project]
  );

  const copyBehavior = React.useCallback(
    (behaviorName: string) => {
      const behavior = object.getBehavior(behaviorName);
      Clipboard.set(BEHAVIORS_CLIPBOARD_KIND, [
        {
          name: behaviorName,
          type: behavior.getTypeName(),
          serializedBehavior: serializeToJSObject(behavior),
        },
      ]);
      forceUpdate();
    },
    [forceUpdate, object]
  );

  const copyAllBehaviors = React.useCallback(
    () => {
      Clipboard.set(
        BEHAVIORS_CLIPBOARD_KIND,
        mapVector(object.getAllBehaviorNames(), behaviorName => {
          const behavior = object.getBehavior(behaviorName);
          if (behavior.isDefaultBehavior()) {
            return null;
          }
          return {
            name: behaviorName,
            type: behavior.getTypeName(),
            serializedBehavior: serializeToJSObject(behavior),
          };
        }).filter(Boolean)
      );
      forceUpdate();
    },
    [forceUpdate, object]
  );

  const pasteBehaviors = React.useCallback(
    async () => {
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

        const behaviorMetadata = gd.MetadataProvider.getBehaviorMetadata(
          project.getCurrentPlatform(),
          type
        );
        if (
          behaviorMetadata.getObjectType() !== '' &&
          behaviorMetadata.getObjectType() !== object.getType()
        ) {
          return;
        }

        if (object.hasBehaviorNamed(name)) {
          const existingBehavior = object.getBehavior(name);
          if (existingBehavior.getTypeName() !== type) {
            return;
          }
          existingNamedBehaviors.push({ name, type, serializedBehavior });
          existingBehaviorFullNames.push(behaviorMetadata.getFullName());
        } else {
          newNamedBehaviors.push({ name, type, serializedBehavior });
        }
      });

      let firstAddedBehaviorName: string | null = null;
      newNamedBehaviors.forEach(({ name, type, serializedBehavior }) => {
        object.addNewBehavior(project, type, name);
        if (object.hasBehaviorNamed(name)) {
          if (!firstAddedBehaviorName) {
            firstAddedBehaviorName = name;
          }
          const behavior = object.getBehavior(name);
          unserializeFromJSObject(behavior, serializedBehavior);
        }
      });
      // Add missing required behaviors as a 2nd step because these behaviors
      // could have been in the array.
      newNamedBehaviors.forEach(({ name }) => {
        gd.WholeProjectRefactorer.addRequiredBehaviorsFor(
          project,
          object,
          name
        );
      });

      let shouldOverrideBehaviors = false;
      if (existingNamedBehaviors.length > 0) {
        shouldOverrideBehaviors = await showBehaviorOverridingConfirmation(
          existingBehaviorFullNames
        );

        if (shouldOverrideBehaviors) {
          existingNamedBehaviors.forEach(
            ({ name, type, serializedBehavior }) => {
              if (object.hasBehaviorNamed(name)) {
                const behavior = object.getBehavior(name);
                // Property values can be replaced directly because the type has been check earlier.
                unserializeFromJSObject(behavior, serializedBehavior);
              }
            }
          );
        }
      }

      forceUpdate();
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
      forceUpdate,
      object,
      onBehaviorsUpdated,
      onSizeUpdated,
      onUpdateBehaviorsSharedData,
      project,
      showBehaviorOverridingConfirmation,
    ]
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

  const isClipboardContainingBehaviors = Clipboard.has(
    BEHAVIORS_CLIPBOARD_KIND
  );

  return (
    <Column noMargin expand useFullHeight noOverflowParent>
      {allVisibleBehaviors.length === 0 ? (
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
            onAction={() => setNewBehaviorDialogOpen(true)}
            secondaryActionIcon={<PasteIcon />}
            secondaryActionLabel={
              isClipboardContainingBehaviors ? <Trans>Paste</Trans> : null
            }
            onSecondaryAction={() => {
              pasteBehaviors();
            }}
          />
        </Column>
      ) : (
        <React.Fragment>
          <ScrollView ref={scrollView}>
            {allVisibleBehaviors.map((behavior, index) => {
              const behaviorName = behavior.getName();

              const ref =
                justAddedBehaviorName === behaviorName
                  ? justAddedBehaviorAccordionElement
                  : null;

              return (
                <BehaviorConfigurationEditor
                  ref={ref}
                  key={behaviorName}
                  project={project}
                  object={object}
                  behavior={behavior}
                  copyBehavior={copyBehavior}
                  onRemoveBehavior={onRemoveBehavior}
                  onBehaviorsUpdated={onBehaviorsUpdated}
                  onChangeBehaviorName={onChangeBehaviorName}
                  openExtension={openExtension}
                  canPasteBehaviors={isClipboardContainingBehaviors}
                  pasteBehaviors={pasteBehaviors}
                  resourceManagementProps={props.resourceManagementProps}
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
                  disabled={!isClipboardContainingBehaviors}
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
                  onClick={() => setNewBehaviorDialogOpen(true)}
                  icon={<Add />}
                  id="add-behavior-button"
                />
              </LineStackLayout>
            </LineStackLayout>
          </Column>
        </React.Fragment>
      )}

      {newBehaviorDialogOpen && (
        <NewBehaviorDialog
          open={newBehaviorDialogOpen}
          objectType={object.getType()}
          objectBehaviorsTypes={listObjectBehaviorsTypes(object)}
          onClose={() => setNewBehaviorDialogOpen(false)}
          onChoose={addBehavior}
          project={project}
          eventsFunctionsExtension={eventsFunctionsExtension}
        />
      )}
    </Column>
  );
};

export default BehaviorsEditor;
