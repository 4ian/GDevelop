// @flow
import * as React from 'react';

export type InAppTutorialTooltip = {|
  placement?: 'bottom' | 'left' | 'right' | 'top',
  title?: string,
  description?: string,
|};

export type InAppTutorialFlowStep = {|
  elementToHighlightId?: string,
  id?: string,
  isTriggerFlickering?: true,
  nextStepTrigger?:
    | {| presenceOfElement: string |}
    | {| absenceOfElement: string |}
    | {| elementIsFilled: true |}
    | {| instanceDraggedOnScene: string |}
    | {| clickOnButton: string |},
  mapProjectData?: {
    [key: string]: 'lastProjectObjectName',
  },
  tooltip?: InAppTutorialTooltip,
  skippable?: true,
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
|};

export const initialInAppTutorialState: InAppTutorialState = {
  flow: null,
  currentStep: null,
  setProject: () => {},
  setCurrentEditor: () => {},
  goToNextStep: () => {},
};

const InAppTutorialContext = React.createContext<InAppTutorialState>(
  initialInAppTutorialState
);

export default InAppTutorialContext;
