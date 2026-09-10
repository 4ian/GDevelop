// @flow
import * as React from 'react';
import { Trans, t } from '@lingui/macro';
import { type UnsavedChanges } from '../MainFrame/UnsavedChangesContext';
import VariablesList, {
  type HistoryHandler,
  type VariablesListInterface,
} from '../VariablesList/VariablesList';
import { type ProjectScopedContainersAccessor } from '../InstructionOrExpression/EventsScope';
import ErrorBoundary from '../UI/ErrorBoundary';
import ScrollView, { type ScrollViewInterface } from '../UI/ScrollView';
import { Column, Line, marginsSize } from '../UI/Grid';
import Text from '../UI/Text';
import IconButton from '../UI/IconButton';
import { type ResourceManagementProps } from '../ResourcesList/ResourceSource';
import { ColumnStackLayout, LineStackLayout } from '../UI/Layout';
import useForceUpdate, { useForceRecompute } from '../Utils/UseForceUpdate';
import ObjectGroup from '../UI/CustomSvgIcons/ObjectGroup';
import { usePersistedScrollPosition } from '../Utils/UsePersistedScrollPosition';
import { usePersistedCollapsedSection } from '../Utils/UsePersistedCollapsedSection';
import Help from '../UI/CustomSvgIcons/Help';
import { getHelpLink } from '../Utils/HelpLink';
import Window from '../Utils/Window';
import CompactTextField from '../UI/CompactTextField';
import Link from '../UI/Link';
import useVariablesContainerRefactoring from '../VariablesList/useVariablesContainerRefactoring';
import { makeObjectGroupMergedVariablesContainer } from '../Utils/VariablesUtils';
import { type ObjectGroupEditorTab } from './EditedObjectGroupEditorDialog';
import CompactObjectGroupEditor from './CompactObjectGroupEditor';
import { CollapsibleSubPanel } from '../ObjectEditor/CompactObjectPropertiesEditor';
import { TopLevelCollapsibleSection } from '../CompactPropertiesEditor/TopLevelCollapsibleSection';
import { useManageObjectBehaviors } from '../BehaviorsEditor';
import CompactBehaviorsEditorService from '../ObjectEditor/CompactObjectPropertiesEditor/CompactBehaviorsEditorService';
import { IconContainer } from '../UI/IconContainer';
import RemoveIcon from '../UI/CustomSvgIcons/Remove';
import { mapVector } from '../Utils/MapFor';
import getObjectByName from '../Utils/GetObjectByName';
import { getAllVisibleBehaviorNames } from '../Utils/Behavior';
import { EmptyPlaceholder } from '../UI/EmptyPlaceholder';
import { useResponsiveWindowSize } from '../UI/Responsive/ResponsiveWindowMeasurer';

const gd: libGDevelop = global.gd;

export const styles = {
  icon: {
    fontSize: 18,
  },
  scrollView: {
    paddingTop: marginsSize,
    // In theory, should not be needed (the children should be responsible for not
    // overflowing the parent). In practice, even when no horizontal scroll is shown
    // on Chrome, it might happen on Safari. Prevent any scroll to be 100% sure no
    // scrollbar will be shown.
    overflowX: 'hidden',
  },
  hiddenContent: { display: 'none' },
  subPanelContentContainer: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    paddingLeft: marginsSize * 3,
    paddingRight: marginsSize,
  },
};

const behaviorsHelpLink = getHelpLink('/behaviors');
const objectVariablesHelpLink = getHelpLink(
  '/all-features/variables/object-variables'
);

type Props = {|
  project: gdProject,
  resourceManagementProps: ResourceManagementProps,
  layout?: ?gdLayout,
  eventsFunctionsExtension: gdEventsFunctionsExtension | null,
  /** Only set when a default variant is edited */
  eventsBasedObject: gdEventsBasedObject | null,
  objectsContainer: gdObjectsContainer,
  globalObjectsContainer: gdObjectsContainer | null,
  initialInstances: gdInitialInstancesContainer,
  layersContainer: gdLayersContainer,
  projectScopedContainersAccessor: ProjectScopedContainersAccessor,
  unsavedChanges?: ?UnsavedChanges,
  historyHandler?: HistoryHandler,

  objectGroup: gdObjectGroup,
  isObjectListLocked: boolean,
  isVariableListLocked: boolean,
  isBehaviorListLocked: boolean,
  onEditObjectGroup: (
    objectGroup: gdObjectGroup,
    initialTab: ?ObjectGroupEditorTab
  ) => void,

  onUpdateBehaviorsSharedData: () => void,
  onWillInstallExtension: (extensionNames: Array<string>) => void,
  onExtensionInstalled: (extensionNames: Array<string>) => void,
  onCreateNewExtensionWithBehavior:
    | ((project: gdProject, object: gdObject) => void)
    | null,
|};

