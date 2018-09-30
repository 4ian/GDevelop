// @flow
import * as React from 'react';
import RaisedButton from 'material-ui/RaisedButton/RaisedButton';
import MeasuresTable from './MeasuresTable';
import { type ProfilerOutput } from '..';
import EmptyMessage from '../../UI/EmptyMessage';
import { Line } from '../../UI/Grid';
import Background from '../../UI/Background';
import LinearProgress from 'material-ui/LinearProgress';

const styles = {
  tableContainer: {
    flex: 1,
  },
};

type Props = {|
  onStart: () => void,
  onStop: () => void,
  profilerOutput: ?ProfilerOutput,
  profilingInProgress: boolean,
|};

export default class Profiler extends React.Component<Props, void> {
  render() {
    const {
      onStart,
      onStop,
      profilerOutput,
      profilingInProgress,
    } = this.props;

    return (
      <Background>
        <Line alignItems="center" justifyContent="center">
          {!profilingInProgress && profilerOutput && (<p>Last run collected on {profilerOutput.stats.framesCount} frames.</p>)
          }
          {!profilingInProgress && profilerOutput && <RaisedButton label="Restart" onClick={onStart} />}
          {!profilingInProgress && !profilerOutput && <RaisedButton label="Start profiling" onClick={onStart} />}
          {profilingInProgress && <RaisedButton label="Stop profiling" onClick={onStop} />}
        </Line>
        {profilingInProgress && (
          <Line alignItems="center">
            <LinearProgress style={{ flex: 1 }} mode={'indeterminate'} />
          </Line>
        )}
        <div style={styles.tableContainer}>
          {profilerOutput && (
            <MeasuresTable profilerMeasures={profilerOutput.framesAverageMeasures} />
          )}
          {!profilerOutput && (
            <EmptyMessage>
              Start profiling and then stop it after a few seconds to see the
              results.
            </EmptyMessage>
          )}
        </div>
      </Background>
    );
  }
}
