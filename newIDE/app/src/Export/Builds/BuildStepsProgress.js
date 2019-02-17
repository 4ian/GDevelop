// @flow
import { Trans } from '@lingui/macro';

import * as React from 'react';
import { Step, Stepper, StepLabel, StepContent } from 'material-ui/Stepper';
import CircularProgress from 'material-ui/CircularProgress';
import LinearProgress from 'material-ui/LinearProgress';
import { Line, Spacer } from '../../UI/Grid';
import BuildProgress from './BuildProgress';
import { type Build } from '../../Utils/GDevelopServices/Build';
import EmptyMessage from '../../UI/EmptyMessage';

const styles = {
  stepper: { flex: 1 },
};

export type BuildStep =
  | ''
  | 'export'
  | 'compress'
  | 'upload'
  | 'waiting-for-build'
  | 'build';

type Props = {|
  exportStep: BuildStep,
  onDownload: (key: string) => void,
  build: ?Build,
  uploadMax: number,
  uploadProgress: number,
  errored: boolean,
  showSeeAllMyBuildsExplanation?: boolean,
|};

/**
 * Can be used in an exporter to show the overall progress of a build
 * (including local archiving/upload steps and remote build progress)
 */
export default ({
  exportStep,
  onDownload,
  build,
  uploadMax,
  uploadProgress,
  errored,
  showSeeAllMyBuildsExplanation,
}: Props) => (
  <Stepper
    activeStep={
      exportStep === 'export'
        ? 0
        : exportStep === 'compress' || exportStep === 'upload'
        ? 1
        : exportStep === 'waiting-for-build' || exportStep === 'build'
        ? 2
        : undefined
    }
    orientation="vertical"
    style={styles.stepper}
  >
    <Step>
      <StepLabel>Game export</StepLabel>
      <StepContent>
        <Line alignItems="center">
          <CircularProgress size={20} />
          <Spacer />
          <p>
            <Trans>Export in progress...</Trans>
          </p>
        </Line>
      </StepContent>
    </Step>
    <Step>
      <StepLabel>Upload to build service</StepLabel>
      <StepContent>
        {errored ? (
          <p>
            <Trans>
              Can't upload your game to the build service. Please check your
              internet connection or try again later.
            </Trans>
          </p>
        ) : exportStep === 'compress' ? (
          <Line alignItems="center">
            <CircularProgress size={20} />
            <Spacer />
            <p>
              <Trans>Compressing before upload...</Trans>
            </p>
          </Line>
        ) : (
          <Line alignItems="center" expand>
            <LinearProgress
              style={{ flex: 1 }}
              max={uploadMax}
              value={uploadProgress}
              mode="determinate"
            />
          </Line>
        )}
      </StepContent>
    </Step>
    <Step>
      <StepLabel>Build and download</StepLabel>
      <StepContent>
        {!build && (
          <p>
            <Trans>Build is starting...</Trans>
          </p>
        )}
        {build && <BuildProgress build={build} onDownload={onDownload} />}
        {showSeeAllMyBuildsExplanation && (
          <EmptyMessage>
            <Trans>
              If you close this window while the build is being done, you can
              see its progress and download the game later by clicking on See
              All My Builds below.
            </Trans>
          </EmptyMessage>
        )}
      </StepContent>
    </Step>
  </Stepper>
);
