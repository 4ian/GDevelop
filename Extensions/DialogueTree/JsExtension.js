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
			.setExtensionHelpPath('/all-features/screenshot');

		extension
			.addAction(
				'LoadDialogue',
				_('LoadDialogue'),
				_('Load a dialogue data object - Yarn json format'),
				_('Load dialogue data from json string: _PARAM1_'),
				_('Dialogue'),
				'JsPlatform/Extensions/take_screenshot24.png',
				'JsPlatform/Extensions/take_screenshot32.png'
			)
			.addCodeOnlyParameter('currentScene', '')
			.addParameter('string', _('Json string'), '', false)
			.getCodeExtraInformation()
			.setIncludeFile('Extensions/DialogueTree/dialoguetools.js')
			.addIncludeFile('Extensions/DialogueTree/bondage.min.js')
			.setFunctionName('gdjs.dialoguetree.load');

		return extension;
	},
	runExtensionSanityTests: function(gd, extension) {
		return [];
	},
};
