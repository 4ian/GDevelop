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
				'LoadDialogueFromVariable',
				_('LoadDialogue'),
				_('Load a dialogue data object - Yarn json format, storedin a scene variable'),
				_('Load Dialogue data from scene variable: _PARAM1_ and start from _PARAM2_'),
				_('Dialogue Tree'),
				'JsPlatform/Extensions/yarn24.png',
				'JsPlatform/Extensions/yarn32.png'
			)
			.addCodeOnlyParameter('currentScene', '')
			.addParameter('scenevar', _('Scene variable that holds the Yarn Json data'))
			.addParameter('string', _('Dialogue node'))
			.getCodeExtraInformation()
			.setIncludeFile('Extensions/DialogueTree/dialoguetools.js')
			.addIncludeFile('Extensions/DialogueTree/bondage.min.js')
			.setFunctionName('gdjs.dialoguetree.load');

		extension
			.addAction(
				'AdvanceToNextDialogueLine',
				_('Advance to the Next Dialogue Line'),
				_('Advance to the Next dialogue line'),
				_('Advance to the Next Dialogue Line'),
				_('Dialogue Tree'),
				'JsPlatform/Extensions/yarn24.png',
				'JsPlatform/Extensions/yarn32.png'
			)
			.addCodeOnlyParameter('currentScene', '')
			.getCodeExtraInformation()
			.setFunctionName('gdjs.dialoguetree.advanceDialogue');

		extension
			.addStrExpression(
				'GetDialogueLineText',
				_('Get the current dialogue line text'),
				_('This returns the current dialogue line text'),
				_('Dialogue Tree'),
				'JsPlatform/Extensions/yarn24.png',
				'JsPlatform/Extensions/yarn32.png'
			)
			.getCodeExtraInformation()
			.setFunctionName('gdjs.dialoguetree.getDialogueLineText');

		extension
			.addStrExpression(
				'GetDialogueLineType',
				_('Get the current dialogue line type as a text'),
				_('This returns the current dialogue line text'),
				_('Dialogue Tree'),
				'JsPlatform/Extensions/yarn24.png',
				'JsPlatform/Extensions/yarn32.png'
			)
			.getCodeExtraInformation()
			.setFunctionName('gdjs.dialoguetree.getDialogueLineType');

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
			.setFunctionName('gdjs.dialoguetree.dialogueLineTypeIsText');

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
			.setFunctionName('gdjs.dialoguetree.dialogueLineTypeIsCommand');

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
			.setFunctionName('gdjs.dialoguetree.dialogueLineTypeIsOptions');

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
			.setFunctionName('gdjs.dialoguetree.isDialogueRunning');
		//finally return it
		return extension;
	},
	runExtensionSanityTests: function(gd, extension) {
		return [];
	},
};
