// @flow
import { type I18n as I18nType } from '@lingui/core';
import { t } from '@lingui/macro';

import * as React from 'react';
import { TreeViewItemContent } from '.';
import { type HTMLDataset } from '../Utils/HTMLDataset';
import ColorPicker from '../UI/ColorField/ColorPicker';

export const backgroundColorId = 'background-color';

export class BackgroundColorTreeViewItemContent implements TreeViewItemContent {
  layout: gdLayout;
  onBackgroundColorChanged: () => void;

  constructor(layout: gdLayout, onBackgroundColorChanged: () => void) {
    this.layout = layout;
    this.onBackgroundColorChanged = onBackgroundColorChanged;
  }

  getName(i18n: I18nType): string | React.Node {
    return i18n._(t`Background color`);
  }

  getId(): string {
    return backgroundColorId;
  }

  getRightButton(i18n: I18nType) {
    return [];
  }

  getHtmlId(index: number): ?string {
    return backgroundColorId;
  }

  getDataSet(): ?HTMLDataset {
    return null;
  }

  getThumbnail(): ?string {
    return null;
  }

  onClick(): void {}

  buildMenuTemplate(i18n: I18nType, index: number) {
    return [];
  }

  renderRightComponent(i18n: I18nType): ?React.Node {
    return (
      <ColorPicker
        disableAlpha
        color={{
          r: this.layout.getBackgroundColorRed(),
          g: this.layout.getBackgroundColorGreen(),
          b: this.layout.getBackgroundColorBlue(),
          a: 255,
        }}
        onChangeComplete={color => {
          this.layout.setBackgroundColor(color.rgb.r, color.rgb.g, color.rgb.b);
          this.onBackgroundColorChanged();
        }}
      />
    );
  }

  rename(newName: string): void {}

  edit(): void {}

  delete(): void {}

  copy(): void {}

  paste(): void {}

  cut(): void {}

  getIndex(): number {
    return 0;
  }

  moveAt(destinationIndex: number): void {}

  isDescendantOf(itemContent: TreeViewItemContent): boolean {
    return false;
  }

  getRootId(): string {
    return '';
  }
}
