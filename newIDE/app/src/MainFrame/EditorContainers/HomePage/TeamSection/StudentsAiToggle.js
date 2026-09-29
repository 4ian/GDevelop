// @flow

import * as React from 'react';
import { I18n } from '@lingui/react';
import { t } from '@lingui/macro';
import { CompactToggleField } from '../../../../UI/CompactToggleField';
import TeamContext from '../../../../Profile/Team/TeamContext';

const StudentsAiToggle = (): React.Node => {
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
        <CompactToggleField
          label={i18n._(t`Enable AI for students`)}
          checked={
            !!team && !!team.classrooms && team.classrooms.hideAskAi === false
          }
          onCheck={allowed => {
            onToggleStudentsAskAi(allowed);
          }}
          disabled={isUpdatingTeam}
        />
      )}
    </I18n>
  );
};

export default StudentsAiToggle;
