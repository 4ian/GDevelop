// @flow
import { type I18n as I18nType } from '@lingui/core';
import * as React from 'react';
import { type UnsavedChanges } from '../../MainFrame/UnsavedChangesContext';
import VariablesList, {
  type HistoryHandler,
  type VariablesListInterface,
} from '../../VariablesList/VariablesList';
import { type ProjectScopedContainersAccessor } from '../../InstructionOrExpression/EventsScope';
import ErrorBoundary from '../../UI/ErrorBoundary';
import ScrollView, { type ScrollViewInterface } from '../../UI/ScrollView';
import { Column, LargeSpacer, Line, marginsSize } from '../../UI/Grid';
import Text from '../../UI/Text';
import { Trans } from '@lingui/macro';
import IconButton from '../../UI/IconButton';
import EventsRootVariablesFinder from '../../Utils/EventsRootVariablesFinder';
import { CompactBehaviorSharedDataPropertiesEditor } from './CompactBehaviorSharedDataPropertiesEditor';
import {
  TopLevelCollapsibleSection,
  CollapsibleSubPanel,
} from '../../ObjectEditor/CompactObjectPropertiesEditor';
import { type ResourceManagementProps } from '../../ResourcesList/ResourceSource';
import { ColumnStackLayout, LineStackLayout } from '../../UI/Layout';
import { IconContainer } from '../../UI/IconContainer';
import useForceUpdate from '../../Utils/UseForceUpdate';
import SceneIcon from '../../UI/CustomSvgIcons/Scene';
import { usePersistedScrollPosition } from '../../Utils/UsePersistedScrollPosition';
import Help from '../../UI/CustomSvgIcons/Help';
import { getHelpLink } from '../../Utils/HelpLink';
import Window from '../../Utils/Window';
import Link from '../../UI/Link';
import { CompactPropertiesEditorByVisibility } from '../../CompactPropertiesEditor/CompactPropertiesEditorByVisibility';
import { useForceRecompute } from '../../Utils/UseForceUpdate';
import { makeSchema } from './CompactScenePropertiesSchema';
import EmptyMessage from '../../UI/EmptyMessage';

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

const sceneVariablesHelpLink = getHelpLink(
  '/all-features/variables/scene-variables'
);

type Props = {|
  project: gdProject,
  scene: gdLayout,
  resourceManagementProps: ResourceManagementProps,
  openSceneVariables: () => void,
  onBackgroundColorChanged: () => void,
  projectScopedContainersAccessor: ProjectScopedContainersAccessor,
  unsavedChanges?: ?UnsavedChanges,
  i18n: I18nType,
  historyHandler?: HistoryHandler,
|};

