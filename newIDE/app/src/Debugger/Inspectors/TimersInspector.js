// @flow
import * as React from 'react';
import ReactJsonView from 'react-json-view';
import {
  type EditFunction,
  type CallFunction,
} from '../GDJSInspectorDescriptions';

// This mirrors the internals of Hashtable<gdjs.Timer>.
type TimersHashtable = {|
  items: {
    [timerName: string]: {| _name: string, _time: float, _paused: boolean |},
  },
|};

const transform = (timersHashtable: TimersHashtable) => {
  if (!timersHashtable) return null;
  return Object.entries(timersHashtable.items).map(([timerName, timer]) => ({
    'Timer name': timer._name,
    'Time (in seconds)': timer._time / 1000,
    'Is paused': timer._paused,
  }));
};

type Props = {|
  timers: ?TimersHashtable,
  onCall: CallFunction,
  onEdit: EditFunction,
|};

const TimersInspector = (props: Props) => (
  <ReactJsonView
    collapsed={false}
    name={false}
    src={props.timers ? transform(props.timers) : null}
    enableClipboard={false}
    displayDataTypes={false}
    displayObjectSize={false}
    groupArraysAfterLength={50}
    theme="monokai"
    // TODO: Add possibility to edit a timer data
  />
);

export default TimersInspector;
