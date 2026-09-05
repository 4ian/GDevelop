// @flow
import * as React from 'react';
import { I18n } from '@lingui/react';
import { action } from '@storybook/addon-actions';

// Keep first as it creates the `global.gd` object:
import { testProject } from '../../GDevelopJsInitializerDecorator';

import TouchGestureHarness from './TouchGestureHarness';
import fakeHotReloadPreviewButtonProps from '../../FakeHotReloadPreviewButtonProps';
import fakeResourceManagementProps from '../../FakeResourceManagement';
import FixedHeightFlexContainer from '../../FixedHeightFlexContainer';
import ObjectsList, {
  objectWithContextReactDndType,
} from '../../../ObjectsList';
import { type ObjectFolderOrObjectWithContext } from '../../../ObjectsList/EnumerateObjectFolderOrObject';
import { makeDropTarget } from '../../../UI/DragAndDrop/DropTarget';
import { AssetStoreStateProvider } from '../../../AssetStore/AssetStoreContext';
import { AssetStoreNavigatorStateProvider } from '../../../AssetStore/AssetStoreNavigator';
import { ObjectStoreStateProvider } from '../../../AssetStore/ObjectStoreContext';
import { BundleStoreStateProvider } from '../../../AssetStore/Bundles/BundleStoreContext';
import { PrivateGameTemplateStoreStateProvider } from '../../../AssetStore/PrivateGameTemplates/PrivateGameTemplateStoreContext';
import AuthenticatedUserContext from '../../../Profile/AuthenticatedUserContext';
import { fakeSilverAuthenticatedUser } from '../../../fixtures/GDevelopServicesTestData';
import { ProjectScopedContainersAccessor } from '../../../InstructionOrExpression/EventsScope';
import ProjectManager from '../../../ProjectManager';
import { UnsavedChangesContextProvider } from '../../../MainFrame/UnsavedChangesContext';
import { useShortcutMap } from '../../../KeyboardShortcuts';
import EventsFunctionsListWithErrorBoundary from '../../../EventsFunctionsList';
import EventsTree from '../../../EventsSheet/EventsTree';
import { getInitialSelection } from '../../../EventsSheet/SelectionHandler';
import { initialPreferences } from '../../../MainFrame/Preferences/PreferencesContext';
import { useScreenType } from '../../../UI/Responsive/ScreenTypeMeasurer';
import SpriteEditor from '../../../ObjectEditor/Editors/SpriteEditor';
import { getOrCreateStressTestSpriteObject } from '../ObjectEditor/StressTestSpriteObject';
import VariablesList from '../../../VariablesList/VariablesList';
import EffectsList from '../../../EffectsList';
import LayersList from '../../../LayersList';
import { ClosableTabs } from '../../../UI/ClosableTabs';
import { DraggableClosableTab } from '../../../MainFrame/EditorTabs/DraggableEditorTabs';
import { useRefWithInit } from '../../../Utils/UseRefInitHook';
import useForceUpdate from '../../../Utils/UseForceUpdate';

const gd: libGDevelop = global.gd;

export default {
  title: 'Touch gestures',
  parameters: {
    // Meant to be opened on a phone or tablet (or with touch emulation).
    layout: 'padded',
  },
};

const FRAME_HEIGHT = 380;
const FRAME_WIDTH = 360;

