/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/* Files */

declare class Blob {
  constructor(blobParts?: Array<any>, options?: {
         type?: string,
         endings?: string,
         ...
  }): void;
  isClosed: bool;
  size: number;
  type: string;
  close(): void;
  slice(start?: number, end?: number, contentType?: string): Blob;
  arrayBuffer(): Promise<ArrayBuffer>;
  text(): Promise<string>,
  stream(): ReadableStream,
}

declare class FileReader extends EventTarget {
  +EMPTY: 0;
  +LOADING: 1;
  +DONE: 2;
  +error: null | DOMError;
  +readyState: 0 | 1 | 2;
  +result: null | string | ArrayBuffer;
  abort(): void;
  onabort: null | (ev: ProgressEvent) => any;
  onerror: null | (ev: ProgressEvent) => any;
  onload: null | (ev: ProgressEvent) => any;
  onloadend: null | (ev: ProgressEvent) => any;
  onloadstart: null | (ev: ProgressEvent) => any;
  onprogress: null | (ev: ProgressEvent) => any;
  readAsArrayBuffer(blob: Blob): void;
  readAsBinaryString(blob: Blob): void;
  readAsDataURL(blob: Blob): void;
  readAsText(blob: Blob, encoding?: string): void;
}

declare type FilePropertyBag = {
       type?: string,
       lastModified?: number,
       ...
};
declare class File extends Blob {
  constructor(
    fileBits: $ReadOnlyArray<string | BufferDataSource | Blob>,
    filename: string,
    options?: FilePropertyBag,
  ): void;
  lastModified: number;
  name: string;
}

declare class FileList {
  @@iterator(): Iterator<File>;
  length: number;
  item(index: number): File;
  [index: number]: File;
}

/* DataTransfer */

declare class DataTransfer {
  clearData(format?: string): void;
  getData(format: string): string;
  setData(format: string, data: string): void;
  setDragImage(image: Element, x: number, y: number): void;
  dropEffect: string;
  effectAllowed: string;
  files: FileList; // readonly
  items: DataTransferItemList; // readonly
  types: Array<string>; // readonly
}

declare class DataTransferItemList {
  @@iterator(): Iterator<DataTransferItem>;
  length: number; // readonly
  [index: number]: DataTransferItem;
  add(data: string, type: string): ?DataTransferItem;
  add(data: File): ?DataTransferItem;
  remove(index: number): void;
  clear(): void;
};

declare class DataTransferItem {
  kind: string; // readonly
  type: string; // readonly
  getAsString(_callback: ?(data: string) => mixed): void;
  getAsFile(): ?File;
  /*
   * This is not supported by all browsers, please have a fallback plan for it.
   * For more information, please checkout
   * https://developer.mozilla.org/en-US/docs/Web/API/DataTransferItem/webkitGetAsEntry
   */
  webkitGetAsEntry(): void | () => any;
};

/* DOM */

declare type DOMStringMap = { [key:string]: string, ... }

declare class DOMError {
  name: string;
}

declare type ElementDefinitionOptions = { extends?: string, ... }

declare interface CustomElementRegistry {
  define(name: string, ctor: Class<Element>, options?: ElementDefinitionOptions): void;
  get(name: string): any;
  whenDefined(name: string): Promise<void>;
}

declare interface ShadowRoot extends DocumentFragment {
  host: Element;
  innerHTML: string;
}

declare type ShadowRootMode = 'open'|'closed';

declare type ShadowRootInit = {
       delegatesFocus?: boolean,
       mode: ShadowRootMode,
       ...
}

declare type ScrollToOptions = {
  top?: number;
  left?: number;
  behavior?: 'auto' | 'smooth';
  ...
}

type EventHandler = (event: Event) => mixed
type EventListener = { handleEvent: EventHandler, ... } | EventHandler
type MouseEventHandler = (event: MouseEvent) => mixed
type MouseEventListener = { handleEvent: MouseEventHandler, ... } | MouseEventHandler
type FocusEventHandler = (event: FocusEvent) => mixed
type FocusEventListener = { handleEvent: FocusEventHandler, ... } | FocusEventHandler
type KeyboardEventHandler = (event: KeyboardEvent) => mixed
type KeyboardEventListener = { handleEvent: KeyboardEventHandler, ... } | KeyboardEventHandler
type InputEventHandler = (event: InputEvent) => mixed
type InputEventListener = { handleEvent: InputEventHandler, ... } | InputEventHandler
type TouchEventHandler = (event: TouchEvent) => mixed
type TouchEventListener = { handleEvent: TouchEventHandler, ... } | TouchEventHandler
type WheelEventHandler = (event: WheelEvent) => mixed
type WheelEventListener = { handleEvent: WheelEventHandler, ... } | WheelEventHandler
type AbortProgressEventHandler = (event: ProgressEvent) => mixed
type AbortProgressEventListener = { handleEvent: AbortProgressEventHandler, ... } | AbortProgressEventHandler
type ProgressEventHandler = (event: ProgressEvent) => mixed
type ProgressEventListener = { handleEvent: ProgressEventHandler, ... } | ProgressEventHandler
type DragEventHandler = (event: DragEvent) => mixed
type DragEventListener = { handleEvent: DragEventHandler, ... } | DragEventHandler
type PointerEventHandler = (event: PointerEvent) => mixed
type PointerEventListener = { handleEvent: PointerEventHandler, ... } | PointerEventHandler
type AnimationEventHandler = (event: AnimationEvent) => mixed
type AnimationEventListener = { handleEvent: AnimationEventHandler, ... } | AnimationEventHandler
type ClipboardEventHandler = (event: ClipboardEvent) => mixed
type ClipboardEventListener = { handleEvent: ClipboardEventHandler, ... } | ClipboardEventHandler
type TransitionEventHandler = (event: TransitionEvent) => mixed
type TransitionEventListener = { handleEvent: TransitionEventHandler, ... } | TransitionEventHandler
type MessageEventHandler = (event: MessageEvent) => mixed
type MessageEventListener = { handleEvent: MessageEventHandler, ... } | MessageEventHandler
type BeforeUnloadEventHandler = (event: BeforeUnloadEvent) => mixed
type BeforeUnloadEventListener = { handleEvent: BeforeUnloadEventHandler, ... } | BeforeUnloadEventHandler
type StorageEventHandler = (event: StorageEvent) => mixed
type StorageEventListener = { handleEvent: StorageEventHandler, ... } | StorageEventHandler

type MediaKeySessionType = 'temporary' | 'persistent-license';
type MediaKeyStatus = 'usable' | 'expired' | 'released' | 'output-restricted' | 'output-downscaled' | 'status-pending' | 'internal-error';
type MouseEventTypes = 'contextmenu' | 'mousedown' | 'mouseenter' | 'mouseleave' | 'mousemove' | 'mouseout' | 'mouseover' | 'mouseup' | 'click' | 'dblclick';
type FocusEventTypes = 'blur' | 'focus' | 'focusin' | 'focusout';
type KeyboardEventTypes = 'keydown' | 'keyup' | 'keypress';
type InputEventTypes = 'input' | 'beforeinput'
type TouchEventTypes = 'touchstart' | 'touchmove' | 'touchend' | 'touchcancel';
type WheelEventTypes = 'wheel';
type AbortProgressEventTypes = 'abort';
type ProgressEventTypes = 'abort' | 'error' | 'load' | 'loadend' | 'loadstart' | 'progress' | 'timeout';
type DragEventTypes = 'drag' | 'dragend' | 'dragenter' | 'dragexit' | 'dragleave' | 'dragover' | 'dragstart' | 'drop';
type PointerEventTypes = 'pointerover' | 'pointerenter' | 'pointerdown' | 'pointermove' | 'pointerup' | 'pointercancel' | 'pointerout' | 'pointerleave' | 'gotpointercapture' | 'lostpointercapture';
type AnimationEventTypes = 'animationstart' | 'animationend' | 'animationiteration';
type ClipboardEventTypes = 'clipboardchange' | 'cut' | 'copy' | 'paste';
type TransitionEventTypes = 'transitionrun' | 'transitionstart' | 'transitionend' | 'transitioncancel';
type MessageEventTypes = string;
type BeforeUnloadEventTypes = 'beforeunload';
type StorageEventTypes = 'storage';

type EventListenerOptionsOrUseCapture = boolean | {
       capture?: boolean,
       once?: boolean,
       passive?: boolean,
       ...
};

declare class EventTarget {
  addEventListener(type: MouseEventTypes, listener: MouseEventListener, optionsOrUseCapture?: EventListenerOptionsOrUseCapture): void;
  addEventListener(type: FocusEventTypes, listener: FocusEventListener, optionsOrUseCapture?: EventListenerOptionsOrUseCapture): void;
  addEventListener(type: KeyboardEventTypes, listener: KeyboardEventListener, optionsOrUseCapture?: EventListenerOptionsOrUseCapture): void;
  addEventListener(type: InputEventTypes, listener: InputEventListener, optionsOrUseCapture?: EventListenerOptionsOrUseCapture): void;
  addEventListener(type: TouchEventTypes, listener: TouchEventListener, optionsOrUseCapture?: EventListenerOptionsOrUseCapture): void;
  addEventListener(type: WheelEventTypes, listener: WheelEventListener, optionsOrUseCapture?: EventListenerOptionsOrUseCapture): void;
  addEventListener(type: AbortProgressEventTypes, listener: AbortProgressEventListener, optionsOrUseCapture?: EventListenerOptionsOrUseCapture): void;
  addEventListener(type: ProgressEventTypes, listener: ProgressEventListener, optionsOrUseCapture?: EventListenerOptionsOrUseCapture): void;
  addEventListener(type: DragEventTypes, listener: DragEventListener, optionsOrUseCapture?: EventListenerOptionsOrUseCapture): void;
  addEventListener(type: PointerEventTypes, listener: PointerEventListener, optionsOrUseCapture?: EventListenerOptionsOrUseCapture): void;
  addEventListener(type: AnimationEventTypes, listener: AnimationEventListener, optionsOrUseCapture?: EventListenerOptionsOrUseCapture): void;
  addEventListener(type: ClipboardEventTypes, listener: ClipboardEventListener, optionsOrUseCapture?: EventListenerOptionsOrUseCapture): void;
  addEventListener(type: TransitionEventTypes, listener: TransitionEventListener, optionsOrUseCapture?: EventListenerOptionsOrUseCapture): void;
  addEventListener(type: MessageEventTypes, listener: MessageEventListener, optionsOrUseCapture?: EventListenerOptionsOrUseCapture): void;
  addEventListener(type: BeforeUnloadEventTypes, listener: BeforeUnloadEventListener, optionsOrUseCapture?: EventListenerOptionsOrUseCapture): void;
  addEventListener(type: StorageEventTypes, listener: StorageEventListener, optionsOrUseCapture?: EventListenerOptionsOrUseCapture): void;
  addEventListener(type: string, listener: EventListener, optionsOrUseCapture?: EventListenerOptionsOrUseCapture): void;

  removeEventListener(type: MouseEventTypes, listener: MouseEventListener, optionsOrUseCapture?: EventListenerOptionsOrUseCapture): void;
  removeEventListener(type: FocusEventTypes, listener: FocusEventListener, optionsOrUseCapture?: EventListenerOptionsOrUseCapture): void;
  removeEventListener(type: KeyboardEventTypes, listener: KeyboardEventListener, optionsOrUseCapture?: EventListenerOptionsOrUseCapture): void;
  removeEventListener(type: InputEventTypes, listener: InputEventListener, optionsOrUseCapture?: EventListenerOptionsOrUseCapture): void;
  removeEventListener(type: TouchEventTypes, listener: TouchEventListener, optionsOrUseCapture?: EventListenerOptionsOrUseCapture): void;
  removeEventListener(type: WheelEventTypes, listener: WheelEventListener, optionsOrUseCapture?: EventListenerOptionsOrUseCapture): void;
  removeEventListener(type: AbortProgressEventTypes, listener: AbortProgressEventListener, optionsOrUseCapture?: EventListenerOptionsOrUseCapture): void;
  removeEventListener(type: ProgressEventTypes, listener: ProgressEventListener, optionsOrUseCapture?: EventListenerOptionsOrUseCapture): void;
  removeEventListener(type: DragEventTypes, listener: DragEventListener, optionsOrUseCapture?: EventListenerOptionsOrUseCapture): void;
  removeEventListener(type: PointerEventTypes, listener: PointerEventListener, optionsOrUseCapture?: EventListenerOptionsOrUseCapture): void;
  removeEventListener(type: AnimationEventTypes, listener: AnimationEventListener, optionsOrUseCapture?: EventListenerOptionsOrUseCapture): void;
  removeEventListener(type: ClipboardEventTypes, listener: ClipboardEventListener, optionsOrUseCapture?: EventListenerOptionsOrUseCapture): void;
  removeEventListener(type: TransitionEventTypes, listener: TransitionEventListener, optionsOrUseCapture?: EventListenerOptionsOrUseCapture): void;
  removeEventListener(type: MessageEventTypes, listener: MessageEventListener, optionsOrUseCapture?: EventListenerOptionsOrUseCapture): void;
  removeEventListener(type: BeforeUnloadEventTypes, listener: BeforeUnloadEventListener, optionsOrUseCapture?: EventListenerOptionsOrUseCapture): void;
  removeEventListener(type: StorageEventTypes, listener: StorageEventListener, optionsOrUseCapture?: EventListenerOptionsOrUseCapture): void;
  removeEventListener(type: string, listener: EventListener, optionsOrUseCapture?: EventListenerOptionsOrUseCapture): void;

  attachEvent?: (type: MouseEventTypes, listener: MouseEventListener) => void;
  attachEvent?: (type: FocusEventTypes, listener: FocusEventListener) => void;
  attachEvent?: (type: KeyboardEventTypes, listener: KeyboardEventListener) => void;
  attachEvent?: (type: InputEventTypes, listener: InputEventListener) => void;
  attachEvent?: (type: TouchEventTypes, listener: TouchEventListener) => void;
  attachEvent?: (type: WheelEventTypes, listener: WheelEventListener) => void;
  attachEvent?: (type: AbortProgressEventTypes, listener: AbortProgressEventListener) => void;
  attachEvent?: (type: ProgressEventTypes, listener: ProgressEventListener) => void;
  attachEvent?: (type: DragEventTypes, listener: DragEventListener) => void;
  attachEvent?: (type: PointerEventTypes, listener: PointerEventListener) => void;
  attachEvent?: (type: AnimationEventTypes, listener: AnimationEventListener) => void;
  attachEvent?: (type: ClipboardEventTypes, listener: ClipboardEventListener) => void;
  attachEvent?: (type: TransitionEventTypes, listener: TransitionEventListener) => void;
  attachEvent?: (type: MessageEventTypes, listener: MessageEventListener) => void;
  attachEvent?: (type: BeforeUnloadEventTypes, listener: BeforeUnloadEventListener) => void;
  attachEvent?: (type: StorageEventTypes, listener: StorageEventListener) => void;
  attachEvent?: (type: string, listener: EventListener) => void;

  detachEvent?: (type: MouseEventTypes, listener: MouseEventListener) => void;
  detachEvent?: (type: FocusEventTypes, listener: FocusEventListener) => void;
  detachEvent?: (type: KeyboardEventTypes, listener: KeyboardEventListener) => void;
  detachEvent?: (type: InputEventTypes, listener: InputEventListener) => void;
  detachEvent?: (type: TouchEventTypes, listener: TouchEventListener) => void;
  detachEvent?: (type: WheelEventTypes, listener: WheelEventListener) => void;
  detachEvent?: (type: AbortProgressEventTypes, listener: AbortProgressEventListener) => void;
  detachEvent?: (type: ProgressEventTypes, listener: ProgressEventListener) => void;
  detachEvent?: (type: DragEventTypes, listener: DragEventListener) => void;
  detachEvent?: (type: PointerEventTypes, listener: PointerEventListener) => void;
  detachEvent?: (type: AnimationEventTypes, listener: AnimationEventListener) => void;
  detachEvent?: (type: ClipboardEventTypes, listener: ClipboardEventListener) => void;
  detachEvent?: (type: TransitionEventTypes, listener: TransitionEventListener) => void;
  detachEvent?: (type: MessageEventTypes, listener: MessageEventListener) => void;
  detachEvent?: (type: BeforeUnloadEventTypes, listener: BeforeUnloadEventListener) => void;
  detachEvent?: (type: StorageEventTypes, listener: StorageEventListener) => void;
  detachEvent?: (type: string, listener: EventListener) => void;

  dispatchEvent(evt: Event): boolean;

  // Deprecated

  cancelBubble: boolean;
  initEvent(eventTypeArg: string, canBubbleArg: boolean, cancelableArg: boolean): void;
}

type Event$Init = {
       bubbles?: boolean,
       cancelable?: boolean,
       composed?: boolean,
       scoped?: boolean,
       ...
}

declare class Event {
  constructor(type: string, eventInitDict?: Event$Init): void;
  bubbles: boolean;
  cancelable: boolean;
  currentTarget: EventTarget;
  deepPath?: () => EventTarget[];
  defaultPrevented: boolean;
  eventPhase: number;
  isTrusted: boolean;
  scoped: boolean;
  srcElement: Element;
  target: EventTarget;
  timeStamp: number;
  type: string;
  preventDefault(): void;
  stopImmediatePropagation(): void;
  stopPropagation(): void;
  AT_TARGET: number;
  BUBBLING_PHASE: number;
  CAPTURING_PHASE: number;

  // deprecated
  initEvent(
    type: string,
    bubbles: boolean,
    cancelable: boolean
  ): void;
}

type CustomEvent$Init = Event$Init & { detail?: any, ... }

declare class CustomEvent extends Event {
  constructor(type: string, eventInitDict?: CustomEvent$Init): void;
  detail: any;

  // deprecated
  initCustomEvent(
    type: string,
    bubbles: boolean,
    cancelable: boolean,
    detail: any
  ): CustomEvent;
}

declare class UIEvent extends Event {
  detail: number;
  view: any;
}

type MouseEvent$MouseEventInit = {
       screenX?: number,
       screenY?: number,
       clientX?: number,
       clientY?: number,
       ctrlKey?: boolean,
       shiftKey?: boolean,
       altKey?: boolean,
       metaKey?: boolean,
       button?: number,
       buttons?: number,
       region?: string | null,
       relatedTarget?: EventTarget | null,
       ...
};

declare class MouseEvent extends UIEvent {
  constructor(
    typeArg: string,
    mouseEventInit?: MouseEvent$MouseEventInit,
  ): void;
  altKey: boolean;
  button: number;
  buttons: number;
  clientX: number;
  clientY: number;
  ctrlKey: boolean;
  metaKey: boolean;
  movementX: number;
  movementY: number;
  offsetX: number;
  offsetY: number;
  pageX: number;
  pageY: number;
  region: string | null;
  relatedTarget: EventTarget | null;
  screenX: number;
  screenY: number;
  shiftKey: boolean;
  x: number;
  y: number;
  getModifierState(keyArg: string): boolean;
}

declare class FocusEvent extends UIEvent {
  relatedTarget: ?EventTarget;
}

declare class WheelEvent extends MouseEvent {
  deltaX: number; // readonly
  deltaY: number; // readonly
  deltaZ: number; // readonly
  deltaMode: 0x00 | 0x01 | 0x02; // readonly
}

declare class DragEvent extends MouseEvent {
  dataTransfer: ?DataTransfer; // readonly
}

type PointerEvent$PointerEventInit = MouseEvent$MouseEventInit & {
       pointerId?: number,
       width?: number,
       height?: number,
       pressure?: number,
       tangentialPressure?: number,
       tiltX?: number,
       tiltY?: number,
       twist?: number,
       pointerType?: string,
       isPrimary?: boolean,
       ...
};

declare class PointerEvent extends MouseEvent {
  constructor(
    typeArg: string,
    pointerEventInit?: PointerEvent$PointerEventInit,
  ): void;
  pointerId: number;
  width: number;
  height: number;
  pressure: number;
  tangentialPressure: number;
  tiltX: number;
  tiltY: number;
  twist: number;
  pointerType: string;
  isPrimary: boolean;
}

declare class ProgressEvent extends Event {
  lengthComputable: boolean;
  loaded: number;
  total: number;

  // Deprecated
  initProgressEvent(
    typeArg: string,
    canBubbleArg: boolean,
    cancelableArg: boolean,
    lengthComputableArg: boolean,
    loadedArg: number,
    totalArg: number
  ): void;
}

declare class PromiseRejectionEvent extends Event {
  promise: Promise<any>;
  reason: any;
}

// used for websockets and postMessage, for example. See:
// https://www.w3.org/TR/2011/WD-websockets-20110419/
// and
// https://www.w3.org/TR/2008/WD-html5-20080610/comms.html
// and
// https://html.spec.whatwg.org/multipage/comms.html#the-messageevent-interfaces
declare class MessageEvent extends Event {
  data: mixed;
  origin: string;
  lastEventId: string;
  source: WindowProxy;
}

// https://www.w3.org/TR/eventsource/
declare class EventSource extends EventTarget {
  constructor(url: string, configuration?: { withCredentials: boolean, ... }): void;
  +CLOSED: 2;
  +CONNECTING: 0;
  +OPEN: 1;
  +readyState: 0 | 1 | 2;
  +url: string;
  +withCredentials: boolean;
  onerror: () => void;
  onmessage: MessageEventListener;
  onopen: () => void;
  close: () => void;
}

declare class KeyboardEvent extends UIEvent {
  altKey: boolean;
  code: string;
  ctrlKey: boolean;
  isComposing: boolean;
  key: string;
  location: number;
  metaKey: boolean;
  repeat: boolean;
  shiftKey: boolean;
  getModifierState(keyArg?: string): boolean;

  // Deprecated
  charCode: number;
  keyCode: number;
  which: number;
}

declare class InputEvent extends UIEvent {
  data: string | null;
  isComposing: boolean;
}

declare class AnimationEvent extends Event {
  animationName: string;
  elapsedTime: number;
  pseudoElement: string;

  // deprecated

  initAnimationEvent: (
    type: 'animationstart' | 'animationend' | 'animationiteration',
    canBubble: boolean,
    cancelable: boolean,
    animationName: string,
    elapsedTime: number
  ) => void;
}

// https://html.spec.whatwg.org/multipage/web-messaging.html#broadcasting-to-other-browsing-contexts
declare class BroadcastChannel extends EventTarget {
  name: string;
  onmessage: ?(event: MessageEvent) => void;
  onmessageerror: ?(event: MessageEvent) => void;

  constructor(name: string): void;
  postMessage(msg: mixed): void;
  close(): void;
}

// https://www.w3.org/TR/touch-events/#idl-def-Touch
declare class Touch {
  clientX: number,
  clientY: number,
  identifier: number,
  pageX: number,
  pageY: number,
  screenX: number,
  screenY: number,
  target: EventTarget,
}

// https://www.w3.org/TR/touch-events/#idl-def-TouchList
// TouchList#item(index) will return null if n > #length. Should #item's
// return type just been Touch?
declare class TouchList {
  @@iterator(): Iterator<Touch>;
  length: number,
  item(index: number): null | Touch,
  [index: number]: Touch,
}

// https://www.w3.org/TR/touch-events/#touchevent-interface
declare class TouchEvent extends UIEvent {
  altKey: boolean,
  changedTouches: TouchList,
  ctrlKey: boolean,
  metaKey: boolean,
  shiftKey: boolean,
  targetTouches: TouchList,
  touches: TouchList,
}

// https://www.w3.org/TR/webstorage/#the-storageevent-interface
declare class StorageEvent extends Event {
  key: ?string,
  oldValue: ?string,
  newValue: ?string,
  url: string,
  storageArea: ?Storage,
}

// https://w3c.github.io/clipboard-apis/ as of 15 May 2018
type ClipboardEvent$Init = Event$Init & { clipboardData: DataTransfer | null, ... };

declare class ClipboardEvent extends Event {
  constructor(type: ClipboardEventTypes, eventInit?: ClipboardEvent$Init): void;
  +clipboardData: ?DataTransfer; // readonly
}

// https://www.w3.org/TR/2017/WD-css-transitions-1-20171130/#interface-transitionevent
type TransitionEvent$Init = Event$Init & {
       propertyName: string,
       elapsedTime: number,
       pseudoElement: string,
       ...
};

declare class TransitionEvent extends Event {
  constructor(type: TransitionEventTypes, eventInit?: TransitionEvent$Init): void;

  +propertyName: string; // readonly
  +elapsedTime: number; // readonly
  +pseudoElement: string; // readonly
}

// https://www.w3.org/TR/html50/browsers.html#beforeunloadevent
declare class BeforeUnloadEvent extends Event {
  returnValue: string,
}

// TODO: *Event

