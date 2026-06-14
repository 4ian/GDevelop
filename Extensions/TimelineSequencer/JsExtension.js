//@ts-check
/// <reference path="../JsExtensionTypes.d.ts" />

const timelineIncludeFile = 'Extensions/TimelineSequencer/timelineease.js';
const timelineRuntimeFiles = [
  'Extensions/TimelineSequencer/timelineinterpolation.js',
  'Extensions/TimelineSequencer/timelinepath.js',
  'Extensions/TimelineSequencer/timelineplayer.js',
  'Extensions/TimelineSequencer/timelinemanager.js',
  'Extensions/TimelineSequencer/timelinesequencertools.js',
];
const icon24 = 'JsPlatform/Extensions/tween_behavior24.png';
const icon32 = 'JsPlatform/Extensions/tween_behavior32.png';

const timelineNameDefault = 'Intro';
const timelineNameIdentifier = 'TimelineSequencer::TimelineName';
const timelineBindingNameDefault = 'Target';
const timelineBindingNameIdentifier = 'TimelineSequencer::BindingName';
const timelineJsonDefault =
  '{"timelines":[{"name":"Intro","duration":1,"tracks":[]}]}';

const withTimelineRuntime = (codeExtraInformation) => {
  codeExtraInformation.setIncludeFile(timelineIncludeFile);
  for (const includeFile of timelineRuntimeFiles) {
    codeExtraInformation.addIncludeFile(includeFile);
  }
  return codeExtraInformation;
};

