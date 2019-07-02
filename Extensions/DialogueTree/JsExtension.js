/**
 * This is a declaration of an extension for GDevelop 5.
 *
 * ℹ️ Run `node import-GDJS-Runtime.js` (in newIDE/app/scripts) if you make any change
 * to this extension file or to any other *.js file that you reference inside.
 *
 * The file must be named "JsExtension.js", otherwise GDevelop won't load it.
 * ⚠️ If you make a change and the extension is not loaded, open the developer console
 * and search for any errors.
 *
 * More information on https://github.com/4ian/GDevelop/blob/master/newIDE/README-extensions.md
 */
module.exports = {
	createExtension: function(_, gd) {
		const extension = new gd.PlatformExtension();
		extension
			.setExtensionInformation(
				'DialogueTree',
				_('Dialoguetree'),
				_('Initiate tree dialogues from Yarn via Bondagejs.'),
				'Todor Imreorov',
				'Open source (MIT License)'
			)
			.setExtensionHelpPath('/all-features/dialoguetree');

		extension
			.addAction(
				'LoadDialogueFromSceneVariable',
				_('Load Dialogue Tree from a Scene Variable'),
				_('Load a dialogue data object - Yarn json format, stored in a scene variable'),
				_('Load Dialogue data from Scene Variable: _PARAM1_ and begin from _PARAM2_ Node'),
				_('Dialogue Tree'),
				'JsPlatform/Extensions/yarn24.png',
				'JsPlatform/Extensions/yarn32.png'
			)
			.addCodeOnlyParameter('currentScene', '')
			.addParameter('scenevar', _('Scene variable that holds the Yarn Json data'))
			.addParameter('string', _('Dialogue node'))
			.setDefaultValue('Start')
			.getCodeExtraInformation()
			.setIncludeFile('Extensions/DialogueTree/dialoguetools.js')
			.addIncludeFile('Extensions/DialogueTree/bondage.min.js')
			.setFunctionName('gdjs.dialogueTree.loadFromSceneVar');

		extension
			.addAction(
				'LoadDialogueFromJsonFile',
				_('Load Dialogue Tree from a Json File'),
				_('Load a dialogue data object - Yarn json format, stored in a Json file'),
				_('Load Dialogue data from Json File: _PARAM1_ and begin from _PARAM2_ Node'),
				_('Dialogue Tree'),
				'JsPlatform/Extensions/yarn24.png',
				'JsPlatform/Extensions/yarn32.png'
			)
			.addCodeOnlyParameter('currentScene', '')
			.addParameter('jsonResource', _('Json file that holds the Yarn Json data'))
			.addParameter('string', _('Dialogue node'))
			.getCodeExtraInformation()
			.setIncludeFile('Extensions/DialogueTree/dialoguetools.js')
			.addIncludeFile('Extensions/DialogueTree/bondage.min.js')
			.setFunctionName('gdjs.dialogueTree.loadFromJsonFile');

		extension
			.addAction(
				'StarDialogueFromNode',
				_('Start Dialogue from Node'),
				_('Start Dialogue from Node in Yarn. You can use this to store multiple Npcs in one Yarn file'),
				_('Start Dialogue from Node: _PARAM0_'),
				_('Dialogue Tree'),
				'JsPlatform/Extensions/yarn24.png',
				'JsPlatform/Extensions/yarn32.png'
			)
			.addParameter('string', _('Dialogue node'))
			.getCodeExtraInformation()
			.setFunctionName('gdjs.dialogueTree.startFrom');

		extension
			.addAction(
				'AdvanceToNextLine',
				_('Advance to the Next Dialogue Line'),
				_('Advance to the Next dialogue line'),
				_('Advance to the Next Dialogue Line'),
				_('Dialogue Tree'),
				'JsPlatform/Extensions/yarn24.png',
				'JsPlatform/Extensions/yarn32.png'
			)
			.getCodeExtraInformation()
			.setFunctionName('gdjs.dialogueTree.advanceDialogue');

		extension
			.addAction(
				'ConfirmSelectOption',
				_('Confirm Selected Option'),
				_('Confirm Selected Option'),
				_('Confirm Selected Option'),
				_('Dialogue Tree'),
				'JsPlatform/Extensions/yarn24.png',
				'JsPlatform/Extensions/yarn32.png'
			)
			.getCodeExtraInformation()
			.setFunctionName('gdjs.dialogueTree.confirmSelectOption');

		extension
			.addAction(
				'SelectNextOption',
				_('Select Next Option'),
				_('Select Next Option (add 1 to selected option index)'),
				_('Select Next Option'),
				_('Dialogue Tree'),
				'JsPlatform/Extensions/yarn24.png',
				'JsPlatform/Extensions/yarn32.png'
			)
			.getCodeExtraInformation()
			.setFunctionName('gdjs.dialogueTree.selectNextOption');

		extension
			.addAction(
				'SelectPreviousOption',
				_('Select Previous Option'),
				_('Select Previous Option (subtract 1 from selected option index)'),
				_('Select Previous Option'),
				_('Dialogue Tree'),
				'JsPlatform/Extensions/yarn24.png',
				'JsPlatform/Extensions/yarn32.png'
			)
			.getCodeExtraInformation()
			.setFunctionName('gdjs.dialogueTree.selectPreviousOption');

		extension
			.addAction(
				'SelectOption',
				_('Select Option by Index'),
				_('Select Option by Index'),
				_('Select Option by Index'),
				_('Dialogue Tree'),
				'JsPlatform/Extensions/yarn24.png',
				'JsPlatform/Extensions/yarn32.png'
			)
			.addParameter('expression', _('Option index number'))
			.setDefaultValue('0')
			.getCodeExtraInformation()
			.setFunctionName('gdjs.dialogueTree.selectPreviousOption');

		extension
			.addAction(
				'ScrollClippedText',
				_('Scroll Clipped text'),
				_('Scroll Clipped text'),
				_('Scroll Clipped text'),
				_('Dialogue Tree'),
				'JsPlatform/Extensions/yarn24.png',
				'JsPlatform/Extensions/yarn32.png'
			)
			.getCodeExtraInformation()
			.setFunctionName('gdjs.dialogueTree.scrollCippedText');

		extension
			.addAction(
				'SetVariable',
				_('Set dialogue state variable'),
				_('Set dialogue state variable'),
				_('Set dialogue state variable _PARAM0_ to _PARAM1_'),
				_('Dialogue Tree'),
				'JsPlatform/Extensions/yarn24.png',
				'JsPlatform/Extensions/yarn32.png'
			)
			.addParameter('string', _('State Variable Name'))
			.addParameter('expression', _('Variable Value'))
			.getCodeExtraInformation()
			.setFunctionName('gdjs.dialogueTree.setVariable');

		extension
			.addAction(
				'SaveState',
				_('Save Dialogue state'),
				_('Save Dialogue state'),
				_('Save Dialogue state to _PARAM0_'),
				_('Dialogue Tree'),
				'JsPlatform/Extensions/yarn24.png',
				'JsPlatform/Extensions/yarn32.png'
			)
			.addParameter('globalvar', _('Global Variable'))
			.getCodeExtraInformation()
			.setFunctionName('gdjs.dialogueTree.saveState');

		extension
			.addAction(
				'LoadState',
				_('Load Dialogue state'),
				_('Load Dialogue state'),
				_('Load Dialogue state from _PARAM0_'),
				_('Dialogue Tree'),
				'JsPlatform/Extensions/yarn24.png',
				'JsPlatform/Extensions/yarn32.png'
			)
			.addParameter('globalvar', _('Global Variable'))
			.getCodeExtraInformation()
			.setFunctionName('gdjs.dialogueTree.loadState');

		extension
			.addStrExpression(
				'GetLineText',
				_('Get the current dialogue line text'),
				_('This returns the current dialogue line text'),
				_('Dialogue Tree'),
				'JsPlatform/Extensions/yarn24.png',
				'JsPlatform/Extensions/yarn32.png'
			)
			.getCodeExtraInformation()
			.setFunctionName('gdjs.dialogueTree.getLineText');

		extension
			.addExpression(
				'GetOptionsCount',
				_('Get the number of options in an Options line type'),
				_('Get the number of options in an Options line type'),
				_('Dialogue Tree'),
				'JsPlatform/Extensions/yarn24.png',
				'JsPlatform/Extensions/yarn32.png'
			)
			.getCodeExtraInformation()
			.setFunctionName('gdjs.dialogueTree.lineOptionsCount');

		extension
			.addStrExpression(
				'GetOption',
				_('Get the text of an option from an Options line type'),
				_('Get the text of an option from an Options line type'),
				_('Dialogue Tree'),
				'JsPlatform/Extensions/yarn24.png',
				'JsPlatform/Extensions/yarn32.png'
			)
			.addParameter('expression', _('Option Index Number'))
			.getCodeExtraInformation()
			.setFunctionName('gdjs.dialogueTree.getLineOption');

		extension
			.addExpression(
				'GetSelectedOptionIndex',
				_('Get the index of the currently selected option'),
				_('Get the index of the currently selected option'),
				_('Dialogue Tree'),
				'JsPlatform/Extensions/yarn24.png',
				'JsPlatform/Extensions/yarn32.png'
			)
			.getCodeExtraInformation()
			.setFunctionName('gdjs.dialogueTree.getSelectOption');

		extension
			.addStrExpression(
				'GetClippedLineText',
				_('Get dialogue line text clipped'),
				_('Get dialogue line text clipped'),
				_('Dialogue Tree'),
				'JsPlatform/Extensions/yarn24.png',
				'JsPlatform/Extensions/yarn32.png'
			)
			.getCodeExtraInformation()
			.setFunctionName('gdjs.dialogueTree.getClippedLineText');

		extension
			.addStrExpression(
				'GetBranchTitle',
				_('Get the title of the current branch of running dialogue'),
				_('Get the title of the current branch of running dialogue'),
				_('Dialogue Tree'),
				'JsPlatform/Extensions/yarn24.png',
				'JsPlatform/Extensions/yarn32.png'
			)
			.getCodeExtraInformation()
			.setFunctionName('gdjs.dialogueTree.getBranchTitle');

		extension
			.addStrExpression(
				'GetBranchTags',
				_('Get the tags of the current branch of running dialogue'),
				_('Get the tags of the current branch of running dialogue'),
				_('Dialogue Tree'),
				'JsPlatform/Extensions/yarn24.png',
				'JsPlatform/Extensions/yarn32.png'
			)
			.getCodeExtraInformation()
			.setFunctionName('gdjs.dialogueTree.getBranchTags');

		extension
			.addStrExpression(
				'GetBranchTag',
				_('Get a tag of the current branch of running dialogue via index'),
				_('Get a tag of the current branch of running dialogue via index'),
				_('Dialogue Tree'),
				'JsPlatform/Extensions/yarn24.png',
				'JsPlatform/Extensions/yarn32.png'
			)
			.addParameter('expression', _('Tag Index Number'))
			.getCodeExtraInformation()
			.setFunctionName('gdjs.dialogueTree.getBranchTag');

		extension
			.addStrExpression(
				'GetCommandParameter',
				_('Get the parameters of a command call'),
				_('Get the parameters of a command call'),
				_('Dialogue Tree'),
				'JsPlatform/Extensions/yarn24.png',
				'JsPlatform/Extensions/yarn32.png'
			)
			.addParameter('expression', _('parameter Index Number'), '', true)
			.getCodeExtraInformation()
			.setFunctionName('gdjs.dialogueTree.getCommandParameter');

		extension
			.addExpression(
				'GetCommandParametersCount',
				_('Get the number of parameters in the currently passed command'),
				_('Get the number of parameters in the currently passed command'),
				_('Dialogue Tree'),
				'JsPlatform/Extensions/yarn24.png',
				'JsPlatform/Extensions/yarn32.png'
			)
			.getCodeExtraInformation()
			.setFunctionName('gdjs.dialogueTree.commandParametersCount');

		extension
			.addStrExpression(
				'GetTagParameter',
				_('Get Parameter from a Tag found by the Branch contains tag condition'),
				_('Get Parameter from a Tag found by the Branch contains tag condition'),
				_('Dialogue Tree'),
				'JsPlatform/Extensions/yarn24.png',
				'JsPlatform/Extensions/yarn32.png'
			)
			.addParameter('expression', _('parameter Index Number'), '', true)
			.getCodeExtraInformation()
			.setFunctionName('gdjs.dialogueTree.getTagParameter');

		extension
			.addStrExpression(
				'GetVisitedBranchTitles',
				_('Get a list of all visited branches'),
				_('Get a list of all visited branches'),
				_('Dialogue Tree'),
				'JsPlatform/Extensions/yarn24.png',
				'JsPlatform/Extensions/yarn32.png'
			)
			.getCodeExtraInformation()
			.setFunctionName('gdjs.dialogueTree.getVisitedBranchTitles');

		extension
			.addStrExpression(
				'GetBranchText',
				_('Get the raw text of the current branch'),
				_('Get the full raw text of the current branch'),
				_('Dialogue Tree'),
				'JsPlatform/Extensions/yarn24.png',
				'JsPlatform/Extensions/yarn32.png'
			)
			.getCodeExtraInformation()
			.setFunctionName('gdjs.dialogueTree.getBranchText');

		extension
			.addExpression(
				'GetVariable',
				_('Get Dialogue state value'),
				_('Get Dialogue state value'),
				_('Dialogue Tree'),
				'JsPlatform/Extensions/yarn24.png',
				'JsPlatform/Extensions/yarn32.png'
			)
			.addParameter('string', _('Variable Name'))
			.getCodeExtraInformation()
			.setFunctionName('gdjs.dialogueTree.getVariable');

		extension
			.addCondition(
				'Command is Called',
				_('Command is Called'),
				_('Command is Called'),
				_('Command <<_PARAM0_>> is Called'),
				_('Dialogue Tree'),
				'JsPlatform/Extensions/yarn24.png',
				'JsPlatform/Extensions/yarn32.png'
			)
			.addParameter('string', _('Command String'))
			.getCodeExtraInformation()
			.setFunctionName('gdjs.dialogueTree.commandIsCalled');

		extension
			.addCondition(
				'The Dialogue line is of type',
				_('The Dialogue line is of type'),
				_('The Dialogue line is of type'),
				_('The Dialogue line is of type _PARAM0_'),
				_('Dialogue Tree'),
				'JsPlatform/Extensions/yarn24.png',
				'JsPlatform/Extensions/yarn32.png'
			)
			.addParameter('stringWithSelector', _('type'), '["text", "options", "command"]', false)
			.getCodeExtraInformation()
			.setFunctionName('gdjs.dialogueTree.compareDialogueLineType');

		extension
			.addCondition(
				'Dialogue is Running',
				_('Dialogue is Running'),
				_('Dialogue is Running'),
				_('Dialogue is Running'),
				_('Dialogue Tree'),
				'JsPlatform/Extensions/yarn24.png',
				'JsPlatform/Extensions/yarn32.png'
			)
			.getCodeExtraInformation()
			.setFunctionName('gdjs.dialogueTree.isRunning');

		extension
			.addCondition(
				'Dialogue contains a branch',
				_('Dialogue contains a branch'),
				_('Dialogue contains a branch'),
				_('Dialogue contains a branch named _PARAM0_'),
				_('Dialogue Tree'),
				'JsPlatform/Extensions/yarn24.png',
				'JsPlatform/Extensions/yarn32.png'
			)
			.addParameter('string', _('Branch name'))
			.getCodeExtraInformation()
			.setFunctionName('gdjs.dialogueTree.dialogueContainsBranch');

		extension
			.addCondition(
				'Selected Option has Changed',
				_('Selected Option has Changed'),
				_('Selected Option has Changed'),
				_('Selected Option has Changed'),
				_('Dialogue Tree'),
				'JsPlatform/Extensions/yarn24.png',
				'JsPlatform/Extensions/yarn32.png'
			)
			.getCodeExtraInformation()
			.setFunctionName('gdjs.dialogueTree.selectedOptionHasUpdated');

		extension
			.addCondition(
				'Current branch title is',
				_('Current Dialogue branch title is'),
				_('The current Dialogue branch title is'),
				_('The current Dialogue branch title is _PARAM0_'),
				_('Dialogue Tree'),
				'JsPlatform/Extensions/yarn24.png',
				'JsPlatform/Extensions/yarn32.png'
			)
			.addParameter('string', _('title name'))
			.getCodeExtraInformation()
			.setFunctionName('gdjs.dialogueTree.branchTitleIs');

		extension
			.addCondition(
				'Current branch contains Tag',
				_('Current Dialogue branch contains a tag'),
				_('The current Dialogue branch contains a tag'),
				_('The current Dialogue branch contains a _PARAM0_ tag'),
				_('Dialogue Tree'),
				'JsPlatform/Extensions/yarn24.png',
				'JsPlatform/Extensions/yarn32.png'
			)
			.addParameter('string', _('tag name'))
			.getCodeExtraInformation()
			.setFunctionName('gdjs.dialogueTree.branchContainsTag');

		extension
			.addCondition(
				'Branch has been visited before',
				_('Branch title has been visited before'),
				_('Branch title has been visited before'),
				_('Branch title _PARAM0_ has been visited before'),
				_('Dialogue Tree'),
				'JsPlatform/Extensions/yarn24.png',
				'JsPlatform/Extensions/yarn32.png'
			)
			.addParameter('string', _('branch title'))
			.getCodeExtraInformation()
			.setFunctionName('gdjs.dialogueTree.branchTitleHasBeenVisited');

		extension
			.addCondition(
				'Compare Dialogue State variable',
				_('Compare Dialogue State variable'),
				_('Compare Dialogue State variable'),
				_('Branch title _PARAM0_ is equal to _PARAM1_'),
				_('Dialogue Tree'),
				'JsPlatform/Extensions/yarn24.png',
				'JsPlatform/Extensions/yarn32.png'
			)
			.addParameter('string', _('State variable'))
			.addParameter('string', _('Equal to'))
			.getCodeExtraInformation()
			.setFunctionName('gdjs.dialogueTree.compareVariable');

		extension
			.addCondition(
				'Text Scrolling has Completed',
				_('Text Scrolling has Completed'),
				_('Text Scrolling has Completed'),
				_('Text Scrolling has Completed'),
				_('Dialogue Tree'),
				'JsPlatform/Extensions/yarn24.png',
				'JsPlatform/Extensions/yarn32.png'
			)
			.getCodeExtraInformation()
			.setFunctionName('gdjs.dialogueTree.cippedTextScrollingHasCompleted');

		return extension;
	},
	runExtensionSanityTests: function(gd, extension) {
		return [];
	},
};
