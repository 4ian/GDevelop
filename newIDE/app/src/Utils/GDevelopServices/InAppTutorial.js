// @flow

import axios from 'axios';
import { GDevelopAssetApi } from './ApiConfigs';
import { type MessageDescriptor } from '../i18n/MessageDescriptor.flow';
import { type MessageByLocale } from '../i18n/MessageByLocale';

export const FLING_GAME_IN_APP_TUTORIAL_ID = 'flingGame';
export const PLINKO_MULTIPLIER_IN_APP_TUTORIAL_ID = 'plinkoMultiplier';
export const CAMERA_PARALLAX_IN_APP_TUTORIAL_ID = 'cameraParallax';
export const HEALTH_BAR_IN_APP_TUTORIAL_ID = 'healthBar';
export const JOYSTICK_IN_APP_TUTORIAL_ID = 'joystick';
export const TIMER_IN_APP_TUTORIAL_ID = 'timer';
export const OBJECT_3D_IN_APP_TUTORIAL_ID = 'object3d';
export const KNIGHT_PLATFORMER_IN_APP_TUTORIAL_ID = 'knightPlatformer';
export const TOP_DOWN_RPG_MOVEMENT_ID = 'topDownRPGMovement';
export const FIRE_A_BULLET_ID = 'fireABullet';
export const COOP_PLATFORMER_ID = 'coopPlatformer';
export const TILEMAP_PLATFORMER_ID = 'tilemapPlatformer';

export const guidedLessonsIds = [
  PLINKO_MULTIPLIER_IN_APP_TUTORIAL_ID,
  TIMER_IN_APP_TUTORIAL_ID,
  CAMERA_PARALLAX_IN_APP_TUTORIAL_ID,
  HEALTH_BAR_IN_APP_TUTORIAL_ID,
  JOYSTICK_IN_APP_TUTORIAL_ID,
  OBJECT_3D_IN_APP_TUTORIAL_ID,
  KNIGHT_PLATFORMER_IN_APP_TUTORIAL_ID,
  TOP_DOWN_RPG_MOVEMENT_ID,
  FIRE_A_BULLET_ID,
  COOP_PLATFORMER_ID,
  TILEMAP_PLATFORMER_ID,
];

export type InAppTutorialShortHeader = {|
  id: string,
  titleByLocale: MessageByLocale,
  bulletPointsByLocale: Array<MessageByLocale>,
  contentUrl: string,
  availableLocales: Array<string>,
  initialTemplateUrl?: string,
  initialProjectData?: { [key: string]: string },
  isMiniTutorial?: boolean,
|};

export type EditorIdentifier =
  | 'Scene'
  | 'EventsSheet'
  | 'Home'
  | 'ExternalEvents'
  | 'ExternalLayout'
  | 'Extension'
  | 'Resources';

export type TranslatedText =
  | {| messageDescriptor: MessageDescriptor |}
  | {| messageByLocale: MessageByLocale |};

type InAppTutorialFlowStepDOMChangeTrigger =
  | {| presenceOfElement: string |}
  | {| absenceOfElement: string |};
type InAppTutorialFlowStepShortcutTrigger =
  | InAppTutorialFlowStepDOMChangeTrigger
  | {| objectAddedInLayout: true |};

export type InAppTutorialFlowStepTrigger =
  | InAppTutorialFlowStepDOMChangeTrigger
  | {| editorIsActive: string |}
  | {| valueHasChanged: true |}
  | {| valueEquals: string | boolean |}
  | {| instanceAddedOnScene: string, instancesCount?: number |}
  | {| objectAddedInLayout: true |}
  | {| previewLaunched: true |}
  | {| clickOnTooltipButton: TranslatedText |};

export type InAppTutorialFlowStepFormattedTrigger =
  | InAppTutorialFlowStepDOMChangeTrigger
  | {| editorIsActive: string |}
  | {| valueHasChanged: true |}
  | {| valueEquals: string | boolean |}
  | {| instanceAddedOnScene: string, instancesCount?: number |}
  | {| objectAddedInLayout: true |}
  | {| previewLaunched: true |}
  | {| clickOnTooltipButton: string |};

export type InAppTutorialTooltip = {|
  standalone?: true,
  placement?: 'bottom' | 'left' | 'right' | 'top',
  mobilePlacement?: 'bottom' | 'left' | 'right' | 'top',
  title?: TranslatedText,
  description?: TranslatedText,
  touchDescription?: TranslatedText,
  image?: { dataUrl: string, width?: string },
|};

export type InAppTutorialFormattedTooltip = {|
  ...InAppTutorialTooltip,
  title?: string,
  description?: string,
|};

export type InAppTutorialDialog = {|
  content: Array<
    TranslatedText | {| image: {| imageSource: string, linkHref?: string |} |}
  >,
|};

export type InAppTutorialFlowStep = {|
  elementToHighlightId?: string,
  id?: string,
  isTriggerFlickering?: true,
  isCheckpoint?: true,
  deprecated?: true,
  nextStepTrigger?: InAppTutorialFlowStepTrigger,
  shortcuts?: Array<{|
    stepId: string,
    // TODO: Adapt provider to make it possible to use other triggers as shortcuts
    trigger: InAppTutorialFlowStepShortcutTrigger,
  |}>,
  dialog?: InAppTutorialDialog,
  mapProjectData?: {
    [key: string]: 'projectLastSceneName' | string, // string represents accessors with parameters such as lastSceneObjectName:{sceneName}
  },
  tooltip?: InAppTutorialTooltip,
  skippable?: true,
  isOnClosableDialog?: true,
|};

export type InAppTutorialFlowFormattedStep = {|
  ...InAppTutorialFlowStep,
  tooltip?: InAppTutorialFormattedTooltip,
  nextStepTrigger?: InAppTutorialFlowStepFormattedTrigger,
|};

export type InAppTutorial = {|
  id: string,
  flow: Array<InAppTutorialFlowStep>,
  editorSwitches: {
    [stepId: string]: {| editor: EditorIdentifier, scene?: string |},
  },
  endDialog: InAppTutorialDialog,
  availableLocales?: Array<string>,
  isMiniTutorial?: boolean,
|};

export const fetchInAppTutorialShortHeaders = async (): Promise<
  Array<InAppTutorialShortHeader>
> => {
  const response = await axios.get(
    `${GDevelopAssetApi.baseUrl}/in-app-tutorial-short-header`
  );
  return response.data;
};

export const fetchInAppTutorial = async (
  shortHeader: InAppTutorialShortHeader
): Promise<InAppTutorial> => {
  const response = await axios.get(shortHeader.contentUrl);
  return response.data;
};
