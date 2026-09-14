// @flow
import * as React from 'react';
import InspectorTreeView, {
  buildValueItems,
  type InspectorItem,
} from './InspectorTreeView';

// This mirrors the internals of gdjs.Timer.
type Timer = {| _name: string, _time: number, _paused: boolean |};
// This mirrors the internals of Hashtable<gdjs.Timer>.
export type TimersHashtable = {|
  items: {
    [timerName: string]: Timer,
  },
|};

/** The timers, one folder each, named as in the events. */
export const buildTimersItems = (
  parentId: string,
  timersHashtable: ?TimersHashtable
): ?Array<InspectorItem> => {
  if (!timersHashtable || !timersHashtable.items) return null;
  const timers = {};
  Object.keys(timersHashtable.items).forEach(timerName => {
    const timer = timersHashtable.items[timerName];
    timers[timer._name || timerName] = {
      'Time (in seconds)': timer._time / 1000,
      'Is paused': timer._paused,
    };
  });
  return buildValueItems(parentId, timers);
};

type Props = {|
  timers: ?TimersHashtable,
|};

const TimersInspector = ({ timers }: Props): React.Node => {
  const items = React.useMemo(() => buildTimersItems('timers', timers), [
    timers,
  ]);
  return timers ? (
    <InspectorTreeView items={items || []} />
  ) : (
    <InspectorTreeView src={null} />
  );
};

export default TimersInspector;
