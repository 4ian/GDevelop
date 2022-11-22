// @flow
import * as React from 'react';
import { type InAppTutorialShortHeader } from '../Utils/GDevelopServices/InAppTutorial';
import { type MessageDescriptor } from '../Utils/i18n/MessageDescriptor.flow';
import { type MessageByLocale } from '../Utils/i18n/MessageByLocale';

export type TranslatedText =
  | {| messageDescriptor: MessageDescriptor |}
  | {| messageByLocale: MessageByLocale |};

export type InAppTutorialTooltip = {|
  standalone?: true,
  placement?: 'bottom' | 'left' | 'right' | 'top',
  title?: TranslatedText,
  description?: TranslatedText,
  image?: { dataUrl: string, width?: string },
|};

export type InAppTutorialFormattedTooltip = {|
  ...InAppTutorialTooltip,
  title?: string,
  description?: string,
|};

type InAppTutorialFlowStepDOMChangeTrigger =
  | {| presenceOfElement: string |}
  | {| absenceOfElement: string |};

export type InAppTutorialFlowStepTrigger =
  | InAppTutorialFlowStepDOMChangeTrigger
  | {| editorIsActive: string |}
  | {| valueHasChanged: true |}
  | {| instanceAddedOnScene: string |}
  | {| previewLaunched: true |}
  | {| clickOnTooltipButton: TranslatedText |};

export type InAppTutorialFlowStepFormattedTrigger =
  | InAppTutorialFlowStepDOMChangeTrigger
  | {| valueHasChanged: true |}
  | {| instanceAddedOnScene: string |}
  | {| previewLaunched: true |}
  | {| clickOnTooltipButton: string |};

export type InAppTutorialFlowStep = {|
  elementToHighlightId?: string,
  id?: string,
  isTriggerFlickering?: true,
  isCheckpoint?: true,
  nextStepTrigger?: InAppTutorialFlowStepTrigger,
  shortcuts?: Array<{|
    stepId: string,
    // TODO: Adapt provider to make it possible to use other triggers as shortcuts
    trigger: InAppTutorialFlowStepDOMChangeTrigger,
  |}>,
  mapProjectData?: {
    [key: string]: 'projectLastSceneName' | string, // lastSceneObjectName:sceneName
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

export type EditorIdentifier =
  | 'Scene'
  | 'EventsSheet'
  | 'Home'
  | 'ExternalEvents'
  | 'ExternalLayout'
  | 'Extension'
  | 'Resources';

export type InAppTutorialEndDialog = {|
  content: Array<
    TranslatedText | {| image: {| imageSource: string, linkHref?: string |} |}
  >,
|};

export type InAppTutorial = {|
  id: string,
  flow: Array<InAppTutorialFlowStep>,
  editorSwitches: {
    [stepId: string]: {| editor: EditorIdentifier, scene?: string |},
  },
  endDialog: InAppTutorialEndDialog,
|};

export type InAppTutorialState = {|
  currentlyRunningInAppTutorial: InAppTutorial | null,
  startTutorial: ({|
    tutorialId: string,
    initialStepIndex: ?number,
  |}) => Promise<void>,
  endTutorial: () => void,
  inAppTutorialShortHeaders: ?Array<InAppTutorialShortHeader>,
  startStepIndex: number,
|};

export const initialInAppTutorialState: InAppTutorialState = {
  currentlyRunningInAppTutorial: null,
  startTutorial: async () => {},
  endTutorial: () => {},
  inAppTutorialShortHeaders: null,
  startStepIndex: 0,
};

const InAppTutorialContext = React.createContext<InAppTutorialState>(
  initialInAppTutorialState
);

export default InAppTutorialContext;
