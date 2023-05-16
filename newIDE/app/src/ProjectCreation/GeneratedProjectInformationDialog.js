// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';
import Dialog from '../UI/Dialog';
import { ColumnStackLayout } from '../UI/Layout';
import { Spacer } from '../UI/Grid';
import { type GeneratedProject } from '../Utils/GDevelopServices/Generation';
import Text from '../UI/Text';
import RaisedButton from '../UI/RaisedButton';
import RobotIcon from './RobotIcon';
import AlertMessage from '../UI/AlertMessage';

type Props = {|
  generatedProject: GeneratedProject,
  onClose: () => void,
|};

const GeneratedProjectInformationDialog = ({
  generatedProject,
  onClose,
}: Props): React.Node => {
  const formattedLayoutExplanations = React.useMemo(
    () =>
      generatedProject.layoutExplanation &&
      generatedProject.layoutExplanation.split('. '),
    [generatedProject.layoutExplanation]
  );

  return (
    <Dialog
      open
      title={null} // Don't display the title, we handle it inside the dialog
      id="project-generated-information-dialog"
      maxWidth="sm"
      actions={[
        <RaisedButton
          key="continue"
          primary
          label={<Trans>Continue</Trans>}
          onClick={onClose}
        />,
      ]}
      onRequestClose={onClose}
      onApply={onClose}
    >
      <ColumnStackLayout noMargin alignItems="center">
        <Text size="section-title" align="center">
          <Trans>Your scene is ready</Trans>
        </Text>
        <Spacer />
        <RobotIcon />
        <Spacer />
        <Text size="sub-title" align="center">
          {generatedProject.synopsis}
        </Text>
        {formattedLayoutExplanations && (
          <AlertMessage kind="info">
            {formattedLayoutExplanations.map((explanation, index) => (
              <Text noMargin>{explanation}</Text>
            ))}
          </AlertMessage>
        )}
        <Text size="sub-title" align="center">
          <Trans>You can now continue creating this game!</Trans>
        </Text>
      </ColumnStackLayout>
    </Dialog>
  );
};

export default GeneratedProjectInformationDialog;
