// @flow
import * as React from 'react';
import Paper from 'material-ui/Paper';
import RaisedButton from 'material-ui/RaisedButton/RaisedButton';
import MeasuresTable from './MeasuresTable';
import { type ProfilerMeasuresSection } from '..';

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
          <MeasuresTable profilerMeasures={profilerMeasures} />
        </div>
      </Paper>
    );
  }
}
