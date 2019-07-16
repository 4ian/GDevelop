/**
 * @memberof gdjs
 * @class dialogueTree
 * @static
 * @private
 */

gdjs.dialogueTree = {};
gdjs.dialogueTree.runner = new bondage.Runner();

/**
 * Load the Dialogue Tree data of the game. Initialize The Dialogue Tree, so as it can be used in the game.
 * @param {gdjs.Variable} sceneVar The variable to load the Dialogue tree data from. The data is a JSON string, created by Yarn.
 * @param {string} startDialogueNode The Dialogue Branch to start the Dialogue Tree from. If left empty, the data will only be loaded, but can later be initialized via another action
 */
gdjs.dialogueTree.loadFromSceneVariable = function(
  sceneVar,
  startDialogueNode
) {
  this.runner = gdjs.dialogueTree.runner;

  try {
    this.yarnData = JSON.parse(sceneVar.getAsString());
    this.runner.load(this.yarnData);

    if (startDialogueNode && startDialogueNode.length > 0) {
      gdjs.dialogueTree.startFrom(startDialogueNode);
    }
  } catch (e) {
    console.error(e);
  }
};

/**
 * Load the Dialogue Tree data of the game. Initialize The Dialogue Tree, so as it can be used in the game.
 * @param {gdjs.RuntimeScene} runtimeScene The scene where the dialogue is running.
 * @param {gdjs.Variable} jsonResourceName The json fileresource to load the Dialogue tree data from. The data is a JSON string - created by Yarn.
 * @param {string} startDialogueNode The Dialogue Branch to start the Dialogue Tree from. If left empty, the data will only be loaded, but can later be initialized via another action
 */
gdjs.dialogueTree.loadFromJsonFile = function(
  runtimeScene,
  jsonResourceName,
  startDialogueNode
) {
  runtimeScene
    .getGame()
    .getJsonManager()
    .loadJson(jsonResourceName, function(error, content) {
      if (error) {
        console.error("An error happened:", error);
      } else {
        if (!content) return;
        gdjs.dialogueTree.yarnData = content;
        gdjs.dialogueTree.runner.load(gdjs.dialogueTree.yarnData);

        if (startDialogueNode && startDialogueNode.length > 0) {
          gdjs.dialogueTree.startFrom(startDialogueNode);
        }
      }
    });
};

/**
 * Check if the Dialogue Tree is currentlyu parsing data. You can do things like disabling player movement while talking on an npc
 */
gdjs.dialogueTree.isRunning = function() {
  return this.dialogueIsRunning;
};

/**
 * Scroll the clipped text. This can be combined with a timer and user input to control how fast dialogue line text is scrolling.
 */
gdjs.dialogueTree.scrollClippedText = function() {
  if (this.pauseScrolling || !this.dialogueIsRunning) return;

  if (this.dialogueText) {
    this.clipTextEnd += 1;
  }
};

/**
 * Check if text scrolling has completed and to prevent the user from skipping to next line before the current one has been printed fully.
 */
gdjs.dialogueTree.hasClippedScrollingCompleted = function() {
  if (this.dialogueData && this.dialogueText.length) {
    return this.clipTextEnd >= this.dialogueText.length;
  }
  return false;
};

/**
 * Get the current dialogue line with a scrolling effect (recommended)
 * Used with the scrollClippedText to achieve a classic scrolling text,as well as any <<wait>> effects to pause scrolling
 */
gdjs.dialogueTree.getClippedLineText = function() {
  return this.dialogueText.length
    ? this.dialogueText.substring(0, this.clipTextEnd)
    : "";
};

/**
 * Get the current complete dialogue line without using any scrolling effects.
 * Note that using this instead getClippedLineText will skip any <<wait>> commands entirely.
 */
gdjs.dialogueTree.getLineText = function() {
  this.clipTextEnd = this.dialogueText.length;
  return this.dialogueText.length ? this.dialogueText : "";
};

/**
 * Get the number of command parameters in a command with parameters that has been caught by a isCommandCalled condition
 */
