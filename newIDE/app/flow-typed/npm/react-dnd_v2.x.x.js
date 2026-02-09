// flow-typed signature: 0df5fbd2d164ee9c137293cbb8debfeb
// flow-typed version: 4618dcebd8/react-dnd_v2.x.x/flow_>=v0.98.x

declare module "react-dnd" {
  declare type Identifier = string;

  declare type ClientOffset = {
    x: number,
    y: number,
    ...
  };

  declare type ElementOrNode = any | any;

  declare type DndOptions<P> = { arePropsEqual?: (props: P, otherProps: P) => boolean, ... };

  declare type ComponentClassWithDefaultProps<D: {...}, P: {...}, S> = Class<
    any
  > & { defaultProps: D, ... };

  declare type _InstanceOf<I, C: Class<I>> = I;
  declare type InstanceOf<C> = _InstanceOf<any, C>;

  declare class ConnectedComponent<C, I, P> extends Object {
    static DecoratedComponent: C;
    getDecoratedComponentInstance(): I;
    getHandlerId(): Identifier;
    props: P;
    state: void;
  }

  declare type Connector<SP: {...}, CP: {...}> = any;

  declare type DropTargetSpec<P> = {
    drop?: (
      props: P,
      monitor: DropTargetMonitor,
      component: any
    ) => ?Object,
    hover?: (
      props: P,
      monitor: DropTargetMonitor,
      component: any
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
  ): Connector<Partial<OP & CP>, CP>;

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
  ): Connector<Partial<OP & CP>, CP>;

  // Drag Drop Context
  // ----------------------------------------------------------------------

  declare type ProviderProps = {
    backend: mixed,
    children: any,
    window?: Object,
    ...
  };

  declare class DragDropContextProvider<ProviderProps> extends Object {
    props: ProviderProps;
  }

  declare function DragDropContext<OP: {...}, CP: {...}>(
    backend: mixed
  ): Connector<Partial<OP & CP>, CP>;
}
