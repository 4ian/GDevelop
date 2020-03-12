// flow-typed signature: 0df5fbd2d164ee9c137293cbb8debfeb
// flow-typed version: 4618dcebd8/react-dnd_v2.x.x/flow_>=v0.98.x

declare module "react-dnd" {
  declare type Identifier = string;

  declare type ClientOffset = {
    x: number,
    y: number,
    ...
  };

  declare type ElementOrNode = React$Element<any> | HTMLElement;

  declare type DndOptions<P> = { arePropsEqual?: (props: P, otherProps: P) => boolean, ... };

  declare type ComponentClassWithDefaultProps<D: {...}, P: {...}, S> = Class<
    React$Component<P, S>
  > & { defaultProps: D, ... };

  declare type _InstanceOf<I, C: Class<I>> = I;
  declare type InstanceOf<C> = _InstanceOf<*, C>;

  declare class ConnectedComponent<C, I, P> extends React$Component<P> {
    static DecoratedComponent: C;
    getDecoratedComponentInstance(): I;
    getHandlerId(): Identifier;
    props: P;
    state: void;
  }

  declare type Connector<SP: {...}, CP: {...}> = (<
    P: SP,
    D,
    S,
    C: ComponentClassWithDefaultProps<D, P, S>
  >(
    component: C
  ) => Class<
    ConnectedComponent<C, InstanceOf<C>, { ...CP, ... } & $Diff<$Diff<P, D>, CP>>
  >) &
    (<P: SP, S, C: Class<React$Component<P, S>>>(
      component: C
    ) => Class<
      ConnectedComponent<C, InstanceOf<C>, { ...CP, ... } & $Diff<P, CP>>
    >) &
    (<P: SP, C: React$ComponentType<P>>(
      component: C
    ) => Class<ConnectedComponent<C, void, { ...CP, ... } & $Diff<P, CP>>>);

  // Drag Source
  // ----------------------------------------------------------------------

  declare type DragSourceType<P> = Identifier | ((props: P) => Identifier);

  declare type DragSourceSpec<P> = {
    beginDrag: (
      props: P,
      monitor: DragSourceMonitor,
      component: React$Component<P, any>
    ) => Object,
    endDrag?: (
      props: P,
      monitor: DragSourceMonitor,
      component: ?React$Component<P, any>
    ) => void,
    canDrag?: (props: P, monitor: DragSourceMonitor) => boolean,
    isDragging?: (props: P, monitor: DragSourceMonitor) => boolean,
    ...
  };

  declare type DragSourceMonitor = {
    canDrag: () => boolean,
    isDragging: () => boolean,
    getItemType: () => Identifier,
    getItem: () => Object,
    getDropResult: () => Object,
    didDrop: () => boolean,
    getInitialClientOffset: () => ClientOffset,
    getInitialSourceClientOffset: () => ClientOffset,
    getClientOffset: () => ClientOffset,
    getDifferenceFromInitialOffset: () => ClientOffset,
    getSourceClientOffset: () => ClientOffset,
    ...
  };

  declare type DragSourceConnector = {
    dragSource: () => ConnectDragSource,
    dragPreview: () => ConnectDragPreview,
    ...
  };

  declare type DragSourceOptions = { dropEffect?: string, ... };

  declare type DragPreviewOptions = {
    captureDraggingState?: boolean,
    anchorX?: number,
    anchorY?: number,
    ...
  };

  declare type ConnectDragSource = <T: ElementOrNode>(
    elementOrNode: T,
    options?: DragSourceOptions
  ) => ?T;

  declare type ConnectDragPreview = <T: ElementOrNode>(
    elementOrNode: T,
    options?: DragPreviewOptions
  ) => ?T;

  declare type DragSourceCollector<T> = (
    connect: DragSourceConnector,
    monitor: DragSourceMonitor
  ) => T;

  declare function DragSource<OP: {...}, CP: {...}>(
    type: DragSourceType<OP>,
    spec: DragSourceSpec<OP>,
    collect: DragSourceCollector<CP>,
    options?: DndOptions<OP>
  ): Connector<$Shape<OP & CP>, CP>;

  // Drop Target
  // ----------------------------------------------------------------------

  declare type DropTargetTypes<P> =
    | Identifier
    | Array<Identifier>
    | ((props: P) => Identifier | Array<Identifier>);

  declare type DropTargetSpec<P> = {
    drop?: (
      props: P,
      monitor: DropTargetMonitor,
      component: React$Component<P, any>
    ) => ?Object,
    hover?: (
      props: P,
      monitor: DropTargetMonitor,
      component: React$Component<P, any>
    ) => void,
    canDrop?: (props: P, monitor: DropTargetMonitor) => boolean,
    ...
  };

  declare type DropTargetMonitor = {
    canDrop: () => boolean,
    isOver: (options?: { shallow: boolean, ... }) => boolean,
    getItemType: () => Identifier,
    getItem: () => Object,
    getDropResult: () => Object,
    didDrop: () => boolean,
    getInitialClientOffset: () => ClientOffset,
    getInitialSourceClientOffset: () => ClientOffset,
    getClientOffset: () => ClientOffset,
    getDifferenceFromInitialOffset: () => ClientOffset,
    getSourceClientOffset: () => ClientOffset,
    ...
  };

  declare type DropTargetConnector = { dropTarget: () => ConnectDropTarget, ... };

  declare type ConnectDropTarget = <T: ElementOrNode>(elementOrNode: T) => ?T;

  declare type DropTargetCollector<T> = (
    connect: DropTargetConnector,
    monitor: DropTargetMonitor
  ) => T;

  declare function DropTarget<OP: {...}, CP: {...}>(
    types: DropTargetTypes<OP>,
    spec: DropTargetSpec<OP>,
    collect: DropTargetCollector<CP>,
    options?: DndOptions<OP>
  ): Connector<$Shape<OP & CP>, CP>;

  // Drag Layer
  // ----------------------------------------------------------------------

  declare type DragLayerMonitor = {
    isDragging: () => boolean,
    getItemType: () => Identifier,
    getItem: () => Object,
    getInitialClientOffset: () => ClientOffset,
    getInitialSourceClientOffset: () => ClientOffset,
    getClientOffset: () => ClientOffset,
    getDifferenceFromInitialOffset: () => ClientOffset,
    getSourceClientOffset: () => ClientOffset,
    ...
  };

  declare function DragLayer<OP: {...}, CP: {...}>(
    collect: (monitor: DragLayerMonitor) => CP,
    options?: DndOptions<OP>
  ): Connector<$Shape<OP & CP>, CP>;

  // Drag Drop Context
  // ----------------------------------------------------------------------

  declare type ProviderProps = {
    backend: mixed,
    children: React$Element<any>,
    window?: Object,
    ...
  };

  declare class DragDropContextProvider<ProviderProps> extends React$Component<
    ProviderProps
  > {
    props: ProviderProps;
  }

  declare function DragDropContext<OP: {...}, CP: {...}>(
    backend: mixed
  ): Connector<$Shape<OP & CP>, CP>;
}
