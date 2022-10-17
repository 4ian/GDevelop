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

type DraggableEditorTabsProps = {|
  hideLabels?: boolean,
  editorTabs: EditorTabsState,
  onClickTab: (index: number) => void,
  onCloseTab: (editor: EditorTab) => void,
  onCloseOtherTabs: (editor: EditorTab) => void,
  onCloseAll: () => void,
  onTabActivated: (editor: EditorTab) => void,
  onDropTab: (fromIndex: number, toHoveredIndex: number) => void,
|};

export function DraggableEditorTabs({
  hideLabels,
  editorTabs,
  onClickTab,
  onCloseTab,
  onCloseOtherTabs,
  onCloseAll,
  onTabActivated,
  onDropTab,
}: DraggableEditorTabsProps) {
  let draggedTabIndex: ?number = null;

  return (
    <ClosableTabs hideLabels={hideLabels}>
      {getEditors(editorTabs).map((editorTab, id) => {
        const isCurrentTab = getCurrentTabIndex(editorTabs) === id;
        return (
          <DraggableClosableTab
            index={id}
            label={editorTab.label}
            icon={editorTab.icon}
            key={editorTab.key}
            id={`tab-${editorTab.key.replace(/\s/g, '-')}`}
            active={isCurrentTab}
            onClick={() => onClickTab(id)}
            onClose={() => onCloseTab(editorTab)}
            onCloseOthers={() => onCloseOtherTabs(editorTab)}
            onCloseAll={onCloseAll}
            onActivated={() => onTabActivated(editorTab)}
            closable={editorTab.closable}
            onBeginDrag={() => {
              draggedTabIndex = id;
              return editorTab;
            }}
            onDrop={toHoveredIndex => {
              if (typeof draggedTabIndex === 'number') {
                onDropTab(draggedTabIndex, id);
                draggedTabIndex = null;
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
  icon,
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
            // On touchscreens, we disable drag and drop.
            if (screenType === 'touch') return false;
            // We want "Home" tab to stay on the left.
            return index !== 0;
          }}
          canDrop={() => true}
          drop={() => onDrop(index)}
        >
          {({ connectDragSource, connectDropTarget, isOver, canDrop }) => {
            // Add an extra div because connectDropTarget/connectDragSource can
            // only be used on native elements.
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
                  icon={icon}
                  closable={closable}
                  onClick={onClick}
                  onActivated={onActivated}
                  key={id}
                />
                {isOver && <ColumnDropIndicator />}
              </div>
            );

            if (!dropTarget) return null;

            return connectDragSource(dropTarget);
          }}
        </DragSourceAndDropTarget>
      )}
    </ScreenTypeMeasurer>
  );
}
