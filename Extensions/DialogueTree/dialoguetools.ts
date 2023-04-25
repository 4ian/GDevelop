// @ts-nocheck - Weird usage of `this` in this file. Should be refactored.

namespace gdjs {
  const logger = new gdjs.Logger('Dialogue tree');

  gdjs.dialogueTree = {};
  gdjs.dialogueTree.runner = new bondage.Runner();

  /**
   * Load the Dialogue Tree data of the game. Initialize The Dialogue Tree, so as it can be used in the game.
   * @param sceneVar The variable to load the Dialogue tree data from. The data is a JSON string, created by Yarn.
   * @param startDialogueNode The Dialogue Branch to start the Dialogue Tree from. If left empty, the data will only be loaded, but can later be initialized via another action
   */
  gdjs.dialogueTree.loadFromSceneVariable = function (
    sceneVar: gdjs.Variable,
    startDialogueNode: string
  ) {
    this.runner = gdjs.dialogueTree.runner;
    try {
      this.yarnData = JSON.parse(sceneVar.getAsString());
      this.runner.load(this.yarnData);
      if (startDialogueNode && startDialogueNode.length > 0) {
        gdjs.dialogueTree.startFrom(startDialogueNode);
      }
    } catch (e) {
      logger.error('Error while loading from scene variable: ', e);
    }
  };

  /**
   * Load the Dialogue Tree data from a JSON resource.
   *
   * @param instanceContainer The scene where the dialogue is running.
   * @param jsonResourceName The JSON resource where to load the Dialogue Tree data from. The data is a JSON string usually created with [Yarn Dialogue Editor](https://github.com/InfiniteAmmoInc/Yarn).
   * @param startDialogueNode The Dialogue Branch to start the Dialogue Tree from. If left empty, the data will only be loaded, but can later be initialized via another action
   */
  gdjs.dialogueTree.loadFromJsonFile = function (
    instanceContainer: gdjs.RuntimeInstanceContainer,
    jsonResourceName: string,
    startDialogueNode: string
  ) {
    instanceContainer
      .getGame()
      .getJsonManager()
      .loadJson(jsonResourceName, function (error, content) {
        if (error) {
          logger.error('An error happened while loading JSON resource:', error);
        } else {
          if (!content) {
            return;
          }
          gdjs.dialogueTree.yarnData = content;
          try {
            gdjs.dialogueTree.runner.load(gdjs.dialogueTree.yarnData);
          } catch (error) {
            logger.error(
              'An error happened while loading parsing the dialogue tree data:',
              error
            );
          }
          if (startDialogueNode && startDialogueNode.length > 0) {
            gdjs.dialogueTree.startFrom(startDialogueNode);
          }
        }
      });
  };

  /**
   * Stop the currently running dialogue
   */
  gdjs.dialogueTree.stopRunningDialogue = function () {
    if (this.dialogueIsRunning) {
      this.dialogueIsRunning = false;
    }
    if (this.dialogueData) {
      this.dialogueData = null;
    }
    this.dialogueText = '';
    this.clipTextEnd = 0;
  };

  /**
   * Check if the Dialogue Tree is currently parsing data.
   * For example, you can do things like disabling player movement while talking to a NPC.
   */
  gdjs.dialogueTree.isRunning = function () {
    if (
      this.dialogueIsRunning &&
      !this.dialogueData &&
      this.dialogueText &&
      this.clipTextEnd >= this.dialogueText.length
    ) {
      this.dialogueIsRunning = false;
    }
    return this.dialogueIsRunning;
  };

  /**
   * Scroll the clipped text. This can be combined with a timer and user input to control how fast the dialogue line text is scrolling.
   */
  gdjs.dialogueTree.scrollClippedText = function () {
    if (this.pauseScrolling || !this.dialogueIsRunning) {
      return;
    }

    // Autoscroll commands so the user doesn't have to press again.
    if (
      gdjs.dialogueTree._isLineTypeCommand() &&
      this.dialogueDataType === 'text' &&
      this.dialogueBranchTitle === this.dialogueData.data.title &&
      this.lineNum === this.dialogueData.lineNum &&
      gdjs.dialogueTree.hasClippedScrollingCompleted()
    ) {
      gdjs.dialogueTree.goToNextDialogueLine();
      return;
    }

    // Increment scrolling of clipped text
    if (
      this.dialogueText &&
      this.dialogueDataType === 'text' &&
      this.clipTextEnd < this.dialogueText.length
    ) {
      this.clipTextEnd += 1;
    }
  };

