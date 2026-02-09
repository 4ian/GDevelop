/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

// Implemented by window & worker
declare interface IDBEnvironment {
  indexedDB: IDBFactory;
}

type IDBDirection = 'next' | 'nextunique' | 'prev' | 'prevunique';

// Implemented by window.indexedDB & worker.indexedDB
declare interface IDBFactory {
  open(name: string, version?: number): IDBOpenDBRequest;
  deleteDatabase(name: string): IDBOpenDBRequest;
  cmp(a: any, b: any): -1|0|1;
}

declare interface IDBRequest extends EventTarget {
  result: IDBObjectStore;
  error: Error;
  source: ?(IDBIndex | IDBObjectStore | IDBCursor);
  transaction: IDBTransaction;
  readyState: 'pending'|'done';
  onerror: (err: any) => mixed;
  onsuccess: (e: any) => mixed;
}

declare interface IDBOpenDBRequest extends IDBRequest {
  onblocked: (e: any) => mixed;
  onupgradeneeded: (e: any) => mixed;
}

declare interface IDBDatabase extends EventTarget {
  close(): void;
  createObjectStore(name: string, options?: {
    keyPath?: ?(string|string[]),
    autoIncrement?: bool,
    ...
  }): IDBObjectStore;
  deleteObjectStore(name: string): void;
  transaction(storeNames: string|string[], mode?: 'readonly'|'readwrite'|'versionchange'): IDBTransaction;
  name: string;
  version: number;
  objectStoreNames: string[];
  onabort: (e: any) => mixed;
  onclose: (e: any) => mixed;
  onerror: (e: any) => mixed;
  onversionchange: (e: any) => mixed;
}

declare interface IDBTransaction extends EventTarget {
  abort(): void;
  db: IDBDatabase;
  error: Error;
  mode: 'readonly'|'readwrite'|'versionchange';
  name: string;
  objectStore(name: string): IDBObjectStore;
  onabort: (e: any) => mixed;
  oncomplete: (e: any) => mixed;
  onerror: (e: any) => mixed;
}

declare interface IDBObjectStore {
  add(value: any, key?: any): IDBRequest;
  autoIncrement: bool;
  clear(): IDBRequest;
  createIndex(indexName: string, keyPath: string|string[], optionalParameter?: {
    unique?: bool,
    multiEntry?: bool,
    ...
  }): IDBIndex;
  count(keyRange?: any|IDBKeyRange): IDBRequest;
  delete(key: any): IDBRequest;
  deleteIndex(indexName: string): void;
  get(key: any): IDBRequest;
  index(indexName: string): IDBIndex;
  indexNames: string[];
  name: string;
  keyPath: any;
  openCursor(range?: any|IDBKeyRange, direction?: IDBDirection): IDBRequest;
  openKeyCursor(range?: any|IDBKeyRange, direction?: IDBDirection): IDBRequest;
  put(value: any, key?: any): IDBRequest;
  transaction : IDBTransaction;
}

declare interface IDBIndex extends EventTarget {
  count(key?: any|IDBKeyRange): IDBRequest;
  get(key: any|IDBKeyRange): IDBRequest;
  getKey(key: any|IDBKeyRange): IDBRequest;
  openCursor(range?: any|IDBKeyRange, direction?: IDBDirection): IDBRequest;
  openKeyCursor(range?: any|IDBKeyRange, direction?: IDBDirection): IDBRequest;
  name: string;
  objectStore: IDBObjectStore;
  keyPath: any;
  multiEntry: bool;
  unique: bool;
}

declare interface IDBKeyRange {
  bound(lower: any, upper: any, lowerOpen?: bool, upperOpen?: bool): IDBKeyRange;
  only(value: any): IDBKeyRange;
  lowerBound(bound: any, open?: bool): IDBKeyRange;
  upperBound(bound: any, open?: bool): IDBKeyRange;
  lower: any;
  upper: any;
  lowerOpen: bool;
  upperOpen: bool;
}

declare interface IDBCursor {
  advance(count: number): void;
  continue(key?: any): void;
  delete(): IDBRequest;
  update(newValue: any): IDBRequest;
  source: IDBObjectStore|IDBIndex;
  direction: IDBDirection;
  key: any;
  primaryKey: any;
}

declare interface IDBCursorWithValue extends IDBCursor {
  value: any;
}
