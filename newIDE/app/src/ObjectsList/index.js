// @flow
import { Trans } from '@lingui/macro';
import { I18n } from '@lingui/react';
import { type I18n as I18nType } from '@lingui/core';
import { t } from '@lingui/macro';

import * as React from 'react';
import { AutoSizer } from 'react-virtualized';
import Background from '../UI/Background';
import CompactSearchBar from '../UI/CompactSearchBar';
import NewObjectDialog from '../AssetStore/NewObjectDialog';
import AssetSwappingDialog from '../AssetStore/AssetSwappingDialog';
import newNameGenerator from '../Utils/NewNameGenerator';
import Window from '../Utils/Window';
import { showWarningBox } from '../UI/Messages/MessageBox';
import { type ObjectEditorTab } from '../ObjectEditor/ObjectEditorDialog';
import type { ObjectWithContext } from '../ObjectsList/EnumerateObjects';
import TreeView, {
  type TreeViewInterface,
  type MenuButton,
} from '../UI/TreeView';
import { type MenuItemTemplate } from '../UI/Menu/Menu.flow';
import { type UnsavedChanges } from '../MainFrame/UnsavedChangesContext';
import { type HotReloadPreviewButtonProps } from '../HotReload/HotReloadPreviewButton';
import useForceUpdate from '../Utils/UseForceUpdate';
import { type ResourceManagementProps } from '../ResourcesList/ResourceSource';
import { Column } from '../UI/Grid';
import Add from '../UI/CustomSvgIcons/Add';
import InAppTutorialContext from '../InAppTutorial/InAppTutorialContext';
import {
  getFoldersAscendanceWithoutRootFolder,
  type ObjectFolderOrObjectWithContext,
} from './EnumerateObjectFolderOrObject';
import { mapFor } from '../Utils/MapFor';
import { LineStackLayout } from '../UI/Layout';
import KeyboardShortcuts from '../UI/KeyboardShortcuts';
import Link from '../UI/Link';
import { getHelpLink } from '../Utils/HelpLink';
import useAlertDialog from '../UI/Alert/useAlertDialog';
import { useResponsiveWindowSize } from '../UI/Responsive/ResponsiveWindowMeasurer';
import ErrorBoundary from '../UI/ErrorBoundary';
import { getInsertionParentAndPositionFromSelection } from '../Utils/ObjectFolders';
import {
  ObjectTreeViewItemContent,
  getObjectTreeViewItemId,
  type ObjectTreeViewItemProps,
} from './ObjectTreeViewItemContent';
import {
  ObjectFolderTreeViewItemContent,
  getObjectFolderTreeViewItemId,
  expandAllSubfolders,
  folderColors,
  type ObjectFolderTreeViewItemProps,
} from './ObjectFolderTreeViewItemContent';
import { ProjectScopedContainersAccessor } from '../InstructionOrExpression/EventsScope';
import { type HTMLDataset } from '../Utils/HTMLDataset';
import type { MessageDescriptor } from '../Utils/i18n/MessageDescriptor.flow';
import type { EventsScope } from '../InstructionOrExpression/EventsScope';
import { type InstallAssetOutput } from '../AssetStore/InstallAsset';
import { exceptionallyGuardAgainstDeadObject } from '../Utils/IsNullPtr';

const gd: libGDevelop = global.gd;

const sceneObjectsRootFolderId = 'scene-objects';
const globalObjectsRootFolderId = 'global-objects';
const globalObjectsEmptyPlaceholderId = 'global-empty-placeholder';
const sceneObjectsEmptyPlaceholderId = 'scene-empty-placeholder';

const globalObjectsWikiLink = getHelpLink(
  '/interface/scene-editor/global-objects/',
  ':~:text=Global%20objects%20are%20objects%20which,are%20usable%20by%20all%20Scenes'
);

const styles = {
  listContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  autoSizerContainer: { flex: 1 },
  autoSizer: { width: '100%' },
  colorPickerCard: {
    position: 'fixed',
    zIndex: 1000,
    background: '#1e1e1e',
    borderRadius: 12,
    border: '0.5px solid rgba(255,255,255,0.1)',
    width: 300,
    overflow: 'hidden',
    boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
    userSelect: 'none',
  },
  colorPickerHeader: {
    padding: '14px 16px 12px',
    borderBottom: '0.5px solid rgba(255,255,255,0.08)',
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    cursor: 'grab',
  },
  colorPickerBody: {
    padding: 16,
  },
  colorPickerGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: 6,
    marginBottom: 14,
  },
  colorPickerHexRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
    background: 'rgba(255,255,255,0.05)',
    border: '0.5px solid rgba(255,255,255,0.1)',
    borderRadius: 8,
    padding: '7px 10px',
  },
  colorPickerHexDot: {
    width: 22,
    height: 22,
    borderRadius: 4,
    flexShrink: 0,
  },
  colorPickerHexText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.45)',
    fontFamily: 'monospace',
  },
  colorPickerCustomBtn: {
    marginLeft: 'auto',
    display: 'flex',
    alignItems: 'center',
    gap: 5,
    padding: '4px 10px',
    borderRadius: 6,
    border: '0.5px solid rgba(255,255,255,0.2)',
    background: 'rgba(255,255,255,0.07)',
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    cursor: 'pointer',
  },
  colorPickerActions: {
    display: 'flex',
    gap: 8,
  },
  colorPickerBtnConfirm: {
    flex: 1,
    padding: '8px',
    borderRadius: 8,
    border: 'none',
    background: '#6d28d9',
    color: 'white',
    fontSize: 13,
    fontWeight: 500,
    cursor: 'pointer',
  },
  colorPickerBtnReset: {
    padding: '8px 14px',
    borderRadius: 8,
    border: '0.5px solid rgba(255,255,255,0.15)',
    background: 'transparent',
    color: 'rgba(255,255,255,0.5)',
    fontSize: 20,
    cursor: 'pointer',
    lineHeight: 1,
  },
  colorPickerBtnCancel: {
    padding: '8px 14px',
    borderRadius: 8,
    border: '0.5px solid rgba(255,255,255,0.15)',
    background: 'transparent',
    color: 'rgba(255,255,255,0.5)',
    fontSize: 13,
    cursor: 'pointer',
  },
};

export const getLabelsForObjectsAndGroupsLists = (
  scope: EventsScope
): {|
  localScopeObjectsTitle: MessageDescriptor,
  higherScopeObjectsTitle: MessageDescriptor | null,
  localScopeGroupsTitle: MessageDescriptor | null,
  higherScopeGroupsTitle: MessageDescriptor | null,
|} => {
  if (scope.layout) {
    return {
      localScopeObjectsTitle: t`Scene Objects`,
      higherScopeObjectsTitle: t`Global Objects`,
      localScopeGroupsTitle: t`Scene Groups`,
      higherScopeGroupsTitle: t`Global Groups`,
    };
  } else if (scope.eventsBasedObject) {
    return {
      localScopeObjectsTitle: t`Object's children`,
      higherScopeObjectsTitle: null,
      localScopeGroupsTitle: t`Object's groups`,
      higherScopeGroupsTitle: null,
    };
  }

  throw new Error('Scope not recognized.');
};

export const getTreeViewItemIdFromObjectFolderOrObject = (
  objectFolderOrObject: gdObjectFolderOrObject
): string => {
  if (objectFolderOrObject.isFolder()) {
    return getObjectFolderTreeViewItemId(objectFolderOrObject);
  }
  const object = exceptionallyGuardAgainstDeadObject(
    objectFolderOrObject.getObject()
  );
  if (!object) return `deleted-${objectFolderOrObject.ptr}`;
  return getObjectTreeViewItemId(object);
};

