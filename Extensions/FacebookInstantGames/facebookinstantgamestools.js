/**
 * @namespace gdjs.evtTools
 * @class facebookInstantGames
 * @static
 * @private
 */
gdjs.evtTools.facebookInstantGames = {};

gdjs.evtTools.facebookInstantGames.getPlayerId = function() {
	if (typeof FBInstant === 'undefined') return '';

	return FBInstant.player.getID() || '';
};

gdjs.evtTools.facebookInstantGames.getPlayerName = function() {
	if (typeof FBInstant === 'undefined') return '';

	return FBInstant.player.getName() || '';
};