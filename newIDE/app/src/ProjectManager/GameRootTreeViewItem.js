// @flow
import * as React from 'react';
import { t } from '@lingui/macro';
import { type I18n as I18nType } from '@lingui/core';

import Add from '../UI/CustomSvgIcons/Add';
import { type MenuButton } from '../UI/TreeView';

type GameRootTreeViewItemDescription = {|
  label: string,
  rightButton: MenuButton,
|};

export const getGameRootTreeViewItemDescription = (
  i18n: I18nType,
  onCreateProject: () => void
): GameRootTreeViewItemDescription => ({
  label: i18n._(t`Project`),
  rightButton: {
    icon: <Add />,
    label: i18n._(t`Create New Game`),
    click: onCreateProject,
    id: 'create-new-game-button',
  },
});
