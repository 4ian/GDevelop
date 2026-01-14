// @flow
import * as React from 'react';
import { type I18n as I18nType } from '@lingui/core';
import { type MenuItemTemplate } from '../Menu/Menu.flow';
import { type MenuButton } from '../TreeView';
import { type HTMLDataset } from '../../Utils/HTMLDataset';

/**
 * Generisches Interface für TreeViewItemContent.
 * Definiert alle Methoden, die ein Item in der TreeView haben muss.
 */
export interface FolderTreeViewItemContent {
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
  isDescendantOf(treeViewItemContent: FolderTreeViewItemContent): boolean;
  isSibling(treeViewItemContent: FolderTreeViewItemContent): boolean;
  getOriginalItem(): any; // Returns the original TItem or TFolder
  getReactDndType(): string; // For Drag & Drop type checking
  isGlobal(): boolean; // For items that exist globally vs. locally
}

/**
 * Generisches TreeViewItem.
 * Repräsentiert entweder einen Folder oder ein Item im Tree.
 */
export interface FolderTreeViewItem {
  isRoot?: boolean;
  isPlaceholder?: boolean;
  +content: FolderTreeViewItemContent;
  getChildren(i18n: I18nType): ?Array<FolderTreeViewItem>;
}

/**
 * Leaf-Item (kein Folder, hat keine Kinder)
 */
export class LeafTreeViewItem implements FolderTreeViewItem {
  content: FolderTreeViewItemContent;

  constructor(content: FolderTreeViewItemContent) {
    this.content = content;
  }

  getChildren(i18n: I18nType): ?Array<FolderTreeViewItem> {
    return null;
  }
}

/**
 * Folder-Item (kann Kinder haben)
 */
export class FolderItem implements FolderTreeViewItem {
  content: FolderTreeViewItemContent;
  getChildrenFunc: (i18n: I18nType) => ?Array<FolderTreeViewItem>;

  constructor(
    content: FolderTreeViewItemContent,
    getChildrenFunc: (i18n: I18nType) => ?Array<FolderTreeViewItem>
  ) {
    this.content = content;
    this.getChildrenFunc = getChildrenFunc;
  }

  getChildren(i18n: I18nType): ?Array<FolderTreeViewItem> {
    return this.getChildrenFunc(i18n);
  }
}

/**
 * Generischer TreeViewItemContent für Items (nicht Folders).
 * Adaptiert ein Item (Scene, Object, etc.) für die TreeView.
 */
export class ItemContent<TItem> implements FolderTreeViewItemContent {
  item: TItem;
  folderOrItem: any; // The C++ FolderOrItem wrapper
  isGlobalItem: boolean;
  reactDndType: string;
  getItemNameFunc: (item: TItem) => string;
  getItemIdFunc: (item: TItem) => string;
  getItemThumbnailFunc: ?((item: TItem) => ?string);
  buildItemMenuFunc: ?((item: TItem, i18n: I18nType, index: number) => Array<MenuItemTemplate>);
  getRightButtonFunc: ?((item: TItem, i18n: I18nType) => ?MenuButton);
  renderRightComponentFunc: ?((item: TItem, i18n: I18nType) => ?React.Node);
  callbacks: any;

  constructor({
    item,
    folderOrItem,
    isGlobal,
    reactDndType,
    getItemName,
    getItemId,
    getItemThumbnail,
    buildItemMenu,
    getRightButton,
    renderRightComponent,
    callbacks,
  }: {|
    item: TItem,
    folderOrItem: any,
    isGlobal: boolean,
    reactDndType: string,
    getItemName: (item: TItem) => string,
    getItemId: (item: TItem) => string,
    getItemThumbnail?: (item: TItem) => ?string,
    buildItemMenu?: (item: TItem, i18n: I18nType, index: number) => Array<MenuItemTemplate>,
    getRightButton?: (item: TItem, i18n: I18nType) => ?MenuButton,
    renderRightComponent?: (item: TItem, i18n: I18nType) => ?React.Node,
    callbacks: any,
  |}) {
    this.item = item;
    this.folderOrItem = folderOrItem;
    this.isGlobalItem = isGlobal;
    this.reactDndType = reactDndType;
    this.getItemNameFunc = getItemName;
    this.getItemIdFunc = getItemId;
    this.getItemThumbnailFunc = getItemThumbnail;
    this.buildItemMenuFunc = buildItemMenu;
    this.getRightButtonFunc = getRightButton;
    this.renderRightComponentFunc = renderRightComponent;
    this.callbacks = callbacks;
  }

