// @flow
import * as React from 'react';
import { TreeViewItemContent } from './InstructionOrObjectSelector';
import { type HTMLDataset } from '../../Utils/HTMLDataset';

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

export class ObjectFolderTreeViewItemContent implements TreeViewItemContent {
  objectFolder: gdObjectFolderOrObject;
  props: ObjectFolderTreeViewItemProps;

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
    // TODO: Make sure it keeps the in-app-tutorial work.
    return `object-item-${index}`;
  }

  getDataSet(): ?HTMLDataset {
    return { folderName: this.objectFolder.getFolderName() };
  }

  getThumbnail(): ?string {
    return 'FOLDER';
  }
}
