// @flow
import * as React from 'react';

// These are all the kind of resources that can be found in
// Core/GDCore/Project/ResourcesManager.h
export type ResourceKind = 'image' | 'audio' | 'font' | 'video' | 'json';

export type ResourceSource = {
  name: string,
  displayName: string,
  kind: ResourceKind,
  component: React.Component<*, *>,
};

export type ChooseResourceFunction = (
  sourceName: string,
  multiSelection?: boolean
) => Promise<Array<gdResource>>;
