// @flow
import { type I18n as I18nType } from '@lingui/core';
import { t } from '@lingui/macro';

import * as React from 'react';
import newNameGenerator from '../Utils/NewNameGenerator';
import Clipboard from '../Utils/Clipboard';
import { SafeExtractor } from '../Utils/SafeExtractor';
import {
  serializeToJSObject,
  unserializeFromJSObject,
} from '../Utils/Serializer';
import {
  // $FlowFixMe[import-type-as-value]
  TreeViewItemContent,
  type TreeItemProps,
  cinematicSequencesRootFolderId,
} from '.';
import { type HTMLDataset } from '../Utils/HTMLDataset';

const CINEMATIC_SEQUENCE_CLIPBOARD_KIND = 'Cinematic sequence';

export type CinematicSequenceTreeViewItemCallbacks = {|
  onCinematicSequenceAdded: () => void,
  onDeleteCinematicSequence: gdCinematicSequence => void,
  onRenameCinematicSequence: (string, string) => void,
  onOpenCinematicSequence: string => void,
|};

export type CinematicSequenceTreeViewItemCommonProps = {|
  ...TreeItemProps,
  ...CinematicSequenceTreeViewItemCallbacks,
|};

export type CinematicSequenceTreeViewItemProps = {|
  ...CinematicSequenceTreeViewItemCommonProps,
  project: gdProject,
|};

export const getCinematicSequenceTreeViewItemId = (
  cinematicSequence: gdCinematicSequence
): string => {
  // Pointers are used because they stay the same even when the names are
  // changed.
  return `cinematic-sequence-${cinematicSequence.ptr}`;
};

export class CinematicSequenceTreeViewItemContent implements TreeViewItemContent {
  cinematicSequence: gdCinematicSequence;
  props: CinematicSequenceTreeViewItemProps;

  constructor(
    cinematicSequence: gdCinematicSequence,
    props: CinematicSequenceTreeViewItemProps
  ) {
    this.cinematicSequence = cinematicSequence;
    this.props = props;
  }

  isDescendantOf(itemContent: TreeViewItemContent): boolean {
    return itemContent.getId() === cinematicSequencesRootFolderId;
  }

  getRootId(): string {
    return cinematicSequencesRootFolderId;
  }

  getName(): string | React.Node {
    return this.cinematicSequence.getName();
  }

  getId(): string {
    return getCinematicSequenceTreeViewItemId(this.cinematicSequence);
  }

  getHtmlId(index: number): ?string {
    return `cinematic-sequence-item-${index}`;
  }

  getDataSet(): ?HTMLDataset {
    return {
      'cinematic-sequence': this.cinematicSequence.getName(),
    };
  }

  getThumbnail(): ?string {
    return 'res/icons_default/camera_black.svg';
  }

  onClick(): void {
    this.props.onOpenCinematicSequence(this.cinematicSequence.getName());
  }

  rename(newName: string): void {
    const oldName = this.cinematicSequence.getName();
    if (oldName === newName) {
      return;
    }
    this.props.onRenameCinematicSequence(oldName, newName);
  }

  edit(): void {
    this.props.editName(this.getId());
  }

  buildMenuTemplate(i18n: I18nType, index: number): any {
    return [
      {
        label: i18n._(t`Rename`),
        click: () => this.edit(),
        accelerator: 'F2',
      },
      {
        label: i18n._(t`Delete`),
        click: () => this.delete(),
        accelerator: 'Backspace',
      },
      {
        type: 'separator',
      },
      {
        label: i18n._(t`Copy`),
        click: () => this.copy(),
        accelerator: 'CmdOrCtrl+C',
      },
      {
        label: i18n._(t`Cut`),
        click: () => this.cut(),
        accelerator: 'CmdOrCtrl+X',
      },
      {
        label: i18n._(t`Paste`),
        enabled: Clipboard.has(CINEMATIC_SEQUENCE_CLIPBOARD_KIND),
        click: () => this.paste(),
        accelerator: 'CmdOrCtrl+V',
      },
      {
        label: i18n._(t`Duplicate`),
        click: () => this._duplicate(),
      },
    ];
  }

  renderRightComponent(i18n: I18nType): ?React.Node {
    return null;
  }

  delete(): void {
    this.props.onDeleteCinematicSequence(this.cinematicSequence);
  }

  getIndex(): number {
    return this.props.project.getCinematicSequencePosition(
      this.cinematicSequence.getName()
    );
  }

  moveAt(destinationIndex: number): void {
    const originIndex = this.getIndex();
    if (destinationIndex !== originIndex) {
      this.props.project.moveCinematicSequence(
        originIndex,
        // When moving the item down, it must not be counted.
        destinationIndex + (destinationIndex <= originIndex ? 0 : -1)
      );
      this._onProjectItemModified();
    }
  }

  copy(): void {
    Clipboard.set(CINEMATIC_SEQUENCE_CLIPBOARD_KIND, {
      cinematicSequence: serializeToJSObject(this.cinematicSequence),
      name: this.cinematicSequence.getName(),
    });
  }

  cut(): void {
    this.copy();
    this.delete();
  }

  paste(): void {
    if (!Clipboard.has(CINEMATIC_SEQUENCE_CLIPBOARD_KIND)) return;

    const clipboardContent = Clipboard.get(CINEMATIC_SEQUENCE_CLIPBOARD_KIND);
    const copiedCinematicSequence = SafeExtractor.extractObjectProperty(
      clipboardContent,
      'cinematicSequence'
    );
    const name = SafeExtractor.extractStringProperty(clipboardContent, 'name');
    if (!name || !copiedCinematicSequence) return;

    const project = this.props.project;
    const newName = newNameGenerator(name, name =>
      project.hasCinematicSequenceNamed(name)
    );

    const newCinematicSequence = project.insertNewCinematicSequence(
      newName,
      this.getIndex() + 1
    );

    unserializeFromJSObject(
      newCinematicSequence,
      copiedCinematicSequence,
      'unserializeFrom',
      project
    );
    // Unserialization has overwritten the name.
    newCinematicSequence.setName(newName);

    this._onProjectItemModified();
    this.props.editName(getCinematicSequenceTreeViewItemId(newCinematicSequence));
    this.props.onCinematicSequenceAdded();
  }

  _duplicate(): void {
    this.copy();
    this.paste();
  }

  _onProjectItemModified() {
    if (this.props.unsavedChanges)
      this.props.unsavedChanges.triggerUnsavedChanges();
    this.props.forceUpdate();
  }

  getRightButton(i18n: I18nType): any {
    return null;
  }
}
