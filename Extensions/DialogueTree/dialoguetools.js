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
	this.NextDialogueData = null;
	this.dialogueData = null;
	this.lastCommand = null;
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
		? this.dialogueText
		: this.dialogueData.options
		? this.dialogueData.options.join(' - ')
		: '';
};

gdjs.dialoguetree.getClippedLineText = function() {
	return this.dialogueText.length ? this.dialogueText.substring(0, this.clipTextEnd) : '';
};

gdjs.dialoguetree.scrollCippedText = function() {
	if (this.dialogueIsRunning && this.dialogueText) {
		this.clipTextEnd += 1;
	}
	if (gdjs.dialoguetree.cippedTextScrollingHasCompleted() && this.NextDialogueData instanceof bondage.CommandResult) {
		this.lastCommand = this.NextDialogueData.text;
		this.lastDataType = 'command';
		this.NextDialogueData = null;

		gdjs.dialoguetree.advanceDialogue();
	}
};

gdjs.dialoguetree.commandIsCalled = function(command) {
	if (this.lastCommand) {
		console.info('Dialogue tree cmd passed:', this.lastCommand);
		if (this.lastCommand === command) {
			console.info('Dialogue tree cmd picked by GD:', this.lastCommand);
			this.lastCommand = null;
			return true;
		}
		this.lastCommand = null;
	}
	return false;
};

gdjs.dialoguetree.cippedTextScrollingHasCompleted = function() {
	//use this to force the game to wait for the text to complete before next line
	if (this.dialogueData && this.dialogueText.length) {
		// console.log('completed:', this.clipTextEnd, this.dialogueText.length);
		return this.clipTextEnd >= this.dialogueText.length;
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

gdjs.dialoguetree.compareDialogueLineType = function(type) {
	if (gdjs.dialoguetree.lineTypeIsText() && type === 'text') return true;
	if (gdjs.dialoguetree.lineTypeIsOptions() && type === 'options') return true;
	if (gdjs.dialoguetree.lineTypeIsCommand() && type === 'command') return true;
	return false;
};

gdjs.dialoguetree.lineTypeIsText = function() {
	return this.dialogueData instanceof bondage.TextResult;
};
gdjs.dialoguetree.lineTypeIsOptions = function() {
	return this.dialogueData instanceof bondage.OptionsResult;
};
gdjs.dialoguetree.lineTypeIsCommand = function() {
	// commands get passed to the engine and skipped automatically from any mandatory input, so we need to pick them from next state instead
	return this.NextDialogueData instanceof bondage.CommandResult;
};

gdjs.dialoguetree.advanceDialogue = function() {
	// We need both this.dialogueData and this.NextDialogueData in order to handle command calls differently from text/options
	// That way we know what dialoguedata we are on, but also what is the one comming up next or was  last.
	// setting NextDialogueData to null forces dialogueData to use next().value in the next cycle instead of NextDialogueData
	this.dialogueData = this.NextDialogueData ? this.NextDialogueData : this.dialogue.next().value;
	this.optionsCount = 0;
	this.selectOption = -1;
	this.selectedOptionUpdated = false;

	// console.log(this.runner);
	// console.log(this.dialogue);
	if (gdjs.dialoguetree.lineTypeIsText()) {
		// console.log('last type was:', this.lastDataType);
		this.dialogueBranchTags = this.dialogueData.data.tags;
		this.dialogueBranchTitle = this.dialogueData.data.title;
		this.dialogueBranchBody = this.dialogueData.data.body;
		if (this.lastDataType === 'command') {
			this.dialogueText += this.dialogueData.text;
		} else {
			this.dialogueText = this.dialogueData.text;
			this.clipTextEnd = 0;
		}
		this.lastDataType = 'text';
		this.NextDialogueData = this.dialogue.next().value;
	} else if (gdjs.dialoguetree.lineTypeIsOptions()) {
		this.optionsCount = this.dialogueData.options.length;
		this.options = this.dialogueData.options;
		this.selectedOptionUpdated = true;
		this.NextDialogueData = null;
		this.lastDataType = 'options';
	} else if (gdjs.dialoguetree.lineTypeIsCommand()) {
		this.lastDataType = 'command';
		this.lastCommand = this.dialogueData.text;
		this.NextDialogueData = null;
		gdjs.dialoguetree.advanceDialogue();
	} else {
		this.lastDataType = 'unknown';
	}
	if (!this.dialogueData) this.dialogueIsRunning = false;
};

gdjs.dialoguetree.getLineType = function() {
	return this.lastDataType;
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
