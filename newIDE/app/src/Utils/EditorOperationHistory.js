// @flow

export type EditorOperationKind = 'change' | 'undo' | 'redo';
export type EditorOperationActionType = 'ADD' | 'DELETE' | 'EDIT';

export type EditorOperationHistoryContext = {|
  editor: string,
  subject?: string,
|};

export type EditorOperation = {|
  id: number,
  kind: EditorOperationKind,
  actionType?: EditorOperationActionType,
  timestamp: number,
  historyContext?: EditorOperationHistoryContext,
  changeContext?: any,
|};

const maxOperationsCount = 500;

let nextOperationId = 1;
let operations: Array<EditorOperation> = [];
const subscribers: Set<() => void> = new Set();

const notifySubscribers = () => {
  subscribers.forEach(subscriber => subscriber());
};

export const recordEditorOperation = (operation: {|
  kind: EditorOperationKind,
  actionType?: EditorOperationActionType,
  historyContext?: EditorOperationHistoryContext,
  changeContext?: any,
|}) => {
  operations = [
    {
      ...operation,
      id: nextOperationId++,
      timestamp: Date.now(),
    },
    ...operations,
  ].slice(0, maxOperationsCount);

  notifySubscribers();
};

export const clearEditorOperationHistory = () => {
  if (!operations.length) return;

  operations = [];
  notifySubscribers();
};

export const getEditorOperationHistory = (): Array<EditorOperation> =>
  operations;

export const subscribeToEditorOperationHistory = (
  subscriber: () => void
): (() => void) => {
  subscribers.add(subscriber);

  return () => {
    subscribers.delete(subscriber);
  };
};
