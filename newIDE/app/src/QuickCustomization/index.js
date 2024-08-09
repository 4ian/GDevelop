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
import { type Exporter } from '../ExportAndShare/ShareDialog';

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
  nextLabel: React.Node,
  showCloseButton: boolean,
|};

export const useQuickCustomizationState = ({
  onClose,
}: {
  onClose: () => void,
}): QuickCustomizationState => {
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
    goToNextStep: React.useCallback(
      () => {
        if (step === 'publish') {
          onClose();
          return;
        }

        setStep(step === 'replace-objects' ? 'publish' : 'replace-objects');
      },
      [step, onClose]
    ),
    canGoToNextStep: true,
    goToPreviousStep: React.useCallback(() => {
      setStep(step => {
        if (step === 'publish') {
          setShouldAutomaticallyStartExport(false);
        }
        return step === 'publish' ? 'replace-objects' : 'publish';
      });
    }, []),
    nextLabel:
      step === 'publish' ? (
        <Trans>Finish</Trans>
      ) : step === 'replace-objects' ? (
        <Trans>Next: Try & Publish</Trans>
      ) : null,
    canGoToPreviousStep: step === 'publish',
    setIsNavigationDisabled,
    showCloseButton: step !== 'publish',
  };
};

type Props = {|
  project: gdProject,
  resourceManagementProps: ResourceManagementProps,
  quickCustomizationState: QuickCustomizationState,
  onLaunchPreview: () => Promise<void>,
  onlineWebExporter: Exporter,
  onSaveProject: () => Promise<void>,
  isSavingProject: boolean,
|};

export const renderQuickCustomization = ({
  project,
  resourceManagementProps,
  quickCustomizationState,
  onLaunchPreview,
  onlineWebExporter,
  onSaveProject,
  isSavingProject,
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
            onlineWebExporter={onlineWebExporter}
            project={project}
            setIsNavigationDisabled={
              quickCustomizationState.setIsNavigationDisabled
            }
            shouldAutomaticallyStartExport={
              quickCustomizationState.shouldAutomaticallyStartExport
            }
            onSaveProject={onSaveProject}
            isSavingProject={isSavingProject}
          />
        ) : null}
      </>
    ),
  };
};
