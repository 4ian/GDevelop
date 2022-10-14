// @flow
import * as React from 'react';

export type InAppTutorialTooltip = {|
  placement?: 'bottom' | 'left' | 'right' | 'top',
  title?: string,
  description?: string,
|};

type InAppTutorialFlowStepDOMChangeTrigger =
  | {| presenceOfElement: string |}
  | {| absenceOfElement: string |};

export type InAppTutorialFlowStepTrigger =
  | InAppTutorialFlowStepDOMChangeTrigger
  | {| elementIsFilled: true |}
  | {| instanceDraggedOnScene: string |}
  | {| previewLaunched: true |}
  | {| clickOnButton: string |};

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

export type EditorIdentifier = 'Scene' | 'EventsSheet' | 'Home';

export type InAppTutorial = {|
  flow: Array<InAppTutorialFlowStep>,
  editorSwitches: {
    [stepId: string]: EditorIdentifier,
  },
|};

export type InAppTutorialState = {|
  flow: string | null,
  currentStep: InAppTutorialFlowStep | null,
  setProject: (?gdProject) => void,
  setCurrentEditor: (EditorIdentifier | null) => void,
  goToNextStep: () => void,
  onPreviewLaunch: () => void,
|};

export const initialInAppTutorialState: InAppTutorialState = {
  flow: null,
  currentStep: null,
  setProject: () => {},
  setCurrentEditor: () => {},
  goToNextStep: () => {},
  onPreviewLaunch: () => {},
};

const InAppTutorialContext = React.createContext<InAppTutorialState>(
  initialInAppTutorialState
);

export default InAppTutorialContext;
