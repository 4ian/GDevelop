// @flow
import React from 'react';
import { t, Trans } from '@lingui/macro';
import { I18n } from '@lingui/react';
import { type I18n as I18nType } from '@lingui/core';
import CompactSelectField from '../UI/CompactSelectField';
import SelectOption from '../UI/SelectOption';
import LeaderboardDialog from '../Leaderboard/LeaderboardDialog';
import { shortenUuidForDisplay } from '../Utils/GDevelopServices/Play';
import { useOnlineStatus } from '../Utils/OnlineStatus';
import CompactSemiControlledTextField from '../UI/CompactSemiControlledTextField';
import { useFetchLeaderboards } from '../EventsSheet/ParameterFields/LeaderboardIdField';
import { LineStackLayout } from '../UI/Layout';
import { Column } from '../UI/Grid';
import ElementWithMenu from '../UI/Menu/ElementWithMenu';
import IconButton from '../UI/IconButton';
import Edit from '../UI/CustomSvgIcons/Edit';
import { makeTimestampedId } from '../Utils/TimestampedId';

const styles = {
  icon: {
    fontSize: 18,
  },
};

const CompactLeaderboardIdPropertyField = ({
  project,
  value,
  onChange,
  id,
}: {|
  project: gdProject,
  value: string,
  onChange: (newValue: string) => void,
  id?: string,
|}) => {
  const idToUse = React.useRef<string>(id || makeTimestampedId());

  const isOnline = useOnlineStatus();
  const leaderboards = useFetchLeaderboards();
  const [isAdminOpen, setIsAdminOpen] = React.useState(false);

  const isCurrentValueInLeaderboardList =
    leaderboards &&
    !!leaderboards.find(leaderboard => leaderboard.id === value);

  const [isExpressionField, setIsExpressionField] = React.useState(
    !leaderboards || (!!value && !isCurrentValueInLeaderboardList)
  );

  const gameHasLeaderboards = leaderboards && leaderboards.length > 0;

  const selectOptions = React.useMemo(
    () =>
      leaderboards
        ? leaderboards.map(leaderboard => (
            <SelectOption
              key={leaderboard.id}
              value={leaderboard.id}
              label={`${leaderboard.name} ${
                leaderboard.id
                  ? `(${shortenUuidForDisplay(leaderboard.id)})`
                  : ''
              }`}
              shouldNotTranslate
            />
          ))
        : [],
    [leaderboards]
  );

  return (
    <I18n>
      {({ i18n }) => (
        <LineStackLayout noMargin expand id={idToUse.current}>
          <Column noMargin expand>
            {!isExpressionField ? (
              <CompactSelectField
                value={gameHasLeaderboards ? value : 'empty'}
                onChange={onChange}
              >
                {gameHasLeaderboards ? (
                  selectOptions
                ) : (
                  <SelectOption
                    disabled
                    key="empty"
                    value="empty"
                    label={i18n._(t`No leaderboards`)}
                  />
                )}
              </CompactSelectField>
            ) : (
              <CompactSemiControlledTextField
                onChange={onChange}
                value={value}
                errorText={
                  leaderboards ? null : isOnline ? (
                    <Trans>
                      Your game may not be registered, create one in the
                      leaderboard manager.
                    </Trans>
                  ) : (
                    <Trans>
                      Unable to fetch leaderboards as you are offline.
                    </Trans>
                  )
                }
              />
            )}
          </Column>
          <ElementWithMenu
            element={
              <IconButton size="small">
                <Edit style={styles.icon} />
              </IconButton>
            }
            buildMenuTemplate={(i18n: I18nType) => [
              {
                label: i18n._('Manage leaderboards'),
                click: () => setIsAdminOpen(true),
              },
              {
                label: isExpressionField
                  ? i18n._(t`Select the leaderboard from a list`)
                  : i18n._(t`Enter the leaderboard id`),
                disabled: !leaderboards,
                click: () => setIsExpressionField(!isExpressionField),
              },
            ]}
          />
          {isAdminOpen && !!project && (
            <LeaderboardDialog
              onClose={() => setIsAdminOpen(false)}
              open={isAdminOpen}
              project={project}
              leaderboardId={
                isCurrentValueInLeaderboardList ? value : undefined
              }
            />
          )}
        </LineStackLayout>
      )}
    </I18n>
  );
};

export default CompactLeaderboardIdPropertyField;