export const CompactScenePropertiesEditor = ({
  project,
  resourceManagementProps,
  scene,
  openSceneVariables,
  onBackgroundColorChanged,
  projectScopedContainersAccessor,
  unsavedChanges,
  i18n,
  historyHandler,
}: Props): React.Node => {
  const forceUpdate = useForceUpdate();
  const [isPropertiesFolded, setIsPropertiesFolded] = React.useState(false);
  const [isBehaviorsFolded, setIsBehaviorsFolded] = React.useState(false);
  const [isVariablesFolded, setIsVariablesFolded] = React.useState(false);
  const variablesListRef = React.useRef<?VariablesListInterface>(null);

  const allVisibleBehaviors = scene
    .getAllBehaviorSharedDataNames()
    .toJSArray()
    .map(behaviorName => scene.getBehaviorSharedData(behaviorName))
    .filter(
      behaviorSharedData =>
        behaviorSharedData
          .getProperties()
          .keys()
          .size() > 0
    );

  const helpLink = getHelpLink('/interface/scene-editor/');

  const [schemaRecomputeTrigger, forceRecomputeSchema] = useForceRecompute();
  const scrollViewRef = React.useRef<?ScrollViewInterface>(null);
  const scrollKey = 'scene-' + scene.ptr;

  const persistedScrollId = scene.getName();

  const onScroll = usePersistedScrollPosition({
    project,
    scrollViewRef,
    scrollKey,
    persistedScrollId,
    persistedScrollType: 'scene',
  });

  const propertiesSchema = React.useMemo(
    () => {
      if (schemaRecomputeTrigger) {
        // schemaRecomputeTrigger allows to invalidate the schema when required.
      }
      return makeSchema({
        i18n,
        onBackgroundColorChanged,
      });
    },
    [schemaRecomputeTrigger, i18n, onBackgroundColorChanged]
  );

  return (
    <ErrorBoundary
      componentTitle={<Trans>Scene properties</Trans>}
      scope="scene-editor-scene-properties"
    >
      <ScrollView
        ref={scrollViewRef}
        autoHideScrollbar
        style={styles.scrollView}
        key={scrollKey}
        onScroll={onScroll}
      >
        <Column expand noMargin id="scene-properties-editor" noOverflowParent>
          <ColumnStackLayout expand noOverflowParent>
            <LineStackLayout
              noMargin
              alignItems="center"
              justifyContent="space-between"
            >
              <LineStackLayout noMargin alignItems="center">
                <SceneIcon style={styles.icon} />
                <Text size="body" noMargin>
                  {scene.getName()}
                </Text>
                {helpLink && (
                  <IconButton
                    size="small"
                    onClick={() => {
                      Window.openExternalURL(helpLink);
                    }}
                  >
                    <Help style={styles.icon} />
                  </IconButton>
                )}
              </LineStackLayout>
            </LineStackLayout>
          </ColumnStackLayout>
          <TopLevelCollapsibleSection
            title={<Trans>Properties</Trans>}
            isFolded={isPropertiesFolded}
            toggleFolded={() => setIsPropertiesFolded(!isPropertiesFolded)}
            renderContent={() => (
              <ColumnStackLayout noMargin noOverflowParent>
                <CompactPropertiesEditorByVisibility
                  project={project}
                  schema={propertiesSchema}
                  instances={[scene]}
                  onInstancesModified={() => {
                    // TODO: undo/redo?
                  }}
                  resourceManagementProps={resourceManagementProps}
                  placeholder=""
                  onRefreshAllFields={forceRecomputeSchema}
                />
              </ColumnStackLayout>
            )}
          />
          {allVisibleBehaviors.length > 0 && (
            <TopLevelCollapsibleSection
              title={<Trans>Behaviors</Trans>}
              isFolded={isBehaviorsFolded}
              toggleFolded={() => setIsBehaviorsFolded(!isBehaviorsFolded)}
              renderContent={() => (
                <ColumnStackLayout noMargin>
                  {allVisibleBehaviors.map(behaviorSharedData => {
                    const behaviorTypeName = behaviorSharedData.getTypeName();
                    const behaviorMetadata = gd.MetadataProvider.getBehaviorMetadata(
                      gd.JsPlatform.get(),
                      behaviorTypeName
                    );
                    const iconUrl = behaviorMetadata.getIconFilename();
                    return (
                      <CollapsibleSubPanel
                        key={behaviorSharedData.ptr}
                        renderContent={() => (
                          <CompactBehaviorSharedDataPropertiesEditor
                            project={project}
                            behaviorMetadata={behaviorMetadata}
                            behaviorSharedData={behaviorSharedData}
                            resourceManagementProps={resourceManagementProps}
                          />
                        )}
                        isFolded={behaviorSharedData.isFolded()}
                        toggleFolded={() => {
                          behaviorSharedData.setFolded(
                            !behaviorSharedData.isFolded()
                          );
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
                        title={behaviorSharedData.getName()}
                      />
                    );
                  })}
                </ColumnStackLayout>
              )}
            />
          )}
          <TopLevelCollapsibleSection
            title={<Trans>Scene Variables</Trans>}
            isFolded={isVariablesFolded}
            toggleFolded={() => setIsVariablesFolded(!isVariablesFolded)}
            onOpenFullEditor={() => openSceneVariables()}
            onAdd={() => {
              if (variablesListRef.current) {
                variablesListRef.current.addVariable();
              }
              setIsVariablesFolded(false);
            }}
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
                variablesContainer={scene.getVariables()}
                areObjectVariables
                size="compact"
                onComputeAllVariableNames={() =>
                  EventsRootVariablesFinder.findAllLayoutVariables(
                    project.getCurrentPlatform(),
                    project,
                    scene
                  )
                }
                historyHandler={historyHandler}
                toolbarIconStyle={styles.icon}
                compactEmptyPlaceholderText={
                  <Trans>
                    There are no{' '}
                    <Link
                      href={sceneVariablesHelpLink}
                      onClick={() =>
                        Window.openExternalURL(sceneVariablesHelpLink)
                      }
                    >
                      variables
                    </Link>{' '}
                    on this scene.
                  </Trans>
                }
                isListLocked={false}
              />
            )}
          />
          <LargeSpacer />
          <Line>
            <EmptyMessage>
              <Trans>
                Click on an instance on the canvas or an object in the list to
                display their properties.
              </Trans>
            </EmptyMessage>
          </Line>
        </Column>
      </ScrollView>
    </ErrorBoundary>
  );
};