  /**
   * Scroll the clipped text to its end, so the entire text is printed. This can be useful in keeping the event sheet logic simpler, while supporting more variation.
   */
  gdjs.dialogueTree.completeClippedTextScrolling = function () {
    if (
      this.pauseScrolling ||
      !this.dialogueIsRunning ||
      !this.dialogueText ||
      this.dialogueDataType !== 'text'
    ) {
      return;
    }
    this.clipTextEnd = this.dialogueText.length;
  };

  /**
   * Check if text scrolling has completed.
   * Useful to prevent the user from skipping to next line before the current one has been printed fully.
   */
  gdjs.dialogueTree.hasClippedScrollingCompleted = function () {
    if (!this.dialogueIsRunning || this.dialogueDataType === '') {
      return false;
    }
    if (
      this.dialogueData &&
      this.dialogueText.length > 0 &&
      this.clipTextEnd >= this.dialogueText.length
    ) {
      if (gdjs.dialogueTree.getVariable('debug')) {
        logger.warn(
          'Scroll completed:',
          this.clipTextEnd,
          '/',
          this.dialogueText.length
        );
      }
      return true;
    }
    return false;
  };

  /**
   * Get the current dialogue line with a scrolling effect (recommended).
   * Used with the scrollClippedText to achieve a classic scrolling text, as well as any <<wait>> effects to pause scrolling.
   */
  gdjs.dialogueTree.getClippedLineText = function () {
    return this.dialogueIsRunning && this.dialogueText.length
      ? this.dialogueText.substring(0, this.clipTextEnd + 1)
      : '';
  };

  /**
   * Get the current complete dialogue line without using any scrolling effects.
   * Note that using this instead getClippedLineText will skip any <<wait>> commands entirely.
   */
  gdjs.dialogueTree.getLineText = function () {
    return this.dialogueIsRunning && this.dialogueText.length
      ? this.dialogueText
      : '';
  };

  /**
   * Get the number of command parameters in a command with parameters that has been caught by a isCommandCalled condition
   */
  gdjs.dialogueTree.commandParametersCount = function () {
    if (this.commandParameters && this.commandParameters.length > 1) {
      return this.commandParameters.length - 1;
    }
    return 0;
  };

  /**
   * Get a command parameter in any command with parameters that has been caught by a isCommandCalled condition
   * @param paramIndex The index of the parameter to get.
   */
  gdjs.dialogueTree.getCommandParameter = function (paramIndex: float) {
    if (paramIndex === -1 && this.commandParameters.length > 0) {
      return this.commandParameters[0];
    }
    if (
      this.commandParameters &&
      this.commandParameters.length >= paramIndex + 1
    ) {
      const returnedParam = this.commandParameters[paramIndex + 1];
      return returnedParam ? returnedParam : '';
    }
    return '';
  };

  /**
   * Catch <<commands>> and <<commands with parameters>> from the current Dialogue Line.
   * You can trigger custom logic that relate to the story you are telling during the dialogue.
   *
   * @param command The command you want to check for being called. Write it without the `<<>>`.
   */
  gdjs.dialogueTree.isCommandCalled = function (command: string) {
    if (!this.dialogueIsRunning) {
      return false;
    }
    const commandCalls = gdjs.dialogueTree.commandCalls;
    const clipTextEnd = gdjs.dialogueTree.clipTextEnd;
    const dialogueText = gdjs.dialogueTree.dialogueText;
    if (this.pauseScrolling || !commandCalls) {
      return false;
    }
    return this.commandCalls.some(function (call, index) {
      if (clipTextEnd !== 0 && clipTextEnd < call.time) {
        return false;
      }
      if (
        call.cmd === 'wait' &&
        (clipTextEnd === 0 || clipTextEnd !== dialogueText.length)
      ) {
        gdjs.dialogueTree.pauseScrolling = true;
        setTimeout(function () {
          gdjs.dialogueTree.pauseScrolling = false;
          commandCalls.splice(index, 1);
          if (gdjs.dialogueTree.getVariable('debug')) {
            logger.info('CMD:', call);
          }
        }, parseInt(call.params[1], 10));
      }
      if (call.cmd === command) {
        gdjs.dialogueTree.commandParameters = call.params;
        commandCalls.splice(index, 1);
        if (gdjs.dialogueTree.getVariable('debug')) {
          logger.info('CMD:', call);
        }
        return true;
      }
    });
  };