  getName(): string | React.Node {
    return this.getItemNameFunc(this.item);
  }

  getId(): string {
    return this.getItemIdFunc(this.item);
  }

  getHtmlId(index: number): ?string {
    return `item-${index}`;
  }

  getDataSet(): ?HTMLDataset {
    return {
      'is-item': 'true',
      'item-type': this.reactDndType,
    };
  }

  getThumbnail(): ?string {
    return this.getItemThumbnailFunc
      ? this.getItemThumbnailFunc(this.item)
      : null;
  }

  onClick(): void {
    if (this.callbacks?.onItemClick) {
      this.callbacks.onItemClick(this.item);
    }
  }

  buildMenuTemplate(i18n: I18nType, index: number): Array<MenuItemTemplate> {
    return this.buildItemMenuFunc
      ? this.buildItemMenuFunc(this.item, i18n, index)
      : [];
  }

  getRightButton(i18n: I18nType): ?MenuButton {
    return this.getRightButtonFunc
      ? this.getRightButtonFunc(this.item, i18n)
      : null;
  }

  renderRightComponent(i18n: I18nType): ?React.Node {
    return this.renderRightComponentFunc
      ? this.renderRightComponentFunc(this.item, i18n)
      : null;
  }

  rename(newName: string): void {
    if (this.callbacks?.onItemRename) {
      this.callbacks.onItemRename(this.item, newName);
    }
  }

  edit(): void {
    if (this.callbacks?.onItemEdit) {
      this.callbacks.onItemEdit(this.item);
    }
  }

  delete(): void {
    if (this.callbacks?.onItemDelete) {
      this.callbacks.onItemDelete(this.item);
    }
  }

  copy(): void {
    if (this.callbacks?.onItemCopy) {
      this.callbacks.onItemCopy(this.item);
    }
  }

  paste(): void {
    // Items können normalerweise nicht pasten, nur Folders
  }

  cut(): void {
    if (this.callbacks?.onItemCut) {
      this.callbacks.onItemCut(this.item);
    }
  }

  duplicate(): void {
    if (this.callbacks?.onItemDuplicate) {
      this.callbacks.onItemDuplicate(this.item);
    }
  }

  getIndex(): number {
    if (!this.folderOrItem || !this.folderOrItem.getParent) return 0;
    
    const parent = this.folderOrItem.getParent();
    if (!parent || !parent.getChildPosition) return 0;
    
    return parent.getChildPosition(this.folderOrItem);
  }

  isDescendantOf(treeViewItemContent: FolderTreeViewItemContent): boolean {
    if (!this.folderOrItem || !this.folderOrItem.isADescendantOf) {
      return false;
    }
    
    const otherOriginal = treeViewItemContent.getOriginalItem();
    if (!otherOriginal) return false;
    
    // Nutze die C++ Methode IsADescendantOf
    return this.folderOrItem.isADescendantOf(otherOriginal);
  }

  isSibling(treeViewItemContent: FolderTreeViewItemContent): boolean {
    if (!this.folderOrItem || !this.folderOrItem.getParent) {
      return false;
    }
    
    const otherOriginal = treeViewItemContent.getOriginalItem();
    if (!otherOriginal || !otherOriginal.getParent) return false;
    
    // Siblings haben den gleichen Parent
    return this.folderOrItem.getParent() === otherOriginal.getParent();
  }

  getOriginalItem(): any {
    return this.folderOrItem;
  }

  getReactDndType(): string {
    return this.reactDndType;
  }

  isGlobal(): boolean {
    return this.isGlobalItem;
  }
}

/**
 * Generischer TreeViewItemContent für Folders.
 * Adaptiert einen Folder für die TreeView.
 */
export class FolderContent<TFolder> implements FolderTreeViewItemContent {
  folder: TFolder;
  isGlobalFolder: boolean;
  reactDndType: string;
  getFolderNameFunc: (folder: TFolder) => string;
  getFolderIdFunc: (folder: TFolder) => string;
  buildFolderMenuFunc: ?((folder: TFolder, i18n: I18nType, index: number) => Array<MenuItemTemplate>);
  getRightButtonFunc: ?((folder: TFolder, i18n: I18nType) => ?MenuButton);
  renderRightComponentFunc: ?((folder: TFolder, i18n: I18nType) => ?React.Node);
  callbacks: any;

