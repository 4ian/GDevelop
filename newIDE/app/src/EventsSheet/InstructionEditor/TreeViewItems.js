// @flow
import * as React from 'react';
import { type HTMLDataset } from '../../Utils/HTMLDataset';
import { mapFor } from '../../Utils/MapFor';
import getObjectByName from '../../Utils/GetObjectByName';
import { type EnumeratedInstructionMetadata } from '../../InstructionOrExpression/EnumeratedInstructionOrExpressionMetadata';

export interface TreeViewItemContent {
  applySearch: boolean;
  getName(): string | React.Node;
  getDescription(): string | null;
  getId(): string;
  getHtmlId(index: number): ?string;
  getDataSet(): ?HTMLDataset;
  getThumbnail(): ?string;
}

export interface TreeViewItem {
  isRoot?: boolean;
  +content: TreeViewItemContent;
  openIfSearchMatches?: boolean;
  openWithSingleClick?: boolean;
  getChildren(searchText: string): ?Array<TreeViewItem>;
}

export type ObjectTreeViewItemProps = {|
  getThumbnail: (
    project: gdProject,
    objectConfiguration: gdObjectConfiguration
  ) => string,
  project: gdProject,
|};

export type ObjectFolderTreeViewItemProps = {|
  project: gdProject,
|};

export const getObjectFolderTreeViewItemId = (
  objectFolder: gdObjectFolderOrObject
): string => {
  // Use the ptr as id since two folders can have the same name.
  // If using folder name, this would need for methods when renaming
  // the folder to keep it open.
  return `object-folder-${objectFolder.ptr}`;
};

export const getObjectTreeViewItemId = (
  objectOrGroup: gdObject | gdObjectGroup
): string => {
  // Use the ptr to avoid display bugs in the rare case a user set an object
  // as global although another layout has an object with the same name,
  // and ignored the warning.
  return `${objectOrGroup.getName()}-${objectOrGroup.ptr}`;
};

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
        objectFolderTreeViewItemProps
      ),
    });
  } else {
    return new LeafTreeViewItem(
      new ObjectTreeViewItemContent(
        objectFolderOrObject,
        objectTreeViewItemProps
      )
    );
  }
};

export class ObjectGroupTreeViewItemContent implements TreeViewItemContent {
  applySearch = true;
  group: gdObjectGroup;

  constructor(group: gdObjectGroup) {
    this.group = group;
  }

  getGroup(): gdObjectGroup | null {
    return this.group;
  }

  getName(): string | React.Node {
    return this.group.getName();
  }
  getDescription(): string | null {
    return null;
  }

  getId(): string {
    return getObjectTreeViewItemId(this.group);
  }

  getHtmlId(index: number): ?string {
    return null;
  }

  getDataSet(): ?HTMLDataset {
    return {
      groupName: this.group.getName(),
    };
  }

  getThumbnail(): ?string {
    return 'res/ribbon_default/objectsgroups64.png';
  }
}

export class ObjectGroupObjectTreeViewItemContent
  implements TreeViewItemContent {
  applySearch = true;
  object: gdObject;
  props: ObjectTreeViewItemProps;
  groupPrefix: string;

  constructor(
    object: gdObject,
    props: ObjectTreeViewItemProps,
    groupPrefix: string
  ) {
    this.object = object;
    this.props = props;
    this.groupPrefix = groupPrefix;
  }

  getObject(): gdObject | null {
    return this.object;
  }

  getName(): string | React.Node {
    return this.object.getName();
  }
  getDescription(): string | null {
    return null;
  }

  getId(): string {
    return `${this.groupPrefix}-${getObjectTreeViewItemId(this.object)}`;
  }

  getHtmlId(index: number): ?string {
    return null;
  }

  getDataSet(): ?HTMLDataset {
    return {
      objectName: this.object.getName(),
    };
  }

  getThumbnail(): ?string {
    return this.props.getThumbnail(
      this.props.project,
      this.object.getConfiguration()
    );
  }
}

export class LeafTreeViewItem implements TreeViewItem {
  content: TreeViewItemContent;

  constructor(content: TreeViewItemContent) {
    this.content = content;
  }

  getChildren(): ?Array<TreeViewItem> {
    return null;
  }
}

export class GroupTreeViewItem implements TreeViewItem {
  content: TreeViewItemContent;
  group: gdObjectGroup;
  globalObjectsContainer: gdObjectsContainer | null;
  objectsContainer: gdObjectsContainer;
  objectTreeViewItemProps: ObjectTreeViewItemProps;

  constructor(
    content: TreeViewItemContent,
    group: gdObjectGroup,
    globalObjectsContainer: gdObjectsContainer | null,
    objectsContainer: gdObjectsContainer,
    objectTreeViewItemProps: ObjectTreeViewItemProps
  ) {
    this.content = content;
    this.group = group;
    this.globalObjectsContainer = globalObjectsContainer;
    this.objectsContainer = objectsContainer;
    this.objectTreeViewItemProps = objectTreeViewItemProps;
  }

  getChildren(searchText: string): ?Array<TreeViewItem> {
    if (!searchText) return null;
    const allObjectNames = this.group.getAllObjectsNames();
    return allObjectNames
      .toJSArray()
      .map(objectName => {
        const object = getObjectByName(
          this.globalObjectsContainer,
          this.objectsContainer,
          objectName
        );
        if (!object) {
          return null;
        }
        return new LeafTreeViewItem(
          new ObjectGroupObjectTreeViewItemContent(
            object,
            this.objectTreeViewItemProps,
            this.content.getId()
          )
        );
      })
      .filter(Boolean);
  }
}

