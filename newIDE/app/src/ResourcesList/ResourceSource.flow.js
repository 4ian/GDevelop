// @flow
import * as React from 'react';
import { type I18n as I18nType } from '@lingui/core';
import type { PreferencesValues } from '../MainFrame/Preferences/PreferencesContext';

// These are all the kind of resources that can be found in
// Core/GDCore/Project/ResourcesManager.h
export type ResourceKind = 'image' | 'audio' | 'font' | 'video' | 'json';

export type ResourceSourceComponentProps = {|
  i18n: I18nType,
  loadPreferencesValues: () => ?PreferencesValues,
  savePreferencesValues: (values: PreferencesValues) => void,
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
