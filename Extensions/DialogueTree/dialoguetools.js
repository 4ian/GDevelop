/**
 * @memberof gdjs
 * @class dialogueTree
 * @static
 * @private
 */

gdjs.dialogueTree = {};
gdjs.dialogueTree.runner = new bondage.Runner();

/**
 * Load the Dialogue Tree data of the game.
 * @param {string} sceneVar The path where to save the screenshot
 */
gdjs.dialogueTree.loadFromSceneVar = function(runtimeScene, sceneVar, startDialogueNode) {
	this.runner = gdjs.dialogueTree.runner;
	this.yarnData = JSON.parse(sceneVar.getAsString());
	this.runner.load(this.yarnData);

	if (startDialogueNode && startDialogueNode.length > 0) {
		gdjs.dialogueTree.startFrom(startDialogueNode);
	}
};

gdjs.dialogueTree.isRunning = function() {
	return this.dialogueIsRunning;
};

gdjs.dialogueTree.selectedOptionHasUpdated = function() {
	if (this.selectedOptionUpdated) {
		this.selectedOptionUpdated = false;
		if (this.selectOption === -1) this.selectOption = 0;
		return true;
	}
	return false;
};

gdjs.dialogueTree.getLineText = function() {
	return this.dialogueData.text
		? this.dialogueText
		: this.dialogueData.options
		? this.dialogueData.options.join(' - ')
		: '';
};

gdjs.dialogueTree.getClippedLineText = function() {
	return this.dialogueText.length ? this.dialogueText.substring(0, this.clipTextEnd) : '';
};

gdjs.dialogueTree.scrollCippedText = function() {
	if (this.pauseScrolling) return;

	if (this.dialogueText) {
		this.clipTextEnd += 1;
	}
};

gdjs.dialogueTree.commandParametersCount = function() {
	if (this.cmdParams && this.cmdParams.length > 1) {
		return this.cmdParams.length - 1;
	}
	return 0;
};

gdjs.dialogueTree.getCommandParameter = function(paramIndex) {
	if (this.cmdParams && this.cmdParams.length >= paramIndex + 1) {
		var returnedParam = this.cmdParams[paramIndex + 1];
		return returnedParam ? returnedParam : '';
	}
	return '';
};

gdjs.dialogueTree.commandIsCalled = function(command) {
	if (this.pauseScrolling) return;
	var { commandCalls, clipTextEnd } = gdjs.dialogueTree;

	return this.commandCalls.some(function(call, index) {
		if (clipTextEnd < call.time) return false;
		if (call.cmd === 'wait') {
			gdjs.dialogueTree.pauseScrolling = true;
			setTimeout(function() {
				gdjs.dialogueTree.pauseScrolling = false;
				commandCalls.splice(index, 1);
			}, parseInt(call.params[1]));
		}
		if (call.cmd === command) {
			gdjs.dialogueTree.cmdParams = [...call.params];
			commandCalls.splice(index, 1);
			return true;
		}
	});
	return false;
};

gdjs.dialogueTree._normalizedOptionIndex = function(optionIndex) {
	if (optionIndex >= this.options.length) optionIndex = this.options.length - 1;
	if (optionIndex < 0) optionIndex = 0;
	return optionIndex;
};

gdjs.dialogueTree._cycledOptionIndex = function(optionIndex) {
	if (optionIndex >= this.options.length) optionIndex = 0;
	if (optionIndex < 0) optionIndex = this.options.length - 1;
	return optionIndex;
};

gdjs.dialogueTree.getLineOption = function(optionIndex) {
	if (!this.options.length) return [];
	optionIndex = gdjs.dialogueTree._normalizedOptionIndex(optionIndex);
	return this.options[optionIndex];
};

gdjs.dialogueTree.lineOptionsCount = function() {
	if (this.options.length) {
		return this.optionsCount;
	}
};

