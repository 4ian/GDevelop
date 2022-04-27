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

import {
  type LeaderboardCustomizationSettings,
  type LeaderboardScoreFormattingTimeUnit,
} from '../../Utils/GDevelopServices/Play';
import { Column, Line } from '../../UI/Grid';
import {
  formatScore,
  orderedTimeUnits,
  unitToNextSeparator,
} from '../../Leaderboard/LeaderboardScoreFormatter';
import AlertMessage from '../../UI/AlertMessage';

const unitToAbbreviation = {
  hour: 'HH',
  minute: 'MM',
  second: 'SS',
  millisecond: 'ms',
};

const getIdentifierFromUnits = (units: {|
  smallestUnit: LeaderboardScoreFormattingTimeUnit,
  biggestUnit: LeaderboardScoreFormattingTimeUnit,
|}): string => {
  const biggestUnitIndex = orderedTimeUnits.indexOf(units.biggestUnit);
  const smallestUnitIndex = orderedTimeUnits.indexOf(units.smallestUnit);
  let identifier = '';
  for (let index = biggestUnitIndex; index <= smallestUnitIndex; index++) {
    const unit = orderedTimeUnits[index];
    identifier += `${unitToAbbreviation[unit]}${
      index === smallestUnitIndex ? '' : unitToNextSeparator[unit]
    }`;
  }
  return identifier;
};

const unitSelectOptions = orderedTimeUnits.reduce(
  (acc, currentUnit, currentUnitIndex) => {
    for (
      let otherUnitIndex = currentUnitIndex;
      otherUnitIndex < orderedTimeUnits.length;
      otherUnitIndex++
    ) {
      const selectedUnits = {
        biggestUnit: orderedTimeUnits[currentUnitIndex],
        smallestUnit: orderedTimeUnits[otherUnitIndex],
      };
      acc[getIdentifierFromUnits(selectedUnits)] = selectedUnits;
    }
    return acc;
  },
  {}
);

type Props = {
  open: boolean,
  leaderboardCustomizationSettings: ?LeaderboardCustomizationSettings,
  onSave: LeaderboardCustomizationSettings => Promise<void>,
  onClose: () => void,
};

const scorePreviewMaxValue = 999999999;
const precisionMinValue = -3;
const precisionMaxValue = 3;

