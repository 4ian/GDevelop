// @flow
import * as React from 'react';

export type ResourceKind = 'image' | 'audio' | 'font' | 'video';

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
