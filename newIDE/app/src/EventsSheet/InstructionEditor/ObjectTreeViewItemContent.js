// @flow
import * as React from 'react';
import { TreeViewItemContent } from './InstructionOrObjectSelector';
import { type HTMLDataset } from '../../Utils/HTMLDataset';

export const getObjectTreeViewItemId = (objectOrGroup: gdObject | gdObjectGroup): string => {
  // Use the ptr to avoid display bugs in the rare case a user set an object
  // as global although another layout has an object with the same name,
  // and ignored the warning.
  return `${objectOrGroup.getName()}-${objectOrGroup.ptr}`;
};

export type ObjectTreeViewItemProps = {|
  getThumbnail: (
    project: gdProject,
    objectConfiguration: gdObjectConfiguration
  ) => string,
  project: gdProject,
|};

export class ObjectTreeViewItemContent implements TreeViewItemContent {
  object: gdObjectFolderOrObject;
  props: ObjectTreeViewItemProps;

  constructor(
    object: gdObjectFolderOrObject,
    props: ObjectTreeViewItemProps
  ) {
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
    return `object-item-${index}`;
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
