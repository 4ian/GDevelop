// @flow
import { Trans } from '@lingui/macro';

import * as React from 'react';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import StepContent from '@material-ui/core/StepContent';
import CircularProgress from '@material-ui/core/CircularProgress';
import RaisedButton from '../../../UI/RaisedButton';
import FlatButton from '../../../UI/FlatButton';
import Text from '../../../UI/Text';
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
        : -1
    }
    orientation="vertical"
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
        <Trans>Compression</Trans>
      </StepLabel>
      <StepContent>
        {errored ? (
          <Text>
            <Trans>
              Can't compress the game. Please check that you have rights to
              write on this computer.
            </Trans>
          </Text>
        ) : (
          <Line alignItems="center">
            <CircularProgress size={20} />
            <Spacer />
            <Text>
              <Trans>Compressing...</Trans>
            </Text>
          </Line>
        )}
      </StepContent>
    </Step>
    <Step>
      <StepLabel>
        <Trans>Export finished</Trans>
      </StepLabel>
      <StepContent>
        <Line expand>
          <Text>
            <Trans>
              You can now create a game on Facebook Instant Games, if not
              already done, and upload the generated archive.
            </Trans>
          </Text>
        </Line>
        <Line expand>
          <FlatButton
            label={<Trans>Open folder</Trans>}
            onClick={onOpenExportFolder}
          />
          <RaisedButton
            label={<Trans>Learn more about Instant Games publication</Trans>}
            primary
            onClick={onOpenLearnMore}
          />
        </Line>
      </StepContent>
    </Step>
  </Stepper>
);
