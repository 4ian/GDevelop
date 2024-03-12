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
        'Steamworks',
        _('Steamworks (Steam) (experimental)'),
        _("Adds integrations for Steam's Steamworks game development SDK."),
        'Arthur Pacaud (arthuro555)',
        'MIT'
      )
      .setCategory('Third-party');

    extension
      .addInstructionOrExpressionGroupMetadata(
        _('Steamworks (Steam) (experimental)')
      )
      .setIcon('JsPlatform/Extensions/steam.svg');

    extension
      .registerProperty('AppID')
      .setLabel(_('Steam App ID'))
      .setDescription(
        'Your Steam app ID, obtained from the Steamworks partner website.'
      )
      .setType('number');

    extension
      .registerProperty('RequireSteam')
      .setDescription(_('Require Steam to launch the game'))
      .setType('boolean');

    extension
      .addDependency()
      .setName('Steamworks')
      .setDependencyType('npm')
      .setExportName('steamworks.js')
      // Note: Updating steamworks.js here only updates it for the game builds,
      // also update newIDE/electron-app/app/package.json to update it for previews as well!
      .setVersion('0.3.1');

    extension
      .addAction(
        'ClaimAchievement',
        _('Claim achievement'),
        _(
          "Marks a Steam achievement as obtained. Steam will pop-up a notification with the achievement's data defined on the Steamworks partner website."
        ),
        _('Claim steam achievement _PARAM0_'),
        _('Achievements'),
        'JsPlatform/Extensions/steam.svg',
        'JsPlatform/Extensions/steam.svg'
      )
      .addParameter(
        'identifier',
        _('Achievement ID'),
        'SteamAchievement',
        false
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Steamworks/steamworkstools.js')
      .setFunctionName('gdjs.steamworks.claimAchievement');

    extension
      .addAction(
        'UnclaimAchievement',
        _('Unclaim achievement'),
        _("Removes a player's Steam achievement."),
        _('Unclaim Steam achievement _PARAM0_'),
        _('Achievements'),
        'JsPlatform/Extensions/steam.svg',
        'JsPlatform/Extensions/steam.svg'
      )
      .addParameter(
        'identifier',
        _('Achievement ID'),
        'SteamAchievement',
        false
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Steamworks/steamworkstools.js')
      .setFunctionName('gdjs.steamworks.unclaimAchievement');

    extension
      .addCondition(
        'HasAchievement',
        _('Has achievement'),
        _("Checks if a player owns one of this game's Steam achievement."),
        _('Player has previously claimed the Steam achievement _PARAM0_'),
        _('Achievements'),
        'JsPlatform/Extensions/steam.svg',
        'JsPlatform/Extensions/steam.svg'
      )
      .addParameter(
        'identifier',
        _('Achievement ID'),
        'SteamAchievement',
        false
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Steamworks/steamworkstools.js')
      .setFunctionName('gdjs.steamworks.hasAchievement');

    extension
      .addStrExpression(
        'SteamID',
        _('Steam ID'),
        _(
          `The player's unique Steam ID number. Note that it is too big a number to load correctly as a traditional number ("floating point number"), and must be used as a string.`
        ),
        _('Player'),
        'JsPlatform/Extensions/steam.svg'
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Steamworks/steamworkstools.js')
      .setFunctionName('gdjs.steamworks.getSteamId');

    extension
      .addStrExpression(
        'Name',
        _('Name'),
        _("The player's registered name on Steam."),
        _('Player'),
        'JsPlatform/Extensions/steam.svg'
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Steamworks/steamworkstools.js')
      .setFunctionName('gdjs.steamworks.getName');

    extension
      .addStrExpression(
        'CountryCode',
        _('Country code'),
        _("The player's country represented as its two-letter code."),
        _('Player'),
        'JsPlatform/Extensions/steam.svg'
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Steamworks/steamworkstools.js')
      .setFunctionName('gdjs.steamworks.getCountry');

    extension
      .addExpression(
        'Level',
        _('Steam Level'),
        _("Obtains the player's Steam level"),
        _('Player'),
        'JsPlatform/Extensions/steam.svg'
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Steamworks/steamworkstools.js')
      .setFunctionName('gdjs.steamworks.getLevel');

    extension
      .addAction(
        'SetRichPresence',
        _('Steam rich presence'),
        _(
          "Changes an attribute of Steam's rich presence. Allows other player to see exactly what the player's currently doing in the game."
        ),
        _('Set steam rich presence attribute _PARAM0_ to _PARAM1_'),
        _('Rich presence'),
        'JsPlatform/Extensions/steam.svg',
        'JsPlatform/Extensions/steam.svg'
      )
      .addParameter(
        'stringWithSelector',
        'The attribute to change',
        JSON.stringify([
          'status',
          'connect',
          'steam_display',
          'steam_player_group',
          'steam_player_group_size',
        ]),
        /*parameterIsOptional=*/ false
      )
      .setParameterLongDescription(
        '[Click here](https://partner.steamgames.com/doc/api/ISteamFriends#SetRichPresence) to find out more about the different default rich-presence attributes.'
      )
      .addParameter(
        'string',
        'The new value for that attribute',
        '',
        /*parameterIsOptional=*/ false
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Steamworks/steamworkstools.js')
      .setFunctionName('gdjs.steamworks.setRichPresence');

    extension
      .addCondition(
        'IsSteamworksLoaded',
        _('Is Steamworks Loaded'),
        _(
          'Checks whether the Steamworks SDK could be properly loaded. If steam is not installed, the game is not running on PC, or for any other reason Steamworks features will not be able to function, this function will trigger allowing you to disable functionality that relies on Steamworks.'
        ),
        _('Steamworks is properly loaded'),
        _('Utilities'),
        'JsPlatform/Extensions/steam.svg',
        'JsPlatform/Extensions/steam.svg'
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Steamworks/steamworkstools.js')
      .setFunctionName('gdjs.steamworks.isSteamworksProperlyLoaded');

    extension
      .addExpression(
        'AppID',
        _('Steam AppID'),
        _(
          "Obtains the game's Steam app ID, as declared in the games properties."
        ),
        _('Utilities'),
        'JsPlatform/Extensions/steam.svg'
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Steamworks/steamworkstools.js')
      .setFunctionName('gdjs.steamworks.getAppID');

    extension
      .addExpression(
        'ServerTime',
        _('Current time (from the Steam servers)'),
        _(
          'Obtains the real current time from the Steam servers, which cannot be faked by changing the system time.'
        ),
        _('Utilities'),
        'JsPlatform/Extensions/steam.svg'
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Steamworks/steamworkstools.js')
      .setFunctionName('gdjs.steamworks.getServerRealTime');

    extension
      .addCondition(
        'IsOnSteamDeck',
        _('Is on Steam Deck'),
        _(
          'Checks whether the game is currently running on a Steam Deck or not.'
        ),
        _('Game is running on a Steam Deck'),
        _('Utilities'),
        'JsPlatform/Extensions/steam.svg',
        'JsPlatform/Extensions/steam.svg'
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Steamworks/steamworkstools.js')
      .setFunctionName('gdjs.steamworks.isOnSteamDeck');

    extension
      .addAction(
        'CreateLobby',
        _('Create a lobby'),
        _(
          'Creates a new steam lobby owned by the player, for other players to join.'
        ),
        _(
          'Create a lobby visible to _PARAM0_ with max. _PARAM1_ players (store results in _PARAM2_)'
        ),
        _('Matchmaking'),
        'JsPlatform/Extensions/steam.svg',
        'JsPlatform/Extensions/steam.svg'
      )
      .addParameter(
        'stringWithSelector',
        'Visibility',
        JSON.stringify(['Private', 'FriendsOnly', 'Public', 'Invisible']),
        false
      )
      .setParameterLongDescription(
        `[Click here](https://partner.steamgames.com/doc/api/ISteamMatchmaking#ELobbyType) to learn more about the different lobby visibilities.`
      )
      .addParameter('expression', 'Maximal player count', '', false)
      .addParameter('scenevar', 'Store results in', '', true)
      .setParameterLongDescription(
        `The variable will be set to the ID of the lobby if successful, otherwise to "failure".`
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Steamworks/steamworkstools.js')
      .setAsyncFunctionName('gdjs.steamworks.createLobby');

    extension
      .addAction(
        'GetLobbies',
        _('Get a list of lobbies'),
        _(
          'Fills an array variable with a list of lobbies for the player to join.'
        ),
        _('Fill _PARAM0_ with a list of lobbies'),
        _('Matchmaking'),
        'JsPlatform/Extensions/steam.svg',
        'JsPlatform/Extensions/steam.svg'
      )
      .addParameter('scenevar', 'Array to fill with lobbies', '', false)
      .setParameterLongDescription(
        `The variable will be set to an array of the IDs of the lobbies if they could be successfully obtained. If they could not be obtained, it is set to the string "failure".`
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Steamworks/steamworkstools.js')
      .setAsyncFunctionName('gdjs.steamworks.getLobbiesList');

    extension
      .addAction(
        'JoinLobby',
        _('Join a lobby (by ID)'),
        _('Join a Steam lobby, using its lobby ID.'),
        _('Join lobby _PARAM0_ (store result in _PARAM1_)'),
        _('Matchmaking'),
        'JsPlatform/Extensions/steam.svg',
        'JsPlatform/Extensions/steam.svg'
      )
      .addParameter('string', 'Lobby ID', '', false)
      .addParameter('scenevar', 'Store results in', '', true)
      .setParameterLongDescription(
        `The variable will be set to the ID of the lobby if successful, otherwise to "failure".`
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Steamworks/steamworkstools.js')
      .setAsyncFunctionName('gdjs.steamworks.joinLobby');

    extension
      .addAction(
        'LeaveLobby',
        _('Leave current lobby'),
        _('Marks the player as having left the current lobby.'),
        _('Leave the current lobby'),
        _('Matchmaking/Current lobby'),
        'JsPlatform/Extensions/steam.svg',
        'JsPlatform/Extensions/steam.svg'
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Steamworks/steamworkstools.js')
      .setFunctionName('gdjs.steamworks.leaveCurrentLobby');

    extension
      .addAction(
        'OpenInviteDialogue',
        _('Open invite dialogue'),
        _(
          'Opens the steam invitation dialogue to let the player invite their Steam friends to the current lobby. Only works if the player is currently in a lobby.'
        ),
        _('Open lobby invitation dialogue'),
        _('Matchmaking/Current lobby'),
        'JsPlatform/Extensions/steam.svg',
        'JsPlatform/Extensions/steam.svg'
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Steamworks/steamworkstools.js')
      .setFunctionName(
        'gdjs.steamworks.openDialogForInvitingUsersToTheCurrentLobby'
      );

    extension
      .addAction(
        'SetCurrentLobbyAttribute',
        _('Set a lobby attribute'),
        _(
          'Sets an attribute of the current lobby. Attributes are readable to anyone that can see the lobby. They can contain public information about the lobby like a description, or for example a P2P ID for knowing where to connect to join this lobby.'
        ),
        _(
          'Set current lobby attribute _PARAM0_ to _PARAM1_ (store result in _PARAM2_)'
        ),
        _('Matchmaking/Current lobby'),
        'JsPlatform/Extensions/steam.svg',
        'JsPlatform/Extensions/steam.svg'
      )
      .addParameter(
        'identifier',
        'The attribute to set',
        'SteamLobbyAttribute',
        false
      )
      .addParameter('string', 'Value to set the attribute to', '', false)
      .addParameter('scenevar', 'Variable where to store the result', '', true)
      .setParameterLongDescription(
        'The variable will be set to true if the attribute was successfully set and to false if it could not be set.'
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Steamworks/steamworkstools.js')
      .setFunctionName('gdjs.steamworks.setCurrentLobbyAttribute');

    extension
      .addAction(
        'SetCurrentLobbyJoinability',
        _('Set the lobby joinability'),
        _('Sets whether other users can join the current lobby or not.'),
        _('Make current lobby joinable: _PARAM0_ (store result in _PARAM1_)'),
        _('Matchmaking/Current lobby'),
        'JsPlatform/Extensions/steam.svg',
        'JsPlatform/Extensions/steam.svg'
      )
      .addParameter('yesorno', 'Should the lobby be joinable?', '', false)
      .addParameter('scenevar', 'Variable where to store the result', '', true)
      .setParameterLongDescription(
        'The variable will be set to true if the joinability was successfully set and to false if it could not be changed.'
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Steamworks/steamworkstools.js')
      .setFunctionName('gdjs.steamworks.setCurrentLobbyJoinability');

    extension
      .addAction(
        'GetCurrentLobbyMembers',
        _("Get the lobby's members"),
        _('Gets the Steam ID of all players in the current lobby.'),
        _('Store the array of all players in _PARAM0_'),
        _('Matchmaking/Current lobby'),
        'JsPlatform/Extensions/steam.svg',
        'JsPlatform/Extensions/steam.svg'
      )
      .addParameter(
        'scenevar',
        'Variable where to store the player list',
        '',
        false
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Steamworks/steamworkstools.js')
      .setFunctionName('gdjs.steamworks.getCurrentLobbyMembersList');

    extension
      .addAction(
        'GetLobbyMembers',
        _("Get a lobby's members"),
        _('Gets the Steam ID of all players in a lobby.'),
        _('Store the array of all players of lobby _PARAM0_ in _PARAM1_'),
        _('Matchmaking'),
        'JsPlatform/Extensions/steam.svg',
        'JsPlatform/Extensions/steam.svg'
      )
      .addParameter('string', 'The lobby ID', '', false)
      .addParameter(
        'scenevar',
        'Variable where to store the player list',
        '',
        false
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Steamworks/steamworkstools.js')
      .setFunctionName('gdjs.steamworks.getLobbyMembersList');

    extension
      .addStrExpression(
        'CurrentLobbyID',
        _("Current lobby's ID"),
        _(
          'The ID of the current lobby, useful for letting other players join it.'
        ),
        _('Matchmaking/Current lobby'),
        'JsPlatform/Extensions/steam.svg'
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Steamworks/steamworkstools.js')
      .setFunctionName('gdjs.steamworks.getCurrentLobbyId');

    extension
      .addStrExpression(
        'CurrentLobbyAttribute',
        _('Attribute of the lobby'),
        _("Obtains the value of one of the current lobby's attributes."),
        _('Matchmaking/Current lobby'),
        'JsPlatform/Extensions/steam.svg'
      )
      .addParameter(
        'identifier',
        'The attribute to read',
        'sceneSteamLobbyAttribute',
        false
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Steamworks/steamworkstools.js')
      .setFunctionName('gdjs.steamworks.getCurrentLobbyAttribute');

    extension
      .addExpression(
        'CurrentLobbyMemberCount',
        _('Member count of the lobby'),
        _("Obtains the current lobby's member count."),
        _('Matchmaking/Current lobby'),
        'JsPlatform/Extensions/steam.svg'
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Steamworks/steamworkstools.js')
      .setFunctionName('gdjs.steamworks.getCurrentLobbyMemberCount');

    extension
      .addExpression(
        'CurrentLobbyMemberLimit',
        _('Member limit of the lobby'),
        _("Obtains the current lobby's maximum member limit."),
        _('Matchmaking/Current lobby'),
        'JsPlatform/Extensions/steam.svg'
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Steamworks/steamworkstools.js')
      .setFunctionName('gdjs.steamworks.getCurrentLobbyMemberLimit');

    extension
      .addStrExpression(
        'CurrentLobbyOwner',
        _('Owner of the lobby'),
        _('Obtains the Steam ID of the user that owns the current lobby.'),
        _('Matchmaking/Current lobby'),
        'JsPlatform/Extensions/steam.svg'
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Steamworks/steamworkstools.js')
      .setFunctionName('gdjs.steamworks.getCurrentLobbyOwner');

    extension
      .addStrExpression(
        'LobbyAttribute',
        _('Attribute of a lobby'),
        _("Obtains the value of one of a lobby's attributes."),
        _('Matchmaking'),
        'JsPlatform/Extensions/steam.svg'
      )
      .addParameter('string', 'The ID of the lobby', '', false)
      .addParameter(
        'identifier',
        'The attribute to read',
        'sceneSteamLobbyAttribute',
        false
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Steamworks/steamworkstools.js')
      .setFunctionName('gdjs.steamworks.getLobbyAttribute');

    extension
      .addExpression(
        'LobbyMemberCount',
        _('Member count of a lobby'),
        _("Obtains a lobby's member count."),
        _('Matchmaking'),
        'JsPlatform/Extensions/steam.svg'
      )
      .addParameter('string', 'The ID of the lobby', '', false)
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Steamworks/steamworkstools.js')
      .setFunctionName('gdjs.steamworks.getLobbyMemberCount');

    extension
      .addExpression(
        'LobbyMemberLimit',
        _('Member limit of a lobby'),
        _("Obtains a lobby's maximum member limit."),
        _('Matchmaking'),
        'JsPlatform/Extensions/steam.svg'
      )
      .addParameter('string', 'The ID of the lobby', '', false)
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Steamworks/steamworkstools.js')
      .setFunctionName('gdjs.steamworks.getLobbyMemberLimit');

    extension
      .addStrExpression(
        'LobbyOwner',
        _('Owner of a lobby'),
        _('Obtains the Steam ID of the user that owns a lobby.'),
        _('Matchmaking'),
        'JsPlatform/Extensions/steam.svg'
      )
      .addParameter('string', 'The ID of the lobby', '', false)
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Steamworks/steamworkstools.js')
      .setFunctionName('gdjs.steamworks.getLobbyOwner');

    extension
      .addCondition(
        'IsPlayerOwningApp',
        _('Player owns an application'),
        _('Checks if the current user owns an application on Steam.'),
        _('App _PARAM0_ owned on Steam'),
        _('Steam Apps'),
        'JsPlatform/Extensions/steam.svg',
        'JsPlatform/Extensions/steam.svg'
      )
      .addParameter(
        'identifier',
        'The Steam App ID of the application',
        'SteamAppID',
        false
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Steamworks/steamworkstools.js')
      .setFunctionName('gdjs.steamworks.isAppOwned');

    extension
      .addCondition(
        'HasPlayerInstalledApp',
        _('Player installed an application'),
        _(
          'Checks if the current user has a Steam application currently installed.'
        ),
        _('App _PARAM0_ installed from Steam'),
        _('Steam Apps'),
        'JsPlatform/Extensions/steam.svg',
        'JsPlatform/Extensions/steam.svg'
      )
      .addParameter(
        'identifier',
        'The Steam App ID of the application',
        'SteamAppID',
        false
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Steamworks/steamworkstools.js')
      .setFunctionName('gdjs.steamworks.isAppInstalled');

    extension
      .addCondition(
        'HasPlayerInstalledDLC',
        _('Player installed DLC'),
        _('Checks if the current user has installed a piece of DLC.'),
        _('DLC _PARAM0_ installed from Steam'),
        _('Steam Apps'),
        'JsPlatform/Extensions/steam.svg',
        'JsPlatform/Extensions/steam.svg'
      )
      .addParameter(
        'identifier',
        'The Steam App ID of the DLC',
        'SteamAppID',
        false
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Steamworks/steamworkstools.js')
      .setFunctionName('gdjs.steamworks.isDLCInstalled');

    extension
      .addStrExpression(
        'InstalledApplicationPath',
        _('Get installed app path'),
        _('Gets the path to an installed Steam application.'),
        _('Steam Apps'),
        'JsPlatform/Extensions/steam.svg'
      )
      .addParameter(
        'identifier',
        'The Steam App ID of the application',
        'SteamAppID',
        false
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Steamworks/steamworkstools.js')
      .setFunctionName('gdjs.steamworks.getAppInstallDirectory');

    extension
      .addCondition(
        'IsPlayerVACBanned',
        _('Player has a VAC ban'),
        _('Checks if the current user has a VAC ban on their account.'),
        _('Player has a VAC ban'),
        _('Player'),
        'JsPlatform/Extensions/steam.svg',
        'JsPlatform/Extensions/steam.svg'
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Steamworks/steamworkstools.js')
      .setFunctionName('gdjs.steamworks.isVacBanned');

    extension
      .addCondition(
        'IsPlayerLowViolence',
        _('Player cannot be exposed to violence'),
        _(
          'Checks if the current user may only be exposed to low violence, due to e.g. their age and content restrictions in their country.'
        ),
        _('Player cannot be exposed to violence'),
        _('Player'),
        'JsPlatform/Extensions/steam.svg',
        'JsPlatform/Extensions/steam.svg'
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Steamworks/steamworkstools.js')
      .setFunctionName('gdjs.steamworks.isLowViolence');

    extension
      .addCondition(
        'HasPlayerBoughtGame',
        _('Player bought the game'),
        _(
          'Checks if the current user actually bought & owns the game. If the "Require Steam" checkbox has been checked in the game properties, this will always be true as Steam will not allow to launch the game if it is not owned. Can be used to display an anti-piracy message instead of straight up blocking the launch of the game.'
        ),
        _('Player bought the game'),
        _('Player'),
        'JsPlatform/Extensions/steam.svg',
        'JsPlatform/Extensions/steam.svg'
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Steamworks/steamworkstools.js')
      .setFunctionName('gdjs.steamworks.userBoughtTheGame');

    extension
      .addStrExpression(
        'GameLanguage',
        _('Game language'),
        _('Gets the language the user set in the Steam game properties.'),
        _('Game properties'),
        'JsPlatform/Extensions/steam.svg'
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Steamworks/steamworkstools.js')
      .setFunctionName('gdjs.steamworks.currentGameLanguage');

    extension
      .addStrExpression(
        'BetaName',
        _('Current beta name'),
        _(
          'Gets the name of the beta the player enrolled to in the Steam game properties.'
        ),
        _('Game properties'),
        'JsPlatform/Extensions/steam.svg'
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Steamworks/steamworkstools.js')
      .setFunctionName('gdjs.steamworks.currentBetaName');

    extension
      .addExpression(
        'AppBuildID',
        _('Current app build ID'),
        _('Gets the ID of the current app build.'),
        _('Game properties'),
        'JsPlatform/Extensions/steam.svg'
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Steamworks/steamworkstools.js')
      .setFunctionName('gdjs.steamworks.getBuildId');

    extension
      .addCondition(
        'IsDigitalActionPressed',
        _('Digital action activated'),
        _(
          'Triggers when a digital action (a button that is either pressed or not) of a Steam Input controller has been triggered.'
        ),
        _('Digital action _PARAM1_ of controller _PARAM0_ has been activated'),
        _('Input'),
        'JsPlatform/Extensions/steam.svg',
        'JsPlatform/Extensions/steam.svg'
      )
      .addParameter('expression', 'Controller number', '', false)
      .addParameter('identifier', 'ActionName', 'SteamInputAction', false)
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Steamworks/steamworkstools.js')
      .addIncludeFile('Extensions/Steamworks/Z_steamworksinputtools.js')
      .setFunctionName('gdjs.steamworks.isDigitalActionPressed');

    extension
      .addAction(
        'ActivateActionSet',
        _('Activate an action set'),
        _('Activates a Steam Input action set of a Steam Input controller.'),
        _('Activate action set _PARAM1_ of controller _PARAM0_'),
        _('Input'),
        'JsPlatform/Extensions/steam.svg',
        'JsPlatform/Extensions/steam.svg'
      )
      .addParameter('expression', 'Controller number', '', false)
      .addParameter('identifier', 'ActionName', 'SteamInputActionSet', false)
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Steamworks/steamworkstools.js')
      .addIncludeFile('Extensions/Steamworks/Z_steamworksinputtools.js')
      .setFunctionName('gdjs.steamworks.isDigitalActionPressed');

    extension
      .addExpression(
        'ControllerCount',
        _('Controller count'),
        _('The amount of connected Steam Input controllers.'),
        _('Input'),
        'JsPlatform/Extensions/steam.svg'
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Steamworks/steamworkstools.js')
      .addIncludeFile('Extensions/Steamworks/Z_steamworksinputtools.js')
      .setFunctionName('gdjs.steamworks.getControllerCount');

    extension
      .addExpression(
        'ActionVectorX',
        _('Analog X-Action vector'),
        _(
          'The action vector of a Steam Input analog joystick on the X-axis, from 1 (all right) to -1 (all left).'
        ),
        _('Input'),
        'JsPlatform/Extensions/steam.svg'
      )
      .addParameter('expression', 'Controller number', '', false)
      .addParameter('identifier', 'ActionName', 'SteamInputAction', false)
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Steamworks/steamworkstools.js')
      .addIncludeFile('Extensions/Steamworks/Z_steamworksinputtools.js')
      .setFunctionName('gdjs.steamworks.getAnalogActionVectorX');

    extension
      .addExpression(
        'ActionVectorY',
        _('Analog Y-Action vector'),
        _(
          'The action vector of a Steam Input analog joystick on the Y-axis, from 1 (all up) to -1 (all down).'
        ),
        _('Input'),
        'JsPlatform/Extensions/steam.svg'
      )
      .addParameter('expression', 'Controller number', '', false)
      .addParameter('identifier', 'ActionName', 'SteamInputAction', false)
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Steamworks/steamworkstools.js')
      .addIncludeFile('Extensions/Steamworks/Z_steamworksinputtools.js')
      .setFunctionName('gdjs.steamworks.getAnalogActionVectorY');

    extension
      .addCondition(
        'IsSteamCloudEnabled',
        _('Is Steam Cloud enabled?'),
        _(
          'Checks whether steam cloud has been enabled or not for this application.'
        ),
        _('Steam Cloud is enabled'),
        _('Cloud Save'),
        'JsPlatform/Extensions/steam.svg',
        'JsPlatform/Extensions/steam.svg'
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Steamworks/steamworkstools.js')
      .setFunctionName('gdjs.steamworks.isCloudEnabled');

    extension
      .addCondition(
        'IsCloudFileExisting',
        _('File exists'),
        _('Checks if a file exists on Steam Cloud.'),
        _('File _PARAM0_ exists on Steam Cloud'),
        _('Cloud Save'),
        'JsPlatform/Extensions/steam.svg',
        'JsPlatform/Extensions/steam.svg'
      )
      .addParameter('identifier', 'File name', 'SteamFileName', false)
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Steamworks/steamworkstools.js')
      .setFunctionName('gdjs.steamworks.fileExists');

    extension
      .addAction(
        'WriteCloudFile',
        _('Write a file'),
        _('Writes a file onto the Steam Cloud.'),
        _(
          'Write _PARAM1_ into the file _PARAM0_ on Steam Cloud (store result in _PARAM2_)'
        ),
        _('Cloud Save'),
        'JsPlatform/Extensions/steam.svg',
        'JsPlatform/Extensions/steam.svg'
      )
      .addParameter(
        'identifier',
        'Name of file to write',
        'SteamFileName',
        false
      )
      .addParameter('string', 'File contents', '', false)
      .addParameter('scenevar', 'Variable where to store the result', '', true)
      .setParameterLongDescription(
        'The variable will be set to true if the file was successfully written and to false if it could not be.'
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Steamworks/steamworkstools.js')
      .setFunctionName('gdjs.steamworks.writeFile');

    extension
      .addAction(
        'DeleteCloudFile',
        _('Delete a file'),
        _('Deletes a file from the Steam Cloud.'),
        _('Delete file _PARAM0_ from Steam Cloud (store result in _PARAM1_)'),
        _('Cloud Save'),
        'JsPlatform/Extensions/steam.svg',
        'JsPlatform/Extensions/steam.svg'
      )
      .addParameter(
        'identifier',
        'Name of file to delete',
        'SteamFileName',
        false
      )
      .addParameter('scenevar', 'Variable where to store the result', '', true)
      .setParameterLongDescription(
        'The variable will be set to true if the file was successfully deleted and to false if it could not be.'
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Steamworks/steamworkstools.js')
      .setFunctionName('gdjs.steamworks.deleteFile');

    extension
      .addStrExpression(
        'ReadCloudFile',
        _('Read a file'),
        _('Reads a file from Steam Cloud and returns its contents.'),
        _('Cloud Save'),
        'JsPlatform/Extensions/steam.svg'
      )
      .addParameter(
        'identifier',
        'Name of file to read',
        'SteamFileName',
        false
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Steamworks/steamworkstools.js')
      .setFunctionName('gdjs.steamworks.readFile');

    extension
      .addAction(
        'CreateWorkshopItem',
        _('Create a Workshop item'),
        _(
          'Creates an item owned by the current player on the Steam Workshop. This only assignes an ID to an item for the user - use the action "Update workshop item" to set the item data and upload the workshop file.'
        ),
        _('Create a Workshop item and store its ID in _PARAM0_'),
        _('Workshop'),
        'JsPlatform/Extensions/steam.svg',
        'JsPlatform/Extensions/steam.svg'
      )
      .addParameter(
        'scenevar',
        'The variable where to store the result',
        '',
        false
      )
      .setParameterLongDescription(
        'This will be set to the Workshop item ID if successful and to the string "failure" otherwise.'
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Steamworks/steamworkstools.js')
      .setAsyncFunctionName('gdjs.steamworks.createWorkshopItem');

    extension
      .addAction(
        'UpdateWorkshopItem',
        _('Update a Workshop item'),
        _(
          'Releases an update to a Workshop item owned by the player. If you leave a field empty, it will be kept unmodified as it was before the update.'
        ),
        _(
          'Update the Workshop item _PARAM0_ with itemId title description changeNote previewPath contentPath tags visibility'
        ),
        _('Workshop'),
        'JsPlatform/Extensions/steam.svg',
        'JsPlatform/Extensions/steam.svg'
      )
      .addParameter(
        'identifier',
        _('Workshop Item ID'),
        'SteamWorkshopItem',
        false
      )
      .addParameter('string', _('Title'), '', true)
      .addParameter('string', _('Description'), '', true)
      .addParameter('string', _('Changelog'), '', true)
      .addParameter('string', _('Path to the preview image file'), '', true)
      .setParameterLongDescription(
        'An absolute file-path to an image file to be shown as preview of the workshop item on Steam.'
      )
      .addParameter(
        'string',
        _("Path to the file with the item's file"),
        '',
        true
      )
      .setParameterLongDescription(
        "An absolute file-path to a file that contains the all the data for your workshop item. You can use the Filesystem actions to write a JSON file with your player's Workshop item's data to a file in the temporary data folder, and pass the path here."
      )
      .addParameter('string', _('Tags'), '', true)
      .setParameterLongDescription(
        'The tags must be comma-separated without spaces after the comma, for example: `mytag,another tag,my_last_tag`.'
      )
      .addParameter(
        'stringWithSelector',
        _('Visibility'),
        JSON.stringify(['Public', 'FriendsOnly', 'Private', 'Unlisted']),
        true
      )
      .addParameter(
        'scenevar',
        'The variable where to store the result',
        '',
        true
      )
      .setParameterLongDescription(
        'This will be set to `true` if the update is successfully release and to `false` otherwise.'
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Steamworks/steamworkstools.js')
      .setAsyncFunctionName('gdjs.steamworks.updateWorkshopItem');

    extension
      .addAction(
        'SubscribeWorkshopItem',
        _('Subscribe to a Workshop item'),
        _(
          'Makes the player subscribe to a workshop item. This will cause it to be downloaded and installed ASAP.'
        ),
        _('Subscribe to Workshop item _PARAM0_ (store result in _PARAM1_)'),
        _('Workshop'),
        'JsPlatform/Extensions/steam.svg',
        'JsPlatform/Extensions/steam.svg'
      )
      .addParameter(
        'identifier',
        _('Workshop Item ID'),
        'SteamWorkshopItem',
        false
      )
      .addParameter(
        'scenevar',
        'The variable where to store the result',
        '',
        true
      )
      .setParameterLongDescription(
        'This will be set to `true` if successful and to `false` otherwise.'
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Steamworks/steamworkstools.js')
      .setAsyncFunctionName('gdjs.steamworks.subscribeToWorkshopItem');

    extension
      .addAction(
        'UnsubscribeWorkshopItem',
        _('Unsubscribe to a Workshop item'),
        _(
          'Makes the player unsubscribe to a workshop item. This will cause it to removed after quitting the game.'
        ),
        _('Unsubscribe to Workshop item _PARAM0_ (store result in _PARAM1_)'),
        _('Workshop'),
        'JsPlatform/Extensions/steam.svg',
        'JsPlatform/Extensions/steam.svg'
      )
      .addParameter(
        'identifier',
        _('Workshop Item ID'),
        'SteamWorkshopItem',
        false
      )
      .addParameter(
        'scenevar',
        'The variable where to store the result',
        '',
        true
      )
      .setParameterLongDescription(
        'This will be set to `true` if successful and to `false` otherwise.'
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Steamworks/steamworkstools.js')
      .setAsyncFunctionName('gdjs.steamworks.unsubscribeToWorkshopItem');

    extension
      .addAction(
        'DownloadWorkshopItem',
        _('Download a Workshop item'),
        _('Initiates the download of a Workshop item now.'),
        _(
          'Start downloading workshop item _PARAM0_ now, pause other downloads: _PARAM1_'
        ),
        _('Workshop'),
        'JsPlatform/Extensions/steam.svg',
        'JsPlatform/Extensions/steam.svg'
      )
      .addParameter(
        'identifier',
        _('Workshop Item ID'),
        'SteamWorkshopItem',
        false
      )
      .addParameter('yesorno', 'Stop other downloads?', '', true)
      .setParameterLongDescription(
        "This will temporarily pause any other Steam download on the player's machine to download the Workshop item NOW without waiting for other pending downloads to finish."
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Steamworks/steamworkstools.js')
      .setFunctionName('gdjs.steamworks.startWorkshopDownload');

    extension
      .addCondition(
        'IsWorkshopItemState',
        _('Check workshop item state'),
        _('Check whether a state flag is set for a Workshop item.'),
        _('Flag _PARAM1_ is set on Workshop item _PARAM0_'),
        _('Workshop'),
        'JsPlatform/Extensions/steam.svg',
        'JsPlatform/Extensions/steam.svg'
      )
      .addParameter(
        'identifier',
        _('Workshop Item ID'),
        'SteamWorkshopItem',
        false
      )
      .addParameter(
        'stringWithSelector',
        'State flag to check for',
        JSON.stringify([
          'None',
          'Subscribed',
          'LegacyItem',
          'Installed',
          'NeedsUpdate',
          'Downloading',
          'DownloadPending',
        ]),
        false
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Steamworks/steamworkstools.js')
      .setFunctionName('gdjs.steamworks.workshopItemState');

    extension
      .addStrExpression(
        'WorkshopItemLocation',
        _('Workshop item installation location'),
        _('The file path to the contents file of an installed workshop item.'),
        _('Workshop'),
        'JsPlatform/Extensions/steam.svg'
      )
      .addParameter(
        'identifier',
        _('Workshop Item ID'),
        'SteamWorkshopItem',
        false
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Steamworks/steamworkstools.js')
      .setFunctionName('gdjs.steamworks.getWorkshopItemLocation');

    extension
      .addExpression(
        'WorkshopItemSize',
        _('Workshop item size'),
        _(
          'The size on disk taken by the contents file of an installed workshop item.'
        ),
        _('Workshop'),
        'JsPlatform/Extensions/steam.svg'
      )
      .addParameter(
        'identifier',
        _('Workshop Item ID'),
        'SteamWorkshopItem',
        false
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Steamworks/steamworkstools.js')
      .setFunctionName('gdjs.steamworks.getWorkshopItemSizeOnDisk');

    extension
      .addExpression(
        'WorkshopItemInstallationTimestamp',
        _('Workshop item installation time'),
        _(
          'The timestamp of the last time the contents file of an installed workshop item was updated.'
        ),
        _('Workshop'),
        'JsPlatform/Extensions/steam.svg'
      )
      .addParameter(
        'identifier',
        _('Workshop Item ID'),
        'SteamWorkshopItem',
        false
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Steamworks/steamworkstools.js')
      .setFunctionName('gdjs.steamworks.getWorkshopItemInstallTimestamp');

    extension
      .addExpression(
        'WorkshopItemDownloadProgress',
        _('Workshop item download progress'),
        _(
          'The amount of data that has been downloaded by Steam for a currrently downloading item so far.'
        ),
        _('Workshop/Download'),
        'JsPlatform/Extensions/steam.svg'
      )
      .addParameter(
        'identifier',
        _('Workshop Item ID'),
        'SteamWorkshopItem',
        false
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Steamworks/steamworkstools.js')
      .setFunctionName('gdjs.steamworks.getWorkshopItemDownloadProgress');

    extension
      .addExpression(
        'WorkshopItemDownloadTotal',
        _('Workshop item download total'),
        _(
          'The amount of data that needs to be downloaded in total by Steam for a currrently downloading item.'
        ),
        _('Workshop/Download'),
        'JsPlatform/Extensions/steam.svg'
      )
      .addParameter(
        'identifier',
        _('Workshop Item ID'),
        'SteamWorkshopItem',
        false
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Steamworks/steamworkstools.js')
      .setFunctionName('gdjs.steamworks.getWorkshopItemDownloadTotal');

    return extension;
  },
  runExtensionSanityTests: function (gd, extension) {
    return [];
  },
};