  /**
   * Internal method to allow for capping option selection.
   */
  gdjs.dialogueTree._normalizedOptionIndex = function (optionIndex) {
    if (optionIndex >= this.options.length) {
      optionIndex = this.options.length - 1;
    }
    if (optionIndex < 0) {
      optionIndex = 0;
    }
    return optionIndex;
  };

  /**
   * Internal method to allow for cycling option selection.
   */
  gdjs.dialogueTree._cycledOptionIndex = function (optionIndex) {
    if (optionIndex >= this.options.length) {
      optionIndex = 0;
    }
    if (optionIndex < 0) {
      optionIndex = this.options.length - 1;
    }
    return optionIndex;
  };

  /**
   * Get the text of an option the player can select.
   * Used with getLineOptionsCount to render options for the player when a line of the Options type is parsed
   * @param optionIndex The index of the option you want to get
   */
  gdjs.dialogueTree.getLineOption = function (optionIndex: float) {
    if (!this.dialogueIsRunning || !this.options.length) {
      return [];
    }
    optionIndex = gdjs.dialogueTree._normalizedOptionIndex(optionIndex);
    return this.options[optionIndex];
  };

  /**
   * Get the text of the options the player can select, along with the selection cursor.
   * @param optionSelectionCursor The string used to draw the currently selected option's cursor
   * @param addNewLine when true each option is rendered on a new line.
   */
  gdjs.dialogueTree.getLineOptionsText = function (
    optionSelectionCursor: string,
    addNewLine: boolean
  ) {
    if (!this.dialogueIsRunning || !this.options.length) {
      return '';
    }
    let textResult = '';
    this.options.forEach(function (optionText, index) {
      if (index === gdjs.dialogueTree.selectedOption) {
        textResult += optionSelectionCursor;
      } else {
        textResult += optionSelectionCursor.replace(/.*/g, ' ');
      }
      textResult += optionText;
      if (addNewLine) {
        textResult += '\n';
      }
    });
    return textResult;
  };
  gdjs.dialogueTree.getLineOptionsTextHorizontal = function (
    optionSelectionCursor
  ) {
    return this.getLineOptionsText(optionSelectionCursor, false);
  };
  gdjs.dialogueTree.getLineOptionsTextVertical = function (
    optionSelectionCursor
  ) {
    return this.getLineOptionsText(optionSelectionCursor, true);
  };

  /**
   * Get the number of options that are presented to the player, during the parsing of an Options type line.
   * @returns The number of options
   */
  gdjs.dialogueTree.getLineOptionsCount = function (): number {
    if (this.dialogueIsRunning && this.options.length) {
      return this.optionsCount;
    }
    return 0;
  };

  /**
   * Confirm the currently selected option, during the parsing of an Options type line.
   *
   * This will advance the dialogue tree to the dialogue branch was selected by the player.
   */
  gdjs.dialogueTree.confirmSelectOption = function () {
    if (!this.dialogueIsRunning) {
      return;
    }
    if (
      this.dialogueData.select &&
      !this.selectedOptionUpdated &&
      this.selectedOption !== -1
    ) {
      this.commandCalls = [];
      try {
        this.dialogueData.select(this.selectedOption);
        this.dialogueData = this.dialogue.next().value;
        gdjs.dialogueTree.goToNextDialogueLine();
      } catch (error) {
        logger.error(
          `An error happened when trying to access the dialogue branch!`,
          error
        );
      }
    }
  };

  /**
   * Select next option during Options type line parsing. Hook this to your game input.
   */
  gdjs.dialogueTree.selectNextOption = function () {
    if (!this.dialogueIsRunning) {
      return;
    }
    if (this.dialogueData.select) {
      this.selectedOption += 1;
      this.selectedOption = gdjs.dialogueTree._cycledOptionIndex(
        this.selectedOption
      );
      this.selectedOptionUpdated = true;
    }
  };

