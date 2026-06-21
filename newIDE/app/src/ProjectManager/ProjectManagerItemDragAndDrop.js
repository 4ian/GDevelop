// @flow

export const projectManagerItemReactDndType = 'GD_EXTENSION_ITEM';

export type CustomObjectDragItem = {|
  kind: 'custom-object',
  name: string,
  thumbnail?: string,
  is3D?: boolean,
  extensionName: string,
  eventsBasedObjectName: string,
  variantName: string,
  sceneObjectName: string,
|};

export const isCustomObjectDragItem = (item: any): boolean =>
  !!item &&
  item.kind === 'custom-object' &&
  typeof item.extensionName === 'string' &&
  typeof item.eventsBasedObjectName === 'string' &&
  typeof item.variantName === 'string' &&
  typeof item.sceneObjectName === 'string';
