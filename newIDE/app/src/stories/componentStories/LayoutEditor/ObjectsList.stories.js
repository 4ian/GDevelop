// @flow

import * as React from 'react';
import { I18n } from '@lingui/react';
import { action } from '@storybook/addon-actions';

// Keep first as it creates the `global.gd` object:
import { testProject } from '../../GDevelopJsInitializerDecorator';

import fakeHotReloadPreviewButtonProps from '../../FakeHotReloadPreviewButtonProps';
import paperDecorator from '../../PaperDecorator';
import alertDecorator from '../../AlertDecorator';
import ObjectsList from '../../../ObjectsList';
import DragAndDropContextProvider from '../../../UI/DragAndDrop/DragAndDropContextProvider';
import SerializedObjectDisplay from '../../SerializedObjectDisplay';
import fakeResourceManagementProps from '../../FakeResourceManagement';
import { AssetStoreStateProvider } from '../../../AssetStore/AssetStoreContext';
import { AssetStoreNavigatorStateProvider } from '../../../AssetStore/AssetStoreNavigator';
import { ObjectStoreStateProvider } from '../../../AssetStore/ObjectStoreContext';
import { BundleStoreStateProvider } from '../../../AssetStore/Bundles/BundleStoreContext';
import { PrivateGameTemplateStoreStateProvider } from '../../../AssetStore/PrivateGameTemplates/PrivateGameTemplateStoreContext';
import AuthenticatedUserContext from '../../../Profile/AuthenticatedUserContext';
import { fakeSilverAuthenticatedUser } from '../../../fixtures/GDevelopServicesTestData';