export interface TreeViewItemContent {
  getName(): string | React.Node;
  getId(): string;
  getHtmlId(index: number): ?string;
  getDataSet(): ?HTMLDataset;
  getThumbnail(): ?string;
  onClick(): void;
  buildMenuTemplate(i18n: I18nType, index: number): Array<MenuItemTemplate>;
  getRightButton(i18n: I18nType): ?MenuButton;
  renderRightComponent(i18n: I18nType): ?React.Node;
  rename(newName: string): void;
  edit(): void;
  delete(): void;
  copy(): void;
  paste(): void;
  cut(): void;
  duplicate(): void;
  getIndex(): number;
  isDescendantOf(treeViewItemContent: TreeViewItemContent): boolean;
  isSibling(treeViewItemContent: TreeViewItemContent): boolean;
  isGlobal(): boolean;
  is3D(): boolean;
  getObjectFolderOrObject(): gdObjectFolderOrObject | null;
}

interface TreeViewItem {
  isRoot?: boolean;
  isPlaceholder?: boolean;
  +content: TreeViewItemContent;
  getChildren(i18n: I18nType): ?Array<TreeViewItem>;
}

class LeafTreeViewItem implements TreeViewItem {
  content: TreeViewItemContent;

  constructor(content: TreeViewItemContent) {
    this.content = content;
  }

  getChildren(i18n: I18nType): ?Array<TreeViewItem> {
    return null;
  }
}

// $FlowFixMe[incompatible-type]
class PlaceHolderTreeViewItem implements TreeViewItem {
  isPlaceholder = true;
  content: TreeViewItemContent;

  constructor(id: string, label: string | React.Node) {
    this.content = new LabelTreeViewItemContent(id, label);
  }

  getChildren(i18n: I18nType): ?Array<TreeViewItem> {
    return null;
  }
}

const createTreeViewItem = ({
  objectFolderOrObject,
  isGlobal,
  objectFolderTreeViewItemProps,
  objectTreeViewItemProps,
}: {|
  objectFolderOrObject: gdObjectFolderOrObject,
  isGlobal: boolean,
  objectFolderTreeViewItemProps: ObjectFolderTreeViewItemProps,
  objectTreeViewItemProps: ObjectTreeViewItemProps,
|}): TreeViewItem => {
  if (objectFolderOrObject.isFolder()) {
    return new ObjectFolderTreeViewItem({
      objectFolderOrObject: objectFolderOrObject,
      global: isGlobal,
      isRoot: false,
      objectFolderTreeViewItemProps,
      objectTreeViewItemProps,
      content: new ObjectFolderTreeViewItemContent(
        objectFolderOrObject,
        isGlobal,
        objectFolderTreeViewItemProps
      ),
    });
  } else {
    return new LeafTreeViewItem(
      new ObjectTreeViewItemContent(
        objectFolderOrObject,
        isGlobal,
        objectTreeViewItemProps
      )
    );
  }
};

// $FlowFixMe[incompatible-type]
class ObjectFolderTreeViewItem implements TreeViewItem {
  isRoot: boolean;
  global: boolean;
  isPlaceholder = false;
  content: TreeViewItemContent;
  objectFolderOrObject: gdObjectFolderOrObject;
  placeholder: ?PlaceHolderTreeViewItem;
  objectFolderTreeViewItemProps: ObjectFolderTreeViewItemProps;
  objectTreeViewItemProps: ObjectTreeViewItemProps;

  constructor({
    objectFolderOrObject,
    global,
    isRoot,
    content,
    placeholder,
    objectFolderTreeViewItemProps,
    objectTreeViewItemProps,
  }: {|
    objectFolderOrObject: gdObjectFolderOrObject,
    global: boolean,
    isRoot: boolean,
    content: TreeViewItemContent,
    placeholder?: PlaceHolderTreeViewItem,
    objectFolderTreeViewItemProps: ObjectFolderTreeViewItemProps,
    objectTreeViewItemProps: ObjectTreeViewItemProps,
  |}) {
    this.isRoot = isRoot;
    this.global = global;
    this.content = content;
    this.objectFolderOrObject = objectFolderOrObject;
    this.placeholder = placeholder;
    this.objectFolderTreeViewItemProps = objectFolderTreeViewItemProps;
    this.objectTreeViewItemProps = objectTreeViewItemProps;
  }

  getChildren(i18n: I18nType): ?Array<TreeViewItem> {
    if (!exceptionallyGuardAgainstDeadObject(this.objectFolderOrObject))
      return this.placeholder ? [this.placeholder] : [];

    if (this.objectFolderOrObject.getChildrenCount() === 0) {
      return this.placeholder ? [this.placeholder] : [];
    }
    return mapFor(0, this.objectFolderOrObject.getChildrenCount(), i => {
      const child = this.objectFolderOrObject.getChildAt(i);
      return createTreeViewItem({
        objectFolderOrObject: child,
        isGlobal: this.global,
        objectFolderTreeViewItemProps: this.objectFolderTreeViewItemProps,
        objectTreeViewItemProps: this.objectTreeViewItemProps,
      });
    });
  }
}

class LabelTreeViewItemContent implements TreeViewItemContent {
  id: string;
  label: string | React.Node;
  dataSet: { [string]: string };
  buildMenuTemplateFunction: (
    i18n: I18nType,
    index: number
  ) => Array<MenuItemTemplate>;
  rightButton: ?MenuButton;

  constructor(
    id: string,
    label: string | React.Node,
    rightButton?: MenuButton | null,
    buildMenuTemplateFunction?: () => Array<MenuItemTemplate>
  ) {
    this.id = id;
    this.label = label;
    this.buildMenuTemplateFunction = (i18n: I18nType, index: number) =>
      // $FlowFixMe[incompatible-type]
      [
        rightButton
          ? {
              id: rightButton.id,
              label: i18n._(rightButton.label),
              click: rightButton.click,
              enabled: rightButton.enabled,
            }
          : null,
        ...(buildMenuTemplateFunction ? buildMenuTemplateFunction() : []),
      ].filter(Boolean);
    this.rightButton = rightButton;
  }

  getName(): string | React.Node {
    return this.label;
  }

  getId(): string {
    return this.id;
  }

  getRightButton(i18n: I18nType): ?MenuButton {
    return this.rightButton;
  }

  getHtmlId(index: number): ?string {
    return this.id;
  }

  getDataSet(): ?HTMLDataset {
    return {};
  }

  getThumbnail(): ?string {
    return null;
  }

  onClick(): void {}

  // $FlowFixMe[missing-local-annot]
  buildMenuTemplate(i18n: I18nType, index: number) {
    return this.buildMenuTemplateFunction(i18n, index);
  }

  renderRightComponent(i18n: I18nType): ?React.Node {
    return null;
  }

  rename(newName: string): void {}

  edit(): void {}

  delete(): void {}

  copy(): void {}

  paste(): void {}

  cut(): void {}

  duplicate(): void {}

  getIndex(): number {
    return 0;
  }

  isDescendantOf(treeViewItemContent: TreeViewItemContent): boolean {
    return false;
  }

  isSibling(treeViewItemContent: TreeViewItemContent): boolean {
    return false;
  }

  isGlobal(): boolean {
    return false;
  }

  is3D(): boolean {
    return false;
  }

  getObjectFolderOrObject(): gdObjectFolderOrObject | null {
    return null;
  }
}

const getTreeViewItemName = (item: TreeViewItem) => item.content.getName();
const getTreeViewItemId = (item: TreeViewItem) => item.content.getId();
const getTreeViewItemHtmlId = (item: TreeViewItem, index: number) =>
  item.content.getHtmlId(index);
const getTreeViewItemChildren = (i18n: I18nType) => (item: TreeViewItem) =>
  item.getChildren(i18n);
const getTreeViewItemThumbnail = (item: TreeViewItem) =>
  item.content.getThumbnail();
const getTreeViewItemDataSet = (item: TreeViewItem) =>
  item.content.getDataSet();
