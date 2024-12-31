namespace gdjs {
  export namespace dialogueTree {
    const logger = new gdjs.Logger('Dialogue tree');

    const runner = new bondage.Runner();
    let commandCalls: Array<any>;
    let clipTextEnd: integer = 0;
    let dialogueText = '';
    let pauseScrolling = false;
    let commandParameters: Array<string> = [];
    let selectedOption: integer = 0;
    let selectedOptionUpdated = false;
    let tagParameters: Array<string> = [];
    let dialogueData:
      | bondage.TextResult
      | bondage.CommandResult
      | bondage.OptionsResult
      | null = null;
    let dialogueIsRunning = false;
    let dialogueDataType: string | null = null;
    let dialogueBranchTitle = '';
    let lineNum: number | number[] = 0;
    let optionsCount = 0;
    let options: Array<string> = [];
    let dialogue: any;
    let dialogueBranchTags: Array<string> = [];
    let dialogueBranchBody = '';

    /**
     * Load the Dialogue Tree data of the game. Initialize The Dialogue Tree, so as it can be used in the game.
     * @param sceneVar The variable to load the Dialogue tree data from. The data is a JSON string, created by Yarn.
     * @param startDialogueNode The Dialogue Branch to start the Dialogue Tree from. If left empty, the data will only be loaded, but can later be initialized via another action
     */
    export function loadFromSceneVariable(
      sceneVar: gdjs.Variable,
      startDialogueNode: string
    ) {
      try {
        const yarnData = JSON.parse(sceneVar.getAsString());
        runner.load(yarnData);
        if (startDialogueNode && startDialogueNode.length > 0) {
          gdjs.dialogueTree.startFrom(startDialogueNode);
        }
      } catch (e) {
        logger.error('Error while loading from scene variable: ', e);
      }
    }

    /**
     * Load the Dialogue Tree data from a JSON resource.
     *
     * @param instanceContainer The scene where the dialogue is running.
     * @param jsonResourceName The JSON resource where to load the Dialogue Tree data from. The data is a JSON string usually created with [Yarn Dialogue Editor](https://github.com/InfiniteAmmoInc/Yarn).
     * @param startDialogueNode The Dialogue Branch to start the Dialogue Tree from. If left empty, the data will only be loaded, but can later be initialized via another action
     */
    export function loadFromJsonFile(
      instanceContainer: gdjs.RuntimeInstanceContainer,
      jsonResourceName: string,
      startDialogueNode: string
    ) {
      instanceContainer
        .getGame()
        .getJsonManager()
        .loadJson(jsonResourceName, function (error, content) {
          if (error) {
            logger.error(
              'An error happened while loading JSON resource:',
              error
            );
          } else {
            if (!content) {
              return;
            }
            const yarnData = content as any[];
            try {
              runner.load(yarnData);
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
    }

    /**
     * Stop the currently running dialogue
     */
    export function stopRunningDialogue() {
      dialogueIsRunning = false;
      dialogueData = null;
      dialogueText = '';
      clipTextEnd = 0;
    }

    /**
     * Check if the Dialogue Tree is currently parsing data.
     * For example, you can do things like disabling player movement while talking to a NPC.
     */
    export function isRunning() {
      if (
        dialogueIsRunning &&
        !dialogueData &&
        dialogueText &&
        clipTextEnd >= dialogueText.length
      ) {
        dialogueIsRunning = false;
      }
      return dialogueIsRunning;
    }

    /**
     * Scroll the clipped text. This can be combined with a timer and user input to control how fast the dialogue line text is scrolling.
     */
    export function scrollClippedText() {
      if (pauseScrolling || !dialogueIsRunning) {
        return;
      }

      // Autoscroll commands so the user doesn't have to press again.
      if (
        dialogueData instanceof bondage.CommandResult &&
        dialogueDataType === 'text' &&
        dialogueBranchTitle === dialogueData.data.title &&
        lineNum === dialogueData.lineNum &&
        gdjs.dialogueTree.hasClippedScrollingCompleted()
      ) {
        gdjs.dialogueTree.goToNextDialogueLine();
        return;
      }

      // Increment scrolling of clipped text
      if (
        dialogueText &&
        dialogueDataType === 'text' &&
        clipTextEnd < dialogueText.length
      ) {
        clipTextEnd += 1;
      }
    }

    /**
     * Scroll the clipped text to its end, so the entire text is printed. This can be useful in keeping the event sheet logic simpler, while supporting more variation.
     */
    export function completeClippedTextScrolling() {
      if (
        pauseScrolling ||
        !dialogueIsRunning ||
        !dialogueText ||
        dialogueDataType !== 'text'
      ) {
        return;
      }
      clipTextEnd = dialogueText.length;
    }

    /**
     * Check if text scrolling has completed.
     * Useful to prevent the user from skipping to next line before the current one has been printed fully.
     */
    export function hasClippedScrollingCompleted() {
      if (!dialogueIsRunning || dialogueDataType === '') {
        return false;
      }
      if (
        dialogueData &&
        dialogueText.length > 0 &&
        clipTextEnd >= dialogueText.length
      ) {
        if (gdjs.dialogueTree.getVariable('debug')) {
          logger.warn(
            'Scroll completed:',
            clipTextEnd,
            '/',
            dialogueText.length
          );
        }
        return true;
      }
      return false;
    }

    /**
     * Get the current dialogue line with a scrolling effect (recommended).
     * Used with the scrollClippedText to achieve a classic scrolling text, as well as any <<wait>> effects to pause scrolling.
     */
    export function getClippedLineText() {
      return dialogueIsRunning && dialogueText.length
        ? dialogueText.substring(0, clipTextEnd + 1)
        : '';
    }

    /**
     * Get the current complete dialogue line without using any scrolling effects.
     * Note that using this instead getClippedLineText will skip any <<wait>> commands entirely.
     */
    export function getLineText() {
      return dialogueIsRunning && dialogueText.length ? dialogueText : '';
    }

    /**
     * Get the number of command parameters in a command with parameters that has been caught by a isCommandCalled condition
     */
    export function commandParametersCount() {
      if (commandParameters.length > 1) {
        return commandParameters.length - 1;
      }
      return 0;
    }

    /**
     * Get a command parameter in any command with parameters that has been caught by a isCommandCalled condition
     * @param paramIndex The index of the parameter to get.
     */
    export function getCommandParameter(paramIndex: float) {
      if (paramIndex === -1 && commandParameters.length > 0) {
        return commandParameters[0];
      }
      if (commandParameters.length >= paramIndex + 1) {
        const returnedParam = commandParameters[paramIndex + 1];
        return returnedParam ? returnedParam : '';
      }
      return '';
    }

    /**
     * Catch <<commands>> and <<commands with parameters>> from the current Dialogue Line.
     * You can trigger custom logic that relate to the story you are telling during the dialogue.
     *
     * @param command The command you want to check for being called. Write it without the `<<>>`.
     */
    export function isCommandCalled(command: string) {
      if (!dialogueIsRunning) {
        return false;
      }
      if (pauseScrolling || !commandCalls) {
        return false;
      }
      return commandCalls.some(function (call, index) {
        if (clipTextEnd !== 0 && clipTextEnd < call.time) {
          return false;
        }
        if (
          call.cmd === 'wait' &&
          (clipTextEnd === 0 || clipTextEnd !== dialogueText.length)
        ) {
          pauseScrolling = true;
          setTimeout(function () {
            pauseScrolling = false;
            commandCalls.splice(index, 1);
            if (gdjs.dialogueTree.getVariable('debug')) {
              logger.info('CMD:', call);
            }
          }, parseInt(call.params[1], 10));
        }
        if (call.cmd === command) {
          commandParameters = call.params;
          commandCalls.splice(index, 1);
          if (gdjs.dialogueTree.getVariable('debug')) {
            logger.info('CMD:', call);
          }
          return true;
        }
        return false;
      });
    }

    /**
     * Internal method to allow for capping option selection.
     */
    function _normalizedOptionIndex(optionIndex: integer) {
      if (optionIndex >= options.length) {
        optionIndex = options.length - 1;
      }
      if (optionIndex < 0) {
        optionIndex = 0;
      }
      return optionIndex;
    }

    /**
     * Internal method to allow for cycling option selection.
     */
    function _cycledOptionIndex(optionIndex: integer) {
      if (optionIndex >= options.length) {
        optionIndex = 0;
      }
      if (optionIndex < 0) {
        optionIndex = options.length - 1;
      }
      return optionIndex;
    }

    /**
     * Get the text of an option the player can select.
     * Used with getLineOptionsCount to render options for the player when a line of the Options type is parsed
     * @param optionIndex The index of the option you want to get
     */
    export function getLineOption(optionIndex: float) {
      if (!dialogueIsRunning || !options.length) {
        return [];
      }
      optionIndex = _normalizedOptionIndex(optionIndex);
      return options[optionIndex];
    }

    /**
     * Get the text of the options the player can select, along with the selection cursor.
     * @param optionSelectionCursor The string used to draw the currently selected option's cursor
     * @param addNewLine when true each option is rendered on a new line.
     */
    export function getLineOptionsText(
      optionSelectionCursor: string,
      addNewLine: boolean
    ) {
      if (!dialogueIsRunning || !options.length) {
        return '';
      }
      let textResult = '';
      options.forEach(function (optionText, index) {
        if (index === selectedOption) {
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
    }
    export function getLineOptionsTextHorizontal(optionSelectionCursor) {
      return gdjs.dialogueTree.getLineOptionsText(optionSelectionCursor, false);
    }
    export function getLineOptionsTextVertical(optionSelectionCursor) {
      return gdjs.dialogueTree.getLineOptionsText(optionSelectionCursor, true);
    }

    /**
     * Get the number of options that are presented to the player, during the parsing of an Options type line.
     * @returns The number of options
     */
    export function getLineOptionsCount(): number {
      if (dialogueIsRunning && options.length) {
        return optionsCount;
      }
      return 0;
    }

    /**
     * Confirm the currently selected option, during the parsing of an Options type line.
     *
     * This will advance the dialogue tree to the dialogue branch was selected by the player.
     */
    export function confirmSelectOption() {
      if (!dialogueIsRunning) {
        return;
      }
      if (
        dialogueData instanceof bondage.OptionsResult &&
        !selectedOptionUpdated &&
        selectedOption !== -1
      ) {
        commandCalls = [];
        try {
          dialogueData.select(selectedOption);
          try {
            dialogueData = dialogue.next().value;
          } catch (error) {
            logger.error(
              'Error while confirming in the dialogue tree. Verify if there is a syntax error? Full error is: ',
              error
            );
            return;
          }
          gdjs.dialogueTree.goToNextDialogueLine();
        } catch (error) {
          logger.error(
            `An error happened when trying to access the dialogue branch!`,
            error
          );
        }
      }
    }

    /**
     * Select next option during Options type line parsing. Hook this to your game input.
     */
    export function selectNextOption() {
      if (!dialogueIsRunning) {
        return;
      }
      if (_isLineTypeOptions()) {
        selectedOption += 1;
        selectedOption = _cycledOptionIndex(selectedOption);
        selectedOptionUpdated = true;
      }
    }

    /**
     * Select previous option during Options type line parsing. Hook this to your game input.
     */
    export function selectPreviousOption() {
      if (!dialogueIsRunning) {
        return;
      }
      if (_isLineTypeOptions()) {
        selectedOption -= 1;
        selectedOption = _cycledOptionIndex(selectedOption);
        selectedOptionUpdated = true;
      }
    }

    /**
     * Select option by index during Options type line parsing.
     * @param optionIndex The index of the option to select
     */
    export function selectOption(optionIndex: float) {
      if (!dialogueIsRunning) {
        return;
      }
      if (_isLineTypeOptions()) {
        selectedOption = _normalizedOptionIndex(optionIndex);
        selectedOptionUpdated = true;
      }
    }

    /**
     * Get the currently selected option
     * @returns The index of the currently selected option
     */
    export function getSelectedOption(): number {
      if (!dialogueIsRunning) {
        return 0;
      }
      if (_isLineTypeOptions()) {
        return selectedOption;
      }
      return 0;
    }

    /**
     * Check when the player has changed option selection since the last call to this function.
     *
     * Can be used to re-render your displayed dialogue options when needed.
     *
     * @returns true if the selected option was updated since the last call to this function
     */
    export function hasSelectedOptionChanged(): boolean {
      if (selectedOptionUpdated) {
        selectedOptionUpdated = false;
        if (selectedOption === -1) {
          selectedOption = 0;
        }
        return true;
      }
      return false;
    }

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
    export function isDialogueLineType(type: string) {
      if (!dialogueIsRunning) {
        return false;
      }
      if (commandCalls && type === 'command') {
        if (
          commandCalls.some(function (call) {
            return clipTextEnd > call.time && call.cmd === 'wait';
          })
        ) {
          return !pauseScrolling;
        }
        if (commandCalls.length > 0 && commandParameters.length > 0) {
          return true;
        }
      }
      return dialogueDataType === type;
    }

    /**
     * Check if a branch exists. It is also used internally whenever you use the start from action.
     * @param branchName The Dialogue Branch name you want to check.
     */
    export function hasDialogueBranch(branchName: string) {
      return (
        runner &&
        runner.yarnNodes &&
        Object.keys(runner.yarnNodes).some(function (node) {
          return node === branchName;
        })
      );
    }

    /**
     * Start parsing dialogue from a specified Dialogue tree branch.
     * Can be used if you want to store multiple dialogues inside a single Dialogue tree data set.
     * @param startDialogueNode The Dialogue Branch name you want to start parsing from.
     */
    export function startFrom(startDialogueNode: string) {
      if (!gdjs.dialogueTree.hasDialogueBranch(startDialogueNode)) {
        return;
      }
      optionsCount = 0;
      options = [];
      tagParameters = [];
      try {
        dialogue = runner.run(startDialogueNode);
      } catch (error) {
        logger.error(
          'Error while setting up the dialogue tree. Verify if there is a syntax error? Full error is: ',
          error
        );
        return;
      }
      dialogueText = '';
      clipTextEnd = 0;
      commandCalls = [];
      commandParameters = [];
      pauseScrolling = false;
      try {
        dialogueData = dialogue.next().value;
      } catch (error) {
        logger.error(
          'Error while starting the dialogue tree. Verify if there is a syntax error? Full error is: ',
          error
        );
        return;
      }
      if (!dialogueData) {
        return;
      }
      if (
        dialogueData instanceof bondage.TextResult ||
        dialogueData instanceof bondage.CommandResult
      ) {
        dialogueBranchTags = dialogueData.data.tags;
        dialogueBranchTitle = dialogueData.data.title;
        dialogueBranchBody = dialogueData.data.body;
      }
      lineNum = dialogueData.lineNum;
      if (_isLineTypeText()) {
        dialogueDataType = 'text';
      } else {
        if (_isLineTypeOptions()) {
          dialogueDataType = 'options';
        } else {
          dialogueDataType = 'command';
        }
      }
      dialogueIsRunning = true;
      gdjs.dialogueTree.goToNextDialogueLine();
    }

    /**
     * Internal methods to check the type of a Dialogue Line
     */
    function _isLineTypeText() {
      return dialogueData instanceof bondage.TextResult;
    }
    function _isLineTypeOptions() {
      return dialogueData instanceof bondage.OptionsResult;
    }
    function _isLineTypeCommand() {
      return dialogueData instanceof bondage.CommandResult;
    }

    /**
     * This is the main lifecycle function.It runs once only when the user is advancing the dialogue to the next line.
     * Progress Dialogue to the next line. Hook it to your game input.
     * Note that this action can be influenced by any <<wait>> commands, but they work only if you have at least one isCommandCalled condition.
     */
    export function goToNextDialogueLine() {
      if (pauseScrolling || !dialogueIsRunning) {
        return;
      }
      optionsCount = 0;
      selectedOption = -1;
      selectedOptionUpdated = false;
      if (gdjs.dialogueTree.getVariable('debug')) {
        logger.info('Parsing:', dialogueData);
      }
      if (!dialogueData) {
        gdjs.dialogueTree.stopRunningDialogue();
      } else {
        if (dialogueData instanceof bondage.TextResult) {
          if (
            lineNum === dialogueData.lineNum &&
            dialogueBranchTitle === dialogueData.data.title
          ) {
            clipTextEnd = dialogueText.length - 1;
            dialogueText +=
              (dialogueText === '' ? '' : ' ') + dialogueData.text;
          } else {
            clipTextEnd = 0;
            dialogueText = dialogueData.text;
          }
          dialogueBranchTags = dialogueData.data.tags;
          dialogueBranchTitle = dialogueData.data.title;
          dialogueBranchBody = dialogueData.data.body;
          lineNum = dialogueData.lineNum;
          dialogueDataType = 'text';
          try {
            dialogueData = dialogue.next().value;
          } catch (error) {
            logger.error(
              'Error while progressing the dialogue tree. Verify if there is a syntax error? Full error is: ',
              error
            );
            return;
          }
        } else {
          if (dialogueData instanceof bondage.OptionsResult) {
            commandCalls = [];
            dialogueDataType = 'options';
            dialogueText = '';
            clipTextEnd = 0;
            optionsCount = dialogueData.options.length;
            options = dialogueData.options;
            selectedOptionUpdated = true;
          } else {
            if (_isLineTypeCommand()) {
              dialogueDataType = 'command';
              const command = dialogueData.text.split(' ');

              // If last command was to wait, increase time by one
              const offsetTime =
                commandCalls.length &&
                commandCalls[commandCalls.length - 1].cmd === 'wait'
                  ? 1
                  : 0;
              commandCalls.push({
                cmd: command[0],
                params: command,
                time: dialogueText.length + offsetTime,
              });
              try {
                dialogueData = dialogue.next().value;
              } catch (error) {
                logger.error(
                  'Error while progressing the dialogue tree. Verify if there is a syntax error? Full error is: ',
                  error
                );
                return;
              }
              gdjs.dialogueTree.goToNextDialogueLine();
            } else {
              dialogueDataType = 'unknown';
            }
          }
        }
      }
    }

    /**
     * Get the current Dialogue Tree branch title.
     * @returns The current branch title.
     */
    export function getBranchTitle(): string {
      if (dialogueIsRunning) {
        return dialogueBranchTitle;
      }
      return '';
    }

    /**
     * Check if the currently parsed Dialogue branch title is a  query.
     * @param title The Dialogue Branch name you want to check for.
     */
    export function branchTitleIs(title: string) {
      if (dialogueIsRunning) {
        return dialogueBranchTitle === title;
      }
      return false;
    }

    /**
     * Get all the branch tags from the current Dialogue branch as a string. Useful for debugging.
     * @returns The current branch tags, separated by a comma.
     */
    export function getBranchTags(): string {
      if (dialogueIsRunning) {
        return dialogueBranchTags.join(',');
      }
      return '';
    }

    /**
     * Get one of the current Dialogue branch tags via index.
     * @param index The index of the Dialogue Branch tag you want to get.
     * @returns The branch tag at the specified index, or an empty string if not found.
     */
    export function getBranchTag(index: float): string {
      if (dialogueIsRunning && dialogueBranchTags.length) {
        if (index > dialogueBranchTags.length - 1) {
          index = dialogueBranchTags.length - 1;
        }
        return dialogueBranchTags[index];
      }
      return '';
    }

    /**
     * Check if the current Dialogue branch contains a specific tag.
     * @param query The name of the Dialogue Branch tag you want to check.
     */
    export function branchContainsTag(query: string) {
      tagParameters = [];
      if (dialogueIsRunning && dialogueBranchTags.length) {
        return dialogueBranchTags.some(function (tag) {
          const splitTag = tag.match(/([^\(]+)\(([^\)]+)\)/i);
          tagParameters = splitTag ? splitTag[2].split(',') : [];
          return splitTag ? splitTag[1] === query : tag === query;
        });
      }
      return false;
    }

    /**
     * Get any tag(parameter,anotherParameter) from a tag captured by the branchContainsTag Condition
     * @param paramIndex The index of the tag parameter you want to get.
     * Leaving this empty will result in retrieving the first parameter.
     */
    export function getTagParameter(paramIndex: float) {
      if (dialogueIsRunning && tagParameters.length >= paramIndex) {
        const returnedParam = tagParameters[paramIndex];
        return returnedParam ? returnedParam : '';
      }
      return '';
    }

    /**
     * Get a list of all the titles of visited by the player Branches. Useful for debugging.
     */
    export function getVisitedBranchTitles() {
      if (dialogueIsRunning) {
        return Object.keys(runner.visited).join(',');
      }
      return '';
    }

    /**
     * Check if a player has visited a Dialogue Branch in the past.
     * @param title The title of the branch to check for.
     * Leaving this empty will check if the current branch title has been visited in the past.
     */
    export function branchTitleHasBeenVisited(title: string) {
      if (!title) {
        title = dialogueBranchTitle;
      }
      return (
        Object.keys(runner.visited).includes(title) && runner.visited[title]
      );
    }

    /**
     * Get the entire unparsed text of the current Dialogue Branch
     */
    export function getBranchText() {
      if (dialogueIsRunning) {
        return dialogueBranchBody;
      }
      return '';
    }

    /**
     * Get the value of a variable stored in the dialogue state.
     * @param key The variable name
     */
    export function getVariable(key: string): string | float | boolean {
      if (runner.variables && key in runner.variables.data) {
        return runner.variables.get(key);
      }
      return '';
    }

    /**
     * Get the value of a variable stored in the dialogue state.
     * @param key The variable name
     */
    export function getVariableAsNumber(key: string): float {
      if (runner.variables && key in runner.variables.data) {
        const value = runner.variables.get(key);
        if (typeof value !== 'number') {
          return parseFloat(value) || 0;
        }

        return isFinite(value) ? value : 0;
      }
      return 0;
    }

    /**
     * Get the value of a variable stored in the dialogue state.
     * @param key The variable name
     */
    export function getVariableAsString(key: string): string {
      if (runner.variables && key in runner.variables.data) {
        return '' + runner.variables.get(key);
      }
      return '';
    }

    /**
     * Check if a specific variable created by the Dialogue parses exists and is equal to a specific value.
     * @param key The name of the variable you want to check the value of
     * @param value The value you want to check against
     */
    export function compareVariable(
      key: string,
      value: string | boolean | number
    ) {
      if (runner.variables && key in runner.variables.data) {
        return runner.variables.get(key) === value;
      }
      return false;
    }

    /**
     * Set a specific variable created by the Dialogue parser to a specific value.
     * @param key The name of the variable you want to set the value of
     * @param value The value you want to set
     */
    export function setVariable(key: string, value: string | boolean | number) {
      if (runner.variables) {
        runner.variables.set(key, value);
      }
    }

    /**
     * Store the current State of the Dialogue Parser in a specified variable.
     * Can be used to implement persistence in dialogue through your game's Load/Save function.
     * That way you can later load all the dialogue choices the player has made.
     * @param outputVariable The variable where to store the State
     */
    export function saveState(outputVariable: gdjs.Variable) {
      const dialogueState = {
        variables: runner.variables.data,
        visited: runner.visited,
      };
      outputVariable.fromJSObject(dialogueState);
    }

    /**
     * Load the current State of the Dialogue Parser from a specified variable.
     * Can be used to implement persistence in dialogue through your game's Load/Save function.
     * That way you can later load all the dialogue choices the player has made.
     * @param inputVariable The structured variable where to load the State from.
     */
    export function loadState(inputVariable: gdjs.Variable) {
      const loadedState = inputVariable.toJSObject();
      if (!loadedState) {
        logger.error('Load state variable is empty:', inputVariable);
        return;
      }
      try {
        runner.visited = loadedState.visited;
        runner.variables.data = {};
        Object.keys(loadedState.variables).forEach(function (key) {
          const value = loadedState.variables[key];
          runner.variables.set(key, value);
        });
      } catch (e) {
        logger.error('Failed to load state from variable:', inputVariable, e);
      }
    }

    /**
     * Clear the current State of the Dialogue Parser.
     */
    export function clearState() {
      runner.visited = {};
      runner.variables.data = {};
    }
  }
}
