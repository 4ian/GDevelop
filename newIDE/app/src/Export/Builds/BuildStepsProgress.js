// @flow
import * as React from 'react';
import { Step, Stepper, StepLabel, StepContent } from 'material-ui/Stepper';
import CircularProgress from 'material-ui/CircularProgress';
import LinearProgress from 'material-ui/LinearProgress';
import { Line, Spacer } from '../../UI/Grid';
import BuildProgress from './BuildProgress';
import { type Build } from '../../Utils/GDevelopServices/Build';

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
          <p>Export in progress...</p>
        </Line>
      </StepContent>
    </Step>
    <Step>
      <StepLabel>Upload to build service</StepLabel>
      <StepContent>
        {errored ? (
          <p>
            Can't upload your game to the build service. Please check your
            internet connection or try again later.
          </p>
        ) : exportStep === 'compress' ? (
          <Line alignItems="center">
            <CircularProgress size={20} />
            <Spacer />
            <p>Compressing before upload...</p>
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
        {!build && <p>Build is starting...</p>}
        {build && <BuildProgress build={build} onDownload={onDownload} />}
      </StepContent>
    </Step>
  </Stepper>
);
