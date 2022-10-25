// @flow
import * as React from 'react';
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
  getDescriptionNode?: (style: Object) => React.Node,
|};

type InAppTutorialFlowStepDOMChangeTrigger =
  | {| presenceOfElement: string |}
  | {| absenceOfElement: string |};

export type InAppTutorialFlowStepTrigger =
  | InAppTutorialFlowStepDOMChangeTrigger
  | {| valueHasChanged: true |}
  | {| instanceAddedOnScene: string |}
  | {| previewLaunched: true |}
  | {| clickOnTooltipButton: string |};

export type InAppTutorialFlowStep = {|
  elementToHighlightId?: string,
  id?: string,
  isTriggerFlickering?: true,
  nextStepTrigger?: InAppTutorialFlowStepTrigger,
  shortcuts?: Array<{|
    stepId: string,
    // TODO: Adapt provider to make it possible to use other triggers as shortcuts
    trigger: InAppTutorialFlowStepDOMChangeTrigger,
  |}>,
  mapProjectData?: {
    [key: string]: 'lastProjectObjectName',
  },
  tooltip?: InAppTutorialTooltip,
  skippable?: true,
  isOnClosableDialog?: true,
|};

export type InAppTutorialFlowFormattedStep = {|
  ...InAppTutorialFlowStep,
  tooltip?: InAppTutorialFormattedTooltip,
|};

export type EditorIdentifier = 'Scene' | 'EventsSheet' | 'Home';

export type InAppTutorialEndDialog = {|
  content: Array<
    TranslatedText | {| image: {| imageSource: string, linkHref?: string |} |}
  >,
|};

export type InAppTutorial = {|
  id: string,
  flow: Array<InAppTutorialFlowStep>,
  editorSwitches: {
    [stepId: string]: EditorIdentifier,
  },
  endDialog: InAppTutorialEndDialog,
|};

export type InAppTutorialState = {|
  flow: string | null,
  setProject: (?gdProject) => void,
  setCurrentEditor: (EditorIdentifier | null) => void,
  goToNextStep: () => void,
  onPreviewLaunch: () => void,
  isInAppTutorialRunning: boolean,
  startTutorial: (id: string) => void,
|};

export const initialInAppTutorialState: InAppTutorialState = {
  flow: null,
  setProject: () => {},
  setCurrentEditor: () => {},
  goToNextStep: () => {},
  onPreviewLaunch: () => {},
  isInAppTutorialRunning: false,
  startTutorial: () => {},
};

const InAppTutorialContext = React.createContext<InAppTutorialState>(
  initialInAppTutorialState
);

export default InAppTutorialContext;
