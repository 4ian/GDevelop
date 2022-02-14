// @flow
import { Trans } from '@lingui/macro';

import * as React from 'react';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import StepContent from '@material-ui/core/StepContent';
import CircularProgress from '@material-ui/core/CircularProgress';
import LinearProgress from '@material-ui/core/LinearProgress';
import { Line, Spacer, Column } from '../../UI/Grid';
import BuildProgressAndActions from './BuildProgressAndActions';
import { type Build } from '../../Utils/GDevelopServices/Build';
import EmptyMessage from '../../UI/EmptyMessage';
import Text from '../../UI/Text';
import AlertMessage from '../../UI/AlertMessage';

const styles = {
  stepper: { flex: 1 },
  linearProgress: { flex: 1 },
};

export type BuildStep =
  | ''
  | 'register'
  | 'export'
  | 'resources-download'
  | 'compress'
  | 'upload'
  | 'waiting-for-build'
  | 'build'
  | 'done';

type Props = {|
  exportStep: BuildStep,
  build: ?Build,
  stepMaxProgress: number,
  stepCurrentProgress: number,
  errored: boolean,
  showSeeAllMyBuildsExplanation?: boolean,
  hasBuildStep: boolean,
|};

/**
 * Can be used in an exporter to show the overall progress of a build
 * (including local archiving/upload steps and remote build progress)
 */
export default ({
  exportStep,
  build,
  stepMaxProgress,
  stepCurrentProgress,
  errored,
  hasBuildStep,
  showSeeAllMyBuildsExplanation,
}: Props) => {
  const getActiveStep = React.useCallback(
    () =>
      exportStep === 'register' ||
      exportStep === 'export' ||
      exportStep === 'resources-download'
        ? 0
        : exportStep === 'compress' || exportStep === 'upload'
        ? 1
        : exportStep === 'waiting-for-build' || exportStep === 'build'
        ? 2
        : exportStep === 'done'
        ? hasBuildStep
          ? 2
          : 1
        : -1,
    [exportStep, hasBuildStep]
  );

  return (
    <Stepper
      activeStep={getActiveStep()}
      orientation="vertical"
      style={styles.stepper}
    >
      <Step>
        <StepLabel>
          <Trans>Game export</Trans>
        </StepLabel>
        <StepContent>
          {errored ? (
            <AlertMessage kind="error">
              <Trans>Can't properly export the game.</Trans>{' '}
              <Trans>
                Please check your internet connection or try again later.
              </Trans>
            </AlertMessage>
          ) : exportStep === 'resources-download' ? (
            <Column expand noMargin>
              <Text>
                <Trans>Downloading game resources...</Trans>
              </Text>
              <Line expand>
                <LinearProgress
                  style={styles.linearProgress}
                  value={
                    stepMaxProgress > 0
                      ? (stepCurrentProgress / stepMaxProgress) * 100
                      : 0
                  }
                  variant="determinate"
                />
              </Line>
            </Column>
          ) : (
            <Column expand noMargin>
              <Text>
                <Trans>Export in progress...</Trans>
              </Text>
              <Line expand>
                <LinearProgress style={styles.linearProgress} />
              </Line>
            </Column>
          )}
        </StepContent>
      </Step>
      {hasBuildStep && (
        <Step>
          <StepLabel>
            <Trans>Upload to build service</Trans>
          </StepLabel>
          <StepContent>
            {errored ? (
              <AlertMessage kind="error">
                <Trans>Can't upload your game to the build service.</Trans>{' '}
                <Trans>
                  Please check your internet connection or try again later.
                </Trans>
              </AlertMessage>
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
                  value={
                    stepMaxProgress > 0
                      ? (stepCurrentProgress / stepMaxProgress) * 100
                      : 0
                  }
                  variant="determinate"
                />
              </Line>
            )}
          </StepContent>
        </Step>
      )}
      {hasBuildStep && (
        <Step>
          <StepLabel>
            <Trans>Build and download</Trans>
          </StepLabel>
          <StepContent>
            {errored && (
              <AlertMessage kind="error">
                <Trans>
                  Build could not start or errored. Please check your internet
                  connection or try again later.
                </Trans>
              </AlertMessage>
            )}
            {!build && !errored && (
              <Text>
                <Trans>Build is starting...</Trans>
              </Text>
            )}
            {build && <BuildProgressAndActions build={build} />}
            {showSeeAllMyBuildsExplanation && (
              <EmptyMessage>
                <Trans>
                  If you close this window while the build is being done, you
                  can see its progress and download the game later by clicking
                  on See All My Builds below.
                </Trans>
              </EmptyMessage>
            )}
          </StepContent>
        </Step>
      )}
      {!hasBuildStep && (
        <Step>
          <StepLabel>
            <Trans>Done</Trans>
          </StepLabel>
          <StepContent />
        </Step>
      )}
    </Stepper>
  );
};
