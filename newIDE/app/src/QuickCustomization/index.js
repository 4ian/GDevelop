// @flow
import * as React from 'react';
import { QuickObjectReplacer } from './QuickObjectReplacer';
import { type ResourceManagementProps } from '../ResourcesList/ResourceSource';
import { QuickPublish } from './QuickPublish';
import { ColumnStackLayout, LineStackLayout } from '../UI/Layout';
import Text from '../UI/Text';
import FlatButton from '../UI/FlatButton';
import { Trans } from '@lingui/macro';
import PreviewIcon from '../UI/CustomSvgIcons/Preview';

type Step = 'replace-objects' | 'publish';

export type QuickCustomizationState = {|
  isNavigationDisabled: boolean,
  shouldAutomaticallyStartExport: boolean,
  step: Step,
  goToNextStep: () => void,
  canGoToNextStep: boolean,
  goToPreviousStep: () => void,
  canGoToPreviousStep: boolean,
  setIsNavigationDisabled: boolean => void,
|};

export const useQuickCustomizationState = (): QuickCustomizationState => {
  const [step, setStep] = React.useState<Step>('replace-objects');
  const [isNavigationDisabled, setIsNavigationDisabled] = React.useState(false);
  const [
    shouldAutomaticallyStartExport,
    setShouldAutomaticallyStartExport,
  ] = React.useState(true);

  return {
    isNavigationDisabled,
    shouldAutomaticallyStartExport,
    step,
    goToNextStep: React.useCallback(() => {
      setStep(step =>
        step === 'replace-objects' ? 'publish' : 'replace-objects'
      );
    }, []),
    canGoToNextStep: step === 'replace-objects',
    goToPreviousStep: React.useCallback(() => {
      setStep(step => {
        if (step === 'publish') {
          setShouldAutomaticallyStartExport(false);
        }
        return step === 'publish' ? 'replace-objects' : 'publish';
      });
    }, []),
    canGoToPreviousStep: step === 'publish',
    setIsNavigationDisabled,
  };
};

type Props = {|
  project: gdProject,
  resourceManagementProps: ResourceManagementProps,
  quickCustomizationState: QuickCustomizationState,
  onLaunchPreview: () => Promise<void>,
|};

export const renderQuickCustomization = ({
  project,
  resourceManagementProps,
  quickCustomizationState,
  onLaunchPreview,
}: Props) => {
  return {
    title:
      quickCustomizationState.step === 'replace-objects' ? (
        <Trans>Personalize your game objects art</Trans>
      ) : quickCustomizationState.step === 'publish' ? (
        <Trans>Publish and try your game</Trans>
      ) : null,
    titleRightContent:
      quickCustomizationState.step === 'replace-objects' ? (
        <LineStackLayout noMargin alignItems="center">
          <Text noMargin size={'body-small'}>
            Preview your game
          </Text>
          <FlatButton
            label={<Trans>Preview</Trans>}
            onClick={onLaunchPreview}
            leftIcon={<PreviewIcon />}
          />
        </LineStackLayout>
      ) : null,
    titleTopContent:
      quickCustomizationState.step === 'replace-objects' ? (
        <ColumnStackLayout>
          <LineStackLayout
            justifyContent="space-between"
            alignItems="center"
            expand
          >
            <Text noMargin size={'body-small'}>
              Preview your game
            </Text>
            <FlatButton
              label={<Trans>Preview</Trans>}
              onClick={onLaunchPreview}
              leftIcon={<PreviewIcon />}
            />
          </LineStackLayout>
        </ColumnStackLayout>
      ) : null,
    content: (
      <>
        {quickCustomizationState.step === 'replace-objects' ? (
          <QuickObjectReplacer
            project={project}
            resourceManagementProps={resourceManagementProps}
            onLaunchPreview={onLaunchPreview}
          />
        ) : quickCustomizationState.step === 'publish' ? (
          <QuickPublish
            project={project}
            setIsNavigationDisabled={
              quickCustomizationState.setIsNavigationDisabled
            }
            shouldAutomaticallyStartExport={
              quickCustomizationState.shouldAutomaticallyStartExport
            }
          />
        ) : null}
      </>
    ),
  };
};
