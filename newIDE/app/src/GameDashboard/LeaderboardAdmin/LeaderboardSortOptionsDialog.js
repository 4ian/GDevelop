// @flow
import React from 'react';
import { t, Trans } from '@lingui/macro';
import { I18n } from '@lingui/react';
import { type I18n as I18nType } from '@lingui/core';

import Dialog, { DialogPrimaryButton } from '../../UI/Dialog';
import FlatButton from '../../UI/FlatButton';
import { ColumnStackLayout } from '../../UI/Layout';
import SelectField from '../../UI/SelectField';
import SelectOption from '../../UI/SelectOption';
import Text from '../../UI/Text';
import TextField from '../../UI/TextField';

import { type LeaderboardSortOption } from '../../Utils/GDevelopServices/Play';
import { Column, LargeSpacer, Line } from '../../UI/Grid';
import HelpButton from '../../UI/HelpButton';
import Checkbox from '../../UI/Checkbox';
import { FormHelperText } from '@material-ui/core';
import { MarkdownText } from '../../UI/MarkdownText';

type SortOptions = {|
  sort: LeaderboardSortOption,
  extremeAllowedScore: ?number,
|};

type Props = {
  open: boolean,
  sort: LeaderboardSortOption,
  extremeAllowedScore?: number,
  onSave: SortOptions => Promise<void>,
  onClose: () => void,
};

const extremeAllowedScoreMax = Number.MAX_SAFE_INTEGER;
const extremeAllowedScoreMin = Number.MIN_SAFE_INTEGER;

function LeaderboardSortOptionsDialog({
  open,
  onClose,
  onSave,
  sort,
  extremeAllowedScore,
}: Props) {
  const [isLoading, setIsLoading] = React.useState<boolean>(false);

  const [
    extremeAllowedScoreError,
    setExtremeAllowedScoreError,
  ] = React.useState<?string>(null);
  const [
    displayExtremeAllowedScoreInput,
    setDisplayExtremeAllowedScoreInput,
  ] = React.useState<boolean>(extremeAllowedScore !== undefined);
  const [
    extremeAllowedScoreValue,
    setExtremeAllowedScoreValue,
  ] = React.useState<number>(extremeAllowedScore || 0);

  const [sortOrder, setSortOrder] = React.useState<LeaderboardSortOption>(
    sort || 'ASC'
  );

  const onSaveSettings = async (i18n: I18nType) => {
    if (displayExtremeAllowedScoreInput) {
      if (extremeAllowedScoreValue > extremeAllowedScoreMax) {
        setExtremeAllowedScoreError(
          i18n._(t`Extreme score must be lower than ${extremeAllowedScoreMax}.`)
        );
        return;
      }
      if (extremeAllowedScoreValue < extremeAllowedScoreMin) {
        setExtremeAllowedScoreError(
          i18n._(
            t`Extreme score must be equal or higher than ${extremeAllowedScoreMin}.`
          )
        );
        return;
      }
    }
    if (isNaN(extremeAllowedScoreValue)) {
      setExtremeAllowedScoreError(
        i18n._(
          t`Limit cannot be empty, uncheck or fill a value between ${extremeAllowedScoreMin} and ${extremeAllowedScoreMax}.`
        )
      );
      return;
    }
    setIsLoading(true);
    const sortOrderSettings = {
      sort: sortOrder,
      extremeAllowedScore: displayExtremeAllowedScoreInput
        ? extremeAllowedScoreValue
        : null,
    };
    await onSave(sortOrderSettings);
  };

  return (
    <I18n>
      {({ i18n }) => (
        <Dialog
          title={<Trans>Leaderboard options</Trans>}
          open={open}
          maxWidth="sm"
          secondaryActions={[
            <HelpButton
              key="help"
              helpPagePath="/interface/games-dashboard/leaderboard-administration"
              anchor="change_the_appearance_of_a_leaderboard"
            />,
          ]}
          actions={[
            <FlatButton
              label={<Trans>Cancel</Trans>}
              disabled={isLoading}
              onClick={onClose}
              key={'cancel'}
            />,
            <DialogPrimaryButton
              primary
              label={<Trans>Save</Trans>}
              disabled={isLoading}
              onClick={() => onSaveSettings(i18n)}
              key={'save'}
            />,
          ]}
          cannotBeDismissed={isLoading}
          onRequestClose={onClose}
          onApply={() => {
            onSaveSettings(i18n);
          }}
        >
          <Text size="block-title">
            <Trans>Sort order</Trans>
          </Text>
          <ColumnStackLayout noMargin>
            <SelectField
              fullWidth
              value={sortOrder}
              floatingLabelText={<Trans>Scores sort order</Trans>}
              onChange={(e, i, newValue) => {
                // $FlowFixMe - new value is of type LeaderboardSortOption (either ASC or DESC)
                setSortOrder(newValue);
              }}
            >
              <SelectOption
                key={'ASC'}
                value={'ASC'}
                label={t`Lower is better`}
              />
              <SelectOption
                key={'DESC'}
                value={'DESC'}
                label={t`Higher is better`}
              />
            </SelectField>
            <Checkbox
              label={
                <>
                  <Line noMargin>
                    <Trans>Limit scores</Trans>
                  </Line>
                  <FormHelperText style={{ display: 'inline' }}>
                    <MarkdownText
                      source={i18n._(
                        sortOrder === 'ASC'
                          ? t`Any submitted score that is lower than the set value will not be saved in the leaderboard.`
                          : t`Any submitted score that is higher than the set value will not be saved in the leaderboard.`
                      )}
                    />
                  </FormHelperText>
                </>
              }
              checked={displayExtremeAllowedScoreInput}
              onCheck={() =>
                setDisplayExtremeAllowedScoreInput(
                  !displayExtremeAllowedScoreInput
                )
              }
            />
          </ColumnStackLayout>
          {displayExtremeAllowedScoreInput && (
            <Column noMargin>
              <Line>
                <LargeSpacer />
                <TextField
                  fullWidth
                  type="number"
                  floatingLabelText={
                    sortOrder === 'ASC' ? (
                      <Trans>Minimum score</Trans>
                    ) : (
                      <Trans>Maximum score</Trans>
                    )
                  }
                  value={extremeAllowedScoreValue}
                  errorText={extremeAllowedScoreError}
                  min={extremeAllowedScoreMin}
                  max={extremeAllowedScoreMax}
                  onChange={(e, newValue: string) => {
                    if (!!extremeAllowedScoreError) {
                      setExtremeAllowedScoreError(null);
                    }

                    setExtremeAllowedScoreValue(parseFloat(newValue));
                  }}
                />
              </Line>
            </Column>
          )}
        </Dialog>
      )}
    </I18n>
  );
}

export default LeaderboardSortOptionsDialog;
