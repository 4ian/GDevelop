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
      .setIcon('JsPlatform/Extensions/authentication.svg');

    extension
      .addAction(
        'OpenGameLobbies',
        _('Open Game Lobbies'),
        _(
          'Open the game lobbies window, where players can join lobbies or see the one they are in.'
        ),
        _('Open the game lobbies'),
        '',
        'JsPlatform/Extensions/authentication.svg',
        'JsPlatform/Extensions/authentication.svg'
      )
      .addCodeOnlyParameter('currentScene', '')
      .setHelpPath('/all-features/multiplayer')
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Multiplayer/multiplayercomponents.js')
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
        'JsPlatform/Extensions/authentication.svg',
        'JsPlatform/Extensions/authentication.svg'
      )
      .setHelpPath('/all-features/multiplayer')
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Multiplayer/multiplayercomponents.js')
      .addIncludeFile('Extensions/Multiplayer/multiplayertools.js')
      .setFunctionName('gdjs.multiplayer.endLobbyGame');

    extension
      .addCondition(
        'IsLobbiesWindowOpen',
        _('Lobbies window is open'),
        _('Check if the lobbies window is open.'),
        _('Lobbies window is open'),
        '',
        'JsPlatform/Extensions/authentication.svg',
        'JsPlatform/Extensions/authentication.svg'
      )
      .addCodeOnlyParameter('currentScene', '')
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Multiplayer/multiplayercomponents.js')
      .addIncludeFile('Extensions/Multiplayer/multiplayertools.js')
      .setFunctionName('gdjs.multiplayer.isLobbiesWindowOpen');

    extension
      .addCondition(
        'HasGameJustStarted',
        _('Lobby game has just started'),
        _('Check if the lobby game has just started.'),
        _('Lobby game has started'),
        '',
        'JsPlatform/Extensions/authentication.svg',
        'JsPlatform/Extensions/authentication.svg'
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Multiplayer/multiplayercomponents.js')
      .addIncludeFile('Extensions/Multiplayer/multiplayertools.js')
      .setFunctionName('gdjs.multiplayer.hasGameJustStarted');

    extension
      .addCondition(
        'HasGameJustEnded',
        _('Lobby game has just ended'),
        _('Check if the lobby game has just ended.'),
        _('Lobby game has ended'),
        '',
        'JsPlatform/Extensions/authentication.svg',
        'JsPlatform/Extensions/authentication.svg'
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Multiplayer/multiplayercomponents.js')
      .addIncludeFile('Extensions/Multiplayer/multiplayertools.js')
      .setFunctionName('gdjs.multiplayer.hasGameJustEnded');

    extension
      .addCondition(
        'IsPlayerInLobby',
        _('Player is in a lobby'),
        _('Check if the player is in a lobby.'),
        _('Player is in a lobby'),
        '',
        'JsPlatform/Extensions/authentication.svg',
        'JsPlatform/Extensions/authentication.svg'
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Multiplayer/multiplayercomponents.js')
      .addIncludeFile('Extensions/Multiplayer/multiplayertools.js')
      .setFunctionName('gdjs.multiplayer.isConnectedToLobby');

    extension
      .addExpression(
        'NumberOfPlayersInLobby',
        _('Number of players in lobby'),
        _('Get the number of players in the lobby.'),
        '',
        'JsPlatform/Extensions/authentication.svg'
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Multiplayer/multiplayercomponents.js')
      .addIncludeFile('Extensions/Multiplayer/multiplayertools.js')
      .setFunctionName('gdjs.multiplayer.getNumberOfPlayersInLobby');

    extension
      .addExpression(
        'CurrentPlayerPositionInLobby',
        _('Current player position in lobby'),
        _('Get the current player position in the lobby. (1, 2, ...)'),
        '',
        'JsPlatform/Extensions/authentication.svg'
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Multiplayer/multiplayercomponents.js')
      .addIncludeFile('Extensions/Multiplayer/multiplayertools.js')
      .setFunctionName('gdjs.multiplayer.getCurrentPlayerPositionInLobby');

    extension
      .addStrExpression(
        'PlayerId',
        _('Player ID in lobby'),
        _('Get the ID of the player in the lobby.'),
        '',
        'JsPlatform/Extensions/authentication.svg'
      )
      .addParameter(
        'number',
        _('The position of the player in the lobby (1, 2, ...)'),
        '',
        false
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Multiplayer/multiplayercomponents.js')
      .addIncludeFile('Extensions/Multiplayer/multiplayertools.js')
      .setFunctionName('gdjs.multiplayer.getPlayerId');

    extension
      .addStrExpression(
        'PlayerUsername',
        _('Player username in lobby'),
        _('Get the username of the player in the lobby.'),
        '',
        'JsPlatform/Extensions/authentication.svg'
      )
      .addParameter(
        'number',
        _('The position of the player in the lobby (1, 2, ...)'),
        '',
        false
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Multiplayer/multiplayercomponents.js')
      .addIncludeFile('Extensions/Multiplayer/multiplayertools.js')
      .setFunctionName('gdjs.multiplayer.getPlayerUsername');

    return extension;
  },
  runExtensionSanityTests: function (gd, extension) {
    return [];
  },
};