export default {
  title: 'LayoutEditor/ObjectsList',
  component: ObjectsList,
  decorators: [alertDecorator, paperDecorator],
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

// Shared props used by all stories. Must be built at render time (not at
// module load): `testProject` is only usable once GDevelop.js is initialized.
const getSharedProps = () => ({
  getThumbnail: () => 'res/unknown32.png',
  project: testProject.project,
  layout: testProject.testLayout,
  eventsFunctionsExtension: null,
  eventsBasedObject: null,
  projectScopedContainersAccessor:
    testProject.testSceneProjectScopedContainersAccessor,
  globalObjectsContainer: testProject.project.getObjects(),
  objectsContainer: testProject.testLayout.getObjects(),
  resourceManagementProps: fakeResourceManagementProps,
  onEditObject: action('On edit object'),
  onOpenEventBasedObjectEditor: action('On edit children'),
  onOpenEventBasedObjectVariantEditor: action('On edit variant'),
  onExportAssets: action('On export assets'),
  onImportAssets: action('On import assets'),
  onAddObjectInstance: action('On add instance to the scene'),
  onObjectCreated: action('On object created'),
  onObjectEdited: action('On object edited'),
  getValidatedObjectOrGroupName: (newName: string) => newName,
  onDeleteObjects: (objectsWithContext: any, cb: (doRemove: boolean) => void) =>
    cb(true),
  onRenameObjectFolderOrObjectWithContextFinish: (
    objectWithContext: any,
    newName: string,
    cb: (success: boolean) => void
  ) => cb(true),
  onSetAsGlobalObject: action('onSetAsGlobalObject'),
  hotReloadPreviewButtonProps: fakeHotReloadPreviewButtonProps,
  onWillInstallExtension: action('extension will be installed'),
  onExtensionInstalled: action('onExtensionInstalled'),
});

export const Default = (): React.Node => (
  <AssetStoreProviders>
    <DragAndDropContextProvider>
      <div style={{ height: 400 }}>
        <ObjectsList
          {...getSharedProps()}
          selectedObjectFolderOrObjectsWithContext={[]}
          onObjectFolderOrObjectsWithContextSelected={() => {}}
          isListLocked={false}
        />
      </div>
    </DragAndDropContextProvider>
  </AssetStoreProviders>
);

export const WithMultiSelection = (): React.Node => {
  // Pre-select the first 2 children (arbitrary visual default for the story).
  const INITIAL_SELECTION_COUNT = 2;
  const rootFolder = testProject.testLayout.getObjects().getRootFolder();
  const selectedObjectFolderOrObjectsWithContext = [];
  for (
    let i = 0;
    i < Math.min(INITIAL_SELECTION_COUNT, rootFolder.getChildrenCount());
    i++
  ) {
    selectedObjectFolderOrObjectsWithContext.push({
      objectFolderOrObject: rootFolder.getChildAt(i),
      global: false,
    });
  }

  return (
    <AssetStoreProviders>
      <DragAndDropContextProvider>
        <div style={{ height: 400 }}>
          <ObjectsList
            {...getSharedProps()}
            selectedObjectFolderOrObjectsWithContext={
              selectedObjectFolderOrObjectsWithContext
            }
            onObjectFolderOrObjectsWithContextSelected={action(
              'On objects selected'
            )}
            isListLocked={false}
          />
        </div>
      </DragAndDropContextProvider>
    </AssetStoreProviders>
  );
};

// ---------------------------------------------------------------------------
// A stateful story for the visual tests (see newIDE/visual-tests): the
// selection is managed like SceneEditor does, on a small container with a
// known content, and exposed on `window.objectsListManipulations` so a test
// can check that what the list displays is what the app holds.
// ---------------------------------------------------------------------------

let playgroundContainers: {|
  objectsContainer: gdObjectsContainer,
  globalObjectsContainer: gdObjectsContainer,
|} | null = null;
const getOrCreatePlaygroundContainers = () => {
  if (playgroundContainers) return playgroundContainers;
  const gd = global.gd;
  const project = testProject.project;
  const objectsContainer = new gd.ObjectsContainer(gd.ObjectsContainer.Unknown);
  const globalObjectsContainer = new gd.ObjectsContainer(
    gd.ObjectsContainer.Unknown
  );
  const rootFolder = objectsContainer.getRootFolder();
  objectsContainer.insertNewObjectInFolder(
    project,
    'Sprite',
    'Player',
    rootFolder,
    0
  );
  objectsContainer.insertNewObjectInFolder(
    project,
    'Sprite',
    'Enemy1',
    rootFolder,
    1
  );
  const enemiesFolder = rootFolder.insertNewFolder('Enemies', 2);
  objectsContainer.insertNewObjectInFolder(
    project,
    'Sprite',
    'EnemyBoss',
    enemiesFolder,
    0
  );
  objectsContainer.insertNewObjectInFolder(
    project,
    'Sprite',
    'Wall',
    enemiesFolder,
    1
  );
  objectsContainer.insertNewObjectInFolder(
    project,
    'Sprite',
    'Background',
    rootFolder,
    3
  );
  globalObjectsContainer.insertNewObjectInFolder(
    project,
    'Sprite',
    'GlobalPlayer',
    globalObjectsContainer.getRootFolder(),
    0
  );
  playgroundContainers = { objectsContainer, globalObjectsContainer };
  return playgroundContainers;
};

const readAllNamesInFolder = (
  folder: gdObjectFolderOrObject
): Array<string> => {
  const names = [];
  for (let i = 0; i < folder.getChildrenCount(); i++) {
    const child = folder.getChildAt(i);
    if (child.isFolder()) {
      names.push(child.getFolderName(), ...readAllNamesInFolder(child));
    } else {
      names.push(child.getObject().getName());
    }
  }
  return names;
};

type SelectedItems = Array<{|
  objectFolderOrObject: gdObjectFolderOrObject,
  global: boolean,
|}>;

const SelectionPlaygroundStory = () => {
  const {
    objectsContainer,
    globalObjectsContainer,
  } = getOrCreatePlaygroundContainers();
  const [selection, setSelection] = React.useState<SelectedItems>([]);
  const selectionRef = React.useRef<SelectedItems>(selection);
  const selectionNotificationsCountRef = React.useRef(0);

  const onObjectFolderOrObjectsWithContextSelected = React.useCallback(
    (items: SelectedItems = []) => {
      selectionNotificationsCountRef.current++;
      // Like SceneEditor: the selection stays within a single section.
      const sameSectionItems: SelectedItems =
        items.length === 0
          ? []
          : items.filter(item => item.global === items[0].global);
      selectionRef.current = sameSectionItems;
      setSelection(sameSectionItems);
    },
    []
  );

  React.useEffect(
    () => {
      window.objectsListManipulations = {
        readState: () => ({
          sceneNames: readAllNamesInFolder(objectsContainer.getRootFolder()),
          globalNames: readAllNamesInFolder(
            globalObjectsContainer.getRootFolder()
          ),
          selectionNames: selectionRef.current.map(item =>
            item.objectFolderOrObject.isFolder()
              ? item.objectFolderOrObject.getFolderName()
              : item.objectFolderOrObject.getObject().getName()
          ),
          selectionNotificationsCount: selectionNotificationsCountRef.current,
        }),
      };
    },
    [objectsContainer, globalObjectsContainer]
  );

  return (
    <AssetStoreProviders>
      <DragAndDropContextProvider>
        <div style={{ height: 400 }}>
          <ObjectsList
            {...getSharedProps()}
            globalObjectsContainer={globalObjectsContainer}
            objectsContainer={objectsContainer}
            selectedObjectFolderOrObjectsWithContext={selection}
            onObjectFolderOrObjectsWithContextSelected={
              onObjectFolderOrObjectsWithContextSelected
            }
            isListLocked={false}
          />
        </div>
      </DragAndDropContextProvider>
    </AssetStoreProviders>
  );
};

export const SelectionPlayground = (): React.Node => (
  <SelectionPlaygroundStory />
);

export const WithSerializedObjectView = (): React.Node => (
  <AssetStoreProviders>
    <DragAndDropContextProvider>
      <SerializedObjectDisplay object={testProject.testLayout}>
        <div style={{ height: 250 }}>
          <ObjectsList
            {...getSharedProps()}
            selectedObjectFolderOrObjectsWithContext={[]}
            onObjectFolderOrObjectsWithContextSelected={() => {}}
            isListLocked={false}
          />
        </div>
      </SerializedObjectDisplay>
    </DragAndDropContextProvider>
  </AssetStoreProviders>
);

export const Locked = (): React.Node => (
  <AssetStoreProviders>
    <DragAndDropContextProvider>
      <div style={{ height: 400 }}>
        <ObjectsList
          {...getSharedProps()}
          selectedObjectFolderOrObjectsWithContext={[]}
          onObjectFolderOrObjectsWithContextSelected={() => {}}
          isListLocked={true}
        />
      </div>
    </DragAndDropContextProvider>
  </AssetStoreProviders>
);
