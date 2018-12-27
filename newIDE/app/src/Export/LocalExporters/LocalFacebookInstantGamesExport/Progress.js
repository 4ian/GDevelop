// @flow
import * as React from 'react';
import { Step, Stepper, StepLabel, StepContent } from 'material-ui/Stepper';
import CircularProgress from 'material-ui/CircularProgress';
import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';
import { Line, Spacer } from '../../../UI/Grid';
import { type LocalFacebookInstantGamesExportStep } from '.';

type Props = {|
  exportStep: LocalFacebookInstantGamesExportStep,
  errored: boolean,
  onOpenExportFolder: () => void,
  onOpenLearnMore: () => void,
|};

export default ({
  exportStep,
  errored,
  onOpenExportFolder,
  onOpenLearnMore,
}: Props) => (
  <Stepper
    activeStep={
      exportStep === 'export'
        ? 0
        : exportStep === 'compress'
        ? 1
        : exportStep === 'done'
        ? 2
        : undefined
    }
    orientation="vertical"
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
            Can't compress the game. Please check that you have rights to write
            on this computer.
          </p>
        ) : (
          <Line alignItems="center">
            <CircularProgress size={20} />
            <Spacer />
            <p>Compressing...</p>
          </Line>
        )}
      </StepContent>
    </Step>
    <Step>
      <StepLabel>Export finished</StepLabel>
      <StepContent>
        <Line expand>
          You can now create a game on Facebook Instant Games, if not already
          done, and upload the archive generated.
        </Line>
        <Line expand>
          <FlatButton label="Open folder" onClick={onOpenExportFolder} />
          <RaisedButton
            label="Learn more about Instant Games publication"
            primary
            onClick={onOpenLearnMore}
          />
        </Line>
      </StepContent>
    </Step>
  </Stepper>
);
