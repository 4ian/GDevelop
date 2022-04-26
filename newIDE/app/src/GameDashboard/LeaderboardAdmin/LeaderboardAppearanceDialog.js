// @flow
import React from 'react';
import { t, Trans } from '@lingui/macro';
import { I18n } from '@lingui/react';
import { type I18n as I18nType } from '@lingui/core';

import Dialog from '../../UI/Dialog';
import FlatButton from '../../UI/FlatButton';
import { ResponsiveLineStackLayout } from '../../UI/Layout';
import RaisedButton from '../../UI/RaisedButton';
import SelectField from '../../UI/SelectField';
import SelectOption from '../../UI/SelectOption';
import Text from '../../UI/Text';
import TextField from '../../UI/TextField';

import { type LeaderboardCustomizationSettings } from '../../Utils/GDevelopServices/Play';

type Props = {
  open: boolean,
  leaderboardCustomizationSettings: ?LeaderboardCustomizationSettings,
  onSave: LeaderboardCustomizationSettings => Promise<void>,
  onClose: () => void,
};
function LeaderboardAppearanceDialog({
  open,
  onClose,
  onSave,
  leaderboardCustomizationSettings,
}: Props) {
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [scoreTitleError, setScoreTitleError] = React.useState<?string>(null);
  const [
    customizationSettings,
    setCustomizationSettings,
  ] = React.useState<LeaderboardCustomizationSettings>(
    leaderboardCustomizationSettings
      ? {
          ...leaderboardCustomizationSettings,
        }
      : {
          scoreTitle: 'Score',
          scoreFormatting: {
            type: 'custom',
            scorePrefix: '',
            scoreSuffix: '',
            precision: 0,
          },
        }
  );

  const onSaveSettings = async (i18n: I18nType) => {
    if (!customizationSettings.scoreTitle) {
      setScoreTitleError(i18n._(t`Title cannot be empty.`));
      return;
    }
    setIsLoading(true);
    await onSave(customizationSettings);
  };

  return (
    <I18n>
      {({ i18n }) => (
        <Dialog
          open={open}
          maxWidth="sm"
          onRequestClose={() => {
            if (!isLoading) onClose();
          }}
          actions={[
            <FlatButton
              label={<Trans>Cancel</Trans>}
              disabled={isLoading}
              onClick={onClose}
              key={'cancel'}
            />,
            <RaisedButton
              primary
              label={<Trans>Save</Trans>}
              disabled={isLoading}
              onClick={() => onSaveSettings(i18n)}
              key={'save'}
            />,
          ]}
        >
          <Text size="title">
            <Trans>Score formatting</Trans>
          </Text>
          <TextField
            fullWidth
            floatingLabelText={<Trans>Column title</Trans>}
            maxLength={20}
            errorText={scoreTitleError}
            value={customizationSettings.scoreTitle}
            onChange={(e, newTitle) => {
              setCustomizationSettings({
                scoreTitle: newTitle,
                scoreFormatting: { ...customizationSettings.scoreFormatting },
              });
            }}
          />
          <ResponsiveLineStackLayout>
            <SelectField
              value={customizationSettings.scoreFormatting.type}
              floatingLabelText={<Trans>Score display</Trans>}
            >
              <SelectOption
                key={'custom'}
                value={'custom'}
                primaryText={t`Custom display`}
              />
              <SelectOption
                key={'time'}
                value={'time'}
                primaryText={t`Display as time`}
              />
            </SelectField>
          </ResponsiveLineStackLayout>
        </Dialog>
      )}
    </I18n>
  );
}

export default LeaderboardAppearanceDialog;
