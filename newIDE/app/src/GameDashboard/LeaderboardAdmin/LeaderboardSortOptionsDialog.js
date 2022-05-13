// @flow
import React from 'react';
import { t, Trans } from '@lingui/macro';
import { I18n } from '@lingui/react';
import { type I18n as I18nType } from '@lingui/core';

import Dialog from '../../UI/Dialog';
import FlatButton from '../../UI/FlatButton';
import { ColumnStackLayout } from '../../UI/Layout';
import RaisedButton from '../../UI/RaisedButton';
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

const isWholeNumber = (value: any): boolean =>
  value === null || Number.isInteger(value);

type SortOptions = {|
  sort: LeaderboardSortOption,
  extremeAllowedScore: ?number,
|};

type Props = {
  open: boolean,
  sort?: LeaderboardSortOption,
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
  ] = React.useState<number>(0);

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
    if (!isWholeNumber(extremeAllowedScoreValue)) {
      setExtremeAllowedScoreError(
        i18n._(
          t`The extreme score must be a whole number between ${extremeAllowedScoreMin} and ${extremeAllowedScoreMax}.`
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
          open={open}
          maxWidth="sm"
          onRequestClose={() => {
            if (!isLoading) onClose();
          }}
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
            <RaisedButton
              primary
              label={<Trans>Save</Trans>}
              disabled={isLoading}
              onClick={() => onSaveSettings(i18n)}
              key={'save'}
            />,
          ]}
          onApply={() => {
            onSaveSettings(i18n);
          }}
        >
          <Text size="title">
            <Trans>Sort order</Trans>
          </Text>
          <ColumnStackLayout>
            <SelectField
              fullWidth
              value={sortOrder}
              floatingLabelText={<Trans>Scores sort order</Trans>}
              onChange={(e, i, newValue) => {
                // $FlowIgnore
                setSortOrder(newValue);
              }}
            >
              <SelectOption
                key={'ASC'}
                value={'ASC'}
                primaryText={t`Lower is better`}
              />
              <SelectOption
                key={'DESC'}
                value={'DESC'}
                primaryText={t`Higher is better`}
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
                        `Any submitted score that is ${
                          sortOrder === 'ASC' ? 'lower' : 'higher'
                        } than the set value will not be saved in the leaderboard.`
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
                    <Trans>
                      {sortOrder === 'ASC' ? 'Minimum' : 'Maximum'} score
                    </Trans>
                  }
                  value={extremeAllowedScoreValue}
                  errorText={extremeAllowedScoreError}
                  min={extremeAllowedScoreMin}
                  max={extremeAllowedScoreMax}
                  onChange={(e, newValue: string) => {
                    if (!!extremeAllowedScoreError) {
                      setExtremeAllowedScoreError(null);
                    }

                    setExtremeAllowedScoreValue(parseInt(newValue));
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
