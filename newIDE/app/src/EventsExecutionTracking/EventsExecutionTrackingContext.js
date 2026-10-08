// @flow
import * as React from 'react';
import {
  EventsExecutionTrackingStore,
  type InstructionExecution,
  type CumulatedEventExecution,
} from './EventsExecutionTrackingStore';
import { useExternalStoreSelection } from '../Utils/UseExternalStoreSelection';

/**
 * The store fed by the previews (see UseEventsExecutionTracking). There is a
 * single one for the editor, provided by default: tests and stories can still
 * provide their own.
 */
const EventsExecutionTrackingContext: React.Context<EventsExecutionTrackingStore> = React.createContext<EventsExecutionTrackingStore>(
  new EventsExecutionTrackingStore()
);

export default EventsExecutionTrackingContext;

/**
 * The pointer of the event whose instructions are being rendered, so that
 * they can find their own execution without every event renderer having to
 * pass it down. `null` when the instructions are not tracked (sub-instructions
 * of a condition, for example).
 */
export const TrackedEventPtrContext: React.Context<
  number | null
> = React.createContext<number | null>(null);

const areExecutionsEqual = (
  first: InstructionExecution | null,
  second: InstructionExecution | null
): boolean =>
  first === second ||
  (!!first &&
    !!second &&
    first.durationMs === second.durationMs &&
    first.reportedAt === second.reportedAt);

const areCumulatedExecutionsEqual = (
  first: CumulatedEventExecution | null,
  second: CumulatedEventExecution | null
): boolean =>
  first === second ||
  (!!first &&
    !!second &&
    first.durationMs === second.durationMs &&
    first.sharePercent === second.sharePercent &&
    first.reportedAt === second.reportedAt);

/**
 * Subscribe to what is reported about one event, re-rendering only when the
 * selection changes.
 *
 * An events sheet mounts one of these per instruction: the subscription is
 * made for the event only, so that a report does not wake up the rows of the
 * whole sheet.
 */
const useEventSelection = <Selection>(
  eventPtr: number | null,
  select: (store: EventsExecutionTrackingStore) => Selection,
  isEqual: (first: Selection, second: Selection) => boolean
): Selection => {
  const store = React.useContext(EventsExecutionTrackingContext);
  const subscribe = React.useMemo(
    () =>
      eventPtr === null
        ? null
        : (listener: () => void) => store.subscribe(eventPtr, listener),
    [store, eventPtr]
  );
  const selectFromStore = React.useCallback(() => select(store), [
    store,
    select,
  ]);

  return useExternalStoreSelection(subscribe, selectFromStore, isEqual);
};

/**
 * The last execution reported for an instruction of the tracked event, if it
 * was executed recently.
 */
export const useInstructionExecution = (
  isCondition: boolean,
  indexInList: number
): InstructionExecution | null => {
  const eventPtr = React.useContext(TrackedEventPtrContext);
  const select = React.useCallback(
    (store: EventsExecutionTrackingStore) =>
      eventPtr === null
        ? null
        : store.getInstructionExecution(eventPtr, isCondition, indexInList),
    [eventPtr, isCondition, indexInList]
  );

  return useEventSelection(eventPtr, select, areExecutionsEqual);
};

/**
 * The last execution reported for the instructions of an event (the duration
 * being the sum of theirs), if it was executed recently.
 */
export const useEventExecution = (
  eventPtr: number
): InstructionExecution | null => {
  const select = React.useCallback(
    (store: EventsExecutionTrackingStore) => store.getEventExecution(eventPtr),
    [eventPtr]
  );

  return useEventSelection(eventPtr, select, areExecutionsEqual);
};

/**
 * What an event took with everything under it, as reported for the last
 * frames: what a group shows, its own instructions being none.
 */
export const useCumulatedEventExecution = (
  eventPtr: number
): CumulatedEventExecution | null => {
  const select = React.useCallback(
    (store: EventsExecutionTrackingStore) =>
      store.getCumulatedEventExecution(eventPtr),
    [eventPtr]
  );

  return useEventSelection(eventPtr, select, areCumulatedExecutionsEqual);
};