export class RootTreeViewItem implements TreeViewItem {
  content: TreeViewItemContent;
  children: TreeViewItem[];
  isRoot = true;

  constructor(content: TreeViewItemContent, children: TreeViewItem[]) {
    this.content = content;
    this.children = children;
  }

  getChildren(): ?Array<TreeViewItem> {
    return this.children;
  }
}

export class MoreResultsTreeViewItemContent implements TreeViewItemContent {
  applySearch = false;
  name: string;
  description: string;
  constructor(name: string, description: string) {
    this.name = name;
    this.description = description;
  }
  getName() {
    return this.name;
  }
  getDescription(): string | null {
    return this.description;
  }

  getId() {
    return `more-results`;
  }
  getHtmlId() {
    return null;
  }
  getDataSet() {
    return {};
  }
  getThumbnail() {
    return null;
  }
}

export class InstructionTreeViewItemContent implements TreeViewItemContent {
  instructionMetadata: EnumeratedInstructionMetadata;
  applySearch = false;
  constructor(instructionMetadata: EnumeratedInstructionMetadata) {
    this.instructionMetadata = instructionMetadata;
  }
  getInstructionMetadata() {
    return this.instructionMetadata;
  }
  getName() {
    return this.instructionMetadata.displayedName;
  }
  getDescription(): string | null {
    return this.instructionMetadata.fullGroupName;
  }

  getId() {
    return `instruction-item-${this.instructionMetadata.type.replace(
      /:/g,
      '-'
    )}`;
  }
  getHtmlId() {
    return this.getId();
  }
  getDataSet() {
    return {
      instructionType: this.instructionMetadata.type.replace(/:/g, '-'),
      object: this.instructionMetadata.scope.objectMetadata
        ? this.instructionMetadata.scope.objectMetadata
            .getName()
            .replace(/:/g, '-') + '-'
        : undefined,
    };
  }
  getThumbnail() {
    return this.instructionMetadata.iconFilename;
  }
}

export class LabelTreeViewItemContent implements TreeViewItemContent {
  id: string;
  label: string | React.Node;
  applySearch = true;

  constructor(id: string, label: string | React.Node) {
    this.id = id;
    this.label = label;
  }

  getName(): string | React.Node {
    return this.label;
  }

  getDescription(): string | null {
    return null;
  }

  getId(): string {
    return this.id;
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

  getIndex(): number {
    return 0;
  }
}

export class ObjectFolderTreeViewItem implements TreeViewItem {
  isRoot: boolean;
  global: boolean;
  isPlaceholder = false;
  openIfSearchMatches = true;
  openWithSingleClick = true;
  content: TreeViewItemContent;
  objectFolderOrObject: gdObjectFolderOrObject;
  objectFolderTreeViewItemProps: ObjectFolderTreeViewItemProps;
  objectTreeViewItemProps: ObjectTreeViewItemProps;

  constructor({
    objectFolderOrObject,
    global,
    isRoot,
    content,
    objectFolderTreeViewItemProps,
    objectTreeViewItemProps,
  }: {|
    objectFolderOrObject: gdObjectFolderOrObject,
    global: boolean,
    isRoot: boolean,
    content: TreeViewItemContent,
    objectFolderTreeViewItemProps: ObjectFolderTreeViewItemProps,
    objectTreeViewItemProps: ObjectTreeViewItemProps,
  |}) {
    this.isRoot = isRoot;
    this.global = global;
    this.content = content;
    this.objectFolderOrObject = objectFolderOrObject;
    this.objectFolderTreeViewItemProps = objectFolderTreeViewItemProps;
    this.objectTreeViewItemProps = objectTreeViewItemProps;
  }

  getChildren(): ?Array<TreeViewItem> {
    if (this.objectFolderOrObject.getChildrenCount() === 0) {
      return [];
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

export class ObjectTreeViewItemContent implements TreeViewItemContent {
  object: gdObjectFolderOrObject;
  props: ObjectTreeViewItemProps;
  applySearch = true;

  constructor(object: gdObjectFolderOrObject, props: ObjectTreeViewItemProps) {
    this.object = object;
    this.props = props;
  }

  getObjectFolderOrObject(): gdObjectFolderOrObject | null {
    return this.object;
  }

  getName(): string | React.Node {
    return this.object.getObject().getName();
  }
  getDescription(): string | null {
    return null;
  }

  getId(): string {
    return getObjectTreeViewItemId(this.object.getObject());
  }

  getHtmlId(index: number): ?string {
    return null;
  }

  getDataSet(): ?HTMLDataset {
    return {
      objectName: this.object.getObject().getName(),
    };
  }

  getThumbnail(): ?string {
    return this.props.getThumbnail(
      this.props.project,
      this.object.getObject().getConfiguration()
    );
  }
}

export class ObjectFolderTreeViewItemContent implements TreeViewItemContent {
  objectFolder: gdObjectFolderOrObject;
  props: ObjectFolderTreeViewItemProps;
  applySearch = true;

  constructor(
    objectFolder: gdObjectFolderOrObject,
    props: ObjectFolderTreeViewItemProps
  ) {
    this.objectFolder = objectFolder;
    this.props = props;
  }

  getObjectFolderOrObject(): gdObjectFolderOrObject | null {
    return this.objectFolder;
  }

  getName(): string | React.Node {
    return this.objectFolder.getFolderName();
  }
  getDescription(): string | null {
    return null;
  }

  getId(): string {
    return getObjectFolderTreeViewItemId(this.objectFolder);
  }

  getHtmlId(index: number): ?string {
    return null;
  }

  getDataSet(): ?HTMLDataset {
    return { folderName: this.objectFolder.getFolderName() };
  }

  getThumbnail(): ?string {
    return 'FOLDER';
  }
}