/** @type {ExtensionModule} */
module.exports = {
  createExtension: function (_, gd) {
    const extension = new gd.PlatformExtension();
    extension
      .setExtensionInformation(
        'TimelineSequencer',
        _('Timeline Sequencer'),
        _(
          'Play Construct-style timeline animations for scene objects with keyframes, easing, markers, looping and event controls.'
        ),
        'GDevelop contributors',
        'Open source (MIT License)'
      )
      .setShortDescription(
        _(
          'Create and play keyframed timelines without replacing Sprite animations.'
        )
      )
      .setCategory('Visual effect')
      .setTags('timeline, animation, keyframes, sequencer');
    extension
      .addInstructionOrExpressionGroupMetadata(_('Timeline Sequencer'))
      .setIcon(icon32);

    extension
      .registerProperty('timelines')
      .setLabel(_('Timelines'))
      .setDescription(_('Serialized project timelines used by the editor.'))
      .setType('string')
      .setHidden(true);

    withTimelineRuntime(
      extension
        .addAction(
          'RegisterTimelineJson',
          _('Register timelines from JSON'),
          _('Register one or more timelines from a JSON string.'),
          _('Register timelines from _PARAM1_'),
          '',
          icon24,
          icon32
        )
        .addCodeOnlyParameter('currentScene', '')
        .addParameter('string', _('Timeline JSON'), timelineJsonDefault, false)
        .getCodeExtraInformation()
    ).setFunctionName('gdjs.evtTools.timeline.registerTimelineJson');

    withTimelineRuntime(
      extension
        .addAction(
          'PlayTimeline',
          _('Play a timeline'),
          _('Play a timeline from its current beginning.'),
          _('Play timeline _PARAM1_'),
          '',
          icon24,
          icon32
        )
        .addCodeOnlyParameter('currentScene', '')
        .addParameter('identifier', _('Timeline name'), timelineNameIdentifier)
        .setDefaultValue(JSON.stringify(timelineNameDefault))
        .setParameterExtraInfo(timelineNameIdentifier)
        .getCodeExtraInformation()
    ).setFunctionName('gdjs.evtTools.timeline.playTimeline');

    withTimelineRuntime(
      extension
        .addAction(
          'PlayTimelineFromTime',
          _('Play a timeline from time'),
          _('Play a timeline from a given time in seconds.'),
          _('Play timeline _PARAM1_ from _PARAM2_ seconds'),
          '',
          icon24,
          icon32
        )
        .addCodeOnlyParameter('currentScene', '')
        .addParameter('identifier', _('Timeline name'), timelineNameIdentifier)
        .setDefaultValue(JSON.stringify(timelineNameDefault))
        .setParameterExtraInfo(timelineNameIdentifier)
        .addParameter('expression', _('Time in seconds'), '', false)
        .setDefaultValue('0')
        .getCodeExtraInformation()
    ).setFunctionName('gdjs.evtTools.timeline.playTimelineFromTime');

    withTimelineRuntime(
      extension
        .addAction(
          'PauseTimeline',
          _('Pause a timeline'),
          _('Pause a timeline that is currently playing.'),
          _('Pause timeline _PARAM1_'),
          '',
          icon24,
          icon32
        )
        .addCodeOnlyParameter('currentScene', '')
        .addParameter('identifier', _('Timeline name'), timelineNameIdentifier)
        .setDefaultValue(JSON.stringify(timelineNameDefault))
        .setParameterExtraInfo(timelineNameIdentifier)
        .getCodeExtraInformation()
    ).setFunctionName('gdjs.evtTools.timeline.pauseTimeline');

    withTimelineRuntime(
      extension
        .addAction(
          'ResumeTimeline',
          _('Resume a timeline'),
          _('Resume a paused timeline.'),
          _('Resume timeline _PARAM1_'),
          '',
          icon24,
          icon32
        )
        .addCodeOnlyParameter('currentScene', '')
        .addParameter('identifier', _('Timeline name'), timelineNameIdentifier)
        .setDefaultValue(JSON.stringify(timelineNameDefault))
        .setParameterExtraInfo(timelineNameIdentifier)
        .getCodeExtraInformation()
    ).setFunctionName('gdjs.evtTools.timeline.resumeTimeline');

    withTimelineRuntime(
      extension
        .addAction(
          'StopTimeline',
          _('Stop a timeline'),
          _('Stop a timeline and keep objects at their current values.'),
          _('Stop timeline _PARAM1_'),
          '',
          icon24,
          icon32
        )
        .addCodeOnlyParameter('currentScene', '')
        .addParameter('identifier', _('Timeline name'), timelineNameIdentifier)
        .setDefaultValue(JSON.stringify(timelineNameDefault))
        .setParameterExtraInfo(timelineNameIdentifier)
        .getCodeExtraInformation()
    ).setFunctionName('gdjs.evtTools.timeline.stopTimeline');

    withTimelineRuntime(
      extension
        .addAction(
          'SeekTimeline',
          _('Set timeline time'),
          _('Move a timeline to a given time in seconds and apply its values.'),
          _('Set timeline _PARAM1_ time to _PARAM2_ seconds'),
          '',
          icon24,
          icon32
        )
        .addCodeOnlyParameter('currentScene', '')
        .addParameter('identifier', _('Timeline name'), timelineNameIdentifier)
        .setDefaultValue(JSON.stringify(timelineNameDefault))
        .setParameterExtraInfo(timelineNameIdentifier)
        .addParameter('expression', _('Time in seconds'), '', false)
        .setDefaultValue('0')
        .getCodeExtraInformation()
    ).setFunctionName('gdjs.evtTools.timeline.seekTimeline');

    withTimelineRuntime(
      extension
        .addAction(
          'SetTimelineSpeed',
          _('Set timeline speed'),
          _('Change the playback speed of a timeline.'),
          _('Set timeline _PARAM1_ speed to _PARAM2_'),
          '',
          icon24,
          icon32
        )
        .addCodeOnlyParameter('currentScene', '')
        .addParameter('identifier', _('Timeline name'), timelineNameIdentifier)
        .setDefaultValue(JSON.stringify(timelineNameDefault))
        .setParameterExtraInfo(timelineNameIdentifier)
        .addParameter('expression', _('Speed'), '', false)
        .setDefaultValue('1')
        .getCodeExtraInformation()
    ).setFunctionName('gdjs.evtTools.timeline.setTimelineSpeed');

    withTimelineRuntime(
      extension
        .addAction(
          'SetTimelineLoop',
          _('Set timeline looping'),
          _('Enable or disable looping for a timeline.'),
          _('Set timeline _PARAM1_ looping: _PARAM2_'),
          '',
          icon24,
          icon32
        )
        .addCodeOnlyParameter('currentScene', '')
        .addParameter('identifier', _('Timeline name'), timelineNameIdentifier)
        .setDefaultValue(JSON.stringify(timelineNameDefault))
        .setParameterExtraInfo(timelineNameIdentifier)
        .addParameter('yesorno', _('Loop'), '', false)
        .setDefaultValue('yes')
        .getCodeExtraInformation()
    ).setFunctionName('gdjs.evtTools.timeline.setTimelineLoop');

    withTimelineRuntime(
      extension
        .addAction(
          'BindTimelineObjectTarget',
          _('Bind objects to a timeline target'),
          _('Bind picked objects to a runtime target name used by timelines.'),
          _('Bind _PARAM2_ to timeline target _PARAM1_'),
          '',
          icon24,
          icon32
        )
        .addCodeOnlyParameter('currentScene', '')
        .addParameter(
          'identifier',
          _('Binding name'),
          timelineBindingNameIdentifier
        )
        .setDefaultValue(JSON.stringify(timelineBindingNameDefault))
        .setParameterExtraInfo(timelineBindingNameIdentifier)
        .addParameter('object', _('Objects'), '', false)
        .getCodeExtraInformation()
    ).setFunctionName('gdjs.evtTools.timeline.bindTimelineObjectTarget');

    withTimelineRuntime(
      extension
        .addCondition(
          'TimelineIsPlaying',
          _('Timeline is playing'),
          _('Check if a timeline is currently playing.'),
          _('Timeline _PARAM1_ is playing'),
          '',
          icon24,
          icon32
        )
        .addCodeOnlyParameter('currentScene', '')
        .addParameter('identifier', _('Timeline name'), timelineNameIdentifier)
        .setDefaultValue(JSON.stringify(timelineNameDefault))
        .setParameterExtraInfo(timelineNameIdentifier)
        .getCodeExtraInformation()
    ).setFunctionName('gdjs.evtTools.timeline.isTimelinePlaying');

    withTimelineRuntime(
      extension
        .addCondition(
          'TimelineIsPaused',
          _('Timeline is paused'),
          _('Check if a timeline is paused.'),
          _('Timeline _PARAM1_ is paused'),
          '',
          icon24,
          icon32
        )
        .addCodeOnlyParameter('currentScene', '')
        .addParameter('identifier', _('Timeline name'), timelineNameIdentifier)
        .setDefaultValue(JSON.stringify(timelineNameDefault))
        .setParameterExtraInfo(timelineNameIdentifier)
        .getCodeExtraInformation()
    ).setFunctionName('gdjs.evtTools.timeline.isTimelinePaused');

    withTimelineRuntime(
      extension
        .addCondition(
          'TimelineHasFinished',
          _('Timeline has finished'),
          _('Check if a timeline has finished playing.'),
          _('Timeline _PARAM1_ has finished'),
          '',
          icon24,
          icon32
        )
        .addCodeOnlyParameter('currentScene', '')
        .addParameter('identifier', _('Timeline name'), timelineNameIdentifier)
        .setDefaultValue(JSON.stringify(timelineNameDefault))
        .setParameterExtraInfo(timelineNameIdentifier)
        .getCodeExtraInformation()
    ).setFunctionName('gdjs.evtTools.timeline.hasTimelineFinished');

    withTimelineRuntime(
      extension
        .addCondition(
          'TimelineReachedMarker',
          _('Timeline reached marker'),
          _('Check if a timeline reached a marker during this frame.'),
          _('Timeline _PARAM1_ reached marker _PARAM2_'),
          '',
          icon24,
          icon32
        )
        .addCodeOnlyParameter('currentScene', '')
        .addParameter('identifier', _('Timeline name'), timelineNameIdentifier)
        .setDefaultValue(JSON.stringify(timelineNameDefault))
        .setParameterExtraInfo(timelineNameIdentifier)
        .addParameter('string', _('Marker name'), 'Hit', false)
        .getCodeExtraInformation()
    ).setFunctionName('gdjs.evtTools.timeline.hasTimelineReachedMarker');

    withTimelineRuntime(
      extension
        .addCondition(
          'TimelineTimeGreaterThan',
          _('Timeline time is greater than'),
          _('Compare the current timeline time, in seconds.'),
          _('Timeline _PARAM1_ time is greater than _PARAM2_ seconds'),
          '',
          icon24,
          icon32
        )
        .addCodeOnlyParameter('currentScene', '')
        .addParameter('identifier', _('Timeline name'), timelineNameIdentifier)
        .setDefaultValue(JSON.stringify(timelineNameDefault))
        .setParameterExtraInfo(timelineNameIdentifier)
        .addParameter('expression', _('Time in seconds'), '', false)
        .setDefaultValue('0')
        .getCodeExtraInformation()
    ).setFunctionName('gdjs.evtTools.timeline.timelineTimeGreaterThan');

    withTimelineRuntime(
      extension
        .addCondition(
          'TimelineProgressGreaterThan',
          _('Timeline progress is greater than'),
          _('Compare the timeline progress from 0 to 1.'),
          _('Timeline _PARAM1_ progress is greater than _PARAM2_'),
          '',
          icon24,
          icon32
        )
        .addCodeOnlyParameter('currentScene', '')
        .addParameter('identifier', _('Timeline name'), timelineNameIdentifier)
        .setDefaultValue(JSON.stringify(timelineNameDefault))
        .setParameterExtraInfo(timelineNameIdentifier)
        .addParameter('expression', _('Progress'), '', false)
        .setDefaultValue('0.5')
        .getCodeExtraInformation()
    ).setFunctionName('gdjs.evtTools.timeline.timelineProgressGreaterThan');

    withTimelineRuntime(
      extension
        .addExpression(
          'Time',
          _('Timeline time'),
          _('Return the current timeline time in seconds.'),
          '',
          icon32
        )
        .addCodeOnlyParameter('currentScene', '')
        .addParameter('identifier', _('Timeline name'), timelineNameIdentifier)
        .setDefaultValue(JSON.stringify(timelineNameDefault))
        .setParameterExtraInfo(timelineNameIdentifier)
        .getCodeExtraInformation()
    ).setFunctionName('gdjs.evtTools.timeline.getTimelineTime');

    withTimelineRuntime(
      extension
        .addExpression(
          'Duration',
          _('Timeline duration'),
          _('Return the timeline duration in seconds.'),
          '',
          icon32
        )
        .addCodeOnlyParameter('currentScene', '')
        .addParameter('identifier', _('Timeline name'), timelineNameIdentifier)
        .setDefaultValue(JSON.stringify(timelineNameDefault))
        .setParameterExtraInfo(timelineNameIdentifier)
        .getCodeExtraInformation()
    ).setFunctionName('gdjs.evtTools.timeline.getTimelineDuration');

    withTimelineRuntime(
      extension
        .addExpression(
          'Progress',
          _('Timeline progress'),
          _('Return the timeline progress from 0 to 1.'),
          '',
          icon32
        )
        .addCodeOnlyParameter('currentScene', '')
        .addParameter('identifier', _('Timeline name'), timelineNameIdentifier)
        .setDefaultValue(JSON.stringify(timelineNameDefault))
        .setParameterExtraInfo(timelineNameIdentifier)
        .getCodeExtraInformation()
    ).setFunctionName('gdjs.evtTools.timeline.getTimelineProgress');

    withTimelineRuntime(
      extension
        .addExpression(
          'Speed',
          _('Timeline speed'),
          _('Return the timeline playback speed.'),
          '',
          icon32
        )
        .addCodeOnlyParameter('currentScene', '')
        .addParameter('identifier', _('Timeline name'), timelineNameIdentifier)
        .setDefaultValue(JSON.stringify(timelineNameDefault))
        .setParameterExtraInfo(timelineNameIdentifier)
        .getCodeExtraInformation()
    ).setFunctionName('gdjs.evtTools.timeline.getTimelineSpeed');

    return extension;
  },
  runExtensionSanityTests: function (gd, extension) {
    return [];
  },
};
