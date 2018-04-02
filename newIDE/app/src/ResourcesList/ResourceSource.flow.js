// @flow
import * as React from 'react';

export type ResourceSource = {
  name: string,
  displayName: string,
  kind: 'image' | 'audio',
  component: React.Component<*, *>,
};

export type ChooseResourceFunction = (
  sourceName: string,
  multiSelection: boolean
) => Promise<Array<gdResource>>;
