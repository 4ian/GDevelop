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
        '',
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
      .addIncludeFile('Extensions/Multiplayer/multiplayertools.js')
      .setFunctionName('gdjs.multiplayer.openLobbiesWindow');

    extension
      .addAction(
        'EndLobbyGame',
        _('End Lobby Game'),
        _(
          'End the lobby game. This will trigger the "HasGameJustEnded" condition.'
        ),
        _('End the lobby game'),
        '',
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
      .addIncludeFile('Extensions/Multiplayer/multiplayertools.js')
      .setFunctionName('gdjs.multiplayer.endLobbyGame');

    extension
      .addAction(
        'SendMessage',
        _('Send custom message to other players'),
        _(
          "Send a custom message to other players in the lobby, with an automatic retry system if it hasn't been received. Use with the condition 'Message has been received' to know when the message has been properly processed by the server."
        ),
        _('Send message _PARAM0_ to other players with content _PARAM1_'),
        '',
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
      .addIncludeFile('Extensions/Multiplayer/multiplayertools.js')
      .setFunctionName('gdjs.multiplayerMessageManager.sendMessage');

    extension
      .addCondition(
        'IsLobbiesWindowOpen',
        _('Lobbies window is open'),
        _('Check if the lobbies window is open.'),
        _('Lobbies window is open'),
        '',
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
      .addIncludeFile('Extensions/Multiplayer/multiplayertools.js')
      .setFunctionName('gdjs.multiplayer.isLobbiesWindowOpen');

    extension
      .addCondition(
        'HasGameJustStarted',
        _('Lobby game has just started'),
        _('Check if the lobby game has just started.'),
        _('Lobby game has started'),
        '',
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
      .addIncludeFile('Extensions/Multiplayer/multiplayertools.js')
      .setFunctionName('gdjs.multiplayer.hasGameJustStarted');

    extension
      .addCondition(
        'HasGameJustEnded',
        _('Lobby game has just ended'),
        _('Check if the lobby game has just ended.'),
        _('Lobby game has ended'),
        '',
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
      .addIncludeFile('Extensions/Multiplayer/multiplayertools.js')
      .setFunctionName('gdjs.multiplayer.hasGameJustEnded');

    extension
      .addCondition(
        'IsPlayerInLobby',
        _('Player is in a lobby'),
        _('Check if the player is in a lobby.'),
        _('Player is in a lobby'),
        '',
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
      .addIncludeFile('Extensions/Multiplayer/multiplayertools.js')
      .setFunctionName('gdjs.multiplayer.isConnectedToLobby');

    extension
      .addCondition(
        'HasMessageBeenReceived',
        _('Custom message has been received from another player'),
        _(
          'Check if a custom message has been received from another player. Will be true only for one frame.'
        ),
        _('Message _PARAM0_ has been received'),
        '',
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
      .addIncludeFile('Extensions/Multiplayer/multiplayertools.js')
      .setFunctionName('gdjs.multiplayerMessageManager.hasMessageBeenReceived');

    extension
      .addCondition(
        'isPlayerServer',
        _('Player is server'),
        _('Check if the player is the server. (Player 1 is the server)'),
        _('Player is server'),
        '',
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
      .addIncludeFile('Extensions/Multiplayer/multiplayertools.js')
      .setFunctionName('gdjs.multiplayer.isPlayerServer');

    extension
      .addStrExpression(
        'GetMessageData',
        _('Get message data'),
        _(
          'Returns the data received when the specified message was received from another player.'
        ),
        '',
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
      .addIncludeFile('Extensions/Multiplayer/multiplayertools.js')
      .setFunctionName('gdjs.multiplayerMessageManager.getMessageData');

    extension
      .addExpression(
        'NumberOfPlayersInLobby',
        _('Number of players in lobby'),
        _('Get the number of players in the lobby.'),
        '',
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
      .addIncludeFile('Extensions/Multiplayer/multiplayertools.js')
      .setFunctionName('gdjs.multiplayer.getNumberOfPlayersInLobby');

    extension
      .addExpressionAndCondition(
        'number',
        'PlayerNumber',
        _('Player number in lobby'),
        _('the player number in the lobby. (1, 2, ...)'),
        _('the player number in the lobby'),
        '',
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
      .addIncludeFile('Extensions/Multiplayer/multiplayertools.js')
      .useStandardParameters('number', gd.ParameterOptions.makeNewOptions())
      .setFunctionName('gdjs.multiplayer.getPlayerNumber');

    extension
      .addStrExpression(
        'PlayerId',
        _('Player ID in lobby'),
        _('Get the ID of the player in the lobby.'),
        '',
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
      .addIncludeFile('Extensions/Multiplayer/multiplayertools.js')
      .setFunctionName('gdjs.multiplayer.getPlayerId');

    extension
      .addStrExpression(
        'PlayerUsername',
        _('Player username in lobby'),
        _('Get the username of the player in the lobby.'),
        '',
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
      .addIncludeFile('Extensions/Multiplayer/multiplayertools.js')
      .setFunctionName('gdjs.multiplayer.getPlayerUsername');

    // Multiplayer object behavior
    const multiplayerObjectBehavior = new gd.BehaviorJsImplementation();

    multiplayerObjectBehavior.updateProperty = function (
      behaviorContent,
      propertyName,
      newValue
    ) {
      return false;
    };

    multiplayerObjectBehavior.getProperties = function (behaviorContent) {
      const behaviorProperties = new gd.MapStringPropertyDescriptor();
      return behaviorProperties;
    };

    multiplayerObjectBehavior.initializeContent = function (behaviorContent) {};

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
      .addIncludeFile(
        'Extensions/Multiplayer/multiplayerobjectruntimebehavior.js'
      );

    behavior
      .addExpressionAndConditionAndAction(
        'number',
        'playerObjectOwnership',
        _('Player object ownership'),
        _('the player owning the object'),
        _('the player owning the object'),
        '',
        'JsPlatform/Extensions/multiplayer.svg'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'MultiplayerObjectBehavior')
      .useStandardParameters(
        'number',
        gd.ParameterOptions.makeNewOptions().setDescription(
          _('Player number (1 by default)')
        )
      )
      .markAsAdvanced()
      .setFunctionName('setPlayerObjectOwnership')
      .setGetter('getPlayerObjectOwnership');

    behavior
      .addScopedAction(
        'removeObjectOwnership',
        _('Remove object ownership'),
        _(
          'Remove the ownership of the object from the player. It will still be synchronised to other players, but the server owns it.'
        ),
        _('Remove ownership of _PARAM0_'),
        '',
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