gdjs.dialogueTree.commandParametersCount = function() {
  if (this.commandParameters && this.commandParameters.length > 1) {
    return this.commandParameters.length - 1;
  }
  return 0;
};

/**
 * Get a command parameter in any command with parameters that has been caugth by a isCommandCalled condition
 * @param {number} paramIndex The index of the parameter you want to get. If left empty, the expression will get the first parameter by default.
 */
gdjs.dialogueTree.getCommandParameter = function(paramIndex) {
  if (
    this.commandParameters &&
    this.commandParameters.length >= paramIndex + 1
  ) {
    var returnedParam = this.commandParameters[paramIndex + 1];
    return returnedParam ? returnedParam : "";
  }
  return "";
};

/**
 * Catch <<commands>> and <<commands with parameters>> from the current Dialogue Line.
 * You can trigger events in the event sheet that relate to the story you are telling throught the dialogue.
 * @param {string} command The command you want to check for being called. Write it without the <<>>
 */
gdjs.dialogueTree.isCommandCalled = function(command) {
  var { commandCalls, clipTextEnd, dialogueText } = gdjs.dialogueTree;

  if (this.pauseScrolling || !commandCalls) return false;
  return this.commandCalls.some(function(call, index) {
    if (clipTextEnd < call.time) return false;
    if (call.cmd === "wait" && clipTextEnd !== dialogueText.length) {
      gdjs.dialogueTree.pauseScrolling = true;
      setTimeout(function() {
        gdjs.dialogueTree.pauseScrolling = false;
        commandCalls.splice(index, 1);
      }, parseInt(call.params[1], 10));
    }
    if (call.cmd === command) {
      gdjs.dialogueTree.commandParameters = call.params;
      commandCalls.splice(index, 1);
      return true;
    }
  });
};

/**
 * Internal method to allow for capping option selection
 */
gdjs.dialogueTree._normalizedOptionIndex = function(optionIndex) {
  if (optionIndex >= this.options.length) optionIndex = this.options.length - 1;
  if (optionIndex < 0) optionIndex = 0;
  return optionIndex;
};

/**
 * Internal method to allow for cycling option selection
 */
gdjs.dialogueTree._cycledOptionIndex = function(optionIndex) {
  if (optionIndex >= this.options.length) optionIndex = 0;
  if (optionIndex < 0) optionIndex = this.options.length - 1;
  return optionIndex;
};

/**
 * Get the text of an option the player can select.
 * Used with getLineOptionsCount to render options for the player when a line of the Options type is parsed
 * @param {number} optionIndex The index of the option you want to get
 */
gdjs.dialogueTree.getLineOption = function(optionIndex) {
  if (!this.options.length) return [];
  optionIndex = gdjs.dialogueTree._normalizedOptionIndex(optionIndex);
  return this.options[optionIndex];
};

/**
 * Get the number of options that are presented to the player during the parsing of an Options type line
 */
gdjs.dialogueTree.getLineOptionsCount = function() {
  if (this.options.length) {
    return this.optionsCount;
  }
  return 0;
};

/**
 * Confirm the currently selected by the plyer option during Options type line parsing.
 * This will advance the dialogue tree to whichever dialogue branch was selected by the player
 */
gdjs.dialogueTree.confirmSelectOption = function() {
  if (
    this.dialogueData.select &&
    !this.selectedOptionUpdated &&
    this.selectedOption !== -1
  ) {
    this.commandCalls = [];
    this.dialogueData.select(this.selectedOption);
    this.dialogueData = this.dialogue.next().value;
    gdjs.dialogueTree.goToNextDialogueLine();
  }
};

/**
 * Select next option during Options type line parsing. Hook this to your game input
 */
gdjs.dialogueTree.selectNextOption = function() {
  if (this.dialogueData.select) {
    this.selectedOption += 1;
    this.selectedOption = gdjs.dialogueTree._cycledOptionIndex(
      this.selectedOption
    );
    this.selectedOptionUpdated = true;
  }
};

/**
 * Select previous option during Options type line parsing. Hook this to your game input
 */
