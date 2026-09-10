// @flow
import * as React from 'react';

import { makeDragSourceAndDropTarget } from '../../UI/DragAndDrop/DragSourceAndDropTarget';
import HoldForMenuProgress from '../../UI/DragAndDrop/HoldForMenuProgress';
import { ColumnDropIndicator } from './DropIndicator';
import { type EditorTab } from './EditorTabsHandler';
import {
  ClosableTabs,
  ClosableTab,
  type ClosableTabProps,
} from '../../UI/ClosableTabs';
import { useResponsiveWindowSize } from '../../UI/Responsive/ResponsiveWindowMeasurer';
import useOnResize from '../../Utils/UseOnResize';
import useForceUpdate from '../../Utils/UseForceUpdate';

const DragSourceAndDropTarget = makeDragSourceAndDropTarget<EditorTab>(
  'draggable-closable-tab',
  { touchDragStart: 'afterHold' }
);

type DraggableEditorTabsProps = {|
  hideLabels?: boolean,
  editors: Array<EditorTab>,
  currentTab: EditorTab | null,
  onClickTab: (index: number) => void,
  onCloseTab: (editor: EditorTab) => void,
  onCloseOtherTabs: (editor: EditorTab) => void,
  onCloseAll: () => void,
  onPopOutTab?: ?(editor: EditorTab) => void,
  onTabActivated: (editor: EditorTab) => void,
  onDropTab: (fromIndex: number, toHoveredIndex: number) => void,
  onHoverTab: (
    editor: ?EditorTab,
    options: {| isLabelTruncated: boolean |}
  ) => void,
|};

export const getTabId = (editorTab: EditorTab): string =>
  `tab-${editorTab.key.replace(/\s/g, '-')}`;

const homeTabApproximateWidth = 35;

const styles = {
  tabContainer: {
    display: 'flex',
    flexShrink: 0,
  },
  // On touch screens, the tab held by the finger, ready to be dragged.
  tabReadyToDrag: {
    display: 'flex',
    flexShrink: 0,
    position: 'relative',
    transform: 'scale(1.03)',
    boxShadow: '0 3px 10px rgba(0, 0, 0, 0.35)',
    transition: 'transform 100ms ease-out, box-shadow 100ms ease-out',
  },
};

export function DraggableEditorTabs({
  hideLabels,
  editors,
  currentTab,
  onClickTab,
  onCloseTab,
  onCloseOtherTabs,
  onCloseAll,
  onPopOutTab,
  onTabActivated,
  onDropTab,
  onHoverTab,
}: DraggableEditorTabsProps): React.Node {
  // Kept in a ref (not a plain variable) so the index survives any re-render
  // happening between the drag start and the drop (tooltip hover timeouts, the
  // Ask AI glow interval, window resize...). Otherwise it would be reset to null
  // mid-drag and the drop would be silently ignored.
  const draggedTabIndexRef = React.useRef<?number>(null);

  // Ensure the component is re-rendered when the window is resized.
  useOnResize(useForceUpdate());
  const { windowSize } = useResponsiveWindowSize();

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
        const hasHomeTab =
          editors.length > 0 && editors[0].key === 'start page';

        return editors.map((editorTab, id) => {
          const isCurrentTab = currentTab === editorTab;

          // Maximum width of a tab is the width so that all tabs can fit it,
          // unless on a small screen, where we want to avoid compressing tabs too much
          // (and encourage scrolling instead).
          const minimumMaxWidth = windowSize === 'small' ? 100 : 80;
          const maxWidth = Math.max(
            minimumMaxWidth,
            // The home tab is special because it's just an icon.
            hasHomeTab
              ? (containerWidth - homeTabApproximateWidth) /
                  (editors.length - 1)
              : containerWidth / editors.length
          );

          return (
            <DraggableClosableTab
              index={id}
              label={editorTab.label}
              icon={editorTab.icon}
              renderCustomIcon={editorTab.renderCustomIcon}
              key={editorTab.id}
              id={getTabId(editorTab)}
              data={
                editorTab.tabOptions ? editorTab.tabOptions.data : undefined
              }
              active={isCurrentTab}
              onClick={() => onClickTab(id)}
              onClose={() => onCloseTab(editorTab)}
              onCloseOthers={() => onCloseOtherTabs(editorTab)}
              onCloseAll={onCloseAll}
              onPopOut={
                onPopOutTab && editorTab.closable
                  ? () => onPopOutTab(editorTab)
                  : null
              }
              popOutEnabled={
                // For now, don't allow popping out anything that can have a 3D editor shown.
                editorTab.kind !== 'layout' &&
                editorTab.kind !== 'external layout' &&
                editorTab.kind !== 'custom object'
              }
              onHover={(
                enter: boolean,
                options: {| isLabelTruncated: boolean |}
              ) => onHoverTab(enter ? editorTab : null, options)}
              onActivated={() => onTabActivated(editorTab)}
              closable={editorTab.closable}
              onBeginDrag={() => {
                draggedTabIndexRef.current = id;
                return editorTab;
              }}
              onDrop={toHoveredIndex => {
                if (typeof draggedTabIndexRef.current === 'number') {
                  onDropTab(draggedTabIndexRef.current, id);
                  draggedTabIndexRef.current = null;
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
  onPopOut,
  popOutEnabled,
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
}: DraggableClosableTabProps): React.Node {
  return (
    <DragSourceAndDropTarget
      beginDrag={onBeginDrag}
      // We want "Home" tab to stay on the left.
      canDrag={() => index !== 0}
      canDrop={() => true}
      drop={() => onDrop(index)}
    >
      {({
        connectDragSource,
        connectDropTarget,
        isOver,
        canDrop,
        isReadyToDrag,
      }) => {
        // Add an extra div because connectDropTarget/connectDragSource can
        // only be used on native elements.
        const dropTarget = connectDropTarget(
          <div
            style={isReadyToDrag ? styles.tabReadyToDrag : styles.tabContainer}
          >
            <ClosableTab
              id={id}
              data={data}
              active={active}
              onClose={onClose}
              onCloseOthers={onCloseOthers}
              onCloseAll={onCloseAll}
              onPopOut={onPopOut}
              popOutEnabled={popOutEnabled}
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
            {isReadyToDrag && <HoldForMenuProgress />}
          </div>
        );

        if (!dropTarget) return null;

        return connectDragSource(dropTarget);
      }}
    </DragSourceAndDropTarget>
  );
}