export type CompactObjectGroupPropertiesEditorInterface = {|
  /**
   * Rebuild the merged variables container from the objects of the group.
   * To be called when the group may have been edited elsewhere (in the object
   * group editor dialog, by an undo/redo...): the variables of a group are
   * not stored anywhere - they are the ones common to all its objects - so
   * they must be recomputed to display changes made outside this editor.
   */
  refreshVariables: () => void,
|};

export const CompactObjectGroupPropertiesEditor: React.ComponentType<{
  ...Props,
  +ref?: React.RefSetter<CompactObjectGroupPropertiesEditorInterface>,
}> = React.forwardRef<Props, CompactObjectGroupPropertiesEditorInterface>(
  (
    {
      project,
      resourceManagementProps,
      layout,
      eventsFunctionsExtension,
      eventsBasedObject,
      objectsContainer,
      globalObjectsContainer,
      initialInstances,
      layersContainer,
      projectScopedContainersAccessor,
      unsavedChanges,
      historyHandler,
      objectGroup,
      isObjectListLocked,
      isVariableListLocked,
      isBehaviorListLocked,
      onEditObjectGroup,
      onUpdateBehaviorsSharedData,
      onWillInstallExtension,
      onExtensionInstalled,
      onCreateNewExtensionWithBehavior,
    }: Props,
    ref
  ) => {
    const forceUpdate = useForceUpdate();
    const { isMobile } = useResponsiveWindowSize();
    const variablesListRef = React.useRef<?VariablesListInterface>(null);

    const [
      groupVariablesContainerRecomputeTrigger,
      forceRecomputeGroupVariablesContainer,
    ] = useForceRecompute();

    const groupVariablesContainer = React.useMemo(
      // This merged container is a temporary container, owned by this editor,
      // that the user edits in place - edits only reach the objects of the
      // group when the (debounced) refactoring is applied.
      () => {
        if (groupVariablesContainerRecomputeTrigger) {
          // groupVariablesContainerRecomputeTrigger allows to rebuild the
          // container when required.
        }
        return makeObjectGroupMergedVariablesContainer(
          projectScopedContainersAccessor.get().getObjectsContainersList(),
          objectGroup
        );
      },
      [
        objectGroup,
        projectScopedContainersAccessor,
        groupVariablesContainerRecomputeTrigger,
      ]
    );

    React.useImperativeHandle(
      ref,
      () => ({
        refreshVariables: forceRecomputeGroupVariablesContainer,
      }),
      [forceRecomputeGroupVariablesContainer]
    );

    // Free the C++ memory of the merged container when it's replaced or when
    // this editor is unmounted.
    React.useEffect(
      () => () => {
        groupVariablesContainer.delete();
      },
      [groupVariablesContainer]
    );

    const openFullEditor = React.useCallback(
      () => onEditObjectGroup(objectGroup, 'objects'),
      [objectGroup, onEditObjectGroup]
    );

    const scrollViewRef = React.useRef<?ScrollViewInterface>(null);
    const scrollKey = '' + objectGroup.ptr;

    // Object groups have no persistent UUID, so the name is used
    // (like for scenes).
    const persistedPanelStateId = objectGroup.getName();

    const onScroll = usePersistedScrollPosition({
      project,
      scrollViewRef,
      scrollKey,
      persistedPanelStateId: persistedPanelStateId,
      persistedPanelStateType: 'objectGroup',
    });
    const {
      isSectionFolded,
      setSectionFolded,
      toggleSectionFolded,
    } = usePersistedCollapsedSection({
      project,
      persistedPanelStateId,
      persistedPanelStateType: 'objectGroup',
    });

    const objects: Array<gdObject> = mapVector(
      objectGroup.getAllObjectsNames(),
      objectName =>
        getObjectByName(globalObjectsContainer, objectsContainer, objectName)
    ).filter(Boolean);

    // Behaviors:
    const allVisibleBehaviorNames = getAllVisibleBehaviorNames(objects);
    const {
      openNewBehaviorDialog,
      newBehaviorDialog,
      removeBehavior,
    } = useManageObjectBehaviors({
      project,
      projectScopedContainersAccessor,
      objects,
      isChildObject: !layout,
      eventsFunctionsExtension,
      onUpdate: forceUpdate,
      onBehaviorsUpdated: forceUpdate,
      onUpdateBehaviorsSharedData,
      onWillInstallExtension,
      onExtensionInstalled,
      allVisibleBehaviorNames,
      onCreateNewExtensionWithBehavior,
    });

    // Variable refactoring: snapshot on object selection, apply on deselection/unmount.
    const { onVariablesUpdated } = useVariablesContainerRefactoring({
      project,
      variablesContainer: groupVariablesContainer,
      initialInstances,
      eventsBasedObject,
      enabled: true,
      objectGroup,
      objectsContainer,
      globalObjectsContainer,
      objectName: null,
    });

    const removeObject = React.useCallback(
      (objectName: string) => {
        objectGroup.removeObject(objectName);
        // The variables common to the objects of the group may have changed.
        forceRecomputeGroupVariablesContainer();
        forceUpdate();
      },
      [forceUpdate, forceRecomputeGroupVariablesContainer, objectGroup]
    );

    const addObject = React.useCallback(
      (objectName: string) => {
        const object = getObjectByName(
          globalObjectsContainer,
          objectsContainer,
          objectName
        );
        if (!object) {
          return;
        }
        objectGroup.addObject(objectName);
        gd.ObjectRefactorer.fillMissingGroupVariablesToObject(
          object,
          groupVariablesContainer
        );
        for (const behaviorName of allVisibleBehaviorNames) {
          gd.ObjectRefactorer.fillMissingGroupBehaviorToObject(
            project.getCurrentPlatform(),
            globalObjectsContainer || objectsContainer,
            objectsContainer,
            object,
            objectGroup,
            behaviorName
          );
        }
        // The variables common to the objects of the group may have changed.
        forceRecomputeGroupVariablesContainer();
        forceUpdate();
      },
      [
        allVisibleBehaviorNames,
        forceUpdate,
        forceRecomputeGroupVariablesContainer,
        globalObjectsContainer,
        groupVariablesContainer,
        objectGroup,
        objectsContainer,
        project,
      ]
    );

    return (
      <ErrorBoundary
        componentTitle={<Trans>Object group properties</Trans>}
        scope="scene-editor-object-group-properties"
      >
        <ScrollView
          ref={scrollViewRef}
          autoHideScrollbar
          style={styles.scrollView}
          key={scrollKey}
          onScroll={onScroll}
        >
          <Column
            expand
            noMargin
            id="object-group-properties-editor"
            noOverflowParent
          >
            <ColumnStackLayout expand noOverflowParent>
              <LineStackLayout
                noMargin
                alignItems="center"
                justifyContent="space-between"
              >
                <LineStackLayout noMargin alignItems="center">
                  {<ObjectGroup style={styles.icon} />}
                  <Text size="body" noMargin>
                    <Trans>Object group</Trans>
                  </Text>
                  {
                    <IconButton
                      size="small"
                      onClick={() => {
                        Window.openExternalURL('/objects/object-groups');
                      }}
                    >
                      <Help style={styles.icon} />
                    </IconButton>
                  }
                </LineStackLayout>
              </LineStackLayout>
              <CompactTextField
                value={objectGroup.getName()}
                onChange={() => {}}
                disabled
              />
            </ColumnStackLayout>
            {objects.length === 0 ? (
              <Line useFullHeight expand>
                <Column
                  noMargin
                  expand
                  justifyContent="center"
                  noOverflowParent
                >
                  <EmptyPlaceholder
                    title={<Trans>Add objects to this group</Trans>}
                    description={
                      <Trans>You can organize objects into groups.</Trans>
                    }
                    helpPagePath="/objects/object-groups/"
                    actionButtonId="add-objects-to-group-button"
                    actionLabel={
                      isMobile ? <Trans>Add</Trans> : <Trans>Add objects</Trans>
                    }
                    onAction={() => onEditObjectGroup(objectGroup)}
                  />
                </Column>
              </Line>
            ) : (
              <Column expand noMargin noOverflowParent>
                <TopLevelCollapsibleSection
                  title={<Trans>Objects</Trans>}
                  isFolded={isSectionFolded('objects')}
                  toggleFolded={() => toggleSectionFolded('objects')}
                  onOpenFullEditor={openFullEditor}
                  renderContent={() => (
                    <ColumnStackLayout noMargin noOverflowParent>
                      <CompactObjectGroupEditor
                        project={project}
                        projectScopedContainersAccessor={
                          projectScopedContainersAccessor
                        }
                        globalObjectsContainer={globalObjectsContainer}
                        objectsContainer={objectsContainer}
                        groupObjectNames={objectGroup
                          .getAllObjectsNames()
                          .toJSArray()}
                        onObjectAdded={addObject}
                        onObjectRemoved={removeObject}
                        isObjectListLocked={isObjectListLocked}
                      />
                    </ColumnStackLayout>
                  )}
                />
                <TopLevelCollapsibleSection
                  title={<Trans>Behaviors</Trans>}
                  isFolded={isSectionFolded('behaviors')}
                  toggleFolded={() => toggleSectionFolded('behaviors')}
                  onOpenFullEditor={undefined}
                  onAdd={isBehaviorListLocked ? null : openNewBehaviorDialog}
                  renderContent={() => (
                    <ColumnStackLayout noMargin>
                      {!allVisibleBehaviorNames.length && (
                        <Text size="body2" align="center" color="secondary">
                          <Trans>
                            There are no{' '}
                            <Link
                              href={behaviorsHelpLink}
                              onClick={() =>
                                Window.openExternalURL(behaviorsHelpLink)
                              }
                            >
                              behaviors
                            </Link>{' '}
                            on this object.
                          </Trans>
                        </Text>
                      )}
                      {allVisibleBehaviorNames.map(behaviorName => {
                        const behaviors = objects.map(object =>
                          object.getBehavior(behaviorName)
                        );
                        const behaviorTypeName = behaviors[0].getTypeName();
                        const behaviorMetadata = gd.MetadataProvider.getBehaviorMetadata(
                          gd.JsPlatform.get(),
                          behaviorTypeName
                        );
                        const iconUrl = behaviorMetadata.getIconFilename();
                        const CompactBehaviorComponent = CompactBehaviorsEditorService.getEditor(
                          behaviorTypeName
                        );
                        return (
                          <CollapsibleSubPanel
                            key={behaviors[0].ptr}
                            renderContent={() => (
                              <CompactBehaviorComponent
                                project={project}
                                behaviorMetadata={behaviorMetadata}
                                behaviors={behaviors}
                                object={null}
                                layersContainer={layersContainer}
                                onBehaviorUpdated={() => {}}
                                resourceManagementProps={
                                  resourceManagementProps
                                }
                                onOpenFullEditor={undefined}
                              />
                            )}
                            isFolded={behaviors[0].isFolded()}
                            toggleFolded={() => {
                              behaviors[0].setFolded(!behaviors[0].isFolded());
                              forceUpdate();
                            }}
                            titleIcon={
                              iconUrl ? (
                                <IconContainer
                                  src={iconUrl}
                                  alt={behaviorMetadata.getFullName()}
                                  size={16}
                                />
                              ) : null
                            }
                            title={behaviors[0].getName()}
                            titleBarButtons={
                              isBehaviorListLocked
                                ? []
                                : [
                                    {
                                      id: 'remove-behavior',
                                      icon: RemoveIcon,
                                      label: t`Remove behavior`,
                                      onClick: () => {
                                        removeBehavior(behaviorName);
                                      },
                                    },
                                  ]
                            }
                          />
                        );
                      })}
                    </ColumnStackLayout>
                  )}
                />
                <TopLevelCollapsibleSection
                  title={<Trans>Object Variables</Trans>}
                  isFolded={isSectionFolded('variables')}
                  toggleFolded={() => toggleSectionFolded('variables')}
                  onOpenFullEditor={() =>
                    onEditObjectGroup(objectGroup, 'variables')
                  }
                  onAdd={
                    isVariableListLocked
                      ? null
                      : () => {
                          if (variablesListRef.current) {
                            variablesListRef.current.addVariable();
                          }
                          setSectionFolded('variables', false);
                        }
                  }
                  renderContentAsHiddenWhenFolded={
                    true /* Allows to keep a ref to the variables list for add button to work. */
                  }
                  noContentMargin
                  renderContent={() => (
                    <VariablesList
                      ref={variablesListRef}
                      projectScopedContainersAccessor={
                        projectScopedContainersAccessor
                      }
                      directlyStoreValueChangesWhileEditing
                      variablesContainer={groupVariablesContainer}
                      areObjectVariables
                      size="compact"
                      historyHandler={historyHandler}
                      onVariablesUpdated={onVariablesUpdated}
                      toolbarIconStyle={styles.icon}
                      compactEmptyPlaceholderText={
                        <Trans>
                          There are no common{' '}
                          <Link
                            href={objectVariablesHelpLink}
                            onClick={() =>
                              Window.openExternalURL(objectVariablesHelpLink)
                            }
                          >
                            variables
                          </Link>{' '}
                          on this group objects.
                        </Trans>
                      }
                      isListLocked={isVariableListLocked}
                    />
                  )}
                />
              </Column>
            )}
          </Column>
        </ScrollView>
        {newBehaviorDialog}
      </ErrorBoundary>
    );
  }
);
