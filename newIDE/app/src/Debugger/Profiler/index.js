// @flow
import { Trans } from '@lingui/macro';

import * as React from 'react';
import RaisedButton from '../../UI/RaisedButton';
import MeasuresTable from './MeasuresTable';
import { type ProfilerOutput } from '..';
import EmptyMessage from '../../UI/EmptyMessage';
import { Line, Spacer } from '../../UI/Grid';
import Background from '../../UI/Background';
import Text from '../../UI/Text';
import LinearProgress from '../../UI/LinearProgress';
import {
  Table,
  TableBody,
  TableRow,
  TableRowColumn,
  TableHeader,
  TableHeaderColumn,
} from '../../UI/Table';

const styles = {
  tableContainer: {
    flex: 1,
  },
};

/**
 * Round to at most one decimal, without trailing ".0" on whole numbers.
 */
const formatNumber = (value: number): string =>
  Number.isFinite(value) ? (Math.round(value * 10) / 10).toLocaleString() : '—';

type Stat = {|
  label: React.Node,
  value: React.Node,
  /** Shown under the value when there is something worth saying. */
  note?: React.Node,
|};

/**
 * The high level numbers of a profiler run, as rows for the summary table.
 * Anything the engine did not measure (an older game, or a game that does not
 * render in 3D) is left out rather than shown as a zero.
 */
const getStats = (profilerOutput: ProfilerOutput): Array<Stat> => {
  const { stats, framesAverageMeasures } = profilerOutput;
  const stat: Array<Stat> = [];

  stat.push({
    label: <Trans>Frames collected</Trans>,
    value: formatNumber(stats.framesCount),
  });

  const averageFrameTime = framesAverageMeasures
    ? framesAverageMeasures.time
    : 0;
  if (averageFrameTime) {
    stat.push({
      label: <Trans>Average frame</Trans>,
      value: <Trans>{formatNumber(averageFrameTime)} ms</Trans>,
      note: (
        <Trans>{formatNumber(1000 / averageFrameTime)} frames per second</Trans>
      ),
    });
  }

  if (stats.averageDrawCallsCount != null) {
    stat.push({
      label: <Trans>3D draw calls</Trans>,
      value: formatNumber(stats.averageDrawCallsCount),
      note: <Trans>per frame, on average</Trans>,
    });
  }
  if (stats.averageTrianglesCount != null) {
    stat.push({
      label: <Trans>3D triangles</Trans>,
      value: formatNumber(stats.averageTrianglesCount),
      note: <Trans>per frame, on average</Trans>,
    });
  }
  if (stats.geometriesCount != null || stats.texturesCount != null) {
    stat.push({
      label: <Trans>3D geometries / textures</Trans>,
      value: `${formatNumber(stats.geometriesCount || 0)} / ${formatNumber(
        stats.texturesCount || 0
      )}`,
      note: <Trans>held by the renderer</Trans>,
    });
  }
  if (stats.shaderProgramsCount != null) {
    stat.push({
      label: <Trans>Shader programs</Trans>,
      value: formatNumber(stats.shaderProgramsCount),
    });
  }
  if (stats.shaderProgramCompilationsCount != null) {
    const compilations = stats.shaderProgramCompilationsCount;
    stat.push({
      label: <Trans>Shaders compiled during the run</Trans>,
      value: formatNumber(compilations),
      note: compilations ? (
        <Trans>
          on {formatNumber(stats.framesWithShaderCompilationCount || 0)} dropped
          frame(s) - see the console for what differed
        </Trans>
      ) : (
        <Trans>none, so no frame was spent compiling</Trans>
      ),
    });
  }

  return stat;
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
        <Line alignItems="center" justifyContent="space-between" noMargin>
          <Line alignItems="center" noMargin>
            <Spacer />
            <Text noMargin>
              {profilingInProgress ? (
                <Trans>Profiling...</Trans>
              ) : profilerOutput ? (
                <Trans>Last run</Trans>
              ) : (
                <Trans>Profiler</Trans>
              )}
            </Text>
          </Line>
          <Line alignItems="center" noMargin>
            {profilingInProgress ? (
              <RaisedButton
                label={<Trans>Stop profiling</Trans>}
                onClick={onStop}
              />
            ) : (
              <RaisedButton
                label={
                  profilerOutput ? (
                    <Trans>Restart</Trans>
                  ) : (
                    <Trans>Start profiling</Trans>
                  )
                }
                onClick={onStart}
                primary={!profilerOutput}
              />
            )}
            <Spacer />
          </Line>
        </Line>
        {profilingInProgress && (
          <Line alignItems="center">
            <LinearProgress />
          </Line>
        )}
        {!profilingInProgress && profilerOutput && (
          <Table style={{ tableLayout: 'fixed', width: '100%' }}>
            <TableHeader>
              <TableRow>
                <TableHeaderColumn>
                  <Trans>Measure</Trans>
                </TableHeaderColumn>
                <TableHeaderColumn
                  style={{
                    textAlign: 'right',
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  <Trans>Value</Trans>
                </TableHeaderColumn>
                <TableHeaderColumn />
              </TableRow>
            </TableHeader>
            <TableBody>
              {getStats(profilerOutput).map((stat, index) => (
                <TableRow key={index}>
                  <TableRowColumn>
                    <Text noMargin>{stat.label}</Text>
                  </TableRowColumn>
                  <TableRowColumn
                    style={{
                      textAlign: 'right',
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    <Text noMargin>{stat.value}</Text>
                  </TableRowColumn>
                  <TableRowColumn>
                    {stat.note && (
                      <Text noMargin size="body-small" color="secondary">
                        {stat.note}
                      </Text>
                    )}
                  </TableRowColumn>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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
