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
        'SaveState',
        _('Save State'),
        _(
          'Allows to save and load the full state of a game, usually on the device storage. A Save State, by default, contains the full state of the game (objects, variables, sounds, music, effects etc.). Using the "Save Configuration" behavior, you can customize which objects should not be saved in a Save State. You can also use the "Change the save configuration of a variable" action to change the save configuration of a variable. Finally, both objects, variables and scene/game data can be given a profile name: in this case, when saving or loading with one or more profile names specified, only the object/variables/data belonging to one of the specified profiles will be saved or loaded.'
        ),
        'Neyl Mahfouf',
        'Open source (MIT License)'
      )
      .setShortDescription(
        'Save/load full game state (objects, variables, sounds, effects). Profile-based filtering.'
      )
      .setExtensionHelpPath('/all-features/save-state')
      .setCategory('Game mechanic')
      .addInstructionOrExpressionGroupMetadata(_('Save State'))
      .setIcon('res/actions/saveDown.svg');

    extension
      .addAction(
        'CreateGameSaveStateInVariable',
        _('Save game to a variable'),
        _(
          'Create a Save State and save it to a variable. This is for advanced usage, prefer to use "Save game to device storage" in most cases.'
        ),
        _('Save game in variable _PARAM1_ (profile(s): _PARAM2_)'),
        _('Save'),
        'res/actions/saveDown.svg',
        'res/actions/saveDown.svg'
      )
      .addCodeOnlyParameter('currentScene', '')
      .addParameter('variable', _('Variable to store the save to'), '', false)
      .addParameter('string', _('Profile(s) to save'), '', true)
      .setDefaultValue('"default"')
      .setParameterLongDescription(
        _(
          'Comma-separated list of profile names that must be saved. Only objects tagged with at least one of these profiles will be saved. If no profile names are specified, all objects will be saved (unless they have a "Save Configuration" behavior set to "Do not save").'
        )
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/SaveState/SaveStateTools.js')
      .addIncludeFile(
        'Extensions/SaveState/SaveConfigurationRuntimeBehavior.js'
      )
      .setFunctionName('gdjs.saveState.createGameSaveStateInVariable')
      .setAsyncFunctionName('gdjs.saveState.createGameSaveStateInVariable');

    extension
      .addAction(
        'CreateGameSaveStateInStorage',
        _('Save game to device storage'),
        _('Create a Save State and save it to device storage.'),
        _('Save game to device storage named _PARAM1_ (profile(s): _PARAM2_)'),
        _('Save'),
        'res/actions/saveDown.svg',
        'res/actions/saveDown.svg'
      )
      .addCodeOnlyParameter('currentScene', '')
      .addParameter('string', _('Storage key to save to'), '', false)
      .addParameter('string', _('Profile(s) to save'), '', true)
      .setDefaultValue('"default"')
      .setParameterLongDescription(
        _(
          'Comma-separated list of profile names that must be saved. Only objects tagged with at least one of these profiles will be saved. If no profile names are specified, all objects will be saved (unless they have a "Save Configuration" behavior set to "Do not save").'
        )
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/SaveState/SaveStateTools.js')
      .addIncludeFile(
        'Extensions/SaveState/SaveConfigurationRuntimeBehavior.js'
      )
      .setFunctionName('gdjs.saveState.createGameSaveStateInStorage')
      .setAsyncFunctionName('gdjs.saveState.createGameSaveStateInStorage');

    extension
      .addAction(
        'RestoreGameSaveStateFromVariable',
        _('Load game from variable'),
        _(
          'Restore the game from a Save State stored in the specified variable. This is for advanced usage, prefer to use "Load game from device storage" in most cases.'
        ),
        _(
          'Load game from variable _PARAM1_ (profile(s): _PARAM2_, stop and restart all the scenes currently played: _PARAM3_)'
        ),
        _('Load'),
        'res/actions/saveUp.svg',
        'res/actions/saveUp.svg'
      )
      .addCodeOnlyParameter('currentScene', '')
      .addParameter('variable', _('Variable to load the game from'), '', false)
      .addParameter('string', _('Profile(s) to load'), '', true)
      .setDefaultValue('"default"')
      .setParameterLongDescription(
        _(
          'Comma-separated list of profile names that must be loaded. Only objects tagged with at least one of these profiles will be loaded - others will be left alone. If no profile names are specified, all objects will be loaded (unless they have a "Save Configuration" behavior set to "Do not save").'
        )
      )
      .addParameter(
        'yesorno',
        _('Stop and restart all the scenes currently played?'),
        '',
        true
      )
      .setDefaultValue('no')
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/SaveState/SaveStateTools.js')
      .addIncludeFile(
        'Extensions/SaveState/SaveConfigurationRuntimeBehavior.js'
      )
      .setFunctionName('gdjs.saveState.restoreGameSaveStateFromVariable')
      .setAsyncFunctionName('gdjs.saveState.restoreGameSaveStateFromVariable');

    extension
      .addAction(
        'RestoreGameSaveStateFromStorage',
        _('Load game from device storage'),
        _('Restore the game from a Save State stored on the device.'),
        _(
          'Load game from device storage named _PARAM1_ (profile(s): _PARAM2_, stop and restart all the scenes currently played: _PARAM3_)'
        ),
        _('Load'),
        'res/actions/saveUp.svg',
        'res/actions/saveUp.svg'
      )
      .addCodeOnlyParameter('currentScene', '')
      .addParameter(
        'string',
        _('Storage name to load the game from'),
        '',
        false
      )
      .addParameter('string', _('Profile(s) to load'), '', true)
      .setDefaultValue('"default"')
      .setParameterLongDescription(
        _(
          'Comma-separated list of profile names that must be loaded. Only objects tagged with at least one of these profiles will be loaded - others will be left alone. If no profile names are specified, all objects will be loaded.'
        )
      )
      .addParameter(
        'yesorno',
        _('Stop and restart all the scenes currently played?'),
        '',
        true
      )
      .setDefaultValue('no')
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/SaveState/SaveStateTools.js')
      .addIncludeFile(
        'Extensions/SaveState/SaveConfigurationRuntimeBehavior.js'
      )
      .setFunctionName('gdjs.saveState.restoreGameSaveStateFromStorage')
      .setAsyncFunctionName('gdjs.saveState.restoreGameSaveStateFromStorage');

    extension
      .addAction(
        'DeleteSaveFromStorage',
        _('Delete a save from device storage'),
        _('Delete a save stored on the device storage.'),
        _('Delete save from device storage named _PARAM1_'),
        _('Manage saves'),
        'res/actions/saveDown.svg',
        'res/actions/saveDown.svg'
      )
      .addCodeOnlyParameter('currentScene', '')
      .addParameter(
        'string',
        _('Storage name of the save to delete'),
        '',
        false
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/SaveState/SaveStateTools.js')
      .addIncludeFile(
        'Extensions/SaveState/SaveConfigurationRuntimeBehavior.js'
      )
      .setFunctionName('gdjs.saveState.deleteSaveFromStorage')
      .setAsyncFunctionName('gdjs.saveState.deleteSaveFromStorage');

    extension
      .addAction(
        'DuplicateSaveInStorage',
        _('Duplicate a save in device storage'),
        _('Duplicate a save stored on the device storage to another name.'),
        _('Duplicate save _PARAM1_ to _PARAM2_ in device storage'),
        _('Manage saves'),
        'res/actions/saveDown.svg',
        'res/actions/saveDown.svg'
      )
      .addCodeOnlyParameter('currentScene', '')
      .addParameter(
        'string',
        _('Storage name of the save to duplicate'),
        '',
        false
      )
      .addParameter('string', _('Storage name of the new save'), '', false)
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/SaveState/SaveStateTools.js')
      .addIncludeFile(
        'Extensions/SaveState/SaveConfigurationRuntimeBehavior.js'
      )
      .setFunctionName('gdjs.saveState.duplicateSaveInStorage')
      .setAsyncFunctionName('gdjs.saveState.duplicateSaveInStorage');

    extension
      .addAction(
        'CheckSaveExistsInStorage',
        _('Check if a save exists in device storage'),
        _(
          'Check if a save with the given name exists in the device storage, and store the result (yes/no) in a variable. The check is asynchronous: use the condition "Save existence check completed" to know when the result is available.'
        ),
        _(
          'Check if save _PARAM1_ exists in device storage (result in _PARAM2_)'
        ),
        _('Manage saves'),
        'res/actions/saveDown.svg',
        'res/actions/saveDown.svg'
      )
      .addCodeOnlyParameter('currentScene', '')
      .addParameter('string', _('Storage name of the save to check'), '', false)
      .addParameter(
        'variable',
        _('Variable where to store the result (yes/no)'),
        '',
        false
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/SaveState/SaveStateTools.js')
      .addIncludeFile(
        'Extensions/SaveState/SaveConfigurationRuntimeBehavior.js'
      )
      .setFunctionName('gdjs.saveState.checkSaveExistsInStorage')
      .setAsyncFunctionName('gdjs.saveState.checkSaveExistsInStorage');

    extension
      .addAction(
        'ListSavesInVariable',
        _('List existing saves'),
        _(
          'List the saves stored on the device storage and store them in a variable. The check is asynchronous: use the condition "Saves listing completed" to know when the result is available.'
        ),
        _('List existing saves in variable _PARAM1_'),
        _('Manage saves'),
        'res/actions/saveDown.svg',
        'res/actions/saveDown.svg'
      )
      .addCodeOnlyParameter('currentScene', '')
      .addParameter(
        'variable',
        _('Variable where to store the list of saves'),
        '',
        false
      )
      .setParameterLongDescription(
        _(
          'The variable will contain an array of structures, one per save, sorted from the most recently updated to the oldest. Each structure has the children: "name" (the save name), "savedAt" and "updatedAt" (timestamps in milliseconds since 1970, or 0 if unknown for older saves).'
        )
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/SaveState/SaveStateTools.js')
      .addIncludeFile(
        'Extensions/SaveState/SaveConfigurationRuntimeBehavior.js'
      )
      .setFunctionName('gdjs.saveState.listSavesInVariable')
      .setAsyncFunctionName('gdjs.saveState.listSavesInVariable');

    extension
      .addCondition(
        'DeleteJustSucceeded',
        _('Delete just succeeded'),
        _('The last delete attempt just succeeded.'),
        _('Delete just succeeded'),
        _('Manage saves'),
        'res/actions/saveDown.svg',
        'res/actions/saveDown.svg'
      )
      .addCodeOnlyParameter('currentScene', '')
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/SaveState/SaveStateTools.js')
      .addIncludeFile(
        'Extensions/SaveState/SaveConfigurationRuntimeBehavior.js'
      )
      .setFunctionName('gdjs.saveState.hasDeleteJustSucceeded');

    extension
      .addCondition(
        'DeleteJustFailed',
        _('Delete just failed'),
        _('The last delete attempt just failed.'),
        _('Delete just failed'),
        _('Manage saves'),
        'res/actions/saveDown.svg',
        'res/actions/saveDown.svg'
      )
      .addCodeOnlyParameter('currentScene', '')
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/SaveState/SaveStateTools.js')
      .addIncludeFile(
        'Extensions/SaveState/SaveConfigurationRuntimeBehavior.js'
      )
      .setFunctionName('gdjs.saveState.hasDeleteJustFailed');

    extension
      .addCondition(
        'DuplicateJustSucceeded',
        _('Duplicate just succeeded'),
        _('The last duplicate attempt just succeeded.'),
        _('Duplicate just succeeded'),
        _('Manage saves'),
        'res/actions/saveDown.svg',
        'res/actions/saveDown.svg'
      )
      .addCodeOnlyParameter('currentScene', '')
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/SaveState/SaveStateTools.js')
      .addIncludeFile(
        'Extensions/SaveState/SaveConfigurationRuntimeBehavior.js'
      )
      .setFunctionName('gdjs.saveState.hasDuplicateJustSucceeded');

    extension
      .addCondition(
        'DuplicateJustFailed',
        _('Duplicate just failed'),
        _('The last duplicate attempt just failed.'),
        _('Duplicate just failed'),
        _('Manage saves'),
        'res/actions/saveDown.svg',
        'res/actions/saveDown.svg'
      )
      .addCodeOnlyParameter('currentScene', '')
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/SaveState/SaveStateTools.js')
      .addIncludeFile(
        'Extensions/SaveState/SaveConfigurationRuntimeBehavior.js'
      )
      .setFunctionName('gdjs.saveState.hasDuplicateJustFailed');

    extension
      .addCondition(
        'CheckJustCompleted',
        _('Save existence check completed'),
        _(
          'The last "Check if a save exists" action just completed (its result is now available).'
        ),
        _('Save existence check completed'),
        _('Manage saves'),
        'res/actions/saveDown.svg',
        'res/actions/saveDown.svg'
      )
      .addCodeOnlyParameter('currentScene', '')
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/SaveState/SaveStateTools.js')
      .addIncludeFile(
        'Extensions/SaveState/SaveConfigurationRuntimeBehavior.js'
      )
      .setFunctionName('gdjs.saveState.hasCheckJustCompleted');

    extension
      .addCondition(
        'CheckedSaveExists',
        _('Checked save exists'),
        _(
          'The save checked by the last completed "Check if a save exists" action does exist.'
        ),
        _('Checked save exists'),
        _('Manage saves'),
        'res/actions/saveDown.svg',
        'res/actions/saveDown.svg'
      )
      .addCodeOnlyParameter('currentScene', '')
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/SaveState/SaveStateTools.js')
      .addIncludeFile(
        'Extensions/SaveState/SaveConfigurationRuntimeBehavior.js'
      )
      .setFunctionName('gdjs.saveState.doesCheckedSaveExist');

    extension
      .addCondition(
        'ListJustCompleted',
        _('Saves listing completed'),
        _(
          'The last "List existing saves" action just completed (the variable now contains the list).'
        ),
        _('Saves listing completed'),
        _('Manage saves'),
        'res/actions/saveDown.svg',
        'res/actions/saveDown.svg'
      )
      .addCodeOnlyParameter('currentScene', '')
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/SaveState/SaveStateTools.js')
      .addIncludeFile(
        'Extensions/SaveState/SaveConfigurationRuntimeBehavior.js'
      )
      .setFunctionName('gdjs.saveState.hasListJustCompleted');

    extension
      .addStrExpression(
        'LastCheckedSaveName',
        _('Last checked save name'),
        _(
          'The name of the save used in the last "Check if a save exists" action.'
        ),
        _('Manage saves'),
        'res/actions/saveDown.svg'
      )
      .addCodeOnlyParameter('currentScene', '')
      .setIncludeFile('Extensions/SaveState/SaveStateTools.js')
      .addIncludeFile(
        'Extensions/SaveState/SaveConfigurationRuntimeBehavior.js'
      )
      .setFunctionName('gdjs.saveState.getLastCheckedSaveName');

    extension
      .addExpressionAndCondition(
        'number',
        'TimeSinceLastSave',
        _('Time since last save'),
        _(
          'Time since the last save, in seconds. Returns -1 if no save happened, and a positive number otherwise.'
        ),
        _('Time since the last save'),
        '',
        'res/actions/saveDown.svg'
      )
      .addCodeOnlyParameter('currentScene', '')
      .useStandardParameters('number', gd.ParameterOptions.makeNewOptions())
      .setIncludeFile('Extensions/SaveState/SaveStateTools.js')
      .addIncludeFile(
        'Extensions/SaveState/SaveConfigurationRuntimeBehavior.js'
      )
      .setFunctionName('gdjs.saveState.getSecondsSinceLastSave')
      .setGetter('gdjs.saveState.getSecondsSinceLastSave');

    extension
      .addExpressionAndCondition(
        'number',
        'TimeSinceLastLoad',
        _('Time since last load'),
        _(
          'Time since the last load, in seconds. Returns -1 if no load happened, and a positive number otherwise.'
        ),
        _('Time since the last load'),
        '',
        'res/actions/saveDown.svg'
      )
      .addCodeOnlyParameter('currentScene', '')
      .useStandardParameters('number', gd.ParameterOptions.makeNewOptions())
      .setIncludeFile('Extensions/SaveState/SaveStateTools.js')
      .addIncludeFile(
        'Extensions/SaveState/SaveConfigurationRuntimeBehavior.js'
      )
      .setFunctionName('gdjs.saveState.getSecondsSinceLastLoad')
      .setGetter('gdjs.saveState.getSecondsSinceLastLoad');

    extension
      .addCondition(
        'SaveJustSucceeded',
        _('Save just succeeded'),
        _('The last save attempt just succeeded.'),
        _('Save just succeeded'),
        _('Save'),
        'res/actions/saveDown.svg',
        'res/actions/saveDown.svg'
      )
      .addCodeOnlyParameter('currentScene', '')
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/SaveState/SaveStateTools.js')
      .addIncludeFile(
        'Extensions/SaveState/SaveConfigurationRuntimeBehavior.js'
      )
      .setFunctionName('gdjs.saveState.hasSaveJustSucceeded');

    extension
      .addCondition(
        'SaveJustFailed',
        _('Save just failed'),
        _('The last save attempt just failed.'),
        _('Save just failed'),
        _('Save'),
        'res/actions/saveDown.svg',
        'res/actions/saveDown.svg'
      )
      .addCodeOnlyParameter('currentScene', '')
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/SaveState/SaveStateTools.js')
      .addIncludeFile(
        'Extensions/SaveState/SaveConfigurationRuntimeBehavior.js'
      )
      .setFunctionName('gdjs.saveState.hasSaveJustFailed');

    extension
      .addCondition(
        'LoadJustSucceeded',
        _('Load just succeeded'),
        _('The last load attempt just succeeded.'),
        _('Load just succeeded'),
        _('Load'),
        'res/actions/saveUp.svg',
        'res/actions/saveUp.svg'
      )
      .addCodeOnlyParameter('currentScene', '')
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/SaveState/SaveStateTools.js')
      .addIncludeFile(
        'Extensions/SaveState/SaveConfigurationRuntimeBehavior.js'
      )
      .setFunctionName('gdjs.saveState.hasLoadJustSucceeded');

    extension
      .addCondition(
        'LoadJustFailed',
        _('Load just failed'),
        _('The last load attempt just failed.'),
        _('Load just failed'),
        _('Load'),
        'res/actions/saveUp.svg',
        'res/actions/saveUp.svg'
      )
      .addCodeOnlyParameter('currentScene', '')
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/SaveState/SaveStateTools.js')
      .addIncludeFile(
        'Extensions/SaveState/SaveConfigurationRuntimeBehavior.js'
      )
      .setFunctionName('gdjs.saveState.hasLoadJustFailed');

    extension
      .addAction(
        'SetVariableSaveConfiguration',
        _('Change the save configuration of a variable'),
        _(
          'Set if a scene or global variable should be saved in the default save state. Also allow to specify one or more profiles in which the variable should be saved.'
        ),
        _(
          'Change save configuration of _PARAM1_: save it in the default save states: _PARAM2_ and in profiles: _PARAM3_'
        ),
        _('Advanced configuration'),
        'res/actions/saveDown.svg',
        'res/actions/saveDown.svg'
      )
      .addCodeOnlyParameter('currentScene', '')
      .addParameter(
        'variable',
        _('Variable for which configuration should be changed'),
        '',
        false
      )
      .addParameter('yesorno', _('Persist in default save states'), '', false)
      .setDefaultValue('yes')
      .addParameter(
        'string',
        _('Profiles in which the variable should be saved'),
        '',
        true
      )
      .setDefaultValue('')
      .setParameterLongDescription(
        _(
          'Comma-separated list of profile names in which the variable will be saved. When a save state is created with one or more profile names specified, the variable will be saved only if it matches one of these profiles.'
        )
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/SaveState/SaveStateTools.js')
      .addIncludeFile(
        'Extensions/SaveState/SaveConfigurationRuntimeBehavior.js'
      )
      .setFunctionName('gdjs.saveState.setVariableSaveConfiguration');

    extension
      .addAction(
        'SetGameDataSaveConfiguration',
        _('Change the save configuration of the global game data'),
        _(
          'Set if the global game data (audio & global variables) should be saved in the default save state. Also allow to specify one or more profiles in which the global game data should be saved.'
        ),
        _(
          'Change save configuration of global game data: save them in the default save states: _PARAM1_ and in profiles: _PARAM2_'
        ),
        _('Advanced configuration'),
        'res/actions/saveDown.svg',
        'res/actions/saveDown.svg'
      )
      .addCodeOnlyParameter('currentScene', '')
      .addParameter('yesorno', _('Persist in default save states'), '', false)
      .setDefaultValue('yes')
      .addParameter(
        'string',
        _('Profiles in which the global game data should be saved'),
        '',
        true
      )
      .setDefaultValue('')
      .setParameterLongDescription(
        _(
          'Comma-separated list of profile names in which the global game data will be saved. When a save state is created with one or more profile names specified, the global game data will be saved only if it matches one of these profiles.'
        )
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/SaveState/SaveStateTools.js')
      .addIncludeFile(
        'Extensions/SaveState/SaveConfigurationRuntimeBehavior.js'
      )
      .setFunctionName('gdjs.saveState.setGameDataSaveConfiguration');

    extension
      .addAction(
        'SetSceneDataSaveConfiguration',
        _('Change the save configuration of a scene data'),
        _(
          'Set if the data of the specified scene (scene variables, timers, trigger once, wait actions, layers, etc.) should be saved in the default save state. Also allow to specify one or more profiles in which the scene data should be saved. Note: objects are always saved separately from the scene data (use the "Save Configuration" behavior to customize the configuration of objects).'
        ),
        _(
          'Change save configuration of scene _PARAM1_: save it in the default save states: _PARAM2_ and in profiles: _PARAM3_'
        ),
        _('Advanced configuration'),
        'res/actions/saveDown.svg',
        'res/actions/saveDown.svg'
      )
      .addCodeOnlyParameter('currentScene', '')
      .addParameter(
        'sceneName',
        _('Scene name for which configuration should be changed'),
        '',
        false
      )
      .addParameter('yesorno', _('Persist in default save states'), '', false)
      .setDefaultValue('yes')
      .addParameter(
        'string',
        _('Profiles in which the scene data should be saved'),
        '',
        true
      )
      .setDefaultValue('')
      .setParameterLongDescription(
        _(
          'Comma-separated list of profile names in which the scene data will be saved. When a save state is created with one or more profile names specified, the scene data will be saved only if it matches one of these profiles.'
        )
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/SaveState/SaveStateTools.js')
      .addIncludeFile(
        'Extensions/SaveState/SaveConfigurationRuntimeBehavior.js'
      )
      .setFunctionName('gdjs.saveState.setSceneDataSaveConfiguration');

    // Save Configuration behavior
    const saveConfigurationBehavior = new gd.BehaviorJsImplementation();

    saveConfigurationBehavior.updateProperty = function (
      behaviorContent,
      propertyName,
      newValue
    ) {
      if (propertyName === 'defaultProfilePersistence') {
        const normalizedValue = newValue.toLowerCase();
        if (normalizedValue === 'persisted') {
          behaviorContent
            .getOrCreateChild('defaultProfilePersistence')
            .setStringValue('Persisted');
          return true;
        }
        if (normalizedValue === 'donotsave') {
          behaviorContent
            .getOrCreateChild('defaultProfilePersistence')
            .setStringValue('DoNotSave');
          return true;
        }
        return false;
      }
      if (propertyName === 'persistedInProfiles') {
        behaviorContent
          .getOrCreateChild('persistedInProfiles')
          .setStringValue(newValue);
        return true;
      }

      return false;
    };

    saveConfigurationBehavior.getProperties = function (behaviorContent) {
      const behaviorProperties = new gd.MapStringPropertyDescriptor();

      behaviorProperties
        .getOrCreate('defaultProfilePersistence')
        .setValue(
          behaviorContent.getChild('defaultProfilePersistence').getStringValue()
        )
        .setType('Choice')
        .setLabel(_('Persistence mode'))
        .addChoice('Persisted', _('Include in save states (default)'))
        .addChoice('DoNotSave', _('Do not save'));

      behaviorProperties
        .getOrCreate('persistedInProfiles')
        .setValue(
          behaviorContent.getChild('persistedInProfiles').getStringValue()
        )
        .setType('String')
        .setLabel(_('Save profile names'))
        .setDescription(
          _(
            'Comma-separated list of profile names in which the object is saved. When a save state is created with one or more profile names specified, the object will be saved only if it matches one of these profiles.'
          )
        )
        .setAdvanced(true);

      return behaviorProperties;
    };

    saveConfigurationBehavior.initializeContent = function (behaviorContent) {
      behaviorContent
        .addChild('defaultProfilePersistence')
        .setStringValue('Persisted');
      behaviorContent.addChild('persistedInProfiles').setStringValue('');
    };

    const sharedData = new gd.BehaviorsSharedData();

    extension
      .addBehavior(
        'SaveConfiguration',
        _('Save state configuration'),
        'SaveConfiguration',
        _('Allow the customize how the object is persisted in a save state.'),
        '',
        'res/actions/saveUp.svg',
        'SaveConfiguration',
        // @ts-ignore - TODO: Fix type being a BehaviorJsImplementation instead of an Behavior
        saveConfigurationBehavior,
        sharedData
      )
      .setQuickCustomizationVisibility(gd.QuickCustomization.Hidden)
      .setIncludeFile('Extensions/SaveState/SaveStateTools.js')
      .addIncludeFile(
        'Extensions/SaveState/SaveConfigurationRuntimeBehavior.js'
      );

    return extension;
  },
  runExtensionSanityTests: function (gd, extension) {
    return [];
  },
};
