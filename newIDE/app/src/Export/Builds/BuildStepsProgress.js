// @flow
import { Trans } from '@lingui/macro';

import * as React from 'react';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import StepContent from '@material-ui/core/StepContent';
import CircularProgress from '@material-ui/core/CircularProgress';
import LinearProgress from '@material-ui/core/LinearProgress';
import { Line, Spacer } from '../../UI/Grid';
import BuildProgress from './BuildProgress';
import { type Build } from '../../Utils/GDevelopServices/Build';
import EmptyMessage from '../../UI/EmptyMessage';
import Text from '../../UI/Text';

const styles = {
  stepper: { flex: 1 },
  linearProgress: { flex: 1 },
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
        : -1
    }
    orientation="vertical"
    style={styles.stepper}
  >
    <Step>
      <StepLabel>
        <Trans>Game export</Trans>
      </StepLabel>
      <StepContent>
        <Line alignItems="center">
          <CircularProgress size={20} />
          <Spacer />
          <Text>
            <Trans>Export in progress...</Trans>
          </Text>
        </Line>
      </StepContent>
    </Step>
    <Step>
      <StepLabel>
        <Trans>Upload to build service</Trans>
      </StepLabel>
      <StepContent>
        {errored ? (
          <Text>
            <Trans>
              Can't upload your game to the build service. Please check your
              internet connection or try again later.
            </Trans>
          </Text>
        ) : exportStep === 'compress' ? (
          <Line alignItems="center">
            <CircularProgress size={20} />
            <Spacer />
            <Text>
              <Trans>Compressing before upload...</Trans>
            </Text>
          </Line>
        ) : (
          <Line alignItems="center" expand>
            <LinearProgress
              style={styles.linearProgress}
              value={uploadMax > 0 ? (uploadProgress / uploadMax) * 100 : 0}
              variant="determinate"
            />
          </Line>
        )}
      </StepContent>
    </Step>
    <Step>
      <StepLabel>
        <Trans>Build and download</Trans>
      </StepLabel>
      <StepContent>
        {errored && (
          <Text>
            <Trans>
              Build could not start or errored. Please check your internet
              connection or try again later.
            </Trans>
          </Text>
        )}
        {!build && !errored && (
          <Text>
            <Trans>Build is starting...</Trans>
          </Text>
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
