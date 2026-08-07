// @flow

import * as React from 'react';
import { I18n } from '@lingui/react';
import { t, Trans } from '@lingui/macro';
import Dialog from '../../../../UI/Dialog';
import FlatButton from '../../../../UI/FlatButton';
import { CompactToggleField } from '../../../../UI/CompactToggleField';
import { Line } from '../../../../UI/Grid';
import TeamContext from '../../../../Profile/Team/TeamContext';

type Props = {|
  onClose: () => void,
|};

const AdvancedStudentOptionsDialog = ({ onClose }: Props): React.Node => {
  const { team, onUpdateTeam } = React.useContext(TeamContext);
  const [isUpdatingTeam, setIsUpdatingTeam] = React.useState<boolean>(false);

  const onToggleStudentsAskAi = React.useCallback(
    async (allowed: boolean) => {
      setIsUpdatingTeam(true);
      try {
        await onUpdateTeam({ classrooms: { hideAskAi: !allowed } });
      } catch (error) {
        console.error(
          'An error occurred while updating the team AI setting:',
          error
        );
      } finally {
        setIsUpdatingTeam(false);
      }
    },
    [onUpdateTeam]
  );

  return (
    <I18n>
      {({ i18n }) => (
        <Dialog
          title={<Trans>Advanced student options</Trans>}
          actions={[
            <FlatButton
              label={<Trans>Close</Trans>}
              disabled={isUpdatingTeam}
              key="close"
              primary={false}
              onClick={onClose}
            />,
          ]}
          maxWidth="sm"
          cannotBeDismissed={isUpdatingTeam}
          onRequestClose={onClose}
          open
        >
          <Line noMargin>
            <CompactToggleField
              label={i18n._(
                t`Allow students to use GDevelop's AI (disabled by default)`
              )}
              checked={
                !!team &&
                !!team.classrooms &&
                team.classrooms.hideAskAi === false
              }
              onCheck={allowed => {
                onToggleStudentsAskAi(allowed);
              }}
              disabled={isUpdatingTeam}
            />
          </Line>
        </Dialog>
      )}
    </I18n>
  );
};

export default AdvancedStudentOptionsDialog;
