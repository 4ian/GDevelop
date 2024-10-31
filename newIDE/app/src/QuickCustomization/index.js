// @flow
import * as React from 'react';
import { QuickObjectReplacer } from './QuickObjectReplacer';
import { QuickBehaviorsTweaker } from './QuickBehaviorsTweaker';
import { type ResourceManagementProps } from '../ResourcesList/ResourceSource';
import { QuickPublish } from './QuickPublish';
import { Trans } from '@lingui/macro';
import { type Exporter } from '../ExportAndShare/ShareDialog';
import { mapFor } from '../Utils/MapFor';
import { canSwapAssetOfObject } from '../AssetStore/AssetSwapper';
import { type GameAndBuildsManager } from '../Utils/UseGameAndBuildsManager';
import { QuickTitleTweaker } from './QuickTitleTweaker';

const gd: libGDevelop = global.gd;

type StepName = 'replace-objects' | 'tweak-behaviors' | 'game-logo' | 'publish';
type Step = {|
  name: StepName,
  canPreview: boolean,
  title: React.Node,
  nextLabel?: React.Node,
|};

const steps: Array<Step> = [
  {
    name: 'replace-objects',
    canPreview: true,
    title: <Trans>Choose your game art</Trans>,
    nextLabel: <Trans>Next: Tweak Gameplay</Trans>,
  },
  {
    name: 'tweak-behaviors',
    canPreview: true,
    title: <Trans>Tweak gameplay</Trans>,
    nextLabel: <Trans>Next: Game logo</Trans>,
  },
  {
    name: 'game-logo',
    canPreview: true,
    title: <Trans>Make your game title</Trans>,
    nextLabel: <Trans>Next</Trans>,
  },
  {
    name: 'publish',
    canPreview: false,
    title: <Trans>Save your game</Trans>,
  },
];

export type QuickCustomizationState = {|
  isNavigationDisabled: boolean,
  step: Step,
  goToNextStep: () => void,
  goToPreviousStep: () => void,
  canGoToPreviousStep: boolean,
  setIsNavigationDisabled: boolean => void,
|};

export const useQuickCustomizationState = ({
  onClose,
}: {
  onClose: () => Promise<void>,
}): QuickCustomizationState => {
  const [stepIndex, setStepIndex] = React.useState(0);
  const [isNavigationDisabled, setIsNavigationDisabled] = React.useState(false);

  const step = steps[stepIndex];

  return {
    isNavigationDisabled,
    step,
    goToNextStep: React.useCallback(
      () => {
        if (stepIndex === steps.length - 1) {
          onClose();
          return;
        }

        setStepIndex(stepIndex + 1);
      },
      [stepIndex, onClose]
    ),
    goToPreviousStep: React.useCallback(
      () => {
        if (stepIndex !== 0) {
          setStepIndex(stepIndex - 1);
        }
      },
      [stepIndex]
    ),
    canGoToPreviousStep: stepIndex !== 0 && stepIndex !== steps.length - 1,
    setIsNavigationDisabled,
  };
};

export const enumerateObjectFolderOrObjects = (
  objectFolderOrObject: gdObjectFolderOrObject
): Array<{ folderName: string, objects: Array<gdObject> }> => {
  const orderedFolderNames: Array<string> = [''];
  const folderObjects: { [key: string]: Array<gdObject> } = {
    '': [],
  };

  mapFor(0, objectFolderOrObject.getChildrenCount(), i => {
    const child = objectFolderOrObject.getChildAt(i);
    if (
      child.getQuickCustomizationVisibility() === gd.QuickCustomization.Hidden
    ) {
      return;
    }

    if (child.isFolder()) {
      const folderName = child.getFolderName();
      const currentFolderObjects: Array<gdObject> = (folderObjects[folderName] =
        folderObjects[folderName] || []);
      orderedFolderNames.push(folderName);

      enumerateObjectFolderOrObjects(child).forEach(
        ({ folderName, objects }) => {
          currentFolderObjects.push.apply(currentFolderObjects, objects);
        }
      );
    } else {
      const object = child.getObject();
      if (canSwapAssetOfObject(object))
        folderObjects[''].push(child.getObject());
    }
  });

  return orderedFolderNames
    .map(folderName => ({
      folderName,
      objects: folderObjects[folderName],
    }))
    .filter(folder => folder.objects.length > 0);
};

type Props = {|
  project: gdProject,
  gameAndBuildsManager: GameAndBuildsManager,
  resourceManagementProps: ResourceManagementProps,
  quickCustomizationState: QuickCustomizationState,
  onLaunchPreview: () => Promise<void>,
  onlineWebExporter: Exporter,
  onSaveProject: () => Promise<void>,
  isSavingProject: boolean,
  isRequiredToSaveAsNewCloudProject: () => boolean,
  onClose: () => Promise<void>,
  onContinueQuickCustomization: () => void,
  gameScreenshotUrls: Array<string>,
  onScreenshotsClaimed: () => void,
|};

export const renderQuickCustomization = ({
  project,
  gameAndBuildsManager,
  resourceManagementProps,
  quickCustomizationState,
  onLaunchPreview,
  onlineWebExporter,
  onSaveProject,
  isSavingProject,
  isRequiredToSaveAsNewCloudProject,
  onClose,
  onContinueQuickCustomization,
  gameScreenshotUrls,
  onScreenshotsClaimed,
}: Props) => {
  return {
    title: quickCustomizationState.step.title,
    content: (
      <>
        {quickCustomizationState.step.name === 'replace-objects' ? (
          <QuickObjectReplacer
            project={project}
            resourceManagementProps={resourceManagementProps}
          />
        ) : quickCustomizationState.step.name === 'tweak-behaviors' ? (
          <QuickBehaviorsTweaker
            project={project}
            resourceManagementProps={resourceManagementProps}
          />
        ) : quickCustomizationState.step.name === 'game-logo' ? (
          <QuickTitleTweaker
            project={project}
            resourceManagementProps={resourceManagementProps}
          />
        ) : quickCustomizationState.step.name === 'publish' ? (
          <QuickPublish
            onlineWebExporter={onlineWebExporter}
            project={project}
            gameAndBuildsManager={gameAndBuildsManager}
            setIsNavigationDisabled={
              quickCustomizationState.setIsNavigationDisabled
            }
            onSaveProject={onSaveProject}
            isSavingProject={isSavingProject}
            isRequiredToSaveAsNewCloudProject={
              isRequiredToSaveAsNewCloudProject
            }
            onClose={onClose}
            onContinueQuickCustomization={onContinueQuickCustomization}
            gameScreenshotUrls={gameScreenshotUrls}
            onScreenshotsClaimed={onScreenshotsClaimed}
            onLaunchPreview={onLaunchPreview}
          />
        ) : null}
      </>
    ),
    showPreview: quickCustomizationState.step.canPreview,
  };
};
