// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';
import { type I18n as I18nType } from '@lingui/core';
import GDevelopThemeContext from '../../UI/Theme/GDevelopThemeContext';
import ContextMenu, {
  type ContextMenuInterface,
} from '../../UI/Menu/ContextMenu';
import { type MenuItemTemplate } from '../../UI/Menu/Menu.flow';
import IconButton from '../../UI/IconButton';
import ZoomIn from '@material-ui/icons/ZoomIn';
import ZoomOut from '@material-ui/icons/ZoomOut';
import CenterFocusStrong from '@material-ui/icons/CenterFocusStrong';
import {
  type StateMachineData,
  type StateMachineSelection,
  type State,
  anyStateId,
  stateNodeWidth,
  stateNodeHeight,
  entryNodeWidth,
  entryNodeHeight,
  anyStateNodeWidth,
  anyStateNodeHeight,
  subMachineHeaderHeight,
  getState,
  getEntryState,
  getSubMachine,
  getStatesOfSubMachine,
  getSubMachineRect,
  clampValue,
} from './StateMachineUtils';

type GraphCoordinates = {| x: number, y: number |};
type Rect = {| x: number, y: number, width: number, height: number |};

export type StateMachineGraphInterface = {|
  getGraphCenter: () => GraphCoordinates,
  centerView: () => void,
|};

type Props = {|
  data: StateMachineData,
  selection: StateMachineSelection,
  onSelect: (selection: StateMachineSelection) => void,
  onMoveState: (stateId: string, x: number, y: number) => void,
  onMoveSubMachine: (
    subMachineId: string,
    deltaX: number,
    deltaY: number
  ) => void,
  onCreateTransition: (
    sourceStateId: string,
    targetId: string,
    targetKind: 'state' | 'subMachine'
  ) => void,
  onAddState: (x: number, y: number) => void,
  onAddSubMachine: (x: number, y: number) => void,
  onDuplicateState: (stateId: string) => void,
  onDeleteState: (stateId: string) => void,
  onDeleteTransition: (sourceStateId: string, transitionId: string) => void,
  onSetEntryState: (stateId: string) => void,
  onSetSubMachineEntryState: (subMachineId: string, stateId: string) => void,
  onMoveStateToSubMachine: (stateId: string, subMachineId: string) => void,
  onRenameState: (stateId: string, name: string) => void,
  onRenameSubMachine: (subMachineId: string, name: string) => void,
  onDeleteSubMachine: (subMachineId: string, deleteStates: boolean) => void,
  onToggleTransitionExitTime: (
    sourceStateId: string,
    transitionId: string
  ) => void,
|};

type ContextMenuTarget =
  | {| kind: 'background', x: number, y: number |}
  | {| kind: 'node', stateId: string |}
  | {| kind: 'anyState' |}
  | {| kind: 'subMachine', subMachineId: string |}
  | {| kind: 'edge', sourceStateId: string, transitionId: string |};

type DragState =
  | {|
      mode: 'pan',
      startClientX: number,
      startClientY: number,
      startPanX: number,
      startPanY: number,
      moved: boolean,
    |}
  | {|
      mode: 'node',
      key: string,
      startClientX: number,
      startClientY: number,
      startX: number,
      startY: number,
      currentX: number,
      currentY: number,
      moved: boolean,
    |}
  | {|
      mode: 'subMachine',
      subMachineId: string,
      startClientX: number,
      startClientY: number,
      deltaX: number,
      deltaY: number,
      moved: boolean,
    |}
  | {|
      mode: 'link',
      sourceStateId: string,
      moved: boolean,
    |};

const styles = {
  container: {
    position: 'relative',
    flex: 1,
    minHeight: 0,
    overflow: 'hidden',
    cursor: 'grab',
    userSelect: 'none',
  },
  transformedContainer: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 0,
    height: 0,
    transformOrigin: '0 0',
  },
  node: {
    position: 'absolute',
    boxSizing: 'border-box',
    borderRadius: 6,
    padding: '5px 10px',
    overflow: 'hidden',
    cursor: 'pointer',
    borderStyle: 'solid',
    borderWidth: 2,
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.35)',
  },
  nodeTitle: {
    fontWeight: 600,
    fontSize: 13,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    lineHeight: '18px',
    pointerEvents: 'none',
  },
  nodeSubtitle: {
    fontSize: 11,
    opacity: 0.75,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    lineHeight: '15px',
    pointerEvents: 'none',
  },
  entryNode: {
    position: 'absolute',
    boxSizing: 'border-box',
    borderRadius: 6,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    fontSize: 12,
    color: '#ffffff',
    cursor: 'pointer',
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.35)',
  },
  port: {
    position: 'absolute',
    right: -7,
    top: '50%',
    marginTop: -7,
    width: 14,
    height: 14,
    borderRadius: '50%',
    cursor: 'crosshair',
    boxSizing: 'border-box',
    borderStyle: 'solid',
    borderWidth: 2,
  },
  subMachineBox: {
    position: 'absolute',
    boxSizing: 'border-box',
    borderRadius: 10,
    borderStyle: 'solid',
    borderWidth: 2,
  },
  subMachineHeader: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: subMachineHeaderHeight,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '0 8px',
    cursor: 'move',
    overflow: 'hidden',
  },
  subMachineName: {
    fontWeight: 700,
    fontSize: 12,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    pointerEvents: 'none',
  },
  subMachineEntryChip: {
    fontSize: 10,
    opacity: 0.8,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    pointerEvents: 'none',
  },
  zoomControls: {
    position: 'absolute',
    right: 8,
    top: 8,
    display: 'flex',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    borderRadius: 6,
  },
  zoomLabel: {
    fontSize: 11,
    minWidth: 38,
    textAlign: 'center',
  },
  renameInput: {
    position: 'absolute',
    left: 6,
    right: 6,
    top: 6,
    boxSizing: 'border-box',
    fontSize: 13,
    fontWeight: 600,
    padding: '2px 4px',
    borderRadius: 3,
    borderStyle: 'solid',
    borderWidth: 1,
  },
  subMachineRenameInput: {
    boxSizing: 'border-box',
    fontSize: 12,
    fontWeight: 700,
    padding: '1px 4px',
    borderRadius: 3,
    borderStyle: 'solid',
    borderWidth: 1,
    width: 140,
  },
};

