//@ts-check
/// <reference path="../JsExtensionTypes.d.ts" />
/**
 * This is a declaration of an extension for GDevelop 5.
 *
 * ℹ️ Changes in this file are watched and automatically imported if the editor
 * is running. You can also manually run `node import-GDJS-Runtime.js` (in newIDE/app/scripts).
 *
 * The file must be named "JsExtension.js", otherwise GDevelop won't load it.
 * ⚠️ If you make a change and the extension is not loaded, open the developer console
 * and search for any errors.
 *
 * More information on https://github.com/4ian/GDevelop/blob/master/newIDE/README-extensions.md
 */

/** @type {ExtensionModule} */
module.exports = {
  createExtension: function (_, gd) {
    const extension = new gd.PlatformExtension();
    extension
      .setExtensionInformation(
        'DialogueTree',
        _('Dialogue Tree'),
        'Handle dialogue trees, made using Yarn Spinner. Useful to make complex dialogues with multiple choices. The Yarn Spinner editor is embedded in GDevelop so you can edit your dialogues without leaving GDevelop.',
        'Todor Imreorov',
        'Open source (MIT License)'
      )
      .setExtensionHelpPath('/all-features/dialogue-tree')
      .setCategory('Game mechanic');
    extension
      .addInstructionOrExpressionGroupMetadata(_('Dialogue Tree'))
      .setIcon('JsPlatform/Extensions/yarn32.png');

    extension
      .addAction(
        'LoadDialogueFromSceneVariable',
        _('Load dialogue Tree from a scene variable'),
        _(
          'Load a dialogue data object - Yarn json format, stored in a scene variable. Use this command to load all the Dialogue data at the beginning of the game.'
        ),
        _('Load dialogue data from Scene variable _PARAM0_'),
        '',
        'JsPlatform/Extensions/yarn32.png',
        'JsPlatform/Extensions/yarn32.png'
      )
      .addParameter(
        'scenevar',
        _('Scene variable that holds the Yarn Json data'),
        '',
        false
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/DialogueTree/dialoguetools.js')
      .addIncludeFile('Extensions/DialogueTree/bondage.js/dist/bondage.min.js')
      .setFunctionName('gdjs.dialogueTree.loadFromSceneVariable');

    extension
      .addAction(
        'LoadDialogueFromJsonFile',
        _('Load dialogue Tree from a Json File'),
        _(
          'Load a dialogue data object - Yarn json format, stored in a Json file. Use this command to load all the Dialogue data at the beginning of the game.'
        ),
        _('Load dialogue data from json file _PARAM1_'),
        '',
        'JsPlatform/Extensions/yarn32.png',
        'JsPlatform/Extensions/yarn32.png'
      )
      .addCodeOnlyParameter('currentScene', '')
      .addParameter(
        'jsonResource',
        _('Json file that holds the Yarn Json data'),
        '',
        false
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/DialogueTree/dialoguetools.js')
      .addIncludeFile('Extensions/DialogueTree/bondage.js/dist/bondage.min.js')
      .setFunctionName('gdjs.dialogueTree.loadFromJsonFile');

    extension
      .addAction(
        'StartDialogueFromBranch',
        _('Start dialogue from branch'),
        _(
          'Start dialogue from branch. Use this to initiate the dialogue from a specified branch.'
        ),
        _('Start dialogue from branch _PARAM0_'),
        '',
        'JsPlatform/Extensions/yarn32.png',
        'JsPlatform/Extensions/yarn32.png'
      )
      .addParameter('string', _('Dialogue branch'), '', false)
      .getCodeExtraInformation()
      .setFunctionName('gdjs.dialogueTree.startFrom');

    extension
      .addAction(
        'StopRunningDialogue',
        _('Stop running dialogue'),
        _('Stop the running dialogue. Use this to interrupt dialogue parsing.'),
        _('Stop running dialogue'),
        '',
        'JsPlatform/Extensions/yarn32.png',
        'JsPlatform/Extensions/yarn32.png'
      )
      .getCodeExtraInformation()
      .setFunctionName('gdjs.dialogueTree.stopRunningDialogue');

    extension
      .addAction(
        'GoToNextLine',
        _('Go to the next dialogue line'),
        _(
          'Go to the next dialogue line. Use this to advance to the next dialogue line when the player presses a button.'
        ),
        _('Go to the next dialogue line'),
        '',
        'JsPlatform/Extensions/yarn32.png',
        'JsPlatform/Extensions/yarn32.png'
      )
      .getCodeExtraInformation()
      .setFunctionName('gdjs.dialogueTree.goToNextDialogueLine');

    extension
      .addAction(
        'ConfirmSelectOption',
        _('Confirm selected Option'),
        _(
          'Set the selected option as confirmed, which will validate it and go forward to the next node. Use other actions to select options (see "select next option" and "Select previous option").'
        ),
        _('Confirm selected Option'),
        '',
        'JsPlatform/Extensions/yarn32.png',
        'JsPlatform/Extensions/yarn32.png'
      )
      .getCodeExtraInformation()
      .setFunctionName('gdjs.dialogueTree.confirmSelectOption');

    extension
      .addAction(
        'SelectNextOption',
        _('Select next Option'),
        _(
          'Select next Option (add 1 to selected option number). Use this when the dialogue line is of type "options" and the player has pressed a button to change selected option.'
        ),
        _('Select next Option'),
        '',
        'JsPlatform/Extensions/yarn32.png',
        'JsPlatform/Extensions/yarn32.png'
      )
      .getCodeExtraInformation()
      .setFunctionName('gdjs.dialogueTree.selectNextOption');

    extension
      .addAction(
        'SelectPreviousOption',
        _('Select previous Option'),
        _(
          'Select previous Option (subtract 1 from selected option number). Use this when the dialogue line is of type "options" and the player has pressed a button to change selected option.'
        ),
        _('Select previous Option'),
        '',
        'JsPlatform/Extensions/yarn32.png',
        'JsPlatform/Extensions/yarn32.png'
      )
      .getCodeExtraInformation()
      .setFunctionName('gdjs.dialogueTree.selectPreviousOption');

    extension
      .addAction(
        'SelectOption',
        _('Select option by number'),
        _(
          'Select option by number. Use this when the dialogue line is of type "options" and the player has pressed a button to change selected option.'
        ),
        _('Select option at index _PARAM0_'),
        '',
        'JsPlatform/Extensions/yarn32.png',
        'JsPlatform/Extensions/yarn32.png'
      )
      .addParameter('expression', _('Option index number'), '', false)
      .getCodeExtraInformation()
      .setFunctionName('gdjs.dialogueTree.selectOption');

    extension
      .addAction(
        'ScrollClippedText',
        _('Scroll clipped text'),
        _(
          'Scroll clipped text. Use this with a timer and "get clipped text" when you want to create a typewriter effect. Every time the action runs, a new character appears from the text.'
        ),
        _('Scroll clipped text'),
        '',
        'JsPlatform/Extensions/yarn32.png',
        'JsPlatform/Extensions/yarn32.png'
      )
      .getCodeExtraInformation()
      .setFunctionName('gdjs.dialogueTree.scrollClippedText');

    extension
      .addAction(
        'CompleteClippedTextScrolling',
        _('Complete clipped text scrolling'),
        _(
          'Complete the clipped text scrolling. Use this action whenever you want to skip scrolling.'
        ),
        _('Complete clipped text scrolling'),
        '',
        'JsPlatform/Extensions/yarn32.png',
        'JsPlatform/Extensions/yarn32.png'
      )
      .getCodeExtraInformation()
      .setFunctionName('gdjs.dialogueTree.completeClippedTextScrolling');

    extension
      .addAction(
        'SetStringVariable',
        _('Set dialogue state string variable'),
        _(
          'Set dialogue state string variable. Use this to set a variable that the dialogue data is using.'
        ),
        _('Set dialogue state string variable _PARAM0_ to _PARAM1_'),
        '',
        'JsPlatform/Extensions/yarn32.png',
        'JsPlatform/Extensions/yarn32.png'
      )
      .addParameter('string', _('State Variable Name'), '', false)
      .addParameter('string', _('Variable string value'), '', false)
      .getCodeExtraInformation()
      .setFunctionName('gdjs.dialogueTree.setVariable');

    extension
      .addAction(
        'SetNumberVariable',
        _('Set dialogue state number variable'),
        _(
          'Set dialogue state number variable. Use this to set a variable that the dialogue data is using.'
        ),
        _('Set dialogue state number variable _PARAM0_ to _PARAM1_'),
        '',
        'JsPlatform/Extensions/yarn32.png',
        'JsPlatform/Extensions/yarn32.png'
      )
      .addParameter('string', _('State Variable Name'), '', false)
      .addParameter('expression', _('Variable number value'), '', true)
      .getCodeExtraInformation()
      .setFunctionName('gdjs.dialogueTree.setVariable');

    extension
      .addAction(
        'SetBooleanVariable',
        _('Set dialogue state boolean variable'),
        _(
          'Set dialogue state boolean variable. Use this to set a variable that the dialogue data is using.'
        ),
        _('Set dialogue state boolean variable _PARAM0_ to _PARAM1_'),
        '',
        'JsPlatform/Extensions/yarn32.png',
        'JsPlatform/Extensions/yarn32.png'
      )
      .addParameter('string', _('State Variable Name'), '', false)
      .addParameter('trueorfalse', _('Variable boolean value'), '', false)
      .getCodeExtraInformation()
      .setFunctionName('gdjs.dialogueTree.setVariable');

    extension
      .addAction(
        'SaveState',
        _('Save dialogue state'),
        _(
          'Save dialogue state. Use this to store the dialogue state into a variable, which can later be used for saving the game. That way player choices can become part of the game save.'
        ),
        _('Save dialogue state to _PARAM0_'),
        '',
        'JsPlatform/Extensions/yarn32.png',
        'JsPlatform/Extensions/yarn32.png'
      )
      .addParameter('globalvar', _('Global Variable'))
      .getCodeExtraInformation()
      .setFunctionName('gdjs.dialogueTree.saveState');

    extension
      .addAction(
        'LoadState',
        _('Load dialogue state'),
        _(
          'Load dialogue state. Use this to restore dialogue state, if you have stored in a variable before with the "Save state" action.'
        ),
        _('Load dialogue state from _PARAM0_'),
        '',
        'JsPlatform/Extensions/yarn32.png',
        'JsPlatform/Extensions/yarn32.png'
      )
      .addParameter('globalvar', _('Global Variable'), '', false)
      .getCodeExtraInformation()
      .setFunctionName('gdjs.dialogueTree.loadState');

    extension
      .addAction(
        'ClearState',
        _('Clear dialogue state'),
        _(
          'Clear dialogue state. This resets all dialogue state accumulated by the player choices. Useful when the player is starting a new game.'
        ),
        _('Clear dialogue state'),
        '',
        'JsPlatform/Extensions/yarn32.png',
        'JsPlatform/Extensions/yarn32.png'
      )
      .getCodeExtraInformation()
      .setFunctionName('gdjs.dialogueTree.clearState');

    extension
      .addStrExpression(
        'LineText',
        _('Get the current dialogue line text'),
        _('Returns the current dialogue line text'),
        '',
        'JsPlatform/Extensions/yarn32.png'
      )
      .getCodeExtraInformation()
      .setFunctionName('gdjs.dialogueTree.getLineText');

    extension
      .addExpression(
        'OptionsCount',
        _('Get the number of options in an options line type'),
        _('Get the number of options in an options line type'),
        '',
        'JsPlatform/Extensions/yarn32.png'
      )
      .getCodeExtraInformation()
      .setFunctionName('gdjs.dialogueTree.getLineOptionsCount');

    extension
      .addStrExpression(
        'Option',
        _('Get the text of an option from an Options line type'),
        _(
          "Get the text of an option from an Options line type, using the option's Number. The numbers start from 0."
        ),
        '',
        'JsPlatform/Extensions/yarn32.png'
      )
      .addParameter('expression', _('Option Index Number'), '', false)
      .getCodeExtraInformation()
      .setFunctionName('gdjs.dialogueTree.getLineOption');

    extension
      .addStrExpression(
        'HorizontalOptionsList',
        _('Get a Horizontal list of options from the Options line type'),
        _(
          "Get the text of all available options from an Options line type as a horizontal list. You can also pass the selected option's cursor string, which by default is ->"
        ),
        '',
        'JsPlatform/Extensions/yarn32.png'
      )
      .addParameter('string', _('Options Selection Cursor'), '', false)
      .setDefaultValue('>')
      .getCodeExtraInformation()
      .setFunctionName('gdjs.dialogueTree.getLineOptionsTextHorizontal');

    extension
      .addStrExpression(
        'VerticalOptionsList',
        _('Get a Vertical list of options from the Options line type'),
        _(
          "Get the text of all available options from an Options line type as a vertical list. You can also pass the selected option's cursor string, which by default is ->"
        ),
        '',
        'JsPlatform/Extensions/yarn32.png'
      )
      .addParameter('string', _('Options Selection Cursor'), '', false)
      .setDefaultValue('>')
      .getCodeExtraInformation()
      .setFunctionName('gdjs.dialogueTree.getLineOptionsTextVertical');

    extension
      .addExpression(
        'SelectedOptionIndex',
        _('Get the number of the currently selected option'),
        _(
          'Get the number of the currently selected option. Use this to help you render the option selection marker at the right place.'
        ),
        '',
        'JsPlatform/Extensions/yarn32.png'
      )
      .getCodeExtraInformation()
      .setFunctionName('gdjs.dialogueTree.getSelectedOption');

    extension
      .addStrExpression(
        'ClippedLineText',
        _('Get dialogue line text clipped'),
        _(
          'Get dialogue line text clipped by the typewriter effect. Use the "Scroll clipped text" action to control the typewriter effect.'
        ),
        '',
        'JsPlatform/Extensions/yarn32.png'
      )
      .getCodeExtraInformation()
      .setFunctionName('gdjs.dialogueTree.getClippedLineText');

    extension
      .addStrExpression(
        'BranchTitle',
        _('Get the title of the current branch of the running dialogue'),
        _('Get the title of the current branch of the running dialogue'),
        '',
        'JsPlatform/Extensions/yarn32.png'
      )
      .getCodeExtraInformation()
      .setFunctionName('gdjs.dialogueTree.getBranchTitle');

    extension
      .addStrExpression(
        'BranchTags',
        _('Get the tags of the current branch of the running dialogue'),
        _('Get the tags of the current branch of the running dialogue'),
        '',
        'JsPlatform/Extensions/yarn32.png'
      )
      .getCodeExtraInformation()
      .setFunctionName('gdjs.dialogueTree.getBranchTags');

    extension
      .addStrExpression(
        'BranchTag',
        _(
          'Get a tag of the current branch of the running dialogue via its index'
        ),
        _(
          'Get a tag of the current branch of the running dialogue via its index'
        ),
        '',
        'JsPlatform/Extensions/yarn32.png'
      )
      .addParameter('expression', _('Tag Index Number'), '', false)
      .getCodeExtraInformation()
      .setFunctionName('gdjs.dialogueTree.getBranchTag');

    extension
      .addStrExpression(
        'CommandParameter',
        _('Get the parameters of a command call'),
        _(
          'Get the parameters of a command call - <<command withParameter anotherParameter>>'
        ),
        '',
        'JsPlatform/Extensions/yarn32.png'
      )
      .addParameter('expression', _('parameter Index Number'), '', true)
      .getCodeExtraInformation()
      .setFunctionName('gdjs.dialogueTree.getCommandParameter');

    extension
      .addExpression(
        'CommandParametersCount',
        _('Get the number of parameters in the currently passed command'),
        _('Get the number of parameters in the currently passed command'),
        '',
        'JsPlatform/Extensions/yarn32.png'
      )
      .getCodeExtraInformation()
      .setFunctionName('gdjs.dialogueTree.commandParametersCount');

    extension
      .addStrExpression(
        'TagParameter',
        _(
          'Get parameter from a Tag found by the branch contains tag condition'
        ),
        _(
          'Get parameter from a Tag found by the branch contains tag condition'
        ),
        '',
        'JsPlatform/Extensions/yarn32.png'
      )
      .addParameter('expression', _('parameter Index Number'), '', true)
      .getCodeExtraInformation()
      .setFunctionName('gdjs.dialogueTree.getTagParameter');

    extension
      .addStrExpression(
        'VisitedBranchTitles',
        _('Get a list of all visited branches'),
        _('Get a list of all visited branches'),
        '',
        'JsPlatform/Extensions/yarn32.png'
      )
      .getCodeExtraInformation()
      .setFunctionName('gdjs.dialogueTree.getVisitedBranchTitles');

    extension
      .addStrExpression(
        'BranchText',
        _('Get the full raw text of the current branch'),
        _('Get the full raw text of the current branch'),
        '',
        'JsPlatform/Extensions/yarn32.png'
      )
      .getCodeExtraInformation()
      .setFunctionName('gdjs.dialogueTree.getBranchText');

    extension
      .addExpression(
        'Variable',
        _('Get dialogue state value'),
        _('Get dialogue state value'),
        '',
        'JsPlatform/Extensions/yarn32.png'
      )
      .addParameter('string', _('Variable Name'), '', false)
      .getCodeExtraInformation()
      .setFunctionName('gdjs.dialogueTree.getVariable');

    extension
      .addCondition(
        'IsCommandCalled',
        _('Command is called'),
        _(
          'Check if a specific Command is called. If it is a <<command withParameter>>, you can even get the parameter with the CommandParameter expression.'
        ),
        _('Command <<_PARAM0_>> is called'),
        '',
        'JsPlatform/Extensions/yarn32.png',
        'JsPlatform/Extensions/yarn32.png'
      )
      .addParameter('string', _('Command String'), '', false)
      .getCodeExtraInformation()
      .setFunctionName('gdjs.dialogueTree.isCommandCalled');

    extension
      .addCondition(
        'IsDialogueLineType',
        _('Dialogue line type'),
        _(
          'Check if the current dialogue line line is one of the three existing types. Use this to set what logic is executed for each type.\nThe three types are as follows:\n- text: when displaying dialogue text.\n- options: when displaying [[branching/options]] for dialogue choices.\n-command: when <<commands>> are triggered by the dialogue data.'
        ),
        _('The dialogue line is _PARAM0_'),
        '',
        'JsPlatform/Extensions/yarn32.png',
        'JsPlatform/Extensions/yarn32.png'
      )
      .addParameter(
        'stringWithSelector',
        _('type'),
        '["text", "options", "command"]',
        false
      )
      .getCodeExtraInformation()
      .setFunctionName('gdjs.dialogueTree.isDialogueLineType');

    extension
      .addCondition(
        'IsDialogueRunning',
        _('Dialogue is running'),
        _(
          'Check if the dialogue is running. Use this to for things like locking the player movement while speaking with a non player character.'
        ),
        _('Dialogue is running'),
        '',
        'JsPlatform/Extensions/yarn32.png',
        'JsPlatform/Extensions/yarn32.png'
      )
      .getCodeExtraInformation()
      .setFunctionName('gdjs.dialogueTree.isRunning');

    extension
      .addCondition(
        'HasBranch',
        _('Dialogue has branch'),
        _(
          'Check if the dialogue has a branch with specified name. Use this to check if a dialogue branch exists in the loaded dialogue data.'
        ),
        _('Dialogue has a branch named _PARAM0_'),
        '',
        'JsPlatform/Extensions/yarn32.png',
        'JsPlatform/Extensions/yarn32.png'
      )
      .addParameter('string', _('Branch name'), '', false)
      .getCodeExtraInformation()
      .setFunctionName('gdjs.dialogueTree.hasDialogueBranch');

    extension
      .addCondition(
        'HasSelectedOptionChanged',
        _('Has selected option changed'),
        _(
          'Check if a selected option has changed when the current dialogue line type is options. Use this to detect when the player has selected another option, so you can re-draw where the selection arrow is.'
        ),
        _('Selected option has changed'),
        '',
        'JsPlatform/Extensions/yarn32.png',
        'JsPlatform/Extensions/yarn32.png'
      )
      .getCodeExtraInformation()
      .setFunctionName('gdjs.dialogueTree.hasSelectedOptionChanged');

    extension
      .addCondition(
        'CurrentBranchTitle',
        _('Current dialogue branch title'),
        _(
          'Check if the current dialogue branch title is equal to a string. Use this to trigger game events when the player has visited a specific dialogue branch.'
        ),
        _('The current dialogue branch title is _PARAM0_'),
        '',
        'JsPlatform/Extensions/yarn32.png',
        'JsPlatform/Extensions/yarn32.png'
      )
      .addParameter('string', _('title name'), '', false)
      .getCodeExtraInformation()
      .setFunctionName('gdjs.dialogueTree.branchTitleIs');

    extension
      .addCondition(
        'CurrentBranchContainsTag',
        _('Current dialogue branch contains a tag'),
        _(
          'Check if the current dialogue branch contains a specific tag. Tags are an alternative useful way to <<commands>> to drive game logic with the dialogue data.'
        ),
        _('The current dialogue branch contains a _PARAM0_ tag'),
        '',
        'JsPlatform/Extensions/yarn32.png',
        'JsPlatform/Extensions/yarn32.png'
      )
      .addParameter('string', _('tag name'), '', false)
      .getCodeExtraInformation()
      .setFunctionName('gdjs.dialogueTree.branchContainsTag');

    extension
      .addCondition(
        'WasBranchVisited',
        _('Branch title has been visited'),
        _('Check if a branch has been visited'),
        _('Branch title _PARAM0_ has been visited'),
        '',
        'JsPlatform/Extensions/yarn32.png',
        'JsPlatform/Extensions/yarn32.png'
      )
      .addParameter('string', _('branch title'), '', false)
      .getCodeExtraInformation()
      .setFunctionName('gdjs.dialogueTree.branchTitleHasBeenVisited');

    extension
      .addCondition(
        'CompareDialogueStateStringVariable',
        _('Compare dialogue state string variable'),
        _(
          'Compare dialogue state string variable. Use this to trigger game events via dialogue variables.'
        ),
        _('Dialogue state string variable _PARAM0_ is equal to _PARAM1_'),
        '',
        'JsPlatform/Extensions/yarn32.png',
        'JsPlatform/Extensions/yarn32.png'
      )
      .addParameter('string', _('State variable'), '', false)
      .addParameter('string', _('Equal to'), '', false)
      .getCodeExtraInformation()
      .setFunctionName('gdjs.dialogueTree.compareVariable');

    extension
      .addCondition(
        'CompareDialogueStateNumberVariable',
        _('Compare dialogue state number variable'),
        _(
          'Compare dialogue state number variable. Use this to trigger game events via dialogue variables.'
        ),
        _('Dialogue state number variable _PARAM0_ is equal to _PARAM1_'),
        '',
        'JsPlatform/Extensions/yarn32.png',
        'JsPlatform/Extensions/yarn32.png'
      )
      .addParameter('string', _('State variable'), '', false)
      .addParameter('expression', _('Equal to'), '', false)
      .getCodeExtraInformation()
      .setFunctionName('gdjs.dialogueTree.compareVariable');

    extension
      .addCondition(
        'CompareDialogueStateBooleanVariable',
        _('Compare dialogue state boolean variable'),
        _(
          'Compare dialogue state variable. Use this to trigger game events via dialogue variables.'
        ),
        _('Dialogue state boolean variable _PARAM0_ is equal to _PARAM1_'),
        '',
        'JsPlatform/Extensions/yarn32.png',
        'JsPlatform/Extensions/yarn32.png'
      )
      .addParameter('string', _('State variable'), '', false)
      .addParameter('trueorfalse', _('Equal to'), '', false)
      .getCodeExtraInformation()
      .setFunctionName('gdjs.dialogueTree.compareVariable');

    extension
      .addCondition(
        'HasClippedTextScrollingCompleted',
        _('Clipped text has completed scrolling'),
        _(
          'Check if the clipped text scrolling has completed. Use this to prevent the player from going to the next dialogue line before the typing effect has revealed the entire text.'
        ),
        _('Clipped text has completed scrolling'),
        '',
        'JsPlatform/Extensions/yarn32.png',
        'JsPlatform/Extensions/yarn32.png'
      )
      .getCodeExtraInformation()
      .setFunctionName('gdjs.dialogueTree.hasClippedScrollingCompleted');

    return extension;
  },
  runExtensionSanityTests: function (gd, extension) {
    return [];
  },
};