const buildMenuTemplate = (i18n: I18nType) => (
  item: TreeViewItem,
  index: number
) => item.content.buildMenuTemplate(i18n, index);
const renderTreeViewItemRightComponent = (i18n: I18nType) => (
  item: TreeViewItem
) => item.content.renderRightComponent(i18n);
const renameItem = (item: TreeViewItem, newName: string) => {
  item.content.rename(newName);
};
const onClickItem = (item: TreeViewItem) => {
  item.content.onClick();
};
const editItem = (item: TreeViewItem) => {
  item.content.edit();
};
const deleteItem = (item: TreeViewItem) => {
  item.content.delete();
};
const duplicateItem = (item: TreeViewItem) => {
  item.content.duplicate();
};
const getTreeViewItemRightButton = (i18n: I18nType) => (item: TreeViewItem) =>
  item.content.getRightButton(i18n);

export const objectWithContextReactDndType = 'GD_OBJECT_WITH_CONTEXT';

const objectTypeToDefaultName = {
  Sprite: 'NewSprite',
  'TiledSpriteObject::TiledSprite': 'NewTiledSprite',
  'ParticleSystem::ParticleEmitter': 'NewParticlesEmitter',
  'PanelSpriteObject::PanelSprite': 'NewPanelSprite',
  'PrimitiveDrawing::Drawer': 'NewShapePainter',
  'TextObject::Text': 'NewText',
  'BBText::BBText': 'NewBBText',
  'BitmapText::BitmapTextObject': 'NewBitmapText',
  'TextEntryObject::TextEntry': 'NewTextEntry',
  'TileMap::SimpleTileMap': 'NewTileMap',
  'TileMap::TileMap': 'NewExternalTileMap',
  'TileMap::CollisionMask': 'NewExternalTileMapMask',
  'MyDummyExtension::DummyObject': 'NewDummyObject',
  'Lighting::LightObject': 'NewLight',
  'TextInput::TextInputObject': 'NewTextInput',
  'Scene3D::Model3DObject': 'New3DModel',
  'Scene3D::Cube3DObject': 'New3DBox',
  'SpineObject::SpineObject': 'NewSpine',
  'Video::VideoObject': 'NewVideo',
};

export type ObjectsListInterface = {|
  forceUpdateList: () => void,
  openNewObjectDialog: () => void,
  closeNewObjectDialog: () => void,
|};

type Props = {|
  project: gdProject,
  layout: ?gdLayout,
  eventsFunctionsExtension: gdEventsFunctionsExtension | null,
  eventsBasedObject: gdEventsBasedObject | null,
  initialInstances?: gdInitialInstancesContainer,
  projectScopedContainersAccessor: ProjectScopedContainersAccessor,
  globalObjectsContainer: gdObjectsContainer | null,
  objectsContainer: gdObjectsContainer,

  onSelectAllInstancesOfObjectInLayout?: string => void,
  resourceManagementProps: ResourceManagementProps,
  onDeleteObjects: (
    objectWithContext: ObjectWithContext[],
    cb: (boolean) => void
  ) => void,
  onRenameObjectFolderOrObjectWithContextFinish: (
    objectFolderOrObjectWithContext: ObjectFolderOrObjectWithContext,
    newName: string,
    cb: (boolean) => void
  ) => void,
  selectedObjectFolderOrObjectsWithContext: Array<ObjectFolderOrObjectWithContext>,

  beforeSetAsGlobalObject?: (objectName: string) => boolean,
  canSetAsGlobalObject?: boolean,
  onSetAsGlobalObject: (object: gdObject) => void,

  onEditObject: (object: gdObject, initialTab: ?ObjectEditorTab) => void,
  onOpenEventBasedObjectEditor: (
    extensionName: string,
    eventsBasedObjectName: string
  ) => void,
  onOpenEventBasedObjectVariantEditor: (
    extensionName: string,
    eventsBasedObjectName: string,
    variantName: string
  ) => void,
  onExportAssets: () => void,
  onImportAssets: () => void,
  onObjectCreated: (
    objects: Array<gdObject>,
    isTheFirstOfItsTypeInProject: boolean
  ) => void,
  onObjectEdited: (
    objectWithContext: ObjectWithContext,
    hasResourceChanged: boolean
  ) => void,
  onObjectFolderOrObjectWithContextSelected: (
    ?ObjectFolderOrObjectWithContext
  ) => void,
  onObjectPasted?: gdObject => void,
  getValidatedObjectOrGroupName: (newName: string, global: boolean) => string,
  onAddObjectInstance: (objectName: string) => void,
  onWillInstallExtension: (extensionNames: Array<string>) => void,
  onExtensionInstalled: (extensionNames: Array<string>) => void,

  getThumbnail: (
    project: gdProject,
    objectConfiguration: gdObjectConfiguration
  ) => string,
  unsavedChanges?: ?UnsavedChanges,
  hotReloadPreviewButtonProps: HotReloadPreviewButtonProps,
  isListLocked: boolean,
|};

// ─── Componente ColorPickerDialog ────────────────────────────────────────────

const PRESET_COLORS = [
  '#ef4444',
  '#f97316',
  '#eab308',
  '#22c55e',
  '#3b82f6',
  '#a855f7',
  '#ec4899',
  '#14b8a6',
  '#6366f1',
  '#f43f5e',
  '#84cc16',
  '#06b6d4',
  '#f59e0b',
  '#78716c',
];

type ColorPickerDialogProps = {|
  objectFolder: gdObjectFolderOrObject,
  isGlobal: boolean,
  onClose: () => void,
  onForceUpdate: () => void,
|};

const ColorPickerDialog = ({
  objectFolder,
  isGlobal,
  onClose,
  onForceUpdate,
}: ColorPickerDialogProps) => {
  const currentColor = folderColors.get(objectFolder, isGlobal) || '#a855f7';
  const [selectedColor, setSelectedColor] = React.useState(currentColor);
  const nativeInputRef = React.useRef<HTMLInputElement | null>(null);

  const [pos, setPos] = React.useState({
    x: window.innerWidth / 2 - 150,
    y: window.innerHeight / 2 - 160,
  });
  const dragging = React.useRef(false);
  const dragOffset = React.useRef({ x: 0, y: 0 });

  const onMouseDown = (e: MouseEvent) => {
    dragging.current = true;
    dragOffset.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
    e.preventDefault();
  };

  React.useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!dragging.current) return;
      setPos({
        x: e.clientX - dragOffset.current.x,
        y: e.clientY - dragOffset.current.y,
      });
    };
    const onMouseUp = () => {
      dragging.current = false;
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, []);

  const handleConfirm = () => {
    folderColors.set(objectFolder, isGlobal, selectedColor);
    onForceUpdate();
    onClose();
  };

  const handleReset = () => {
    // Reset to default grey instead of removing, so the SVG folder icon is kept
    folderColors.set(objectFolder, isGlobal, '#6b7280');
    onForceUpdate();
    onClose();
  };

  const handleCustomPick = () => {
    if (nativeInputRef.current) nativeInputRef.current.click();
  };

  const folderName = objectFolder.getFolderName();

  return (
    <div
      style={{ ...styles.colorPickerCard, left: pos.x, top: pos.y }}
      onClick={e => e.stopPropagation()}
    >
      <div style={styles.colorPickerHeader} onMouseDown={onMouseDown}>
        <svg
          width="16"
          height="16"
          viewBox="0 0 80 60"
          style={{ flexShrink: 0 }}
        >
          <path
            d="M0,6 Q0,0 6,0 L26,0 L30,6 L74,6 Q80,6 80,12 L80,54 Q80,60 74,60 L6,60 Q0,60 0,54 Z"
            fill={selectedColor}
          />
          <path
            d="M0,14 L80,14 L80,54 Q80,60 74,60 L6,60 Q0,60 0,54 Z"
            fill="rgba(255,255,255,0.18)"
          />
        </svg>
        <span style={{ fontSize: 14, fontWeight: 500, color: '#e5e5e5' }}>
          Folder color
        </span>
        <span
          style={{
            fontSize: 13,
            color: 'rgba(255,255,255,0.4)',
            marginLeft: 'auto',
          }}
        >
          {folderName}
        </span>
      </div>

      <div style={styles.colorPickerBody}>
        <div style={styles.colorPickerGrid}>
          {PRESET_COLORS.map(color => (
            <div
              key={color}
              style={{
                width: 32,
                height: 32,
                borderRadius: 6,
                cursor: 'pointer',
                background: color,
                boxSizing: 'border-box',
                border:
                  selectedColor === color
                    ? '2px solid white'
                    : '2px solid transparent',
                boxShadow:
                  selectedColor === color
                    ? '0 0 0 1px rgba(255,255,255,0.3)'
                    : 'none',
              }}
              onClick={() => setSelectedColor(color)}
            />
          ))}
        </div>

        <div style={styles.colorPickerHexRow}>
          <div
            style={{ ...styles.colorPickerHexDot, background: selectedColor }}
          />
          <span style={styles.colorPickerHexText}>{selectedColor}</span>
          <button
            style={styles.colorPickerCustomBtn}
            onClick={handleCustomPick}
          >
            ✎ Custom
          </button>
          <input
            ref={nativeInputRef}
            type="color"
            value={selectedColor}
            onChange={e => setSelectedColor(e.target.value)}
            style={{
              position: 'absolute',
              opacity: 0,
              width: 0,
              height: 0,
              pointerEvents: 'none',
            }}
          />
        </div>

        <div style={styles.colorPickerActions}>
          <button style={styles.colorPickerBtnConfirm} onClick={handleConfirm}>
            Confirm
          </button>
          <button
            style={styles.colorPickerBtnReset}
            onClick={handleReset}
            title="Reset color"
          >
            🗑
          </button>
          <button
            style={styles.colorPickerBtnCancel}
            onClick={onClose}
            title="Cancel"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
};
// ─────────────────────────────────────────────────────────────────────────────