  constructor({
    folder,
    isGlobal,
    reactDndType,
    getFolderName,
    getFolderId,
    buildFolderMenu,
    getRightButton,
    renderRightComponent,
    callbacks,
  }: {|
    folder: TFolder,
    isGlobal: boolean,
    reactDndType: string,
    getFolderName: (folder: TFolder) => string,
    getFolderId: (folder: TFolder) => string,
    buildFolderMenu?: (folder: TFolder, i18n: I18nType, index: number) => Array<MenuItemTemplate>,
    getRightButton?: (folder: TFolder, i18n: I18nType) => ?MenuButton,
    renderRightComponent?: (folder: TFolder, i18n: I18nType) => ?React.Node,
    callbacks: any,
  |}) {
    this.folder = folder;
    this.isGlobalFolder = isGlobal;
    this.reactDndType = reactDndType;
    this.getFolderNameFunc = getFolderName;
    this.getFolderIdFunc = getFolderId;
    this.buildFolderMenuFunc = buildFolderMenu;
    this.getRightButtonFunc = getRightButton;
    this.renderRightComponentFunc = renderRightComponent;
    this.callbacks = callbacks;
  }

  getName(): string | React.Node {
    return this.getFolderNameFunc(this.folder);
  }

  getId(): string {
    return this.getFolderIdFunc(this.folder);
  }

  getHtmlId(index: number): ?string {
    return `folder-${index}`;
  }

  getDataSet(): ?HTMLDataset {
    return { 
      'is-folder': 'true',
      'folder-type': this.reactDndType,
    };
  }

  getThumbnail(): ?string {
    return 'FOLDER';
  }

  onClick(): void {
    if (this.callbacks?.onFolderClick) {
      this.callbacks.onFolderClick(this.folder);
    }
  }

  buildMenuTemplate(i18n: I18nType, index: number): Array<MenuItemTemplate> {
    return this.buildFolderMenuFunc
      ? this.buildFolderMenuFunc(this.folder, i18n, index)
      : [];
  }

  getRightButton(i18n: I18nType): ?MenuButton {
    return this.getRightButtonFunc
      ? this.getRightButtonFunc(this.folder, i18n)
      : null;
  }

  renderRightComponent(i18n: I18nType): ?React.Node {
    return this.renderRightComponentFunc
      ? this.renderRightComponentFunc(this.folder, i18n)
      : null;
  }

  rename(newName: string): void {
    if (this.callbacks?.onItemRename) {
      this.callbacks.onItemRename(this.folder, newName);
    }
  }

  edit(): void {
    // Folders werden normalerweise durch rename editiert
    if (this.callbacks?.onFolderEdit) {
      this.callbacks.onFolderEdit(this.folder);
    }
  }

  delete(): void {
    if (this.callbacks?.onItemDelete) {
      this.callbacks.onItemDelete(this.folder);
    }
  }

  copy(): void {
    if (this.callbacks?.onItemCopy) {
      this.callbacks.onItemCopy(this.folder);
    }
  }

  paste(): void {
    if (this.callbacks?.onItemPaste) {
      this.callbacks.onItemPaste(this.folder);
    }
  }

  cut(): void {
    if (this.callbacks?.onItemCut) {
      this.callbacks.onItemCut(this.folder);
    }
  }

  duplicate(): void {
    // Folders können normalerweise nicht dupliziert werden
  }

  getIndex(): number {
    if (!this.folder || !this.folder.getParent || !this.folder.getParent()) {
      return 0;
    }
    
    const parent = this.folder.getParent();
    if (!parent || !parent.getChildPosition) return 0;
    
    return parent.getChildPosition(this.folder);
  }

  isDescendantOf(treeViewItemContent: FolderTreeViewItemContent): boolean {
    if (!this.folder || !this.folder.isADescendantOf) {
      return false;
    }
    
    const otherOriginal = treeViewItemContent.getOriginalItem();
    if (!otherOriginal) return false;
    
    // Nutze die C++ Methode IsADescendantOf
    return this.folder.isADescendantOf(otherOriginal);
  }

  isSibling(treeViewItemContent: FolderTreeViewItemContent): boolean {
    if (!this.folder || !this.folder.getParent) {
      return false;
    }
    
    const otherOriginal = treeViewItemContent.getOriginalItem();
    if (!otherOriginal || !otherOriginal.getParent) return false;
    
    // Siblings haben den gleichen Parent
    return this.folder.getParent() === otherOriginal.getParent();
  }

  getOriginalItem(): any {
    return this.folder;
  }

  getReactDndType(): string {
    return this.reactDndType;
  }

  isGlobal(): boolean {
    return this.isGlobalFolder;
  }
}

