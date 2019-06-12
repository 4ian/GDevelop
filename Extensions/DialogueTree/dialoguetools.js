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
gdjs.dialoguetree.loadFromSceneVar = function(runtimeScene, sceneVar, startDialogueNode) {
	this.runner = gdjs.dialoguetree.runner; //TODO needs to be initiated globally once, outside of any methods
	this.yarnData = JSON.parse(sceneVar.getAsString());
	this.runner.load(this.yarnData);

	if (startDialogueNode) {
		gdjs.dialoguetree.startFrom(startDialogueNode);
	}
};

gdjs.dialoguetree.startFrom = function(startDialogueNode) {
	this.optionsCount = 0;
	this.options = [];
	this.dialogueIsRunning = true;
	this.dialogue = this.runner.run(startDialogueNode);
	gdjs.dialoguetree.advanceDialogue();
};

gdjs.dialoguetree.isRunning = function() {
	return this.dialogueIsRunning;
};

gdjs.dialoguetree.selectedOptionHasUpdated = function() {
	if (this.selectedOptionUpdated) {
		this.selectedOptionUpdated = false;
		if (this.selectOption === -1) this.selectOption = 0;
		return true;
	}
	return false;
};

gdjs.dialoguetree.getLineText = function() {
	return this.dialogueData.text
		? this.dialogueData.text
		: this.dialogueData.options
		? this.dialogueData.options.join(' - ')
		: '';
};

gdjs.dialoguetree.getClippedLineText = function() {
	// use this to render the text
	return this.dialogueData.text ? this.dialogueData.text.substring(0, this.clipTextEnd) : '';
};

gdjs.dialoguetree.scrollCippedText = function() {
	// call action every x miliseconds- hold button makes it faster
	if (this.dialogueIsRunning && this.dialogueData.text) {
		this.clipTextEnd += 1;
	}
};

gdjs.dialoguetree.cippedTextScrollingHasCompleted = function() {
	//use this to force the game to wait for the text to complete before next line
	if (this.dialogueData && this.dialogueData.text) {
		return this.clipTextEnd >= this.dialogueData.text.length;
	}
};

gdjs.dialoguetree._normalizedOptionIndex = function(optionIndex) {
	if (optionIndex >= this.options.length) optionIndex = this.options.length - 1;
	if (optionIndex < 0) optionIndex = 0;
	return optionIndex;
};

gdjs.dialoguetree._cycledOptionIndex = function(optionIndex) {
	if (optionIndex >= this.options.length) optionIndex = 0;
	if (optionIndex < 0) optionIndex = this.options.length - 1;
	return optionIndex;
};

gdjs.dialoguetree.getLineOption = function(optionIndex) {
	if (!this.options.length) return [];
	optionIndex = gdjs.dialoguetree._normalizedOptionIndex(optionIndex);
	return this.options[optionIndex];
};

gdjs.dialoguetree.lineOptionsCount = function() {
	if (this.options.length) {
		return this.optionsCount;
	}
};

gdjs.dialoguetree.confirmSelectOption = function() {
	if (this.dialogueData.select && !this.selectedOptionUpdated && this.selectOption !== -1) {
		this.dialogueData.select(this.selectOption);
		gdjs.dialoguetree.advanceDialogue();
	}
};

gdjs.dialoguetree.selectNextOption = function() {
	if (this.dialogueData.select) {
		this.selectOption += 1;
		this.selectOption = gdjs.dialoguetree._cycledOptionIndex(this.selectOption);
		this.selectedOptionUpdated = true;
	}
};

gdjs.dialoguetree.selectPreviousOption = function() {
	if (this.dialogueData.select) {
		this.selectOption -= 1;
		this.selectOption = gdjs.dialoguetree._cycledOptionIndex(this.selectOption);
		this.selectedOptionUpdated = true;
	}
};

gdjs.dialoguetree.selectOption = function(optionIndex) {
	if (this.dialogueData.select) {
		this.selectOption = gdjs.dialoguetree._normalizedOptionIndex(this.selectOption);
		this.selectedOptionUpdated = true;
	}
};

gdjs.dialoguetree.getSelectOption = function() {
	if (this.dialogueData.select) {
		console.log(this.selectOption);
		return this.selectOption;
	}
};

gdjs.dialoguetree.lineTypeIsText = function() {
	return this.dialogueData instanceof bondage.TextResult;
};
gdjs.dialoguetree.lineTypeIsOptions = function() {
	return this.dialogueData instanceof bondage.OptionsResult;
};
gdjs.dialoguetree.lineTypeIsCommand = function() {
	return this.dialogueData instanceof bondage.CommandResult;
};

gdjs.dialoguetree.advanceDialogue = function() {
	this.dialogueData = this.dialogue.next().value;
	this.optionsCount = 0;
	this.selectOption = -1;
	this.selectedOptionUpdated = false;
	this.clipTextEnd = 0;

	if (gdjs.dialoguetree.lineTypeIsText()) {
		this.dialogueDataType = 'text';
	} else if (gdjs.dialoguetree.lineTypeIsOptions()) {
		this.dialogueDataType = 'options';
		this.optionsCount = this.dialogueData.options.length;
		this.options = this.dialogueData.options;
		this.selectedOptionUpdated = true;
	} else if (gdjs.dialoguetree.lineTypeIsCommand()) {
		this.dialogueDataType = 'command';
	} else {
		this.dialogueDataType = 'unknown';
	}
	if (!this.dialogueData) this.dialogueIsRunning = false;
};

gdjs.dialoguetree.getLineType = function() {
	return this.dialogueDataType;
};

//check if it has a tag
// get tags (tags.tag)

//get title(expr)

// has title been visited before, how many times has title been visited

// check if it was visited before (how many times?)

//Load/save visited, all variables -state

// todo load from node without reloading your yarn data - one yarn file can handle multiple NPC