const getEntryNodeRect = (entryState: State): Rect => ({
  x: entryState.x - entryNodeWidth - 24,
  y: entryState.y + (stateNodeHeight - entryNodeHeight) / 2,
  width: entryNodeWidth,
  height: entryNodeHeight,
});

const getNodeRect = (state: State): Rect => ({
  x: state.x,
  y: state.y,
  width: stateNodeWidth,
  height: stateNodeHeight,
});

const getAnyStateNodeRect = (position: GraphCoordinates): Rect => ({
  x: position.x,
  y: position.y,
  width: anyStateNodeWidth,
  height: anyStateNodeHeight,
});

/**
 * Get the point where a line from the center of the rect towards the given
 * point crosses the border of the rect.
 */
const getRectAnchor = (
  rect: Rect,
  toward: GraphCoordinates
): GraphCoordinates => {
  const cx = rect.x + rect.width / 2;
  const cy = rect.y + rect.height / 2;
  const dx = toward.x - cx;
  const dy = toward.y - cy;
  if (dx === 0 && dy === 0) return { x: cx, y: cy };
  const scaleX = dx !== 0 ? rect.width / 2 / Math.abs(dx) : Infinity;
  const scaleY = dy !== 0 ? rect.height / 2 / Math.abs(dy) : Infinity;
  const scale = Math.min(scaleX, scaleY);
  return { x: cx + dx * scale, y: cy + dy * scale };
};

const getEdgePathData = (
  fromRect: Rect,
  toRect: Rect,
  isSelfLoop: boolean
): {| path: string, labelX: number, labelY: number |} => {
  if (isSelfLoop) {
    const x = fromRect.x + fromRect.width;
    const y = fromRect.y + fromRect.height / 2;
    return {
      path: `M ${x} ${y - 8} C ${x + 70} ${y - 60}, ${x + 70} ${y +
        60}, ${x} ${y + 8}`,
      labelX: x + 78,
      labelY: y,
    };
  }
  const fromCenter = {
    x: fromRect.x + fromRect.width / 2,
    y: fromRect.y + fromRect.height / 2,
  };
  const toCenter = {
    x: toRect.x + toRect.width / 2,
    y: toRect.y + toRect.height / 2,
  };
  const start = getRectAnchor(fromRect, toCenter);
  const end = getRectAnchor(toRect, fromCenter);
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const distance = Math.sqrt(dx * dx + dy * dy) || 1;
  const offset = Math.max(40, distance * 0.4);
  const control1 = {
    x: start.x + (dx / distance) * offset,
    y: start.y + (dy / distance) * offset,
  };
  const control2 = {
    x: end.x - (dx / distance) * offset,
    y: end.y - (dy / distance) * offset,
  };
  return {
    path: `M ${start.x} ${start.y} C ${control1.x} ${control1.y}, ${
      control2.x
    } ${control2.y}, ${end.x} ${end.y}`,
    labelX: (start.x + end.x) / 2,
    labelY: (start.y + end.y) / 2,
  };
};