gdjs.dialogueTree.selectPreviousOption = function() {
  if (this.dialogueData.select) {
    this.selectedOption -= 1;
    this.selectedOption = gdjs.dialogueTree._cycledOptionIndex(
      this.selectedOption
    );
    this.selectedOptionUpdated = true;
  }
};

/**
 * Select option by index during Options type line parsing.
 * @param {number} optionIndex The index of the option you want to select
 */
gdjs.dialogueTree.selectOption = function(optionIndex) {
  if (this.dialogueData.select) {
    this.selectedOption = gdjs.dialogueTree._normalizedOptionIndex(
      this.selectedOption
    );
    this.selectedOptionUpdated = true;
  }
};

/**
 * Get the currently selected option
 */
gdjs.dialogueTree.getSelectedOption = function() {
  if (this.dialogueData.select) {
    return this.selectedOption;
  }
  return 0;
};

/**
 * Check when the player has changed option selection.
 * Can be used to re-render your displayed dialogue options when needed.
 */
gdjs.dialogueTree.hasSelectedOptionChanged = function() {
  if (this.selectedOptionUpdated) {
    this.selectedOptionUpdated = false;
    if (this.selectedOption === -1) this.selectedOption = 0;
    return true;
  }
  return false;
};

/**
 * Check the type of the Dialogue Line that is being displayed to the player at the moment.
 * There are three types:
 * - text - regular dialogue text is being parsed at the moment
 * - options - the player has reached a branching choise moment where they must select one of multiple options
 * - command - a <<command>> was called in the background, that can be used to trigger game events, but will not be displayed in the dialogue box.
 * @param {string} type The type you want to check for ( one of the three above )
 */
gdjs.dialogueTree.isDialogueLineType = function(type) {
  if (
    this.commandCalls &&
    this.commandCalls.some(function(call) {
      return gdjs.dialogueTree.clipTextEnd > call.time;
    })
  ) {
    return true;
  }
  return this.dialogueIsRunning ? this.dialogueDataType === type : false;
};

/**
 * Check if a branch exists. It is also used internaly whenever you use the start from action.
 * @param {string} branchName The Dialogue Branch name you want to check.
 */
gdjs.dialogueTree.hasDialogueBranch = function(branchName) {
  return (
    this.runner &&
    this.runner.yarnNodes &&
    Object.keys(this.runner.yarnNodes).some(function(node) {
      return node === branchName;
    })
  );
};

/**
 * Start parsing dialogue from a specified Dialogue tree branch.
 * Can be used if you want to store multiple dialogues inside a single Dialogue tree data set.
 * @param {string} startDialogueNode The Dialogue Branch name you want to start parsing from.
 */
gdjs.dialogueTree.startFrom = function(startDialogueNode) {
  this.runner = gdjs.dialogueTree.runner;
  if (!this.hasDialogueBranch(startDialogueNode)) return;
  this.optionsCount = 0;
  this.options = [];
  this.dialogueBranchTitle = "";
  this.dialogueBranchBody = "";
  this.dialogueBranchTags = [];
  this.tagParameters = [];
  this.dialogue = this.runner.run(startDialogueNode);
  this.dialogueData = null;
  this.dialogueDataType = "";
  this.dialogueText = "";
  this.commandCalls = [];
  this.commandParameters = [];
  this.pauseScrolling = false;
  this.dialogueData = this.dialogue.next().value; //Breaks here if json resource is used
  this.dialogueIsRunning = true;
  gdjs.dialogueTree.goToNextDialogueLine();
};

/**
 * Internal methods to check the type of a Dialogue Line
 */
gdjs.dialogueTree._isLineTypeText = function() {
  return this.dialogueData instanceof bondage.TextResult;
};
gdjs.dialogueTree._isLineTypeOptions = function() {
  return this.dialogueData instanceof bondage.OptionsResult;
};
gdjs.dialogueTree._isLineTypeCommand = function() {
  return this.dialogueData instanceof bondage.CommandResult;
};

