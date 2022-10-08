// @flow
import { t, Trans } from '@lingui/macro';
import * as React from 'react';
import SubscriptionChecker from '../Profile/SubscriptionChecker';
import Checkbox from '../UI/Checkbox';
import ColorField from '../UI/ColorField';
import { I18n } from '@lingui/react';
import { Line } from '../UI/Grid';
import SemiControlledTextField from '../UI/SemiControlledTextField';
import { ColumnStackLayout, ResponsiveLineStackLayout } from '../UI/Layout';
import {
  hexNumberToRGBString,
  rgbStringToHexNumber,
} from '../Utils/ColorTransformer';
import useForceUpdate from '../Utils/UseForceUpdate';
import ResourceSelectorWithThumbnail from '../ResourcesList/ResourceSelectorWithThumbnail';
import { type ResourceManagementProps } from '../ResourcesList/ResourceSource';
import SelectField from '../UI/SelectField';
import SelectOption from '../UI/SelectOption';
import Text from '../UI/Text';

type Props = {
  loadingScreen: gdLoadingScreen,
  onChangeSubscription: () => void,

  // For resources:
  project: gdProject,
  resourceManagementProps: ResourceManagementProps,
};

export const LoadingScreenEditor = ({
  loadingScreen,
  onChangeSubscription,
  project,
  resourceManagementProps,
}: Props) => {
  const subscriptionChecker = React.useRef<?SubscriptionChecker>(null);
  const forceUpdate = useForceUpdate();

  return (
    <I18n>
      {({ i18n }) => (
        <ColumnStackLayout expand noMargin>
          <Text size="block-title">
            <Trans>Background</Trans>
          </Text>
          <Line noMargin>
            <ResourceSelectorWithThumbnail
              floatingLabelText={<Trans>Background image</Trans>}
              project={project}
              resourceManagementProps={resourceManagementProps}
              resourceKind="image"
              resourceName={loadingScreen.getBackgroundImageResourceName()}
              onChange={resourceName => {
                loadingScreen.setBackgroundImageResourceName(resourceName);
                forceUpdate();
              }}
            />
          </Line>
          <ResponsiveLineStackLayout noMargin>
            <ColorField
              fullWidth
              floatingLabelText={<Trans>Background color</Trans>}
              disableAlpha
              color={hexNumberToRGBString(loadingScreen.getBackgroundColor())}
              onChange={color => {
                loadingScreen.setBackgroundColor(rgbStringToHexNumber(color));
                forceUpdate();
              }}
            />
            <SemiControlledTextField
              floatingLabelText={
                <Trans>Background fade in duration (in seconds)</Trans>
              }
              step={0.1}
              fullWidth
              type="number"
              value={'' + loadingScreen.getBackgroundFadeInDuration()}
              onChange={value => {
                loadingScreen.setBackgroundFadeInDuration(
                  Math.max(0, parseFloat(value))
                );
                forceUpdate();
              }}
            />
          </ResponsiveLineStackLayout>
          <Text size="block-title">
            <Trans>Logo</Trans>
          </Text>
          <Checkbox
            label={
              <Trans>Display GDevelop logo at startup (in exported game)</Trans>
            }
            checked={loadingScreen.isGDevelopSplashShown()}
            onCheck={(e, checked) => {
              if (!checked) {
                if (
                  subscriptionChecker.current &&
                  !subscriptionChecker.current.checkHasSubscription()
                )
                  return;
              }
              loadingScreen.showGDevelopSplash(checked);
              forceUpdate();
            }}
          />
          <SelectField
            fullWidth
            floatingLabelText={<Trans>GDevelop logo style</Trans>}
            value={loadingScreen.getGDevelopLogoStyle()}
            onChange={(e, i, value: string) => {
              loadingScreen.setGDevelopLogoStyle(value);
              forceUpdate();
            }}
          >
            <SelectOption value="light" primaryText={t`Light (plain)`} />
            <SelectOption
              value="light-colored"
              primaryText={t`Light (colored)`}
            />
            <SelectOption value="dark" primaryText={t`Dark (plain)`} />
            <SelectOption
              value="dark-colored"
              primaryText={t`Dark (colored)`}
            />
          </SelectField>
          <ResponsiveLineStackLayout noMargin>
            <SemiControlledTextField
              floatingLabelText={
                <Trans>Logo and progress fade in delay (in seconds)</Trans>
              }
              step={0.1}
              fullWidth
              type="number"
              value={'' + loadingScreen.getLogoAndProgressLogoFadeInDelay()}
              onChange={value => {
                loadingScreen.setLogoAndProgressLogoFadeInDelay(
                  Math.max(0, parseFloat(value))
                );
                forceUpdate();
              }}
            />
            <SemiControlledTextField
              floatingLabelText={
                <Trans>Logo and progress fade in duration (in seconds)</Trans>
              }
              step={0.1}
              fullWidth
              type="number"
              value={'' + loadingScreen.getLogoAndProgressFadeInDuration()}
              onChange={value => {
                loadingScreen.setLogoAndProgressFadeInDuration(
                  Math.max(0, parseFloat(value))
                );
                forceUpdate();
              }}
            />
          </ResponsiveLineStackLayout>
          <Text size="block-title">
            <Trans>Progress bar</Trans>
          </Text>
          <Checkbox
            label={<Trans>Show progress bar</Trans>}
            checked={loadingScreen.getShowProgressBar()}
            onCheck={(e, checked) => {
              loadingScreen.setShowProgressBar(checked);
              forceUpdate();
            }}
          />
          <ResponsiveLineStackLayout noMargin>
            <SemiControlledTextField
              floatingLabelText={<Trans>Progress bar minimum width</Trans>}
              fullWidth
              type="number"
              value={'' + loadingScreen.getProgressBarMinWidth()}
              onChange={value => {
                loadingScreen.setProgressBarMinWidth(
                  Math.max(0, parseFloat(value))
                );
                forceUpdate();
              }}
              helperMarkdownText={i18n._(t`In pixels. 0 to ignore.`)}
            />
            <SemiControlledTextField
              floatingLabelText={<Trans>Progress bar width</Trans>}
              fullWidth
              type="number"
              value={'' + loadingScreen.getProgressBarWidthPercent()}
              onChange={value => {
                loadingScreen.setProgressBarWidthPercent(
                  Math.min(100, Math.max(1, parseFloat(value)))
                );
                forceUpdate();
              }}
              helperMarkdownText={i18n._(t`As a percent of the game width.`)}
            />
            <SemiControlledTextField
              floatingLabelText={<Trans>Progress bar maximum width</Trans>}
              fullWidth
              type="number"
              value={'' + loadingScreen.getProgressBarMaxWidth()}
              onChange={value => {
                loadingScreen.setProgressBarMaxWidth(
                  Math.max(0, parseFloat(value))
                );
                forceUpdate();
              }}
              helperMarkdownText={i18n._(t`In pixels. 0 to ignore.`)}
            />
          </ResponsiveLineStackLayout>
          <SemiControlledTextField
            floatingLabelText={<Trans>Progress bar height</Trans>}
            fullWidth
            type="number"
            value={'' + loadingScreen.getProgressBarHeight()}
            onChange={value => {
              loadingScreen.setProgressBarHeight(
                Math.max(1, parseFloat(value))
              );
              forceUpdate();
            }}
          />
          <ColorField
            fullWidth
            floatingLabelText={<Trans>Progress bar color</Trans>}
            disableAlpha
            color={hexNumberToRGBString(loadingScreen.getProgressBarColor())}
            onChange={color => {
              loadingScreen.setProgressBarColor(rgbStringToHexNumber(color));
              forceUpdate();
            }}
          />
          <Text size="block-title">
            <Trans>Duration</Trans>
          </Text>
          <SemiControlledTextField
            floatingLabelText={
              <Trans>Minimum duration of the screen (in seconds)</Trans>
            }
            step={0.1}
            fullWidth
            type="number"
            value={'' + loadingScreen.getMinDuration()}
            onChange={value => {
              loadingScreen.setMinDuration(Math.max(0, parseFloat(value)));
              forceUpdate();
            }}
            helperMarkdownText={i18n._(
              t`When previewing the game in the editor, this duration is ignored (the game preview starts as soon as possible).`
            )}
          />
          <SubscriptionChecker
            ref={subscriptionChecker}
            onChangeSubscription={onChangeSubscription}
            mode="mandatory"
            id="Disable GDevelop splash at startup"
            title={<Trans>Disable GDevelop splash at startup</Trans>}
          />
        </ColumnStackLayout>
      )}
    </I18n>
  );
};
