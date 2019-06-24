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
	this.runner = gdjs.dialoguetree.runner;
	this.yarnData = JSON.parse(sceneVar.getAsString());
	this.runner.load(this.yarnData);

	if (startDialogueNode && startDialogueNode.length > 0) {
		gdjs.dialoguetree.startFrom(startDialogueNode);
	}
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
	if (this.pauseScrolling) return;

	if (this.dialogueText) {
		this.clipTextEnd += 1;
	}
};

gdjs.dialoguetree.commandIsCalled = function(command) {
	var commandCalls = gdjs.dialoguetree.commandCalls;
	var clipTextEnd = gdjs.dialoguetree.clipTextEnd;

	return this.commandCalls.some(function(call, index) {
		if (clipTextEnd >= call.time && call.cmd === command) {
			commandCalls.splice(index, 1);
			return true;
		}
		if (clipTextEnd >= call.time && call.cmd === 'wait') {
			commandCalls.splice(index, 1);
			setTimeout(function() {
				gdjs.dialoguetree.pauseScrolling = false;
			}, parseInt(call.param));
			gdjs.dialoguetree.pauseScrolling = true;
			return false;
		}
	});
	return false;
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
		this.dialogueData = this.dialogue.next().value;
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
	return this.dialogueDataType === type;
};

gdjs.dialoguetree.startFrom = function(startDialogueNode) {
	this.optionsCount = 0;

	this.options = [];
	this.dialogueIsRunning = true;
	this.dialogueBranchTitle = '';
	this.dialogueBranchBody = '';
	this.dialogueBranchTags = [];
	this.dialogue = this.runner.run(startDialogueNode);
	this.dialogueData = null;
	this.commandCalls = [];
	this.runCommands = false;
	this.pauseScrolling = false;
	this.dialogueData = this.dialogue.next().value;
	gdjs.dialoguetree.advanceDialogue();
};

gdjs.dialoguetree.lineTypeIsText = function() {
	return this.dialogueData instanceof bondage.TextResult;
};
gdjs.dialoguetree.lineTypeIsOptions = function() {
	return this.dialogueData instanceof bondage.OptionsResult;
};
gdjs.dialoguetree.lineTypeIsCommand = function() {
	//TODO: needs REFACTOR
	return this.dialogueData instanceof bondage.CommandResult || !isNaN(this.commandCalls[this.clipTextEnd]);
};

gdjs.dialoguetree.cippedTextScrollingHasCompleted = function() {
	if (this.dialogueData && this.dialogueText.length) {
		return this.clipTextEnd >= this.dialogueText.length;
	}
	return false;
};

/// Can be called only when scrolling is completed
gdjs.dialoguetree.advanceDialogue = function() {
	this.optionsCount = 0;
	this.selectOption = -1;
	this.selectedOptionUpdated = false;

	if (gdjs.dialoguetree.lineTypeIsText()) {
		if (this.dialogueDataType === 'options' || this.dialogueDataType === 'text' || !this.dialogueDataType) {
			this.clipTextEnd = 0;
			this.dialogueText = this.dialogueData.text;
		} else {
			this.dialogueText += this.dialogueData.text;
		}

		this.dialogueDataType = 'text';
		this.dialogueBranchTags = this.dialogueData.data.tags;
		this.dialogueBranchTitle = this.dialogueData.data.title;
		this.dialogueBranchBody = this.dialogueData.data.body;
		this.dialogueData = this.dialogue.next().value;
	} else if (gdjs.dialoguetree.lineTypeIsOptions()) {
		this.dialogueDataType = 'options';
		this.optionsCount = this.dialogueData.options.length;
		this.options = this.dialogueData.options;
		this.selectedOptionUpdated = true;
	} else if (gdjs.dialoguetree.lineTypeIsCommand()) {
		this.dialogueDataType = 'command';
		var command = this.dialogueData.text.split(' ');
		this.commandCalls.push({
			cmd: command[0],
			param: command[1],
			time: this.dialogueText.length,
		});
		this.dialogueData = this.dialogue.next().value;
		gdjs.dialoguetree.advanceDialogue();
	} else {
		this.dialogueDataType = 'unknown';
	}

	/// Skip asking for input if command
	if (gdjs.dialoguetree.lineTypeIsCommand()) {
		this.dialogueDataType = 'command';
		gdjs.dialoguetree.advanceDialogue();
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
	return Object.keys(this.runner.visited).includes(title) && this.runner.visited[title];
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
