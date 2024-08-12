// @flow
import * as React from 'react';
import { QuickObjectReplacer } from './QuickObjectReplacer';
import { QuickBehaviorsTweaker } from './QuickBehaviorsTweaker';
import { type ResourceManagementProps } from '../ResourcesList/ResourceSource';
import { QuickPublish } from './QuickPublish';
import { ColumnStackLayout, LineStackLayout } from '../UI/Layout';
import Text from '../UI/Text';
import FlatButton from '../UI/FlatButton';
import { Trans } from '@lingui/macro';
import PreviewIcon from '../UI/CustomSvgIcons/Preview';
import { type Exporter } from '../ExportAndShare/ShareDialog';
import { mapFor } from '../Utils/MapFor';
import { canSwapAssetOfObject } from '../AssetStore/AssetSwapper';

const gd: libGDevelop = global.gd;

type StepName = 'replace-objects' | 'tweak-behaviors' | 'publish';
type Step = {|
  name: StepName,
  canPreview: boolean,
  title: React.Node,
  nextLabel: React.Node,
  shouldHideCloseButton?: boolean,
|};

const steps: Array<Step> = [
  {
    name: 'replace-objects',
    canPreview: true,
    title: <Trans>Personalize your game objects art</Trans>,
    nextLabel: <Trans>Next: Tweak Gameplay</Trans>,
  },
  {
    name: 'tweak-behaviors',
    canPreview: true,
    title: <Trans>Tweak gameplay</Trans>,
    nextLabel: <Trans>Next: Try & Publish</Trans>,
  },
  {
    name: 'publish',
    canPreview: false,
    title: <Trans>Publish and try your game</Trans>,
    nextLabel: <Trans>Finish</Trans>,
    shouldHideCloseButton: true,
  },
];

export type QuickCustomizationState = {|
  isNavigationDisabled: boolean,
  shouldAutomaticallyStartExport: boolean,
  step: Step,
  goToNextStep: () => void,
  goToPreviousStep: () => void,
  canGoToPreviousStep: boolean,
  setIsNavigationDisabled: boolean => void,
|};

export const useQuickCustomizationState = ({
  onClose,
}: {
  onClose: () => void,
}): QuickCustomizationState => {
  const [stepIndex, setStepIndex] = React.useState(0);
  const [isNavigationDisabled, setIsNavigationDisabled] = React.useState(false);
  const [
    shouldAutomaticallyStartExport,
    setShouldAutomaticallyStartExport,
  ] = React.useState(true);

  const step = steps[stepIndex];

  return {
    isNavigationDisabled,
    shouldAutomaticallyStartExport,
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
        if (step.name === 'publish') {
          setShouldAutomaticallyStartExport(false);
        }
        if (stepIndex !== 0) {
          setStepIndex(stepIndex - 1);
        }
      },
      [step, stepIndex]
    ),
    canGoToPreviousStep: stepIndex !== 0,
    setIsNavigationDisabled,
  };
};

export const enumerateObjectFolderOrObjects = (
  objectFolderOrObject: gdObjectFolderOrObject,
  depth: number = 0
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

      enumerateObjectFolderOrObjects(child, depth + 1).forEach(
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
    title: quickCustomizationState.step.title,
    titleRightContent: quickCustomizationState.step.canPreview ? (
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
    titleTopContent: quickCustomizationState.step.canPreview ? (
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
        ) : quickCustomizationState.step.name === 'publish' ? (
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
