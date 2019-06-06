/**
 * @memberof gdjs
 * @class dialoguetree
 * @static
 * @private
 */

gdjs.dialoguetree = {};

/**
 * Save a screenshot of the game.
 * @param {string} savepath The path where to save the screenshot
 */
gdjs.dialoguetree.load = function(runtimeScene, jsonString) {
	const electron = runtimeScene
		.getGame()
		.getRenderer()
		.getElectron();

	console.log(bondage, jsonString);

	if (electron) {
		const fileSystem = electron.remote.require('fs');
		const canvas = runtimeScene
			.getGame()
			.getRenderer()
			.getCanvas();

		if (canvas) {
			const content = canvas.toDataURL('image/png').replace('data:image/png;base64,', '');
			if (jsonString.toLowerCase().indexOf('.png') == -1) jsonString += '.png';

			fileSystem.writeFile(jsonString, content, 'base64', err => {
				if (err) {
					console.error('Unable to save the screenshot at path: ' + jsonString);
				}
			});
		} else {
			console.error('Screenshot are not supported on rendering engines without canvas.');
		}
	}
};
