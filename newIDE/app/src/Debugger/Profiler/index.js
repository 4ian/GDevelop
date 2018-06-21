// @flow
import * as React from 'react';
import Paper from 'material-ui/Paper';
import RaisedButton from 'material-ui/RaisedButton/RaisedButton';
import MeasuresTable from './MeasuresTable';
import { type ProfilerMeasuresSection } from '..';
import EmptyMessage from '../../UI/EmptyMessage';

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    width: '100%',
  },
  tableContainer: {
    flex: 1,
  },
};

type Props = {|
  onStart: () => void,
  onStop: () => void,
  profilerMeasures: ?ProfilerMeasuresSection,
|};

export default class Profiler extends React.Component<Props, void> {
  render() {
    const { onStart, onStop, profilerMeasures } = this.props;

    return (
      <Paper style={styles.container}>
        <RaisedButton label="Start profiling" onClick={onStart} />
        <RaisedButton label="Stop profiling" onClick={onStop} />
        <div style={styles.tableContainer}>
          {profilerMeasures && (
            <MeasuresTable profilerMeasures={profilerMeasures} />
          )}
          {!profilerMeasures && (
            <EmptyMessage>
              Start profiling and then stop it after a few seconds to see the
              results.
            </EmptyMessage>
          )}
        </div>
      </Paper>
    );
  }
}
