// @flow
import * as React from 'react';

import { makeDragSourceAndDropTarget } from '../../UI/DragAndDrop/DragSourceAndDropTarget';
import { ScreenTypeMeasurer } from '../../UI/Reponsive/ScreenTypeMeasurer';
import { ColumnDropIndicator } from './DropIndicator';
import {
  type EditorTabsState,
  type EditorTab,
  getEditors,
  getCurrentTabIndex,
} from './EditorTabsHandler';
import {
  ClosableTabs,
  ClosableTab,
  type ClosableTabProps,
} from '../../UI/ClosableTabs';

type DraggableClosableTabsProps = {|
  hideLabels?: boolean,
  editorTabs: EditorTabsState,
  onClickTab: (index: number) => void,
  onCloseTab: (editor: EditorTab) => void,
  onCloseOtherTabs: (editor: EditorTab) => void,
  onCloseAll: () => void,
  onTabActive: (editor: EditorTab) => void,
  onDropTab: (fromIndex: number, toIndex: number) => void,
|};

export function DraggableClosableTabs({
  hideLabels,
  editorTabs,
  onClickTab,
  onCloseTab,
  onCloseOtherTabs,
  onCloseAll,
  onTabActive,
  onDropTab,
}: DraggableClosableTabsProps) {
  let draggedTabIndex: number | typeof undefined = undefined;

  return (
    <ClosableTabs hideLabels={hideLabels}>
      {getEditors(editorTabs).map((editorTab, id) => {
        const isCurrentTab = getCurrentTabIndex(editorTabs) === id;
        return (
          <DraggableClosableTab
            index={id}
            label={editorTab.label}
            key={editorTab.key}
            id={`tab-${editorTab.key.replace(/\s/g, '-')}`}
            active={isCurrentTab}
            onClick={() => onClickTab(id)}
            onClose={() => onCloseTab(editorTab)}
            onCloseOthers={() => onCloseOtherTabs(editorTab)}
            onCloseAll={onCloseAll}
            onActivated={() => onTabActive(editorTab)}
            closable={editorTab.closable}
            onBeginDrag={() => {
              draggedTabIndex = id;
              return editorTab;
            }}
            onDrop={toIndex => {
              if (draggedTabIndex !== undefined) {
                onDropTab(draggedTabIndex, id);
                draggedTabIndex = undefined;
              }
            }}
          />
        );
      })}
    </ClosableTabs>
  );
}

type DraggableClosableTabProps = {|
  index: number,
  onBeginDrag: () => EditorTab,
  onDrop: (toIndex: number) => void,
  ...ClosableTabProps,
|};

export function DraggableClosableTab({
  index,
  id,
  active,
  onClose,
  onCloseOthers,
  onCloseAll,
  label,
  closable,
  onClick,
  onActivated,
  onBeginDrag,
  onDrop,
}: DraggableClosableTabProps) {
  const DragSourceAndDropTarget = makeDragSourceAndDropTarget<EditorTab>(
    'draggable-closable-tab'
  );

  return (
    <ScreenTypeMeasurer>
      {screenType => (
        <DragSourceAndDropTarget
          beginDrag={onBeginDrag}
          canDrag={() => {
            // On touchscreens, we allow DnD on active tab so that user can scroll
            if (screenType === 'touch' && !active) return false;
            // We want "Home" tab to stay on the left
            return index !== 0;
          }}
          canDrop={() => true}
          drop={() => onDrop(index)}
        >
          {({ connectDragSource, connectDropTarget, isOver, canDrop }) => {
            // If on a touch screen, setting the whole item to be
            // draggable would prevent scroll. Set the icon only to be
            // draggable if the item is not selected. When selected,
            // set the whole item to be draggable.
            const canDragOnlyIcon = screenType === 'touch' && !active;

            // Add an extra div because connectDropTarget/connectDragSource can
            // only be used on native elements
            const dropTarget = connectDropTarget(
              <div
                style={{
                  display: 'flex',
                  flexShrink: 0,
                }}
              >
                <ClosableTab
                  id={id}
                  active={active}
                  onClose={onClose}
                  onCloseOthers={onCloseOthers}
                  onCloseAll={onCloseAll}
                  label={label}
                  closable={closable}
                  onClick={onClick}
                  onActivated={onActivated}
                  key={id}
                />
                {isOver && <ColumnDropIndicator />}
              </div>
            );

            if (!dropTarget) return null;

            return canDragOnlyIcon ? dropTarget : connectDragSource(dropTarget);
          }}
        </DragSourceAndDropTarget>
      )}
    </ScreenTypeMeasurer>
  );
}