const StateMachineGraph = React.forwardRef<Props, StateMachineGraphInterface>(
  (props, ref) => {
    const {
      data,
      selection,
      onSelect,
      onMoveState,
      onMoveSubMachine,
      onCreateTransition,
      onAddState,
      onAddSubMachine,
      onDuplicateState,
      onDeleteState,
      onDeleteTransition,
      onSetEntryState,
      onSetSubMachineEntryState,
      onMoveStateToSubMachine,
      onRenameState,
      onRenameSubMachine,
      onDeleteSubMachine,
      onToggleTransitionExitTime,
    } = props;
    const gdevelopTheme = React.useContext(GDevelopThemeContext);
    const containerRef = React.useRef<?HTMLDivElement>(null);
    const contextMenu = React.useRef<?ContextMenuInterface>(null);
    const dragRef = React.useRef<?DragState>(null);
    const viewRef = React.useRef<{|
      panX: number,
      panY: number,
      zoom: number,
    |}>({
      panX: 60,
      panY: 40,
      zoom: 1,
    });

    const [, setViewVersion] = React.useState(0);
    const [dragPositions, setDragPositions] = React.useState<?{
      [string]: GraphCoordinates,
    }>(null);
    const [groupDrag, setGroupDrag] = React.useState<?{|
      subMachineId: string,
      deltaX: number,
      deltaY: number,
    |}>(null);
    const [linkEnd, setLinkEnd] = React.useState<?GraphCoordinates>(null);
    const [hoveredStateId, setHoveredStateId] = React.useState<?string>(null);
    const [
      hoveredSubMachineId,
      setHoveredSubMachineId,
    ] = React.useState<?string>(null);
    const [renamingStateId, setRenamingStateId] = React.useState<?string>(null);
    const [
      renamingSubMachineId,
      setRenamingSubMachineId,
    ] = React.useState<?string>(null);
    const [renameValue, setRenameValue] = React.useState('');

    const hoveredStateIdRef = React.useRef<?string>(null);
    hoveredStateIdRef.current = hoveredStateId;
    const hoveredSubMachineIdRef = React.useRef<?string>(null);
    hoveredSubMachineIdRef.current = hoveredSubMachineId;
    const lastDragMovedRef = React.useRef(false);

    const updateView = React.useCallback(
      (newView: {| panX: number, panY: number, zoom: number |}) => {
        viewRef.current = newView;
        setViewVersion(version => version + 1);
      },
      []
    );

    const toGraphCoordinates = React.useCallback(
      (clientX: number, clientY: number): GraphCoordinates => {
        const container = containerRef.current;
        if (!container) return { x: 0, y: 0 };
        const rect = container.getBoundingClientRect();
        const view = viewRef.current;
        return {
          x: (clientX - rect.left - view.panX) / view.zoom,
          y: (clientY - rect.top - view.panY) / view.zoom,
        };
      },
      []
    );

    const getGraphCenter = React.useCallback((): GraphCoordinates => {
      const container = containerRef.current;
      const view = viewRef.current;
      if (!container) return { x: 0, y: 0 };
      return {
        x: (container.clientWidth / 2 - view.panX) / view.zoom,
        y: (container.clientHeight / 2 - view.panY) / view.zoom,
      };
    }, []);

    const centerView = React.useCallback(
      () => {
        const container = containerRef.current;
        if (!container) return;
        const { states } = data;
        if (!states.length) {
          updateView({ panX: 60, panY: 40, zoom: 1 });
          return;
        }
        let minX = Infinity;
        let minY = Infinity;
        let maxX = -Infinity;
        let maxY = -Infinity;
        const expand = (
          x: number,
          y: number,
          width: number,
          height: number
        ) => {
          minX = Math.min(minX, x);
          minY = Math.min(minY, y);
          maxX = Math.max(maxX, x + width);
          maxY = Math.max(maxY, y + height);
        };
        for (const state of states)
          expand(state.x, state.y, stateNodeWidth, stateNodeHeight);
        expand(
          data.anyState.x,
          data.anyState.y,
          anyStateNodeWidth,
          anyStateNodeHeight
        );
        for (const subMachine of data.subMachines) {
          const rect = getSubMachineRect(data, subMachine.id);
          if (rect) expand(rect.x, rect.y, rect.width, rect.height);
        }
        minX -= 40;
        minY -= 40;
        maxX += 40;
        maxY += 40;
        const zoom = clampValue(
          Math.min(
            container.clientWidth / (maxX - minX),
            container.clientHeight / (maxY - minY),
            1.25
          ),
          0.25,
          2.5
        );
        updateView({
          zoom,
          panX: container.clientWidth / 2 - ((minX + maxX) / 2) * zoom,
          panY: container.clientHeight / 2 - ((minY + maxY) / 2) * zoom,
        });
      },
      [data, updateView]
    );

    React.useImperativeHandle(ref, () => ({ getGraphCenter, centerView }), [
      getGraphCenter,
      centerView,
    ]);

    // Handle the zoom with a non-passive wheel listener (to be able to prevent
    // the default page scroll).
    React.useEffect(
      () => {
        const container = containerRef.current;
        if (!container) return;
        const handleWheel = (event: WheelEvent) => {
          event.preventDefault();
          const rect = container.getBoundingClientRect();
          const mouseX = event.clientX - rect.left;
          const mouseY = event.clientY - rect.top;
          const currentView = viewRef.current;
          const zoomFactor = event.deltaY < 0 ? 1.1 : 1 / 1.1;
          const zoom = clampValue(currentView.zoom * zoomFactor, 0.25, 2.5);
          const scale = zoom / currentView.zoom;
          updateView({
            zoom,
            panX: mouseX - (mouseX - currentView.panX) * scale,
            panY: mouseY - (mouseY - currentView.panY) * scale,
          });
        };
        // $FlowFixMe[extra-arg] passive is supported by all browsers.
        container.addEventListener('wheel', handleWheel, { passive: false });
        return () => {
          container.removeEventListener('wheel', handleWheel);
        };
      },
      [updateView]
    );

    // The latest callbacks, kept in a ref so the window listeners (registered
    // once) always use the current ones.
    const callbacksRef = React.useRef({
      onMoveState,
      onMoveSubMachine,
      onCreateTransition,
    });
    callbacksRef.current = {
      onMoveState,
      onMoveSubMachine,
      onCreateTransition,
    };

    const handleWindowMouseMove = React.useCallback(
      (event: MouseEvent) => {
        const drag = dragRef.current;
        if (!drag) return;
        if (drag.mode === 'link') {
          drag.moved = true;
        } else if (
          Math.abs(event.clientX - drag.startClientX) > 2 ||
          Math.abs(event.clientY - drag.startClientY) > 2
        ) {
          drag.moved = true;
        }
        const view = viewRef.current;
        if (drag.mode === 'pan') {
          updateView({
            zoom: view.zoom,
            panX: drag.startPanX + (event.clientX - drag.startClientX),
            panY: drag.startPanY + (event.clientY - drag.startClientY),
          });
        } else if (drag.mode === 'node') {
          drag.currentX =
            drag.startX + (event.clientX - drag.startClientX) / view.zoom;
          drag.currentY =
            drag.startY + (event.clientY - drag.startClientY) / view.zoom;
          setDragPositions({
            [drag.key]: { x: drag.currentX, y: drag.currentY },
          });
        } else if (drag.mode === 'subMachine') {
          drag.deltaX = (event.clientX - drag.startClientX) / view.zoom;
          drag.deltaY = (event.clientY - drag.startClientY) / view.zoom;
          setGroupDrag({
            subMachineId: drag.subMachineId,
            deltaX: drag.deltaX,
            deltaY: drag.deltaY,
          });
        } else if (drag.mode === 'link') {
          setLinkEnd(toGraphCoordinates(event.clientX, event.clientY));
        }
      },
      [toGraphCoordinates, updateView]
    );

    const finishDrag = React.useCallback(() => {
      const drag = dragRef.current;
      dragRef.current = null;
      if (!drag) return;
      lastDragMovedRef.current = drag.moved;
      if (drag.mode === 'node' && drag.moved) {
        // Position committed once, at the end of the drag.
        callbacksRef.current.onMoveState(
          drag.key,
          drag.currentX,
          drag.currentY
        );
      } else if (drag.mode === 'subMachine' && drag.moved) {
        callbacksRef.current.onMoveSubMachine(
          drag.subMachineId,
          drag.deltaX,
          drag.deltaY
        );
      }
      setDragPositions(null);
      setGroupDrag(null);
      if (drag.mode === 'link') {
        const hoveredStateId = hoveredStateIdRef.current;
        const hoveredSubMachineId = hoveredSubMachineIdRef.current;
        if (hoveredStateId) {
          callbacksRef.current.onCreateTransition(
            drag.sourceStateId,
            hoveredStateId,
            'state'
          );
        } else if (hoveredSubMachineId) {
          callbacksRef.current.onCreateTransition(
            drag.sourceStateId,
            hoveredSubMachineId,
            'subMachine'
          );
        }
        setLinkEnd(null);
        setHoveredStateId(null);
        setHoveredSubMachineId(null);
      }
    }, []);

    // The window listeners are registered once: they only do something while
    // a drag is in progress (see dragRef).
    React.useEffect(
      () => {
        const handleWindowMouseUp = () => {
          finishDrag();
        };
        window.addEventListener('mousemove', handleWindowMouseMove);
        window.addEventListener('mouseup', handleWindowMouseUp);
        return () => {
          window.removeEventListener('mousemove', handleWindowMouseMove);
          window.removeEventListener('mouseup', handleWindowMouseUp);
        };
      },
      [finishDrag, handleWindowMouseMove]
    );

    const startDrag = (drag: DragState) => {
      dragRef.current = drag;
    };

    const onBackgroundMouseDown = (
      event: SyntheticMouseEvent<HTMLDivElement>
    ) => {
      if (event.button !== 0 && event.button !== 1) return;
      event.preventDefault();
      startDrag({
        mode: 'pan',
        startClientX: event.clientX,
        startClientY: event.clientY,
        startPanX: viewRef.current.panX,
        startPanY: viewRef.current.panY,
        moved: false,
      });
    };

    const startNodeDrag = (
      event: SyntheticMouseEvent<HTMLDivElement>,
      key: string,
      position: GraphCoordinates,
      selection: StateMachineSelection
    ) => {
      if (event.button !== 0) return;
      event.stopPropagation();
      onSelect(selection);
      startDrag({
        mode: 'node',
        key,
        startClientX: event.clientX,
        startClientY: event.clientY,
        startX: position.x,
        startY: position.y,
        currentX: position.x,
        currentY: position.y,
        moved: false,
      });
    };

    const onPortMouseDown = (
      event: SyntheticMouseEvent<HTMLDivElement>,
      sourceStateId: string
    ) => {
      if (event.button !== 0) return;
      event.stopPropagation();
      event.preventDefault();
      setLinkEnd(toGraphCoordinates(event.clientX, event.clientY));
      startDrag({ mode: 'link', sourceStateId, moved: false });
    };

    const onBackgroundClick = (event: SyntheticMouseEvent<HTMLDivElement>) => {
      if (lastDragMovedRef.current) {
        lastDragMovedRef.current = false;
        return;
      }
      if (event.target !== event.currentTarget) return;
      onSelect(null);
    };

    const openContextMenu = (
      event: {
        clientX: number,
        clientY: number,
        preventDefault: () => void,
        stopPropagation: () => void,
      },
      target: ContextMenuTarget
    ) => {
      event.preventDefault();
      event.stopPropagation();
      const contextMenuElement = contextMenu.current;
      if (!contextMenuElement) return;
      contextMenuElement.open(event.clientX, event.clientY, target);
    };

    const startRenamingState = (state: State) => {
      setRenamingStateId(state.id);
      setRenameValue(state.name);
    };

    const startRenamingSubMachine = (subMachineId: string, name: string) => {
      setRenamingSubMachineId(subMachineId);
      setRenameValue(name);
    };

    const commitRename = () => {
      const stateId = renamingStateId;
      const subMachineId = renamingSubMachineId;
      setRenamingStateId(null);
      setRenamingSubMachineId(null);
      const name = renameValue.trim();
      if (!name) return;
      if (stateId) {
        const state = getState(data, stateId);
        if (state && name !== state.name) onRenameState(stateId, name);
      } else if (subMachineId) {
        const subMachine = getSubMachine(data, subMachineId);
        if (subMachine && name !== subMachine.name)
          onRenameSubMachine(subMachineId, name);
      }
    };

    const buildContextMenu = (
      i18n: I18nType,
      target: ContextMenuTarget
    ): Array<MenuItemTemplate> => {
      if (target.kind === 'background') {
        return [
          {
            label: i18n._('Add a state'),
            click: () => onAddState(target.x, target.y),
          },
          {
            label: i18n._('Add a sub-state machine'),
            click: () => onAddSubMachine(target.x, target.y),
          },
          { type: 'separator' },
          {
            label: i18n._('Center the view'),
            click: () => centerView(),
          },
        ];
      }
      if (target.kind === 'node') {
        const state = getState(data, target.stateId);
        if (!state) return [];
        return [
          {
            label: i18n._('Make a transition to'),
            submenu: [
              ...data.states
                .filter(otherState => otherState.id !== state.id)
                .map(otherState => ({
                  label: otherState.name,
                  click: () =>
                    onCreateTransition(state.id, otherState.id, 'state'),
                })),
              ...data.subMachines.map(subMachine => ({
                label: `▸ ${subMachine.name}`,
                click: () =>
                  onCreateTransition(state.id, subMachine.id, 'subMachine'),
              })),
            ],
          },
          {
            label: i18n._('Make a self transition'),
            click: () => onCreateTransition(state.id, state.id, 'state'),
          },
          { type: 'separator' },
          {
            label: i18n._('Set as the entry state'),
            enabled: true,
            click: () => onSetEntryState(state.id),
          },
          {
            label: i18n._('Move to a sub-state machine'),
            submenu: [
              {
                label: i18n._('Root (no sub-state machine)'),
                enabled: !!state.subMachineId,
                click: () => onMoveStateToSubMachine(state.id, ''),
              },
              ...data.subMachines.map(subMachine => ({
                label: subMachine.name,
                enabled: state.subMachineId !== subMachine.id,
                click: () => onMoveStateToSubMachine(state.id, subMachine.id),
              })),
            ],
          },
          { type: 'separator' },
          {
            label: i18n._('Rename'),
            click: () => startRenamingState(state),
          },
          {
            label: i18n._('Duplicate'),
            click: () => onDuplicateState(state.id),
          },
          { type: 'separator' },
          {
            label: i18n._('Delete'),
            click: () => onDeleteState(state.id),
          },
        ];
      }
      if (target.kind === 'anyState') {
        return [
          {
            label: i18n._('Make a transition to'),
            submenu: [
              ...data.states.map(state => ({
                label: state.name,
                click: () => onCreateTransition(anyStateId, state.id, 'state'),
              })),
              ...data.subMachines.map(subMachine => ({
                label: `▸ ${subMachine.name}`,
                click: () =>
                  onCreateTransition(anyStateId, subMachine.id, 'subMachine'),
              })),
            ],
          },
        ];
      }
      if (target.kind === 'subMachine') {
        const subMachine = getSubMachine(data, target.subMachineId);
        if (!subMachine) return [];
        const childStates = getStatesOfSubMachine(data, target.subMachineId);
        return [
          {
            label: i18n._('Rename'),
            click: () =>
              startRenamingSubMachine(subMachine.id, subMachine.name),
          },
          {
            label: i18n._('Set the entry state to'),
            submenu: childStates.length
              ? childStates.map(childState => ({
                  label: childState.name,
                  enabled: subMachine.entryStateId !== childState.id,
                  click: () =>
                    onSetSubMachineEntryState(subMachine.id, childState.id),
                }))
              : [
                  {
                    label: i18n._('No state yet'),
                    enabled: false,
                    click: () => {},
                  },
                ],
          },
          { type: 'separator' },
          {
            label: i18n._('Ungroup (move the states to the root)'),
            click: () => onDeleteSubMachine(subMachine.id, false),
          },
          {
            label: i18n._('Delete with its states'),
            click: () => onDeleteSubMachine(subMachine.id, true),
          },
        ];
      }
      const transitions = (() => {
        if (target.sourceStateId === anyStateId)
          return data.anyState.transitions;
        const sourceState = getState(data, target.sourceStateId);
        return sourceState ? sourceState.transitions : [];
      })();
      const transition = transitions.find(
        candidate => candidate.id === target.transitionId
      );
      return [
        {
          type: 'checkbox',
          label: i18n._('Has exit time'),
          checked: transition ? transition.hasExitTime : false,
          click: () =>
            onToggleTransitionExitTime(
              target.sourceStateId,
              target.transitionId
            ),
        },
        { type: 'separator' },
        {
          label: i18n._('Delete the transition'),
          click: () =>
            onDeleteTransition(target.sourceStateId, target.transitionId),
        },
      ];
    };

    const view = viewRef.current;
    const entryState = getEntryState(data);
    const backgroundColor = gdevelopTheme.palette.alternateCanvasColor;
    const gridColor = gdevelopTheme.toolbar.separatorColor;
    const nodeBackgroundColor = gdevelopTheme.dialog.backgroundColor;
    const nodeTextColor = gdevelopTheme.text.color.primary;
    const nodeBorderColor = gdevelopTheme.toolbar.separatorColor;
    const selectedBorderColor = gdevelopTheme.palette.primary;
    const entryColor = gdevelopTheme.message.valid;
    const anyStateColor = gdevelopTheme.message.warning;

    // Positions, taking the drags in progress into account.
    const getStatePosition = (state: State): GraphCoordinates => {
      const draggedPosition = dragPositions && dragPositions[state.id];
      if (draggedPosition) return draggedPosition;
      if (groupDrag && state.subMachineId === groupDrag.subMachineId) {
        return {
          x: state.x + groupDrag.deltaX,
          y: state.y + groupDrag.deltaY,
        };
      }
      return { x: state.x, y: state.y };
    };
    const getAnyStatePosition = (): GraphCoordinates =>
      (dragPositions && dragPositions[anyStateId]) || {
        x: data.anyState.x,
        y: data.anyState.y,
      };
    const getSubMachineRectForDisplay = (subMachineId: string): ?Rect => {
      const rect = getSubMachineRect(data, subMachineId, getStatePosition);
      if (rect && groupDrag && groupDrag.subMachineId === subMachineId) {
        return {
          ...rect,
          x: rect.x + groupDrag.deltaX,
          y: rect.y + groupDrag.deltaY,
        };
      }
      return rect;
    };

    const allEdges = [
      ...data.anyState.transitions.map(transition => ({
        transition,
        sourceStateId: anyStateId,
      })),
      ...data.states.reduce(
        (accumulator, state) => [
          ...accumulator,
          ...state.transitions.map(transition => ({
            transition,
            sourceStateId: state.id,
          })),
        ],
        []
      ),
    ];

    return (
      <div
        ref={containerRef}
        data-role="graph-background"
        style={{
          ...styles.container,
          backgroundColor,
          backgroundImage: `radial-gradient(circle, ${gridColor} 1px, transparent 1px)`,
          backgroundSize: `${24 * view.zoom}px ${24 * view.zoom}px`,
          backgroundPosition: `${view.panX}px ${view.panY}px`,
        }}
        onMouseDown={onBackgroundMouseDown}
        onClick={onBackgroundClick}
        onContextMenu={event =>
          openContextMenu(event, {
            kind: 'background',
            ...toGraphCoordinates(event.clientX, event.clientY),
          })
        }
      >
        <div
          style={{
            ...styles.transformedContainer,
            transform: `translate(${view.panX}px, ${view.panY}px) scale(${
              view.zoom
            })`,
          }}
        >
          {/* Sub-state machine boxes (behind everything). */}
          {data.subMachines.map(subMachine => {
            const rect = getSubMachineRectForDisplay(subMachine.id);
            if (!rect) return null;
            const isSelected =
              !!selection &&
              selection.kind === 'subMachine' &&
              selection.subMachineId === subMachine.id;
            const isLinkTarget = hoveredSubMachineId === subMachine.id;
            const entryChild = getState(data, subMachine.entryStateId);
            return (
              <div
                key={subMachine.id}
                style={{
                  ...styles.subMachineBox,
                  left: rect.x,
                  top: rect.y,
                  width: rect.width,
                  height: rect.height,
                  backgroundColor: 'rgba(128, 128, 128, 0.12)',
                  borderColor: isSelected
                    ? selectedBorderColor
                    : isLinkTarget
                    ? entryColor
                    : nodeBorderColor,
                  borderWidth: isSelected || isLinkTarget ? 3 : 2,
                }}
                onClick={(event: SyntheticMouseEvent<HTMLDivElement>) => {
                  event.stopPropagation();
                  onSelect({
                    kind: 'subMachine',
                    subMachineId: subMachine.id,
                  });
                }}
                onContextMenu={event =>
                  openContextMenu(event, {
                    kind: 'subMachine',
                    subMachineId: subMachine.id,
                  })
                }
                onMouseEnter={() => {
                  if (dragRef.current && dragRef.current.mode === 'link') {
                    setHoveredSubMachineId(subMachine.id);
                  }
                }}
                onMouseLeave={() => {
                  if (hoveredSubMachineId === subMachine.id) {
                    setHoveredSubMachineId(null);
                  }
                }}
              >
                <div
                  style={styles.subMachineHeader}
                  onMouseDown={(event: SyntheticMouseEvent<HTMLDivElement>) => {
                    if (event.button !== 0) return;
                    event.stopPropagation();
                    onSelect({
                      kind: 'subMachine',
                      subMachineId: subMachine.id,
                    });
                    startDrag({
                      mode: 'subMachine',
                      subMachineId: subMachine.id,
                      startClientX: event.clientX,
                      startClientY: event.clientY,
                      deltaX: 0,
                      deltaY: 0,
                      moved: false,
                    });
                  }}
                  onDoubleClick={(
                    event: SyntheticMouseEvent<HTMLDivElement>
                  ) => {
                    event.stopPropagation();
                    startRenamingSubMachine(subMachine.id, subMachine.name);
                  }}
                >
                  {renamingSubMachineId === subMachine.id ? (
                    <input
                      style={{
                        ...styles.subMachineRenameInput,
                        color: nodeTextColor,
                        backgroundColor: nodeBackgroundColor,
                        borderColor: selectedBorderColor,
                      }}
                      value={renameValue}
                      autoFocus
                      onChange={event => setRenameValue(event.target.value)}
                      onBlur={commitRename}
                      onKeyDown={event => {
                        if (event.key === 'Enter') commitRename();
                        else if (event.key === 'Escape') {
                          setRenamingSubMachineId(null);
                        }
                        event.stopPropagation();
                      }}
                    />
                  ) : (
                    <>
                      <div style={styles.subMachineName}>
                        {`▸ ${subMachine.name}`}
                      </div>
                      <div style={styles.subMachineEntryChip}>
                        {entryChild ? (
                          `Entry: ${entryChild.name}`
                        ) : (
                          <Trans>No entry state</Trans>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            );
          })}
          <svg
            width={1}
            height={1}
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              overflow: 'visible',
            }}
          >
            <defs>
              <marker
                id="state-machine-arrow"
                viewBox="0 0 10 10"
                refX="9"
                refY="5"
                markerWidth="7"
                markerHeight="7"
                orient="auto-start-reverse"
              >
                <path d="M 0 0 L 10 5 L 0 10 z" fill={nodeTextColor} />
              </marker>
              <marker
                id="state-machine-arrow-selected"
                viewBox="0 0 10 10"
                refX="9"
                refY="5"
                markerWidth="7"
                markerHeight="7"
                orient="auto-start-reverse"
              >
                <path d="M 0 0 L 10 5 L 0 10 z" fill={selectedBorderColor} />
              </marker>
              <marker
                id="state-machine-arrow-entry"
                viewBox="0 0 10 10"
                refX="9"
                refY="5"
                markerWidth="7"
                markerHeight="7"
                orient="auto-start-reverse"
              >
                <path d="M 0 0 L 10 5 L 0 10 z" fill={entryColor} />
              </marker>
            </defs>
            {/* The transition from the entry node to the entry state. */}
            {entryState ? (
              <path
                d={
                  getEdgePathData(
                    getEntryNodeRect(entryState),
                    getNodeRect(entryState),
                    false
                  ).path
                }
                fill="none"
                stroke={entryColor}
                strokeWidth={2}
                strokeDasharray="6 4"
                markerEnd="url(#state-machine-arrow-entry)"
                pointerEvents="none"
              />
            ) : null}
            {allEdges.map(({ transition, sourceStateId }) => {
              const sourceRect =
                sourceStateId === anyStateId
                  ? getAnyStateNodeRect(getAnyStatePosition())
                  : (() => {
                      const sourceState = getState(data, sourceStateId);
                      return sourceState
                        ? {
                            ...getNodeRect(sourceState),
                            ...getStatePosition(sourceState),
                          }
                        : null;
                    })();
              const targetRect = transition.targetSubMachineId
                ? getSubMachineRectForDisplay(transition.targetSubMachineId)
                : (() => {
                    const targetState = getState(
                      data,
                      transition.targetStateId
                    );
                    return targetState
                      ? {
                          ...getNodeRect(targetState),
                          ...getStatePosition(targetState),
                        }
                      : null;
                  })();
              if (!sourceRect || !targetRect) return null;
              const isSelected =
                !!selection &&
                selection.kind === 'transition' &&
                selection.transitionId === transition.id;
              const isSelfLoop =
                !transition.targetSubMachineId &&
                transition.targetStateId === sourceStateId;
              const edge = getEdgePathData(sourceRect, targetRect, isSelfLoop);
              return (
                <g key={transition.id}>
                  <path
                    d={edge.path}
                    fill="none"
                    stroke="transparent"
                    strokeWidth={14}
                    style={{ cursor: 'pointer' }}
                    onClick={(event: SyntheticMouseEvent<SVGPathElement>) => {
                      event.stopPropagation();
                      onSelect({
                        kind: 'transition',
                        sourceStateId,
                        transitionId: transition.id,
                      });
                    }}
                    onContextMenu={(
                      event: SyntheticMouseEvent<SVGPathElement>
                    ) =>
                      openContextMenu(event, {
                        kind: 'edge',
                        sourceStateId,
                        transitionId: transition.id,
                      })
                    }
                  />
                  <path
                    d={edge.path}
                    fill="none"
                    stroke={isSelected ? selectedBorderColor : nodeTextColor}
                    strokeWidth={isSelected ? 3 : 2}
                    markerEnd={
                      isSelected
                        ? 'url(#state-machine-arrow-selected)'
                        : 'url(#state-machine-arrow)'
                    }
                    pointerEvents="none"
                  />
                  {isSelected && transition.conditions.length > 0 ? (
                    <g pointerEvents="none">
                      <rect
                        x={edge.labelX - 4}
                        y={edge.labelY - 11}
                        rx={4}
                        height={22}
                        width={Math.max(80, transition.conditions.length * 26)}
                        fill={nodeBackgroundColor}
                        stroke={selectedBorderColor}
                        strokeWidth={1}
                        opacity={0.95}
                      />
                      <text
                        x={edge.labelX + 4}
                        y={edge.labelY + 4}
                        fontSize={11}
                        fill={nodeTextColor}
                      >
                        {`${transition.conditions.length} condition${
                          transition.conditions.length > 1 ? 's' : ''
                        }`}
                      </text>
                    </g>
                  ) : null}
                </g>
              );
            })}
            {/* The transition being created with the mouse. */}
            {linkEnd && dragRef.current && dragRef.current.mode === 'link'
              ? (() => {
                  const sourceStateId = dragRef.current.sourceStateId;
                  const sourceRect =
                    sourceStateId === anyStateId
                      ? getAnyStateNodeRect(getAnyStatePosition())
                      : (() => {
                          const sourceState = getState(data, sourceStateId);
                          return sourceState
                            ? {
                                ...getNodeRect(sourceState),
                                ...getStatePosition(sourceState),
                              }
                            : null;
                        })();
                  if (!sourceRect) return null;
                  return (
                    <path
                      d={`M ${sourceRect.x + sourceRect.width} ${sourceRect.y +
                        sourceRect.height / 2} L ${linkEnd.x} ${linkEnd.y}`}
                      fill="none"
                      stroke={selectedBorderColor}
                      strokeWidth={2}
                      strokeDasharray="6 4"
                      pointerEvents="none"
                    />
                  );
                })()
              : null}
          </svg>
          {/* The green Entry node. */}
          {entryState ? (
            <div
              style={{
                ...styles.entryNode,
                ...getEntryNodeRect(entryState),
                backgroundColor: entryColor,
              }}
              onContextMenu={event => {
                event.preventDefault();
                event.stopPropagation();
              }}
            >
              <Trans>Entry</Trans>
            </div>
          ) : null}
          {/* The "Any State" node. */}
          <div
            style={{
              ...styles.node,
              ...getAnyStateNodeRect(getAnyStatePosition()),
              backgroundColor: nodeBackgroundColor,
              color: nodeTextColor,
              borderColor:
                !!selection && selection.kind === 'anyState'
                  ? selectedBorderColor
                  : anyStateColor,
              borderStyle: 'dashed',
            }}
            onMouseDown={event =>
              startNodeDrag(event, anyStateId, getAnyStatePosition(), {
                kind: 'anyState',
              })
            }
            onContextMenu={event =>
              openContextMenu(event, { kind: 'anyState' })
            }
            title="Transitions from Any State can fire from any state"
          >
            <div style={styles.nodeTitle}>
              <Trans>Any State</Trans>
            </div>
            <div
              style={{
                ...styles.port,
                backgroundColor: nodeBackgroundColor,
                borderColor: anyStateColor,
              }}
              onMouseDown={event => onPortMouseDown(event, anyStateId)}
              title="Drag to create a transition"
            />
          </div>
          {/* The state nodes. */}
          {data.states.map(state => {
            const position = getStatePosition(state);
            const isSelected =
              !!selection &&
              selection.kind === 'state' &&
              selection.stateId === state.id;
            const isEntry = data.entryStateId === state.id;
            const isLinkTarget = hoveredStateId === state.id;
            return (
              <div
                key={state.id}
                style={{
                  ...styles.node,
                  left: position.x,
                  top: position.y,
                  width: stateNodeWidth,
                  height: stateNodeHeight,
                  backgroundColor: nodeBackgroundColor,
                  color: nodeTextColor,
                  borderColor: isSelected
                    ? selectedBorderColor
                    : isLinkTarget
                    ? entryColor
                    : isEntry
                    ? entryColor
                    : nodeBorderColor,
                }}
                onMouseDown={event =>
                  startNodeDrag(event, state.id, position, {
                    kind: 'state',
                    stateId: state.id,
                  })
                }
                onDoubleClick={(event: SyntheticMouseEvent<HTMLDivElement>) => {
                  event.stopPropagation();
                  startRenamingState(state);
                }}
                onContextMenu={event =>
                  openContextMenu(event, { kind: 'node', stateId: state.id })
                }
                onMouseEnter={() => {
                  if (dragRef.current && dragRef.current.mode === 'link') {
                    setHoveredStateId(state.id);
                  }
                }}
                onMouseLeave={() => {
                  if (hoveredStateId === state.id) setHoveredStateId(null);
                }}
              >
                <div style={styles.nodeTitle}>{state.name}</div>
                <div style={styles.nodeSubtitle}>
                  {state.blendTree
                    ? `🎛 ${state.blendTree.parameterName || 'Blend tree'} (${
                        state.blendTree.children.length
                      })`
                    : state.animationName || '—'}
                </div>
                {renamingStateId === state.id ? (
                  <input
                    style={{
                      ...styles.renameInput,
                      color: nodeTextColor,
                      backgroundColor: nodeBackgroundColor,
                      borderColor: selectedBorderColor,
                    }}
                    value={renameValue}
                    autoFocus
                    onChange={event => setRenameValue(event.target.value)}
                    onBlur={commitRename}
                    onKeyDown={event => {
                      if (event.key === 'Enter') commitRename();
                      else if (event.key === 'Escape') {
                        setRenamingStateId(null);
                      }
                      event.stopPropagation();
                    }}
                  />
                ) : null}
                <div
                  style={{
                    ...styles.port,
                    backgroundColor: nodeBackgroundColor,
                    borderColor: isSelected
                      ? selectedBorderColor
                      : nodeBorderColor,
                  }}
                  onMouseDown={event => onPortMouseDown(event, state.id)}
                  title="Drag to create a transition"
                />
              </div>
            );
          })}
        </div>
        <div style={styles.zoomControls}>
          <IconButton
            size="small"
            tooltip={'Zoom out'}
            onClick={() => {
              const currentView = viewRef.current;
              updateView({
                ...currentView,
                zoom: clampValue(currentView.zoom / 1.2, 0.25, 2.5),
              });
            }}
          >
            <ZoomOut fontSize="small" />
          </IconButton>
          <div style={{ ...styles.zoomLabel, color: nodeTextColor }}>
            {Math.round(view.zoom * 100)}%
          </div>
          <IconButton
            size="small"
            tooltip={'Zoom in'}
            onClick={() => {
              const currentView = viewRef.current;
              updateView({
                ...currentView,
                zoom: clampValue(currentView.zoom * 1.2, 0.25, 2.5),
              });
            }}
          >
            <ZoomIn fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            tooltip={'Center the view'}
            onClick={centerView}
          >
            <CenterFocusStrong fontSize="small" />
          </IconButton>
        </div>
        <ContextMenu ref={contextMenu} buildMenuTemplate={buildContextMenu} />
      </div>
    );
  }
);

export default StateMachineGraph;