/**
 * Factory-Funktion: Erstellt ein TreeViewItem aus einem FolderOrItem.
 * Dies ist die Haupt-Adapter-Funktion, die C++ FolderOrItem<T> für die TreeView aufbereitet.
 */
export function createTreeViewItemFromFolderOrItem<TItem, TFolder>({
  folderOrItem,
  isGlobal,
  reactDndType,
  isFolderFunc,
  getItemFunc,
  getChildrenCountFunc,
  getChildAtFunc,
  getItemNameFunc,
  getFolderNameFunc,
  getItemThumbnailFunc,
  getItemIdFunc,
  getFolderIdFunc,
  buildItemMenuFunc,
  buildFolderMenuFunc,
  getItemRightButtonFunc,
  getFolderRightButtonFunc,
  renderItemRightComponentFunc,
  renderFolderRightComponentFunc,
  callbacks,
  i18n,
}: {|
  folderOrItem: any, // gdLayoutFolderOrLayout, gdObjectFolderOrObject, etc.
  isGlobal: boolean,
  reactDndType: string,
  isFolderFunc: (folderOrItem: any) => boolean,
  getItemFunc: (folderOrItem: any) => TItem,
  getChildrenCountFunc: (folder: TFolder) => number,
  getChildAtFunc: (folder: TFolder, index: number) => any,
  getItemNameFunc: (item: TItem) => string,
  getFolderNameFunc: (folder: TFolder) => string,
  getItemThumbnailFunc?: (item: TItem) => ?string,
  getItemIdFunc: (item: TItem) => string,
  getFolderIdFunc: (folder: TFolder) => string,
  buildItemMenuFunc?: (item: TItem, i18n: I18nType, index: number) => Array<MenuItemTemplate>,
  buildFolderMenuFunc?: (folder: TFolder, i18n: I18nType, index: number) => Array<MenuItemTemplate>,
  getItemRightButtonFunc?: (item: TItem, i18n: I18nType) => ?MenuButton,
  getFolderRightButtonFunc?: (folder: TFolder, i18n: I18nType) => ?MenuButton,
  renderItemRightComponentFunc?: (item: TItem, i18n: I18nType) => ?React.Node,
  renderFolderRightComponentFunc?: (folder: TFolder, i18n: I18nType) => ?React.Node,
  callbacks: any,
  i18n: I18nType,
|}): FolderTreeViewItem {
  if (isFolderFunc(folderOrItem)) {
    // Es ist ein Folder
    const folder: TFolder = (folderOrItem: any);
    
    const content = new FolderContent({
      folder,
      isGlobal,
      reactDndType,
      getFolderName: getFolderNameFunc,
      getFolderId: getFolderIdFunc,
      buildFolderMenu: buildFolderMenuFunc,
      getRightButton: getFolderRightButtonFunc,
      renderRightComponent: renderFolderRightComponentFunc,
      callbacks,
    });

    return new FolderItem(content, (i18n: I18nType) => {
      const children = [];
      const childrenCount = getChildrenCountFunc(folder);

      for (let i = 0; i < childrenCount; i++) {
        const child = getChildAtFunc(folder, i);
        if (!child) continue;

        // Rekursiv für jedes Kind
        children.push(
          createTreeViewItemFromFolderOrItem({
            folderOrItem: child,
            isGlobal,
            reactDndType,
            isFolderFunc,
            getItemFunc,
            getChildrenCountFunc,
            getChildAtFunc,
            getItemNameFunc,
            getFolderNameFunc,
            getItemThumbnailFunc,
            getItemIdFunc,
            getFolderIdFunc,
            buildItemMenuFunc,
            buildFolderMenuFunc,
            getItemRightButtonFunc,
            getFolderRightButtonFunc,
            renderItemRightComponentFunc,
            renderFolderRightComponentFunc,
            callbacks,
            i18n,
          })
        );
      }

      return children;
    });
  } else {
    // Es ist ein Item (Scene, Object, etc.)
    const item: TItem = getItemFunc(folderOrItem);

    const content = new ItemContent({
      item,
      folderOrItem, // Store the wrapper for hierarchy operations
      isGlobal,
      reactDndType,
      getItemName: getItemNameFunc,
      getItemId: getItemIdFunc,
      getItemThumbnail: getItemThumbnailFunc,
      buildItemMenu: buildItemMenuFunc,
      getRightButton: getItemRightButtonFunc,
      renderRightComponent: renderItemRightComponentFunc,
      callbacks,
    });

    return new LeafTreeViewItem(content);
  }
}