  /**
   * Select previous option during Options type line parsing. Hook this to your game input.
   */
  gdjs.dialogueTree.selectPreviousOption = function () {
    if (!this.dialogueIsRunning) {
      return;
    }
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
   * @param optionIndex The index of the option to select
   */
  gdjs.dialogueTree.selectOption = function (optionIndex: float) {
    if (!this.dialogueIsRunning) {
      return;
    }
    if (this.dialogueData.select) {
      this.selectedOption = gdjs.dialogueTree._normalizedOptionIndex(
        optionIndex
      );
      this.selectedOptionUpdated = true;
    }
  };

  /**
   * Get the currently selected option
   * @returns The index of the currently selected option
   */
  gdjs.dialogueTree.getSelectedOption = function (): number {
    if (!this.dialogueIsRunning) {
      return;
    }
    if (this.dialogueData.select) {
      return this.selectedOption;
    }
    return 0;
  };

  /**
   * Check when the player has changed option selection since the last call to this function.
   *
   * Can be used to re-render your displayed dialogue options when needed.
   *
   * @returns true if the selected option was updated since the last call to this function
   */
  gdjs.dialogueTree.hasSelectedOptionChanged = function (): boolean {
    if (this.selectedOptionUpdated) {
      this.selectedOptionUpdated = false;
      if (this.selectedOption === -1) {
        this.selectedOption = 0;
      }
      return true;
    }
    return false;
  };

  /**
   * Check the type of the Dialogue Line that is being displayed to the player at the moment.
   *
   * There are three types:
   * - text - regular dialogue text is being parsed at the moment
   * - options - the player has reached a branching choice moment where they must select one of multiple options
   * - command - a <<command>> was called in the background, that can be used to trigger game events, but will not be displayed in the dialogue box.
   *
   * @param type The type you want to check for ( one of the three above )
   */
  gdjs.dialogueTree.isDialogueLineType = function (type: string) {
    if (!this.dialogueIsRunning) {
      return false;
    }
    if (this.commandCalls && type === 'command') {
      if (
        this.commandCalls.some(function (call) {
          return (
            gdjs.dialogueTree.clipTextEnd > call.time && call.cmd === 'wait'
          );
        })
      ) {
        return !this.pauseScrolling;
      }
      if (this.commandCalls.length > 0 && this.commandParameters.length > 0) {
        return true;
      }
    }
    return this.dialogueDataType === type;
  };

  /**
   * Check if a branch exists. It is also used internally whenever you use the start from action.
   * @param branchName The Dialogue Branch name you want to check.
   */
  gdjs.dialogueTree.hasDialogueBranch = function (branchName: string) {
    return (
      this.runner &&
      this.runner.yarnNodes &&
      Object.keys(this.runner.yarnNodes).some(function (node) {
        return node === branchName;
      })
    );
  };

  /**
   * Start parsing dialogue from a specified Dialogue tree branch.
   * Can be used if you want to store multiple dialogues inside a single Dialogue tree data set.
   * @param startDialogueNode The Dialogue Branch name you want to start parsing from.
   */
  gdjs.dialogueTree.startFrom = function (startDialogueNode: string) {
    this.runner = gdjs.dialogueTree.runner;
    if (!this.hasDialogueBranch(startDialogueNode)) {
      return;
    }
    this.optionsCount = 0;
    this.options = [];
    this.tagParameters = [];
    this.dialogue = this.runner.run(startDialogueNode);
    this.dialogueText = '';
    this.clipTextEnd = 0;
    this.commandCalls = [];
    this.commandParameters = [];
    this.pauseScrolling = false;
    this.dialogueData = this.dialogue.next().value;
    this.dialogueBranchTags = this.dialogueData.data.tags;
    this.dialogueBranchTitle = this.dialogueData.data.title;
    this.dialogueBranchBody = this.dialogueData.data.body;
    this.lineNum = this.dialogueData.lineNum;
    if (gdjs.dialogueTree._isLineTypeText()) {
      this.dialogueDataType = 'text';
    } else {
      if (gdjs.dialogueTree._isLineTypeOptions()) {
        this.dialogueDataType = 'options';
      } else {
        this.dialogueDataType = 'command';
      }
    }
    this.dialogueIsRunning = true;
    gdjs.dialogueTree.goToNextDialogueLine();
  };

  /**
   * Internal methods to check the type of a Dialogue Line
   */
  gdjs.dialogueTree._isLineTypeText = function () {
    return this.dialogueData instanceof bondage.TextResult;
  };
  gdjs.dialogueTree._isLineTypeOptions = function () {
    return this.dialogueData instanceof bondage.OptionsResult;
  };
  gdjs.dialogueTree._isLineTypeCommand = function () {
    return this.dialogueData instanceof bondage.CommandResult;
  };

  /**
   * This is the main lifecycle function.It runs once only when the user is advancing the dialogue to the next line.
   * Progress Dialogue to the next line. Hook it to your game input.
   * Note that this action can be influenced by any <<wait>> commands, but they work only if you have at least one isCommandCalled condition.
   */
  gdjs.dialogueTree.goToNextDialogueLine = function () {
    if (this.pauseScrolling || !this.dialogueIsRunning) {
      return;
    }
    this.optionsCount = 0;
    this.selectedOption = -1;
    this.selectedOptionUpdated = false;
    if (gdjs.dialogueTree.getVariable('debug')) {
      logger.info('Parsing:', this.dialogueData);
    }
    if (!this.dialogueData) {
      gdjs.dialogueTree.stopRunningDialogue();
    } else {
      if (gdjs.dialogueTree._isLineTypeText()) {
        if (
          this.lineNum === this.dialogueData.lineNum &&
          this.dialogueBranchTitle === this.dialogueData.data.title
        ) {
          this.clipTextEnd = this.dialogueText.length - 1;
          this.dialogueText +=
            (this.dialogueText === '' ? '' : ' ') + this.dialogueData.text;
        } else {
          this.clipTextEnd = 0;
          this.dialogueText = this.dialogueData.text;
        }
        this.dialogueBranchTags = this.dialogueData.data.tags;
        this.dialogueBranchTitle = this.dialogueData.data.title;
        this.dialogueBranchBody = this.dialogueData.data.body;
        this.lineNum = this.dialogueData.lineNum;
        this.dialogueDataType = 'text';
        this.dialogueData = this.dialogue.next().value;
      } else {
        if (gdjs.dialogueTree._isLineTypeOptions()) {
          this.commandCalls = [];
          this.dialogueDataType = 'options';
          this.dialogueText = '';
          this.clipTextEnd = 0;
          this.optionsCount = this.dialogueData.options.length;
          this.options = this.dialogueData.options;
          this.selectedOptionUpdated = true;
        } else {
          if (gdjs.dialogueTree._isLineTypeCommand()) {
            this.dialogueDataType = 'command';
            const command = this.dialogueData.text.split(' ');

            // If last command was to wait, increase time by one
            const offsetTime =
              this.commandCalls.length &&
              this.commandCalls[this.commandCalls.length - 1].cmd === 'wait'
                ? 1
                : 0;
            this.commandCalls.push({
              cmd: command[0],
              params: command,
              time: this.dialogueText.length + offsetTime,
            });
            this.dialogueData = this.dialogue.next().value;
            gdjs.dialogueTree.goToNextDialogueLine();
          } else {
            this.dialogueDataType = 'unknown';
          }
        }
      }
    }
  };

  /**
   * Get the current Dialogue Tree branch title.
   * @returns The current branch title.
   */
  gdjs.dialogueTree.getBranchTitle = function (): string {
    if (this.dialogueIsRunning) {
      return this.dialogueBranchTitle;
    }
    return '';
  };

  /**
   * Check if the currently parsed Dialogue branch title is a  query.
   * @param title The Dialogue Branch name you want to check for.
   */
  gdjs.dialogueTree.branchTitleIs = function (title: string) {
    if (this.dialogueIsRunning) {
      return this.dialogueBranchTitle === title;
    }
    return false;
  };

  /**
   * Get all the branch tags from the current Dialogue branch as a string. Useful for debugging.
   * @returns The current branch tags, separated by a comma.
   */
  gdjs.dialogueTree.getBranchTags = function (): string {
    if (this.dialogueIsRunning) {
      return this.dialogueBranchTags.join(',');
    }
    return '';
  };

  /**
   * Get one of the current Dialogue branch tags via index.
   * @param index The index of the Dialogue Branch tag you want to get.
   * @returns The branch tag at the specified index, or an empty string if not found.
   */
  gdjs.dialogueTree.getBranchTag = function (index: float): string {
    if (this.dialogueIsRunning && this.dialogueBranchTags.length) {
      if (index > this.dialogueBranchTags.length - 1) {
        index = this.dialogueBranchTags.length - 1;
      }
      return this.dialogueBranchTags[index];
    }
    return '';
  };

  /**
   * Check if the current Dialogue branch contains a specific tag.
   * @param query The name of the Dialogue Branch tag you want to check.
   */
  gdjs.dialogueTree.branchContainsTag = function (query: string) {
    this.tagParameters = [];
    if (this.dialogueIsRunning && this.dialogueBranchTags.length) {
      return this.dialogueBranchTags.some(function (tag) {
        const splitTag = tag.match(/([^\(]+)\(([^\)]+)\)/i);
        gdjs.dialogueTree.tagParameters = splitTag
          ? splitTag[2].split(',')
          : [];
        return splitTag ? splitTag[1] === query : tag === query;
      });
    }
    return false;
  };

  /**
   * Get any tag(parameter,anotherParameter) from a tag captured by the branchContainsTag Condition
   * @param paramIndex The index of the tag parameter you want to get.
   * Leaving this empty will result in retrieving the first parameter.
   */
  gdjs.dialogueTree.getTagParameter = function (paramIndex: float) {
    if (this.dialogueIsRunning && this.tagParameters.length >= paramIndex) {
      const returnedParam = this.tagParameters[paramIndex];
      return returnedParam ? returnedParam : '';
    }
    return '';
  };

  /**
   * Get a list of all the titles of visited by the player Branches. Useful for debugging.
   */
  gdjs.dialogueTree.getVisitedBranchTitles = function () {
    if (this.dialogueIsRunning) {
      return Object.keys(this.runner.visited).join(',');
    }
    return '';
  };

  /**
   * Check if a player has visited a Dialogue Branch in the past.
   * @param title The title of the branch to check for.
   * Leaving this empty will check if the current branch title has been visited in the past.
   */
  gdjs.dialogueTree.branchTitleHasBeenVisited = function (title: string) {
    if (!title) {
      title = this.dialogueBranchTitle;
    }
    return (
      Object.keys(this.runner.visited).includes(title) &&
      this.runner.visited[title]
    );
  };

  /**
   * Get the entire unparsed text of the current Dialogue Branch
   */
  gdjs.dialogueTree.getBranchText = function () {
    if (this.dialogueIsRunning) {
      return this.dialogueBranchBody;
    }
    return '';
  };

  /**
   * Get the value of a variable that was created by the Dialogue parses.
   * @param key The name of the variable you want to get the value of
   */
  gdjs.dialogueTree.getVariable = function (key: string) {
    if (this.runner.variables && key in this.runner.variables.data) {
      return this.runner.variables.get(key);
    }
    return '';
  };

  /**
   * Check if a specific variable created by the Dialogue parses exists and is equal to a specific value.
   * @param key The name of the variable you want to check the value of
   * @param value The value you want to check against
   */
  gdjs.dialogueTree.compareVariable = function (
    key: string,
    value: string | boolean | number
  ) {
    if (this.runner.variables && key in this.runner.variables.data) {
      return this.runner.variables.get(key) === value;
    }
    return false;
  };

  /**
   * Set a specific variable created by the Dialogue parser to a specific value.
   * @param key The name of the variable you want to set the value of
   * @param value The value you want to set
   */
  gdjs.dialogueTree.setVariable = function (
    key: string,
    value: string | boolean | number
  ) {
    if (this.runner.variables) {
      this.runner.variables.set(key, value);
    }
  };

  /**
   * Store the current State of the Dialogue Parser in a specified variable.
   * Can be used to implement persistence in dialogue through your game's Load/Save function.
   * That way you can later load all the dialogue choices the player has made.
   * @param outputVariable The variable where to store the State
   */
  gdjs.dialogueTree.saveState = function (outputVariable: gdjs.Variable) {
    const dialogueState = {
      variables: gdjs.dialogueTree.runner.variables.data,
      visited: gdjs.dialogueTree.runner.visited,
    };
    outputVariable.fromJSObject(dialogueState);
  };

  /**
   * Load the current State of the Dialogue Parser from a specified variable.
   * Can be used to implement persistence in dialogue through your game's Load/Save function.
   * That way you can later load all the dialogue choices the player has made.
   * @param inputVariable The structured variable where to load the State from.
   */
  gdjs.dialogueTree.loadState = function (inputVariable: gdjs.Variable) {
    const loadedState = inputVariable.toJSObject();
    if (!loadedState) {
      logger.error('Load state variable is empty:', inputVariable);
      return;
    }
    try {
      gdjs.dialogueTree.runner.visited = loadedState.visited;
      gdjs.dialogueTree.runner.variables.data = {};
      Object.keys(loadedState.variables).forEach(function (key) {
        const value = loadedState.variables[key];
        gdjs.dialogueTree.runner.variables.set(key, value);
      });
    } catch (e) {
      logger.error('Failed to load state from variable:', inputVariable, e);
    }
  };

  /**
   * Clear the current State of the Dialogue Parser.
   */
  gdjs.dialogueTree.clearState = function () {
    gdjs.dialogueTree.runner.visited = {};
    gdjs.dialogueTree.runner.variables.data = {};
  };
}
