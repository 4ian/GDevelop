// @flow
import { type I18n as I18nType } from '@lingui/core';
import { t } from '@lingui/macro';

import * as React from 'react';
import Clipboard from '../Utils/Clipboard';
import {
  type TreeViewItemContent,
  type TreeItemProps,
  timelinesRootFolderId,
} from '.';
import { type HTMLDataset } from '../Utils/HTMLDataset';
import {
  deleteTimeline,
  getTimelines,
  makeTimelineName,
  moveTimeline,
  renameTimeline,
  saveTimelines,
  type TimelineData,
} from '../TimelineEditor/TimelineProjectStorage';

const TIMELINE_CLIPBOARD_KIND = 'Timeline';

const createTimelineId = (): string =>
  `timeline-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;

export type TimelineTreeViewItemCallbacks = {|
  onOpenTimeline: string => void,
|};

export type TimelineTreeViewItemCommonProps = {|
  ...TreeItemProps,
  ...TimelineTreeViewItemCallbacks,
|};

export type TimelineTreeViewItemProps = {|
  ...TimelineTreeViewItemCommonProps,
  project: gdProject,
|};

export const getTimelineTreeViewItemId = (timeline: TimelineData): string =>
  `timeline-${timeline.id}`;

export class TimelineTreeViewItemContent implements TreeViewItemContent {
  timeline: TimelineData;
  props: TimelineTreeViewItemProps;

  constructor(timeline: TimelineData, props: TimelineTreeViewItemProps) {
    this.timeline = timeline;
    this.props = props;
  }

  isDescendantOf(itemContent: TreeViewItemContent): boolean {
    return itemContent.getId() === timelinesRootFolderId;
  }

  getRootId(): string {
    return timelinesRootFolderId;
  }

  getName(): string | React.Node {
    return this.timeline.name;
  }

  getId(): string {
    return getTimelineTreeViewItemId(this.timeline);
  }

  getHtmlId(index: number): ?string {
    return `timeline-item-${index}`;
  }

  getDataSet(): ?HTMLDataset {
    return {
      timeline: this.timeline.name,
    };
  }

  getThumbnail(): ?string {
    return 'JsPlatform/Extensions/tween_behavior32.png';
  }

  onClick(): void {
    this.props.onOpenTimeline(this.timeline.id);
  }

  rename(newName: string): void {
    if (newName === this.timeline.name) {
      return;
    }
    renameTimeline(this.props.project, this.timeline.id, newName);
    this._onProjectItemModified(true);
  }

  edit(): void {
    this.props.editName(this.getId());
  }

  buildMenuTemplate(i18n: I18nType, index: number): any {
    return [
      {
        label: i18n._(t`Open`),
        click: () => this.onClick(),
      },
      {
        type: 'separator',
      },
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
        enabled: Clipboard.has(TIMELINE_CLIPBOARD_KIND),
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
    this.props
      .showDeleteConfirmation({
        title: t`Delete timeline`,
        message: t`Are you sure you want to delete this timeline? This cannot be undone.`,
      })
      .then(shouldDelete => {
        if (!shouldDelete) {
          return;
        }
        deleteTimeline(this.props.project, this.timeline.id);
        this._onProjectItemModified(true);
      });
  }

  getIndex(): number {
    return getTimelines(this.props.project).findIndex(
      timeline => timeline.id === this.timeline.id
    );
  }

  moveAt(destinationIndex: number): void {
    const originIndex = this.getIndex();
    if (destinationIndex !== originIndex) {
      moveTimeline(
        this.props.project,
        this.timeline.id,
        destinationIndex + (destinationIndex <= originIndex ? 0 : -1)
      );
      this._onProjectItemModified(true);
    }
  }

  copy(): void {
    Clipboard.set(TIMELINE_CLIPBOARD_KIND, {
      timeline: this.timeline,
      name: this.timeline.name,
    });
  }

  cut(): void {
    this.copy();
    this.delete();
  }

  paste(): void {
    if (!Clipboard.has(TIMELINE_CLIPBOARD_KIND)) {
      return;
    }

    const clipboardContent = Clipboard.get(TIMELINE_CLIPBOARD_KIND);
    const copiedTimeline =
      clipboardContent && typeof clipboardContent === 'object'
        ? clipboardContent.timeline
        : null;
    if (!copiedTimeline) {
      return;
    }

    const timelines = getTimelines(this.props.project);
    const newTimeline = {
      ...copiedTimeline,
      id: createTimelineId(),
      name: makeTimelineName(this.props.project, copiedTimeline.name),
    };
    const insertionIndex = this.getIndex() + 1;
    const nextTimelines = timelines.slice();
    nextTimelines.splice(insertionIndex, 0, newTimeline);
    saveTimelines(this.props.project, nextTimelines);
    this._onProjectItemModified(true);
    this.props.editName(getTimelineTreeViewItemId(newTimeline));
  }

  _duplicate(): void {
    this.copy();
    this.paste();
  }

  _onProjectItemModified(shouldForceUpdateList: boolean) {
    if (this.props.unsavedChanges)
      this.props.unsavedChanges.triggerUnsavedChanges();
    if (shouldForceUpdateList) {
      this.props.forceUpdateList();
    } else {
      this.props.forceUpdate();
    }
  }

  getRightButton(i18n: I18nType): any {
    return null;
  }
}