// A scene with enough objects, folders and events to scroll, dedicated to
// these stories so that dragging around does not disturb the other stories.
const getOrCreateTouchGesturesLayout = (): {|
  layout: gdLayout,
  projectScopedContainersAccessor: ProjectScopedContainersAccessor,
|} => {
  const { project } = testProject;
  const layoutName = 'TouchGesturesScene';
  if (!project.hasLayoutNamed(layoutName)) {
    const layout = project.insertNewLayout(
      layoutName,
      project.getLayoutsCount()
    );
    const objectsContainer = layout.getObjects();
    const rootFolder = objectsContainer.getRootFolder();
    for (let folderIndex = 0; folderIndex < 3; folderIndex++) {
      const folder = rootFolder.insertNewFolder(
        `Folder${folderIndex}`,
        folderIndex
      );
      for (let objectIndex = 0; objectIndex < 8; objectIndex++) {
        objectsContainer.insertNewObjectInFolder(
          project,
          'Sprite',
          `Folder${folderIndex}Object${objectIndex}`,
          folder,
          objectIndex
        );
      }
    }
    for (let objectIndex = 0; objectIndex < 40; objectIndex++) {
      objectsContainer.insertNewObject(
        project,
        objectIndex % 4 === 0 ? 'TextObject::Text' : 'Sprite',
        `Object${objectIndex}`,
        objectsContainer.getObjectsCount()
      );
    }

    // Copy the events of the test layout a few times, to have a long and
    // varied list of events (with instructions, sub-events, comments...).
    const events = layout.getEvents();
    const testEvents = testProject.testLayout.getEvents();
    for (let copyIndex = 0; copyIndex < 4; copyIndex++) {
      for (
        let eventIndex = 0;
        eventIndex < testEvents.getEventsCount();
        eventIndex++
      ) {
        const event = testEvents.getEventAt(eventIndex);
        // The code editor of JavaScript events can't load in Storybook.
        if (event.getType() === 'BuiltinCommonInstructions::JsCode') continue;
        events.insertEvent(event, events.getEventsCount());
      }
    }
  }
  const layout = project.getLayout(layoutName);
  return {
    layout,
    projectScopedContainersAccessor: new ProjectScopedContainersAccessor({
      project,
      layout,
    }),
  };
};

// Needed by the NewObjectDialog, opened when clicking the "Add object" button.
const AssetStoreProviders = ({ children }: {| children: React.Node |}) => (
  <AuthenticatedUserContext.Provider value={fakeSilverAuthenticatedUser}>
    <AssetStoreNavigatorStateProvider>
      <AssetStoreStateProvider>
        <BundleStoreStateProvider>
          <PrivateGameTemplateStoreStateProvider>
            <I18n>
              {({ i18n }) => (
                <ObjectStoreStateProvider i18n={i18n}>
                  {children}
                </ObjectStoreStateProvider>
              )}
            </I18n>
          </PrivateGameTemplateStoreStateProvider>
        </BundleStoreStateProvider>
      </AssetStoreStateProvider>
    </AssetStoreNavigatorStateProvider>
  </AuthenticatedUserContext.Provider>
);

const SceneDropTarget = makeDropTarget<{| name: string |}>(
  objectWithContextReactDndType
);

// Stands for the scene editor canvas, on which objects can be dropped.
const FakeScene = ({ onDrop }: {| onDrop: (name: string) => void |}) => {
  const [lastDroppedName, setLastDroppedName] = React.useState<?string>(null);
  return (
    <SceneDropTarget
      canDrop={() => true}
      drop={monitor => {
        const item = monitor.getItem();
        setLastDroppedName(item.name);
        onDrop(item.name);
      }}
    >
      {({ connectDropTarget, isOver }) =>
        connectDropTarget(
          <div
            style={{
              height: 90,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: isOver ? '#d5e2ff' : '#e9ecf2',
              color: '#4b5262',
              borderTop: '1px solid #b9bfcc',
            }}
          >
            {lastDroppedName
              ? `Scene: "${lastDroppedName}" dropped here`
              : 'Scene: drop an object here'}
          </div>
        )
      }
    </SceneDropTarget>
  );
};

