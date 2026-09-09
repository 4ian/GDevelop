// @flow
import * as React from 'react';
import {
  EventsExecutionTrackingStore,
  type InstructionExecution,
} from './EventsExecutionTrackingStore';

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

/**
 * Subscribe to what is reported about one event, re-rendering only when the
 * selected execution changes.
 *
 * An events sheet mounts one of these per instruction: the subscription is
 * made for the event only, so that a report does not wake up the rows of the
 * whole sheet.
 */
const useStoreSelection = (
  eventPtr: number | null,
  select: (store: EventsExecutionTrackingStore) => InstructionExecution | null
): InstructionExecution | null => {
  const store = React.useContext(EventsExecutionTrackingContext);
  const [execution, setExecution] = React.useState<InstructionExecution | null>(
    () => (eventPtr === null ? null : select(store))
  );

  React.useEffect(
    () => {
      if (eventPtr === null) {
        setExecution(null);
        return;
      }

      const update = () => {
        const newExecution = select(store);
        setExecution(previousExecution =>
          areExecutionsEqual(previousExecution, newExecution)
            ? previousExecution
            : newExecution
        );
      };
      update();
      return store.subscribe(eventPtr, update);
    },
    [store, eventPtr, select]
  );

  return execution;
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

  return useStoreSelection(eventPtr, select);
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

  return useStoreSelection(eventPtr, select);
};