declare class Node extends EventTarget {
  baseURI: ?string;
  childNodes: NodeList<Node>;
  firstChild: ?Node;
  +isConnected: boolean;
  lastChild: ?Node;
  nextSibling: ?Node;
  nodeName: string;
  nodeType: number;
  nodeValue: string;
  ownerDocument: Document;
  parentElement: ?Element;
  parentNode: ?Node;
  previousSibling: ?Node;
  rootNode: Node;
  textContent: string;
  appendChild<T: Node>(newChild: T): T;
  cloneNode(deep?: boolean): this;
  compareDocumentPosition(other: Node): number;
  contains(other: ?Node): boolean;
  getRootNode(options?: { composed: boolean, ... }): Node;
  hasChildNodes(): boolean;
  insertBefore<T: Node>(newChild: T, refChild?: ?Node): T;
  isDefaultNamespace(namespaceURI: string): boolean;
  isEqualNode(arg: Node): boolean;
  isSameNode(other: Node): boolean;
  lookupNamespaceURI(prefix: string): string;
  lookupPrefix(namespaceURI: string): string;
  normalize(): void;
  removeChild<T: Node>(oldChild: T): T;
  replaceChild<T: Node>(newChild: Node, oldChild: T): T;
  static ATTRIBUTE_NODE: number;
  static CDATA_SECTION_NODE: number;
  static COMMENT_NODE: number;
  static DOCUMENT_FRAGMENT_NODE: number;
  static DOCUMENT_NODE: number;
  static DOCUMENT_POSITION_CONTAINED_BY: number;
  static DOCUMENT_POSITION_CONTAINS: number;
  static DOCUMENT_POSITION_DISCONNECTED: number;
  static DOCUMENT_POSITION_FOLLOWING: number;
  static DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC: number;
  static DOCUMENT_POSITION_PRECEDING: number;
  static DOCUMENT_TYPE_NODE: number;
  static ELEMENT_NODE: number;
  static ENTITY_NODE: number;
  static ENTITY_REFERENCE_NODE: number;
  static NOTATION_NODE: number;
  static PROCESSING_INSTRUCTION_NODE: number;
  static TEXT_NODE: number;

  // Non-standard
  innerText?: string;
  outerText?: string;
}

declare class NodeList<T> {
  @@iterator(): Iterator<T>;
  length: number;
  item(index: number): T;
  [index: number]: T;

  forEach(callbackfn: (value: T, index: number, list: NodeList<T>) => any, thisArg?: any): void;
  entries(): Iterator<[number, T]>;
  keys(): Iterator<number>;
  values(): Iterator<T>;
}

declare class NamedNodeMap {
  @@iterator(): Iterator<Attr>;
  length: number;
  removeNamedItemNS(namespaceURI: string, localName: string): Attr;
  item(index: number): Attr;
  [index: number | string]: Attr;
  removeNamedItem(name: string): Attr;
  getNamedItem(name: string): Attr;
  setNamedItem(arg: Attr): Attr;
  getNamedItemNS(namespaceURI: string, localName: string): Attr;
  setNamedItemNS(arg: Attr): Attr;
}

declare class Attr extends Node {
  isId: boolean;
  specified: boolean;
  ownerElement: Element | null;
  value: string;
  name: string;
  namespaceURI: string | null;
  prefix: string | null;
  localName: string;
}

declare class HTMLCollection<+Elem: HTMLElement> {
  @@iterator(): Iterator<Elem>;
  length: number;
  item(nameOrIndex?: any, optionalIndex?: any): Elem | null;
  namedItem(name: string): Elem | null;
  [index: number | string]: Elem;
}

// from https://www.w3.org/TR/custom-elements/#extensions-to-document-interface-to-register
// See also https://github.com/w3c/webcomponents/
type ElementRegistrationOptions = {
       +prototype?: {
              // from https://www.w3.org/TR/custom-elements/#types-of-callbacks
              // See also https://github.com/w3c/webcomponents/
              +createdCallback?: () => mixed,
              +attachedCallback?: () => mixed,
              +detachedCallback?: () => mixed,
              +attributeChangedCallback?:
              // attribute is set
              ((
                attributeLocalName: string,
                oldAttributeValue: null,
                newAttributeValue: string,
                attributeNamespace: string
              ) => mixed) &
              // attribute is changed
              ((
                attributeLocalName: string,
                oldAttributeValue: string,
                newAttributeValue: string,
                attributeNamespace: string
              ) => mixed) &
              // attribute is removed
              ((
                attributeLocalName: string,
                oldAttributeValue: string,
                newAttributeValue: null,
                attributeNamespace: string
              ) => mixed),
              ...
       },
       +extends?: string,
       ...
}

type ElementCreationOptions = { is: string, ...}

