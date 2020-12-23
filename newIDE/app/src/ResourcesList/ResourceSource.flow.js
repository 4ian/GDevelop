// @flow
import * as React from 'react';
import { type I18n as I18nType } from '@lingui/core';

// These are all the kind of resources that can be found in
// Core/GDCore/Project/ResourcesManager.h
export type ResourceKind =
  | 'image'
  | 'audio'
  | 'font'
  | 'video'
  | 'json'
  | 'bitmapFont';

export type ResourceSourceComponentProps = {|
  i18n: I18nType,
  getLastUsedPath: (project: gdProject, kind: ResourceKind) => string,
  setLastUsedPath: (
    project: gdProject,
    kind: ResourceKind,
    path: string
  ) => void,
|};

export type ResourceSource = {
  name: string,
  displayName: string,
  kind: ResourceKind,
  component: React.AbstractComponent<ResourceSourceComponentProps>,
};

export type ChooseResourceFunction = (
  sourceName: string,
  multiSelection?: boolean
) => Promise<Array<gdResource>>;
