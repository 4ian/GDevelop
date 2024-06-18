//@ts-check
/// <reference path="../JsExtensionTypes.d.ts" />
/**
 * This is a declaration of an extension for GDevelop 5.
 *
 * ℹ️ Changes in this file are watched and automatically imported if the editor
 * is running. You can also manually run `node import-GDJS-Runtime.js` (in newIDE/app/scripts).
 *
 * The file must be named "JsExtension.js", otherwise GDevelop won't load it.
 * ⚠️ If you make a change and the extension is not loaded, open the developer console
 * and search for any errors.
 *
 * More information on https://github.com/4ian/GDevelop/blob/master/newIDE/README-extensions.md
 */

/** @type {ExtensionModule} */
module.exports = {
  createExtension: function (_, gd) {
    const extension = new gd.PlatformExtension();
    extension
      .setExtensionInformation(
        'Multiplayer',
        _('Multiplayer'),
        _('Allow players to connect to lobbies and play together.'),
        'Florian Rival',
        'Open source (MIT License)'
      )
      .setExtensionHelpPath('/all-features/multiplayer')
      .setCategory('Players');
    extension
      .addInstructionOrExpressionGroupMetadata(_('Multiplayer'))
      .setIcon('JsPlatform/Extensions/multiplayer.svg');

    extension
      .addAction(
        'OpenGameLobbies',
        _('Open Game Lobbies'),
        _(
          'Open the game lobbies window, where players can join lobbies or see the one they are in.'
        ),
        _('Open the game lobbies'),
        _('Lobbies'),
        'JsPlatform/Extensions/multiplayer.svg',
        'JsPlatform/Extensions/multiplayer.svg'
      )
      .addCodeOnlyParameter('currentScene', '')
      .setHelpPath('/all-features/multiplayer')
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/P2P/A_peer.js')
      .addIncludeFile('Extensions/P2P/B_p2ptools.js')
      .addIncludeFile(
        'Extensions/PlayerAuthentication/playerauthenticationcomponents.js'
      )
      .addIncludeFile(
        'Extensions/PlayerAuthentication/playerauthenticationtools.js'
      )
      .addIncludeFile('Extensions/Multiplayer/multiplayercomponents.js')
      .addIncludeFile('Extensions/Multiplayer/messageManager.js')
      .addIncludeFile('Extensions/Multiplayer/multiplayerVariablesManager.js')
      .addIncludeFile('Extensions/Multiplayer/multiplayertools.js')
      .setFunctionName('gdjs.multiplayer.openLobbiesWindow');

    extension
      .addAction(
        'ShowLobbiesWindowCloseAction',
        _('Allow players to close the lobbies window'),
        _('Allow players to close the lobbies window. Allowed by default.'),
        _('Allow players to close the lobbies window: _PARAM1_'),
        _('Lobbies'),
        'JsPlatform/Extensions/multiplayer.svg',
        'JsPlatform/Extensions/multiplayer.svg'
      )
      .addCodeOnlyParameter('currentScene', '')
      .addParameter('yesorno', _('Show close button'), '', false)
      .setHelpPath('/all-features/multiplayer')
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/P2P/A_peer.js')
      .addIncludeFile('Extensions/P2P/B_p2ptools.js')
      .addIncludeFile(
        'Extensions/PlayerAuthentication/playerauthenticationcomponents.js'
      )
      .addIncludeFile(
        'Extensions/PlayerAuthentication/playerauthenticationtools.js'
      )
      .addIncludeFile('Extensions/Multiplayer/multiplayercomponents.js')
      .addIncludeFile('Extensions/Multiplayer/messageManager.js')
      .addIncludeFile('Extensions/Multiplayer/multiplayerVariablesManager.js')
      .addIncludeFile('Extensions/Multiplayer/multiplayertools.js')
      .setFunctionName('gdjs.multiplayer.showLobbiesCloseButton');

    extension
      .addAction(
        'EndLobbyGame',
        _('End Lobby Game'),
        _(
          'End the lobby game. This will trigger the "Lobby game has just ended" condition.'
        ),
        _('End the lobby game'),
        _('Lobbies'),
        'JsPlatform/Extensions/multiplayer.svg',
        'JsPlatform/Extensions/multiplayer.svg'
      )
      .setHelpPath('/all-features/multiplayer')
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/P2P/A_peer.js')
      .addIncludeFile('Extensions/P2P/B_p2ptools.js')
      .addIncludeFile(
        'Extensions/PlayerAuthentication/playerauthenticationcomponents.js'
      )
      .addIncludeFile(
        'Extensions/PlayerAuthentication/playerauthenticationtools.js'
      )
      .addIncludeFile('Extensions/Multiplayer/multiplayercomponents.js')
      .addIncludeFile('Extensions/Multiplayer/messageManager.js')
      .addIncludeFile('Extensions/Multiplayer/multiplayerVariablesManager.js')
      .addIncludeFile('Extensions/Multiplayer/multiplayertools.js')
      .setFunctionName('gdjs.multiplayer.endLobbyGame');

    extension
      .addAction(
        'SendMessage',
        _('Send custom message to other players'),
        _(
          "Send a custom message to other players in the lobby, with an automatic retry system if it hasn't been received. Use with the condition 'Message has been received' to know when the message has been properly processed by the host."
        ),
        _('Send message _PARAM0_ to other players with content _PARAM1_'),
        _('Advanced'),
        'JsPlatform/Extensions/multiplayer.svg',
        'JsPlatform/Extensions/multiplayer.svg'
      )
      .setHelpPath('/all-features/multiplayer')
      .addParameter('string', _('Message name'), '', false)
      .addParameter('string', _('Message content'), '', false)
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/P2P/A_peer.js')
      .addIncludeFile('Extensions/P2P/B_p2ptools.js')
      .addIncludeFile(
        'Extensions/PlayerAuthentication/playerauthenticationcomponents.js'
      )
      .addIncludeFile(
        'Extensions/PlayerAuthentication/playerauthenticationtools.js'
      )
      .addIncludeFile('Extensions/Multiplayer/multiplayercomponents.js')
      .addIncludeFile('Extensions/Multiplayer/messageManager.js')
      .addIncludeFile('Extensions/Multiplayer/multiplayerVariablesManager.js')
      .addIncludeFile('Extensions/Multiplayer/multiplayertools.js')
      .setFunctionName('gdjs.multiplayerMessageManager.sendMessage');

    extension
      .addCondition(
        'IsLobbiesWindowOpen',
        _('Lobbies window is open'),
        _('Check if the lobbies window is open.'),
        _('Lobbies window is open'),
        _('Lobbies'),
        'JsPlatform/Extensions/multiplayer.svg',
        'JsPlatform/Extensions/multiplayer.svg'
      )
      .addCodeOnlyParameter('currentScene', '')
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/P2P/A_peer.js')
      .addIncludeFile('Extensions/P2P/B_p2ptools.js')
      .addIncludeFile(
        'Extensions/PlayerAuthentication/playerauthenticationcomponents.js'
      )
      .addIncludeFile(
        'Extensions/PlayerAuthentication/playerauthenticationtools.js'
      )
      .addIncludeFile('Extensions/Multiplayer/multiplayercomponents.js')
      .addIncludeFile('Extensions/Multiplayer/messageManager.js')
      .addIncludeFile('Extensions/Multiplayer/multiplayerVariablesManager.js')
      .addIncludeFile('Extensions/Multiplayer/multiplayertools.js')
      .setFunctionName('gdjs.multiplayer.isLobbiesWindowOpen');

    extension
      .addCondition(
        'HasLobbyGameJustStarted',
        _('Lobby game has just started'),
        _('Check if the lobby game has just started.'),
        _('Lobby game has started'),
        _('Lobbies'),
        'JsPlatform/Extensions/multiplayer.svg',
        'JsPlatform/Extensions/multiplayer.svg'
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/P2P/A_peer.js')
      .addIncludeFile('Extensions/P2P/B_p2ptools.js')
      .addIncludeFile(
        'Extensions/PlayerAuthentication/playerauthenticationcomponents.js'
      )
      .addIncludeFile(
        'Extensions/PlayerAuthentication/playerauthenticationtools.js'
      )
      .addIncludeFile('Extensions/Multiplayer/multiplayercomponents.js')
      .addIncludeFile('Extensions/Multiplayer/messageManager.js')
      .addIncludeFile('Extensions/Multiplayer/multiplayerVariablesManager.js')
      .addIncludeFile('Extensions/Multiplayer/multiplayertools.js')
      .setFunctionName('gdjs.multiplayer.hasLobbyGameJustStarted');

    extension
      .addCondition(
        'IsLobbyGameRunning',
        _('Lobby game is running'),
        _('Check if the lobby game is running.'),
        _('Lobby game is running'),
        _('Lobbies'),
        'JsPlatform/Extensions/multiplayer.svg',
        'JsPlatform/Extensions/multiplayer.svg'
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/P2P/A_peer.js')
      .addIncludeFile('Extensions/P2P/B_p2ptools.js')
      .addIncludeFile(
        'Extensions/PlayerAuthentication/playerauthenticationcomponents.js'
      )
      .addIncludeFile(
        'Extensions/PlayerAuthentication/playerauthenticationtools.js'
      )
      .addIncludeFile('Extensions/Multiplayer/multiplayercomponents.js')
      .addIncludeFile('Extensions/Multiplayer/messageManager.js')
      .addIncludeFile('Extensions/Multiplayer/multiplayerVariablesManager.js')
      .addIncludeFile('Extensions/Multiplayer/multiplayertools.js')
      .setFunctionName('gdjs.multiplayer.isLobbyGameRunning');

    extension
      .addCondition(
        'HasLobbyGameJustEnded',
        _('Lobby game has just ended'),
        _('Check if the lobby game has just ended.'),
        _('Lobby game has ended'),
        _('Lobbies'),
        'JsPlatform/Extensions/multiplayer.svg',
        'JsPlatform/Extensions/multiplayer.svg'
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/P2P/A_peer.js')
      .addIncludeFile('Extensions/P2P/B_p2ptools.js')
      .addIncludeFile(
        'Extensions/PlayerAuthentication/playerauthenticationcomponents.js'
      )
      .addIncludeFile(
        'Extensions/PlayerAuthentication/playerauthenticationtools.js'
      )
      .addIncludeFile('Extensions/Multiplayer/multiplayercomponents.js')
      .addIncludeFile('Extensions/Multiplayer/messageManager.js')
      .addIncludeFile('Extensions/Multiplayer/multiplayerVariablesManager.js')
      .addIncludeFile('Extensions/Multiplayer/multiplayertools.js')
      .setFunctionName('gdjs.multiplayer.hasLobbyGameJustEnded');

    extension
      .addCondition(
        'HasMessageBeenReceived',
        _('Custom message has been received from another player'),
        _(
          'Check if a custom message has been received from another player. Will be true only for one frame.'
        ),
        _('Message _PARAM0_ has been received'),
        _('Advanced'),
        'JsPlatform/Extensions/multiplayer.svg',
        'JsPlatform/Extensions/multiplayer.svg'
      )
      .addParameter('string', _('Message name'), '', false)
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/P2P/A_peer.js')
      .addIncludeFile('Extensions/P2P/B_p2ptools.js')
      .addIncludeFile(
        'Extensions/PlayerAuthentication/playerauthenticationcomponents.js'
      )
      .addIncludeFile(
        'Extensions/PlayerAuthentication/playerauthenticationtools.js'
      )
      .addIncludeFile('Extensions/Multiplayer/multiplayercomponents.js')
      .addIncludeFile('Extensions/Multiplayer/messageManager.js')
      .addIncludeFile('Extensions/Multiplayer/multiplayerVariablesManager.js')
      .addIncludeFile('Extensions/Multiplayer/multiplayertools.js')
      .setFunctionName('gdjs.multiplayerMessageManager.hasMessageBeenReceived');

    extension
      .addCondition(
        'IsPlayerHost',
        _('Player is host'),
        _('Check if the player is the host. (Player 1 is the host)'),
        _('Player is host'),
        _('Lobbies'),
        'JsPlatform/Extensions/multiplayer.svg',
        'JsPlatform/Extensions/multiplayer.svg'
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/P2P/A_peer.js')
      .addIncludeFile('Extensions/P2P/B_p2ptools.js')
      .addIncludeFile(
        'Extensions/PlayerAuthentication/playerauthenticationcomponents.js'
      )
      .addIncludeFile(
        'Extensions/PlayerAuthentication/playerauthenticationtools.js'
      )
      .addIncludeFile('Extensions/Multiplayer/multiplayercomponents.js')
      .addIncludeFile('Extensions/Multiplayer/messageManager.js')
      .addIncludeFile('Extensions/Multiplayer/multiplayerVariablesManager.js')
      .addIncludeFile('Extensions/Multiplayer/multiplayertools.js')
      .setFunctionName('gdjs.multiplayer.isPlayerHost');

    extension
      .addCondition(
        'HasAnyPlayerLeft',
        _('Any player has left'),
        _('Check if any player has left the lobby.'),
        _('Any player has left'),
        _('Lobbies'),
        'JsPlatform/Extensions/multiplayer.svg',
        'JsPlatform/Extensions/multiplayer.svg'
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/P2P/A_peer.js')
      .addIncludeFile('Extensions/P2P/B_p2ptools.js')
      .addIncludeFile(
        'Extensions/PlayerAuthentication/playerauthenticationcomponents.js'
      )
      .addIncludeFile(
        'Extensions/PlayerAuthentication/playerauthenticationtools.js'
      )
      .addIncludeFile('Extensions/Multiplayer/multiplayercomponents.js')
      .addIncludeFile('Extensions/Multiplayer/messageManager.js')
      .addIncludeFile('Extensions/Multiplayer/multiplayerVariablesManager.js')
      .addIncludeFile('Extensions/Multiplayer/multiplayertools.js')
      .setFunctionName('gdjs.multiplayerMessageManager.hasAnyPlayerLeft');

    extension
      .addCondition(
        'HasPlayerLeft',
        _('Player has left'),
        _('Check if the player has left the lobby.'),
        _('Player _PARAM0_ has left'),
        _('Lobbies'),
        'JsPlatform/Extensions/multiplayer.svg',
        'JsPlatform/Extensions/multiplayer.svg'
      )
      .getCodeExtraInformation()
      .addParameter('number', _('Player number'), '', false)
      .setIncludeFile('Extensions/P2P/A_peer.js')
      .addIncludeFile('Extensions/P2P/B_p2ptools.js')
      .addIncludeFile(
        'Extensions/PlayerAuthentication/playerauthenticationcomponents.js'
      )
      .addIncludeFile(
        'Extensions/PlayerAuthentication/playerauthenticationtools.js'
      )
      .addIncludeFile('Extensions/Multiplayer/multiplayercomponents.js')
      .addIncludeFile('Extensions/Multiplayer/messageManager.js')
      .addIncludeFile('Extensions/Multiplayer/multiplayerVariablesManager.js')
      .addIncludeFile('Extensions/Multiplayer/multiplayertools.js')
      .setFunctionName('gdjs.multiplayerMessageManager.hasPlayerLeft');

    extension
      .addStrExpression(
        'MessageData',
        _('Message data'),
        _(
          'Returns the data received when the specified message was received from another player.'
        ),
        _('Advanced'),
        'JsPlatform/Extensions/multiplayer.svg'
      )
      .addParameter('string', _('Message name'), '', false)
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/P2P/A_peer.js')
      .addIncludeFile('Extensions/P2P/B_p2ptools.js')
      .addIncludeFile(
        'Extensions/PlayerAuthentication/playerauthenticationcomponents.js'
      )
      .addIncludeFile(
        'Extensions/PlayerAuthentication/playerauthenticationtools.js'
      )
      .addIncludeFile('Extensions/Multiplayer/multiplayercomponents.js')
      .addIncludeFile('Extensions/Multiplayer/messageManager.js')
      .addIncludeFile('Extensions/Multiplayer/multiplayerVariablesManager.js')
      .addIncludeFile('Extensions/Multiplayer/multiplayertools.js')
      .setFunctionName('gdjs.multiplayerMessageManager.getMessageData');

    extension
      .addExpressionAndCondition(
        'number',
        'PlayersInLobbyCount',
        _('Number of players in lobby'),
        _('the number of players in the lobby'),
        _('the number of players in the lobby'),
        _('Lobbies'),
        'JsPlatform/Extensions/multiplayer.svg'
      )
      .setIncludeFile('Extensions/P2P/A_peer.js')
      .addIncludeFile('Extensions/P2P/B_p2ptools.js')
      .addIncludeFile(
        'Extensions/PlayerAuthentication/playerauthenticationcomponents.js'
      )
      .addIncludeFile(
        'Extensions/PlayerAuthentication/playerauthenticationtools.js'
      )
      .addIncludeFile('Extensions/Multiplayer/multiplayercomponents.js')
      .addIncludeFile('Extensions/Multiplayer/messageManager.js')
      .addIncludeFile('Extensions/Multiplayer/multiplayerVariablesManager.js')
      .addIncludeFile('Extensions/Multiplayer/multiplayertools.js')
      .useStandardParameters('number', gd.ParameterOptions.makeNewOptions())
      .setFunctionName('gdjs.multiplayer.getPlayersInLobbyCount');

    extension
      .addExpressionAndCondition(
        'number',
        'CurrentPlayerNumber',
        _('Current player number in lobby'),
        _('the current player number in the lobby (1, 2, ...)'),
        _('the current player number in the lobby'),
        _('Lobbies'),
        'JsPlatform/Extensions/multiplayer.svg'
      )
      .setIncludeFile('Extensions/P2P/A_peer.js')
      .addIncludeFile('Extensions/P2P/B_p2ptools.js')
      .addIncludeFile(
        'Extensions/PlayerAuthentication/playerauthenticationcomponents.js'
      )
      .addIncludeFile(
        'Extensions/PlayerAuthentication/playerauthenticationtools.js'
      )
      .addIncludeFile('Extensions/Multiplayer/multiplayercomponents.js')
      .addIncludeFile('Extensions/Multiplayer/messageManager.js')
      .addIncludeFile('Extensions/Multiplayer/multiplayerVariablesManager.js')
      .addIncludeFile('Extensions/Multiplayer/multiplayertools.js')
      .useStandardParameters('number', gd.ParameterOptions.makeNewOptions())
      .setFunctionName('gdjs.multiplayer.getCurrentPlayerNumber');

    extension
      .addStrExpression(
        'PlayerUsername',
        _('Player username in lobby'),
        _('Get the username of the player in the lobby.'),
        _('Lobbies'),
        'JsPlatform/Extensions/multiplayer.svg'
      )
      .addParameter(
        'number',
        _('The position of the player in the lobby (1, 2, ...)'),
        '',
        false
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/P2P/A_peer.js')
      .addIncludeFile('Extensions/P2P/B_p2ptools.js')
      .addIncludeFile(
        'Extensions/PlayerAuthentication/playerauthenticationcomponents.js'
      )
      .addIncludeFile(
        'Extensions/PlayerAuthentication/playerauthenticationtools.js'
      )
      .addIncludeFile('Extensions/Multiplayer/multiplayercomponents.js')
      .addIncludeFile('Extensions/Multiplayer/messageManager.js')
      .addIncludeFile('Extensions/Multiplayer/multiplayerVariablesManager.js')
      .addIncludeFile('Extensions/Multiplayer/multiplayertools.js')
      .setFunctionName('gdjs.multiplayer.getPlayerUsername');

    extension
      .addStrExpression(
        'CurrentPlayerUsername',
        _('Current player username in lobby'),
        _('Get the username of the current player in the lobby.'),
        _('Lobbies'),
        'JsPlatform/Extensions/multiplayer.svg'
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/P2P/A_peer.js')
      .addIncludeFile('Extensions/P2P/B_p2ptools.js')
      .addIncludeFile(
        'Extensions/PlayerAuthentication/playerauthenticationcomponents.js'
      )
      .addIncludeFile(
        'Extensions/PlayerAuthentication/playerauthenticationtools.js'
      )
      .addIncludeFile('Extensions/Multiplayer/multiplayercomponents.js')
      .addIncludeFile('Extensions/Multiplayer/messageManager.js')
      .addIncludeFile('Extensions/Multiplayer/multiplayerVariablesManager.js')
      .addIncludeFile('Extensions/Multiplayer/multiplayertools.js')
      .setFunctionName('gdjs.multiplayer.getCurrentPlayerUsername');

    extension
      .addExpression(
        'PlayerPing',
        _('Player ping in lobby'),
        _('Get the ping of the player in the lobby.'),
        _('Lobbies'),
        'JsPlatform/Extensions/multiplayer.svg'
      )
      .addParameter(
        'number',
        _('The position of the player in the lobby (1, 2, ...)'),
        '',
        false
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/P2P/A_peer.js')
      .addIncludeFile('Extensions/P2P/B_p2ptools.js')
      .addIncludeFile(
        'Extensions/PlayerAuthentication/playerauthenticationcomponents.js'
      )
      .addIncludeFile(
        'Extensions/PlayerAuthentication/playerauthenticationtools.js'
      )
      .addIncludeFile('Extensions/Multiplayer/multiplayercomponents.js')
      .addIncludeFile('Extensions/Multiplayer/messageManager.js')
      .addIncludeFile('Extensions/Multiplayer/multiplayerVariablesManager.js')
      .addIncludeFile('Extensions/Multiplayer/multiplayertools.js')
      .setFunctionName('gdjs.multiplayerMessageManager.getPlayerPing');

    extension
      .addExpression(
        'CurrentPlayerPing',
        _('Current player ping in lobby'),
        _('Get the ping of the current player in the lobby.'),
        _('Lobbies'),
        'JsPlatform/Extensions/multiplayer.svg'
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/P2P/A_peer.js')
      .addIncludeFile('Extensions/P2P/B_p2ptools.js')
      .addIncludeFile(
        'Extensions/PlayerAuthentication/playerauthenticationcomponents.js'
      )
      .addIncludeFile(
        'Extensions/PlayerAuthentication/playerauthenticationtools.js'
      )
      .addIncludeFile('Extensions/Multiplayer/multiplayercomponents.js')
      .addIncludeFile('Extensions/Multiplayer/messageManager.js')
      .addIncludeFile('Extensions/Multiplayer/multiplayerVariablesManager.js')
      .addIncludeFile('Extensions/Multiplayer/multiplayertools.js')
      .setFunctionName('gdjs.multiplayerMessageManager.getCurrentPlayerPing');

    extension
      .addExpressionAndConditionAndAction(
        'number',
        'PlayerVariableOwnership',
        _('Player variable ownership'),
        _('the player owning the variable'),
        _('the player owning the variable _PARAM1_'),
        _('Variables'),
        'JsPlatform/Extensions/multiplayer.svg'
      )
      .addCodeOnlyParameter('currentScene', '')
      .addParameter('variable', _('Variable'), '', false)
      .useStandardParameters(
        'number',
        gd.ParameterOptions.makeNewOptions().setDescription(_('Player number'))
      )
      .setIncludeFile('Extensions/P2P/A_peer.js')
      .addIncludeFile('Extensions/P2P/B_p2ptools.js')
      .addIncludeFile(
        'Extensions/PlayerAuthentication/playerauthenticationcomponents.js'
      )
      .addIncludeFile(
        'Extensions/PlayerAuthentication/playerauthenticationtools.js'
      )
      .addIncludeFile('Extensions/Multiplayer/messageManager.js')
      .addIncludeFile('Extensions/Multiplayer/multiplayerVariablesManager.js')
      .addIncludeFile('Extensions/Multiplayer/multiplayertools.js')
      .setFunctionName(
        'gdjs.multiplayerVariablesManager.setPlayerVariableOwnership'
      )
      .setGetter('gdjs.multiplayerVariablesManager.getPlayerVariableOwnership');

    extension
      .addAction(
        'TakeVariableOwnership',
        _('Take ownership of variable'),
        _(
          'Take the ownership of the variable. It will then be synchronized to other players, with the current player as the owner.'
        ),
        _('Take ownership of _PARAM1_'),
        _('Variables'),
        'JsPlatform/Extensions/multiplayer.svg',
        'JsPlatform/Extensions/multiplayer.svg'
      )
      .addCodeOnlyParameter('currentScene', '')
      .addParameter('variable', _('Variable'), '', false)
      .setHelpPath('/all-features/multiplayer')
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/P2P/A_peer.js')
      .addIncludeFile('Extensions/P2P/B_p2ptools.js')
      .addIncludeFile(
        'Extensions/PlayerAuthentication/playerauthenticationcomponents.js'
      )
      .addIncludeFile(
        'Extensions/PlayerAuthentication/playerauthenticationtools.js'
      )
      .addIncludeFile('Extensions/Multiplayer/messageManager.js')
      .addIncludeFile('Extensions/Multiplayer/multiplayerVariablesManager.js')
      .addIncludeFile('Extensions/Multiplayer/multiplayertools.js')
      .setFunctionName(
        'gdjs.multiplayerVariablesManager.takeVariableOwnership'
      );

    extension
      .addAction(
        'RemoveVariableOwnership',
        _('Remove ownership of variable'),
        _(
          'Remove the ownership of the variable. It will still be synchronized to other players, but the host owns it.'
        ),
        _('Remove ownership of _PARAM1_'),
        _('Variables'),
        'JsPlatform/Extensions/multiplayer.svg',
        'JsPlatform/Extensions/multiplayer.svg'
      )
      .addCodeOnlyParameter('currentScene', '')
      .addParameter('variable', _('Variable'), '', false)
      .setHelpPath('/all-features/multiplayer')
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/P2P/A_peer.js')
      .addIncludeFile('Extensions/P2P/B_p2ptools.js')
      .addIncludeFile(
        'Extensions/PlayerAuthentication/playerauthenticationcomponents.js'
      )
      .addIncludeFile(
        'Extensions/PlayerAuthentication/playerauthenticationtools.js'
      )
      .addIncludeFile('Extensions/Multiplayer/messageManager.js')
      .addIncludeFile('Extensions/Multiplayer/multiplayerVariablesManager.js')
      .addIncludeFile('Extensions/Multiplayer/multiplayertools.js')
      .setFunctionName(
        'gdjs.multiplayerVariablesManager.removeVariableOwnership'
      );

    extension
      .addAction(
        'DisableVariableSynchronization',
        _('Disable variable synchronization'),
        _(
          'Disable synchronization of the variable over the network. It will not be sent to other players anymore.'
        ),
        _('Disable synchronization of _PARAM1_'),
        _('Variables'),
        'JsPlatform/Extensions/multiplayer.svg',
        'JsPlatform/Extensions/multiplayer.svg'
      )
      .addCodeOnlyParameter('currentScene', '')
      .addParameter('variable', _('Variable'), '', false)
      .setHelpPath('/all-features/multiplayer')
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/P2P/A_peer.js')
      .addIncludeFile('Extensions/P2P/B_p2ptools.js')
      .addIncludeFile(
        'Extensions/PlayerAuthentication/playerauthenticationcomponents.js'
      )
      .addIncludeFile(
        'Extensions/PlayerAuthentication/playerauthenticationtools.js'
      )
      .addIncludeFile('Extensions/Multiplayer/messageManager.js')
      .addIncludeFile('Extensions/Multiplayer/multiplayerVariablesManager.js')
      .addIncludeFile('Extensions/Multiplayer/multiplayertools.js')
      .setFunctionName(
        'gdjs.multiplayerVariablesManager.disableVariableSynchronization'
      );

    // Multiplayer object behavior
    const multiplayerObjectBehavior = new gd.BehaviorJsImplementation();

    multiplayerObjectBehavior.updateProperty = function (
      behaviorContent,
      propertyName,
      newValue
    ) {
      if (propertyName === 'actionOnPlayerDisconnect') {
        behaviorContent
          .getChild('actionOnPlayerDisconnect')
          .setStringValue(newValue);
        return true;
      }
      if (propertyName === 'playerNumber') {
        const numberValue = newValue === 'Host' ? 0 : parseInt(newValue, 10);
        behaviorContent.getChild('playerNumber').setIntValue(numberValue);
        return true;
      }

      return false;
    };

    multiplayerObjectBehavior.getProperties = function (behaviorContent) {
      const behaviorProperties = new gd.MapStringPropertyDescriptor();

      const playerNumberNumberValue = behaviorContent
        .getChild('playerNumber')
        .getIntValue();
      const playerNumberStringValue =
        playerNumberNumberValue === 0 ? 'Host' : `${playerNumberNumberValue}`;

      behaviorProperties
        .getOrCreate('playerNumber')
        .setValue(playerNumberStringValue)
        .setType('Choice')
        .setLabel(_('Player owning the object'))
        .setDescription(
          _(
            'Who is synchronizing the object to the players. If this is an object controlled by a player, then assign the player number. Otherwise just leave "Host" and the host of the game will synchronize the object to the players. (Note: you can change the ownership of the object during the game with corresponding actions).'
          )
        )
        .addExtraInfo('Host')
        .addExtraInfo('1')
        .addExtraInfo('2')
        .addExtraInfo('3')
        .addExtraInfo('4')
        .addExtraInfo('5')
        .addExtraInfo('6')
        .addExtraInfo('7')
        .addExtraInfo('8');

      behaviorProperties
        .getOrCreate('actionOnPlayerDisconnect')
        .setValue(
          behaviorContent.getChild('actionOnPlayerDisconnect').getStringValue()
        )
        .setType('Choice')
        .setLabel(_('Action when player disconnects'))
        .setAdvanced(true)
        .addExtraInfo('DestroyObject')
        .addExtraInfo('GiveOwnershipToHost')
        .addExtraInfo('DoNothing');

      return behaviorProperties;
    };

    multiplayerObjectBehavior.initializeContent = function (behaviorContent) {
      behaviorContent.addChild('playerNumber').setIntValue(0);
      behaviorContent
        .addChild('actionOnPlayerDisconnect')
        .setStringValue('DestroyObject');
    };

    const sharedData = new gd.BehaviorsSharedData();

    const behavior = extension
      .addBehavior(
        'MultiplayerObjectBehavior',
        _('Multiplayer object'),
        'MultiplayerObject',
        _(
          'Allow the object to be synchronized with other players in the lobby.'
        ),
        '',
        'JsPlatform/Extensions/multiplayer.svg',
        'MultiplayerObjectBehavior',
        // @ts-ignore - TODO: Fix multiplayerBehavior being a BehaviorJsImplementation instead of an Behavior
        multiplayerObjectBehavior,
        sharedData
      )
      .setIncludeFile('Extensions/P2P/A_peer.js')
      .addIncludeFile('Extensions/P2P/B_p2ptools.js')
      .addIncludeFile(
        'Extensions/PlayerAuthentication/playerauthenticationcomponents.js'
      )
      .addIncludeFile(
        'Extensions/PlayerAuthentication/playerauthenticationtools.js'
      )
      .addIncludeFile('Extensions/Multiplayer/messageManager.js')
      .addIncludeFile('Extensions/Multiplayer/multiplayerVariablesManager.js')
      .addIncludeFile('Extensions/Multiplayer/multiplayertools.js')
      .addIncludeFile(
        'Extensions/Multiplayer/multiplayerobjectruntimebehavior.js'
      );

    behavior
      .addExpressionAndConditionAndAction(
        'number',
        'PlayerObjectOwnership',
        _('Player object ownership'),
        _('the player owning the object'),
        _('the player owning the instance'),
        _('Objects'),
        'JsPlatform/Extensions/multiplayer.svg'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'MultiplayerObjectBehavior')
      .useStandardParameters(
        'number',
        gd.ParameterOptions.makeNewOptions().setDescription(_('Player number'))
      )
      .markAsAdvanced()
      .setFunctionName('setPlayerObjectOwnership')
      .setGetter('getPlayerObjectOwnership');

    behavior
      .addScopedCondition(
        'IsObjectOwnedByCurrentPlayer',
        _('Is object owned by current player'),
        _(
          'Check if the object is owned by the current player, as a player or the host.'
        ),
        _('Object _PARAM0_ is owned by current player'),
        _('Objects'),
        'JsPlatform/Extensions/multiplayer.svg',
        'JsPlatform/Extensions/multiplayer.svg'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter(
        'behavior',
        _('Behavior'),
        'MultiplayerObjectBehavior',
        false
      )
      .markAsAdvanced()
      .setFunctionName('isObjectOwnedByCurrentPlayer');

    behavior
      .addScopedAction(
        'TakeObjectOwnership',
        _('Take ownership of object'),
        _(
          'Take the ownership of the object. It will then be synchronized to other players, with the current player as the owner.'
        ),
        _('Take ownership of _PARAM0_'),
        _('Objects'),
        'JsPlatform/Extensions/multiplayer.svg',
        'JsPlatform/Extensions/multiplayer.svg'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter(
        'behavior',
        _('Behavior'),
        'MultiplayerObjectBehavior',
        false
      )
      .markAsAdvanced()
      .setFunctionName('takeObjectOwnership');

    behavior
      .addScopedAction(
        'RemoveObjectOwnership',
        _('Remove object ownership'),
        _(
          'Remove the ownership of the object from the player. It will still be synchronized to other players, but the host owns it.'
        ),
        _('Remove ownership of _PARAM0_'),
        _('Objects'),
        'JsPlatform/Extensions/multiplayer.svg',
        'JsPlatform/Extensions/multiplayer.svg'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter(
        'behavior',
        _('Behavior'),
        'MultiplayerObjectBehavior',
        false
      )
      .markAsAdvanced()
      .setFunctionName('removeObjectOwnership');

    return extension;
  },
  runExtensionSanityTests: function (gd, extension) {
    return [];
  },
};