declare class Document extends Node {
  +timeline: DocumentTimeline;
  getAnimations(): Array<Animation>;
  URL: string;
  adoptNode<T: Node>(source: T): T;
  anchors: HTMLCollection<HTMLAnchorElement>;
  applets: HTMLCollection<HTMLAppletElement>;
  body: HTMLBodyElement | null;
  characterSet: string;
  close(): void;
  cookie: string;
  createAttribute(name: string): Attr;
  createAttributeNS(namespaceURI: string | null, qualifiedName: string): Attr;
  createCDATASection(data: string): Text;
  createComment(data: string): Comment;
  createDocumentFragment(): DocumentFragment;
  createElement(tagName: 'a', options?: ElementCreationOptions): HTMLAnchorElement;
  createElement(tagName: 'area', options?: ElementCreationOptions): HTMLAreaElement;
  createElement(tagName: 'audio', options?: ElementCreationOptions): HTMLAudioElement;
  createElement(tagName: 'blockquote', options?: ElementCreationOptions): HTMLQuoteElement;
  createElement(tagName: 'body', options?: ElementCreationOptions): HTMLBodyElement;
  createElement(tagName: 'br', options?: ElementCreationOptions): HTMLBRElement;
  createElement(tagName: 'button', options?: ElementCreationOptions): HTMLButtonElement;
  createElement(tagName: 'canvas', options?: ElementCreationOptions): HTMLCanvasElement;
  createElement(tagName: 'col', options?: ElementCreationOptions): HTMLTableColElement;
  createElement(tagName: 'colgroup', options?: ElementCreationOptions): HTMLTableColElement;
  createElement(tagName: 'data', options?: ElementCreationOptions): HTMLDataElement;
  createElement(tagName: 'datalist', options?: ElementCreationOptions): HTMLDataListElement;
  createElement(tagName: 'del', options?: ElementCreationOptions): HTMLModElement;
  createElement(tagName: 'details', options?: ElementCreationOptions): HTMLDetailsElement;
  createElement(tagName: 'dialog', options?: ElementCreationOptions): HTMLDialogElement;
  createElement(tagName: 'div', options?: ElementCreationOptions): HTMLDivElement;
  createElement(tagName: 'dl', options?: ElementCreationOptions): HTMLDListElement;
  createElement(tagName: 'embed', options?: ElementCreationOptions): HTMLEmbedElement;
  createElement(tagName: 'fieldset', options?: ElementCreationOptions): HTMLFieldSetElement;
  createElement(tagName: 'form', options?: ElementCreationOptions): HTMLFormElement;
  createElement(tagName: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6', options?: ElementCreationOptions): HTMLHeadingElement;
  createElement(tagName: 'head', options?: ElementCreationOptions): HTMLHeadElement;
  createElement(tagName: 'hr', options?: ElementCreationOptions): HTMLHRElement;
  createElement(tagName: 'html', options?: ElementCreationOptions): HTMLHtmlElement;
  createElement(tagName: 'iframe', options?: ElementCreationOptions): HTMLIFrameElement;
  createElement(tagName: 'img', options?: ElementCreationOptions): HTMLImageElement;
  createElement(tagName: 'input', options?: ElementCreationOptions): HTMLInputElement;
  createElement(tagName: 'ins', options?: ElementCreationOptions): HTMLModElement;
  createElement(tagName: 'label', options?: ElementCreationOptions): HTMLLabelElement;
  createElement(tagName: 'legend', options?: ElementCreationOptions): HTMLLegendElement;
  createElement(tagName: 'li', options?: ElementCreationOptions): HTMLLIElement;
  createElement(tagName: 'link', options?: ElementCreationOptions): HTMLLinkElement;
  createElement(tagName: 'map', options?: ElementCreationOptions): HTMLMapElement;
  createElement(tagName: 'meta', options?: ElementCreationOptions): HTMLMetaElement;
  createElement(tagName: 'meter', options?: ElementCreationOptions): HTMLMeterElement;
  createElement(tagName: 'object', options?: ElementCreationOptions): HTMLObjectElement;
  createElement(tagName: 'ol', options?: ElementCreationOptions): HTMLOListElement;
  createElement(tagName: 'optgroup', options?: ElementCreationOptions): HTMLOptGroupElement;
  createElement(tagName: 'option', options?: ElementCreationOptions): HTMLOptionElement;
  createElement(tagName: 'p', options?: ElementCreationOptions): HTMLParagraphElement;
  createElement(tagName: 'param', options?: ElementCreationOptions): HTMLParamElement;
  createElement(tagName: 'picture', options?: ElementCreationOptions): HTMLPictureElement;
  createElement(tagName: 'pre', options?: ElementCreationOptions): HTMLPreElement;
  createElement(tagName: 'progress', options?: ElementCreationOptions): HTMLProgressElement;
  createElement(tagName: 'q', options?: ElementCreationOptions): HTMLQuoteElement;
  createElement(tagName: 'script', options?: ElementCreationOptions): HTMLScriptElement;
  createElement(tagName: 'select', options?: ElementCreationOptions): HTMLSelectElement;
  createElement(tagName: 'source', options?: ElementCreationOptions): HTMLSourceElement;
  createElement(tagName: 'span', options?: ElementCreationOptions): HTMLSpanElement;
  createElement(tagName: 'style', options?: ElementCreationOptions): HTMLStyleElement;
  createElement(tagName: 'textarea', options?: ElementCreationOptions): HTMLTextAreaElement;
  createElement(tagName: 'time', options?: ElementCreationOptions): HTMLTimeElement;
  createElement(tagName: 'title', options?: ElementCreationOptions): HTMLTitleElement;
  createElement(tagName: 'track', options?: ElementCreationOptions): HTMLTrackElement;
  createElement(tagName: 'video', options?: ElementCreationOptions): HTMLVideoElement;
  createElement(tagName: 'table', options?: ElementCreationOptions): HTMLTableElement;
  createElement(tagName: 'caption', options?: ElementCreationOptions): HTMLTableCaptionElement;
  createElement(tagName: 'thead' | 'tfoot' | 'tbody', options?: ElementCreationOptions): HTMLTableSectionElement;
  createElement(tagName: 'tr', options?: ElementCreationOptions): HTMLTableRowElement;
  createElement(tagName: 'td' | 'th', options?: ElementCreationOptions): HTMLTableCellElement;
  createElement(tagName: 'template', options?: ElementCreationOptions): HTMLTemplateElement;
  createElement(tagName: 'ul', options?: ElementCreationOptions): HTMLUListElement;
  createElement(tagName: string, options?: ElementCreationOptions): HTMLElement;
  createElementNS(namespaceURI: string | null, qualifiedName: string, options?: ElementCreationOptions): Element;
  createTextNode(data: string): Text;
  currentScript: HTMLScriptElement | null;
  dir: 'rtl' | 'ltr';
  doctype: DocumentType | null;
  documentElement: HTMLElement | null;
  documentMode: number;
  domain: string | null;
  embeds: HTMLCollection<HTMLEmbedElement>;
  exitFullscreen(): Promise<void>,
  queryCommandSupported(cmdID: string): boolean;
  execCommand(cmdID: string, showUI?: boolean, value?: any): boolean;
  forms: HTMLCollection<HTMLFormElement>;
  fullscreenElement: Element | null;
  fullscreenEnabled: boolean;
  getElementsByClassName(classNames: string): HTMLCollection<HTMLElement>;
  getElementsByName(elementName: string): HTMLCollection<HTMLElement>;
  getElementsByTagName(name: 'a'): HTMLCollection<HTMLAnchorElement>;
  getElementsByTagName(name: 'area'): HTMLCollection<HTMLAreaElement>;
  getElementsByTagName(name: 'audio'): HTMLCollection<HTMLAudioElement>;
  getElementsByTagName(name: 'blockquote'): HTMLCollection<HTMLQuoteElement>;
  getElementsByTagName(name: 'body'): HTMLCollection<HTMLBodyElement>;
  getElementsByTagName(name: 'br'): HTMLCollection<HTMLBRElement>;
  getElementsByTagName(name: 'button'): HTMLCollection<HTMLButtonElement>;
  getElementsByTagName(name: 'canvas'): HTMLCollection<HTMLCanvasElement>;
  getElementsByTagName(name: 'col'): HTMLCollection<HTMLTableColElement>;
  getElementsByTagName(name: 'colgroup'): HTMLCollection<HTMLTableColElement>;
  getElementsByTagName(name: 'data'): HTMLCollection<HTMLDataElement>;
  getElementsByTagName(name: 'datalist'): HTMLCollection<HTMLDataListElement>;
  getElementsByTagName(name: 'del'): HTMLCollection<HTMLModElement>;
  getElementsByTagName(name: 'details'): HTMLCollection<HTMLDetailsElement>;
  getElementsByTagName(name: 'dialog'): HTMLCollection<HTMLDialogElement>;
  getElementsByTagName(name: 'div'): HTMLCollection<HTMLDivElement>;
  getElementsByTagName(name: 'dl'): HTMLCollection<HTMLDListElement>;
  getElementsByTagName(name: 'embed'): HTMLCollection<HTMLEmbedElement>;
  getElementsByTagName(name: 'fieldset'): HTMLCollection<HTMLFieldSetElement>;
  getElementsByTagName(name: 'form'): HTMLCollection<HTMLFormElement>;
  getElementsByTagName(name: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'): HTMLCollection<HTMLHeadingElement>;
  getElementsByTagName(name: 'head'): HTMLCollection<HTMLHeadElement>;
  getElementsByTagName(name: 'hr'): HTMLCollection<HTMLHRElement>;
  getElementsByTagName(name: 'html'): HTMLCollection<HTMLHtmlElement>;
  getElementsByTagName(name: 'iframe'): HTMLCollection<HTMLIFrameElement>;
  getElementsByTagName(name: 'img'): HTMLCollection<HTMLImageElement>;
  getElementsByTagName(name: 'input'): HTMLCollection<HTMLInputElement>;
  getElementsByTagName(name: 'ins'): HTMLCollection<HTMLModElement>;
  getElementsByTagName(name: 'label'): HTMLCollection<HTMLLabelElement>;
  getElementsByTagName(name: 'legend'): HTMLCollection<HTMLLegendElement>;
  getElementsByTagName(name: 'li'): HTMLCollection<HTMLLIElement>;
  getElementsByTagName(name: 'link'): HTMLCollection<HTMLLinkElement>;
  getElementsByTagName(name: 'map'): HTMLCollection<HTMLMapElement>;
  getElementsByTagName(name: 'meta'): HTMLCollection<HTMLMetaElement>;
  getElementsByTagName(name: 'meter'): HTMLCollection<HTMLMeterElement>;
  getElementsByTagName(name: 'object'): HTMLCollection<HTMLObjectElement>;
  getElementsByTagName(name: 'ol'): HTMLCollection<HTMLOListElement>;
  getElementsByTagName(name: 'option'): HTMLCollection<HTMLOptionElement>;
  getElementsByTagName(name: 'optgroup'): HTMLCollection<HTMLOptGroupElement>;
  getElementsByTagName(name: 'p'): HTMLCollection<HTMLParagraphElement>;
  getElementsByTagName(name: 'param'): HTMLCollection<HTMLParamElement>;
  getElementsByTagName(name: 'picture'): HTMLCollection<HTMLPictureElement>;
  getElementsByTagName(name: 'pre'): HTMLCollection<HTMLPreElement>;
  getElementsByTagName(name: 'progress'): HTMLCollection<HTMLProgressElement>;
  getElementsByTagName(name: 'q'): HTMLCollection<HTMLQuoteElement>;
  getElementsByTagName(name: 'script'): HTMLCollection<HTMLScriptElement>;
  getElementsByTagName(name: 'select'): HTMLCollection<HTMLSelectElement>;
  getElementsByTagName(name: 'source'): HTMLCollection<HTMLSourceElement>;
  getElementsByTagName(name: 'span'): HTMLCollection<HTMLSpanElement>;
  getElementsByTagName(name: 'style'): HTMLCollection<HTMLStyleElement>;
  getElementsByTagName(name: 'textarea'): HTMLCollection<HTMLTextAreaElement>;
  getElementsByTagName(name: 'time'): HTMLCollection<HTMLTimeElement>;
  getElementsByTagName(name: 'title'): HTMLCollection<HTMLTitleElement>;
  getElementsByTagName(name: 'track'): HTMLCollection<HTMLTrackElement>;
  getElementsByTagName(name: 'video'): HTMLCollection<HTMLVideoElement>;
  getElementsByTagName(name: 'table'): HTMLCollection<HTMLTableElement>;
  getElementsByTagName(name: 'caption'): HTMLCollection<HTMLTableCaptionElement>;
  getElementsByTagName(name: 'thead' | 'tfoot' | 'tbody'): HTMLCollection<HTMLTableSectionElement>;
  getElementsByTagName(name: 'tr'): HTMLCollection<HTMLTableRowElement>;
  getElementsByTagName(name: 'td' | 'th'): HTMLCollection<HTMLTableCellElement>;
  getElementsByTagName(name: 'template'): HTMLCollection<HTMLTemplateElement>;
  getElementsByTagName(name: 'ul'): HTMLCollection<HTMLUListElement>;
  getElementsByTagName(name: string): HTMLCollection<HTMLElement>;
  getElementsByTagNameNS(namespaceURI: string | null, localName: 'a'): HTMLCollection<HTMLAnchorElement>;
  getElementsByTagNameNS(namespaceURI: string | null, localName: 'area'): HTMLCollection<HTMLAreaElement>;
  getElementsByTagNameNS(namespaceURI: string | null, localName: 'audio'): HTMLCollection<HTMLAudioElement>;
  getElementsByTagNameNS(namespaceURI: string | null, localName: 'blockquote'): HTMLCollection<HTMLQuoteElement>;
  getElementsByTagNameNS(namespaceURI: string | null, localName: 'body'): HTMLCollection<HTMLBodyElement>;
  getElementsByTagNameNS(namespaceURI: string | null, localName: 'br'): HTMLCollection<HTMLBRElement>;
  getElementsByTagNameNS(namespaceURI: string | null, localName: 'button'): HTMLCollection<HTMLButtonElement>;
  getElementsByTagNameNS(namespaceURI: string | null, localName: 'canvas'): HTMLCollection<HTMLCanvasElement>;
  getElementsByTagNameNS(namespaceURI: string | null, localName: 'col'): HTMLCollection<HTMLTableColElement>;
  getElementsByTagNameNS(namespaceURI: string | null, localName: 'colgroup'): HTMLCollection<HTMLTableColElement>;
  getElementsByTagNameNS(namespaceURI: string | null, localName: 'data'): HTMLCollection<HTMLDataElement>;
  getElementsByTagNameNS(namespaceURI: string | null, localName: 'datalist'): HTMLCollection<HTMLDataListElement>;
  getElementsByTagNameNS(namespaceURI: string | null, localName: 'del'): HTMLCollection<HTMLModElement>;
  getElementsByTagNameNS(namespaceURI: string | null, localName: 'details'): HTMLCollection<HTMLDetailsElement>;
  getElementsByTagNameNS(namespaceURI: string | null, localName: 'dialog'): HTMLCollection<HTMLDialogElement>;
  getElementsByTagNameNS(namespaceURI: string | null, localName: 'div'): HTMLCollection<HTMLDivElement>;
  getElementsByTagNameNS(namespaceURI: string | null, localName: 'dl'): HTMLCollection<HTMLDListElement>;
  getElementsByTagNameNS(namespaceURI: string | null, localName: 'embed'): HTMLCollection<HTMLEmbedElement>;
  getElementsByTagNameNS(namespaceURI: string | null, localName: 'fieldset'): HTMLCollection<HTMLFieldSetElement>;
  getElementsByTagNameNS(namespaceURI: string | null, localName: 'form'): HTMLCollection<HTMLFormElement>;
  getElementsByTagNameNS(namespaceURI: string | null, localName: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'): HTMLCollection<HTMLHeadingElement>;
  getElementsByTagNameNS(namespaceURI: string | null, localName: 'head'): HTMLCollection<HTMLHeadElement>;
  getElementsByTagNameNS(namespaceURI: string | null, localName: 'hr'): HTMLCollection<HTMLHRElement>;
  getElementsByTagNameNS(namespaceURI: string | null, localName: 'html'): HTMLCollection<HTMLHtmlElement>;
  getElementsByTagNameNS(namespaceURI: string | null, localName: 'iframe'): HTMLCollection<HTMLIFrameElement>;
  getElementsByTagNameNS(namespaceURI: string | null, localName: 'img'): HTMLCollection<HTMLImageElement>;
  getElementsByTagNameNS(namespaceURI: string | null, localName: 'input'): HTMLCollection<HTMLInputElement>;
  getElementsByTagNameNS(namespaceURI: string | null, localName: 'ins'): HTMLCollection<HTMLModElement>;
  getElementsByTagNameNS(namespaceURI: string | null, localName: 'label'): HTMLCollection<HTMLLabelElement>;
  getElementsByTagNameNS(namespaceURI: string | null, localName: 'legend'): HTMLCollection<HTMLLegendElement>;
  getElementsByTagNameNS(namespaceURI: string | null, localName: 'li'): HTMLCollection<HTMLLIElement>;
  getElementsByTagNameNS(namespaceURI: string | null, localName: 'link'): HTMLCollection<HTMLLinkElement>;
  getElementsByTagNameNS(namespaceURI: string | null, localName: 'map'): HTMLCollection<HTMLMapElement>;
  getElementsByTagNameNS(namespaceURI: string | null, localName: 'meta'): HTMLCollection<HTMLMetaElement>;
  getElementsByTagNameNS(namespaceURI: string | null, localName: 'meter'): HTMLCollection<HTMLMeterElement>;
  getElementsByTagNameNS(namespaceURI: string | null, localName: 'object'): HTMLCollection<HTMLObjectElement>;
  getElementsByTagNameNS(namespaceURI: string | null, localName: 'ol'): HTMLCollection<HTMLOListElement>;
  getElementsByTagNameNS(namespaceURI: string | null, localName: 'option'): HTMLCollection<HTMLOptionElement>;
  getElementsByTagNameNS(namespaceURI: string | null, localName: 'optgroup'): HTMLCollection<HTMLOptGroupElement>;
  getElementsByTagNameNS(namespaceURI: string | null, localName: 'p'): HTMLCollection<HTMLParagraphElement>;
  getElementsByTagNameNS(namespaceURI: string | null, localName: 'param'): HTMLCollection<HTMLParamElement>;
  getElementsByTagNameNS(namespaceURI: string | null, localName: 'picture'): HTMLCollection<HTMLPictureElement>;
  getElementsByTagNameNS(namespaceURI: string | null, localName: 'pre'): HTMLCollection<HTMLPreElement>;
  getElementsByTagNameNS(namespaceURI: string | null, localName: 'progress'): HTMLCollection<HTMLProgressElement>;
  getElementsByTagNameNS(namespaceURI: string | null, localName: 'q'): HTMLCollection<HTMLQuoteElement>;
  getElementsByTagNameNS(namespaceURI: string | null, localName: 'script'): HTMLCollection<HTMLScriptElement>;
  getElementsByTagNameNS(namespaceURI: string | null, localName: 'select'): HTMLCollection<HTMLSelectElement>;
  getElementsByTagNameNS(namespaceURI: string | null, localName: 'source'): HTMLCollection<HTMLSourceElement>;
  getElementsByTagNameNS(namespaceURI: string | null, localName: 'span'): HTMLCollection<HTMLSpanElement>;
  getElementsByTagNameNS(namespaceURI: string | null, localName: 'style'): HTMLCollection<HTMLStyleElement>;
  getElementsByTagNameNS(namespaceURI: string | null, localName: 'textarea'): HTMLCollection<HTMLTextAreaElement>;
  getElementsByTagNameNS(namespaceURI: string | null, localName: 'time'): HTMLCollection<HTMLTimeElement>;
  getElementsByTagNameNS(namespaceURI: string | null, localName: 'title'): HTMLCollection<HTMLTitleElement>;
  getElementsByTagNameNS(namespaceURI: string | null, localName: 'track'): HTMLCollection<HTMLTrackElement>;
  getElementsByTagNameNS(namespaceURI: string | null, localName: 'video'): HTMLCollection<HTMLVideoElement>;
  getElementsByTagNameNS(namespaceURI: string | null, localName: 'table'): HTMLCollection<HTMLTableElement>;
  getElementsByTagNameNS(namespaceURI: string | null, localName: 'caption'): HTMLCollection<HTMLTableCaptionElement>;
  getElementsByTagNameNS(namespaceURI: string | null, localName: 'thead' | 'tfoot' | 'tbody'): HTMLCollection<HTMLTableSectionElement>;
  getElementsByTagNameNS(namespaceURI: string | null, localName: 'tr'): HTMLCollection<HTMLTableRowElement>;
  getElementsByTagNameNS(namespaceURI: string | null, localName: 'td' | 'th'): HTMLCollection<HTMLTableCellElement>;
  getElementsByTagNameNS(namespaceURI: string | null, localName: 'template'): HTMLCollection<HTMLTemplateElement>;
  getElementsByTagNameNS(namespaceURI: string | null, localName: 'ul'): HTMLCollection<HTMLUListElement>;
  getElementsByTagNameNS(namespaceURI: string | null, localName: string): HTMLCollection<HTMLElement>;
  head: HTMLHeadElement | null;
  images: HTMLCollection<HTMLImageElement>;
  implementation: DOMImplementation;
  importNode<T: Node>(importedNode: T, deep: boolean): T;
  inputEncoding: string;
  lastModified: string;
  links: HTMLCollection<HTMLLinkElement>;
  media: string;
  open(url?: string, name?: string, features?: string, replace?: boolean): any;
  readyState: string;
  referrer: string;
  scripts: HTMLCollection<HTMLScriptElement>;
  scrollingElement: HTMLElement | null;
  styleSheets: StyleSheetList;
  title: string;
  visibilityState: 'visible' | 'hidden' | 'prerender' | 'unloaded';
  write(...content: Array<string>): void;
  writeln(...content: Array<string>): void;
  xmlEncoding: string;
  xmlStandalone: boolean;
  xmlVersion: string;

  registerElement(type: string, options?: ElementRegistrationOptions): any;
  getSelection(): Selection | null;

  // 6.4.6 Focus management APIs
  activeElement: HTMLElement | null;
  hasFocus(): boolean;

  // extension
  location: Location;
  createEvent(eventInterface: 'CustomEvent'): CustomEvent;
  createEvent(eventInterface: string): Event;
  createRange(): Range;
  elementFromPoint(x: number, y: number): HTMLElement | null;
  elementsFromPoint(x: number, y: number): Array<HTMLElement>;
  defaultView: any;
  compatMode: 'BackCompat' | 'CSS1Compat';
  hidden: boolean;

  // Pointer Lock specification
  exitPointerLock(): void;
  pointerLockElement: Element | null;

  // from ParentNode interface
  childElementCount: number;
  children: HTMLCollection<HTMLElement>;
  firstElementChild: ?Element;
  lastElementChild: ?Element;
  append(...nodes: Array<string | Node>): void;
  prepend(...nodes: Array<string | Node>): void;

  querySelector(selector: 'a'): HTMLAnchorElement | null;
  querySelector(selector: 'area'): HTMLAreaElement | null;
  querySelector(selector: 'audio'): HTMLAudioElement | null;
  querySelector(selector: 'blockquote'): HTMLQuoteElement | null;
  querySelector(selector: 'body'): HTMLBodyElement | null;
  querySelector(selector: 'br'): HTMLBRElement | null;
  querySelector(selector: 'button'): HTMLButtonElement | null;
  querySelector(selector: 'canvas'): HTMLCanvasElement | null;
  querySelector(selector: 'col'): HTMLTableColElement | null;
  querySelector(selector: 'colgroup'): HTMLTableColElement | null;
  querySelector(selector: 'data'): HTMLDataElement | null;
  querySelector(selector: 'datalist'): HTMLDataListElement | null;
  querySelector(selector: 'del'): HTMLModElement | null;
  querySelector(selector: 'details'): HTMLDetailsElement | null;
  querySelector(selector: 'dialog'): HTMLDialogElement | null;
  querySelector(selector: 'div'): HTMLDivElement | null;
  querySelector(selector: 'dl'): HTMLDListElement | null;
  querySelector(selector: 'embed'): HTMLEmbedElement | null;
  querySelector(selector: 'fieldset'): HTMLFieldSetElement | null;
  querySelector(selector: 'form'): HTMLFormElement | null;
  querySelector(selector: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'): HTMLHeadingElement;
  querySelector(selector: 'head'): HTMLHeadElement | null;
  querySelector(selector: 'hr'): HTMLHRElement | null;
  querySelector(selector: 'html'): HTMLHtmlElement | null;
  querySelector(selector: 'iframe'): HTMLIFrameElement | null;
  querySelector(selector: 'img'): HTMLImageElement | null;
  querySelector(selector: 'ins'): HTMLModElement | null;
  querySelector(selector: 'input'): HTMLInputElement | null;
  querySelector(selector: 'label'): HTMLLabelElement | null;
  querySelector(selector: 'legend'): HTMLLegendElement | null;
  querySelector(selector: 'li'): HTMLLIElement | null;
  querySelector(selector: 'link'): HTMLLinkElement | null;
  querySelector(selector: 'map'): HTMLMapElement | null;
  querySelector(selector: 'meta'): HTMLMetaElement | null;
  querySelector(selector: 'meter'): HTMLMeterElement | null;
  querySelector(selector: 'object'): HTMLObjectElement | null;
  querySelector(selector: 'ol'): HTMLOListElement | null;
  querySelector(selector: 'option'): HTMLOptionElement | null;
  querySelector(selector: 'optgroup'): HTMLOptGroupElement | null;
  querySelector(selector: 'p'): HTMLParagraphElement | null;
  querySelector(selector: 'param'): HTMLParamElement | null;
  querySelector(selector: 'picture'): HTMLPictureElement | null;
  querySelector(selector: 'pre'): HTMLPreElement | null;
  querySelector(selector: 'progress'): HTMLProgressElement | null;
  querySelector(selector: 'q'): HTMLQuoteElement | null;
  querySelector(selector: 'script'): HTMLScriptElement | null;
  querySelector(selector: 'select'): HTMLSelectElement | null;
  querySelector(selector: 'source'): HTMLSourceElement | null;
  querySelector(selector: 'span'): HTMLSpanElement | null;
  querySelector(selector: 'style'): HTMLStyleElement | null;
  querySelector(selector: 'textarea'): HTMLTextAreaElement | null;
  querySelector(selector: 'time'): HTMLTimeElement | null;
  querySelector(selector: 'title'): HTMLTitleElement | null;
  querySelector(selector: 'track'): HTMLTrackElement | null;
  querySelector(selector: 'video'): HTMLVideoElement | null;
  querySelector(selector: 'table'): HTMLTableElement | null;
  querySelector(selector: 'caption'): HTMLTableCaptionElement | null;
  querySelector(selector: 'thead' | 'tfoot' | 'tbody'): HTMLTableSectionElement | null;
  querySelector(selector: 'tr'): HTMLTableRowElement | null;
  querySelector(selector: 'td' | 'th'): HTMLTableCellElement | null;
  querySelector(selector: 'template'): HTMLTemplateElement | null;
  querySelector(selector: 'ul'): HTMLUListElement | null;
  querySelector(selector: string): HTMLElement | null;

  querySelectorAll(selector: 'a'): NodeList<HTMLAnchorElement>;
  querySelectorAll(selector: 'area'): NodeList<HTMLAreaElement>;
  querySelectorAll(selector: 'audio'): NodeList<HTMLAudioElement>;
  querySelectorAll(selector: 'blockquote'): NodeList<HTMLQuoteElement>;
  querySelectorAll(selector: 'body'): NodeList<HTMLBodyElement>;
  querySelectorAll(selector: 'br'): NodeList<HTMLBRElement>;
  querySelectorAll(selector: 'button'): NodeList<HTMLButtonElement>;
  querySelectorAll(selector: 'canvas'): NodeList<HTMLCanvasElement>;
  querySelectorAll(selector: 'col'): NodeList<HTMLTableColElement>;
  querySelectorAll(selector: 'colgroup'): NodeList<HTMLTableColElement>;
  querySelectorAll(selector: 'data'): NodeList<HTMLDataElement>;
  querySelectorAll(selector: 'datalist'): NodeList<HTMLDataListElement>;
  querySelectorAll(selector: 'del'): NodeList<HTMLModElement>;
  querySelectorAll(selector: 'details'): NodeList<HTMLDetailsElement>;
  querySelectorAll(selector: 'dialog'): NodeList<HTMLDialogElement>;
  querySelectorAll(selector: 'div'): NodeList<HTMLDivElement>;
  querySelectorAll(selector: 'dl'): NodeList<HTMLDListElement>;
  querySelectorAll(selector: 'embed'): NodeList<HTMLEmbedElement>;
  querySelectorAll(selector: 'fieldset'): NodeList<HTMLFieldSetElement>;
  querySelectorAll(selector: 'form'): NodeList<HTMLFormElement>;
  querySelectorAll(selector: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'): NodeList<HTMLHeadingElement>;
  querySelectorAll(selector: 'head'): NodeList<HTMLHeadElement>;
  querySelectorAll(selector: 'hr'): NodeList<HTMLHRElement>;
  querySelectorAll(selector: 'html'): NodeList<HTMLHtmlElement>;
  querySelectorAll(selector: 'iframe'): NodeList<HTMLIFrameElement>;
  querySelectorAll(selector: 'img'): NodeList<HTMLImageElement>;
  querySelectorAll(selector: 'input'): NodeList<HTMLInputElement>;
  querySelectorAll(selector: 'ins'): NodeList<HTMLModElement>;
  querySelectorAll(selector: 'label'): NodeList<HTMLLabelElement>;
  querySelectorAll(selector: 'legend'): NodeList<HTMLLegendElement>;
  querySelectorAll(selector: 'li'): NodeList<HTMLLIElement>;
  querySelectorAll(selector: 'link'): NodeList<HTMLLinkElement>;
  querySelectorAll(selector: 'map'): NodeList<HTMLMapElement>;
  querySelectorAll(selector: 'meta'): NodeList<HTMLMetaElement>;
  querySelectorAll(selector: 'meter'): NodeList<HTMLMeterElement>;
  querySelectorAll(selector: 'object'): NodeList<HTMLObjectElement>;
  querySelectorAll(selector: 'ol'): NodeList<HTMLOListElement>;
  querySelectorAll(selector: 'option'): NodeList<HTMLOptionElement>;
  querySelectorAll(selector: 'optgroup'): NodeList<HTMLOptGroupElement>;
  querySelectorAll(selector: 'p'): NodeList<HTMLParagraphElement>;
  querySelectorAll(selector: 'param'): NodeList<HTMLParamElement>;
  querySelectorAll(selector: 'picture'): NodeList<HTMLPictureElement>;
  querySelectorAll(selector: 'pre'): NodeList<HTMLPreElement>;
  querySelectorAll(selector: 'progress'): NodeList<HTMLProgressElement>;
  querySelectorAll(selector: 'q'): NodeList<HTMLQuoteElement>;
  querySelectorAll(selector: 'script'): NodeList<HTMLScriptElement>;
  querySelectorAll(selector: 'select'): NodeList<HTMLSelectElement>;
  querySelectorAll(selector: 'source'): NodeList<HTMLSourceElement>;
  querySelectorAll(selector: 'span'): NodeList<HTMLSpanElement>;
  querySelectorAll(selector: 'style'): NodeList<HTMLStyleElement>;
  querySelectorAll(selector: 'textarea'): NodeList<HTMLTextAreaElement>;
  querySelectorAll(selector: 'time'): NodeList<HTMLTimeElement>;
  querySelectorAll(selector: 'title'): NodeList<HTMLTitleElement>;
  querySelectorAll(selector: 'track'): NodeList<HTMLTrackElement>;
  querySelectorAll(selector: 'video'): NodeList<HTMLVideoElement>;
  querySelectorAll(selector: 'table'): NodeList<HTMLTableElement>;
  querySelectorAll(selector: 'caption'): NodeList<HTMLTableCaptionElement>;
  querySelectorAll(selector: 'thead' | 'tfoot' | 'tbody'): NodeList<HTMLTableSectionElement>;
  querySelectorAll(selector: 'tr'): NodeList<HTMLTableRowElement>;
  querySelectorAll(selector: 'td' | 'th'): NodeList<HTMLTableCellElement>;
  querySelectorAll(selector: 'template'): NodeList<HTMLTemplateElement>;
  querySelectorAll(selector: 'ul'): NodeList<HTMLUListElement>;
  querySelectorAll(selector: string): NodeList<HTMLElement>;

  // Interface DocumentTraversal
  // http://www.w3.org/TR/2000/REC-DOM-Level-2-Traversal-Range-20001113/traversal.html#Traversal-Document

  // Not all combinations of RootNodeT and whatToShow are logically possible.
  // The bitmasks NodeFilter.SHOW_CDATA_SECTION,
  // NodeFilter.SHOW_ENTITY_REFERENCE, NodeFilter.SHOW_ENTITY, and
  // NodeFilter.SHOW_NOTATION are deprecated and do not correspond to types
  // that Flow knows about.

  // NodeFilter.SHOW_ATTRIBUTE is also deprecated, but corresponds to the
  // type Attr. While there is no reason to prefer it to Node.attributes,
  // it does have meaning and can be typed: When (whatToShow &
  // NodeFilter.SHOW_ATTRIBUTE === 1), RootNodeT must be Attr, and when
  // RootNodeT is Attr, bitmasks other than NodeFilter.SHOW_ATTRIBUTE are
  // meaningless.
  createNodeIterator<RootNodeT: Attr>(root: RootNodeT, whatToShow: 2, filter?: NodeFilterInterface): NodeIterator<RootNodeT, Attr>;
  createTreeWalker<RootNodeT: Attr>(root: RootNodeT, whatToShow: 2, filter?: NodeFilterInterface, entityReferenceExpansion?: boolean): TreeWalker<RootNodeT, Attr>;

  // NodeFilter.SHOW_PROCESSING_INSTRUCTION is not implemented because Flow
  // does not currently define a ProcessingInstruction class.

  // When (whatToShow & NodeFilter.SHOW_DOCUMENT === 1 || whatToShow &
  // NodeFilter.SHOW_DOCUMENT_TYPE === 1), RootNodeT must be Document.
  createNodeIterator<RootNodeT: Document>(root: RootNodeT, whatToShow: 256, filter?: NodeFilterInterface): NodeIterator<RootNodeT, Document>;
  createNodeIterator<RootNodeT: Document>(root: RootNodeT, whatToShow: 257, filter?: NodeFilterInterface): NodeIterator<RootNodeT, Document|Element>;
  createNodeIterator<RootNodeT: Document>(root: RootNodeT, whatToShow: 260, filter?: NodeFilterInterface): NodeIterator<RootNodeT, Document|Text>;
  createNodeIterator<RootNodeT: Document>(root: RootNodeT, whatToShow: 261, filter?: NodeFilterInterface): NodeIterator<RootNodeT, Document|Element|Text>;
  createNodeIterator<RootNodeT: Document>(root: RootNodeT, whatToShow: 384, filter?: NodeFilterInterface): NodeIterator<RootNodeT, Document|Comment>;
  createNodeIterator<RootNodeT: Document>(root: RootNodeT, whatToShow: 385, filter?: NodeFilterInterface): NodeIterator<RootNodeT, Document|Element|Comment>;
  createNodeIterator<RootNodeT: Document>(root: RootNodeT, whatToShow: 388, filter?: NodeFilterInterface): NodeIterator<RootNodeT, Document|Text|Comment>;
  createNodeIterator<RootNodeT: Document>(root: RootNodeT, whatToShow: 389, filter?: NodeFilterInterface): NodeIterator<RootNodeT, Document|Element|Text|Comment>;
  createNodeIterator<RootNodeT: Document>(root: RootNodeT, whatToShow: 512, filter?: NodeFilterInterface): NodeIterator<RootNodeT, DocumentType>;
  createNodeIterator<RootNodeT: Document>(root: RootNodeT, whatToShow: 513, filter?: NodeFilterInterface): NodeIterator<RootNodeT, DocumentType|Element>;
  createNodeIterator<RootNodeT: Document>(root: RootNodeT, whatToShow: 516, filter?: NodeFilterInterface): NodeIterator<RootNodeT, DocumentType|Text>;
  createNodeIterator<RootNodeT: Document>(root: RootNodeT, whatToShow: 517, filter?: NodeFilterInterface): NodeIterator<RootNodeT, DocumentType|Element|Text>;
  createNodeIterator<RootNodeT: Document>(root: RootNodeT, whatToShow: 640, filter?: NodeFilterInterface): NodeIterator<RootNodeT, DocumentType|Comment>;
  createNodeIterator<RootNodeT: Document>(root: RootNodeT, whatToShow: 641, filter?: NodeFilterInterface): NodeIterator<RootNodeT, DocumentType|Element|Comment>;
  createNodeIterator<RootNodeT: Document>(root: RootNodeT, whatToShow: 644, filter?: NodeFilterInterface): NodeIterator<RootNodeT, DocumentType|Text|Comment>;
  createNodeIterator<RootNodeT: Document>(root: RootNodeT, whatToShow: 645, filter?: NodeFilterInterface): NodeIterator<RootNodeT, DocumentType|Element|Text|Comment>;
  createNodeIterator<RootNodeT: Document>(root: RootNodeT, whatToShow: 768, filter?: NodeFilterInterface): NodeIterator<RootNodeT, DocumentType|Document>;
  createNodeIterator<RootNodeT: Document>(root: RootNodeT, whatToShow: 769, filter?: NodeFilterInterface): NodeIterator<RootNodeT, DocumentType|Document|Element>;
  createNodeIterator<RootNodeT: Document>(root: RootNodeT, whatToShow: 772, filter?: NodeFilterInterface): NodeIterator<RootNodeT, DocumentType|Document|Text>;
  createNodeIterator<RootNodeT: Document>(root: RootNodeT, whatToShow: 773, filter?: NodeFilterInterface): NodeIterator<RootNodeT, DocumentType|Document|Element|Text>;
  createNodeIterator<RootNodeT: Document>(root: RootNodeT, whatToShow: 896, filter?: NodeFilterInterface): NodeIterator<RootNodeT, DocumentType|Document|Comment>;
  createNodeIterator<RootNodeT: Document>(root: RootNodeT, whatToShow: 897, filter?: NodeFilterInterface): NodeIterator<RootNodeT, DocumentType|Document|Element|Comment>;
  createNodeIterator<RootNodeT: Document>(root: RootNodeT, whatToShow: 900, filter?: NodeFilterInterface): NodeIterator<RootNodeT, DocumentType|Document|Text|Comment>;
  createNodeIterator<RootNodeT: Document>(root: RootNodeT, whatToShow: 901, filter?: NodeFilterInterface): NodeIterator<RootNodeT, DocumentType|Document|Element|Text|Comment>;
  createTreeWalker<RootNodeT: Document>(root: RootNodeT, whatToShow: 256, filter?: NodeFilterInterface, entityReferenceExpansion?: boolean): TreeWalker<RootNodeT, Document>;
  createTreeWalker<RootNodeT: Document>(root: RootNodeT, whatToShow: 257, filter?: NodeFilterInterface, entityReferenceExpansion?: boolean): TreeWalker<RootNodeT, Document|Element>;
  createTreeWalker<RootNodeT: Document>(root: RootNodeT, whatToShow: 260, filter?: NodeFilterInterface, entityReferenceExpansion?: boolean): TreeWalker<RootNodeT, Document|Text>;
  createTreeWalker<RootNodeT: Document>(root: RootNodeT, whatToShow: 261, filter?: NodeFilterInterface, entityReferenceExpansion?: boolean): TreeWalker<RootNodeT, Document|Element|Text>;
  createTreeWalker<RootNodeT: Document>(root: RootNodeT, whatToShow: 384, filter?: NodeFilterInterface, entityReferenceExpansion?: boolean): TreeWalker<RootNodeT, Document|Comment>;
  createTreeWalker<RootNodeT: Document>(root: RootNodeT, whatToShow: 385, filter?: NodeFilterInterface, entityReferenceExpansion?: boolean): TreeWalker<RootNodeT, Document|Element|Comment>;
  createTreeWalker<RootNodeT: Document>(root: RootNodeT, whatToShow: 388, filter?: NodeFilterInterface, entityReferenceExpansion?: boolean): TreeWalker<RootNodeT, Document|Text|Comment>;
  createTreeWalker<RootNodeT: Document>(root: RootNodeT, whatToShow: 389, filter?: NodeFilterInterface, entityReferenceExpansion?: boolean): TreeWalker<RootNodeT, Document|Element|Text|Comment>;
  createTreeWalker<RootNodeT: Document>(root: RootNodeT, whatToShow: 512, filter?: NodeFilterInterface, entityReferenceExpansion?: boolean): TreeWalker<RootNodeT, DocumentType>;
  createTreeWalker<RootNodeT: Document>(root: RootNodeT, whatToShow: 513, filter?: NodeFilterInterface, entityReferenceExpansion?: boolean): TreeWalker<RootNodeT, DocumentType|Element>;
  createTreeWalker<RootNodeT: Document>(root: RootNodeT, whatToShow: 516, filter?: NodeFilterInterface, entityReferenceExpansion?: boolean): TreeWalker<RootNodeT, DocumentType|Text>;
  createTreeWalker<RootNodeT: Document>(root: RootNodeT, whatToShow: 517, filter?: NodeFilterInterface, entityReferenceExpansion?: boolean): TreeWalker<RootNodeT, DocumentType|Element|Text>;
  createTreeWalker<RootNodeT: Document>(root: RootNodeT, whatToShow: 640, filter?: NodeFilterInterface, entityReferenceExpansion?: boolean): TreeWalker<RootNodeT, DocumentType|Comment>;
  createTreeWalker<RootNodeT: Document>(root: RootNodeT, whatToShow: 641, filter?: NodeFilterInterface, entityReferenceExpansion?: boolean): TreeWalker<RootNodeT, DocumentType|Element|Comment>;
  createTreeWalker<RootNodeT: Document>(root: RootNodeT, whatToShow: 644, filter?: NodeFilterInterface, entityReferenceExpansion?: boolean): TreeWalker<RootNodeT, DocumentType|Text|Comment>;
  createTreeWalker<RootNodeT: Document>(root: RootNodeT, whatToShow: 645, filter?: NodeFilterInterface, entityReferenceExpansion?: boolean): TreeWalker<RootNodeT, DocumentType|Element|Text|Comment>;
  createTreeWalker<RootNodeT: Document>(root: RootNodeT, whatToShow: 768, filter?: NodeFilterInterface, entityReferenceExpansion?: boolean): TreeWalker<RootNodeT, DocumentType|Document>;
  createTreeWalker<RootNodeT: Document>(root: RootNodeT, whatToShow: 769, filter?: NodeFilterInterface, entityReferenceExpansion?: boolean): TreeWalker<RootNodeT, DocumentType|Document|Element>;
  createTreeWalker<RootNodeT: Document>(root: RootNodeT, whatToShow: 772, filter?: NodeFilterInterface, entityReferenceExpansion?: boolean): TreeWalker<RootNodeT, DocumentType|Document|Text>;
  createTreeWalker<RootNodeT: Document>(root: RootNodeT, whatToShow: 773, filter?: NodeFilterInterface, entityReferenceExpansion?: boolean): TreeWalker<RootNodeT, DocumentType|Document|Element|Text>;
  createTreeWalker<RootNodeT: Document>(root: RootNodeT, whatToShow: 896, filter?: NodeFilterInterface, entityReferenceExpansion?: boolean): TreeWalker<RootNodeT, DocumentType|Document|Comment>;
  createTreeWalker<RootNodeT: Document>(root: RootNodeT, whatToShow: 897, filter?: NodeFilterInterface, entityReferenceExpansion?: boolean): TreeWalker<RootNodeT, DocumentType|Document|Element|Comment>;
  createTreeWalker<RootNodeT: Document>(root: RootNodeT, whatToShow: 900, filter?: NodeFilterInterface, entityReferenceExpansion?: boolean): TreeWalker<RootNodeT, DocumentType|Document|Text|Comment>;
  createTreeWalker<RootNodeT: Document>(root: RootNodeT, whatToShow: 901, filter?: NodeFilterInterface, entityReferenceExpansion?: boolean): TreeWalker<RootNodeT, DocumentType|Document|Element|Text|Comment>;

  // When (whatToShow & NodeFilter.SHOW_DOCUMENT_FRAGMENT === 1), RootNodeT
  // must be a DocumentFragment.
  createNodeIterator<RootNodeT: DocumentFragment>(root: RootNodeT, whatToShow: 1024, filter?: NodeFilterInterface): NodeIterator<RootNodeT, DocumentFragment>;
  createNodeIterator<RootNodeT: DocumentFragment>(root: RootNodeT, whatToShow: 1025, filter?: NodeFilterInterface): NodeIterator<RootNodeT, DocumentFragment|Element>;
  createNodeIterator<RootNodeT: DocumentFragment>(root: RootNodeT, whatToShow: 1028, filter?: NodeFilterInterface): NodeIterator<RootNodeT, DocumentFragment|Text>;
  createNodeIterator<RootNodeT: DocumentFragment>(root: RootNodeT, whatToShow: 1029, filter?: NodeFilterInterface): NodeIterator<RootNodeT, DocumentFragment|Element|Text>;
  createNodeIterator<RootNodeT: DocumentFragment>(root: RootNodeT, whatToShow: 1152, filter?: NodeFilterInterface): NodeIterator<RootNodeT, DocumentFragment|Comment>;
  createNodeIterator<RootNodeT: DocumentFragment>(root: RootNodeT, whatToShow: 1153, filter?: NodeFilterInterface): NodeIterator<RootNodeT, DocumentFragment|Element|Comment>;
  createNodeIterator<RootNodeT: DocumentFragment>(root: RootNodeT, whatToShow: 1156, filter?: NodeFilterInterface): NodeIterator<RootNodeT, DocumentFragment|Text|Comment>;
  createNodeIterator<RootNodeT: DocumentFragment>(root: RootNodeT, whatToShow: 1157, filter?: NodeFilterInterface): NodeIterator<RootNodeT, DocumentFragment|Element|Text|Comment>;
  createTreeWalker<RootNodeT: DocumentFragment>(root: RootNodeT, whatToShow: 1024, filter?: NodeFilterInterface, entityReferenceExpansion?: boolean): TreeWalker<RootNodeT, DocumentFragment>;
  createTreeWalker<RootNodeT: DocumentFragment>(root: RootNodeT, whatToShow: 1025, filter?: NodeFilterInterface, entityReferenceExpansion?: boolean): TreeWalker<RootNodeT, DocumentFragment|Element>;
  createTreeWalker<RootNodeT: DocumentFragment>(root: RootNodeT, whatToShow: 1028, filter?: NodeFilterInterface, entityReferenceExpansion?: boolean): TreeWalker<RootNodeT, DocumentFragment|Text>;
  createTreeWalker<RootNodeT: DocumentFragment>(root: RootNodeT, whatToShow: 1029, filter?: NodeFilterInterface, entityReferenceExpansion?: boolean): TreeWalker<RootNodeT, DocumentFragment|Element|Text>;
  createTreeWalker<RootNodeT: DocumentFragment>(root: RootNodeT, whatToShow: 1152, filter?: NodeFilterInterface, entityReferenceExpansion?: boolean): TreeWalker<RootNodeT, DocumentFragment|Comment>;
  createTreeWalker<RootNodeT: DocumentFragment>(root: RootNodeT, whatToShow: 1153, filter?: NodeFilterInterface, entityReferenceExpansion?: boolean): TreeWalker<RootNodeT, DocumentFragment|Element|Comment>;
  createTreeWalker<RootNodeT: DocumentFragment>(root: RootNodeT, whatToShow: 1156, filter?: NodeFilterInterface, entityReferenceExpansion?: boolean): TreeWalker<RootNodeT, DocumentFragment|Text|Comment>;
  createTreeWalker<RootNodeT: DocumentFragment>(root: RootNodeT, whatToShow: 1157, filter?: NodeFilterInterface, entityReferenceExpansion?: boolean): TreeWalker<RootNodeT, DocumentFragment|Element|Text|Comment>;

  // In the general case, RootNodeT may be any Node and whatToShow may be
  // NodeFilter.SHOW_ALL or any combination of NodeFilter.SHOW_ELEMENT,
  // NodeFilter.SHOW_TEXT and/or NodeFilter.SHOW_COMMENT
  createNodeIterator<RootNodeT: Node>(root: RootNodeT, whatToShow: 1, filter?: NodeFilterInterface): NodeIterator<RootNodeT, Element>;
  createNodeIterator<RootNodeT: Node>(root: RootNodeT, whatToShow: 4, filter?: NodeFilterInterface): NodeIterator<RootNodeT, Text>;
  createNodeIterator<RootNodeT: Node>(root: RootNodeT, whatToShow: 5, filter?: NodeFilterInterface): NodeIterator<RootNodeT, Element|Text>;
  createNodeIterator<RootNodeT: Node>(root: RootNodeT, whatToShow: 128, filter?: NodeFilterInterface): NodeIterator<RootNodeT, Comment>;
  createNodeIterator<RootNodeT: Node>(root: RootNodeT, whatToShow: 129, filter?: NodeFilterInterface): NodeIterator<RootNodeT, Element|Comment>;
  createNodeIterator<RootNodeT: Node>(root: RootNodeT, whatToShow: 132, filter?: NodeFilterInterface): NodeIterator<RootNodeT, Text|Comment>;
  createNodeIterator<RootNodeT: Node>(root: RootNodeT, whatToShow: 133, filter?: NodeFilterInterface): NodeIterator<RootNodeT, Text|Element|Comment>;
  createTreeWalker<RootNodeT: Node>(root: RootNodeT, whatToShow: 1, filter?: NodeFilterInterface, entityReferenceExpansion?: boolean): TreeWalker<RootNodeT, Element>;
  createTreeWalker<RootNodeT: Node>(root: RootNodeT, whatToShow: 4, filter?: NodeFilterInterface, entityReferenceExpansion?: boolean): TreeWalker<RootNodeT, Text>;
  createTreeWalker<RootNodeT: Node>(root: RootNodeT, whatToShow: 5, filter?: NodeFilterInterface, entityReferenceExpansion?: boolean): TreeWalker<RootNodeT, Element|Text>;
  createTreeWalker<RootNodeT: Node>(root: RootNodeT, whatToShow: 128, filter?: NodeFilterInterface, entityReferenceExpansion?: boolean): TreeWalker<RootNodeT, Comment>;
  createTreeWalker<RootNodeT: Node>(root: RootNodeT, whatToShow: 129, filter?: NodeFilterInterface, entityReferenceExpansion?: boolean): TreeWalker<RootNodeT, Element|Comment>;
  createTreeWalker<RootNodeT: Node>(root: RootNodeT, whatToShow: 132, filter?: NodeFilterInterface, entityReferenceExpansion?: boolean): TreeWalker<RootNodeT, Text|Comment>;
  createTreeWalker<RootNodeT: Node>(root: RootNodeT, whatToShow: 133, filter?: NodeFilterInterface, entityReferenceExpansion?: boolean): TreeWalker<RootNodeT, Text|Element|Comment>;

  // Catch all for when we don't know the value of `whatToShow`
  // And for when whatToShow is not provided, it is assumed to be SHOW_ALL
  createNodeIterator<RootNodeT: Node>(root: RootNodeT, whatToShow?: number, filter?: NodeFilterInterface): NodeIterator<RootNodeT, Node>;
  createTreeWalker<RootNodeT: Node>(root: RootNodeT, whatToShow?: number, filter?: NodeFilterInterface, entityReferenceExpansion?: boolean): TreeWalker<RootNodeT, Node>;

  // From NonElementParentNode Mixin.
  getElementById(elementId: string): HTMLElement | null;
}

declare class DocumentFragment extends Node {
  // from ParentNode interface
  childElementCount: number;
  children: HTMLCollection<HTMLElement>;
  firstElementChild: ?Element;
  lastElementChild: ?Element;
  append(...nodes: Array<string | Node>): void;
  prepend(...nodes: Array<string | Node>): void;

  querySelector(selector: string): HTMLElement | null;
  querySelectorAll(selector: string): NodeList<HTMLElement>;

  // From NonElementParentNode Mixin.
  getElementById(elementId: string): HTMLElement | null;
}

declare class Selection {
  anchorNode: Node | null;
  anchorOffset: number;
  focusNode: Node | null;
  focusOffset: number;
  isCollapsed: boolean;
  rangeCount: number;
  type: string;
  addRange(range: Range): void;
  getRangeAt(index: number): Range;
  removeRange(range: Range): void;
  removeAllRanges(): void;
  collapse(parentNode: Node | null, offset?: number): void;
  collapseToStart(): void;
  collapseToEnd(): void;
  containsNode(aNode: Node, aPartlyContained?: boolean): boolean;
  deleteFromDocument(): void;
  extend(parentNode: Node, offset?: number): void;
  empty(): void;
  selectAllChildren(parentNode: Node): void;
  setPosition(aNode: Node | null, offset?: number): void;
  setBaseAndExtent(anchorNode: Node, anchorOffset: number, focusNode: Node, focusOffset: number): void;
  toString(): string;
}

declare class Range { // extension
  startOffset: number;
  collapsed: boolean;
  endOffset: number;
  startContainer: Node;
  endContainer: Node;
  commonAncestorContainer: Node;
  setStart(refNode: Node, offset: number): void;
  setEndBefore(refNode: Node): void;
  setStartBefore(refNode: Node): void;
  selectNode(refNode: Node): void;
  detach(): void;
  getBoundingClientRect(): ClientRect;
  toString(): string;
  compareBoundaryPoints(how: number, sourceRange: Range): number;
  insertNode(newNode: Node): void;
  collapse(toStart: boolean): void;
  selectNodeContents(refNode: Node): void;
  cloneContents(): DocumentFragment;
  setEnd(refNode: Node, offset: number): void;
  cloneRange(): Range;
  getClientRects(): ClientRectList;
  surroundContents(newParent: Node): void;
  deleteContents(): void;
  setStartAfter(refNode: Node): void;
  extractContents(): DocumentFragment;
  setEndAfter(refNode: Node): void;
  createContextualFragment(fragment: string): DocumentFragment;
  static END_TO_END: number;
  static START_TO_START: number;
  static START_TO_END: number;
  static END_TO_START: number;
}

declare var document: Document;

// TODO: HTMLDocument
type FocusOptions = { preventScroll?: boolean, ... }

declare class DOMTokenList {
  @@iterator(): Iterator<string>;
  length: number;
  item(index: number): string;
  contains(token: string): boolean;
  add(...token: Array<string>): void;
  remove(...token: Array<string>): void;
  toggle(token: string, force?: boolean): boolean;
  replace(oldToken: string, newToken: string): boolean;

  forEach(callbackfn: (value: string, index: number, list: DOMTokenList) => any, thisArg?: any): void;
  entries(): Iterator<[number, string]>;
  keys(): Iterator<number>;
  values(): Iterator<string>;
}


declare class Element extends Node implements Animatable {
  animate(keyframes: Keyframe[] | PropertyIndexedKeyframes | null, options?: number | KeyframeAnimationOptions): Animation;
  getAnimations(options?: GetAnimationsOptions): Animation[];
  assignedSlot: ?HTMLSlotElement;
  attachShadow(shadowRootInitDict: ShadowRootInit): ShadowRoot;
  attributes: NamedNodeMap;
  classList: DOMTokenList;
  className: string;
  clientHeight: number;
  clientLeft: number;
  clientTop: number;
  clientWidth: number;
  id: string;
  innerHTML: string;
  localName: string;
  namespaceURI: ?string;
  nextElementSibling: ?Element;
  outerHTML: string;
  prefix: string | null;
  previousElementSibling: ?Element;
  scrollHeight: number;
  scrollLeft: number;
  scrollTop: number;
  scrollWidth: number;
  tagName: string;

  closest(selectors: string): ?Element;
  dispatchEvent(event: Event): bool;

  getAttribute(name?: string): ?string;
  getAttributeNS(namespaceURI: string | null, localName: string): string | null;
  getAttributeNode(name: string): Attr | null;
  getAttributeNodeNS(namespaceURI: string | null, localName: string): Attr | null;
  getBoundingClientRect(): ClientRect;
  getClientRects(): ClientRect[];
  getElementsByClassName(names: string): HTMLCollection<HTMLElement>;
  getElementsByTagName(name: 'a'): HTMLCollection<HTMLAnchorElement>;
  getElementsByTagName(name: 'audio'): HTMLCollection<HTMLAudioElement>;
  getElementsByTagName(name: 'br'): HTMLCollection<HTMLBRElement>;
  getElementsByTagName(name: 'button'): HTMLCollection<HTMLButtonElement>;
  getElementsByTagName(name: 'canvas'): HTMLCollection<HTMLCanvasElement>;
  getElementsByTagName(name: 'col'): HTMLCollection<HTMLTableColElement>;
  getElementsByTagName(name: 'colgroup'): HTMLCollection<HTMLTableColElement>;
  getElementsByTagName(name: 'data'): HTMLCollection<HTMLDataElement>;
  getElementsByTagName(name: 'datalist'): HTMLCollection<HTMLDataElement>;
  getElementsByTagName(name: 'del'): HTMLCollection<HTMLModElement>;
  getElementsByTagName(name: 'details'): HTMLCollection<HTMLDetailsElement>;
  getElementsByTagName(name: 'dialog'): HTMLCollection<HTMLDialogElement>;
  getElementsByTagName(name: 'div'): HTMLCollection<HTMLDivElement>;
  getElementsByTagName(name: 'dl'): HTMLCollection<HTMLDListElement>;
  getElementsByTagName(name: 'fieldset'): HTMLCollection<HTMLFieldSetElement>;
  getElementsByTagName(name: 'form'): HTMLCollection<HTMLFormElement>;
  getElementsByTagName(name: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'): HTMLCollection<HTMLHeadingElement>;
  getElementsByTagName(name: 'head'): HTMLCollection<HTMLHeadElement>;
  getElementsByTagName(name: 'hr'): HTMLCollection<HTMLHRElement>;
  getElementsByTagName(name: 'iframe'): HTMLCollection<HTMLIFrameElement>;
  getElementsByTagName(name: 'img'): HTMLCollection<HTMLImageElement>;
  getElementsByTagName(name: 'input'): HTMLCollection<HTMLInputElement>;
  getElementsByTagName(name: 'ins'): HTMLCollection<HTMLModElement>;
  getElementsByTagName(name: 'label'): HTMLCollection<HTMLLabelElement>;
  getElementsByTagName(name: 'legend'): HTMLCollection<HTMLLegendElement>;
  getElementsByTagName(name: 'li'): HTMLCollection<HTMLLIElement>;
  getElementsByTagName(name: 'link'): HTMLCollection<HTMLLinkElement>;
  getElementsByTagName(name: 'meta'): HTMLCollection<HTMLMetaElement>;
  getElementsByTagName(name: 'meter'): HTMLCollection<HTMLMeterElement>;
  getElementsByTagName(name: 'object'): HTMLCollection<HTMLObjectElement>;
  getElementsByTagName(name: 'ol'): HTMLCollection<HTMLOListElement>;
  getElementsByTagName(name: 'option'): HTMLCollection<HTMLOptionElement>;
  getElementsByTagName(name: 'optgroup'): HTMLCollection<HTMLOptGroupElement>;
  getElementsByTagName(name: 'p'): HTMLCollection<HTMLParagraphElement>;
  getElementsByTagName(name: 'param'): HTMLCollection<HTMLParamElement>;
  getElementsByTagName(name: 'picture'): HTMLCollection<HTMLPictureElement>;
  getElementsByTagName(name: 'pre'): HTMLCollection<HTMLPreElement>;
  getElementsByTagName(name: 'progress'): HTMLCollection<HTMLProgressElement>;
  getElementsByTagName(name: 'script'): HTMLCollection<HTMLScriptElement>;
  getElementsByTagName(name: 'select'): HTMLCollection<HTMLSelectElement>;
  getElementsByTagName(name: 'source'): HTMLCollection<HTMLSourceElement>;
  getElementsByTagName(name: 'span'): HTMLCollection<HTMLSpanElement>;
  getElementsByTagName(name: 'style'): HTMLCollection<HTMLStyleElement>;
  getElementsByTagName(name: 'textarea'): HTMLCollection<HTMLTextAreaElement>;
  getElementsByTagName(name: 'video'): HTMLCollection<HTMLVideoElement>;
  getElementsByTagName(name: 'table'): HTMLCollection<HTMLTableElement>;
  getElementsByTagName(name: 'title'): HTMLCollection<HTMLTitleElement>;
  getElementsByTagName(name: 'caption'): HTMLCollection<HTMLTableCaptionElement>;
  getElementsByTagName(name: 'thead' | 'tfoot' | 'tbody'): HTMLCollection<HTMLTableSectionElement>;
  getElementsByTagName(name: 'tr'): HTMLCollection<HTMLTableRowElement>;
  getElementsByTagName(name: 'td' | 'th'): HTMLCollection<HTMLTableCellElement>;
  getElementsByTagName(name: 'template'): HTMLCollection<HTMLTemplateElement>;
  getElementsByTagName(name: 'ul'): HTMLCollection<HTMLUListElement>;
  getElementsByTagName(name: string): HTMLCollection<HTMLElement>;
  getElementsByTagNameNS(namespaceURI: string | null, localName: 'a'): HTMLCollection<HTMLAnchorElement>;
  getElementsByTagNameNS(namespaceURI: string | null, localName: 'audio'): HTMLCollection<HTMLAudioElement>;
  getElementsByTagNameNS(namespaceURI: string | null, localName: 'br'): HTMLCollection<HTMLBRElement>;
  getElementsByTagNameNS(namespaceURI: string | null, localName: 'button'): HTMLCollection<HTMLButtonElement>;
  getElementsByTagNameNS(namespaceURI: string | null, localName: 'canvas'): HTMLCollection<HTMLCanvasElement>;
  getElementsByTagNameNS(namespaceURI: string | null, localName: 'col'): HTMLCollection<HTMLTableColElement>;
  getElementsByTagNameNS(namespaceURI: string | null, localName: 'colgroup'): HTMLCollection<HTMLTableColElement>;
  getElementsByTagNameNS(namespaceURI: string | null, localName: 'data'): HTMLCollection<HTMLDataElement>;
  getElementsByTagNameNS(namespaceURI: string | null, localName: 'datalist'): HTMLCollection<HTMLDataListElement>;
  getElementsByTagNameNS(namespaceURI: string | null, localName: 'del'): HTMLCollection<HTMLModElement>;
  getElementsByTagNameNS(namespaceURI: string | null, localName: 'details'): HTMLCollection<HTMLDetailsElement>;
  getElementsByTagNameNS(namespaceURI: string | null, localName: 'dialog'): HTMLCollection<HTMLDialogElement>;
  getElementsByTagNameNS(namespaceURI: string | null, localName: 'div'): HTMLCollection<HTMLDivElement>;
  getElementsByTagNameNS(namespaceURI: string | null, localName: 'dl'): HTMLCollection<HTMLDListElement>;
  getElementsByTagNameNS(namespaceURI: string | null, localName: 'fieldset'): HTMLCollection<HTMLFieldSetElement>;
  getElementsByTagNameNS(namespaceURI: string | null, localName: 'form'): HTMLCollection<HTMLFormElement>;
  getElementsByTagNameNS(namespaceURI: string | null, localName: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'): HTMLCollection<HTMLHeadingElement>;
  getElementsByTagNameNS(namespaceURI: string | null, localName: 'head'): HTMLCollection<HTMLHeadElement>;
  getElementsByTagNameNS(namespaceURI: string | null, localName: 'hr'): HTMLCollection<HTMLHRElement>;
  getElementsByTagNameNS(namespaceURI: string | null, localName: 'iframe'): HTMLCollection<HTMLIFrameElement>;
  getElementsByTagNameNS(namespaceURI: string | null, localName: 'img'): HTMLCollection<HTMLImageElement>;
  getElementsByTagNameNS(namespaceURI: string | null, localName: 'input'): HTMLCollection<HTMLInputElement>;
  getElementsByTagNameNS(namespaceURI: string | null, localName: 'ins'): HTMLCollection<HTMLModElement>;
  getElementsByTagNameNS(namespaceURI: string | null, localName: 'label'): HTMLCollection<HTMLLabelElement>;
  getElementsByTagNameNS(namespaceURI: string | null, localName: 'legend'): HTMLCollection<HTMLLegendElement>;
  getElementsByTagNameNS(namespaceURI: string | null, localName: 'li'): HTMLCollection<HTMLLIElement>;
  getElementsByTagNameNS(namespaceURI: string | null, localName: 'link'): HTMLCollection<HTMLLinkElement>;
  getElementsByTagNameNS(namespaceURI: string | null, localName: 'meta'): HTMLCollection<HTMLMetaElement>;
  getElementsByTagNameNS(namespaceURI: string | null, localName: 'meter'): HTMLCollection<HTMLMeterElement>;
  getElementsByTagNameNS(namespaceURI: string | null, localName: 'object'): HTMLCollection<HTMLObjectElement>;
  getElementsByTagNameNS(namespaceURI: string | null, localName: 'ol'): HTMLCollection<HTMLOListElement>;
  getElementsByTagNameNS(namespaceURI: string | null, localName: 'option'): HTMLCollection<HTMLOptionElement>;
  getElementsByTagNameNS(namespaceURI: string | null, localName: 'optgroup'): HTMLCollection<HTMLOptGroupElement>;
  getElementsByTagNameNS(namespaceURI: string | null, localName: 'p'): HTMLCollection<HTMLParagraphElement>;
  getElementsByTagNameNS(namespaceURI: string | null, localName: 'param'): HTMLCollection<HTMLParamElement>;
  getElementsByTagNameNS(namespaceURI: string | null, localName: 'picture'): HTMLCollection<HTMLPictureElement>;
  getElementsByTagNameNS(namespaceURI: string | null, localName: 'pre'): HTMLCollection<HTMLPreElement>;
  getElementsByTagNameNS(namespaceURI: string | null, localName: 'progress'): HTMLCollection<HTMLProgressElement>;
  getElementsByTagNameNS(namespaceURI: string | null, localName: 'script'): HTMLCollection<HTMLScriptElement>;
  getElementsByTagNameNS(namespaceURI: string | null, localName: 'select'): HTMLCollection<HTMLSelectElement>;
  getElementsByTagNameNS(namespaceURI: string | null, localName: 'source'): HTMLCollection<HTMLSourceElement>;
  getElementsByTagNameNS(namespaceURI: string | null, localName: 'span'): HTMLCollection<HTMLSpanElement>;
  getElementsByTagNameNS(namespaceURI: string | null, localName: 'style'): HTMLCollection<HTMLStyleElement>;
  getElementsByTagNameNS(namespaceURI: string | null, localName: 'textarea'): HTMLCollection<HTMLTextAreaElement>;
  getElementsByTagNameNS(namespaceURI: string | null, localName: 'video'): HTMLCollection<HTMLVideoElement>;
  getElementsByTagNameNS(namespaceURI: string | null, localName: 'table'): HTMLCollection<HTMLTableElement>;
  getElementsByTagNameNS(namespaceURI: string | null, localName: 'title'): HTMLCollection<HTMLTitleElement>;
  getElementsByTagNameNS(namespaceURI: string | null, localName: 'caption'): HTMLCollection<HTMLTableCaptionElement>;
  getElementsByTagNameNS(namespaceURI: string | null, localName: 'thead' | 'tfoot' | 'tbody'): HTMLCollection<HTMLTableSectionElement>;
  getElementsByTagNameNS(namespaceURI: string | null, localName: 'tr'): HTMLCollection<HTMLTableRowElement>;
  getElementsByTagNameNS(namespaceURI: string | null, localName: 'td' | 'th'): HTMLCollection<HTMLTableCellElement>;
  getElementsByTagNameNS(namespaceURI: string | null, localName: 'template'): HTMLCollection<HTMLTemplateElement>;
  getElementsByTagNameNS(namespaceURI: string | null, localName: 'ul'): HTMLCollection<HTMLUListElement>;
  getElementsByTagNameNS(namespaceURI: string | null, localName: string): HTMLCollection<HTMLElement>;
  hasAttribute(name: string): boolean;
  hasAttributeNS(namespaceURI: string | null, localName: string): boolean;
  hasAttributes(): boolean;
  insertAdjacentElement(position: 'beforebegin' | 'afterbegin' | 'beforeend' | 'afterend', element: Element): void;
  insertAdjacentHTML(position: 'beforebegin' | 'afterbegin' | 'beforeend' | 'afterend', html: string): void;
  insertAdjacentText(position: 'beforebegin' | 'afterbegin' | 'beforeend' | 'afterend', text: string): void;
  matches(selector: string): bool;
  releasePointerCapture(pointerId: string): void;
  removeAttribute(name?: string): void;
  removeAttributeNode(attributeNode: Attr): Attr;
  removeAttributeNS(namespaceURI: string | null, localName: string): void;
  requestFullscreen(options?: { navigationUI: 'auto' | 'show' | 'hide', ... }): Promise<void>;
  requestPointerLock(): void;
  scrollIntoView(arg?: (boolean | {
         behavior?: ('auto' | 'instant' | 'smooth'),
         block?: ('start' | 'center' | 'end' | 'nearest'),
         inline?: ('start' | 'center' | 'end' | 'nearest'),
         ...
  })): void;
  scroll(x: number, y: number): void;
  scroll(options: ScrollToOptions): void;
  scrollTo(x: number, y: number): void;
  scrollTo(options: ScrollToOptions): void;
  scrollBy(x: number, y: number): void;
  scrollBy(options: ScrollToOptions): void;
  setAttribute(name?: string, value?: string): void;
  toggleAttribute(name?: string, force?: boolean): void;
  setAttributeNS(namespaceURI: string | null, qualifiedName: string, value: string): void;
  setAttributeNode(newAttr: Attr): Attr | null;
  setAttributeNodeNS(newAttr: Attr): Attr | null;
  setPointerCapture(pointerId: string): void;
  shadowRoot?: ShadowRoot;
  slot?: string;

  // from ParentNode interface
  childElementCount: number;
  children: HTMLCollection<HTMLElement>;
  firstElementChild: ?Element;
  lastElementChild: ?Element;
  append(...nodes: Array<string | Node>): void;
  prepend(...nodes: Array<string | Node>): void;

  querySelector(selector: 'a'): HTMLAnchorElement | null;
  querySelector(selector: 'area'): HTMLAreaElement | null;
  querySelector(selector: 'audio'): HTMLAudioElement | null;
  querySelector(selector: 'blockquote'): HTMLQuoteElement | null;
  querySelector(selector: 'body'): HTMLBodyElement | null;
  querySelector(selector: 'br'): HTMLBRElement | null;
  querySelector(selector: 'button'): HTMLButtonElement | null;
  querySelector(selector: 'canvas'): HTMLCanvasElement | null;
  querySelector(selector: 'col'): HTMLTableColElement | null;
  querySelector(selector: 'colgroup'): HTMLTableColElement | null;
  querySelector(selector: 'data'): HTMLDataElement | null;
  querySelector(selector: 'datalist'): HTMLDataListElement | null;
  querySelector(selector: 'del'): HTMLModElement | null;
  querySelector(selector: 'details'): HTMLDetailsElement | null;
  querySelector(selector: 'dialog'): HTMLDialogElement | null;
  querySelector(selector: 'div'): HTMLDivElement | null;
  querySelector(selector: 'dl'): HTMLDListElement | null;
  querySelector(selector: 'embed'): HTMLEmbedElement | null;
  querySelector(selector: 'fieldset'): HTMLFieldSetElement | null;
  querySelector(selector: 'form'): HTMLFormElement | null;
  querySelector(selector: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'): HTMLHeadingElement;
  querySelector(selector: 'head'): HTMLHeadElement | null;
  querySelector(selector: 'hr'): HTMLHRElement | null;
  querySelector(selector: 'html'): HTMLHtmlElement | null;
  querySelector(selector: 'iframe'): HTMLIFrameElement | null;
  querySelector(selector: 'img'): HTMLImageElement | null;
  querySelector(selector: 'ins'): HTMLModElement | null;
  querySelector(selector: 'input'): HTMLInputElement | null;
  querySelector(selector: 'label'): HTMLLabelElement | null;
  querySelector(selector: 'legend'): HTMLLegendElement | null;
  querySelector(selector: 'li'): HTMLLIElement | null;
  querySelector(selector: 'link'): HTMLLinkElement | null;
  querySelector(selector: 'map'): HTMLMapElement | null;
  querySelector(selector: 'meta'): HTMLMetaElement | null;
  querySelector(selector: 'meter'): HTMLMeterElement | null;
  querySelector(selector: 'object'): HTMLObjectElement | null;
  querySelector(selector: 'ol'): HTMLOListElement | null;
  querySelector(selector: 'option'): HTMLOptionElement | null;
  querySelector(selector: 'optgroup'): HTMLOptGroupElement | null;
  querySelector(selector: 'p'): HTMLParagraphElement | null;
  querySelector(selector: 'param'): HTMLParamElement | null;
  querySelector(selector: 'picture'): HTMLPictureElement | null;
  querySelector(selector: 'pre'): HTMLPreElement | null;
  querySelector(selector: 'progress'): HTMLProgressElement | null;
  querySelector(selector: 'q'): HTMLQuoteElement | null;
  querySelector(selector: 'script'): HTMLScriptElement | null;
  querySelector(selector: 'select'): HTMLSelectElement | null;
  querySelector(selector: 'source'): HTMLSourceElement | null;
  querySelector(selector: 'span'): HTMLSpanElement | null;
  querySelector(selector: 'style'): HTMLStyleElement | null;
  querySelector(selector: 'textarea'): HTMLTextAreaElement | null;
  querySelector(selector: 'time'): HTMLTimeElement | null;
  querySelector(selector: 'title'): HTMLTitleElement | null;
  querySelector(selector: 'track'): HTMLTrackElement | null;
  querySelector(selector: 'video'): HTMLVideoElement | null;
  querySelector(selector: 'table'): HTMLTableElement | null;
  querySelector(selector: 'caption'): HTMLTableCaptionElement | null;
  querySelector(selector: 'thead' | 'tfoot' | 'tbody'): HTMLTableSectionElement | null;
  querySelector(selector: 'tr'): HTMLTableRowElement | null;
  querySelector(selector: 'td' | 'th'): HTMLTableCellElement | null;
  querySelector(selector: 'template'): HTMLTemplateElement | null;
  querySelector(selector: 'ul'): HTMLUListElement | null;
  querySelector(selector: string): HTMLElement | null;

  querySelectorAll(selector: 'a'): NodeList<HTMLAnchorElement>;
  querySelectorAll(selector: 'area'): NodeList<HTMLAreaElement>;
  querySelectorAll(selector: 'audio'): NodeList<HTMLAudioElement>;
  querySelectorAll(selector: 'blockquote'): NodeList<HTMLQuoteElement>;
  querySelectorAll(selector: 'body'): NodeList<HTMLBodyElement>;
  querySelectorAll(selector: 'br'): NodeList<HTMLBRElement>;
  querySelectorAll(selector: 'button'): NodeList<HTMLButtonElement>;
  querySelectorAll(selector: 'canvas'): NodeList<HTMLCanvasElement>;
  querySelectorAll(selector: 'col'): NodeList<HTMLTableColElement>;
  querySelectorAll(selector: 'colgroup'): NodeList<HTMLTableColElement>;
  querySelectorAll(selector: 'data'): NodeList<HTMLDataElement>;
  querySelectorAll(selector: 'datalist'): NodeList<HTMLDataListElement>;
  querySelectorAll(selector: 'del'): NodeList<HTMLModElement>;
  querySelectorAll(selector: 'details'): NodeList<HTMLDetailsElement>;
  querySelectorAll(selector: 'dialog'): NodeList<HTMLDialogElement>;
  querySelectorAll(selector: 'div'): NodeList<HTMLDivElement>;
  querySelectorAll(selector: 'dl'): NodeList<HTMLDListElement>;
  querySelectorAll(selector: 'embed'): NodeList<HTMLEmbedElement>;
  querySelectorAll(selector: 'fieldset'): NodeList<HTMLFieldSetElement>;
  querySelectorAll(selector: 'form'): NodeList<HTMLFormElement>;
  querySelectorAll(selector: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'): NodeList<HTMLHeadingElement>;
  querySelectorAll(selector: 'head'): NodeList<HTMLHeadElement>;
  querySelectorAll(selector: 'hr'): NodeList<HTMLHRElement>;
  querySelectorAll(selector: 'html'): NodeList<HTMLHtmlElement>;
  querySelectorAll(selector: 'iframe'): NodeList<HTMLIFrameElement>;
  querySelectorAll(selector: 'img'): NodeList<HTMLImageElement>;
  querySelectorAll(selector: 'input'): NodeList<HTMLInputElement>;
  querySelectorAll(selector: 'ins'): NodeList<HTMLModElement>;
  querySelectorAll(selector: 'label'): NodeList<HTMLLabelElement>;
  querySelectorAll(selector: 'legend'): NodeList<HTMLLegendElement>;
  querySelectorAll(selector: 'li'): NodeList<HTMLLIElement>;
  querySelectorAll(selector: 'link'): NodeList<HTMLLinkElement>;
  querySelectorAll(selector: 'map'): NodeList<HTMLMapElement>;
  querySelectorAll(selector: 'meta'): NodeList<HTMLMetaElement>;
  querySelectorAll(selector: 'meter'): NodeList<HTMLMeterElement>;
  querySelectorAll(selector: 'object'): NodeList<HTMLObjectElement>;
  querySelectorAll(selector: 'ol'): NodeList<HTMLOListElement>;
  querySelectorAll(selector: 'option'): NodeList<HTMLOptionElement>;
  querySelectorAll(selector: 'optgroup'): NodeList<HTMLOptGroupElement>;
  querySelectorAll(selector: 'p'): NodeList<HTMLParagraphElement>;
  querySelectorAll(selector: 'param'): NodeList<HTMLParamElement>;
  querySelectorAll(selector: 'picture'): NodeList<HTMLPictureElement>;
  querySelectorAll(selector: 'pre'): NodeList<HTMLPreElement>;
  querySelectorAll(selector: 'progress'): NodeList<HTMLProgressElement>;
  querySelectorAll(selector: 'q'): NodeList<HTMLQuoteElement>;
  querySelectorAll(selector: 'script'): NodeList<HTMLScriptElement>;
  querySelectorAll(selector: 'select'): NodeList<HTMLSelectElement>;
  querySelectorAll(selector: 'source'): NodeList<HTMLSourceElement>;
  querySelectorAll(selector: 'span'): NodeList<HTMLSpanElement>;
  querySelectorAll(selector: 'style'): NodeList<HTMLStyleElement>;
  querySelectorAll(selector: 'textarea'): NodeList<HTMLTextAreaElement>;
  querySelectorAll(selector: 'time'): NodeList<HTMLTimeElement>;
  querySelectorAll(selector: 'title'): NodeList<HTMLTitleElement>;
  querySelectorAll(selector: 'track'): NodeList<HTMLTrackElement>;
  querySelectorAll(selector: 'video'): NodeList<HTMLVideoElement>;
  querySelectorAll(selector: 'table'): NodeList<HTMLTableElement>;
  querySelectorAll(selector: 'caption'): NodeList<HTMLTableCaptionElement>;
  querySelectorAll(selector: 'thead' | 'tfoot' | 'tbody'): NodeList<HTMLTableSectionElement>;
  querySelectorAll(selector: 'tr'): NodeList<HTMLTableRowElement>;
  querySelectorAll(selector: 'td' | 'th'): NodeList<HTMLTableCellElement>;
  querySelectorAll(selector: 'template'): NodeList<HTMLTemplateElement>;
  querySelectorAll(selector: 'ul'): NodeList<HTMLUListElement>;
  querySelectorAll(selector: string): NodeList<HTMLElement>;

  // from ChildNode interface
  after(...nodes: Array<string | Node>): void;
  before(...nodes: Array<string | Node>): void;
  replaceWith(...nodes: Array<string | Node>): void;
  remove(): void;
}

declare class HTMLElement extends Element {
  blur(): void;
  click(): void;
  focus(options?: FocusOptions): void;
  getBoundingClientRect(): ClientRect;
  forceSpellcheck(): void;
  accessKey: string;
  accessKeyLabel: string;
  className: string;
  contentEditable: string;
  contextMenu: ?HTMLMenuElement;
  dataset: DOMStringMap;
  dir: 'ltr' | 'rtl' | 'auto';
  draggable: bool;
  dropzone: any;
  hidden: boolean;
  id: string;
  innerHTML: string;
  isContentEditable: boolean;
  itemProp: any;
  itemScope: bool;
  itemType: any;
  itemValue: Object;
  lang: string;
  offsetHeight: number;
  offsetLeft: number;
  offsetParent: ?Element;
  offsetTop: number;
  offsetWidth: number;
  onabort: ?Function;
  onblur: ?Function;
  oncancel: ?Function;
  oncanplay: ?Function;
  oncanplaythrough: ?Function;
  onchange: ?Function;
  onclick: ?Function;
  oncontextmenu: ?Function;
  oncuechange: ?Function;
  ondblclick: ?Function;
  ondurationchange: ?Function;
  onemptied: ?Function;
  onended: ?Function;
  onerror: ?Function;
  onfocus: ?Function;
  onfullscreenchange: ?Function;
  onfullscreenerror: ?Function;
  ongotpointercapture: ?Function,
  oninput: ?Function;
  oninvalid: ?Function;
  onkeydown: ?Function;
  onkeypress: ?Function;
  onkeyup: ?Function;
  onload: ?Function;
  onloadeddata: ?Function;
  onloadedmetadata: ?Function;
  onloadstart: ?Function;
  onlostpointercapture: ?Function,
  onmousedown: ?Function;
  onmouseenter: ?Function;
  onmouseleave: ?Function;
  onmousemove: ?Function;
  onmouseout: ?Function;
  onmouseover: ?Function;
  onmouseup: ?Function;
  onmousewheel: ?Function;
  onpause: ?Function;
  onplay: ?Function;
  onplaying: ?Function;
  onpointercancel: ?Function,
  onpointerdown: ?Function,
  onpointerenter: ?Function,
  onpointerleave: ?Function,
  onpointermove: ?Function,
  onpointerout: ?Function,
  onpointerover: ?Function,
  onpointerup: ?Function,
  onprogress: ?Function;
  onratechange: ?Function;
  onreadystatechange: ?Function;
  onreset: ?Function;
  onresize: ?Function;
  onscroll: ?Function;
  onseeked: ?Function;
  onseeking: ?Function;
  onselect: ?Function;
  onshow: ?Function;
  onstalled: ?Function;
  onsubmit: ?Function;
  onsuspend: ?Function;
  ontimeupdate: ?Function;
  ontoggle: ?Function;
  onvolumechange: ?Function;
  onwaiting: ?Function;
  properties: any;
  spellcheck: boolean;
  style: CSSStyleDeclaration;
  tabIndex: number;
  title: string;
  translate: boolean;
}

declare class HTMLSlotElement extends HTMLElement {
  name: string;
  assignedNodes(options?: { flatten: boolean, ... }): Node[];
}

declare class HTMLTableElement extends HTMLElement {
  caption: HTMLTableCaptionElement;
  tHead: HTMLTableSectionElement;
  tFoot: HTMLTableSectionElement;
  tBodies: HTMLCollection<HTMLTableSectionElement>;
  rows: HTMLCollection<HTMLTableRowElement>;
  createTHead(): HTMLTableSectionElement;
  deleteTHead(): void;
  createTFoot(): HTMLTableSectionElement;
  deleteTFoot(): void;
  createCaption(): HTMLTableCaptionElement;
  deleteCaption(): void;
  insertRow(index: ?number): HTMLTableRowElement;
  deleteRow(index: number): void;
}

declare class HTMLTableCaptionElement extends HTMLElement {

}

declare class HTMLTableSectionElement extends HTMLElement {
  rows: HTMLCollection<HTMLTableRowElement>;
}

declare class HTMLTableCellElement extends HTMLElement {
  colSpan: number;
  rowSpan: number;
  cellIndex: number;
}

declare class HTMLTableRowElement extends HTMLElement {
  align: 'left' | 'right' | 'center';
  rowIndex: number;
  +cells: HTMLCollection<HTMLTableCellElement>;
  deleteCell(index: number): void;
  insertCell(index: number): HTMLTableCellElement;
}

declare class HTMLMenuElement extends HTMLElement {
  getCompact(): bool;
  setCompact(compact: bool): void;
}

declare class HTMLBaseElement extends HTMLElement {
  href: string;
  target: string;
}

declare class HTMLTemplateElement extends HTMLElement {
  content: DocumentFragment;
}

declare class CanvasGradient {
  addColorStop(offset: number, color: string): void;
}

declare class CanvasPattern {
  setTransform(matrix: SVGMatrix): void;
}

declare class ImageBitmap {
  close(): void;
  width: number;
  height: number;
}

type CanvasFillRule = string;

type CanvasImageSource = HTMLImageElement | HTMLVideoElement | HTMLCanvasElement | CanvasRenderingContext2D | ImageBitmap;

declare class HitRegionOptions {
  path?: Path2D,
  fillRule?: CanvasFillRule,
  id?: string,
  parentID?: string;
  cursor?: string;
  control?: Element;
  label: ?string;
  role: ?string;
};

declare class CanvasDrawingStyles {
  lineWidth: number;
  lineCap: string;
  lineJoin: string;
  miterLimit: number;

  // dashed lines
  setLineDash(segments: Array<number>): void;
  getLineDash(): Array<number>;
  lineDashOffset: number;

  // text
  font: string;
  textAlign: string;
  textBaseline: string;
  direction: string;
};

declare class SVGMatrix {
  getComponent(index: number): number;
  mMultiply(secondMatrix: SVGMatrix): SVGMatrix;
  inverse(): SVGMatrix;
  mTranslate(x: number, y: number): SVGMatrix;
  mScale(scaleFactor: number): SVGMatrix;
  mRotate(angle: number): SVGMatrix;
};

declare class TextMetrics {
  // x-direction
  width: number;
  actualBoundingBoxLeft: number;
  actualBoundingBoxRight: number;

  // y-direction
  fontBoundingBoxAscent: number;
  fontBoundingBoxDescent: number;
  actualBoundingBoxAscent: number;
  actualBoundingBoxDescent: number;
  emHeightAscent: number;
  emHeightDescent: number;
  hangingBaseline: number;
  alphabeticBaseline: number;
  ideographicBaseline: number;
};

declare class Path2D {
  constructor(path?: Path2D | string): void;

  addPath(path: Path2D, transformation?: ?SVGMatrix): void;
  addPathByStrokingPath(path: Path2D, styles: CanvasDrawingStyles, transformation?: ?SVGMatrix): void;
  addText(text: string, styles: CanvasDrawingStyles, transformation: ?SVGMatrix, x: number, y: number, maxWidth?: number): void;
  addPathByStrokingText(text: string, styles: CanvasDrawingStyles, transformation: ?SVGMatrix, x: number, y: number, maxWidth?: number): void;
  addText(text: string, styles: CanvasDrawingStyles, transformation: ?SVGMatrix, path: Path2D, maxWidth?: number): void;
  addPathByStrokingText(text: string, styles: CanvasDrawingStyles, transformation: ?SVGMatrix, path: Path2D, maxWidth?: number): void;

  // CanvasPathMethods
  // shared path API methods
  arc(x: number, y: number, radius: number, startAngle: number, endAngle: number, anticlockwise?: boolean): void;
  arcTo(x1: number, y1: number, x2: number, y2: number, radius: number, _: void, _: void): void;
  arcTo(x1: number, y1: number, x2: number, y2: number, radiusX: number, radiusY: number, rotation: number): void;
  bezierCurveTo(cp1x: number, cp1y: number, cp2x: number, cp2y: number, x: number, y: number): void;
  closePath(): void;
  ellipse(x: number, y: number, radiusX: number, radiusY: number, rotation: number, startAngle: number, endAngle: number, anticlockwise?: boolean): void;
  lineTo(x: number, y: number): void;
  moveTo(x: number, y: number): void;
  quadraticCurveTo(cpx: number, cpy: number, x: number, y: number): void;
  rect(x: number, y: number, w: number, h: number): void;
};

declare class ImageData {
  width: number;
  height: number;
  data: Uint8ClampedArray;

  // constructor methods are used in Worker where CanvasRenderingContext2D
  //  is unavailable.
  // https://html.spec.whatwg.org/multipage/scripting.html#dom-imagedata
  constructor(data: Uint8ClampedArray, width: number, height: number): void;
  constructor(width: number, height: number): void;
};

declare class CanvasRenderingContext2D {
  canvas: HTMLCanvasElement;

  // canvas dimensions
  width: number;
  height: number;

  // for contexts that aren't directly fixed to a specific canvas
  commit(): void;

  // state
  save(): void;
  restore(): void;

  // transformations
  currentTransform: SVGMatrix;
  scale(x: number, y: number): void;
  rotate(angle: number): void;
  translate(x: number, y: number): void;
  transform(a: number, b: number, c: number, d: number, e: number, f: number): void;
  setTransform(a: number, b: number, c: number, d: number, e: number, f: number): void;
  resetTransform(): void;

  // compositing
  globalAlpha: number;
  globalCompositeOperation: string;

  // image smoothing
  imageSmoothingEnabled: boolean;
  imageSmoothingQuality: 'low' | 'medium' | 'high';

  // filters
  filter: string;

  // colours and styles
  strokeStyle: string | CanvasGradient | CanvasPattern;
  fillStyle: string | CanvasGradient | CanvasPattern;
  createLinearGradient(x0: number, y0: number, x1: number, y1: number): CanvasGradient;
  createRadialGradient(x0: number, y0: number, r0: number, x1: number, y1: number, r1: number): CanvasGradient;
  createPattern(image: CanvasImageSource, repetition: ?string): CanvasPattern;

  // shadows
  shadowOffsetX: number;
  shadowOffsetY: number;
  shadowBlur: number;
  shadowColor: string;

  // rects
  clearRect(x: number, y: number, w: number, h: number): void;
  fillRect(x: number, y: number, w: number, h: number): void;
  strokeRect(x: number, y: number, w: number, h: number): void;

  // path API
  beginPath(): void;
  fill(fillRule?: CanvasFillRule): void;
  fill(path: Path2D, fillRule?: CanvasFillRule): void;
  stroke(): void;
  stroke(path: Path2D): void;
  drawFocusIfNeeded(element: Element): void;
  drawFocusIfNeeded(path: Path2D, element: Element): void;
  scrollPathIntoView(): void;
  scrollPathIntoView(path: Path2D): void;
  clip(fillRule?: CanvasFillRule): void;
  clip(path: Path2D, fillRule?: CanvasFillRule): void;
  resetClip(): void;
  isPointInPath(x: number, y: number, fillRule?: CanvasFillRule): boolean;
  isPointInPath(path: Path2D, x: number, y: number, fillRule?: CanvasFillRule): boolean;
  isPointInStroke(x: number, y: number): boolean;
  isPointInStroke(path: Path2D, x: number, y: number): boolean;

  // text (see also the CanvasDrawingStyles interface)
  fillText(text: string, x: number, y: number, maxWidth?: number): void;
  strokeText(text: string, x: number, y: number, maxWidth?: number): void;
  measureText(text: string): TextMetrics;

  // drawing images
  drawImage(image: CanvasImageSource, dx: number, dy: number): void;
  drawImage(image: CanvasImageSource, dx: number, dy: number, dw: number, dh: number): void;
  drawImage(image: CanvasImageSource, sx: number, sy: number, sw: number, sh: number, dx: number, dy: number, dw: number, dh: number): void;

  // hit regions
  addHitRegion(options?: HitRegionOptions): void;
  removeHitRegion(id: string): void;
  clearHitRegions(): void;

  // pixel manipulation
  createImageData(sw: number, sh: number): ImageData;
  createImageData(imagedata: ImageData): ImageData;
  getImageData(sx: number, sy: number, sw: number, sh: number): ImageData;
  putImageData(imagedata: ImageData, dx: number, dy: number): void;
  putImageData(imagedata: ImageData, dx: number, dy: number, dirtyX: number, dirtyY: number, dirtyWidth: number, dirtyHeight: number): void;

  // CanvasDrawingStyles
  // line caps/joins
  lineWidth: number;
  lineCap: string;
  lineJoin: string;
  miterLimit: number;

  // dashed lines
  setLineDash(segments: Array<number>): void;
  getLineDash(): Array<number>;
  lineDashOffset: number;

  // text
  font: string;
  textAlign: string;
  textBaseline: string;
  direction: string;

  // CanvasPathMethods
  // shared path API methods
  closePath(): void;
  moveTo(x: number, y: number): void;
  lineTo(x: number, y: number): void;
  quadraticCurveTo(cpx: number, cpy: number, x: number, y: number): void;
  bezierCurveTo(cp1x: number, cp1y: number, cp2x: number, cp2y: number, x: number, y: number): void;
  arcTo(x1: number, y1: number, x2: number, y2: number, radius: number): void;
  arcTo(x1: number, y1: number, x2: number, y2: number, radiusX: number, radiusY: number, rotation: number): void;
  rect(x: number, y: number, w: number, h: number): void;
  arc(x: number, y: number, radius: number, startAngle: number, endAngle: number, anticlockwise?: boolean): void;
  ellipse(x: number, y: number, radiusX: number, radiusY: number, rotation: number, startAngle: number, endAngle: number, anticlockwise?: boolean): void;
}


// WebGL idl: https://www.khronos.org/registry/webgl/specs/latest/1.0/webgl.idl

type WebGLContextAttributes = {
       alpha: bool,
       depth: bool,
       stencil: bool,
       antialias: bool,
       premultipliedAlpha: bool,
       preserveDrawingBuffer: bool,
       preferLowPowerToHighPerformance: bool,
       failIfMajorPerformanceCaveat: bool,
       ...
};

interface WebGLObject {
};

interface WebGLBuffer extends WebGLObject {
};

interface WebGLFramebuffer extends WebGLObject {
};

interface WebGLProgram extends WebGLObject {
};

interface WebGLRenderbuffer extends WebGLObject {
};

interface WebGLShader extends WebGLObject {
};

interface WebGLTexture extends WebGLObject {
};

interface WebGLUniformLocation {
};

interface WebGLActiveInfo {
    size: number;
    type: number;
    name: string;
};

interface WebGLShaderPrecisionFormat {
  rangeMin: number;
  rangeMax: number;
  precision: number;
};

type BufferDataSource = ArrayBuffer | $ArrayBufferView;

type TexImageSource =
  ImageBitmap |
  ImageData |
  HTMLImageElement |
  HTMLCanvasElement |
  HTMLVideoElement;

type VertexAttribFVSource =
  Float32Array |
  Array<number>;

/* flow */
declare class WebGLRenderingContext {
  static DEPTH_BUFFER_BIT               : 0x00000100;
         DEPTH_BUFFER_BIT               : 0x00000100;
  static STENCIL_BUFFER_BIT             : 0x00000400;
         STENCIL_BUFFER_BIT             : 0x00000400;
  static COLOR_BUFFER_BIT               : 0x00004000;
         COLOR_BUFFER_BIT               : 0x00004000;
  static POINTS                         : 0x0000;
         POINTS                         : 0x0000;
  static LINES                          : 0x0001;
         LINES                          : 0x0001;
  static LINE_LOOP                      : 0x0002;
         LINE_LOOP                      : 0x0002;
  static LINE_STRIP                     : 0x0003;
         LINE_STRIP                     : 0x0003;
  static TRIANGLES                      : 0x0004;
         TRIANGLES                      : 0x0004;
  static TRIANGLE_STRIP                 : 0x0005;
         TRIANGLE_STRIP                 : 0x0005;
  static TRIANGLE_FAN                   : 0x0006;
         TRIANGLE_FAN                   : 0x0006;
  static ZERO                           : 0;
         ZERO                           : 0;
  static ONE                            : 1;
         ONE                            : 1;
  static SRC_COLOR                      : 0x0300;
         SRC_COLOR                      : 0x0300;
  static ONE_MINUS_SRC_COLOR            : 0x0301;
         ONE_MINUS_SRC_COLOR            : 0x0301;
  static SRC_ALPHA                      : 0x0302;
         SRC_ALPHA                      : 0x0302;
  static ONE_MINUS_SRC_ALPHA            : 0x0303;
         ONE_MINUS_SRC_ALPHA            : 0x0303;
  static DST_ALPHA                      : 0x0304;
         DST_ALPHA                      : 0x0304;
  static ONE_MINUS_DST_ALPHA            : 0x0305;
         ONE_MINUS_DST_ALPHA            : 0x0305;
  static DST_COLOR                      : 0x0306;
         DST_COLOR                      : 0x0306;
  static ONE_MINUS_DST_COLOR            : 0x0307;
         ONE_MINUS_DST_COLOR            : 0x0307;
  static SRC_ALPHA_SATURATE             : 0x0308;
         SRC_ALPHA_SATURATE             : 0x0308;
  static FUNC_ADD                       : 0x8006;
         FUNC_ADD                       : 0x8006;
  static BLEND_EQUATION                 : 0x8009;
         BLEND_EQUATION                 : 0x8009;
  static BLEND_EQUATION_RGB             : 0x8009;
         BLEND_EQUATION_RGB             : 0x8009;
  static BLEND_EQUATION_ALPHA           : 0x883D;
         BLEND_EQUATION_ALPHA           : 0x883D;
  static FUNC_SUBTRACT                  : 0x800A;
         FUNC_SUBTRACT                  : 0x800A;
  static FUNC_REVERSE_SUBTRACT          : 0x800B;
         FUNC_REVERSE_SUBTRACT          : 0x800B;
  static BLEND_DST_RGB                  : 0x80C8;
         BLEND_DST_RGB                  : 0x80C8;
  static BLEND_SRC_RGB                  : 0x80C9;
         BLEND_SRC_RGB                  : 0x80C9;
  static BLEND_DST_ALPHA                : 0x80CA;
         BLEND_DST_ALPHA                : 0x80CA;
  static BLEND_SRC_ALPHA                : 0x80CB;
         BLEND_SRC_ALPHA                : 0x80CB;
  static CONSTANT_COLOR                 : 0x8001;
         CONSTANT_COLOR                 : 0x8001;
  static ONE_MINUS_CONSTANT_COLOR       : 0x8002;
         ONE_MINUS_CONSTANT_COLOR       : 0x8002;
  static CONSTANT_ALPHA                 : 0x8003;
         CONSTANT_ALPHA                 : 0x8003;
  static ONE_MINUS_CONSTANT_ALPHA       : 0x8004;
         ONE_MINUS_CONSTANT_ALPHA       : 0x8004;
  static BLEND_COLOR                    : 0x8005;
         BLEND_COLOR                    : 0x8005;
  static ARRAY_BUFFER                   : 0x8892;
         ARRAY_BUFFER                   : 0x8892;
  static ELEMENT_ARRAY_BUFFER           : 0x8893;
         ELEMENT_ARRAY_BUFFER           : 0x8893;
  static ARRAY_BUFFER_BINDING           : 0x8894;
         ARRAY_BUFFER_BINDING           : 0x8894;
  static ELEMENT_ARRAY_BUFFER_BINDING   : 0x8895;
         ELEMENT_ARRAY_BUFFER_BINDING   : 0x8895;
  static STREAM_DRAW                    : 0x88E0;
         STREAM_DRAW                    : 0x88E0;
  static STATIC_DRAW                    : 0x88E4;
         STATIC_DRAW                    : 0x88E4;
  static DYNAMIC_DRAW                   : 0x88E8;
         DYNAMIC_DRAW                   : 0x88E8;
  static BUFFER_SIZE                    : 0x8764;
         BUFFER_SIZE                    : 0x8764;
  static BUFFER_USAGE                   : 0x8765;
         BUFFER_USAGE                   : 0x8765;
  static CURRENT_VERTEX_ATTRIB          : 0x8626;
         CURRENT_VERTEX_ATTRIB          : 0x8626;
  static FRONT                          : 0x0404;
         FRONT                          : 0x0404;
  static BACK                           : 0x0405;
         BACK                           : 0x0405;
  static FRONT_AND_BACK                 : 0x0408;
         FRONT_AND_BACK                 : 0x0408;
  static CULL_FACE                      : 0x0B44;
         CULL_FACE                      : 0x0B44;
  static BLEND                          : 0x0BE2;
         BLEND                          : 0x0BE2;
  static DITHER                         : 0x0BD0;
         DITHER                         : 0x0BD0;
  static STENCIL_TEST                   : 0x0B90;
         STENCIL_TEST                   : 0x0B90;
  static DEPTH_TEST                     : 0x0B71;
         DEPTH_TEST                     : 0x0B71;
  static SCISSOR_TEST                   : 0x0C11;
         SCISSOR_TEST                   : 0x0C11;
  static POLYGON_OFFSET_FILL            : 0x8037;
         POLYGON_OFFSET_FILL            : 0x8037;
  static SAMPLE_ALPHA_TO_COVERAGE       : 0x809E;
         SAMPLE_ALPHA_TO_COVERAGE       : 0x809E;
  static SAMPLE_COVERAGE                : 0x80A0;
         SAMPLE_COVERAGE                : 0x80A0;
  static NO_ERROR                       : 0;
         NO_ERROR                       : 0;
  static INVALID_ENUM                   : 0x0500;
         INVALID_ENUM                   : 0x0500;
  static INVALID_VALUE                  : 0x0501;
         INVALID_VALUE                  : 0x0501;
  static INVALID_OPERATION              : 0x0502;
         INVALID_OPERATION              : 0x0502;
  static OUT_OF_MEMORY                  : 0x0505;
         OUT_OF_MEMORY                  : 0x0505;
  static CW                             : 0x0900;
         CW                             : 0x0900;
  static CCW                            : 0x0901;
         CCW                            : 0x0901;
  static LINE_WIDTH                     : 0x0B21;
         LINE_WIDTH                     : 0x0B21;
  static ALIASED_POINT_SIZE_RANGE       : 0x846D;
         ALIASED_POINT_SIZE_RANGE       : 0x846D;
  static ALIASED_LINE_WIDTH_RANGE       : 0x846E;
         ALIASED_LINE_WIDTH_RANGE       : 0x846E;
  static CULL_FACE_MODE                 : 0x0B45;
         CULL_FACE_MODE                 : 0x0B45;
  static FRONT_FACE                     : 0x0B46;
         FRONT_FACE                     : 0x0B46;
  static DEPTH_RANGE                    : 0x0B70;
         DEPTH_RANGE                    : 0x0B70;
  static DEPTH_WRITEMASK                : 0x0B72;
         DEPTH_WRITEMASK                : 0x0B72;
  static DEPTH_CLEAR_VALUE              : 0x0B73;
         DEPTH_CLEAR_VALUE              : 0x0B73;
  static DEPTH_FUNC                     : 0x0B74;
         DEPTH_FUNC                     : 0x0B74;
  static STENCIL_CLEAR_VALUE            : 0x0B91;
         STENCIL_CLEAR_VALUE            : 0x0B91;
  static STENCIL_FUNC                   : 0x0B92;
         STENCIL_FUNC                   : 0x0B92;
  static STENCIL_FAIL                   : 0x0B94;
         STENCIL_FAIL                   : 0x0B94;
  static STENCIL_PASS_DEPTH_FAIL        : 0x0B95;
         STENCIL_PASS_DEPTH_FAIL        : 0x0B95;
  static STENCIL_PASS_DEPTH_PASS        : 0x0B96;
         STENCIL_PASS_DEPTH_PASS        : 0x0B96;
  static STENCIL_REF                    : 0x0B97;
         STENCIL_REF                    : 0x0B97;
  static STENCIL_VALUE_MASK             : 0x0B93;
         STENCIL_VALUE_MASK             : 0x0B93;
  static STENCIL_WRITEMASK              : 0x0B98;
         STENCIL_WRITEMASK              : 0x0B98;
  static STENCIL_BACK_FUNC              : 0x8800;
         STENCIL_BACK_FUNC              : 0x8800;
  static STENCIL_BACK_FAIL              : 0x8801;
         STENCIL_BACK_FAIL              : 0x8801;
  static STENCIL_BACK_PASS_DEPTH_FAIL   : 0x8802;
         STENCIL_BACK_PASS_DEPTH_FAIL   : 0x8802;
  static STENCIL_BACK_PASS_DEPTH_PASS   : 0x8803;
         STENCIL_BACK_PASS_DEPTH_PASS   : 0x8803;
  static STENCIL_BACK_REF               : 0x8CA3;
         STENCIL_BACK_REF               : 0x8CA3;
  static STENCIL_BACK_VALUE_MASK        : 0x8CA4;
         STENCIL_BACK_VALUE_MASK        : 0x8CA4;
  static STENCIL_BACK_WRITEMASK         : 0x8CA5;
         STENCIL_BACK_WRITEMASK         : 0x8CA5;
  static VIEWPORT                       : 0x0BA2;
         VIEWPORT                       : 0x0BA2;
  static SCISSOR_BOX                    : 0x0C10;
         SCISSOR_BOX                    : 0x0C10;
  static COLOR_CLEAR_VALUE              : 0x0C22;
         COLOR_CLEAR_VALUE              : 0x0C22;
  static COLOR_WRITEMASK                : 0x0C23;
         COLOR_WRITEMASK                : 0x0C23;
  static UNPACK_ALIGNMENT               : 0x0CF5;
         UNPACK_ALIGNMENT               : 0x0CF5;
  static PACK_ALIGNMENT                 : 0x0D05;
         PACK_ALIGNMENT                 : 0x0D05;
  static MAX_TEXTURE_SIZE               : 0x0D33;
         MAX_TEXTURE_SIZE               : 0x0D33;
  static MAX_VIEWPORT_DIMS              : 0x0D3A;
         MAX_VIEWPORT_DIMS              : 0x0D3A;
  static SUBPIXEL_BITS                  : 0x0D50;
         SUBPIXEL_BITS                  : 0x0D50;
  static RED_BITS                       : 0x0D52;
         RED_BITS                       : 0x0D52;
  static GREEN_BITS                     : 0x0D53;
         GREEN_BITS                     : 0x0D53;
  static BLUE_BITS                      : 0x0D54;
         BLUE_BITS                      : 0x0D54;
  static ALPHA_BITS                     : 0x0D55;
         ALPHA_BITS                     : 0x0D55;
  static DEPTH_BITS                     : 0x0D56;
         DEPTH_BITS                     : 0x0D56;
  static STENCIL_BITS                   : 0x0D57;
         STENCIL_BITS                   : 0x0D57;
  static POLYGON_OFFSET_UNITS           : 0x2A00;
         POLYGON_OFFSET_UNITS           : 0x2A00;
  static POLYGON_OFFSET_FACTOR          : 0x8038;
         POLYGON_OFFSET_FACTOR          : 0x8038;
  static TEXTURE_BINDING_2D             : 0x8069;
         TEXTURE_BINDING_2D             : 0x8069;
  static SAMPLE_BUFFERS                 : 0x80A8;
         SAMPLE_BUFFERS                 : 0x80A8;
  static SAMPLES                        : 0x80A9;
         SAMPLES                        : 0x80A9;
  static SAMPLE_COVERAGE_VALUE          : 0x80AA;
         SAMPLE_COVERAGE_VALUE          : 0x80AA;
  static SAMPLE_COVERAGE_INVERT         : 0x80AB;
         SAMPLE_COVERAGE_INVERT         : 0x80AB;
  static COMPRESSED_TEXTURE_FORMATS     : 0x86A3;
         COMPRESSED_TEXTURE_FORMATS     : 0x86A3;
  static DONT_CARE                      : 0x1100;
         DONT_CARE                      : 0x1100;
  static FASTEST                        : 0x1101;
         FASTEST                        : 0x1101;
  static NICEST                         : 0x1102;
         NICEST                         : 0x1102;
  static GENERATE_MIPMAP_HINT            : 0x8192;
         GENERATE_MIPMAP_HINT            : 0x8192;
  static BYTE                           : 0x1400;
         BYTE                           : 0x1400;
  static UNSIGNED_BYTE                  : 0x1401;
         UNSIGNED_BYTE                  : 0x1401;
  static SHORT                          : 0x1402;
         SHORT                          : 0x1402;
  static UNSIGNED_SHORT                 : 0x1403;
         UNSIGNED_SHORT                 : 0x1403;
  static INT                            : 0x1404;
         INT                            : 0x1404;
  static UNSIGNED_INT                   : 0x1405;
         UNSIGNED_INT                   : 0x1405;
  static FLOAT                          : 0x1406;
         FLOAT                          : 0x1406;
  static DEPTH_COMPONENT                : 0x1902;
         DEPTH_COMPONENT                : 0x1902;
  static ALPHA                          : 0x1906;
         ALPHA                          : 0x1906;
  static RGB                            : 0x1907;
         RGB                            : 0x1907;
  static RGBA                           : 0x1908;
         RGBA                           : 0x1908;
  static LUMINANCE                      : 0x1909;
         LUMINANCE                      : 0x1909;
  static LUMINANCE_ALPHA                : 0x190A;
         LUMINANCE_ALPHA                : 0x190A;
  static UNSIGNED_SHORT_4_4_4_4         : 0x8033;
         UNSIGNED_SHORT_4_4_4_4         : 0x8033;
  static UNSIGNED_SHORT_5_5_5_1         : 0x8034;
         UNSIGNED_SHORT_5_5_5_1         : 0x8034;
  static UNSIGNED_SHORT_5_6_5           : 0x8363;
         UNSIGNED_SHORT_5_6_5           : 0x8363;
  static FRAGMENT_SHADER                  : 0x8B30;
         FRAGMENT_SHADER                  : 0x8B30;
  static VERTEX_SHADER                    : 0x8B31;
         VERTEX_SHADER                    : 0x8B31;
  static MAX_VERTEX_ATTRIBS               : 0x8869;
         MAX_VERTEX_ATTRIBS               : 0x8869;
  static MAX_VERTEX_UNIFORM_VECTORS       : 0x8DFB;
         MAX_VERTEX_UNIFORM_VECTORS       : 0x8DFB;
  static MAX_VARYING_VECTORS              : 0x8DFC;
         MAX_VARYING_VECTORS              : 0x8DFC;
  static MAX_COMBINED_TEXTURE_IMAGE_UNITS : 0x8B4D;
         MAX_COMBINED_TEXTURE_IMAGE_UNITS : 0x8B4D;
  static MAX_VERTEX_TEXTURE_IMAGE_UNITS   : 0x8B4C;
         MAX_VERTEX_TEXTURE_IMAGE_UNITS   : 0x8B4C;
  static MAX_TEXTURE_IMAGE_UNITS          : 0x8872;
         MAX_TEXTURE_IMAGE_UNITS          : 0x8872;
  static MAX_FRAGMENT_UNIFORM_VECTORS     : 0x8DFD;
         MAX_FRAGMENT_UNIFORM_VECTORS     : 0x8DFD;
  static SHADER_TYPE                      : 0x8B4F;
         SHADER_TYPE                      : 0x8B4F;
  static DELETE_STATUS                    : 0x8B80;
         DELETE_STATUS                    : 0x8B80;
  static LINK_STATUS                      : 0x8B82;
         LINK_STATUS                      : 0x8B82;
  static VALIDATE_STATUS                  : 0x8B83;
         VALIDATE_STATUS                  : 0x8B83;
  static ATTACHED_SHADERS                 : 0x8B85;
         ATTACHED_SHADERS                 : 0x8B85;
  static ACTIVE_UNIFORMS                  : 0x8B86;
         ACTIVE_UNIFORMS                  : 0x8B86;
  static ACTIVE_ATTRIBUTES                : 0x8B89;
         ACTIVE_ATTRIBUTES                : 0x8B89;
  static SHADING_LANGUAGE_VERSION         : 0x8B8C;
         SHADING_LANGUAGE_VERSION         : 0x8B8C;
  static CURRENT_PROGRAM                  : 0x8B8D;
         CURRENT_PROGRAM                  : 0x8B8D;
  static NEVER                          : 0x0200;
         NEVER                          : 0x0200;
  static LESS                           : 0x0201;
         LESS                           : 0x0201;
  static EQUAL                          : 0x0202;
         EQUAL                          : 0x0202;
  static LEQUAL                         : 0x0203;
         LEQUAL                         : 0x0203;
  static GREATER                        : 0x0204;
         GREATER                        : 0x0204;
  static NOTEQUAL                       : 0x0205;
         NOTEQUAL                       : 0x0205;
  static GEQUAL                         : 0x0206;
         GEQUAL                         : 0x0206;
  static ALWAYS                         : 0x0207;
         ALWAYS                         : 0x0207;
  static KEEP                           : 0x1E00;
         KEEP                           : 0x1E00;
  static REPLACE                        : 0x1E01;
         REPLACE                        : 0x1E01;
  static INCR                           : 0x1E02;
         INCR                           : 0x1E02;
  static DECR                           : 0x1E03;
         DECR                           : 0x1E03;
  static INVERT                         : 0x150A;
         INVERT                         : 0x150A;
  static INCR_WRAP                      : 0x8507;
         INCR_WRAP                      : 0x8507;
  static DECR_WRAP                      : 0x8508;
         DECR_WRAP                      : 0x8508;
  static VENDOR                         : 0x1F00;
         VENDOR                         : 0x1F00;
  static RENDERER                       : 0x1F01;
         RENDERER                       : 0x1F01;
  static VERSION                        : 0x1F02;
         VERSION                        : 0x1F02;
  static NEAREST                        : 0x2600;
         NEAREST                        : 0x2600;
  static LINEAR                         : 0x2601;
         LINEAR                         : 0x2601;
  static NEAREST_MIPMAP_NEAREST         : 0x2700;
         NEAREST_MIPMAP_NEAREST         : 0x2700;
  static LINEAR_MIPMAP_NEAREST          : 0x2701;
         LINEAR_MIPMAP_NEAREST          : 0x2701;
  static NEAREST_MIPMAP_LINEAR          : 0x2702;
         NEAREST_MIPMAP_LINEAR          : 0x2702;
  static LINEAR_MIPMAP_LINEAR           : 0x2703;
         LINEAR_MIPMAP_LINEAR           : 0x2703;
  static TEXTURE_MAG_FILTER             : 0x2800;
         TEXTURE_MAG_FILTER             : 0x2800;
  static TEXTURE_MIN_FILTER             : 0x2801;
         TEXTURE_MIN_FILTER             : 0x2801;
  static TEXTURE_WRAP_S                 : 0x2802;
         TEXTURE_WRAP_S                 : 0x2802;
  static TEXTURE_WRAP_T                 : 0x2803;
         TEXTURE_WRAP_T                 : 0x2803;
  static TEXTURE_2D                     : 0x0DE1;
         TEXTURE_2D                     : 0x0DE1;
  static TEXTURE                        : 0x1702;
         TEXTURE                        : 0x1702;
  static TEXTURE_CUBE_MAP               : 0x8513;
         TEXTURE_CUBE_MAP               : 0x8513;
  static TEXTURE_BINDING_CUBE_MAP       : 0x8514;
         TEXTURE_BINDING_CUBE_MAP       : 0x8514;
  static TEXTURE_CUBE_MAP_POSITIVE_X    : 0x8515;
         TEXTURE_CUBE_MAP_POSITIVE_X    : 0x8515;
  static TEXTURE_CUBE_MAP_NEGATIVE_X    : 0x8516;
         TEXTURE_CUBE_MAP_NEGATIVE_X    : 0x8516;
  static TEXTURE_CUBE_MAP_POSITIVE_Y    : 0x8517;
         TEXTURE_CUBE_MAP_POSITIVE_Y    : 0x8517;
  static TEXTURE_CUBE_MAP_NEGATIVE_Y    : 0x8518;
         TEXTURE_CUBE_MAP_NEGATIVE_Y    : 0x8518;
  static TEXTURE_CUBE_MAP_POSITIVE_Z    : 0x8519;
         TEXTURE_CUBE_MAP_POSITIVE_Z    : 0x8519;
  static TEXTURE_CUBE_MAP_NEGATIVE_Z    : 0x851A;
         TEXTURE_CUBE_MAP_NEGATIVE_Z    : 0x851A;
  static MAX_CUBE_MAP_TEXTURE_SIZE      : 0x851C;
         MAX_CUBE_MAP_TEXTURE_SIZE      : 0x851C;
  static TEXTURE0                       : 0x84C0;
         TEXTURE0                       : 0x84C0;
  static TEXTURE1                       : 0x84C1;
         TEXTURE1                       : 0x84C1;
  static TEXTURE2                       : 0x84C2;
         TEXTURE2                       : 0x84C2;
  static TEXTURE3                       : 0x84C3;
         TEXTURE3                       : 0x84C3;
  static TEXTURE4                       : 0x84C4;
         TEXTURE4                       : 0x84C4;
  static TEXTURE5                       : 0x84C5;
         TEXTURE5                       : 0x84C5;
  static TEXTURE6                       : 0x84C6;
         TEXTURE6                       : 0x84C6;
  static TEXTURE7                       : 0x84C7;
         TEXTURE7                       : 0x84C7;
  static TEXTURE8                       : 0x84C8;
         TEXTURE8                       : 0x84C8;
  static TEXTURE9                       : 0x84C9;
         TEXTURE9                       : 0x84C9;
  static TEXTURE10                      : 0x84CA;
         TEXTURE10                      : 0x84CA;
  static TEXTURE11                      : 0x84CB;
         TEXTURE11                      : 0x84CB;
  static TEXTURE12                      : 0x84CC;
         TEXTURE12                      : 0x84CC;
  static TEXTURE13                      : 0x84CD;
         TEXTURE13                      : 0x84CD;
  static TEXTURE14                      : 0x84CE;
         TEXTURE14                      : 0x84CE;
  static TEXTURE15                      : 0x84CF;
         TEXTURE15                      : 0x84CF;
  static TEXTURE16                      : 0x84D0;
         TEXTURE16                      : 0x84D0;
  static TEXTURE17                      : 0x84D1;
         TEXTURE17                      : 0x84D1;
  static TEXTURE18                      : 0x84D2;
         TEXTURE18                      : 0x84D2;
  static TEXTURE19                      : 0x84D3;
         TEXTURE19                      : 0x84D3;
  static TEXTURE20                      : 0x84D4;
         TEXTURE20                      : 0x84D4;
  static TEXTURE21                      : 0x84D5;
         TEXTURE21                      : 0x84D5;
  static TEXTURE22                      : 0x84D6;
         TEXTURE22                      : 0x84D6;
  static TEXTURE23                      : 0x84D7;
         TEXTURE23                      : 0x84D7;
  static TEXTURE24                      : 0x84D8;
         TEXTURE24                      : 0x84D8;
  static TEXTURE25                      : 0x84D9;
         TEXTURE25                      : 0x84D9;
  static TEXTURE26                      : 0x84DA;
         TEXTURE26                      : 0x84DA;
  static TEXTURE27                      : 0x84DB;
         TEXTURE27                      : 0x84DB;
  static TEXTURE28                      : 0x84DC;
         TEXTURE28                      : 0x84DC;
  static TEXTURE29                      : 0x84DD;
         TEXTURE29                      : 0x84DD;
  static TEXTURE30                      : 0x84DE;
         TEXTURE30                      : 0x84DE;
  static TEXTURE31                      : 0x84DF;
         TEXTURE31                      : 0x84DF;
  static ACTIVE_TEXTURE                 : 0x84E0;
         ACTIVE_TEXTURE                 : 0x84E0;
  static REPEAT                         : 0x2901;
         REPEAT                         : 0x2901;
  static CLAMP_TO_EDGE                  : 0x812F;
         CLAMP_TO_EDGE                  : 0x812F;
  static MIRRORED_REPEAT                : 0x8370;
         MIRRORED_REPEAT                : 0x8370;
  static FLOAT_VEC2                     : 0x8B50;
         FLOAT_VEC2                     : 0x8B50;
  static FLOAT_VEC3                     : 0x8B51;
         FLOAT_VEC3                     : 0x8B51;
  static FLOAT_VEC4                     : 0x8B52;
         FLOAT_VEC4                     : 0x8B52;
  static INT_VEC2                       : 0x8B53;
         INT_VEC2                       : 0x8B53;
  static INT_VEC3                       : 0x8B54;
         INT_VEC3                       : 0x8B54;
  static INT_VEC4                       : 0x8B55;
         INT_VEC4                       : 0x8B55;
  static BOOL                           : 0x8B56;
         BOOL                           : 0x8B56;
  static BOOL_VEC2                      : 0x8B57;
         BOOL_VEC2                      : 0x8B57;
  static BOOL_VEC3                      : 0x8B58;
         BOOL_VEC3                      : 0x8B58;
  static BOOL_VEC4                      : 0x8B59;
         BOOL_VEC4                      : 0x8B59;
  static FLOAT_MAT2                     : 0x8B5A;
         FLOAT_MAT2                     : 0x8B5A;
  static FLOAT_MAT3                     : 0x8B5B;
         FLOAT_MAT3                     : 0x8B5B;
  static FLOAT_MAT4                     : 0x8B5C;
         FLOAT_MAT4                     : 0x8B5C;
  static SAMPLER_2D                     : 0x8B5E;
         SAMPLER_2D                     : 0x8B5E;
  static SAMPLER_CUBE                   : 0x8B60;
         SAMPLER_CUBE                   : 0x8B60;
  static VERTEX_ATTRIB_ARRAY_ENABLED        : 0x8622;
         VERTEX_ATTRIB_ARRAY_ENABLED        : 0x8622;
  static VERTEX_ATTRIB_ARRAY_SIZE           : 0x8623;
         VERTEX_ATTRIB_ARRAY_SIZE           : 0x8623;
  static VERTEX_ATTRIB_ARRAY_STRIDE         : 0x8624;
         VERTEX_ATTRIB_ARRAY_STRIDE         : 0x8624;
  static VERTEX_ATTRIB_ARRAY_TYPE           : 0x8625;
         VERTEX_ATTRIB_ARRAY_TYPE           : 0x8625;
  static VERTEX_ATTRIB_ARRAY_NORMALIZED     : 0x886A;
         VERTEX_ATTRIB_ARRAY_NORMALIZED     : 0x886A;
  static VERTEX_ATTRIB_ARRAY_POINTER        : 0x8645;
         VERTEX_ATTRIB_ARRAY_POINTER        : 0x8645;
  static VERTEX_ATTRIB_ARRAY_BUFFER_BINDING : 0x889F;
         VERTEX_ATTRIB_ARRAY_BUFFER_BINDING : 0x889F;
  static IMPLEMENTATION_COLOR_READ_TYPE   : 0x8B9A;
         IMPLEMENTATION_COLOR_READ_TYPE   : 0x8B9A;
  static IMPLEMENTATION_COLOR_READ_FORMAT : 0x8B9B;
         IMPLEMENTATION_COLOR_READ_FORMAT : 0x8B9B;
  static COMPILE_STATUS                 : 0x8B81;
         COMPILE_STATUS                 : 0x8B81;
  static LOW_FLOAT                      : 0x8DF0;
         LOW_FLOAT                      : 0x8DF0;
  static MEDIUM_FLOAT                   : 0x8DF1;
         MEDIUM_FLOAT                   : 0x8DF1;
  static HIGH_FLOAT                     : 0x8DF2;
         HIGH_FLOAT                     : 0x8DF2;
  static LOW_INT                        : 0x8DF3;
         LOW_INT                        : 0x8DF3;
  static MEDIUM_INT                     : 0x8DF4;
         MEDIUM_INT                     : 0x8DF4;
  static HIGH_INT                       : 0x8DF5;
         HIGH_INT                       : 0x8DF5;
  static FRAMEBUFFER                    : 0x8D40;
         FRAMEBUFFER                    : 0x8D40;
  static RENDERBUFFER                   : 0x8D41;
         RENDERBUFFER                   : 0x8D41;
  static RGBA4                          : 0x8056;
         RGBA4                          : 0x8056;
  static RGB5_A1                        : 0x8057;
         RGB5_A1                        : 0x8057;
  static RGB565                         : 0x8D62;
         RGB565                         : 0x8D62;
  static DEPTH_COMPONENT16              : 0x81A5;
         DEPTH_COMPONENT16              : 0x81A5;
  static STENCIL_INDEX                  : 0x1901;
         STENCIL_INDEX                  : 0x1901;
  static STENCIL_INDEX8                 : 0x8D48;
         STENCIL_INDEX8                 : 0x8D48;
  static DEPTH_STENCIL                  : 0x84F9;
         DEPTH_STENCIL                  : 0x84F9;
  static RENDERBUFFER_WIDTH             : 0x8D42;
         RENDERBUFFER_WIDTH             : 0x8D42;
  static RENDERBUFFER_HEIGHT            : 0x8D43;
         RENDERBUFFER_HEIGHT            : 0x8D43;
  static RENDERBUFFER_INTERNAL_FORMAT   : 0x8D44;
         RENDERBUFFER_INTERNAL_FORMAT   : 0x8D44;
  static RENDERBUFFER_RED_SIZE          : 0x8D50;
         RENDERBUFFER_RED_SIZE          : 0x8D50;
  static RENDERBUFFER_GREEN_SIZE        : 0x8D51;
         RENDERBUFFER_GREEN_SIZE        : 0x8D51;
  static RENDERBUFFER_BLUE_SIZE         : 0x8D52;
         RENDERBUFFER_BLUE_SIZE         : 0x8D52;
  static RENDERBUFFER_ALPHA_SIZE        : 0x8D53;
         RENDERBUFFER_ALPHA_SIZE        : 0x8D53;
  static RENDERBUFFER_DEPTH_SIZE        : 0x8D54;
         RENDERBUFFER_DEPTH_SIZE        : 0x8D54;
  static RENDERBUFFER_STENCIL_SIZE      : 0x8D55;
         RENDERBUFFER_STENCIL_SIZE      : 0x8D55;
  static FRAMEBUFFER_ATTACHMENT_OBJECT_TYPE           : 0x8CD0;
         FRAMEBUFFER_ATTACHMENT_OBJECT_TYPE           : 0x8CD0;
  static FRAMEBUFFER_ATTACHMENT_OBJECT_NAME           : 0x8CD1;
         FRAMEBUFFER_ATTACHMENT_OBJECT_NAME           : 0x8CD1;
  static FRAMEBUFFER_ATTACHMENT_TEXTURE_LEVEL         : 0x8CD2;
         FRAMEBUFFER_ATTACHMENT_TEXTURE_LEVEL         : 0x8CD2;
  static FRAMEBUFFER_ATTACHMENT_TEXTURE_CUBE_MAP_FACE : 0x8CD3;
         FRAMEBUFFER_ATTACHMENT_TEXTURE_CUBE_MAP_FACE : 0x8CD3;
  static COLOR_ATTACHMENT0              : 0x8CE0;
         COLOR_ATTACHMENT0              : 0x8CE0;
  static DEPTH_ATTACHMENT               : 0x8D00;
         DEPTH_ATTACHMENT               : 0x8D00;
  static STENCIL_ATTACHMENT             : 0x8D20;
         STENCIL_ATTACHMENT             : 0x8D20;
  static DEPTH_STENCIL_ATTACHMENT       : 0x821A;
         DEPTH_STENCIL_ATTACHMENT       : 0x821A;
  static NONE                           : 0;
         NONE                           : 0;
  static FRAMEBUFFER_COMPLETE                      : 0x8CD5;
         FRAMEBUFFER_COMPLETE                      : 0x8CD5;
  static FRAMEBUFFER_INCOMPLETE_ATTACHMENT         : 0x8CD6;
         FRAMEBUFFER_INCOMPLETE_ATTACHMENT         : 0x8CD6;
  static FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT : 0x8CD7;
         FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT : 0x8CD7;
  static FRAMEBUFFER_INCOMPLETE_DIMENSIONS         : 0x8CD9;
         FRAMEBUFFER_INCOMPLETE_DIMENSIONS         : 0x8CD9;
  static FRAMEBUFFER_UNSUPPORTED                   : 0x8CDD;
         FRAMEBUFFER_UNSUPPORTED                   : 0x8CDD;
  static FRAMEBUFFER_BINDING            : 0x8CA6;
         FRAMEBUFFER_BINDING            : 0x8CA6;
  static RENDERBUFFER_BINDING           : 0x8CA7;
         RENDERBUFFER_BINDING           : 0x8CA7;
  static MAX_RENDERBUFFER_SIZE          : 0x84E8;
         MAX_RENDERBUFFER_SIZE          : 0x84E8;
  static INVALID_FRAMEBUFFER_OPERATION  : 0x0506;
         INVALID_FRAMEBUFFER_OPERATION  : 0x0506;
  static UNPACK_FLIP_Y_WEBGL            : 0x9240;
         UNPACK_FLIP_Y_WEBGL            : 0x9240;
  static UNPACK_PREMULTIPLY_ALPHA_WEBGL : 0x9241;
         UNPACK_PREMULTIPLY_ALPHA_WEBGL : 0x9241;
  static CONTEXT_LOST_WEBGL             : 0x9242;
         CONTEXT_LOST_WEBGL             : 0x9242;
  static UNPACK_COLORSPACE_CONVERSION_WEBGL : 0x9243;
         UNPACK_COLORSPACE_CONVERSION_WEBGL : 0x9243;
  static BROWSER_DEFAULT_WEBGL          : 0x9244;
         BROWSER_DEFAULT_WEBGL          : 0x9244;

  canvas: HTMLCanvasElement;
  drawingBufferWidth: number;
  drawingBufferHeight: number;

  getContextAttributes(): ?WebGLContextAttributes;
  isContextLost(): bool;

  getSupportedExtensions(): ?Array<string>;
  getExtension(name: string): any;

  activeTexture(texture: number): void;
  attachShader(program: WebGLProgram, shader: WebGLShader): void;
  bindAttribLocation(program: WebGLProgram, index: number, name: string): void;
  bindBuffer(target: number, buffer: ?WebGLBuffer): void;
  bindFramebuffer(target: number, framebuffer: ?WebGLFramebuffer): void;
  bindRenderbuffer(target: number, renderbuffer: ?WebGLRenderbuffer): void;
  bindTexture(target: number, texture: ?WebGLTexture): void;
  blendColor(red: number, green: number, blue: number, alpha: number): void;
  blendEquation(mode: number): void;
  blendEquationSeparate(modeRGB: number, modeAlpha: number): void;
  blendFunc(sfactor: number, dfactor: number): void;
  blendFuncSeparate(srcRGB: number, dstRGB: number, srcAlpha: number, dstAlpha: number): void;

  bufferData(target: number, size: number, usage: number): void;
  bufferData(target: number, data: ?ArrayBuffer, usage: number): void;
  bufferData(target: number, data: $ArrayBufferView, usage: number): void;
  bufferSubData(target: number, offset: number, data: BufferDataSource): void;

  checkFramebufferStatus(target: number): number;
  clear(mask: number): void;
  clearColor(red: number, green: number, blue: number, alpha: number): void;
  clearDepth(depth: number): void;
  clearStencil(s: number): void;
  colorMask(red: bool, green: bool, blue: bool, alpha: bool): void;
  compileShader(shader: WebGLShader): void;

  compressedTexImage2D(target: number, level: number, internalformat: number,
                       width: number, height: number, border: number,
                       data: $ArrayBufferView): void;

  compressedTexSubImage2D(target: number, level: number,
                          xoffset: number, yoffset: number,
                          width: number, height: number, format: number,
                          data: $ArrayBufferView): void;

  copyTexImage2D(target: number, level: number, internalformat: number,
                x: number, y: number, width: number, height: number,
                border: number): void;
  copyTexSubImage2D(target: number, level: number, xoffset: number, yoffset: number,
                    x: number, y: number, width: number, height: number): void;

  createBuffer(): ?WebGLBuffer;
  createFramebuffer(): ?WebGLFramebuffer;
  createProgram(): ?WebGLProgram;
  createRenderbuffer(): ?WebGLRenderbuffer;
  createShader(type: number): ?WebGLShader;
  createTexture(): ?WebGLTexture;

  cullFace(mode: number): void;

  deleteBuffer(buffer: ?WebGLBuffer): void;
  deleteFramebuffer(framebuffer: ?WebGLFramebuffer): void;
  deleteProgram(program: ?WebGLProgram): void;
  deleteRenderbuffer(renderbuffer: ?WebGLRenderbuffer): void;
  deleteShader(shader: ?WebGLShader): void;
  deleteTexture(texture: ?WebGLTexture): void;

  depthFunc(func: number): void;
  depthMask(flag: bool): void;
  depthRange(zNear: number, zFar: number): void;
  detachShader(program: WebGLProgram, shader: WebGLShader): void;
  disable(cap: number): void;
  disableVertexAttribArray(index: number): void;
  drawArrays(mode: number, first: number, count: number): void;
  drawElements(mode: number, count: number, type: number, offset: number): void;

  enable(cap: number): void;
  enableVertexAttribArray(index: number): void;
  finish(): void;
  flush(): void;
  framebufferRenderbuffer(target: number, attachment: number,
                          renderbuffertarget: number,
                          renderbuffer: ?WebGLRenderbuffer): void;
  framebufferTexture2D(target: number, attachment: number, textarget: number,
                       texture: ?WebGLTexture, level: number): void;
  frontFace(mode: number): void;

  generateMipmap(target: number): void;

  getActiveAttrib(program: WebGLProgram, index: number): ?WebGLActiveInfo;
  getActiveUniform(program: WebGLProgram, index: number): ?WebGLActiveInfo;
  getAttachedShaders(program: WebGLProgram): ?Array<WebGLShader>;

  getAttribLocation(program: WebGLProgram, name: string): number;

  getBufferParameter(target: number, pname: number): any;
  getParameter(pname: number): any;

  getError(): number;

  getFramebufferAttachmentParameter(target: number, attachment: number,
                                    pname: number): any;
  getProgramParameter(program: WebGLProgram, pname: number): any;
  getProgramInfoLog(program: WebGLProgram): ?string;
  getRenderbufferParameter(target: number, pname: number): any;
  getShaderParameter(shader: WebGLShader, pname: number): any;
  getShaderPrecisionFormat(shadertype: number, precisiontype: number): ?WebGLShaderPrecisionFormat;
  getShaderInfoLog(shader: WebGLShader): ?string;

  getShaderSource(shader: WebGLShader): ?string;

  getTexParameter(target: number, pname: number): any;

  getUniform(program: WebGLProgram, location: WebGLUniformLocation): any;

  getUniformLocation(program: WebGLProgram, name: string): ?WebGLUniformLocation;

  getVertexAttrib(index: number, pname: number): any;

  getVertexAttribOffset(index: number, pname: number): number;

  hint(target: number, mode: number): void;
  isBuffer(buffer: ?WebGLBuffer): boolean;
  isEnabled(cap: number): boolean;
  isFramebuffer(framebuffer: ?WebGLFramebuffer): boolean;
  isProgram(program: ?WebGLProgram): boolean;
  isRenderbuffer(renderbuffer: ?WebGLRenderbuffer): boolean;
  isShader(shader: ?WebGLShader): boolean;
  isTexture(texture: ?WebGLTexture): boolean;
  lineWidth(width: number): void;
  linkProgram(program: WebGLProgram): void;
  pixelStorei(pname: number, param: number): void;
  polygonOffset(factor: number, units: number): void;

  readPixels(x: number, y: number, width: number, height: number,
             format: number, type: number, pixels: ?$ArrayBufferView): void;

  renderbufferStorage(target: number, internalformat: number,
                           width: number, height: number): void;
  sampleCoverage(value: number, invert: bool): void;
  scissor(x: number, y: number, width: number, height: number): void;

  shaderSource(shader: WebGLShader, source: string): void;

  stencilFunc(func: number, ref: number, mask: number): void;
  stencilFuncSeparate(face: number, func: number, ref: number, mask: number): void;
  stencilMask(mask: number): void;
  stencilMaskSeparate(face: number, mask: number): void;
  stencilOp(fail: number, zfail: number, zpass: number): void;
  stencilOpSeparate(face: number, fail: number, zfail: number, zpass: number): void;

  texImage2D(target: number, level: number, internalformat: number,
             width: number, height: number, border: number, format: number,
             type: number, pixels: ?$ArrayBufferView): void;
  texImage2D(target: number, level: number, internalformat: number,
             format: number, type: number, source: TexImageSource): void;

  texParameterf(target: number, pname: number, param: number): void;
  texParameteri(target: number, pname: number, param: number): void;

  texSubImage2D(target: number, level: number, xoffset: number, yoffset: number,
                width: number, height: number,
                format: number, type: number, pixels: ?$ArrayBufferView): void;
  texSubImage2D(target: number, level: number, xoffset: number, yoffset: number,
                format: number, type: number, source: TexImageSource): void;

  uniform1f(location: ?WebGLUniformLocation, x: number): void;
  uniform1fv(location: ?WebGLUniformLocation, v: Float32Array): void;
  uniform1fv(location: ?WebGLUniformLocation, v: Array<number>): void;
  uniform1fv(location: ?WebGLUniformLocation, v: [number]): void;
  uniform1i(location: ?WebGLUniformLocation, x: number): void;
  uniform1iv(location: ?WebGLUniformLocation, v: Int32Array): void;
  uniform1iv(location: ?WebGLUniformLocation, v: Array<number>): void;
  uniform1iv(location: ?WebGLUniformLocation, v: [number]): void;
  uniform2f(location: ?WebGLUniformLocation, x: number, y: number): void;
  uniform2fv(location: ?WebGLUniformLocation, v: Float32Array): void;
  uniform2fv(location: ?WebGLUniformLocation, v: Array<number>): void;
  uniform2fv(location: ?WebGLUniformLocation, v: [number, number]): void;
  uniform2i(location: ?WebGLUniformLocation, x: number, y: number): void;
  uniform2iv(location: ?WebGLUniformLocation, v: Int32Array): void;
  uniform2iv(location: ?WebGLUniformLocation, v: Array<number>): void;
  uniform2iv(location: ?WebGLUniformLocation, v: [number, number]): void;
  uniform3f(location: ?WebGLUniformLocation, x: number, y: number, z: number): void;
  uniform3fv(location: ?WebGLUniformLocation, v: Float32Array): void;
  uniform3fv(location: ?WebGLUniformLocation, v: Array<number>): void;
  uniform3fv(location: ?WebGLUniformLocation, v: [number, number, number]): void;
  uniform3i(location: ?WebGLUniformLocation, x: number, y: number, z: number): void;
  uniform3iv(location: ?WebGLUniformLocation, v: Int32Array): void;
  uniform3iv(location: ?WebGLUniformLocation, v: Array<number>): void;
  uniform3iv(location: ?WebGLUniformLocation, v: [number, number, number]): void;
  uniform4f(location: ?WebGLUniformLocation, x: number, y: number, z: number, w: number): void;
  uniform4fv(location: ?WebGLUniformLocation, v: Float32Array): void;
  uniform4fv(location: ?WebGLUniformLocation, v: Array<number>): void;
  uniform4fv(location: ?WebGLUniformLocation, v: [number, number, number, number]): void;
  uniform4i(location: ?WebGLUniformLocation, x: number, y: number, z: number, w: number): void;
  uniform4iv(location: ?WebGLUniformLocation, v: Int32Array): void;
  uniform4iv(location: ?WebGLUniformLocation, v: Array<number>): void;
  uniform4iv(location: ?WebGLUniformLocation, v: [number, number, number, number]): void;

  uniformMatrix2fv(location: ?WebGLUniformLocation, transpose: bool,
                        value: Float32Array): void;
  uniformMatrix2fv(location: ?WebGLUniformLocation, transpose: bool,
                        value: Array<number>): void;
  uniformMatrix3fv(location: ?WebGLUniformLocation, transpose: bool,
                        value: Float32Array): void;
  uniformMatrix3fv(location: ?WebGLUniformLocation, transpose: bool,
                        value: Array<number>): void;
  uniformMatrix4fv(location: ?WebGLUniformLocation, transpose: bool,
                        value: Float32Array): void;
  uniformMatrix4fv(location: ?WebGLUniformLocation, transpose: bool,
                        value: Array<number>): void;

  useProgram(program: ?WebGLProgram): void;
  validateProgram(program: WebGLProgram): void;

  vertexAttrib1f(index: number, x: number): void;
  vertexAttrib1fv(index: number, values: VertexAttribFVSource): void;
  vertexAttrib2f(index: number, x: number, y: number): void;
  vertexAttrib2fv(index: number, values: VertexAttribFVSource): void;
  vertexAttrib3f(index: number, x: number, y: number, z: number): void;
  vertexAttrib3fv(index: number, values: VertexAttribFVSource): void;
  vertexAttrib4f(index: number, x: number, y: number, z: number, w: number): void;
  vertexAttrib4fv(index: number, values: VertexAttribFVSource): void;
  vertexAttribPointer(index: number, size: number, type: number,
                           normalized: bool, stride: number, offset: number): void;

  viewport(x: number, y: number, width: number, height: number): void;
};

declare class WebGLContextEvent extends Event {
  statusMessage: string;
};

// http://www.w3.org/TR/html5/scripting-1.html#renderingcontext
type RenderingContext = CanvasRenderingContext2D | WebGLRenderingContext;

// https://www.w3.org/TR/html5/scripting-1.html#htmlcanvaselement
declare class HTMLCanvasElement extends HTMLElement {
  width: number;
  height: number;
  getContext(contextId: "2d", ...args: any): CanvasRenderingContext2D;
  getContext(contextId: "webgl", contextAttributes?: $Shape<WebGLContextAttributes>): ?WebGLRenderingContext;
  // IE currently only supports "experimental-webgl"
  getContext(contextId: "experimental-webgl", contextAttributes?: $Shape<WebGLContextAttributes>): ?WebGLRenderingContext;
  getContext(contextId: string, ...args: any): ?RenderingContext; // fallback
  toDataURL(type?: string, ...args: any): string;
  toBlob(callback: (v: File) => void, type?: string, ...args: any): void;
  captureStream(frameRate?: number): CanvasCaptureMediaStream;
}

// https://html.spec.whatwg.org/multipage/forms.html#the-details-element
declare class HTMLDetailsElement extends HTMLElement {
  open: boolean;
}

declare class HTMLFormElement extends HTMLElement {
  @@iterator(): Iterator<HTMLElement>;
  [index: number | string]: HTMLElement | null;
  acceptCharset: string;
  action: string;
  elements: HTMLCollection<HTMLElement>;
  encoding: string;
  enctype: string;
  length: number;
  method: string;
  name: string;
  target: string;

  checkValidity(): boolean;
  reportValidity(): boolean;
  reset(): void;
  submit(): void;
}

// https://www.w3.org/TR/html5/forms.html#the-fieldset-element
declare class HTMLFieldSetElement extends HTMLElement {
  disabled: boolean;
  elements: HTMLCollection<HTMLElement>; // readonly
  form: HTMLFormElement | null; // readonly
  name: string;
  type: string; // readonly

  checkValidity(): boolean;
  setCustomValidity(error: string): void;
}

declare class HTMLLegendElement extends HTMLElement {
  form: HTMLFormElement | null; // readonly
}

declare class HTMLIFrameElement extends HTMLElement {
  allowFullScreen: boolean;
  contentDocument: Document;
  contentWindow: any;
  frameBorder: string;
  height: string;
  marginHeight: string;
  marginWidth: string;
  name: string;
  scrolling: string;
  sandbox: DOMTokenList;
  src: string;
  srcdoc: string;
  width: string;
}

declare class HTMLImageElement extends HTMLElement {
  alt: string;
  complete: boolean; // readonly
  crossOrigin: ?string;
  currentSrc: string; // readonly
  height: number;
  decode(): Promise<void>;
  isMap: boolean;
  naturalHeight: number; // readonly
  naturalWidth: number; // readonly
  sizes: string;
  src: string;
  srcset: string;
  useMap: string;
  width: number;
}

declare class Image extends HTMLImageElement {
  constructor(width?: number, height?: number): void;
}

declare class MediaError {
  MEDIA_ERR_ABORTED: number;
  MEDIA_ERR_NETWORK: number;
  MEDIA_ERR_DECODE: number;
  MEDIA_ERR_SRC_NOT_SUPPORTED: number;
  code: number;
  message: ?string;
}

declare class TimeRanges {
  length: number;
  start(index: number): number;
  end(index: number): number;
}
declare class Audio extends HTMLAudioElement {
  constructor(URLString?: string): void;
}

declare class AudioTrack {
  id: string;
  kind: string;
  label: string;
  language: string;
  enabled: boolean;
}

declare class AudioTrackList extends EventTarget {
  length: number;
  [index: number]: AudioTrack;

  getTrackById(id: string): ?AudioTrack;

  onchange: (ev: any) => any;
  onaddtrack: (ev: any) => any;
  onremovetrack: (ev: any) => any;
}

declare class VideoTrack {
  id: string;
  kind: string;
  label: string;
  language: string;
  selected: boolean;
}

declare class VideoTrackList extends EventTarget {
  length: number;
  [index: number]: VideoTrack;
  getTrackById(id: string): ?VideoTrack;
  selectedIndex: number;

  onchange: (ev: any) => any;
  onaddtrack: (ev: any) => any;
  onremovetrack: (ev: any) => any;
}

declare class TextTrackCue extends EventTarget {
  constructor(startTime: number, endTime: number, text: string): void;

  track: TextTrack;
  id: string;
  startTime: number;
  endTime: number;
  pauseOnExit: boolean;
  vertical: string;
  snapToLines: boolean;
  lines: number;
  position: number;
  size: number;
  align: string;
  text: string;

  getCueAsHTML(): Node;
  onenter: (ev: any) => any;
  onexit: (ev: any) => any;
}

declare class TextTrackCueList {
  @@iterator(): Iterator<TextTrackCue>;
  length: number;
  [index: number]: TextTrackCue;
  getCueById(id: string): ?TextTrackCue;
}

declare class TextTrack extends EventTarget {
  kind: string;
  label: string;
  language: string;

  mode: string;

  cues: TextTrackCueList;
  activeCues: TextTrackCueList;

  addCue(cue: TextTrackCue): void;
  removeCue(cue: TextTrackCue): void;

  oncuechange: (ev: any) => any;
}

declare class TextTrackList extends EventTarget {
  length: number;
  [index: number]: TextTrack;

  onaddtrack: (ev: any) => any;
  onremovetrack: (ev: any) => any;
}

declare class MediaKeyStatusMap<BufferDataSource, MediaKeyStatus> {
  @@iterator(): Iterator<[BufferDataSource, MediaKeyStatus]>;
  size: number;
  entries(): Iterator<[BufferDataSource, MediaKeyStatus]>;
  forEach(callbackfn: (value: MediaKeyStatus, key: BufferDataSource, map: MediaKeyStatusMap<BufferDataSource, MediaKeyStatus>) => any, thisArg?: any): void;
  get(key: BufferDataSource): MediaKeyStatus;
  has(key: BufferDataSource): boolean;
  keys(): Iterator<BufferDataSource>;
  values(): Iterator<MediaKeyStatus>;
}

declare class MediaKeySession extends EventTarget {
  sessionId: string;
  expiration: number;
  closed: Promise<void>;
  keyStatuses: MediaKeyStatusMap<BufferDataSource, MediaKeyStatus>;

  generateRequest(initDataType: string, initData: BufferDataSource): Promise<void>;
  load(sessionId: string): Promise<boolean>;
  update(response: BufferDataSource): Promise<void>;
  close(): Promise<void>;
  remove(): Promise<void>;

  onkeystatuschange: (ev: any) => any;
  onmessage: (ev: any) => any;
}

declare class MediaKeys {
  createSession(mediaKeySessionType: MediaKeySessionType): MediaKeySession;
  setServerCertificate(serverCertificate: BufferDataSource): Promise<boolean>;
}

declare class HTMLMediaElement extends HTMLElement {
  // error state
  error: ?MediaError;

  // network state
  src: string;
  srcObject: ?any;
  currentSrc: string;
  crossOrigin: ?string;
  NETWORK_EMPTY: number;
  NETWORK_IDLE: number;
  NETWORK_LOADING: number;
  NETWORK_NO_SOURCE: number;
  networkState: number;
  preload: string;
  buffered: TimeRanges;
  load(): void;
  canPlayType(type: string): string;

  // ready state
  HAVE_NOTHING: number;
  HAVE_METADATA: number;
  HAVE_CURRENT_DATA: number;
  HAVE_FUTURE_DATA: number;
  HAVE_ENOUGH_DATA: number;
  readyState: number;
  seeking: boolean;

  // playback state
  currentTime: number;
  duration: number;
  startDate: Date;
  paused: boolean;
  defaultPlaybackRate: number;
  playbackRate: number;
  played: TimeRanges;
  seekable: TimeRanges;
  ended: boolean;
  autoplay: boolean;
  loop: boolean;
  play(): Promise<void>;
  pause(): void;
  fastSeek(): void;
  captureStream(): MediaStream;

  // media controller
  mediaGroup: string;
  controller: ?any;

  // controls
  controls: boolean;
  volume: number;
  muted: boolean;
  defaultMuted: boolean;
  controlsList?: DOMTokenList;

  // tracks
  audioTracks: AudioTrackList;
  videoTracks: VideoTrackList;
  textTracks: TextTrackList;
  addTextTrack(kind: string, label?: string, language?: string): TextTrack;

  // media keys
  mediaKeys?: ?MediaKeys;
  setMediakeys?: (mediakeys: ?MediaKeys) => Promise<?MediaKeys>;
}

declare class HTMLAudioElement extends HTMLMediaElement {
}

declare class HTMLVideoElement extends HTMLMediaElement {
  width: number;
  height: number;
  videoWidth: number;
  videoHeight: number;
  poster: string;
}

declare class HTMLSourceElement extends HTMLElement {
    src: string;
    type: string;

    //when used with the picture element
    srcset: string;
    sizes: string;
    media: string;
}

declare class ValidityState {
  badInput: boolean;
  customError: boolean;
  patternMismatch: boolean;
  rangeOverflow: boolean;
  rangeUnderflow: boolean;
  stepMismatch: boolean;
  tooLong: boolean;
  tooShort: boolean;
  typeMismatch: boolean;
  valueMissing: boolean;
  valid: boolean;
}

// https://w3c.github.io/html/sec-forms.html#dom-selectionapielements-setselectionrange
type SelectionDirection = 'backward' | 'forward' | 'none';
type SelectionMode = 'select' | 'start' | 'end' | 'preserve';
declare class HTMLInputElement extends HTMLElement {
  accept: string;
  align: string;
  alt: string;
  autocomplete: string;
  autofocus: boolean;
  border: string;
  checked: boolean;
  complete: boolean;
  defaultChecked: boolean;
  defaultValue: string;
  dirname: string;
  disabled: boolean;
  dynsrc: string;
  files: FileList;
  form: HTMLFormElement | null;
  formAction: string;
  formEncType: string;
  formMethod: string;
  formNoValidate: boolean;
  formTarget: string;
  height: string;
  hspace: number;
  indeterminate: boolean;
  labels: NodeList<HTMLLabelElement>;
  list: HTMLElement | null;
  loop: number;
  lowsrc: string;
  max: string;
  maxLength: number;
  min: string;
  multiple: boolean;
  name: string;
  pattern: string;
  placeholder: string;
  readOnly: boolean;
  required: boolean;
  selectionDirection: SelectionDirection;
  selectionEnd: number;
  selectionStart: number;
  size: number;
  src: string;
  start: string;
  status: boolean;
  step: string;
  tabIndex: number;
  type: string;
  useMap: string;
  validationMessage: string;
  validity: ValidityState;
  value: string;
  valueAsDate: Date;
  valueAsNumber: number;
  vrml: string;
  vspace: number;
  width: string;
  willValidate: boolean;

  blur(): void;
  checkValidity(): boolean;
  reportValidity(): boolean;
  setCustomValidity(error: string): void;
  click(): void;
  createTextRange(): TextRange;
  focus(): void;
  select(): void;
  setRangeText(replacement: string, start?: void, end?: void, selectMode?: void): void;
  setRangeText(replacement: string, start: number, end: number, selectMode?: SelectionMode): void;
  setSelectionRange(start: number, end: number, direction?: SelectionDirection): void;
}

declare class HTMLButtonElement extends HTMLElement {
  autofocus: boolean;
  disabled: boolean;
  form: HTMLFormElement | null;
  labels: NodeList<HTMLLabelElement> | null;
  name: string;
  type: string;
  validationMessage: string;
  validity: ValidityState;
  value: string;
  willValidate: boolean;

  checkValidity(): boolean;
  reportValidity(): boolean;
  setCustomValidity(error: string): void;
}

// https://w3c.github.io/html/sec-forms.html#the-textarea-element
declare class HTMLTextAreaElement extends HTMLElement {
  autofocus: boolean;
  cols: number;
  dirName: string;
  disabled: boolean;
  form: HTMLFormElement | null;
  maxLength: number;
  name: string;
  placeholder: string;
  readOnly: boolean;
  required: boolean;
  rows: number;
  wrap: string;

  type: string;
  defaultValue: string;
  value: string;
  textLength: number;

  willValidate: boolean;
  validity: ValidityState;
  validationMessage: string;
  checkValidity(): boolean;
  setCustomValidity(error: string): void;

  labels: NodeList<HTMLLabelElement>;

  select(): void;
  selectionStart: number;
  selectionEnd: number;
  selectionDirection: SelectionDirection;
  setSelectionRange(start: number, end: number, direction?: SelectionDirection): void;
}

declare class HTMLSelectElement extends HTMLElement {
  autocomplete: string;
  autofocus: boolean;
  disabled: boolean;
  form: HTMLFormElement | null;
  labels: NodeList<HTMLLabelElement>;
  length: number;
  multiple: boolean;
  name: string;
  options: HTMLOptionsCollection;
  required: boolean;
  selectedIndex: number;
  selectedOptions: HTMLCollection<HTMLOptionElement>;
  size: number;
  type: string;
  validationMessage: string;
  validity: ValidityState;
  value: string;
  willValidate: boolean;

  add(element: HTMLElement, before?: HTMLElement): void;
  checkValidity(): boolean;
  item(index: number): HTMLOptionElement | null;
  namedItem(name: string): HTMLOptionElement | null;
  remove(index?: number): void;
  setCustomValidity(error: string): void;
}

declare class HTMLOptionsCollection extends HTMLCollection<HTMLOptionElement> {
  selectedIndex: number;
  add(element: HTMLOptionElement | HTMLOptGroupElement, before?: HTMLElement | number): void;
  remove(index: number): void;
}

declare class HTMLOptionElement extends HTMLElement {
  defaultSelected: boolean;
  disabled: boolean;
  form: HTMLFormElement | null;
  index: number;
  label: string;
  selected: boolean;
  text: string;
  value: string;
}

declare class HTMLOptGroupElement extends HTMLElement {
  disabled: boolean;
  label: string;
}

declare class HTMLAnchorElement extends HTMLElement {
  charset: string;
  coords: string;
  download: string;
  hash: string;
  host: string;
  hostname: string;
  href: string;
  hreflang: string;
  media: string;
  name: string;
  origin: string;
  password: string;
  pathname: string;
  port: string;
  protocol: string;
  rel: string;
  rev: string;
  search: string;
  shape: string;
  target: string;
  text: string;
  type: string;
  username: string;
}

// https://w3c.github.io/html/sec-forms.html#the-label-element
declare class HTMLLabelElement extends HTMLElement {
  form: HTMLFormElement | null;
  htmlFor: string;
  control: HTMLElement | null;
}

declare class HTMLLinkElement extends HTMLElement {
  crossOrigin: ?('anonymous' | 'use-credentials');
  href: string;
  hreflang: string;
  media: string;
  rel: string;
  sizes: DOMTokenList;
  type: string;
  as: string;
}

declare class HTMLScriptElement extends HTMLElement {
  async: boolean;
  charset: string;
  crossOrigin?: string;
  defer: boolean;
  src: string;
  text: string;
  type: string;
}

declare class HTMLStyleElement extends HTMLElement {
  disabled: boolean;
  media: string;
  scoped: boolean;
  sheet: ?CSSStyleSheet;
  type: string;
}

declare class HTMLParagraphElement extends HTMLElement {
  align: 'left' | 'center' | 'right' | 'justify'; // deprecated in HTML 4.01
}

declare class HTMLHtmlElement extends HTMLElement {}

declare class HTMLBodyElement extends HTMLElement {}

declare class HTMLHeadElement extends HTMLElement {}

declare class HTMLDivElement extends HTMLElement {}

declare class HTMLSpanElement extends HTMLElement {}

declare class HTMLAppletElement extends HTMLElement {}

declare class HTMLHeadingElement extends HTMLElement {}

declare class HTMLHRElement extends HTMLElement {}

declare class HTMLBRElement extends HTMLElement {}

declare class HTMLDListElement extends HTMLElement {}

declare class HTMLAreaElement extends HTMLElement {
  alt: string;
  coords: string;
  shape: string;
  target: string;
  download: string;
  ping: string;
  rel: string;
  relList: DOMTokenList;
  referrerPolicy: string;
}

declare class HTMLDataElement extends HTMLElement {
  value: string;
}

declare class HTMLDataListElement extends HTMLElement {
  options: HTMLCollection<HTMLOptionElement>;
}

declare class HTMLDialogElement extends HTMLElement {
  open: boolean;
  returnValue: string;
  show(): void;
  showModal(): void;
  close(returnValue: ?string): void;
}

declare class HTMLEmbedElement extends HTMLElement {
  src: string;
  type: string;
  width: string;
  height: string;
  getSVGDocument(): ?Document;
}

declare class HTMLMapElement extends HTMLElement {
  areas: HTMLCollection<HTMLAreaElement>;
  images: HTMLCollection<HTMLImageElement>;
  name: string;
}

declare class HTMLMeterElement extends HTMLElement {
  high: number;
  low: number;
  max: number;
  min: number;
  optimum: number;
  value: number;
  labels: NodeList<HTMLLabelElement>;
}

declare class HTMLModElement extends HTMLElement {
  cite: string;
  dateTime: string;
}

declare class HTMLObjectElement extends HTMLElement {
  contentDocument: ?Document;
  contentWindow: ?WindowProxy;
  data: string;
  form: ?HTMLFormElement;
  height: string;
  name: string;
  type: string;
  typeMustMatch: boolean;
  useMap: string;
  validationMessage: string;
  validity: ValidityState;
  width: string;
  willValidate: boolean;
  checkValidity(): boolean;
  getSVGDocument(): ?Document;
  reportValidity(): boolean;
  setCustomValidity(error: string): void;
}

declare class HTMLOutputElement extends HTMLElement {
  defaultValue: string;
  form: ?HTMLFormElement;
  htmlFor: DOMTokenList;
  labels: NodeList<HTMLLabelElement>;
  name: string;
  type: string;
  validationMessage: string;
  validity: ValidityState;
  value: string;
  willValidate: boolean;
  checkValidity(): boolean;
  reportValidity(): boolean;
  setCustomValidity(error: string): void;
}

declare class HTMLParamElement extends HTMLElement {
  name: string;
  value: string;
}

declare class HTMLProgressElement extends HTMLElement {
  labels: NodeList<HTMLLabelElement>;
  max: number;
  position: number;
  value: number;
}

declare class HTMLPictureElement extends HTMLElement {}

declare class HTMLTableColElement extends HTMLElement {
  span: number;
}

declare class HTMLTimeElement extends HTMLElement {
  dateTime: string;
}

declare class HTMLTitleElement extends HTMLElement {
  text: string;
}

declare class HTMLTrackElement extends HTMLElement {
  static NONE: 0;
  static LOADING: 1;
  static LOADED: 2;
  static ERROR: 3;

  default: boolean;
  kind: string;
  label: string;
  readyState: 0 | 1 | 2 | 3;
  src: string;
  srclang: string;
  track: TextTrack;
}

declare class HTMLQuoteElement extends HTMLElement {
  cite: string;
}

declare class HTMLOListElement extends HTMLElement {
  reversed: boolean;
  start: number;
  type: string;
}

declare class HTMLUListElement extends HTMLElement {}

declare class HTMLLIElement extends HTMLElement {
  value: number;
}

declare class HTMLPreElement extends HTMLElement {}

declare class HTMLMetaElement extends HTMLElement {
  content: string;
  httpEquiv: string;
  name: string;
}

declare class HTMLUnknownElement extends HTMLElement {}

declare class TextRange {
  boundingLeft: number;
  htmlText: string;
  offsetLeft: number;
  boundingWidth: number;
  boundingHeight: number;
  boundingTop: number;
  text: string;
  offsetTop: number;
  moveToPoint(x: number, y: number): void;
  queryCommandValue(cmdID: string): any;
  getBookmark(): string;
  move(unit: string, count?: number): number;
  queryCommandIndeterm(cmdID: string): boolean;
  scrollIntoView(fStart?: boolean): void;
  findText(string: string, count?: number, flags?: number): boolean;
  execCommand(cmdID: string, showUI?: boolean, value?: any): boolean;
  getBoundingClientRect(): ClientRect | DOMRect;
  moveToBookmark(bookmark: string): boolean;
  isEqual(range: TextRange): boolean;
  duplicate(): TextRange;
  collapse(start?: boolean): void;
  queryCommandText(cmdID: string): string;
  select(): void;
  pasteHTML(html: string): void;
  inRange(range: TextRange): boolean;
  moveEnd(unit: string, count?: number): number;
  getClientRects(): ClientRectList | DOMRectList;
  moveStart(unit: string, count?: number): number;
  parentElement(): Element;
  queryCommandState(cmdID: string): boolean;
  compareEndPoints(how: string, sourceRange: TextRange): number;
  execCommandShowHelp(cmdID: string): boolean;
  moveToElementText(element: Element): void;
  expand(Unit: string): boolean;
  queryCommandSupported(cmdID: string): boolean;
  setEndPoint(how: string, SourceRange: TextRange): void;
  queryCommandEnabled(cmdID: string): boolean;
}

declare class ClientRect { // extension
  left: number;
  width: number;
  right: number;
  top: number;
  bottom: number;
  height: number;
}

declare class ClientRectList { // extension
  @@iterator(): Iterator<ClientRect>;
  length: number;
  item(index: number): ClientRect;
  [index: number]: ClientRect;
}

// TODO: HTML*Element

declare class DOMImplementation {
  createDocumentType(qualifiedName: string, publicId: string, systemId: string): DocumentType;
  createDocument(namespaceURI: string | null, qualifiedName: string, doctype?: DocumentType | null): Document;
  hasFeature(feature: string, version?: string): boolean;

  // non-standard
  createHTMLDocument(title?: string): Document;
}

declare class DocumentType extends Node {
  name: string;
  notations: NamedNodeMap;
  systemId: string;
  internalSubset: string;
  entities: NamedNodeMap;
  publicId: string;

  // from ChildNode interface
  after(...nodes: Array<string | Node>): void;
  before(...nodes: Array<string | Node>): void;
  replaceWith(...nodes: Array<string | Node>): void;
  remove(): void;
}

declare class CharacterData extends Node {
  length: number;
  data: string;
  deleteData(offset: number, count: number): void;
  replaceData(offset: number, count: number, arg: string): void;
  appendData(arg: string): void;
  insertData(offset: number, arg: string): void;
  substringData(offset: number, count: number): string;

  // from ChildNode interface
  after(...nodes: Array<string | Node>): void;
  before(...nodes: Array<string | Node>): void;
  replaceWith(...nodes: Array<string | Node>): void;
  remove(): void;
}

declare class Text extends CharacterData {
  assignedSlot?: HTMLSlotElement;
  wholeText: string;
  splitText(offset: number): Text;
  replaceWholeText(content: string): Text;
}

declare class Comment extends CharacterData {
  text: string;
}

declare class URL {
  static createObjectURL(blob: Blob): string;
  static createObjectURL(mediaSource: MediaSource): string;
  static createFor(blob: Blob): string;
  static revokeObjectURL(url: string): void;
  constructor(url: string, base?: string | URL): void;
  hash: string;
  host: string;
  hostname: string;
  href: string;
  origin: string; // readonly
  password: string;
  pathname: string;
  port: string;
  protocol: string;
  search: string;
  searchParams: URLSearchParams; // readonly
  username: string;
}

declare class MediaSource extends EventTarget {
  sourceBuffers: SourceBufferList;
  activeSourceBuffers: SourceBufferList;
  readyState: "closed" | "opened" | "ended";
  duration: number;
  addSourceBuffer(type: string): SourceBuffer;
  removeSourceBuffer(sourceBuffer: SourceBuffer): void;
  endOfStream(error?: string): void;
  static isTypeSupported(type: string): bool;
}

declare class SourceBuffer extends EventTarget {
  mode: "segments" | "sequence";
  updating: bool;
  buffered: TimeRanges;
  timestampOffset: number;
  audioTracks: AudioTrackList;
  videoTracks: VideoTrackList;
  textTracks: TextTrackList;
  appendWindowStart: number;
  appendWindowEnd: number;

  appendBuffer(data: ArrayBuffer | $ArrayBufferView): void;
  // TODO: Add ReadableStream
  // appendStream(stream: ReadableStream, maxSize?: number): void;
  abort(): void;
  remove(start: number, end: number): void;

  trackDefaults: TrackDefaultList;
}

declare class SourceBufferList extends EventTarget {
  @@iterator(): Iterator<SourceBuffer>;
  [index: number]: SourceBuffer;
  length: number;
}

declare class Storage {
  length: number;
  getItem(key: string): ?string;
  setItem(key: string, data: string): void;
  clear(): void;
  removeItem(key: string): void;
  key(index: number): ?string;
  [name: string]: ?string;
}

declare class TrackDefaultList {
  [index: number]: TrackDefault;
  length: number;
}

declare class TrackDefault {
  type: "audio" | "video" | "text";
  byteStreamTrackID: string;
  language: string;
  label: string;
  kinds: Array<string>;
}

// TODO: The use of `typeof` makes this function signature effectively
// (node: Node) => number, but it should be (node: Node) => 1|2|3
type NodeFilterCallback = (node: Node) =>
typeof NodeFilter.FILTER_ACCEPT |
typeof NodeFilter.FILTER_REJECT |
typeof NodeFilter.FILTER_SKIP;

type NodeFilterInterface = NodeFilterCallback | { acceptNode: NodeFilterCallback, ... }

// TODO: window.NodeFilter exists at runtime and behaves as a constructor
//       as far as `instanceof` is concerned, but it is not callable.
declare class NodeFilter {
  static SHOW_ALL: -1;
  static SHOW_ELEMENT: 1;
  static SHOW_ATTRIBUTE: 2; // deprecated
  static SHOW_TEXT: 4;
  static SHOW_CDATA_SECTION: 8; // deprecated
  static SHOW_ENTITY_REFERENCE: 16; // deprecated
  static SHOW_ENTITY: 32; // deprecated
  static SHOW_PROCESSING_INSTRUCTION: 64;
  static SHOW_COMMENT: 128;
  static SHOW_DOCUMENT: 256;
  static SHOW_DOCUMENT_TYPE: 512;
  static SHOW_DOCUMENT_FRAGMENT: 1024;
  static SHOW_NOTATION: 2048; // deprecated
  static FILTER_ACCEPT: 1;
  static FILTER_REJECT: 2;
  static FILTER_SKIP: 3;
  acceptNode: NodeFilterCallback;
}

// TODO: window.NodeIterator exists at runtime and behaves as a constructor
//       as far as `instanceof` is concerned, but it is not callable.
declare class NodeIterator<RootNodeT, WhatToShowT> {
  root: RootNodeT;
  whatToShow: number;
  filter: NodeFilter;
  expandEntityReferences: boolean;
  referenceNode: RootNodeT | WhatToShowT;
  pointerBeforeReferenceNode: boolean;
  detach(): void;
  previousNode(): WhatToShowT | null;
  nextNode(): WhatToShowT | null;
}

// TODO: window.TreeWalker exists at runtime and behaves as a constructor
//       as far as `instanceof` is concerned, but it is not callable.
declare class TreeWalker<RootNodeT, WhatToShowT> {
  root: RootNodeT;
  whatToShow: number;
  filter: NodeFilter;
  expandEntityReferences: boolean;
  currentNode: RootNodeT | WhatToShowT;
  parentNode(): WhatToShowT | null;
  firstChild(): WhatToShowT | null;
  lastChild(): WhatToShowT | null;
  previousSibling(): WhatToShowT | null;
  nextSibling(): WhatToShowT | null;
  previousNode(): WhatToShowT | null;
  nextNode(): WhatToShowT | null;
}

/* window */

declare type WindowProxy = any;
declare function alert(message?: any): void;
declare function prompt(message?: any, value?: any): string;
declare function close(): void;
declare function confirm(message?: string): boolean;
declare function getComputedStyle(elt: Element, pseudoElt?: string): CSSStyleDeclaration;
declare opaque type AnimationFrameID;
declare function requestAnimationFrame(callback: (timestamp: number) => void): AnimationFrameID;
declare function cancelAnimationFrame(requestId: AnimationFrameID): void;
declare opaque type IdleCallbackID;
declare function requestIdleCallback(
  cb: (deadline: {
         didTimeout: boolean,
         timeRemaining: () => number,
         ...
  }) => void,
  opts?: { timeout: number, ... },
): IdleCallbackID;
declare function cancelIdleCallback(id: IdleCallbackID): void;
declare var localStorage: Storage;
declare function focus(): void;
declare function onfocus(ev: Event): any;
declare function onmessage(ev: MessageEvent): any;
declare function open(url?: string, target?: string, features?: string, replace?: boolean): any;
declare var parent: WindowProxy;
declare function print(): void;
declare var self: any;
declare var sessionStorage: Storage;
declare var status: string;
declare var top: WindowProxy;
declare function getSelection(): Selection | null;
declare var customElements: CustomElementRegistry;
declare function scroll(x: number, y: number): void;
declare function scroll(options: ScrollToOptions): void;
declare function scrollTo(x: number, y: number): void;
declare function scrollTo(options: ScrollToOptions): void;
declare function scrollBy(x: number, y: number): void;
declare function scrollBy(options: ScrollToOptions): void;

/* Notification */
type NotificationPermission = 'default' | 'denied' | 'granted';
type NotificationDirection = 'auto' | 'ltr' | 'rtl';
type VibratePattern = number | Array<number>;
type NotificationAction = {
       action: string,
       title: string,
       icon?: string,
       ...
};
type NotificationOptions = {
       dir?: NotificationDirection,
       lang?: string,
       body?: string,
       tag?: string,
       image?: string,
       icon?: string,
       badge?: string,
       sound?: string,
       vibrate?: VibratePattern,
       timestamp?: number,
       renotify?: boolean,
       silent?: boolean,
       requireInteraction?: boolean,
       data?: ?any,
       actions?: Array<NotificationAction>,
       ...
};

declare class Notification extends EventTarget {
  constructor(title: string, options?: NotificationOptions): void;
  static +permission: NotificationPermission;
  static requestPermission(
    callback?: (perm: NotificationPermission) => mixed
  ): Promise<NotificationPermission>;
  static +maxActions: number;
  onclick: ?(evt: Event) => mixed;
  onclose: ?(evt: Event) => mixed;
  onerror: ?(evt: Event) => mixed;
  onshow: ?(evt: Event) => mixed;
  +title: string;
  +dir: NotificationDirection;
  +lang: string;
  +body: string;
  +tag: string;
  +image?: string;
  +icon?: string;
  +badge?: string;
  +vibrate?: Array<number>;
  +timestamp: number;
  +renotify: boolean;
  +silent: boolean;
  +requireInteraction: boolean;
  +data: any;
  +actions: Array<NotificationAction>;

  close(): void;
}
