//@ts-check
/// <reference path="../JsExtensionTypes.d.ts" />

/** @type {ExtensionModule} */
module.exports = {
    createExtension: function (_, gd) {
        const extension = new gd.PlatformExtension();
        extension
            .setExtensionInformation(
                'CinematicSequencer',
                _('Cinematic Sequencer'),
                _('Allows playing complex timeline animations exported from the Cinematic Sequencer editor.'),
                'Tech Shop',
                'MIT'
            )
            .setShortDescription(
                'Play cinematic sequences dynamically in the game runtime.'
            );
        extension
            .addInstructionOrExpressionGroupMetadata(_('Cinematic Sequencer'))
            .setIcon('res/actions/camera.png');

        extension
            .addAction(
                'PlayCinematicSequence',
                _('Play cinematic sequence'),
                _('Play a cinematic sequence by its name. Requires the sequence JSON data to be passed.'),
                _('Play cinematic sequence _PARAM0_'),
                _('Cinematic Sequencer'),
                'res/actions/camera.png',
                'res/actions/camera.png'
            )
            .addParameter('string', _('Sequence Name/Data (JSON)'), '', false)
            .getCodeExtraInformation()
            .setIncludeFile(
                'Extensions/CinematicSequencer/cinematicsequencertools.js'
            )
            .setFunctionName('gdjs.evtTools.cinematicSequencer.playSequence');

        extension
            .addCondition(
                'IsCinematicSequencePlaying',
                _('Is cinematic sequence playing'),
                _('Check if a cinematic sequence is currently playing.'),
                _('Cinematic sequence _PARAM0_ is playing'),
                _('Cinematic Sequencer'),
                'res/actions/camera.png',
                'res/actions/camera.png'
            )
            .addParameter('string', _('Sequence Name'), '', false)
            .getCodeExtraInformation()
            .setIncludeFile(
                'Extensions/CinematicSequencer/cinematicsequencertools.js'
            )
            .setFunctionName('gdjs.evtTools.cinematicSequencer.isPlaying');

        return extension;
    },
    runExtensionSanityTests: function (gd, extension) {
        return [];
    },
};
