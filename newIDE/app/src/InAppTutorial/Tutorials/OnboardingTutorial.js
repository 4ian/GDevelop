// @flow

import { type InAppTutorial } from '../InAppTutorialContext';

const inAppTutorial: InAppTutorial = {
  id: 'onboarding',
  editorSwitches: {
    ClickOnNewObjectButton1: 'Scene',
    ClickOnNewEvent: 'EventsSheet',
  },
  endDialog: {
    content: [
      {
        text:
          '## Congratulations! 🎉\n\n## You’ve built your first game! 😊\n\nYou’re now ready to learn the basics of GDevelop\n\nClick the image to start!\n\n👇👇👇',
      },
      {
        cta: {
          imageSource: 'https://i3.ytimg.com/vi/bR2BjT7JG0k/mqdefault.jpg',
          linkHref:
            'https://www.youtube.com/watch?v=bR2BjT7JG0k&list=PL3YlZTdKiS89Kj7IQVPoNElJCWrjZaCC8',
        },
      },
      {
        text:
          '### Want to skip the basics?\n\nGo to the "Learn" section on the app to explore advanced materials.\n\nHave fun!',
      },
    ],
  },
  flow: [
    {
      id: 'ClickOnNewObjectButton1',
      elementToHighlightId: '#add-new-object-button',
      nextStepTrigger: { presenceOfElement: '#new-object-dialog' },
      tooltip: {
        placement: 'left',
        title: "Let's create an **object**",
        description:
          '👉 Everything you see in a game is an **object**: your character, the enemies, coins and potions, platforms or trees, ...',
      },
    },
    {
      id: 'OpenAssetTab',
      elementToHighlightId: '#asset-store-tab',
      nextStepTrigger: { presenceOfElement: '#asset-store' },
      tooltip: {
        description: "Let's choose an object from the asset store.",
        placement: 'bottom',
      },
      skippable: true,
      isOnClosableDialog: true,
    },
    {
      id: 'ClickOnSearchBar',
      elementToHighlightId: '#asset-store-search-bar',
      nextStepTrigger: { elementIsFilled: true },
      tooltip: {
        title: 'Choose an asset to represent your main character!',
        description: 'Tip: search for “wizard”.',
      },
      skippable: true,
      isOnClosableDialog: true,
    },
    {
      id: 'WaitForUserToSelectAsset',
      nextStepTrigger: { presenceOfElement: '#add-asset-button' },
      isOnClosableDialog: true,
    },
    {
      id: 'AddAsset',
      elementToHighlightId: '#add-asset-button',
      isTriggerFlickering: true,
      nextStepTrigger: { presenceOfElement: '#object-item-0' },
      tooltip: { description: 'Add this asset to your project.' },
      mapProjectData: {
        firstObject: 'lastProjectObjectName',
      },
      isOnClosableDialog: true,
    },
    {
      id: 'CloseAssetStore',
      elementToHighlightId: '#new-object-dialog #close-button',
      nextStepTrigger: { absenceOfElement: '#new-object-dialog' },
      tooltip: {
        description:
          "Great! Our game now has an **object**, let's see what we can do with it.",
      },
    },
    {
      id: 'DragObjectToScene',
      elementToHighlightId: '#object-item-0',
      nextStepTrigger: { instanceDraggedOnScene: 'firstObject' },
      tooltip: {
        description: 'Drag {firstObject} from the menu to the canvas.',
        placement: 'left',
      },
    },
    {
      id: 'OpenBehaviors',
      elementToHighlightId: '#object-item-0',
      nextStepTrigger: { presenceOfElement: '#object-editor-dialog' },
      tooltip: {
        title: "Let's make our character move! 🛹",
        description: 'Here, right-click on it and click “Edit **behaviors**”',
        placement: 'left',
      },
    },
    {
      id: 'OpenBehaviorTab',
      elementToHighlightId: '#behaviors-tab',
      nextStepTrigger: { presenceOfElement: '#add-behavior-button' },
      tooltip: {
        description: 'See the **behaviors** of your object here.',
        placement: 'bottom',
      },
      skippable: true,
      isOnClosableDialog: true,
    },
    {
      id: 'AddBehavior',
      elementToHighlightId: '#add-behavior-button',
      nextStepTrigger: {
        presenceOfElement:
          '#behavior-item-TopDownMovementBehavior--TopDownMovementBehavior',
      },
      tooltip: {
        title: 'Let’s add a **behavior**!',
        description:
          '👉 Behaviors add features to objects in a matter of clicks. They are very powerful!',
        placement: 'bottom',
      },
      isOnClosableDialog: true,
    },
    {
      id: 'SelectTopDownBehavior',
      elementToHighlightId:
        '#behavior-item-TopDownMovementBehavior--TopDownMovementBehavior',
      nextStepTrigger: {
        presenceOfElement: '#behavior-parameters-TopDownMovement',
      },
      tooltip: {
        description: 'Add the "Top down movement" **behavior**.',
        placement: 'bottom',
      },
      isOnClosableDialog: true,
    },
    {
      id: 'ApplyBehavior',
      elementToHighlightId: '#object-editor-dialog #apply-button',
      nextStepTrigger: {
        absenceOfElement: '#object-editor-dialog',
      },
      tooltip: {
        description:
          "The parameters above help you customise the **behavior**, but let's ignore them for now.",
        placement: 'top',
      },
      isOnClosableDialog: true,
    },
    {
      id: 'LaunchPreview1',
      elementToHighlightId: '#toolbar-preview-button',
      nextStepTrigger: { previewLaunched: true },
      tooltip: {
        title: "Let's play! 🎮",
        description:
          'Click on "**Preview**" and move your character with the **arrow keys**!',
        placement: 'bottom',
      },
    },
    {
      id: 'WaitForUserToHavePlayed',
      elementToHighlightId: '#toolbar-preview-button',
      nextStepTrigger: {
        clickOnButton: "I'm done",
      },
      tooltip: {
        description:
          "Once you're done testing, close the **preview** and come back here.",
        placement: 'bottom',
      },
    },
    {
      id: 'ClickOnNewObjectButton2',
      elementToHighlightId: '#add-new-object-button',
      nextStepTrigger: { presenceOfElement: '#new-object-dialog' },
      tooltip: {
        placement: 'left',
        title:
          "Let's now add another **object** that {firstObject} can collect!",
      },
    },
    {
      id: 'OpenAssetTab2',
      elementToHighlightId: '#asset-store-tab',
      nextStepTrigger: { presenceOfElement: '#asset-store' },
      tooltip: {
        description: "Let's choose an object from the asset store.",
        placement: 'bottom',
      },
      skippable: true,
      isOnClosableDialog: true,
    },
    {
      id: 'ClickOnSearchBar2',
      elementToHighlightId: '#asset-store-search-bar',
      nextStepTrigger: { elementIsFilled: true },
      tooltip: {
        description: 'Search for “coin” (or a potion, food, ...).',
      },
      isOnClosableDialog: true,
      shortcuts: [
        {
          stepId: 'CloseAssetStore2',
          trigger: { presenceOfElement: '#object-item-1' },
        },
      ],
    },
    {
      id: 'WaitForUserToSelectAsset2',
      nextStepTrigger: { presenceOfElement: '#add-asset-button' },
      isOnClosableDialog: true,
    },
    {
      id: 'AddAsset2',
      elementToHighlightId: '#add-asset-button',
      isTriggerFlickering: true,
      nextStepTrigger: { presenceOfElement: '#object-item-1' },
      mapProjectData: {
        secondObject: 'lastProjectObjectName',
      },
      isOnClosableDialog: true,
    },
    {
      id: 'CloseAssetStore2',
      elementToHighlightId: '#new-object-dialog #close-button',
      nextStepTrigger: { absenceOfElement: '#new-object-dialog' },
      tooltip: {
        description:
          "Great! Our game now has 2 **objects**, let's see what we can do with them.",
      },
    },
    {
      id: 'DragObjectToScene',
      elementToHighlightId: '#object-item-1',
      nextStepTrigger: { instanceDraggedOnScene: 'secondObject' },
      tooltip: {
        description:
          'Place a few {secondObject} in the scene by dragging them to the canvas.',
        placement: 'left',
      },
    },
    {
      id: 'SwitchToEventsSheet',
      elementToHighlightId: '[id^=tab-layout-events]',
      nextStepTrigger: { presenceOfElement: '#add-event-button' },
      tooltip: {
        description:
          "Now let's make {firstObject} collect the {secondObject}! Go to the **events** tab of the **scene**.",
        placement: 'bottom',
      },
    },
    {
      id: 'ClickOnNewEvent',
      elementToHighlightId: '#add-event-button',
      nextStepTrigger: { presenceOfElement: '#add-condition-button' },
      tooltip: {
        title: 'Let’s add an **event**!',
        description: '👉 **Events** are the logic to your game.',
        placement: 'bottom',
      },
    },
    {
      id: 'ClickOnNewCondition',
      elementToHighlightId: '#add-condition-button',
      nextStepTrigger: { presenceOfElement: '#instruction-editor-dialog' },
      tooltip: {
        description:
          '**Events** are made of a condition and an action:\n\nCondition: "**If** {firstObject} touches the {secondObject}..."\n\nAction: "... **then** the {secondObject} disappears"\n\n**Click "Add condition**"',
        placement: 'bottom',
      },
    },
    {
      id: 'ChooseObject',
      elementToHighlightId: '#instruction-editor-dialog #object-item-0',
      nextStepTrigger: { presenceOfElement: '#object-instruction-selector' },
      tooltip: {
        description: 'Choose {firstObject}',
        placement: 'bottom',
      },
      isOnClosableDialog: true,
    },
    {
      id: 'ChooseCondition',
      elementToHighlightId: '#instruction-item-CollisionNP',
      nextStepTrigger: {
        presenceOfElement: '#instruction-parameters-container',
      },
      tooltip: {
        description: 'Then the condition we want to use: **"Collision"**.',
        placement: 'bottom',
      },
      isOnClosableDialog: true,
    },
    {
      id: 'SetParameter',
      elementToHighlightId: '#parameter-1-object-selector',
      nextStepTrigger: { elementIsFilled: true },
      tooltip: {
        description: 'Finally, select the target **object** ({secondObject}).',
        placement: 'top',
      },
      isOnClosableDialog: true,
    },
    {
      id: 'CloseInstructionEditor',
      elementToHighlightId: '#instruction-editor-dialog #ok-button',
      nextStepTrigger: { absenceOfElement: '#instruction-editor-dialog' },
      tooltip: {
        description: "We're good.",
        placement: 'top',
      },
    },
    {
      id: 'ClickOnNewAction',
      elementToHighlightId: '#add-action-button',
      nextStepTrigger: { presenceOfElement: '#instruction-editor-dialog' },
      tooltip: {
        description:
          "Let's add **what happens when the condition is met**: make {secondObject} disappear.",
        placement: 'bottom',
      },
    },
    {
      id: 'ChooseObject2',
      elementToHighlightId: '#instruction-editor-dialog #object-item-1',
      nextStepTrigger: { presenceOfElement: '#object-instruction-selector' },
      tooltip: {
        description: 'Choose {secondObject}',
        placement: 'bottom',
      },
      isOnClosableDialog: true,
    },
    {
      id: 'ChooseAction',
      elementToHighlightId: '#instruction-item-Delete',
      nextStepTrigger: {
        presenceOfElement: '#instruction-parameters-container',
      },
      tooltip: {
        description:
          'Then choose the **action** {secondObject} will receive : "Delete", as we want to remove it.',
        placement: 'bottom',
      },
      isOnClosableDialog: true,
    },
    {
      id: 'CloseInstructionEditor2',
      elementToHighlightId: '#instruction-editor-dialog #ok-button',
      nextStepTrigger: { absenceOfElement: '#instruction-editor-dialog' },
      tooltip: {
        description: 'Nothing more is needed!',
        placement: 'top',
      },
    },
    {
      id: 'LaunchPreview2',
      elementToHighlightId: '#toolbar-preview-button',
      nextStepTrigger: { previewLaunched: true },
      tooltip: {
        title: "Let's see how it works! 🎮",
        placement: 'bottom',
      },
    },
    {
      id: 'WaitForUserToHavePlayed2',
      elementToHighlightId: '#toolbar-preview-button',
      nextStepTrigger: {
        clickOnButton: "I'm done",
      },
      tooltip: {
        description:
          "Once you're done testing, close the **preview** and come back here.",
        placement: 'bottom',
      },
    },
  ],
};

export default inAppTutorial;