export const ObjectsListStory = (): React.Node => {
  const { layout, projectScopedContainersAccessor } = useRefWithInit(
    getOrCreateTouchGesturesLayout
  ).current;
  const [
    selectedObjectFolderOrObjectsWithContext,
    setSelectedObjectFolderOrObjectsWithContext,
  ] = React.useState<Array<ObjectFolderOrObjectWithContext>>([]);

  return (
    <TouchGestureHarness
      title="Objects list"
      mode="row"
      gestureIds={[
        'flick',
        'grabAndMove',
        'holdThenDrag',
        'wobbleThenDrag',
        'longPress',
        'holdThenDragBeforeMenu',
        'tap',
        'doubleTap',
        'interruptedDrag',
        'dragToEdge',
        'dragOntoScene',
      ]}
      notes="Also check: dropping an object into a folder, renaming (long press then Rename: the text field must be focusable, and no drag preview must show), and dragging after selecting several objects."
    >
      <AssetStoreProviders>
        <div
          style={{
            height: FRAME_HEIGHT,
            width: FRAME_WIDTH,
            display: 'flex',
            overflow: 'hidden',
          }}
        >
          <ObjectsList
            getThumbnail={() => 'res/unknown32.png'}
            project={testProject.project}
            layout={layout}
            eventsFunctionsExtension={null}
            eventsBasedObject={null}
            projectScopedContainersAccessor={projectScopedContainersAccessor}
            globalObjectsContainer={testProject.project.getObjects()}
            objectsContainer={layout.getObjects()}
            resourceManagementProps={fakeResourceManagementProps}
            onEditObject={action('On edit object')}
            onOpenEventBasedObjectEditor={action('On edit children')}
            onOpenEventBasedObjectVariantEditor={action('On edit variant')}
            onExportAssets={action('On export assets')}
            onImportAssets={action('On import assets')}
            onAddObjectInstance={action('On add instance to the scene')}
            onObjectCreated={action('On object created')}
            onObjectEdited={action('On object edited')}
            getValidatedObjectOrGroupName={(newName: string) => newName}
            onDeleteObjects={(objectsWithContext, cb) => cb(true)}
            onRenameObjectFolderOrObjectWithContextFinish={(
              objectWithContext,
              newName,
              cb
            ) => cb(true)}
            onSetAsGlobalObject={action('onSetAsGlobalObject')}
            hotReloadPreviewButtonProps={fakeHotReloadPreviewButtonProps}
            onWillInstallExtension={action('extension will be installed')}
            onExtensionInstalled={action('onExtensionInstalled')}
            selectedObjectFolderOrObjectsWithContext={
              selectedObjectFolderOrObjectsWithContext
            }
            onObjectFolderOrObjectsWithContextSelected={
              setSelectedObjectFolderOrObjectsWithContext
            }
            isListLocked={false}
          />
        </div>
        <FakeScene onDrop={action('dropped on the scene')} />
      </AssetStoreProviders>
    </TouchGestureHarness>
  );
};
ObjectsListStory.storyName = 'Objects list (row)';

const mainMenuCallbacks = {
  onChooseProject: () => action('onChooseProject'),
  onOpenRecentFile: () => action('onOpenRecentFile'),
  onSaveProject: () => action('onSaveProject'),
  onSaveProjectAs: () => action('onSaveProjectAs'),
  onShowVersionHistory: () => action('onShowVersionHistory'),
  onCloseProject: () => action('onCloseProject'),
  onCloseApp: () => action('onCloseApp'),
  onExportProject: () => action('onExportProject'),
  onInviteCollaborators: () => action('onInviteCollaborators'),
  onCreateProject: () => action('onCreateProject'),
  onOpenProjectManager: () => action('onOpenProjectManager'),
  onOpenHomePage: () => action('onOpenHomePage'),
  onOpenDebugger: () => action('onOpenDebugger'),
  onOpenAbout: () => action('onOpenAbout'),
  onOpenPreferences: () => action('onOpenPreferences'),
  onOpenLanguage: () => action('onOpenLanguage'),
  onOpenProfile: () => action('onOpenProfile'),
  onOpenAskAi: () => action('onOpenAskAi'),
  setElectronUpdateStatus: () => action('setElectronUpdateStatus'),
};