/**
 * This is the main lifecycle function.It runs once only when the user is advancing the dialogue to the next line.
 * Progress Dialogue to the next line. Hook it to your game input.
 * Note that this action can be influenced by any <<wait>> commands, but they work only if you have at least one isCommandCalled condition.
 */
gdjs.dialogueTree.goToNextDialogueLine = function() {
  if (this.pauseScrolling || !this.dialogueIsRunning) return;

  this.optionsCount = 0;
  this.selectedOption = -1;
  this.selectedOptionUpdated = false;

  if (gdjs.dialogueTree._isLineTypeText()) {
    if (
      this.dialogueDataType === "options" ||
      this.dialogueDataType === "text" ||
      !this.dialogueDataType
    ) {
      this.clipTextEnd = 0;
      this.dialogueText = this.dialogueData.text;
      this.commandCalls = [];
    } else {
      this.dialogueText += this.dialogueData.text;
    }

    this.dialogueDataType = "text";
    this.dialogueBranchTags = this.dialogueData.data.tags;
    this.dialogueBranchTitle = this.dialogueData.data.title;
    this.dialogueBranchBody = this.dialogueData.data.body;
    this.dialogueData = this.dialogue.next().value;
  } else if (gdjs.dialogueTree._isLineTypeOptions()) {
    this.dialogueDataType = "options";
    this.optionsCount = this.dialogueData.options.length;
    this.options = this.dialogueData.options;
    this.selectedOptionUpdated = true;
  } else if (gdjs.dialogueTree._isLineTypeCommand()) {
    this.dialogueDataType = "command";

    var command = this.dialogueData.text.split(" ");
    // if last command was to wait, increase time by one
    var offsetTime =
      this.commandCalls.length &&
      this.commandCalls[this.commandCalls.length - 1].cmd === "wait"
        ? 1
        : 0;
    this.commandCalls.push({
      cmd: command[0],
      params: command,
      time: this.dialogueText.length + offsetTime
    });
    this.dialogueData = this.dialogue.next().value;
    gdjs.dialogueTree.goToNextDialogueLine();
  } else {
    this.dialogueDataType = "unknown";
  }

  if (gdjs.dialogueTree._isLineTypeCommand()) {
    this.dialogueDataType = "command";
    gdjs.dialogueTree.goToNextDialogueLine();
  }

  // dialogue has finished
  if (!this.dialogueData) {
    this.dialogueIsRunning = false;
  }
};

/**
 * Get the current Dialogue Tree branch title
 */
gdjs.dialogueTree.getBranchTitle = function() {
  if (this.dialogueIsRunning) {
    return this.dialogueBranchTitle;
  }
  return "";
};

/**
 * Check if the currently parsed Dialogue branch title is a  query.
 * @param {string} title The Dialogue Branch name you want to check for.
 */
gdjs.dialogueTree.branchTitleIs = function(title) {
  if (this.dialogueIsRunning) {
    return this.dialogueBranchTitle === title;
  }
  return false;
};

/**
 * Get all the branch tags from the current Dialogue branch as a string. Useful for debugging.
 */
gdjs.dialogueTree.getBranchTags = function() {
  if (this.dialogueIsRunning) {
    return this.dialogueBranchTags.join(",");
  }
  return "";
};

/**
 * Get one of the current Dialogue branch tags via index.
 * @param {number} index The index of the Dialogue Branch tag you want to get.
 */
gdjs.dialogueTree.getBranchTag = function(index) {
  if (this.dialogueIsRunning) {
    if (index > this.dialogueBranchTags.length - 1)
      index = this.dialogueBranchTags.length - 1;
    return this.dialogueBranchTags[index];
  }
  return "";
};

/**
 * Check if the current Dialogue branch contains a specific tag.
 * @param {string} query The name of the Dialogue Branch tag you want to check.
 */
gdjs.dialogueTree.branchContainsTag = function(query) {
  this.tagParameters = [];
  if (this.dialogueIsRunning && this.dialogueBranchTags.length) {
    return this.dialogueBranchTags.some(function(tag) {
      var splitTag = tag.match(/([^\(]+)\(([^\)]+)\)/i);
      gdjs.dialogueTree.tagParameters = splitTag ? splitTag[2].split(",") : [];
      return splitTag ? splitTag[1] === query : tag === query;
    });
  }
  return false;
};

