// @flow
import { Trans } from '@lingui/macro';

import * as React from 'react';
import RaisedButton from '../../UI/RaisedButton';
import MeasuresTable from './MeasuresTable';
import { type ProfilerOutput } from '..';
import EmptyMessage from '../../UI/EmptyMessage';
import { Line, Column } from '../../UI/Grid';
import Background from '../../UI/Background';
import Text from '../../UI/Text';
import LinearProgress from '../../UI/LinearProgress';

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
  render(): any {
    const { onStart, onStop, profilerOutput, profilingInProgress } = this.props;

    return (
      <Background>
        <Line alignItems="center" justifyContent="center">
          {!profilingInProgress && profilerOutput && (
            <Column noMargin>
              <Text>
                <Trans>
                  Last run collected on {profilerOutput.stats.framesCount}{' '}
                  frames.
                </Trans>
              </Text>
              {!!profilerOutput.stats.shaderProgramCompilationsCount && (
                <Text color="secondary">
                  <Trans>
                    The 3D renderer compiled{' '}
                    {profilerOutput.stats.shaderProgramCompilationsCount} new
                    shader(s) during this run, on{' '}
                    {profilerOutput.stats.framesWithShaderCompilationCount}{' '}
                    frame(s). Each of those frames was dropped. This happens
                    when the scene changes something a shader is built around -
                    see the console for what differed.
                  </Trans>
                </Text>
              )}
            </Column>
          )}
          {!profilingInProgress && profilerOutput && (
            <RaisedButton label={<Trans>Restart</Trans>} onClick={onStart} />
          )}
          {!profilingInProgress && !profilerOutput && (
            <RaisedButton
              label={<Trans>Start profiling</Trans>}
              onClick={onStart}
            />
          )}
          {profilingInProgress && (
            <RaisedButton
              label={<Trans>Stop profiling</Trans>}
              onClick={onStop}
            />
          )}
        </Line>
        {profilingInProgress && (
          <Line alignItems="center">
            <LinearProgress />
          </Line>
        )}
        <div style={styles.tableContainer}>
          {profilerOutput && (
            <MeasuresTable
              profilerMeasures={profilerOutput.framesAverageMeasures}
            />
          )}
          {!profilerOutput && (
            <EmptyMessage>
              <Trans>
                Start profiling and then stop it after a few seconds to see the
                results.
              </Trans>
            </EmptyMessage>
          )}
        </div>
      </Background>
    );
  }
}