export const ProjectManagerStory = (): React.Node => {
  const shortcutMap = useShortcutMap();
  return (
    <TouchGestureHarness
      title="Project manager"
      mode="row"
      gestureIds={[
        'flick',
        'grabAndMove',
        'holdThenDrag',
        'wobbleThenDrag',
        'longPress',
        'holdThenDragBeforeMenu',
        'tap',
        'interruptedDrag',
        'dragToEdge',
      ]}
      notes="Expand the scenes and extensions to get a long list. Reorder scenes and external layouts."
    >
      <I18n>
        {({ i18n }) => (
          <UnsavedChangesContextProvider>
            <div style={{ height: FRAME_HEIGHT, width: FRAME_WIDTH }}>
              <ProjectManager
                project={testProject.project}
                onSaveProjectProperties={async () => true}
                onChangeProjectName={action('onChangeProjectName')}
                onOpenExternalEvents={action('onOpenExternalEvents')}
                onOpenLayout={action('onOpenLayout')}
                onOpenExternalLayout={action('onOpenExternalLayout')}
                onOpenEventsFunctionsExtension={action(
                  'onOpenEventsFunctionsExtension'
                )}
                onSceneAdded={action('onSceneAdded')}
                onExternalLayoutAdded={action('onExternalLayoutAdded')}
                onDeleteLayout={action('onDeleteLayout')}
                onDeleteExternalLayout={action('onDeleteExternalLayout')}
                onDeleteEventsFunctionsExtension={action(
                  'onDeleteEventsFunctionsExtension'
                )}
                onDeleteExternalEvents={action('onDeleteExternalEvents')}
                onDeleteGameplayTest={action('onDeleteGameplayTest')}
                onRenameGameplayTest={action('onRenameGameplayTest')}
                onOpenGameplayTest={action('onOpenGameplayTest')}
                onRunGameplayTest={action('onRunGameplayTest')}
                onRenameLayout={action('onRenameLayout')}
                onRenameExternalLayout={action('onRenameExternalLayout')}
                onRenameEventsFunctionsExtension={action(
                  'onRenameEventsFunctionsExtension'
                )}
                onRenameExternalEvents={action('onRenameExternalEvents')}
                onOpenResources={action('onOpenResources')}
                onReloadEventsFunctionsExtensions={action(
                  'onReloadEventsFunctionsExtensions'
                )}
                onWillInstallExtension={action('extension will be installed')}
                onExtensionInstalled={action('onExtensionInstalled')}
                onShareProject={action('onShareProject')}
                isOpen
                hotReloadPreviewButtonProps={fakeHotReloadPreviewButtonProps}
                resourceManagementProps={fakeResourceManagementProps}
                projectScopedContainersAccessor={
                  testProject.testSceneProjectScopedContainersAccessor
                }
                gamesList={{
                  games: null,
                  fetchGames: async () => {},
                  gamesFetchingError: null,
                  onGameUpdated: () => {},
                  markGameAsSavedIfRelevant: async () => {},
                }}
                onOpenHomePage={action('openHomepage')}
                toggleProjectManager={action('toggleProjectManager')}
                buildMainMenuProps={{
                  i18n,
                  project: testProject.project,
                  canSaveProjectAs: true,
                  recentProjectFiles: [],
                  shortcutMap,
                  isApplicationTopLevelMenu: false,
                  hideAskAi: false,
                }}
                // $FlowFixMe[incompatible-type]
                mainMenuCallbacks={mainMenuCallbacks}
              />
            </div>
          </UnsavedChangesContextProvider>
        )}
      </I18n>
    </TouchGestureHarness>
  );
};
ProjectManagerStory.storyName = 'Project manager (row)';

export const ExtensionListsStory = (): React.Node => (
  <TouchGestureHarness
    title="Extension functions, behaviors and objects"
    mode="row"
    gestureIds={[
      'flick',
      'grabAndMove',
      'holdThenDrag',
      'wobbleThenDrag',
      'longPress',
      'holdThenDragBeforeMenu',
      'tap',
      'interruptedDrag',
    ]}
    notes="A long press on a function, behavior or object must open its menu, not open the item."
  >
    <div style={{ height: FRAME_HEIGHT, width: FRAME_WIDTH }}>
      <EventsFunctionsListWithErrorBoundary
        project={testProject.project}
        eventsFunctionsExtension={testProject.testEventsFunctionsExtension}
        selectedEventsBasedObject={null}
        selectedEventsBasedBehavior={null}
        selectedEventsFunction={testProject.testEventsFunctionsExtension
          .getEventsFunctions()
          .getEventsFunctionAt(1)}
        // Objects
        onSelectEventsBasedObject={action('object selected')}
        onDeleteEventsBasedObject={action('object deleted')}
        onRenameEventsBasedObject={action('rename object')}
        onEventsBasedObjectRenamed={action('object renamed')}
        moveEventsBasedObjectTo={action('move object')}
        onEventsBasedObjectMoved={action('object moved')}
        onEventsBasedObjectPasted={action('object pasted')}
        onOpenCustomObjectEditor={action('onOpenCustomObjectEditor')}
        onAddEventsBasedObject={cb => cb({ isRenderedIn3D: false })}
        onEventBasedObjectTypeChanged={action('onEventBasedObjectTypeChanged')}
        // Gameplay tests
        onOpenGameplayTest={action('open gameplay test')}
        onRenameGameplayTest={action('rename gameplay test')}
        onDeleteGameplayTest={action('delete gameplay test')}
        onRunGameplayTest={action('run gameplay test')}
        // Behaviors
        onSelectEventsBasedBehavior={action('behavior selected')}
        onDeleteEventsBasedBehavior={action('behavior deleted')}
        onRenameEventsBasedBehavior={action('rename behavior')}
        onEventsBasedBehaviorRenamed={action('behavior renamed')}
        moveEventsBasedBehaviorTo={action('move behavior')}
        onEventsBasedBehaviorMoved={action('behavior moved')}
        onEventsBasedBehaviorPasted={action('behavior pasted')}
        // Free functions
        onSelectEventsFunction={action('function selected')}
        onDeleteEventsFunction={action('function deleted')}
        onAddEventsFunction={(eventsBasedBehavior, eventsBasedObject, cb) =>
          cb({ functionType: 0, name: null })
        }
        onEventsFunctionAdded={action('function added')}
        onRenameEventsFunction={action('function renamed')}
        moveEventsFunctionTo={action('move function')}
        onEventsFunctionMoved={action('function moved')}
        forceUpdateEditor={action('force editor update')}
        onSelectExtensionProperties={action('open extension properties')}
        onSelectExtensionGlobalVariables={action('open global variables')}
        onSelectExtensionSceneVariables={action('open scene variables')}
      />
    </div>
  </TouchGestureHarness>
);
ExtensionListsStory.storyName = 'Extension lists (row)';