function LeaderboardAppearanceDialog({
  open,
  onClose,
  onSave,
  leaderboardCustomizationSettings,
}: Props) {
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [scoreTitleError, setScoreTitleError] = React.useState<?string>(null);
  const [scoreTitle, setScoreTitle] = React.useState<string>(
    leaderboardCustomizationSettings
      ? leaderboardCustomizationSettings.scoreTitle
      : 'Score'
  );
  const [scoreType, setScoreType] = React.useState<'custom' | 'time'>(
    leaderboardCustomizationSettings
      ? leaderboardCustomizationSettings.scoreFormatting.type
      : 'custom'
  );
  const [prefix, setPrefix] = React.useState<string>(
    leaderboardCustomizationSettings &&
      leaderboardCustomizationSettings.scoreFormatting.type === 'custom'
      ? leaderboardCustomizationSettings.scoreFormatting.prefix
      : ''
  );
  const [suffix, setSuffix] = React.useState<string>(
    leaderboardCustomizationSettings &&
      leaderboardCustomizationSettings.scoreFormatting.type === 'custom'
      ? leaderboardCustomizationSettings.scoreFormatting.suffix
      : ''
  );
  const [precision, setPrecision] = React.useState<number>(
    leaderboardCustomizationSettings &&
      leaderboardCustomizationSettings.scoreFormatting.type === 'custom'
      ? leaderboardCustomizationSettings.scoreFormatting.precision
      : 0
  );
  const [timeUnits, setTimeUnits] = React.useState<string>(
    leaderboardCustomizationSettings &&
      leaderboardCustomizationSettings.scoreFormatting.type === 'time'
      ? getIdentifierFromUnits({
          smallestUnit:
            leaderboardCustomizationSettings.scoreFormatting.smallestUnit,
          biggestUnit:
            leaderboardCustomizationSettings.scoreFormatting.biggestUnit,
        })
      : getIdentifierFromUnits({
          biggestUnit: 'second',
          smallestUnit: 'millisecond',
        })
  );
  const [scorePreview, setScorePreview] = React.useState<number>(15.2659);

  const onSaveSettings = async (i18n: I18nType) => {
    if (!scoreTitle) {
      setScoreTitleError(i18n._(t`Title cannot be empty.`));
      return;
    }
    setIsLoading(true);
    const customizationSettings = {
      scoreTitle,
      scoreFormatting:
        scoreType === 'custom'
          ? {
              type: scoreType,
              prefix,
              suffix,
              precision,
            }
          : { type: scoreType, ...unitSelectOptions[timeUnits] },
    };
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
          <Line>
            <TextField
              fullWidth
              floatingLabelText={<Trans>Score column title</Trans>}
              maxLength={20}
              errorText={scoreTitleError}
              value={scoreTitle}
              onChange={(e, newTitle) => {
                if (!!scoreTitleError && !!newTitle) setScoreTitleError(null);
                setScoreTitle(newTitle);
              }}
            />
          </Line>
          <Text size="title">
            <Trans>Score formatting</Trans>
          </Text>
          <Column>
            <Line>
              <SelectField
                fullWidth
                value={scoreType}
                floatingLabelText={<Trans>Score display</Trans>}
                onChange={(e, i, newValue) =>
                  // $FlowIgnore
                  setScoreType(newValue)
                }
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
            </Line>
            <ResponsiveLineStackLayout noColumnMargin>
              <Column noMargin expand>
                <Line noMargin>
                  <Text size="body2">
                    <Trans>Settings</Trans>
                  </Text>
                </Line>
                {scoreType === 'custom' ? (
                  <>
                    <Line expand>
                      <TextField
                        fullWidth
                        floatingLabelText={<Trans>Prefix</Trans>}
                        maxLength={10}
                        value={prefix}
                        hintText={t`Ex: €`}
                        onChange={(e, newValue) => {
                          setPrefix(newValue);
                        }}
                      />
                    </Line>
                    <Line expand>
                      <TextField
                        fullWidth
                        floatingLabelText={<Trans>Suffix</Trans>}
                        maxLength={10}
                        value={suffix}
                        hintText={t`Ex: gold`}
                        onChange={(e, newValue) => {
                          setSuffix(newValue);
                        }}
                      />
                    </Line>
                    <Line expand>
                      <TextField
                        fullWidth
                        type="number"
                        floatingLabelText={<Trans>Round to X decimal point</Trans>}
                        value={isNaN(precision) ? '' : precision}
                        min={precisionMinValue}
                        max={precisionMaxValue}
                        onChange={(e, newValue) => {
                          setPrecision(
                            Math.max(
                              precisionMinValue,
                              Math.min(precisionMaxValue, parseFloat(newValue))
                            )
                          );
                        }}
                      />
                    </Line>
                  </>
                ) : (
                  <>
                    <Line>
                      <SelectField
                        fullWidth
                        value={timeUnits}
                        floatingLabelText={<Trans>Time format</Trans>}
                        onChange={(e, i, newValue) =>
                          // $FlowIgnore
                          setTimeUnits(newValue)
                        }
                      >
                        {Object.keys(unitSelectOptions).map(option => (
                          <SelectOption
                            key={option}
                            value={option}
                            primaryText={option}
                          />
                        ))}
                      </SelectField>
                    </Line>
                    <Line>
                      <AlertMessage kind="info">
                        <Trans>
                          To use this formatting, you must send a score
                          expressed in seconds
                        </Trans>
                      </AlertMessage>
                    </Line>
                  </>
                )}
              </Column>
              <Column expand noMargin>
                <Line noMargin>
                  <Text size="body2">
                    <Trans>Preview</Trans>
                  </Text>
                </Line>
                <Line>
                  <TextField
                    fullWidth
                    floatingLabelText={
                      scoreType === 'custom' ? (
                        <Trans>Test value</Trans>
                      ) : (
                        <Trans>Test value (in second)</Trans>
                      )
                    }
                    max={scorePreviewMaxValue}
                    min={0}
                    type="number"
                    value={isNaN(scorePreview) ? '' : scorePreview}
                    onChange={(e, value) =>
                      setScorePreview(
                        Math.max(
                          0,
                          Math.min(scorePreviewMaxValue, parseFloat(value))
                        )
                      )
                    }
                  />
                </Line>
                <Line>
                  <TextField
                    disabled
                    fullWidth
                    floatingLabelText={<Trans>Displayed score</Trans>}
                    value={formatScore(
                      scorePreview || 0,
                      scoreType === 'time'
                        ? {
                            type: scoreType,
                            ...unitSelectOptions[timeUnits],
                          }
                        : {
                            type: scoreType,
                            prefix,
                            suffix,
                            precision: precision || 0,
                          }
                    )}
                  />
                </Line>
              </Column>
            </ResponsiveLineStackLayout>
          </Column>
        </Dialog>
      )}
    </I18n>
  );
}

export default LeaderboardAppearanceDialog;