const ObjectsList = React.forwardRef<Props, ObjectsListInterface>(
  (
    {
      project,
      layout,
      eventsFunctionsExtension,
      eventsBasedObject,
      initialInstances,
      projectScopedContainersAccessor,
      globalObjectsContainer,
      objectsContainer,
      resourceManagementProps,
      onSelectAllInstancesOfObjectInLayout,
      onDeleteObjects,
      onRenameObjectFolderOrObjectWithContextFinish,
      selectedObjectFolderOrObjectsWithContext,

      beforeSetAsGlobalObject,
      canSetAsGlobalObject,
      onSetAsGlobalObject,

      onEditObject,
      onOpenEventBasedObjectEditor,
      onOpenEventBasedObjectVariantEditor,
      onExportAssets,
      onImportAssets,
      onObjectCreated,
      onObjectEdited,
      onObjectFolderOrObjectWithContextSelected,
      onObjectPasted,
      getValidatedObjectOrGroupName,
      onAddObjectInstance,
      onWillInstallExtension,
      onExtensionInstalled,

      getThumbnail,
      unsavedChanges,
      hotReloadPreviewButtonProps,
      isListLocked,
    }: Props,
    ref
  ) => {
    const { currentlyRunningInAppTutorial } = React.useContext(
      InAppTutorialContext
    );
    const [searchText, setSearchText] = React.useState('');
    const { showDeleteConfirmation } = useAlertDialog();
    const treeViewRef = React.useRef<?TreeViewInterface<TreeViewItem>>(null);
    const forceUpdate = useForceUpdate();
    const { isMobile } = useResponsiveWindowSize();

    const forceUpdateList = React.useCallback(
      () => {
        forceUpdate();
        if (treeViewRef.current) treeViewRef.current.forceUpdateList();
      },
      [forceUpdate]
    );

    const [newObjectDialogOpen, setNewObjectDialogOpen] = React.useState<{
      from: ObjectFolderOrObjectWithContext | null,
    } | null>(null);

    // ── STATO COLOR PICKER ──────────────────────────────────────────────────
    const [colorPickerOpen, setColorPickerOpen] = React.useState<{
      objectFolder: gdObjectFolderOrObject,
      isGlobal: boolean,
    } | null>(null);
    // ────────────────────────────────────────────────────────────────────────

    React.useImperativeHandle(ref, () => ({
      forceUpdateList: () => {
        forceUpdate();
        if (treeViewRef.current) treeViewRef.current.forceUpdateList();
      },
      openNewObjectDialog: () => {
        setNewObjectDialogOpen({ from: null });
      },
      closeNewObjectDialog: () => {
        setNewObjectDialogOpen(null);
      },
    }));

    const [
      objectAssetSwappingDialogOpen,
      setObjectAssetSwappingDialogOpen,
    ] = React.useState<{ objectWithContext: ObjectWithContext } | null>(null);

    const keyboardShortcutsRef = React.useRef<KeyboardShortcuts>(
      new KeyboardShortcuts({
        shortcutCallbacks: {},
      })
    );

    const scrollToItem = React.useCallback((itemId: string) => {
      if (treeViewRef.current) {
        treeViewRef.current.scrollToItemFromId(itemId);
      }
    }, []);

    const addObject = React.useCallback(
      (objectType: string) => {
        const defaultName = project.hasEventsBasedObject(objectType)
          ? 'New' +
            (project.getEventsBasedObject(objectType).getDefaultName() ||
              project.getEventsBasedObject(objectType).getName())
          : // $FlowFixMe[invalid-computed-prop]
            objectTypeToDefaultName[objectType] || 'NewObject';
        const name = newNameGenerator(
          defaultName,
          name =>
            objectsContainer.hasObjectNamed(name) ||
            (!!globalObjectsContainer &&
              globalObjectsContainer.hasObjectNamed(name))
        );

        const isTheFirstOfItsTypeInProject = !gd.UsedObjectTypeFinder.scanProject(
          project,
          objectType
        );

        let object;
        let objectFolderOrObjectWithContext;
        if (
          newObjectDialogOpen &&
          newObjectDialogOpen.from &&
          !newObjectDialogOpen.from.global
        ) {
          const selectedItem = newObjectDialogOpen.from.objectFolderOrObject;
          const {
            folder: parentFolder,
            position,
          } = getInsertionParentAndPositionFromSelection(selectedItem);

          object = objectsContainer.insertNewObjectInFolder(
            project,
            objectType,
            name,
            parentFolder,
            position
          );
          objectFolderOrObjectWithContext = {
            objectFolderOrObject: parentFolder.getObjectChild(name),
            global: false,
          };

          if (treeViewRef.current) {
            treeViewRef.current.openItems([
              getObjectFolderTreeViewItemId(parentFolder),
            ]);
          }
        } else {
          object = objectsContainer.insertNewObject(
            project,
            objectType,
            name,
            objectsContainer.getObjectsCount()
          );
          objectFolderOrObjectWithContext = {
            objectFolderOrObject: objectsContainer
              .getRootFolder()
              .getObjectChild(name),
            global: false,
          };
        }

        if (treeViewRef.current)
          treeViewRef.current.openItems([sceneObjectsRootFolderId]);

        setTimeout(() => {
          scrollToItem(getObjectTreeViewItemId(object));
        }, 100);

        setNewObjectDialogOpen(null);
        // $FlowFixMe[constant-condition]
        if (onEditObject) {
          onEditObject(object);
          onObjectFolderOrObjectWithContextSelected(
            objectFolderOrObjectWithContext
          );
        }
        onObjectCreated([object], isTheFirstOfItsTypeInProject);
      },
      [
        project,
        newObjectDialogOpen,
        onEditObject,
        objectsContainer,
        globalObjectsContainer,
        scrollToItem,
        onObjectCreated,
        onObjectFolderOrObjectWithContextSelected,
      ]
    );

    const onObjectsAddedFromAssets = React.useCallback(
      ({
        createdObjects: objects,
        isTheFirstOfItsTypeInProject,
      }: InstallAssetOutput) => {
        if (objects.length === 0) return;

        onObjectCreated(objects, isTheFirstOfItsTypeInProject);

        const lastObject = objects[objects.length - 1];

        if (newObjectDialogOpen && newObjectDialogOpen.from) {
          const {
            objectFolderOrObject: selectedObjectFolderOrObject,
          } = newObjectDialogOpen.from;
          if (treeViewRef.current) {
            treeViewRef.current.openItems(
              getFoldersAscendanceWithoutRootFolder(
                selectedObjectFolderOrObject
              ).map(folder => getObjectFolderTreeViewItemId(folder))
            );
          }
        } else {
          if (treeViewRef.current) {
            treeViewRef.current.openItems([sceneObjectsRootFolderId]);
          }
        }
        setTimeout(() => {
          scrollToItem(getObjectTreeViewItemId(lastObject));
        }, 100);
      },
      [onObjectCreated, scrollToItem, newObjectDialogOpen]
    );

    const swapObjectAsset = React.useCallback(
      (objectWithContext: ObjectWithContext) => {
        setObjectAssetSwappingDialogOpen({ objectWithContext });
      },
      []
    );

    const onAddNewObject = React.useCallback(
      (item: ObjectFolderOrObjectWithContext | null) => {
        setNewObjectDialogOpen({ from: item });
      },
      []
    );

    // ── CALLBACK OPEN COLOR PICKER ──────────────────────────────────────────
    const openColorPicker = React.useCallback(
      (objectFolder: gdObjectFolderOrObject, isGlobal: boolean) => {
        setColorPickerOpen({ objectFolder, isGlobal });
      },
      []
    );
    // ────────────────────────────────────────────────────────────────────────

    const onObjectModified = React.useCallback(
      (shouldForceUpdateList: boolean) => {
        if (unsavedChanges) unsavedChanges.triggerUnsavedChanges();

        if (shouldForceUpdateList) forceUpdateList();
        else forceUpdate();
      },
      [forceUpdate, forceUpdateList, unsavedChanges]
    );

    const selectObjectFolderOrObjectWithContext = React.useCallback(
      (objectFolderOrObjectWithContext: ?ObjectFolderOrObjectWithContext) => {
        onObjectFolderOrObjectWithContextSelected(
          objectFolderOrObjectWithContext
        );
      },
      [onObjectFolderOrObjectWithContextSelected]
    );

    const editName = React.useCallback(
      (itemId: string) => {
        const treeView = treeViewRef.current;
        if (treeView) {
          if (isMobile) {
            treeView.scrollToItemFromId(itemId, 'start');
          }
          treeView.renameItemFromId(itemId);
        }
      },
      [isMobile]
    );

    const getClosestVisibleParentId = (
      objectFolderOrObjectWithContext: ObjectFolderOrObjectWithContext
    ): ?string => {
      const treeView = treeViewRef.current;
      if (!treeView) return null;
      const { objectFolderOrObject } = objectFolderOrObjectWithContext;
      const topToBottomAscendanceId = getFoldersAscendanceWithoutRootFolder(
        objectFolderOrObject
      )
        .reverse()
        .map(parent => getObjectFolderTreeViewItemId(objectFolderOrObject));
      const topToBottomAscendanceOpenness = treeView.areItemsOpenFromId(
        topToBottomAscendanceId
      );
      const firstClosedFolderIndex = topToBottomAscendanceOpenness.indexOf(
        false
      );
      if (firstClosedFolderIndex === -1) {
        return getTreeViewItemIdFromObjectFolderOrObject(objectFolderOrObject);
      }
      // $FlowFixMe[incompatible-type]
      return topToBottomAscendanceId[firstClosedFolderIndex];
    };

    const setAsGlobalObject = React.useCallback(
      ({
        i18n,
        objectFolderOrObject,
        index,
        folder,
      }: {
        i18n: I18nType,
        objectFolderOrObject: gdObjectFolderOrObject,
        index?: number,
        folder?: gdObjectFolderOrObject,
      }) => {
        if (!globalObjectsContainer) {
          return;
        }
        const destinationFolder =
          folder && folder.isFolder()
            ? folder
            : globalObjectsContainer.getRootFolder();
        if (objectFolderOrObject.isFolder()) return;
        const object = objectFolderOrObject.getObject();

        const objectName: string = object.getName();
        if (!objectsContainer.hasObjectNamed(objectName)) return;

        if (globalObjectsContainer.hasObjectNamed(objectName)) {
          showWarningBox(
            i18n._(
              t`A global object with this name already exists. Please change the object name before setting it as a global object`
            ),
            { delayToNextTick: true }
          );
          return;
        }

        if (beforeSetAsGlobalObject && !beforeSetAsGlobalObject(objectName)) {
          return;
        }

        const answer = Window.showConfirmDialog(
          i18n._(
            t`Global elements help manage objects across multiple scenes and are recommended for frequently used objects. This action cannot be undone.

            Do you want to set this as global object?`
          )
        );
        if (!answer) return;

        objectsContainer.moveObjectFolderOrObjectToAnotherContainerInFolder(
          objectFolderOrObject,
          globalObjectsContainer,
          destinationFolder,
          typeof index === 'number'
            ? index
            : globalObjectsContainer.getObjectsCount()
        );
        gd.WholeProjectRefactorer.updateBehaviorsSharedData(project);
        onObjectModified(true);
        onSetAsGlobalObject(object);

        const newObjectFolderOrObjectWithContext = {
          objectFolderOrObject,
          global: true,
        };
        selectObjectFolderOrObjectWithContext(
          newObjectFolderOrObjectWithContext
        );

        setTimeout(() => {
          scrollToItem(getObjectTreeViewItemId(object));
        }, 100);
      },
      [
        project,
        globalObjectsContainer,
        objectsContainer,
        beforeSetAsGlobalObject,
        onSetAsGlobalObject,
        onObjectModified,
        selectObjectFolderOrObjectWithContext,
        scrollToItem,
      ]
    );

    const addFolder = React.useCallback(
      (items: Array<ObjectFolderOrObjectWithContext>) => {
        let newObjectFolderOrObjectWithContext;
        if (items.length === 1) {
          const {
            objectFolderOrObject: selectedObjectFolderOrObject,
            global,
          } = items[0];
          if (selectedObjectFolderOrObject.isFolder()) {
            const newFolder = selectedObjectFolderOrObject.insertNewFolder(
              'NewFolder',
              0
            );
            newObjectFolderOrObjectWithContext = {
              objectFolderOrObject: newFolder,
              global,
            };
            // Assign default grey color to new folder
            folderColors.set(newFolder, global, '#6b7280');
            if (treeViewRef.current) {
              treeViewRef.current.openItems([
                getObjectFolderTreeViewItemId(items[0].objectFolderOrObject),
              ]);
            }
          } else {
            const parentFolder = selectedObjectFolderOrObject.getParent();
            const newFolder = parentFolder.insertNewFolder(
              'NewFolder',
              parentFolder.getChildPosition(selectedObjectFolderOrObject) + 1
            );
            newObjectFolderOrObjectWithContext = {
              objectFolderOrObject: newFolder,
              global,
            };
            // Assign default grey color to new folder
            folderColors.set(newFolder, global, '#6b7280');
          }
        } else {
          const rootFolder = objectsContainer.getRootFolder();
          const newFolder = rootFolder.insertNewFolder('NewFolder', 0);
          newObjectFolderOrObjectWithContext = {
            objectFolderOrObject: newFolder,
            global: false,
          };
          // Assign default grey color to new folder
          folderColors.set(newFolder, false, '#6b7280');
        }
        selectObjectFolderOrObjectWithContext(
          newObjectFolderOrObjectWithContext
        );
        const itemsToOpen = getFoldersAscendanceWithoutRootFolder(
          newObjectFolderOrObjectWithContext.objectFolderOrObject
        ).map(folder => getObjectFolderTreeViewItemId(folder));
        itemsToOpen.push(
          newObjectFolderOrObjectWithContext.global
            ? globalObjectsRootFolderId
            : sceneObjectsRootFolderId
        );
        if (treeViewRef.current) treeViewRef.current.openItems(itemsToOpen);

        editName(
          getObjectFolderTreeViewItemId(
            newObjectFolderOrObjectWithContext.objectFolderOrObject
          )
        );
        forceUpdateList();
      },
      [
        forceUpdateList,
        objectsContainer,
        selectObjectFolderOrObjectWithContext,
        editName,
      ]
    );

    const onMovedObjectFolderOrObjectToAnotherFolderInSameContainer = React.useCallback(
      (objectFolderOrObjectWithContext: ObjectFolderOrObjectWithContext) => {
        const treeView = treeViewRef.current;
        if (treeView) {
          const closestVisibleParentId = getClosestVisibleParentId(
            objectFolderOrObjectWithContext
          );
          if (closestVisibleParentId) {
            treeView.animateItemFromId(closestVisibleParentId);
          }
        }
        onObjectModified(true);
      },
      [onObjectModified]
    );

    const expandFolders = React.useCallback(
      (
        objectFolderOrObjectWithContexts: Array<ObjectFolderOrObjectWithContext>
      ) => {
        if (treeViewRef.current) {
          treeViewRef.current.openItems(
            objectFolderOrObjectWithContexts.map(
              objectFolderOrObjectWithContext =>
                getObjectFolderTreeViewItemId(
                  objectFolderOrObjectWithContext.objectFolderOrObject
                )
            )
          );
        }
      },
      []
    );

    const objectTreeViewItemProps = React.useMemo<ObjectTreeViewItemProps>(
      () => ({
        project,
        globalObjectsContainer,
        objectsContainer,
        onObjectPasted,
        onSelectAllInstancesOfObjectInLayout,
        editName,
        onEditObject,
        onDeleteObjects,
        onAddObjectInstance,
        initialInstances,
        onOpenEventBasedObjectEditor,
        onOpenEventBasedObjectVariantEditor,
        getValidatedObjectOrGroupName,
        onRenameObjectFolderOrObjectWithContextFinish,
        onObjectModified,
        onObjectCreated,
        swapObjectAsset,
        onMovedObjectFolderOrObjectToAnotherFolderInSameContainer,
        canSetAsGlobalObject,
        setAsGlobalObject,
        getThumbnail,
        showDeleteConfirmation,
        selectObjectFolderOrObjectWithContext,
        addFolder,
        forceUpdateList,
        forceUpdate,
        isListLocked,
      }),
      [
        project,
        globalObjectsContainer,
        objectsContainer,
        onObjectPasted,
        onSelectAllInstancesOfObjectInLayout,
        editName,
        onEditObject,
        onDeleteObjects,
        onAddObjectInstance,
        initialInstances,
        onOpenEventBasedObjectEditor,
        onOpenEventBasedObjectVariantEditor,
        getValidatedObjectOrGroupName,
        onRenameObjectFolderOrObjectWithContextFinish,
        onObjectModified,
        onObjectCreated,
        swapObjectAsset,
        onMovedObjectFolderOrObjectToAnotherFolderInSameContainer,
        canSetAsGlobalObject,
        setAsGlobalObject,
        getThumbnail,
        showDeleteConfirmation,
        selectObjectFolderOrObjectWithContext,
        addFolder,
        forceUpdateList,
        forceUpdate,
        isListLocked,
      ]
    );

    const objectFolderTreeViewItemProps = React.useMemo<ObjectFolderTreeViewItemProps>(
      () => ({
        project,
        globalObjectsContainer,
        objectsContainer,
        onObjectPasted,
        onObjectModified,
        onObjectCreated,
        editName,
        expandFolders,
        addFolder,
        onAddNewObject,
        onMovedObjectFolderOrObjectToAnotherFolderInSameContainer,
        onRenameObjectFolderOrObjectWithContextFinish,
        onDeleteObjects,
        selectObjectFolderOrObjectWithContext,
        showDeleteConfirmation,
        forceUpdateList,
        forceUpdate,
        isListLocked,
        openColorPicker, // <-- AGGIUNTO
      }),
      [
        project,
        globalObjectsContainer,
        objectsContainer,
        onObjectPasted,
        onObjectModified,
        onObjectCreated,
        editName,
        expandFolders,
        addFolder,
        onAddNewObject,
        onMovedObjectFolderOrObjectToAnotherFolderInSameContainer,
        onRenameObjectFolderOrObjectWithContextFinish,
        onDeleteObjects,
        selectObjectFolderOrObjectWithContext,
        showDeleteConfirmation,
        forceUpdateList,
        forceUpdate,
        isListLocked,
        openColorPicker, // <-- AGGIUNTO
      ]
    );

    const globalObjectsRootFolder = globalObjectsContainer
      ? globalObjectsContainer.getRootFolder()
      : null;
    const objectsRootFolder = objectsContainer.getRootFolder();
    const labels = React.useMemo(
      () =>
        getLabelsForObjectsAndGroupsLists(
          projectScopedContainersAccessor.getScope()
        ),
      [projectScopedContainersAccessor]
    );

    const isEntirelyEmpty =
      objectsContainer.getObjectsCount() === 0 &&
      (!globalObjectsContainer ||
        globalObjectsContainer.getObjectsCount() === 0);

    const getTreeViewData = React.useCallback(
      (i18n: I18nType): Array<TreeViewItem> => {
        const treeViewItems = [
          globalObjectsRootFolder &&
            new ObjectFolderTreeViewItem({
              objectFolderOrObject: globalObjectsRootFolder,
              global: true,
              isRoot: true,
              content: new LabelTreeViewItemContent(
                globalObjectsRootFolderId,
                i18n._(labels.higherScopeObjectsTitle),
                null,
                () => [
                  {
                    label: i18n._(t`Add a folder`),
                    click: () =>
                      addFolder([
                        {
                          objectFolderOrObject: globalObjectsRootFolder,
                          global: true,
                        },
                      ]),
                  },
                  { type: 'separator' },
                  {
                    label: i18n._(t`Expand all sub folders`),
                    click: () =>
                      expandAllSubfolders(
                        globalObjectsRootFolder,
                        true,
                        expandFolders
                      ),
                  },
                ]
              ),
              placeholder: new PlaceHolderTreeViewItem(
                globalObjectsEmptyPlaceholderId,
                (
                  <Trans>
                    There is no{' '}
                    <Link
                      href={globalObjectsWikiLink}
                      onClick={() =>
                        Window.openExternalURL(globalObjectsWikiLink)
                      }
                    >
                      global object
                    </Link>{' '}
                    yet.
                  </Trans>
                )
              ),
              objectTreeViewItemProps,
              objectFolderTreeViewItemProps,
            }),
          new ObjectFolderTreeViewItem({
            objectFolderOrObject: objectsRootFolder,
            global: false,
            isRoot: true,
            content: new LabelTreeViewItemContent(
              sceneObjectsRootFolderId,
              i18n._(labels.localScopeObjectsTitle),
              {
                primary: true,
                showPrimaryLabel: isEntirelyEmpty,
                icon: <Add />,
                label: t`Add object`,
                click: () => {
                  onAddNewObject(selectedObjectFolderOrObjectsWithContext[0]);
                },
                id: 'add-new-object-button',
                enabled: !isListLocked,
              },
              () => [
                {
                  label: i18n._(t`Add a folder`),
                  click: () =>
                    addFolder([
                      {
                        objectFolderOrObject: objectsRootFolder,
                        global: false,
                      },
                    ]),
                  enabled: !isListLocked,
                },
                { type: 'separator' },
                {
                  label: i18n._(t`Expand all sub folders`),
                  click: () =>
                    expandAllSubfolders(
                      objectsRootFolder,
                      false,
                      expandFolders
                    ),
                },
                { type: 'separator' },
                {
                  label: i18n._(t`Export as assets`),
                  click: () => onExportAssets(),
                },
                {
                  label: i18n._(t`Import assets`),
                  click: () => onImportAssets(),
                },
              ]
            ),
            placeholder: new PlaceHolderTreeViewItem(
              sceneObjectsEmptyPlaceholderId,
              i18n._(t`Start by adding a new object.`)
            ),
            objectTreeViewItemProps,
            objectFolderTreeViewItemProps,
          }),
        ].filter(Boolean);
        // $FlowFixMe[incompatible-type]
        return treeViewItems;
      },
      [
        globalObjectsRootFolder,
        labels.higherScopeObjectsTitle,
        labels.localScopeObjectsTitle,
        objectTreeViewItemProps,
        objectFolderTreeViewItemProps,
        objectsRootFolder,
        isEntirelyEmpty,
        isListLocked,
        addFolder,
        expandFolders,
        onAddNewObject,
        selectedObjectFolderOrObjectsWithContext,
        onExportAssets,
        onImportAssets,
      ]
    );

    const selectedItems = React.useMemo(
      () => {
        return selectedObjectFolderOrObjectsWithContext.map(
          ({ objectFolderOrObject, global }) => {
            return createTreeViewItem({
              objectFolderOrObject,
              isGlobal: global,
              objectFolderTreeViewItemProps,
              objectTreeViewItemProps,
            });
          }
        );
      },
      [
        selectedObjectFolderOrObjectsWithContext,
        objectFolderTreeViewItemProps,
        objectTreeViewItemProps,
      ]
    );

    React.useEffect(
      () => {
        if (keyboardShortcutsRef.current) {
          keyboardShortcutsRef.current.setShortcutCallback('onDelete', () => {
            if (!isListLocked) {
              deleteItem(selectedItems[0]);
            }
          });
          keyboardShortcutsRef.current.setShortcutCallback(
            'onDuplicate',
            () => {
              if (!isListLocked) {
                duplicateItem(selectedItems[0]);
              }
            }
          );
          keyboardShortcutsRef.current.setShortcutCallback('onRename', () => {
            if (!isListLocked) {
              editName(selectedItems[0].content.getId());
            }
          });
        }
      },
      [
        selectedObjectFolderOrObjectsWithContext,
        editName,
        selectedItems,
        isListLocked,
      ]
    );

    const canMoveSelectionTo = React.useCallback(
      (destinationItem: TreeViewItem) => {
        if (destinationItem.isRoot) return false;
        if (destinationItem.isPlaceholder) {
          if (
            destinationItem.content.getId() ===
              globalObjectsEmptyPlaceholderId &&
            selectedItems.length === 1 &&
            !selectedItems[0].content.isGlobal()
          ) {
            const objectFolderOrObject = selectedItems[0].content.getObjectFolderOrObject();
            return !!objectFolderOrObject && !objectFolderOrObject.isFolder();
          }
          return false;
        }
        if (
          selectedItems.every(
            selectedItem =>
              selectedItem.content.isGlobal() ===
              destinationItem.content.isGlobal()
          )
        ) {
          if (
            selectedItems[0] &&
            destinationItem.content.isDescendantOf(selectedItems[0].content)
          ) {
            return false;
          }
          return true;
        } else if (
          selectedItems.length === 1 &&
          selectedItems.every(
            selectedObject => selectedObject.content.isGlobal() === false
          ) &&
          destinationItem.content.isGlobal()
        ) {
          const objectFolderOrObject = selectedItems[0].content.getObjectFolderOrObject();
          return !!objectFolderOrObject && !objectFolderOrObject.isFolder();
        }

        return false;
      },
      [selectedItems]
    );

    const moveSelectionTo = React.useCallback(
      (
        i18n: I18nType,
        destinationItem: TreeViewItem,
        where: 'before' | 'inside' | 'after'
      ) => {
        if (destinationItem.isRoot || selectedItems.length !== 1) {
          return;
        }
        const selectedItem = selectedItems[0];
        const selectedObjectFolderOrObject = selectedItem.content.getObjectFolderOrObject();

        if (
          !selectedObjectFolderOrObject ||
          destinationItem.content.getId() === selectedItem.content.getId()
        ) {
          return;
        }

        if (destinationItem.isPlaceholder) {
          if (
            destinationItem.content.getId() ===
              globalObjectsEmptyPlaceholderId &&
            selectedItems.length === 1 &&
            !selectedItem.content.isGlobal()
          ) {
            setAsGlobalObject({
              i18n,
              objectFolderOrObject: selectedObjectFolderOrObject,
            });
          }
          return;
        }

        const destinationObjectFolderOrObject = destinationItem.content.getObjectFolderOrObject();
        if (!destinationObjectFolderOrObject) {
          return;
        }
        if (
          selectedItem.content.isGlobal() === false &&
          destinationItem.content.isGlobal()
        ) {
          let parent, index;
          if (
            where === 'inside' &&
            destinationObjectFolderOrObject.isFolder()
          ) {
            parent = destinationObjectFolderOrObject;
            index = 0;
          } else {
            parent = destinationObjectFolderOrObject.getParent();
            index =
              destinationItem.content.getIndex() + (where === 'after' ? 1 : 0);
          }
          setAsGlobalObject({
            i18n,
            objectFolderOrObject: selectedObjectFolderOrObject,
            folder: parent,
            index,
          });
          return;
        }

        if (
          selectedItem.content.isGlobal() === destinationItem.content.isGlobal()
        ) {
          let parent;
          if (
            where === 'inside' &&
            destinationObjectFolderOrObject.isFolder()
          ) {
            parent = destinationObjectFolderOrObject;
          } else {
            parent = destinationObjectFolderOrObject.getParent();
          }
          const selectedObjectFolderOrObjectParent = selectedObjectFolderOrObject.getParent();
          if (parent === selectedObjectFolderOrObjectParent) {
            const fromIndex = selectedItem.content.getIndex();
            let toIndex = destinationItem.content.getIndex();
            if (toIndex > fromIndex) toIndex -= 1;
            if (where === 'after') toIndex += 1;
            selectedObjectFolderOrObjectParent.moveChild(fromIndex, toIndex);
          } else {
            if (destinationItem.content.isDescendantOf(selectedItem.content)) {
              return;
            }
            const position =
              where === 'inside'
                ? 0
                : destinationItem.content.getIndex() +
                  (where === 'after' ? 1 : 0);
            selectedObjectFolderOrObjectParent.moveObjectFolderOrObjectToAnotherFolder(
              selectedObjectFolderOrObject,
              parent,
              position
            );
            const treeView = treeViewRef.current;
            if (treeView) {
              const closestVisibleParentId = getClosestVisibleParentId({
                objectFolderOrObject: parent,
                global: destinationItem.content.isGlobal(),
              });
              if (closestVisibleParentId) {
                treeView.animateItemFromId(closestVisibleParentId);
              }
            }
          }
        } else {
          return;
        }
        onObjectModified(true);
      },
      [onObjectModified, selectedItems, setAsGlobalObject]
    );

    const onCollapseItem = React.useCallback(
      (item: TreeViewItem) => {
        if (!selectedItems || selectedItems.length !== 1) return;
        const selectedItem = selectedItems[0];
        if (!selectedItem) return;
        if (selectedItem.content.isDescendantOf(item.content)) {
          selectObjectFolderOrObjectWithContext(null);
        }
      },
      [selectObjectFolderOrObjectWithContext, selectedItems]
    );

    const listKey = project.ptr + ';' + objectsContainer.ptr;
    const initiallyOpenedNodeIds = [
      globalObjectsRootFolder && globalObjectsRootFolder.getChildrenCount() > 0
        ? globalObjectsRootFolderId
        : null,
      sceneObjectsRootFolderId,
    ].filter(Boolean);

    const arrowKeyNavigationProps = React.useMemo(
      () => ({
        onGetItemInside: (item: TreeViewItem): ?TreeViewItem => {
          if (item.isPlaceholder || item.isRoot) return null;
          const objectFolderOrObject = item.content.getObjectFolderOrObject();
          if (!objectFolderOrObject) return null;
          if (!objectFolderOrObject.isFolder()) return null;
          else {
            if (objectFolderOrObject.getChildrenCount() === 0) return null;
            return createTreeViewItem({
              objectFolderOrObject: objectFolderOrObject.getChildAt(0),
              isGlobal: item.content.isGlobal(),
              objectFolderTreeViewItemProps,
              objectTreeViewItemProps,
            });
          }
        },
        onGetItemOutside: (item: TreeViewItem): ?TreeViewItem => {
          if (item.isPlaceholder || item.isRoot) return null;
          const objectFolderOrObject = item.content.getObjectFolderOrObject();
          if (!objectFolderOrObject) return null;
          const parent = objectFolderOrObject.getParent();
          if (parent.isRootFolder()) return null;
          return createTreeViewItem({
            objectFolderOrObject: parent,
            isGlobal: item.content.isGlobal(),
            objectFolderTreeViewItemProps,
            objectTreeViewItemProps,
          });
        },
      }),
      [objectFolderTreeViewItemProps, objectTreeViewItemProps]
    );

    return (
      <Background maxWidth>
        <LineStackLayout>
          <Column expand noOverflowParent>
            <CompactSearchBar
              value={searchText}
              onChange={setSearchText}
              placeholder={t`Search objects`}
            />
          </Column>
        </LineStackLayout>
        <div
          style={styles.listContainer}
          onKeyDown={keyboardShortcutsRef.current.onKeyDown}
          onKeyUp={keyboardShortcutsRef.current.onKeyUp}
          id="objects-list"
        >
          <I18n>
            {({ i18n }) => (
              <div style={styles.autoSizerContainer}>
                <AutoSizer style={styles.autoSizer} disableWidth>
                  {({ height }) => (
                    // $FlowFixMe[incompatible-type]
                    // $FlowFixMe[incompatible-exact]
                    <TreeView
                      key={listKey}
                      ref={treeViewRef}
                      items={(getTreeViewData(i18n): any)}
                      height={height}
                      forceAllOpened={!!currentlyRunningInAppTutorial}
                      searchText={searchText}
                      getItemName={getTreeViewItemName}
                      getItemThumbnail={getTreeViewItemThumbnail}
                      getItemChildren={getTreeViewItemChildren(i18n)}
                      multiSelect={false}
                      getItemId={getTreeViewItemId}
                      getItemHtmlId={getTreeViewItemHtmlId}
                      getItemDataset={getTreeViewItemDataSet}
                      onEditItem={editItem}
                      onClickItem={onClickItem}
                      onCollapseItem={onCollapseItem}
                      selectedItems={selectedItems}
                      onSelectItems={items => {
                        if (!items) {
                          selectObjectFolderOrObjectWithContext(null);
                          return;
                        }
                        const itemContentToSelect = items[0].content;
                        const objectFolderOrObjectToSelect = itemContentToSelect.getObjectFolderOrObject();
                        if (objectFolderOrObjectToSelect) {
                          selectObjectFolderOrObjectWithContext({
                            objectFolderOrObject: objectFolderOrObjectToSelect,
                            global: itemContentToSelect.isGlobal(),
                          });
                        } else {
                          selectObjectFolderOrObjectWithContext(null);
                        }
                      }}
                      onRenameItem={renameItem}
                      buildMenuTemplate={buildMenuTemplate(i18n)}
                      onMoveSelectionToItem={(destinationItem, where) =>
                        moveSelectionTo(i18n, destinationItem, where)
                      }
                      canMoveSelectionToItem={canMoveSelectionTo}
                      reactDndType={objectWithContextReactDndType}
                      initiallyOpenedNodeIds={initiallyOpenedNodeIds}
                      arrowKeyNavigationProps={arrowKeyNavigationProps}
                      shouldSelectUponContextMenuOpening
                      getItemRightButton={getTreeViewItemRightButton(i18n)}
                      renderRightComponent={renderTreeViewItemRightComponent(
                        i18n
                      )}
                    />
                  )}
                </AutoSizer>
              </div>
            )}
          </I18n>
        </div>

        {/* Dialog nuovi oggetti */}
        {newObjectDialogOpen && (
          <NewObjectDialog
            onClose={() => setNewObjectDialogOpen(null)}
            onCreateNewObject={addObject}
            onObjectsAddedFromAssets={onObjectsAddedFromAssets}
            project={project}
            layout={layout}
            eventsFunctionsExtension={eventsFunctionsExtension}
            eventsBasedObject={eventsBasedObject}
            objectsContainer={objectsContainer}
            resourceManagementProps={resourceManagementProps}
            targetObjectFolderOrObjectWithContext={newObjectDialogOpen.from}
            onWillInstallExtension={onWillInstallExtension}
            onExtensionInstalled={onExtensionInstalled}
          />
        )}

        {/* Dialog swap asset */}
        {objectAssetSwappingDialogOpen && (
          <AssetSwappingDialog
            onClose={({ swappingDone }) => {
              setObjectAssetSwappingDialogOpen(null);
              if (swappingDone)
                onObjectEdited(
                  objectAssetSwappingDialogOpen.objectWithContext,
                  true
                );
            }}
            project={project}
            layout={layout}
            eventsBasedObject={eventsBasedObject}
            objectsContainer={objectsContainer}
            object={objectAssetSwappingDialogOpen.objectWithContext.object}
            resourceManagementProps={resourceManagementProps}
            onWillInstallExtension={onWillInstallExtension}
            onExtensionInstalled={onExtensionInstalled}
          />
        )}

        {/* ── COLOR PICKER DIALOG ── */}
        {colorPickerOpen && (
          <ColorPickerDialog
            objectFolder={colorPickerOpen.objectFolder}
            isGlobal={colorPickerOpen.isGlobal}
            onClose={() => setColorPickerOpen(null)}
            onForceUpdate={forceUpdateList}
          />
        )}
        {/* ───────────────────────── */}
      </Background>
    );
  }
);

const arePropsEqual = (prevProps: Props, nextProps: Props): boolean =>
  prevProps.selectedObjectFolderOrObjectsWithContext ===
    nextProps.selectedObjectFolderOrObjectsWithContext &&
  prevProps.project === nextProps.project &&
  prevProps.globalObjectsContainer === nextProps.globalObjectsContainer &&
  prevProps.objectsContainer === nextProps.objectsContainer;

// $FlowFixMe[incompatible-type]
const MemoizedObjectsList = React.memo<Props, ObjectsListInterface>(
  // $FlowFixMe[incompatible-type]
  // $FlowFixMe[incompatible-exact]
  ObjectsList,
  arePropsEqual
);

const ObjectsListWithErrorBoundary: React.ComponentType<{
  ...Props,
  +ref?: React.RefSetter<ObjectsListInterface>,
}> = React.forwardRef<Props, ObjectsListInterface>((props, ref) => (
  <ErrorBoundary
    componentTitle={<Trans>Objects list</Trans>}
    scope="scene-editor-objects-list"
  >
    {/* $FlowFixMe[incompatible-type] */}
    <MemoizedObjectsList ref={ref} {...props} />
  </ErrorBoundary>
));

export default ObjectsListWithErrorBoundary;