// The handlers of the events tree receive DOM events, which the Storybook
// actions addon can't serialize: only log the name.
const logAction = (name: string) => () => action(name)();

export const EventsSheetStory = (): React.Node => {
  const { layout, projectScopedContainersAccessor } = useRefWithInit(
    getOrCreateTouchGesturesLayout
  ).current;
  const screenType = useScreenType();
  const forceUpdate = useForceUpdate();
  const width = FRAME_WIDTH;
  const height = FRAME_HEIGHT + 100;

  return (
    <TouchGestureHarness
      title="Events sheet"
      mode="handle"
      gestureIds={[
        'flick',
        'grabAndMove',
        'holdThenDrag',
        'longPress',
        'tap',
        'doubleTap',
        'interruptedDrag',
        'dragToEdge',
      ]}
      notes="Events are dragged by the colored bar on their left (handle: instantly). Conditions and actions are dragged like rows: hold them until they lift, then move; a tap selects them and a second tap edits them. Also drop an event as a sub-event, and onto a folded group."
    >
      <div className="gd-events-sheet" style={{ width, height }}>
        <FixedHeightFlexContainer height={height}>
          <EventsTree
            events={layout.getEvents()}
            project={testProject.project}
            scope={{ project: testProject.project, layout }}
            projectScopedContainersAccessor={projectScopedContainersAccessor}
            globalObjectsContainer={testProject.project.getObjects()}
            objectsContainer={layout.getObjects()}
            // $FlowFixMe[incompatible-type]
            selection={getInitialSelection()}
            onAddNewInstruction={logAction('add new instruction')}
            onPasteInstructions={logAction('paste instructions')}
            onMoveToInstruction={logAction('move to instruction')}
            onMoveToInstructionsList={logAction('move instruction to list')}
            onInstructionClick={logAction('instruction click')}
            onInstructionDoubleClick={logAction('instruction double click')}
            onInstructionContextMenu={logAction('instruction context menu')}
            onAddInstructionContextMenu={action(
              'instruction list context menu'
            )}
            onVariableDeclarationDoubleClick={action(
              'onVariableDeclarationDoubleClick'
            )}
            onVariableDeclarationClick={logAction('onVariableDeclarationClick')}
            onParameterClick={logAction('parameter click')}
            onEventClick={logAction('event click')}
            onEventContextMenu={logAction('event context menu')}
            onAddNewEvent={logAction('add new event')}
            onOpenExternalEvents={logAction('open external events')}
            onOpenLayout={logAction('open layout')}
            searchResults={null}
            searchFocusOffset={null}
            onEventMoved={forceUpdate}
            showObjectThumbnails={true}
            screenType={screenType}
            windowSize={'small'}
            eventsSheetHeight={height}
            eventsSheetWidth={width}
            indentScale={1}
            // $FlowFixMe[incompatible-type]
            preferences={initialPreferences}
            tutorials={[]}
            onEndEditingEvent={logAction('end editing event')}
            highlightedSearchText={null}
            highlightedAiGeneratedEventIds={new Set()}
          />
        </FixedHeightFlexContainer>
      </div>
    </TouchGestureHarness>
  );
};
EventsSheetStory.storyName = 'Events sheet (handle)';

