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
			.setFunctionName('gdjs.dialoguetree.loadFromSceneVar');

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
			// .addCodeOnlyParameter('currentScene', '')
			.getCodeExtraInformation()
			.setFunctionName('gdjs.dialoguetree.advanceDialogue');

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
			// .addCodeOnlyParameter('currentScene', '')
			.getCodeExtraInformation()
			.setFunctionName('gdjs.dialoguetree.confirmSelectOption');

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
			// .addCodeOnlyParameter('currentScene', '')
			.getCodeExtraInformation()
			.setFunctionName('gdjs.dialoguetree.selectNextOption');

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
			// .addCodeOnlyParameter('currentScene', '')
			.getCodeExtraInformation()
			.setFunctionName('gdjs.dialoguetree.selectPreviousOption');

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
			// .addCodeOnlyParameter('currentScene', '')
			.addParameter('expression', _('Option index number'))
			.setDefaultValue('0')
			.getCodeExtraInformation()
			.setFunctionName('gdjs.dialoguetree.selectPreviousOption');

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
			.setFunctionName('gdjs.dialoguetree.getLineText');

		extension
			.addStrExpression(
				'GetLineType',
				_('Get the current dialogue line type as a text'),
				_('Get the current dialogue line type as a text'),
				_('Dialogue Tree'),
				'JsPlatform/Extensions/yarn24.png',
				'JsPlatform/Extensions/yarn32.png'
			)
			.getCodeExtraInformation()
			.setFunctionName('gdjs.dialoguetree.getLineType');

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
			.setFunctionName('gdjs.dialoguetree.lineOptionsCount');

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
			.setFunctionName('gdjs.dialoguetree.getLineOption');

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
			.setFunctionName('gdjs.dialoguetree.getSelectOption');

		extension
			.addCondition(
				'The Dialogue line is Text',
				_('The Dialogue line is Text'),
				_('The Dialogue line is Text'),
				_('The Dialogue line is TEXT'),
				_('Dialogue Tree'),
				'JsPlatform/Extensions/yarn24.png',
				'JsPlatform/Extensions/yarn32.png'
			)
			.getCodeExtraInformation()
			.setFunctionName('gdjs.dialoguetree.lineTypeIsText');

		extension
			.addCondition(
				'The Dialogue line is a Command',
				_('The Dialogue line is a Command'),
				_('The Dialogue line is a Command'),
				_('The Dialogue line is a << COMMAND >>'),
				_('Dialogue Tree'),
				'JsPlatform/Extensions/yarn24.png',
				'JsPlatform/Extensions/yarn32.png'
			)
			.getCodeExtraInformation()
			.setFunctionName('gdjs.dialoguetree.lineTypeIsCommand');

		extension
			.addCondition(
				'The Dialogue line is Options',
				_('The Dialogue line is Options'),
				_('The Dialogue line is Options'),
				_('The Dialogue line is [[ OPTIONS ]]'),
				_('Dialogue Tree'),
				'JsPlatform/Extensions/yarn24.png',
				'JsPlatform/Extensions/yarn32.png'
			)
			.getCodeExtraInformation()
			.setFunctionName('gdjs.dialoguetree.lineTypeIsOptions');

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
			.setFunctionName('gdjs.dialoguetree.isRunning');

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
			.setFunctionName('gdjs.dialoguetree.selectedOptionHasUpdated');
		//finally return it
		return extension;
	},
	runExtensionSanityTests: function(gd, extension) {
		return [];
	},
};
