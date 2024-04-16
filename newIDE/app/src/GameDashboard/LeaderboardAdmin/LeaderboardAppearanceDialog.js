// @flow
import React from 'react';
import { t, Trans } from '@lingui/macro';
import { I18n } from '@lingui/react';
import { type I18n as I18nType } from '@lingui/core';

import Dialog, { DialogPrimaryButton } from '../../UI/Dialog';
import FlatButton from '../../UI/FlatButton';
import { ColumnStackLayout, ResponsiveLineStackLayout } from '../../UI/Layout';
import SelectField from '../../UI/SelectField';
import SelectOption from '../../UI/SelectOption';
import Text from '../../UI/Text';
import TextField from '../../UI/TextField';

import {
  canUserCustomizeLeaderboardTheme,
  getRGBLeaderboardTheme,
  type LeaderboardCustomizationSettings,
  type LeaderboardScoreFormattingTimeUnit,
} from '../../Utils/GDevelopServices/Play';
import { Column, Line, Spacer } from '../../UI/Grid';
import {
  formatScore,
  orderedTimeUnits,
  unitToNextSeparator,
} from '../../Leaderboard/LeaderboardScoreFormatter';
import AlertMessage from '../../UI/AlertMessage';
import HelpButton from '../../UI/HelpButton';
import ColorField from '../../UI/ColorField';
import AuthenticatedUserContext from '../../Profile/AuthenticatedUserContext';
import GetSubscriptionCard from '../../Profile/Subscription/GetSubscriptionCard';
import LeaderboardPlaygroundCard from './LeaderboardPlaygroundCard';
import { rgbStringToHexString } from '../../Utils/ColorTransformer';
import Link from '../../UI/Link';
import Window from '../../Utils/Window';
import Checkbox from '../../UI/Checkbox';
import SemiControlledTextField from '../../UI/SemiControlledTextField';

const unitToAbbreviation = {
  hour: 'HH',
  minute: 'MM',
  second: 'SS',
  millisecond: 'ms',
};

const isWholeNumber = (value: any): boolean =>
  !isNaN(value) && Number.isInteger(value);

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
const displayedEntriesMinNumber = 1;
const displayedEntriesMaxNumber = 50;