export const SpritesAndAnimationsStory = (): React.Node => {
  const { object } = getOrCreateStressTestSpriteObject(
    'MyTouchGesturesSpriteObject',
    12,
    16
  );
  const [, setChangesCount] = React.useState(0);
  const notifyOfChange = React.useCallback(
    () => setChangesCount(count => count + 1),
    []
  );
  const onSizeUpdated = React.useCallback(() => {}, []);
  return (
    <TouchGestureHarness
      title="Sprites and animations"
      mode="row"
      gestureIds={[
        'flick',
        'grabAndMove',
        'holdThenDrag',
        'wobbleThenDrag',
        'longPress',
        'tap',
        'interruptedDrag',
        'dragToEdge',
      ]}
      notes="Sprites (the thumbnails strip, scrolling sideways) are dragged from the whole thumbnail: row mode. Animations are dragged from their grip: handle mode, they must drag instantly."
    >
      <div style={{ height: FRAME_HEIGHT + 200, width: FRAME_WIDTH }}>
        <SpriteEditor
          renderObjectNameField={() => null}
          objectConfiguration={object.getConfiguration()}
          projectScopedContainersAccessor={
            testProject.testSceneProjectScopedContainersAccessor
          }
          project={testProject.project}
          layout={testProject.testLayout}
          eventsFunctionsExtension={null}
          eventsBasedObject={null}
          resourceManagementProps={fakeResourceManagementProps}
          onSizeUpdated={onSizeUpdated}
          object={object}
          objectName="MyTouchGesturesSpriteObject"
          onObjectUpdated={notifyOfChange}
        />
      </div>
    </TouchGestureHarness>
  );
};
SpritesAndAnimationsStory.storyName = 'Sprites (row) and animations (handle)';

const useManyVariablesContainer = (count: number): gdVariablesContainer => {
  const variablesContainerRef = useRefWithInit(() => {
    const variablesContainer = new gd.VariablesContainer(
      gd.VariablesContainer.Scene
    );
    for (let index = 0; index < count; index++) {
      const variable = new gd.Variable();
      if (index % 5 === 0) {
        variable.castTo('structure');
        for (let childIndex = 0; childIndex < 3; childIndex++) {
          variable.getChild(`Child${childIndex}`).setValue(childIndex);
        }
      } else {
        variable.setValue(index);
      }
      variablesContainer.insert(`Variable${index}`, variable, index);
      variable.delete();
    }
    return variablesContainer;
  });
  return variablesContainerRef.current;
};

export const VariablesStory = (): React.Node => {
  const variablesContainer = useManyVariablesContainer(40);
  return (
    <TouchGestureHarness
      title="Variables"
      mode="handle"
      gestureIds={[
        'flick',
        'grabAndMove',
        'holdThenDrag',
        'tap',
        'interruptedDrag',
        'dragToEdge',
      ]}
      notes="Variables are dragged from their grip. Also drop a variable after the last one, and inside a structure."
    >
      <div style={{ height: FRAME_HEIGHT, width: FRAME_WIDTH }}>
        <FixedHeightFlexContainer height={FRAME_HEIGHT}>
          <VariablesList
            projectScopedContainersAccessor={
              testProject.testSceneProjectScopedContainersAccessor
            }
            variablesContainer={variablesContainer}
            emptyPlaceholderDescription="Variables help you store data"
            emptyPlaceholderTitle="Variables"
            helpPagePath="/variables"
            onComputeAllVariableNames={() => []}
            isListLocked={false}
          />
        </FixedHeightFlexContainer>
      </div>
    </TouchGestureHarness>
  );
};
VariablesStory.storyName = 'Variables (handle)';

export const EffectsStory = (): React.Node => (
  <TouchGestureHarness
    title="Effects"
    mode="handle"
    gestureIds={[
      'flick',
      'grabAndMove',
      'holdThenDrag',
      'tap',
      'interruptedDrag',
    ]}
    notes="Effects are dragged from their grip. Add effects with the button to make the list scroll."
  >
    <div style={{ height: FRAME_HEIGHT, width: FRAME_WIDTH }}>
      <FixedHeightFlexContainer height={FRAME_HEIGHT}>
        <EffectsList
          target="layer"
          layerRenderingType="2d+3d"
          project={testProject.project}
          resourceManagementProps={fakeResourceManagementProps}
          projectScopedContainersAccessor={
            testProject.testSceneProjectScopedContainersAccessor
          }
          effectsContainer={testProject.layerWithEffects.getEffects()}
          onEffectsRenamed={action('effects renamed')}
          onEffectsUpdated={action('effects updated')}
          onEffectAdded={action('effect added')}
        />
      </FixedHeightFlexContainer>
    </div>
  </TouchGestureHarness>
);
EffectsStory.storyName = 'Effects (handle)';

