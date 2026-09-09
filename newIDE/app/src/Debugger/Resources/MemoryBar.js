// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import classNames from 'classnames';
import GDevelopThemeContext from '../../UI/Theme/GDevelopThemeContext';
import Text from '../../UI/Text';
import TextField from '../../UI/TextField';
import FlatButton from '../../UI/FlatButton';
import Tooltip from '@material-ui/core/Tooltip';
import {
  computeMemorySegments,
  formatBytes,
  getMemoryBytesByKind,
  type ResourceLoadRecord,
  type ResourcesDebugState,
} from './ResourcesDebugTypes';
import { getResourceKindColor } from '../themeColors';
import classes from './Resources.module.css';

type Props = {|
  state: ResourcesDebugState,
  /** The resources shown (after filtering). */
  records: Array<ResourceLoadRecord>,
  limitBytes: number,
  artificialLimitMegabytes: ?number,
  onChangeArtificialLimitMegabytes: (?number) => void,
  selectedResourceName: ?string,
  onSelectResource: (?string) => void,
|};

/**
 * How the memory of the device (or an artificial limit) is filled by the
 * loaded resources: one segment per resource, colored by kind.
 */
const MemoryBar = ({
  state,
  records,
  limitBytes,
  artificialLimitMegabytes,
  onChangeArtificialLimitMegabytes,
  selectedResourceName,
  onSelectResource,
}: Props): React.Node => {
  const gdevelopTheme = React.useContext(GDevelopThemeContext);
  const memorySegments = React.useMemo(
    () => computeMemorySegments(records, limitBytes),
    [records, limitBytes]
  );
  const bytesByKind = React.useMemo(
    () => getMemoryBytesByKind(memorySegments.segments),
    [memorySegments]
  );
  // Neighbouring segments of the same kind alternate between two shades.
  const shadeBySegmentIndex = React.useMemo(
    () => {
      const shades = [];
      let lastKind = null;
      let shade = 0;
      for (const segment of memorySegments.segments) {
        const kind = segment.record ? segment.record.kind : null;
        shade = kind === lastKind ? (shade + 1) % 2 : 0;
        lastKind = kind;
        shades.push(shade);
      }
      return shades;
    },
    [memorySegments]
  );
  const usedHeapShare =
    state.device.usedJSHeapSize != null && memorySegments.limitBytes > 0
      ? state.device.usedJSHeapSize / memorySegments.limitBytes
      : null;

  const limitDescription =
    artificialLimitMegabytes != null && artificialLimitMegabytes > 0 ? (
      <Trans>artificial limit</Trans>
    ) : state.device.deviceMemoryBytes ? (
      <Trans>memory of the device</Trans>
    ) : state.device.jsHeapSizeLimit ? (
      <Trans>limit of the JavaScript heap</Trans>
    ) : (
      <Trans>sum of the loaded resources</Trans>
    );

  return (
    <div className={classes.section}>
      <div className={classes.sectionTitleRow}>
        <Text noMargin size="body-small" color="secondary">
          <Trans>
            Estimated memory: {formatBytes(memorySegments.knownBytes)} of{' '}
            {formatBytes(memorySegments.limitBytes)} ({limitDescription})
            {memorySegments.unknownResourcesCount > 0 ? (
              <Trans>
                , plus {memorySegments.unknownResourcesCount} loaded resources
                of unknown size
              </Trans>
            ) : null}
          </Trans>
        </Text>
        <div className={classes.headerRow}>
          <div className={classes.memoryLimitField}>
            <TextField
              type="number"
              margin="none"
              min={1}
              value={
                artificialLimitMegabytes != null ? artificialLimitMegabytes : ''
              }
              onChange={(event, value) => {
                const megabytes = parseFloat(value);
                onChangeArtificialLimitMegabytes(
                  Number.isFinite(megabytes) && megabytes > 0 ? megabytes : null
                );
              }}
              floatingLabelText={<Trans>Memory limit (MB)</Trans>}
              fullWidth
            />
          </div>
          {artificialLimitMegabytes != null && (
            <FlatButton
              label={<Trans>Reset</Trans>}
              onClick={() => onChangeArtificialLimitMegabytes(null)}
            />
          )}
        </div>
      </div>
      <div
        className={classNames(classes.memoryBar, {
          [classes.memoryBarOverLimit]: memorySegments.isOverLimit,
        })}
      >
        {memorySegments.segments.map((segment, index) => {
          const record = segment.record;
          const title = record ? (
            <span>
              {record.name} ({record.kind})
              <br />
              {formatBytes(segment.bytes)} ({(segment.share * 100).toFixed(1)}%
              of the limit)
            </span>
          ) : (
            <Trans>
              {memorySegments.unknownResourcesCount} loaded resources of unknown
              size
            </Trans>
          );
          return (
            <Tooltip key={record ? record.name : 'unknown'} title={title}>
              <div
                className={classNames(classes.memorySegment, {
                  [classes.memorySegmentUnknown]: segment.isUnknown,
                  [classes.memorySegmentSelected]:
                    !!record && record.name === selectedResourceName,
                })}
                style={{
                  width: `${Math.min(100, segment.share * 100)}%`,
                  backgroundColor: record
                    ? getResourceKindColor(
                        gdevelopTheme,
                        record.kind,
                        shadeBySegmentIndex[index]
                      )
                    : undefined,
                }}
                onClick={() =>
                  onSelectResource(
                    record && record.name !== selectedResourceName
                      ? record.name
                      : null
                  )
                }
              />
            </Tooltip>
          );
        })}
        {usedHeapShare != null && usedHeapShare <= 1 && (
          <Tooltip
            title={
              <Trans>
                JavaScript heap used by the game:{' '}
                {formatBytes(state.device.usedJSHeapSize)}
              </Trans>
            }
          >
            <div
              className={classes.memoryHeapMarker}
              style={{ left: `${usedHeapShare * 100}%`, pointerEvents: 'auto' }}
            />
          </Tooltip>
        )}
      </div>
      <div className={classes.legend}>
        {bytesByKind.map(entry => (
          <div className={classes.legendItem} key={entry.kind}>
            <span
              className={classes.legendSwatch}
              style={{
                backgroundColor: getResourceKindColor(
                  gdevelopTheme,
                  entry.kind
                ),
              }}
            />
            <Text noMargin size="body-small" color="secondary">
              {entry.kind}: {formatBytes(entry.bytes)} ({entry.count})
            </Text>
          </div>
        ))}
        {!memorySegments.isOverLimit && (
          <div className={classes.legendItem}>
            <span
              className={classNames(classes.legendSwatch, classes.legendFree)}
            />
            <Text noMargin size="body-small" color="secondary">
              <Trans>
                free:{' '}
                {formatBytes(
                  memorySegments.limitBytes - memorySegments.knownBytes
                )}
              </Trans>
            </Text>
          </div>
        )}
        {memorySegments.unknownResourcesCount > 0 && (
          <div className={classes.legendItem}>
            <span
              className={classNames(
                classes.legendSwatch,
                classes.memorySegmentUnknown
              )}
            />
            <Text noMargin size="body-small" color="secondary">
              <Trans>
                unknown size ({memorySegments.unknownResourcesCount})
              </Trans>
            </Text>
          </div>
        )}
      </div>
      {memorySegments.isOverLimit && (
        <Text noMargin size="body-small" color="error">
          <Trans>
            The loaded resources exceed the limit by{' '}
            {formatBytes(memorySegments.knownBytes - memorySegments.limitBytes)}
            .
          </Trans>
        </Text>
      )}
    </div>
  );
};

export default MemoryBar;