function LeaderboardAppearanceDialog({
  open,
  onClose,
  onSave,
  leaderboardCustomizationSettings,
}: Props) {
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const authenticatedUser = React.useContext(AuthenticatedUserContext);
  const { canUseTheme, canUseCustomCss } = canUserCustomizeLeaderboardTheme(
    authenticatedUser
  );
  const rgbLeaderboardTheme = getRGBLeaderboardTheme(
    leaderboardCustomizationSettings
  );
  const [scoreTitleError, setScoreTitleError] = React.useState<?string>(null);
  const [
    defaultDisplayedEntriesNumber,
    setDefaultDisplayedEntriesNumber,
  ] = React.useState<number>(
    (leaderboardCustomizationSettings &&
      leaderboardCustomizationSettings.defaultDisplayedEntriesNumber) ||
      20
  );
  const [backgroundColor, setBackgroundColor] = React.useState<string>(
    rgbLeaderboardTheme.backgroundColor
  );
  const [textColor, setTextColor] = React.useState<string>(
    rgbLeaderboardTheme.textColor
  );
  const [
    highlightBackgroundColor,
    setHighlightBackgroundColor,
  ] = React.useState<string>(rgbLeaderboardTheme.highlightBackgroundColor);
  const [highlightTextColor, setHighlightTextColor] = React.useState<string>(
    rgbLeaderboardTheme.highlightTextColor
  );
  const [
    defaultDisplayedEntriesNumberError,
    setDefaultDisplayedEntriesNumberError,
  ] = React.useState<?string>(null);
  const [customCss, setCustomCss] = React.useState<string>(
    (leaderboardCustomizationSettings &&
      leaderboardCustomizationSettings.customCss) ||
      ''
  );
  const [useCustomCss, setUseCustomCss] = React.useState<boolean>(
    !!(
      leaderboardCustomizationSettings &&
      leaderboardCustomizationSettings.useCustomCss
    )
  );
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
  const [precisionError, setPrecisionError] = React.useState<?string>(null);
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
    if (!isWholeNumber(defaultDisplayedEntriesNumber)) {
      setDefaultDisplayedEntriesNumberError(
        i18n._(
          t`The number of displayed entries must be a whole value between ${displayedEntriesMinNumber} and ${displayedEntriesMaxNumber}`
        )
      );
      return;
    }
    if (!isWholeNumber(precision)) {
      setPrecisionError(
        i18n._(
          t`The number of decimal places must be a whole value between ${precisionMinValue} and ${precisionMaxValue}`
        )
      );
      return;
    }
    setIsLoading(true);
    const customizationSettings: LeaderboardCustomizationSettings = {
      defaultDisplayedEntriesNumber,
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
      theme: canUseTheme
        ? {
            backgroundColor: rgbStringToHexString(backgroundColor),
            textColor: rgbStringToHexString(textColor),
            highlightBackgroundColor: rgbStringToHexString(
              highlightBackgroundColor
            ),
            highlightTextColor: rgbStringToHexString(highlightTextColor),
          }
        : undefined,
      useCustomCss,
      customCss,
    };
    await onSave(customizationSettings);
  };

  return (
    <I18n>
      {({ i18n }) => (
        <Dialog
          title={<Trans>Leaderboard appearance</Trans>}
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
          <ColumnStackLayout noMargin>
            <Text size="sub-title" noMargin>
              <Trans>Table settings</Trans>
            </Text>
            <TextField
              fullWidth
              type="number"
              floatingLabelText={<Trans>Number of entries to display</Trans>}
              value={
                isNaN(defaultDisplayedEntriesNumber)
                  ? ''
                  : defaultDisplayedEntriesNumber
              }
              errorText={defaultDisplayedEntriesNumberError}
              min={displayedEntriesMinNumber}
              max={displayedEntriesMaxNumber}
              onChange={(e, newValue) => {
                if (!!defaultDisplayedEntriesNumberError && !!newValue) {
                  setDefaultDisplayedEntriesNumberError(null);
                }

                setDefaultDisplayedEntriesNumber(
                  Math.max(
                    displayedEntriesMinNumber,
                    Math.min(displayedEntriesMaxNumber, parseFloat(newValue))
                  )
                );
              }}
              disabled={isLoading}
            />
            <Spacer />
            <Text size="sub-title" noMargin>
              <Trans>Visual appearance</Trans>
            </Text>
            <ResponsiveLineStackLayout noMargin>
              <ColorField
                floatingLabelText={<Trans>Background color</Trans>}
                disableAlpha
                fullWidth
                color={backgroundColor}
                onChange={setBackgroundColor}
                disabled={!canUseTheme || isLoading}
              />
              <ColorField
                floatingLabelText={<Trans>Text color</Trans>}
                disableAlpha
                fullWidth
                color={textColor}
                onChange={setTextColor}
                disabled={!canUseTheme || isLoading}
              />
            </ResponsiveLineStackLayout>
            <ResponsiveLineStackLayout noMargin>
              <ColorField
                floatingLabelText={<Trans>Highlight background color</Trans>}
                disableAlpha
                fullWidth
                color={highlightBackgroundColor}
                onChange={setHighlightBackgroundColor}
                disabled={!canUseTheme || isLoading}
              />
              <ColorField
                floatingLabelText={<Trans>Highlight text color</Trans>}
                disableAlpha
                fullWidth
                color={highlightTextColor}
                onChange={setHighlightTextColor}
                disabled={!canUseTheme || isLoading}
              />
            </ResponsiveLineStackLayout>
            {!canUseTheme ? (
              <GetSubscriptionCard subscriptionDialogOpeningReason="Leaderboard customization">
                <Line>
                  <Column noMargin>
                    <Text noMargin>
                      <Trans>
                        Get a silver or gold subscription to unlock color
                        customization.
                      </Trans>
                    </Text>
                    <Link
                      href="https://gd.games/playground/test-leaderboard"
                      onClick={() =>
                        Window.openExternalURL(
                          'https://gd.games/playground/test-leaderboard'
                        )
                      }
                    >
                      <Text noMargin color="inherit">
                        <Trans>Test it out!</Trans>
                      </Text>
                    </Link>
                  </Column>
                </Line>
              </GetSubscriptionCard>
            ) : (
              <LeaderboardPlaygroundCard />
            )}
            <Spacer />
            <Text size="sub-title" noMargin>
              <Trans>Visual appearance (advanced)</Trans>
            </Text>
            <Checkbox
              label={<Trans>Use custom CSS for the leaderboard</Trans>}
              disabled={
                // Disable the checkbox if it's loading,
                // or if custom css is not allowed - unless it's already checked,
                // in which case we allow to uncheck it.
                (!canUseCustomCss && !useCustomCss) || isLoading
              }
              checked={useCustomCss}
              onCheck={(e, checked) => setUseCustomCss(checked)}
            />
            <SemiControlledTextField
              fullWidth
              floatingLabelText={<Trans>Custom CSS</Trans>}
              multiline
              rows={4}
              rowsMax={15}
              value={customCss}
              onChange={setCustomCss}
              disabled={!useCustomCss || isLoading}
            />
            {!canUseCustomCss ? (
              <GetSubscriptionCard subscriptionDialogOpeningReason="Leaderboard customization">
                <Line>
                  <Column noMargin>
                    <Text noMargin>
                      <Trans>
                        Get a pro subscription to unlock custom CSS.
                      </Trans>
                    </Text>
                    <Link
                      href="https://gd.games/playground/test-leaderboard"
                      onClick={() =>
                        Window.openExternalURL(
                          'https://gd.games/playground/test-leaderboard'
                        )
                      }
                    >
                      <Text noMargin color="inherit">
                        <Trans>Test it out!</Trans>
                      </Text>
                    </Link>
                  </Column>
                </Line>
              </GetSubscriptionCard>
            ) : (
              <LeaderboardPlaygroundCard />
            )}
            <Spacer />
            <Text size="sub-title" noMargin>
              <Trans>Score column settings</Trans>
            </Text>
            <TextField
              fullWidth
              floatingLabelText={<Trans>Column title</Trans>}
              maxLength={20}
              errorText={scoreTitleError}
              value={scoreTitle}
              onChange={(e, newTitle) => {
                if (!!scoreTitleError && !!newTitle) setScoreTitleError(null);
                setScoreTitle(newTitle);
              }}
              disabled={isLoading}
            />
            <SelectField
              fullWidth
              value={scoreType}
              floatingLabelText={<Trans>Score display</Trans>}
              onChange={(e, i, newValue) =>
                // $FlowIgnore
                setScoreType(newValue)
              }
              disabled={isLoading}
            >
              <SelectOption
                key={'custom'}
                value={'custom'}
                label={t`Custom display`}
              />
              <SelectOption
                key={'time'}
                value={'time'}
                label={t`Display as time`}
              />
            </SelectField>
            <Spacer />
            <Text size="sub-title" noMargin>
              <Trans>Settings</Trans>
            </Text>
            {scoreType === 'custom' ? (
              <ColumnStackLayout noMargin>
                <ResponsiveLineStackLayout noMargin>
                  <TextField
                    fullWidth
                    floatingLabelFixed
                    floatingLabelText={<Trans>Prefix</Trans>}
                    maxLength={10}
                    value={prefix}
                    translatableHintText={t`Ex: $`}
                    onChange={(e, newValue) => {
                      setPrefix(newValue);
                    }}
                    disabled={isLoading}
                  />
                  <TextField
                    fullWidth
                    floatingLabelFixed
                    floatingLabelText={<Trans>Suffix</Trans>}
                    maxLength={10}
                    value={suffix}
                    translatableHintText={t`Ex: coins`}
                    onChange={(e, newValue) => {
                      setSuffix(newValue);
                    }}
                    disabled={isLoading}
                  />
                </ResponsiveLineStackLayout>
                <TextField
                  fullWidth
                  type="number"
                  floatingLabelText={<Trans>Round to X decimal point</Trans>}
                  errorText={precisionError}
                  value={isNaN(precision) ? '' : precision}
                  min={precisionMinValue}
                  max={precisionMaxValue}
                  onChange={(e, newValue) => {
                    if (!!precisionError && !!newValue) {
                      setPrecisionError(null);
                    }
                    setPrecision(
                      Math.max(
                        precisionMinValue,
                        Math.min(precisionMaxValue, parseFloat(newValue))
                      )
                    );
                  }}
                  disabled={isLoading}
                />
              </ColumnStackLayout>
            ) : (
              <ColumnStackLayout noMargin>
                <SelectField
                  fullWidth
                  value={timeUnits}
                  floatingLabelText={<Trans>Time format</Trans>}
                  onChange={(e, i, newValue) => setTimeUnits(newValue)}
                  disabled={isLoading}
                >
                  {Object.keys(unitSelectOptions).map(option => (
                    <SelectOption key={option} value={option} label={option} />
                  ))}
                </SelectField>
                <AlertMessage kind="info">
                  <Trans>
                    To use this formatting, you must send a score expressed in
                    seconds
                  </Trans>
                </AlertMessage>
              </ColumnStackLayout>
            )}
            <Spacer />
            <Text size="sub-title" noMargin>
              <Trans>Preview</Trans>
            </Text>
            <ResponsiveLineStackLayout noMargin>
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
                disabled={isLoading}
              />
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
            </ResponsiveLineStackLayout>
          </ColumnStackLayout>
        </Dialog>
      )}
    </I18n>
  );
}

export default LeaderboardAppearanceDialog;