export const LayersStory = (): React.Node => {
  const [chosenLayer, setChosenLayer] = React.useState<string>('');
  const [selectedLayer, setSelectedLayer] = React.useState<gdLayer | null>(
    null
  );
  return (
    <TouchGestureHarness
      title="Layers"
      mode="row"
      gestureIds={[
        'flick',
        'grabAndMove',
        'holdThenDrag',
        'wobbleThenDrag',
        'longPress',
        'holdThenDragBeforeMenu',
        'tap',
        'interruptedDrag',
      ]}
      notes="Add layers with the button to make the list scroll."
    >
      <div style={{ height: FRAME_HEIGHT, width: FRAME_WIDTH }}>
        <LayersList
          project={testProject.project}
          eventsFunctionsExtension={null}
          eventsBasedObject={null}
          chosenLayer={chosenLayer}
          onChooseLayer={setChosenLayer}
          selectedLayer={selectedLayer}
          onSelectLayer={setSelectedLayer}
          onEditLayerEffects={action('onEditLayerEffects')}
          onLayersModified={action('onLayersModified')}
          onLayersVisibilityInEditorChanged={action(
            'onLayersVisibilityInEditorChanged'
          )}
          onEditLayer={action('onEditLayer')}
          onRemoveLayer={(layerName, cb) => {
            cb(true);
          }}
          onLayerRenamed={action('onLayerRenamed')}
          onCreateLayer={action('onCreateLayer')}
          layout={testProject.testLayout}
          layersContainer={testProject.testLayout.getLayers()}
          hotReloadPreviewButtonProps={fakeHotReloadPreviewButtonProps}
          onBackgroundColorChanged={action('onBackgroundColorChanged')}
          gameEditorMode={'embedded-game'}
        />
      </div>
    </TouchGestureHarness>
  );
};
LayersStory.storyName = 'Layers (row)';

const TABS_COUNT = 12;

export const EditorTabsStory = (): React.Node => {
  const [activeTab, setActiveTab] = React.useState(0);
  const [tabIndexes, setTabIndexes] = React.useState(
    Array.from({ length: TABS_COUNT }, (_, index) => index)
  );
  return (
    <TouchGestureHarness
      title="Editor tabs"
      mode="row"
      gestureIds={[
        'flick',
        'grabAndMove',
        'holdThenDrag',
        'wobbleThenDrag',
        'longPress',
        'tap',
      ]}
      notes="Swipe sideways to scroll the tabs. Hold a tab until it lifts to reorder it; the first tab stays in place."
    >
      <div style={{ width: FRAME_WIDTH }}>
        <ClosableTabs
          renderTabs={() => (
            <>
              {tabIndexes.map((tabIndex, position) => (
                <DraggableClosableTab
                  key={tabIndex}
                  index={position}
                  active={activeTab === tabIndex}
                  closable={position !== 0}
                  label={
                    position === 0 ? null : `Tab ${tabIndex} with a long label`
                  }
                  icon={position === 0 ? <span>🏠</span> : null}
                  onClick={() => setActiveTab(tabIndex)}
                  onActivated={action('tab activated')}
                  onHover={action('onHover')}
                  onClose={action('close tab')}
                  onCloseAll={action('close all')}
                  onCloseOthers={action('close others')}
                  maxWidth={200}
                  // $FlowFixMe[incompatible-type] - only the index is used.
                  onBeginDrag={() => ({ key: `tab-${tabIndex}` })}
                  onDrop={toIndex => {
                    setTabIndexes(tabIndexes => {
                      const newTabIndexes = tabIndexes.filter(
                        otherTabIndex => otherTabIndex !== tabIndex
                      );
                      newTabIndexes.splice(toIndex, 0, tabIndex);
                      return newTabIndexes;
                    });
                  }}
                />
              ))}
            </>
          )}
        />
      </div>
    </TouchGestureHarness>
  );
};
EditorTabsStory.storyName = 'Editor tabs (row)';
