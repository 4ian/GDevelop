// @flow
import { t, Trans } from '@lingui/macro';
import * as React from 'react';
import SubscriptionChecker from '../Profile/SubscriptionChecker';
import Checkbox from '../UI/Checkbox';
import ColorField from '../UI/ColorField';
import { type ColorResult } from '../UI/ColorField/ColorPicker';
import { Line } from '../UI/Grid';
import SemiControlledTextField from '../UI/SemiControlledTextField';
import { ColumnStackLayout, ResponsiveLineStackLayout } from '../UI/Layout';
import { hexNumberToRGBColor, rgbToHexNumber } from '../Utils/ColorTransformer';
import useForceUpdate from '../Utils/UseForceUpdate';
import ResourceSelectorWithThumbnail from '../ResourcesList/ResourceSelectorWithThumbnail';
import {
  type ResourceSource,
  type ChooseResourceFunction,
} from '../ResourcesList/ResourceSource.flow';
import { type ResourceExternalEditor } from '../ResourcesList/ResourceExternalEditor.flow';
import SelectField from '../UI/SelectField';
import SelectOption from '../UI/SelectOption';

type Props = {
  loadingScreen: gdLoadingScreen,
  onChangeSubscription: () => void,

  // For resources:
  project: gdProject,
  resourceSources: Array<ResourceSource>,
  onChooseResource: ChooseResourceFunction,
  resourceExternalEditors: Array<ResourceExternalEditor>,
};

export const LoadingScreenEditor = ({
  loadingScreen,
  onChangeSubscription,
  project,
  resourceSources,
  onChooseResource,
  resourceExternalEditors,
}: Props) => {
  const subscriptionChecker = React.useRef<?SubscriptionChecker>(null);
  const forceUpdate = useForceUpdate();

  return (
    <ColumnStackLayout expand noMargin>
      <Line noMargin>
        <ResourceSelectorWithThumbnail
          floatingLabelText={<Trans>Background image</Trans>}
          project={project}
          resourceSources={resourceSources}
          onChooseResource={onChooseResource}
          resourceExternalEditors={resourceExternalEditors}
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
          color={hexNumberToRGBColor(loadingScreen.getBackgroundColor())}
          onChangeComplete={(color: ColorResult) => {
            loadingScreen.setBackgroundColor(
              rgbToHexNumber(color.rgb.r, color.rgb.g, color.rgb.b)
            );
            forceUpdate();
          }}
        />
        <SemiControlledTextField
          floatingLabelText={
            <Trans>Background fade in duration (in seconds)</Trans>
          }
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
        floatingLabelText={
          <Trans>Game resolution resize mode (fullscreen or window)</Trans>
        }
        value={loadingScreen.getGDevelopLogoStyle()}
        onChange={(e, i, value: string) => {
          loadingScreen.setGDevelopLogoStyle(value);
          forceUpdate();
        }}
      >
        <SelectOption value="light" primaryText={t`Light (plain)`} />
        <SelectOption value="light-colored" primaryText={t`Light (colored)`} />
        <SelectOption value="dark" primaryText={t`Dark (plain)`} />
        <SelectOption value="dark-colored" primaryText={t`Dark (colored)`} />
      </SelectField>
      <ResponsiveLineStackLayout noMargin>
        <SemiControlledTextField
          floatingLabelText={
            <Trans>Logo and progress fade in delay (in seconds)</Trans>
          }
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
          floatingLabelText={<Trans>Progress bar width</Trans>}
          fullWidth
          type="number"
          value={'' + loadingScreen.getProgressBarWidth()}
          onChange={value => {
            loadingScreen.setProgressBarWidth(Math.max(1, parseFloat(value)));
            forceUpdate();
          }}
        />
        <SemiControlledTextField
          floatingLabelText={<Trans>Progress bar height</Trans>}
          fullWidth
          type="number"
          value={'' + loadingScreen.getProgressBarHeight()}
          onChange={value => {
            loadingScreen.setProgressBarHeight(Math.max(1, parseFloat(value)));
            forceUpdate();
          }}
        />
      </ResponsiveLineStackLayout>
      <ColorField
        fullWidth
        floatingLabelText={<Trans>Progress bar color</Trans>}
        disableAlpha
        color={hexNumberToRGBColor(loadingScreen.getProgressBarColor())}
        onChangeComplete={(color: ColorResult) => {
          loadingScreen.setProgressBarColor(
            rgbToHexNumber(color.rgb.r, color.rgb.g, color.rgb.b)
          );
          forceUpdate();
        }}
      />
      <SemiControlledTextField
        floatingLabelText={
          <Trans>Minimum duration of the screen (in seconds)</Trans>
        }
        fullWidth
        type="number"
        value={'' + loadingScreen.getMinDuration()}
        onChange={value => {
          loadingScreen.setMinDuration(Math.max(0, parseFloat(value)));
          forceUpdate();
        }}
      />
      <SubscriptionChecker
        ref={subscriptionChecker}
        onChangeSubscription={onChangeSubscription}
        mode="mandatory"
        id="Disable GDevelop splash at startup"
        title={<Trans>Disable GDevelop splash at startup</Trans>}
      />
    </ColumnStackLayout>
  );
};
