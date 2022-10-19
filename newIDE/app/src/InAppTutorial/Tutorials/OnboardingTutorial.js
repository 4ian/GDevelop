// @flow

import { t } from '@lingui/macro';
import { type InAppTutorial } from '../InAppTutorialContext';

const inAppTutorial: InAppTutorial = {
  id: 'onboarding',
  editorSwitches: {
    GoToBuildSection: 'Home',
    ClickOnNewObjectButtonForCharacter: 'Scene',
    ClickOnNewEvent: 'EventsSheet',
  },
  endDialog: {
    content: [
      {
        messageDescriptor: t`## Congratulations! 🎉`,
      },
      {
        messageDescriptor: t`### You’ve built your first game! 😊`,
      },
      {
        messageDescriptor: t`You’re now ready to learn the basics of GDevelop.`,
      },
      {
        messageDescriptor: t`Click the image to start!`,
      },
      {
        messageDescriptor: t`👇👇👇`,
      },
      {
        image: {
          imageSource: 'https://i3.ytimg.com/vi/bR2BjT7JG0k/mqdefault.jpg',
          linkHref:
            'https://www.youtube.com/watch?v=bR2BjT7JG0k&list=PL3YlZTdKiS89Kj7IQVPoNElJCWrjZaCC8',
        },
      },
      {
        messageDescriptor: t`### Want to skip the basics?`,
      },
      {
        messageDescriptor: t`Go to the "Learn" section on the app to explore advanced materials.`,
      },
      {
        messageDescriptor: t`Have fun!`,
      },
    ],
  },
  flow: [
    {
      id: 'GoToBuildSection',
      elementToHighlightId: '#home-build-tab',
      nextStepTrigger: { presenceOfElement: '#home-create-project-button' },
      tooltip: {
        description: {
          messageDescriptor: t`Head over to the **Build section**`,
        },
        placement: 'right',
      },
    },
    {
      id: 'CreateProject',
      elementToHighlightId: '#home-create-project-button',
      nextStepTrigger: { presenceOfElement: '#create-project-button' },
      tooltip: {
        description: {
          messageDescriptor: t`We'll create a simple game with **a character that can collect coins**.
          \\n\\nLet's create a new project!`,
        },
      },
    },
    {
      id: 'ValidateProjectCreation',
      elementToHighlightId: '#create-project-button',
      nextStepTrigger: {
        presenceOfElement: '#tab-layout-Untitled-scene-button',
      },
      tooltip: {
        description: { messageDescriptor: t`Let's go!` },
      },
      isOnClosableDialog: true,
    },
    {
      id: 'ClickOnNewObjectButtonForCharacter',
      elementToHighlightId: '#add-new-object-button',
      nextStepTrigger: { presenceOfElement: '#new-object-dialog' },
      tooltip: {
        placement: 'left',
        title: { messageDescriptor: t`Let's create an **object**` },
        description: {
          messageDescriptor: t`👉 Everything you see in a game is an **object**: your character, the enemies, coins and potions, platforms or trees, ...`,
        },
      },
    },
    {
      id: 'OpenAssetTab',
      elementToHighlightId: '#asset-store-tab',
      nextStepTrigger: { presenceOfElement: '#asset-store' },
      tooltip: {
        description: {
          messageDescriptor: t`Let's choose an object from the asset store.`,
        },
        placement: 'bottom',
      },
      skippable: true,
      isOnClosableDialog: true,
    },
    {
      id: 'ClickOnSearchBar',
      elementToHighlightId: '#asset-store-search-bar',
      nextStepTrigger: { valueHasChanged: true },
      tooltip: {
        title: {
          messageDescriptor: t`Choose an asset to represent your main character!`,
        },
        description: { messageDescriptor: t`Tip: search for “wizard”.` },
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
      tooltip: {
        description: { messageDescriptor: t`Add this asset to your project.` },
      },
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
        description: {
          messageDescriptor: t`Great! Our game now has an **object**, let's see what we can do with it.`,
        },
      },
    },
    {
      id: 'DragObjectToScene',
      elementToHighlightId: '#object-item-0',
      nextStepTrigger: { instanceAddedOnScene: 'firstObject' },
      tooltip: {
        description: {
          messageDescriptor: t`Drag $(firstObject) from the menu to the canvas.`,
        },
        placement: 'left',
      },
    },
    {
      id: 'OpenBehaviors',
      elementToHighlightId: '#object-item-0',
      nextStepTrigger: { presenceOfElement: '#object-editor-dialog' },
      tooltip: {
        title: { messageDescriptor: t`Let's make our character move! 🛹` },
        description: {
          messageDescriptor: t`Here, right-click on it and click “Edit **behaviors**”`,
        },
        placement: 'left',
      },
    },
    {
      id: 'OpenBehaviorTab',
      elementToHighlightId: '#behaviors-tab',
      nextStepTrigger: { presenceOfElement: '#add-behavior-button' },
      tooltip: {
        description: {
          messageDescriptor: t`See the **behaviors** of your object here.`,
        },
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
        title: { messageDescriptor: t`Let’s add a **behavior**!` },
        description: {
          messageDescriptor: t`👉 Behaviors add features to objects in a matter of clicks. They are very powerful!`,
        },
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
        description: {
          messageDescriptor: t`Add the "Top down movement" **behavior**.`,
        },
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
        description: {
          messageDescriptor: t`The parameters above help you customise the **behavior**, but let's ignore them for now.`,
        },
        placement: 'top',
      },
      isOnClosableDialog: true,
    },
    {
      id: 'LaunchPreviewCharacterOnly',
      elementToHighlightId: '#toolbar-preview-button',
      nextStepTrigger: { previewLaunched: true },
      tooltip: {
        title: { messageDescriptor: t`Let's play! 🎮` },
        description: {
          messageDescriptor: t`Click on "**Preview**" and move your character with the **arrow keys**!`,
        },
        placement: 'bottom',
      },
    },
    {
      id: 'WaitForUserToHavePlayed',
      elementToHighlightId: '#toolbar-preview-button',
      nextStepTrigger: {
        clickOnTooltipButton: "I'm done",
      },
      tooltip: {
        description: {
          messageDescriptor: t`Once you're done testing, close the **preview** and come back here.`,
        },
        placement: 'bottom',
      },
    },
    {
      id: 'ClickOnNewObjectButtonForCoin',
      elementToHighlightId: '#add-new-object-button',
      nextStepTrigger: { presenceOfElement: '#new-object-dialog' },
      tooltip: {
        placement: 'left',
        title: {
          messageDescriptor: t`Let's now add another **object** that $(firstObject) can collect!`,
        },
      },
    },
    {
      id: 'OpenAssetTabForCoin',
      elementToHighlightId: '#asset-store-tab',
      nextStepTrigger: { presenceOfElement: '#asset-store' },
      tooltip: {
        description: {
          messageDescriptor: t`Let's choose an object from the asset store.`,
        },
        placement: 'bottom',
      },
      skippable: true,
      isOnClosableDialog: true,
    },
    {
      id: 'ClickOnSearchBarForCoin',
      elementToHighlightId: '#asset-store-search-bar',
      nextStepTrigger: { valueHasChanged: true },
      tooltip: {
        description: {
          messageDescriptor: t`Search for “coin” (or a potion, food, ...).`,
        },
      },
      isOnClosableDialog: true,
      shortcuts: [
        {
          stepId: 'CloseAssetStoreForCoin',
          trigger: { presenceOfElement: '#object-item-1' },
        },
      ],
    },
    {
      id: 'WaitForUserToSelectAssetForCoin',
      nextStepTrigger: { presenceOfElement: '#add-asset-button' },
      isOnClosableDialog: true,
    },
    {
      id: 'AddAssetForCoin',
      elementToHighlightId: '#add-asset-button',
      isTriggerFlickering: true,
      nextStepTrigger: { presenceOfElement: '#object-item-1' },
      mapProjectData: {
        secondObject: 'lastProjectObjectName',
      },
      isOnClosableDialog: true,
    },
    {
      id: 'CloseAssetStoreForCoin',
      elementToHighlightId: '#new-object-dialog #close-button',
      nextStepTrigger: { absenceOfElement: '#new-object-dialog' },
      tooltip: {
        description: {
          messageDescriptor: t`Great! Our game now has 2 **objects**, let's see what we can do with them.`,
        },
      },
    },
    {
      id: 'DragObjectToScene',
      elementToHighlightId: '#object-item-1',
      nextStepTrigger: { instanceAddedOnScene: 'secondObject' },
      tooltip: {
        description: {
          messageDescriptor: t`Place a few $(secondObject) in the scene by dragging them to the canvas.`,
        },
        placement: 'left',
      },
    },
    {
      id: 'SwitchToEventsSheet',
      elementToHighlightId: '[id^=tab-layout-events]',
      nextStepTrigger: { presenceOfElement: '#add-event-button' },
      tooltip: {
        description: {
          messageDescriptor: t`Now let's make $(firstObject) collect the $(secondObject)! Go to the **events** tab of the **scene**.`,
        },
        placement: 'bottom',
      },
    },
    {
      id: 'ClickOnNewEvent',
      elementToHighlightId: '#add-event-button',
      nextStepTrigger: { presenceOfElement: '#add-condition-button' },
      tooltip: {
        title: { messageDescriptor: t`Let’s add an **event**!` },
        description: {
          messageDescriptor: t`👉 **Events** are the logic to your game.`,
        },
        placement: 'bottom',
      },
    },
    {
      id: 'ClickOnNewCondition',
      elementToHighlightId: '#add-condition-button',
      nextStepTrigger: { presenceOfElement: '#instruction-editor-dialog' },
      tooltip: {
        description: {
          messageDescriptor: t`**Events** are made of a condition and an action:
          \\n\\nCondition: "**If** $(firstObject) touches the $(secondObject)..."
          \\n\\nAction: "... **then** the $(secondObject) disappears"
          \\n\\n**Click "Add condition**"`,
        },
        placement: 'bottom',
      },
    },
    {
      id: 'ChooseCharacterForCondition',
      elementToHighlightId: '#instruction-editor-dialog #object-item-0',
      nextStepTrigger: { presenceOfElement: '#object-instruction-selector' },
      tooltip: {
        description: { messageDescriptor: t`Choose $(firstObject)` },
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
        description: {
          messageDescriptor: t`Then the condition we want to use: **"Collision"**.`,
        },
        placement: 'bottom',
      },
      isOnClosableDialog: true,
    },
    {
      id: 'SetParameter',
      elementToHighlightId: '#parameter-1-object-selector',
      nextStepTrigger: { valueHasChanged: true },
      tooltip: {
        description: {
          messageDescriptor: t`Finally, select the target **object** ($(secondObject)).`,
        },
        placement: 'top',
      },
      isOnClosableDialog: true,
    },
    {
      id: 'CloseInstructionEditorForCondition',
      elementToHighlightId: '#instruction-editor-dialog #ok-button',
      nextStepTrigger: { absenceOfElement: '#instruction-editor-dialog' },
      tooltip: {
        description: { messageDescriptor: t`We're good.` },
        placement: 'top',
      },
    },
    {
      id: 'ClickOnNewAction',
      elementToHighlightId: '#add-action-button',
      nextStepTrigger: { presenceOfElement: '#instruction-editor-dialog' },
      tooltip: {
        description: {
          messageDescriptor: t`Let's add **what happens when the condition is met**: make $(secondObject) disappear.`,
        },
        placement: 'bottom',
      },
    },
    {
      id: 'ChoseCoinForAction',
      elementToHighlightId: '#instruction-editor-dialog #object-item-1',
      nextStepTrigger: { presenceOfElement: '#object-instruction-selector' },
      tooltip: {
        description: { messageDescriptor: t`Choose $(secondObject)` },
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
        description: {
          messageDescriptor: t`Then choose the **action** $(secondObject) will receive : "Delete", as we want to remove it.`,
        },
        placement: 'bottom',
      },
      isOnClosableDialog: true,
    },
    {
      id: 'CloseInstructionEditorForAction',
      elementToHighlightId: '#instruction-editor-dialog #ok-button',
      nextStepTrigger: { absenceOfElement: '#instruction-editor-dialog' },
      tooltip: {
        description: { messageDescriptor: t`Nothing more is needed!` },
        placement: 'top',
      },
    },
    {
      id: 'LaunchPreviewWithCoinCollection',
      elementToHighlightId: '#toolbar-preview-button',
      nextStepTrigger: { previewLaunched: true },
      tooltip: {
        title: { messageDescriptor: t`Let's see how it works! 🎮` },
        placement: 'bottom',
      },
    },
    {
      id: 'WaitForUserToHavePlayedWithCoinCollection',
      elementToHighlightId: '#toolbar-preview-button',
      nextStepTrigger: {
        clickOnTooltipButton: "I'm done",
      },
      tooltip: {
        description: {
          messageDescriptor: t`Once you're done testing, close the **preview** and come back here.`,
        },
        placement: 'bottom',
      },
    },
  ],
};

export default inAppTutorial;
