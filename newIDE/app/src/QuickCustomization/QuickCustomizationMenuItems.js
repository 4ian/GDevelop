// @flow
import { type I18n as I18nType } from '@lingui/core';
import { t } from '@lingui/macro';
import Window from '../Utils/Window';
import { type MenuItemTemplate } from '../UI/Menu/Menu.flow';

const gd: libGDevelop = global.gd;

type Options = {|
  i18n: I18nType,
  visibility: QuickCustomization_Visibility,
  onChangeVisibility: QuickCustomization_Visibility => void,
|};

export const renderQuickCustomizationMenuItems = ({
  i18n,
  visibility,
  onChangeVisibility,
}: Options): Array<MenuItemTemplate> => {
  if (!Window.isDev()) return [];

  return [
    {
      label: i18n._(t`Quick Customization settings`),
      submenu: [
        {
          type: 'checkbox',
          label: i18n._(t`Visible`),
          checked: visibility === gd.QuickCustomization.Visible,
          click: () => {
            onChangeVisibility(gd.QuickCustomization.Visible);
          },
        },
        {
          type: 'checkbox',
          label: i18n._(t`Hidden`),
          checked: visibility === gd.QuickCustomization.Hidden,
          click: () => {
            onChangeVisibility(gd.QuickCustomization.Hidden);
          },
        },
        {
          type: 'checkbox',
          label: i18n._(t`Default visibility`),
          checked: visibility === gd.QuickCustomization.Default,
          click: () => {
            onChangeVisibility(gd.QuickCustomization.Default);
          },
        },
      ],
    },
  ];
};