/**
 * Get any tag(parameter,anotherParameter) from a tag captured by the branchContainsTag Condition
 * @param {number} paramIndex The index of the tag parameter you want to get.
 * Leaving this empty will result in retrieving the first parameter.
 */
gdjs.dialogueTree.getTagParameter = function(paramIndex) {
  if (this.dialogueIsRunning && this.tagParameters.length >= paramIndex) {
    var returnedParam = this.tagParameters[paramIndex];
    return returnedParam ? returnedParam : "";
  }
  return "";
};

/**
 * Get a list of all the titles of visited by the player Branches. Useful for debugging.
 */
gdjs.dialogueTree.getVisitedBranchTitles = function() {
  if (this.dialogueIsRunning) {
    return Object.keys(this.runner.visited).join(",");
  }
  return "";
};

/**
 * Check if a player has visited a Dialogue Branch in the past.
 * @param {string} title The title of the branch to check for.
 * Leaving this empty will check if the current branch title has been visited in the past.
 */
gdjs.dialogueTree.branchTitleHasBeenVisited = function(title) {
  if (!title) title = this.dialogueBranchTitle;
  return (
    Object.keys(this.runner.visited).includes(title) &&
    this.runner.visited[title]
  );
};

/**
 * Get the entire unparsed text of the current Dialogue Branch
 */
gdjs.dialogueTree.getBranchText = function() {
  if (this.dialogueIsRunning) {
    return this.dialogueBranchBody;
  }
  return "";
};

/**
 * Get the value of a variable that was created by the Dialogue parses.
 * @param {string} key The name of the variable you want to get the value of
 */
gdjs.dialogueTree.getVariable = function(key) {
  if (this.dialogueIsRunning && key in this.runner.variables.data) {
    return this.runner.variables.data[key];
  }
  return "";
};

/**
 * Check if a specific variable created by the Dialogue parses exists and is equal to a specific value.
 * @param {string} key The name of the variable you want to check the value of
 * @param {string} value The value you want to check against
 */
gdjs.dialogueTree.compareVariable = function(key, value) {
  if (this.dialogueIsRunning && key in this.runner.variables.data) {
    return this.runner.variables.data[key].toString() === value;
  }
  return false;
};

/**
 * Set a specific variable created by the Dialogue parser to a specific value.
 * @param {string} key The name of the variable you want to set the value of
 * @param {string} value The value you want to set
 */
gdjs.dialogueTree.setVariable = function(key, value) {
  if (this.dialogueIsRunning && this.runner.variables.data) {
    this.runner.variables.data[key] = value;
  }
};

/**
 * Store the current State of the Dialogue Parser in a specified variable.
 * Can be used to implement persistence in dialogue through your game's Load/Save function.
 * That way you can later load all the dialogue choices the player has made.
 * @param {gdjs.Variable} storeVar The variable where to store the State
 */
gdjs.dialogueTree.saveState = function(storeVar) {
  const dialogueState = {
    variables: gdjs.dialogueTree.runner.variables.data,
    visited: gdjs.dialogueTree.runner.visited
  };
  gdjs.evtTools.network._objectToVariable(dialogueState, storeVar);
};

/**
 * Load the current State of the Dialogue Parser from a specified variable.
 * Can be used to implement persistence in dialogue through your game's Load/Save function.
 * That way you can later load all the dialogue choices the player has made.
 * @param {gdjs.Variable} storeVar The variable where to load the State from.
 */
gdjs.dialogueTree.loadState = function(storeVar) {
  const jsonData = gdjs.evtTools.network.variableStructureToJSON(storeVar);
  try {
    const loadedState = JSON.parse(
      gdjs.evtTools.network.variableStructureToJSON(storeVar)
    );
    gdjs.dialogueTree.runner.visited = loadedState.visited;
    gdjs.dialogueTree.runner.variables.data = loadedState.variables;
  } catch (e) {
    console.error(e);
  }
};
