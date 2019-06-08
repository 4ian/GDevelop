/**
 * @memberof gdjs
 * @class dialoguetree
 * @static
 * @private
 */

gdjs.dialoguetree = {};

gdjs.dialoguetree.runner = new bondage.Runner();
/**
 * Save a screenshot of the game.
 * @param {string} savepath The path where to save the screenshot
 */
gdjs.dialoguetree.load = function(runtimeScene, sceneVar, startDialogueNode) {
	this.runner = gdjs.dialoguetree.runner; //TODO needs to be initiated globally once, outside of any methods
	this.yarnData = JSON.parse(sceneVar.getAsString());
	this.runner.load(this.yarnData);

	if (startDialogueNode) {
		this.dialogueIsRunning = true;
		this.dialogue = this.runner.run(startDialogueNode);
		gdjs.dialoguetree.advanceDialogue();
	}
};

gdjs.dialoguetree.isDialogueRunning = function() {
	return this.dialogueIsRunning;
};

gdjs.dialoguetree.getDialogueLineText = function() {
	return this.dialogueData.text
		? this.dialogueData.text
		: this.dialogueData.options
		? this.dialogueData.options.join(' - ')
		: '';
};

gdjs.dialoguetree.dialogueLineOptions = function() {
	return this.dialogueData.options;
};

gdjs.dialoguetree.dialogueLineOptionsCount = function() {
	return this.dialogueData.options.length;
};

gdjs.dialoguetree.dialogueLineTypeIsText = function() {
	return this.dialogueData instanceof bondage.TextResult;
};
gdjs.dialoguetree.dialogueLineTypeIsOptions = function() {
	return this.dialogueData instanceof bondage.OptionsResult;
};
gdjs.dialoguetree.dialogueLineTypeIsCommand = function() {
	return this.dialogueData instanceof bondage.CommandResult;
};

gdjs.dialoguetree.advanceDialogue = function() {
	this.dialogueData = this.dialogue.next().value;
	console.log(this.dialogueData);
	if (gdjs.dialoguetree.dialogueLineTypeIsText()) {
		this.dialogueDataType = 'text';
	} else if (gdjs.dialoguetree.dialogueLineTypeIsOptions()) {
		this.dialogueDataType = 'options';
	} else if (gdjs.dialoguetree.dialogueLineTypeIsCommand()) {
		this.dialogueDataType = 'command';
	} else {
		this.dialogueDataType = 'unknown';
	}
	if (!this.dialogueData) this.dialogueIsRunning = false;
};

gdjs.dialoguetree.getDialogueLineType = function() {
	return this.dialogueDataType;
};

//check if it has a tag
// get tags (tags.tag)

//get title(expr)

// check if it was visited before (how many times?)