gdjs.dialogueTree.confirmSelectOption = function() {
	if (this.dialogueData.select && !this.selectedOptionUpdated && this.selectOption !== -1) {
		this.commandCalls = [];
		this.dialogueData.select(this.selectOption);
		this.dialogueData = this.dialogue.next().value;
		gdjs.dialogueTree.advanceDialogue();
	}
};

gdjs.dialogueTree.selectNextOption = function() {
	if (this.dialogueData.select) {
		this.selectOption += 1;
		this.selectOption = gdjs.dialogueTree._cycledOptionIndex(this.selectOption);
		this.selectedOptionUpdated = true;
	}
};

gdjs.dialogueTree.selectPreviousOption = function() {
	if (this.dialogueData.select) {
		this.selectOption -= 1;
		this.selectOption = gdjs.dialogueTree._cycledOptionIndex(this.selectOption);
		this.selectedOptionUpdated = true;
	}
};

gdjs.dialogueTree.selectOption = function(optionIndex) {
	if (this.dialogueData.select) {
		this.selectOption = gdjs.dialogueTree._normalizedOptionIndex(this.selectOption);
		this.selectedOptionUpdated = true;
	}
};

gdjs.dialogueTree.getSelectOption = function() {
	if (this.dialogueData.select) {
		return this.selectOption;
	}
};

gdjs.dialogueTree.compareDialogueLineType = function(type) {
	if (
		this.commandCalls.length &&
		this.commandCalls.some(function(call) {
			return gdjs.dialogueTree.clipTextEnd > call.time;
		})
	) {
		return true;
	}
	return this.dialogueIsRunning ? this.dialogueDataType === type : false;
};

gdjs.dialogueTree.startFrom = function(startDialogueNode) {
	this.optionsCount = 0;
	this.options = [];
	this.dialogueIsRunning = true;
	this.dialogueBranchTitle = '';
	this.dialogueBranchBody = '';
	this.dialogueBranchTags = [];
	this.dialogue = this.runner.run(startDialogueNode);
	this.dialogueData = null;
	this.dialogueDataType = '';
	this.commandCalls = [];
	this.cmdParams = [];
	this.pauseScrolling = false;
	this.dialogueData = this.dialogue.next().value;
	gdjs.dialogueTree.advanceDialogue();
};

gdjs.dialogueTree._lineTypeIsText = function() {
	return this.dialogueData instanceof bondage.TextResult;
};
gdjs.dialogueTree._lineTypeIsOptions = function() {
	return this.dialogueData instanceof bondage.OptionsResult;
};
gdjs.dialogueTree._lineTypeIsCommand = function() {
	return this.dialogueData instanceof bondage.CommandResult;
};

gdjs.dialogueTree.cippedTextScrollingHasCompleted = function() {
	if (this.dialogueData && this.dialogueText.length) {
		return this.clipTextEnd >= this.dialogueText.length;
	}
	return false;
};

/// Can be called only when scrolling is completed
gdjs.dialogueTree.advanceDialogue = function() {
	this.optionsCount = 0;
	this.selectOption = -1;
	this.selectedOptionUpdated = false;

	if (gdjs.dialogueTree._lineTypeIsText()) {
		if (this.dialogueDataType === 'options' || this.dialogueDataType === 'text' || !this.dialogueDataType) {
			this.clipTextEnd = 0;
			this.dialogueText = this.dialogueData.text;
			this.commandCalls = [];
		} else {
			this.dialogueText += this.dialogueData.text;
		}

		this.dialogueDataType = 'text';
		this.dialogueBranchTags = this.dialogueData.data.tags;
		this.dialogueBranchTitle = this.dialogueData.data.title;
		this.dialogueBranchBody = this.dialogueData.data.body;
		this.dialogueData = this.dialogue.next().value;
	} else if (gdjs.dialogueTree._lineTypeIsOptions()) {
		this.dialogueDataType = 'options';
		this.optionsCount = this.dialogueData.options.length;
		this.options = this.dialogueData.options;
		this.selectedOptionUpdated = true;
	} else if (gdjs.dialogueTree._lineTypeIsCommand()) {
		this.dialogueDataType = 'command';

		var command = this.dialogueData.text.split(' ');
		//if last command was to wait, increase time by one
		var offsetTime = this.commandCalls.length && this.commandCalls[this.commandCalls.length - 1].cmd === 'wait' ? 1 : 0;
		this.commandCalls.push({
			cmd: command[0],
			params: command,
			time: this.dialogueText.length + offsetTime,
		});
		this.dialogueData = this.dialogue.next().value;
		gdjs.dialogueTree.advanceDialogue();
	} else {
		this.dialogueDataType = 'unknown';
	}

	if (gdjs.dialogueTree._lineTypeIsCommand()) {
		this.dialogueDataType = 'command';
		gdjs.dialogueTree.advanceDialogue();
	}

	// dialogue has finished
	if (!this.dialogueData) {
		this.dialogueIsRunning = false;
	}
};

