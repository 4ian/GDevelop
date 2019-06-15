/**
 * @memberof gdjs
 * @class dialoguetree
 * @static
 * @private
 */

gdjs.dialoguetree = {};
gdjs.dialoguetree.runner = new bondage.Runner();

/**
 * Load the Dialogue Tree data of the game.
 * @param {string} sceneVar The path where to save the screenshot
 */
gdjs.dialoguetree.loadFromSceneVar = function(runtimeScene, sceneVar, startDialogueNode) {
	this.runner = gdjs.dialoguetree.runner; //TODO needs to be initiated globally once, outside of any methods
	this.yarnData = JSON.parse(sceneVar.getAsString());
	this.runner.load(this.yarnData);

	if (startDialogueNode && startDialogueNode.length > 0) {
		gdjs.dialoguetree.startFrom(startDialogueNode);
	}
};

gdjs.dialoguetree.startFrom = function(startDialogueNode) {
	this.optionsCount = 0;
	this.options = [];
	this.dialogueIsRunning = true;
	this.dialogueBranchTitle = '';
	this.dialogueBranchBody = '';
	this.dialogueBranchTags = [];
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

	console.log(this.runner);
	console.log(this.dialogue);
	if (gdjs.dialoguetree.lineTypeIsText()) {
		this.dialogueDataType = 'text';
		this.dialogueBranchTags = this.dialogueData.data.tags;
		this.dialogueBranchTitle = this.dialogueData.data.title;
		this.dialogueBranchBody = this.dialogueData.data.body;
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

gdjs.dialoguetree.getBranchTitle = function() {
	if (this.dialogueIsRunning) {
		return this.dialogueBranchTitle;
	}
	return '';
};

gdjs.dialoguetree.branchTitleIs = function(title) {
	if (this.dialogueIsRunning) {
		return this.dialogueBranchTitle === title;
	}
	return false;
};

gdjs.dialoguetree.getBranchTags = function() {
	if (this.dialogueIsRunning) {
		return this.dialogueBranchTags.join(',');
	}
	return '';
};

gdjs.dialoguetree.getBranchTag = function(index) {
	if (this.dialogueIsRunning) {
		if (index > this.dialogueBranchTags.length - 1) index = this.dialogueBranchTags.length - 1;
		return this.dialogueBranchTags[index];
	}
	return '';
};

gdjs.dialoguetree.branchContainsTag = function(tag) {
	if (this.dialogueIsRunning) {
		return this.dialogueBranchTags.includes(tag);
	}
	return false;
};

gdjs.dialoguetree.getVisitedBranchTitles = function() {
	return Object.keys(this.runner.visited).join(',');
};

gdjs.dialoguetree.branchTitleHasBeenVisited = function(title) {
	return Object.keys(this.runner.visited).includes(title);
};

gdjs.dialoguetree.getBranchText = function() {
	if (this.dialogueIsRunning) {
		return this.dialogueBranchBody;
	}
	return '';
};

gdjs.dialoguetree.getBranchText = function() {
	if (this.dialogueIsRunning) {
		return this.dialogueBranchBody;
	}
	return '';
};

gdjs.dialoguetree.getVariable = function(key) {
	if (key in this.runner.variables.data) {
		return this.runner.variables.data[key];
	}
	return '';
};

gdjs.dialoguetree.compareVariable = function(key, value) {
	if (key in this.runner.variables.data) {
		return this.runner.variables.data[key].toString() === value;
	}
	return false;
};

gdjs.dialoguetree.saveState = function(storeVar) {
	const dialogueState = {
		variables: gdjs.dialoguetree.runner.variables.data,
		visited: gdjs.dialoguetree.runner.visited,
	};
	gdjs.evtTools.network._objectToVariable(dialogueState, storeVar);
};

gdjs.dialoguetree.loadState = function(storeVar) {
	const jsonData = gdjs.evtTools.network.variableStructureToJSON(storeVar);
	const loadedState = JSON.parse(gdjs.evtTools.network.variableStructureToJSON(storeVar));
	gdjs.dialoguetree.runner.visited = loadedState.visited;
	gdjs.dialoguetree.runner.variables.data = loadedState.variables;
};

gdjs.dialoguetree.setVariable = function(key, value) {
	if (this.runner.variables.data) {
		this.runner.variables.data[key] = value;
	}
};
