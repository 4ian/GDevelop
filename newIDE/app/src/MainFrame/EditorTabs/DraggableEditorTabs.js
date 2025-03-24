// @flow
import * as React from 'react';

import { makeDragSourceAndDropTarget } from '../../UI/DragAndDrop/DragSourceAndDropTarget';
import { ScreenTypeMeasurer } from '../../UI/Responsive/ScreenTypeMeasurer';
import { ColumnDropIndicator } from './DropIndicator';
import {
  type EditorTabsState,
  type EditorTab,
  getEditors,
  getCurrentTabIndex,
  getCurrentTab,
} from './EditorTabsHandler';
import {
  ClosableTabs,
  ClosableTab,
  type ClosableTabProps,
} from '../../UI/ClosableTabs';
import { useResponsiveWindowSize } from '../../UI/Responsive/ResponsiveWindowMeasurer';
import useOnResize from '../../Utils/UseOnResize';
import useForceUpdate from '../../Utils/UseForceUpdate';

const DragSourceAndDropTarget = makeDragSourceAndDropTarget<EditorTab>(
  'draggable-closable-tab'
);

type DraggableEditorTabsProps = {|
  hideLabels?: boolean,
  editorTabs: EditorTabsState,
  onClickTab: (index: number) => void,
  onCloseTab: (editor: EditorTab) => void,
  onCloseOtherTabs: (editor: EditorTab) => void,
  onCloseAll: () => void,
  onTabActivated: (editor: EditorTab) => void,
  onDropTab: (fromIndex: number, toHoveredIndex: number) => void,
  onHoverTab: (editor: ?EditorTab) => void,
|};

export const getTabId = (editorTab: EditorTab) =>
  `tab-${editorTab.key.replace(/\s/g, '-')}`;

const homeTabApproximateWidth = 35;

export function DraggableEditorTabs({
  hideLabels,
  editorTabs,
  onClickTab,
  onCloseTab,
  onCloseOtherTabs,
  onCloseAll,
  onTabActivated,
  onDropTab,
  onHoverTab,
}: DraggableEditorTabsProps) {
  let draggedTabIndex: ?number = null;

  // Ensure the component is re-rendered when the window is resized.
  useOnResize(useForceUpdate());
  const { windowSize } = useResponsiveWindowSize();

  const currentTab = getCurrentTab(editorTabs);

  React.useEffect(
    () => {
      if (!currentTab) return;
      const tabElement = document.getElementById(getTabId(currentTab));
      if (tabElement) {
        tabElement.scrollIntoView({
          behavior: 'smooth',
          // Use 'end' to keep "Home" tab visible on small screens
          // when opening a new project.
          inline: windowSize === 'small' ? 'end' : 'nearest',
        });
      }
    },
    [currentTab, windowSize]
  );

  return (
    <ClosableTabs
      hideLabels={hideLabels}
      renderTabs={({ containerWidth }) => {
        const editors = getEditors(editorTabs);
        return editors.map((editorTab, id) => {
          const isCurrentTab = getCurrentTabIndex(editorTabs) === id;

          // Maximum width of a tab is the width so that all tabs can fit it,
          // unless on a small screen, where we want to avoid compressing tabs too much
          // (and encourage scrolling instead).
          const minimumMaxWidth = windowSize === 'small' ? 100 : 80;
          const maxWidth = Math.max(
            minimumMaxWidth,
            // The home tab is special because it's just an icon.
            (containerWidth - homeTabApproximateWidth) / (editors.length - 1)
          );

          return (
            <DraggableClosableTab
              index={id}
              label={editorTab.label}
              icon={editorTab.icon}
              renderCustomIcon={editorTab.renderCustomIcon}
              key={editorTab.key}
              id={getTabId(editorTab)}
              data={
                editorTab.tabOptions ? editorTab.tabOptions.data : undefined
              }
              active={isCurrentTab}
              onClick={() => onClickTab(id)}
              onClose={() => onCloseTab(editorTab)}
              onCloseOthers={() => onCloseOtherTabs(editorTab)}
              onCloseAll={onCloseAll}
              onHover={(enter: boolean) => onHoverTab(enter ? editorTab : null)}
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
              maxWidth={maxWidth}
            />
          );
        });
      }}
    />
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
  data,
  active,
  onClose,
  onCloseOthers,
  onCloseAll,
  label,
  icon,
  renderCustomIcon,
  closable,
  onClick,
  onActivated,
  onBeginDrag,
  onDrop,
  onHover,
  maxWidth,
}: DraggableClosableTabProps) {
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
                  data={data}
                  active={active}
                  onClose={onClose}
                  onCloseOthers={onCloseOthers}
                  onCloseAll={onCloseAll}
                  label={label}
                  icon={icon}
                  renderCustomIcon={renderCustomIcon}
                  closable={closable}
                  onClick={onClick}
                  onHover={onHover}
                  onActivated={onActivated}
                  maxWidth={maxWidth}
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
