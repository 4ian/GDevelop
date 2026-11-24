// @flow
import { Trans } from '@lingui/macro';

import * as React from 'react';
import RaisedButton from '../../UI/RaisedButton';
import MeasuresTable from './MeasuresTable';
import { type ProfilerOutput } from '..';
import EmptyMessage from '../../UI/EmptyMessage';
import Background from '../../UI/Background';
import ScrollView from '../../UI/ScrollView';
import Text from '../../UI/Text';
import LinearProgress from '../../UI/LinearProgress';
import StatusChip, { StatusDot } from '../../UI/StatusChip';
import History from '../../UI/CustomSvgIcons/History';
import classes from './Profiler.module.css';

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
 * The high level numbers of a profiler run, as cards for the summary.
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

const renderStatusChip = (
  profilerOutput: ?ProfilerOutput,
  profilingInProgress: boolean
) => {
  if (profilingInProgress) {
    return (
      <StatusChip tone="progress" loading label={<Trans>Profiling...</Trans>} />
    );
  }
  if (profilerOutput) {
    return (
      <StatusChip
        tone="info"
        icon={<History />}
        label={<Trans>Last run</Trans>}
      />
    );
  }
  return <StatusChip icon={<StatusDot />} label={<Trans>Never run</Trans>} />;
};

type Props = {|
  onStart: () => void,
  onStop: () => void,
  profilerOutput: ?ProfilerOutput,
  profilingInProgress: boolean,
|};

const Profiler = ({
  onStart,
  onStop,
  profilerOutput,
  profilingInProgress,
}: Props): React.Node => {
  // While a run is in progress, the numbers of the previous one are not shown:
  // they would look like the ones being measured.
  const shownProfilerOutput = profilingInProgress ? null : profilerOutput;

  return (
    <Background>
      <div className={classes.header}>
        {/* The panel is already titled "Profiler" by the window holding it. */}
        {renderStatusChip(profilerOutput, profilingInProgress)}
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
      </div>
      {profilingInProgress && (
        <div className={classes.progressBar}>
          <LinearProgress style={{ height: 2 }} />
        </div>
      )}
      <ScrollView
        autoHideScrollbar
        // A column, so that the message shown when there is nothing to see
        // is centered in the whole panel.
        style={{ display: 'flex', flexDirection: 'column' }}
      >
        {shownProfilerOutput ? (
          <div className={classes.content}>
            <div className={classes.section}>
              <Text noMargin size="body-small" color="secondary">
                <Trans>Summary</Trans>
              </Text>
              <div className={classes.statsGrid}>
                {getStats(shownProfilerOutput).map((stat, index) => (
                  <div className={classes.statCard} key={index}>
                    <Text noMargin size="body-small" color="secondary">
                      {stat.label}
                    </Text>
                    <Text
                      noMargin
                      size="block-title"
                      style={{ fontVariantNumeric: 'tabular-nums' }}
                    >
                      {stat.value}
                    </Text>
                    {stat.note && (
                      <Text noMargin size="body-small" color="secondary">
                        {stat.note}
                      </Text>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className={classes.section}>
              <Text noMargin size="body-small" color="secondary">
                <Trans>Time spent in each section of a frame</Trans>
              </Text>
              <MeasuresTable
                profilerMeasures={shownProfilerOutput.framesAverageMeasures}
              />
            </div>
          </div>
        ) : (
          <EmptyMessage>
            {profilingInProgress ? (
              <Trans>
                Profiling: stop it after a few seconds to see the results.
              </Trans>
            ) : (
              <Trans>
                Start profiling and then stop it after a few seconds to see the
                results.
              </Trans>
            )}
          </EmptyMessage>
        )}
      </ScrollView>
    </Background>
  );
};

export default Profiler;
