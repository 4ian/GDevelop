import * as React from 'react';
import RaisedButton from 'material-ui/RaisedButton';
import { Step, Stepper, StepLabel, StepContent } from 'material-ui/Stepper';
import CircularProgress from 'material-ui/CircularProgress';
import LinearProgress from 'material-ui/LinearProgress';
import TextField from 'material-ui/TextField';
import { Line, Spacer } from '../../UI/Grid';

export default ({
  exportStep,
  downloadUrl,
  onDownload,
  uploadMax,
  uploadProgress,
  buildMax,
  buildProgress,
  errored,
}) => (
  <Stepper
    activeStep={
      exportStep === 'export'
        ? 0
        : exportStep === 'compress' || exportStep === 'upload'
          ? 1
          : exportStep === 'waiting-for-build' || exportStep === 'build'
            ? 2
            : exportStep === 'done' ? 3 : undefined
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
            Can't upload your game to the build service. Please check your
            internet connection or try again later
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
      <StepLabel>Build</StepLabel>
      <StepContent>
        {errored ? (
          <p>
            Something wrong happened :(
          </p>
        ) : exportStep === 'waiting-for-build' ? (
          <Line alignItems="center">
            <CircularProgress size={20} />
            <Spacer />
            <p>Waiting for build to start...</p>
          </Line>
        ) : (
          <Line alignItems="center" expand>
            <LinearProgress
              style={{ flex: 1 }}
              max={buildMax}
              value={buildProgress}
              mode="determinate"
            />
          </Line>
        )}
      </StepContent>
    </Step>
    <Step>
      <StepLabel>Download</StepLabel>
      <StepContent>
        <Line alignItems="baseline" expand>
          You game is available here:
          <Spacer />
          <TextField value={downloadUrl} style={{ flex: 1 }} />
          <Spacer />
          <RaisedButton label="Download" primary onClick={onDownload} />
        </Line>
        <Line expand>
          You can download it on your Android phone and install it.
        </Line>
      </StepContent>
    </Step>
  </Stepper>
);
