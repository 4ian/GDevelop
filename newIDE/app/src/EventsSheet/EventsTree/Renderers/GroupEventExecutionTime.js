// @flow
import * as React from 'react';
import {
  TrackedEventPtrContext,
  useCumulatedEventExecution,
} from '../../../EventsExecutionTracking/EventsExecutionTrackingContext';
import { formatExecutionDuration } from '../../../EventsExecutionTracking/formatting';
import { groupExecutionTime } from '../ClassNames';

/**
 * What a group took while a followed preview runs: the time of everything
 * under it, and its share of everything tracked, so that the heavy parts of
 * a sheet can be found by reading the groups only.
 *
 * A component of its own because `GroupEvent` is a class whose `contextType`
 * is already taken.
 */
const GroupEventExecutionTime = (): React.Node => {
  const eventPtr = React.useContext(TrackedEventPtrContext);
  // Hooks are not called conditionally: an untracked group asks for the
  // pointer 0, which no event ever has.
  const execution = useCumulatedEventExecution(
    eventPtr === null ? 0 : eventPtr
  );
  if (eventPtr === null || !execution) return null;

  return (
    <span className={groupExecutionTime}>
      {formatExecutionDuration(execution.durationMs)} (
      {execution.sharePercent.toFixed(0)}%)
    </span>
  );
};

export default GroupEventExecutionTime;