gdjs.dialogueTree.getLineType = function() {
	return this.lastDataType;
};

gdjs.dialogueTree.getBranchTitle = function() {
	if (this.dialogueIsRunning) {
		return this.dialogueBranchTitle;
	}
	return '';
};

gdjs.dialogueTree.branchTitleIs = function(title) {
	if (this.dialogueIsRunning) {
		return this.dialogueBranchTitle === title;
	}
	return false;
};

gdjs.dialogueTree.getBranchTags = function() {
	if (this.dialogueIsRunning) {
		return this.dialogueBranchTags.join(',');
	}
	return '';
};

gdjs.dialogueTree.getBranchTag = function(index) {
	if (this.dialogueIsRunning) {
		if (index > this.dialogueBranchTags.length - 1) index = this.dialogueBranchTags.length - 1;
		return this.dialogueBranchTags[index];
	}
	return '';
};

gdjs.dialogueTree.branchContainsTag = function(tag) {
	if (this.dialogueIsRunning) {
		return this.dialogueBranchTags.includes(tag);
	}
	return false;
};

gdjs.dialogueTree.getVisitedBranchTitles = function() {
	return Object.keys(this.runner.visited).join(',');
};

gdjs.dialogueTree.branchTitleHasBeenVisited = function(title) {
	return Object.keys(this.runner.visited).includes(title) && this.runner.visited[title];
};

gdjs.dialogueTree.getBranchText = function() {
	if (this.dialogueIsRunning) {
		return this.dialogueBranchBody;
	}
	return '';
};

gdjs.dialogueTree.getBranchText = function() {
	if (this.dialogueIsRunning) {
		return this.dialogueBranchBody;
	}
	return '';
};

gdjs.dialogueTree.getVariable = function(key) {
	if (key in this.runner.variables.data) {
		return this.runner.variables.data[key];
	}
	return '';
};

gdjs.dialogueTree.compareVariable = function(key, value) {
	if (key in this.runner.variables.data) {
		return this.runner.variables.data[key].toString() === value;
	}
	return false;
};

gdjs.dialogueTree.saveState = function(storeVar) {
	const dialogueState = {
		variables: gdjs.dialogueTree.runner.variables.data,
		visited: gdjs.dialogueTree.runner.visited,
	};
	gdjs.evtTools.network._objectToVariable(dialogueState, storeVar);
};

gdjs.dialogueTree.loadState = function(storeVar) {
	const jsonData = gdjs.evtTools.network.variableStructureToJSON(storeVar);
	const loadedState = JSON.parse(gdjs.evtTools.network.variableStructureToJSON(storeVar));
	gdjs.dialogueTree.runner.visited = loadedState.visited;
	gdjs.dialogueTree.runner.variables.data = loadedState.variables;
};

gdjs.dialogueTree.setVariable = function(key, value) {
	if (this.runner.variables.data) {
		this.runner.variables.data[key] = value;
	}
};
