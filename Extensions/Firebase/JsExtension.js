/**
 * This is a declaration of an extension for GDevelop 5.
 *
 * ℹ️ Run `node import-GDJS-Runtime.js` (in newIDE/app/scripts) if you make any change
 * to this extension file or to any other *.js file that you reference inside.
 *
 * The file must be named "JsExtension.js", otherwise GDevelop won't load it.
 * ⚠️ If you make a change and the extension is not loaded, open the developer console
 * and search for any errors.
 *
 * More information on https://github.com/4ian/GDevelop/blob/master/newIDE/README-extensions.md
 */
module.exports = {
    createExtension: function(_, gd) {
        const extension = new gd.PlatformExtension();

        extension
          .setExtensionInformation(
            'Firebase',
            _('Firebase'),
            _('Use google Firebase features in GDevelop'),
            'Arthur Pacaud (arthuro555)',
            'MIT'
          )
          .setExtensionHelpPath('/all-features/firebase');

        extension
          .addAction(
            'EnableAnalytics',
            _('Enable Firebase Analytics'),
            _(
              'Enables analytics on your game.' + 
              'While analyticas can work without that step you should ' + 
              'always have this step when using those.'
              ),
            _('Enable Firebase Analytics'),
            _('Firebase/Analytics'),
            'JsPlatform/Extensions/filesystem_save_file24.png',
            'JsPlatform/Extensions/filesystem_save_file32.png'
          )
          .addCodeOnlyParameter('currentScene', '')
          .getCodeExtraInformation()
          .setIncludeFile('Extensions/Firebase/firebasejs/A_firebase-base.js')
          .addIncludeFile('Extensions/Firebase/firebasejs/firebase-analytics.js')
          .addIncludeFile('Extensions/Firebase/firebasetools.js')
          .setFunctionName('gdjs.evtTools.firebase.analytics.enable');

        extension
          .addAction(
            'AnalyticsLog',
            _('Log an Event'),
            _(
              'Triggers an Event/Conversion for the current user on the Analytics.' + 
              'Can also pass additional data to the Analytics'
             ),
            _('Trigger Event _PARAM1_ with argument _PARAM2_'),
            _('Firebase/Analytics'),
            'JsPlatform/Extensions/filesystem_save_file24.png',
            'JsPlatform/Extensions/filesystem_save_file32.png'
          )
          .addCodeOnlyParameter('currentScene', '')
          .addParameter('string', _('Event Name'), '', false)
          .addParameter('string', _('Additional Data'), '', false)
          .getCodeExtraInformation()
          .setIncludeFile('Extensions/Firebase/firebasejs/A_firebase-base.js')
          .addIncludeFile('Extensions/Firebase/firebasejs/firebase-analytics.js')
          .addIncludeFile('Extensions/Firebase/firebasetools.js')
          .setFunctionName('gdjs.evtTools.firebase.analytics.log');

        extension
          .addAction(
            'AnalyticsSetUID',
            _('Change user UID'),
            _(
              'Changes the current user\'s analytics identifier. ' +
              'This is what let Analytics differienciate users, ' + 
              'so it should always be unique for each user. ' + 
              'Only mess with that if you know what you are doing!'
             ),
            _('Set current user\'s ID to _PARAM1_'),
            _('Firebase/Analytics'),
            'JsPlatform/Extensions/filesystem_save_file24.png',
            'JsPlatform/Extensions/filesystem_save_file32.png'
          )
          .addCodeOnlyParameter('currentScene', '')
          .addParameter('string', _('New Unique ID'), '', false)
          .markAsComplex()
          .getCodeExtraInformation()
          .setIncludeFile('Extensions/Firebase/firebasejs/A_firebase-base.js')
          .addIncludeFile('Extensions/Firebase/firebasejs/firebase-analytics.js')
          .addIncludeFile('Extensions/Firebase/firebasetools.js')
          .setFunctionName('gdjs.evtTools.firebase.analytics.setUserID');
        
        extension
          .addAction(
            'AnalyticsSetProperty',
            _('Set a user\'s property'),
            _(
              'Sets an user\'s properties.' + 
              'Can be used to classify users in Analytics.'
             ),
            _('Set property _PARAM1_ of the current user to _PARAM2_'),
            _('Firebase/Analytics'),
            'JsPlatform/Extensions/filesystem_save_file24.png',
            'JsPlatform/Extensions/filesystem_save_file32.png'
          )
          .addCodeOnlyParameter('currentScene', '')
          .addParameter('string', _('Property Name'), '', false)
          .addParameter('string', _('Property Data'), '', false)
          .markAsAdvanced()
          .getCodeExtraInformation()
          .setIncludeFile('Extensions/Firebase/firebasejs/A_firebase-base.js')
          .addIncludeFile('Extensions/Firebase/firebasejs/firebase-analytics.js')
          .addIncludeFile('Extensions/Firebase/firebasetools.js')
          .setFunctionName('gdjs.evtTools.firebase.analytics.setProperty');
        return extension;
    },
    runExtensionSanityTests: function(gd, extension) {
        return [];
    },
}
