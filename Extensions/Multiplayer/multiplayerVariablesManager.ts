namespace gdjs {
  const logger = new gdjs.Logger('Multiplayer');
  const debugLogger = new gdjs.Logger('Multiplayer - Debug');

  export type MultiplayerVariablesManager = ReturnType<
    typeof makeMultiplayerVariablesManager
  >;

  export const makeMultiplayerVariablesManager = () => {
    const variableOwnershipChangesToSyncAtEndOfFrame: {
      [variableNetworkId: string]: {
        variableName: string;
        sceneNetworkId?: string; // If not defined, the variable is global.
        previousVariableOwner: number;
        newVariableOwner: number;
      };
    } = {};

    const addVariableOwnershipChangeToSync = function ({
      variableNetworkId,
      previousVariableOwner,
      newVariableOwner,
    }: {
      variableNetworkId: string;
      previousVariableOwner: number;
      newVariableOwner: number;
    }) {
      // If the variable is already planned to be synchronized, update it with the new owner.
      if (variableOwnershipChangesToSyncAtEndOfFrame[variableNetworkId]) {
        variableOwnershipChangesToSyncAtEndOfFrame[
          variableNetworkId
        ].newVariableOwner = newVariableOwner;
        return;
      }

      variableOwnershipChangesToSyncAtEndOfFrame[variableNetworkId] = {
        variableName: variableNetworkId,
        previousVariableOwner: previousVariableOwner,
        newVariableOwner: newVariableOwner,
      };
    };

    const getVariableTypeAndNameFromNetworkId = function (
      variableNetworkId: string
    ): { type: string; name: string; containerId: string } {
      const parts = variableNetworkId.split('_');
      if (parts.length < 2) {
        throw new Error(
          'Trying to get the variable type from a network id that is not a valid variable network id.'
        );
      }

      return {
        type: parts[0] === 'game' ? 'global' : 'scene',
        name: parts.slice(1).join('_'),
        containerId: parts[0],
      };
    };

    // A variable network id is a combination of the scene network id if it's a scene variable,
    // and the variable name, or "game" and the variable name if it's a global variable.
    const _guessVariableNetworkIdFromSceneAndGame = function (
      variable: gdjs.Variable,
      currentScene: gdjs.RuntimeScene
    ): string | undefined {
      const currentSceneVariables = currentScene.getVariables();

      if (currentSceneVariables.hasVariable(variable)) {
        // Scene variable.
        const sceneNetworkId = currentScene.networkId;
        if (!sceneNetworkId) {
          // Variable is being synchronized but the scene has no networkId yet.
          // It should have one assigned as soon as the scene is synchronized.
          // Skipping.
          debugLogger.info(
            'Variable is being synchronized but the scene has no networkId yet.'
          );
          return;
        }

        const variableName = currentSceneVariables.getVariableNameInContainerByLoopingThroughAllVariables(
          variable
        );

        if (!variableName) {
          logger.error('Variable is being synchronized but has no name.');
          return;
        }

        return sceneNetworkId + '_' + variableName;
      }

      const runtimeGame = currentScene.getGame();
      const runtimeGameVariables = runtimeGame.getVariables();

      if (runtimeGameVariables.hasVariable(variable)) {
        // Global variable.

        // TODO: prevent returning a networkID if this is not a root variable.

        const variableName = runtimeGameVariables.getVariableNameInContainerByLoopingThroughAllVariables(
          variable
        );
        if (!variableName) {
          logger.error('Variable is being synchronized but has no name.');
          return;
        }

        return 'game_' + variableName;
      }

      logger.error(
        'Trying to modify synchronization of a variable that is not a scene or global variable.'
      );
      return;
    };

    const getPlayerVariableOwnership = function (
      runtimeScene: gdjs.RuntimeScene,
      variable: gdjs.Variable
    ) {
      return variable.getPlayerOwnership();
    };

    const setPlayerVariableOwnership = function (
      runtimeScene: gdjs.RuntimeScene,
      variable: gdjs.Variable,
      newVariablePlayerNumber: number
    ) {
      debugLogger.info(
        `Setting ownership of variable to player ${newVariablePlayerNumber}.`
      );
      if (newVariablePlayerNumber < 0) {
        logger.error(
          'Invalid player number (' +
            newVariablePlayerNumber +
            ') when setting ownership of a variable.'
        );
        return;
      }
      const previousVariablePlayerNumber = variable.getPlayerOwnership();
      if (previousVariablePlayerNumber === null) {
        logger.error(
          'Cannot change ownership of a variable that is not synchronized.'
        );
        return;
      }

      variable.setPlayerOwnership(newVariablePlayerNumber);
      const currentPlayerNumber = gdjs.multiplayer.getCurrentPlayerNumber();

      // If the lobby game is not running, do not try to update the ownership over the network,
      // as the game may update variable ownerships before the lobby game starts.
      if (!gdjs.multiplayer.isLobbyGameRunning()) {
        return;
      }

      if (newVariablePlayerNumber !== currentPlayerNumber) {
        // If we are not the new owner, we should not send a message to the host to change the ownership.
        // Just return and wait to receive an update message to reconcile the variable.
        return;
      }

      const variableNetworkId = _guessVariableNetworkIdFromSceneAndGame(
        variable,
        runtimeScene
      );
      const sceneNetworkId = runtimeScene.networkId;
      if (!variableNetworkId || !sceneNetworkId) {
        // An error was already logged.
        return;
      }

      const { type: variableType } = getVariableTypeAndNameFromNetworkId(
        variableNetworkId
      );

      debugLogger.info(
        `Adding variable to be synchronized: ${variableNetworkId} (type: ${variableType}) from owner ${previousVariablePlayerNumber} to ${newVariablePlayerNumber}.`
      );
      addVariableOwnershipChangeToSync({
        variableNetworkId,
        previousVariableOwner: previousVariablePlayerNumber,
        newVariableOwner: newVariablePlayerNumber,
      });
    };

    const takeVariableOwnership = function (
      runtimeScene: gdjs.RuntimeScene,
      variable: gdjs.Variable
    ) {
      const currentPlayerNumber = gdjs.multiplayer.getCurrentPlayerNumber();
      setPlayerVariableOwnership(runtimeScene, variable, currentPlayerNumber);
    };

    const removeVariableOwnership = function (
      runtimeScene: gdjs.RuntimeScene,
      variable: gdjs.Variable
    ) {
      setPlayerVariableOwnership(runtimeScene, variable, 0);
    };

    const disableVariableSynchronization = function (
      runtimeScene: gdjs.RuntimeScene,
      variable: gdjs.Variable
    ) {
      variable.disableSynchronization();
    };

    const handleChangeVariableOwnerMessagesToSend = function () {
      if (
        !gdjs.multiplayer.isLobbyGameRunning() ||
        !gdjs.multiplayer.isReadyToSendOrReceiveGameUpdateMessages()
      ) {
        return;
      }

      const currentPlayerNumber = gdjs.multiplayer.getCurrentPlayerNumber();

      for (const variableNetworkId in variableOwnershipChangesToSyncAtEndOfFrame) {
        const variableData =
          variableOwnershipChangesToSyncAtEndOfFrame[variableNetworkId];
        const {
          messageName,
          messageData,
        } = gdjs.multiplayerMessageManager.createChangeVariableOwnerMessage({
          variableNetworkId,
          variableOwner: variableData.previousVariableOwner,
          newVariableOwner: variableData.newVariableOwner,
        });
        // Before sending the change owner message, if we are becoming the new owner,
        // we want to ensure this message is acknowledged, by everyone we're connected to.
        if (variableData.newVariableOwner === currentPlayerNumber) {
          const otherPeerIds = gdjs.multiplayerPeerJsHelper.getAllPeers();
          const variableOwnerChangedMessageName = gdjs.multiplayerMessageManager.createVariableOwnerChangedMessageNameFromChangeVariableOwnerMessage(
            messageName
          );
          gdjs.multiplayerMessageManager.addExpectedMessageAcknowledgement({
            originalMessageName: messageName,
            originalData: messageData,
            expectedMessageName: variableOwnerChangedMessageName,
            otherPeerIds,
            // If we are not the host and don't receive an acknowledgement from the host, we should cancel the ownership change.
            shouldCancelMessageIfTimesOut: currentPlayerNumber !== 1,
          });
        }

        debugLogger.info('Sending change owner message', messageName);
        const connectedPeerIds = gdjs.multiplayerPeerJsHelper.getAllPeers();
        gdjs.multiplayerMessageManager.sendDataTo(
          connectedPeerIds,
          messageName,
          messageData
        );

        // Remove the variable from the list of variables ownership changes to sync.
        delete variableOwnershipChangesToSyncAtEndOfFrame[variableNetworkId];
      }
    };

    return {
      getVariableTypeAndNameFromNetworkId,
      getPlayerVariableOwnership,
      setPlayerVariableOwnership,
      takeVariableOwnership,
      removeVariableOwnership,
      disableVariableSynchronization,
      handleChangeVariableOwnerMessagesToSend,
    };
  };

  /**
   * The MultiplayerVariablesManager used by the game.
   */
  export let multiplayerVariablesManager = makeMultiplayerVariablesManager();
}
