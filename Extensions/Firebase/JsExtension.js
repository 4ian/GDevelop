//@ts-check
/// <reference path="../JsExtensionTypes.d.ts" />
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

/** @type {ExtensionModule} */
module.exports = {
  createExtension: function (_, gd) {
    const extension = new gd.PlatformExtension();

    extension
      .setExtensionInformation(
        'Firebase',
        _('Firebase'),
        _(
          'Use Google Firebase services (database, functions, storage...) in your game.'
        ),
        'Arthur Pacaud (arthuro555)',
        'MIT'
      )
      .setExtensionHelpPath('/all-features/firebase')
      .setCategory('Network');
    extension
      .addInstructionOrExpressionGroupMetadata(_('Firebase'))
      .setIcon('JsPlatform/Extensions/firebase.png');

    extension
      .registerProperty('FirebaseConfig')
      .setLabel(_('Firebase configuration string'))
      .setType('textarea');

    /* ====== ANALYTICS ====== */
    extension
      .addAction(
        'AnalyticsEnable',
        _('Enable analytics'),
        _('Enables Analytics for that project.'),
        _('Enable analytics'),
        _('Analytics'),
        'JsPlatform/Extensions/firebase.png',
        'JsPlatform/Extensions/firebase.png'
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Firebase/A_firebasejs/A_firebase-base.js')
      .addIncludeFile(
        'Extensions/Firebase/A_firebasejs/B_firebase-analytics.js'
      )
      .addIncludeFile('Extensions/Firebase/B_firebasetools/C_firebasetools.js')
      .addIncludeFile('Extensions/Firebase/B_firebasetools/D_analyticstools.js')
      .setFunctionName('firebase.analytics');

    extension
      .addAction(
        'AnalyticsLog',
        _('Log an Event'),
        _(
          'Triggers an Event/Conversion for the current user on the Analytics.' +
            'Can also pass additional data to the Analytics'
        ),
        _('Trigger Event _PARAM0_ with argument _PARAM1_'),
        _('Analytics'),
        'JsPlatform/Extensions/firebase.png',
        'JsPlatform/Extensions/firebase.png'
      )
      .addParameter('string', _('Event Name'), '', false)
      .addParameter('string', _('Additional Data'), '', false)
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Firebase/A_firebasejs/A_firebase-base.js')
      .addIncludeFile(
        'Extensions/Firebase/A_firebasejs/B_firebase-analytics.js'
      )
      .addIncludeFile('Extensions/Firebase/B_firebasetools/C_firebasetools.js')
      .addIncludeFile('Extensions/Firebase/B_firebasetools/D_analyticstools.js')
      .setFunctionName('gdjs.evtTools.firebaseTools.analytics.log');

    extension
      .addAction(
        'AnalyticsSetUID',
        _('User UID'),
        _(
          "Changes the current user's analytics identifier. " +
            'This is what let Analytics differentiate user, ' +
            'so it should always be unique for each user. ' +
            'For advanced usage only.'
        ),
        _("Set current user's ID to _PARAM0_"),
        _('Analytics'),
        'JsPlatform/Extensions/firebase.png',
        'JsPlatform/Extensions/firebase.png'
      )
      .addParameter('string', _('New Unique ID'), '', false)
      .markAsComplex()
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Firebase/A_firebasejs/A_firebase-base.js')
      .addIncludeFile(
        'Extensions/Firebase/A_firebasejs/B_firebase-analytics.js'
      )
      .addIncludeFile('Extensions/Firebase/B_firebasetools/C_firebasetools.js')
      .addIncludeFile('Extensions/Firebase/B_firebasetools/D_analyticstools.js')
      .setFunctionName('gdjs.evtTools.firebaseTools.analytics.setUserID');

    extension
      .addAction(
        'AnalyticsSetProperty',
        _("Set a user's property"),
        _(
          "Sets an user's properties." +
            'Can be used to classify user in Analytics.'
        ),
        _('Set property _PARAM0_ of the current user to _PARAM1_'),
        _('Analytics'),
        'JsPlatform/Extensions/firebase.png',
        'JsPlatform/Extensions/firebase.png'
      )
      .addParameter('string', _('Property Name'), '', false)
      .addParameter('string', _('Property Data'), '', false)
      .markAsAdvanced()
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Firebase/A_firebasejs/A_firebase-base.js')
      .addIncludeFile(
        'Extensions/Firebase/A_firebasejs/B_firebase-analytics.js'
      )
      .addIncludeFile('Extensions/Firebase/B_firebasetools/C_firebasetools.js')
      .addIncludeFile('Extensions/Firebase/B_firebasetools/D_analyticstools.js')
      .setFunctionName('gdjs.evtTools.firebaseTools.analytics.setProperty');

    /* ====== REMOTE CONFIGURATION ====== */
    extension
      .addStrExpression(
        'GetRemoteConfigString',
        _('Get Remote setting as String'),
        _('Get a setting from Firebase Remote Config as a string.'),
        _('Remote Config'),
        'JsPlatform/Extensions/firebase.png'
      )
      .addParameter('string', _('Setting Name'), '', false)
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Firebase/A_firebasejs/A_firebase-base.js')
      .addIncludeFile(
        'Extensions/Firebase/A_firebasejs/B_firebase-remote-config.js'
      )
      .addIncludeFile('Extensions/Firebase/B_firebasetools/C_firebasetools.js')
      .addIncludeFile(
        'Extensions/Firebase/B_firebasetools/D_remoteconfigtools.js'
      )
      .setFunctionName('firebase.remoteConfig().getString');

    extension
      .addExpression(
        'GetRemoteConfigNumber',
        _('Get Remote setting as Number'),
        _('Get a setting from Firebase Remote Config as Number.'),
        _('Remote Config'),
        'JsPlatform/Extensions/firebase.png'
      )
      .addParameter('string', _('Setting Name'), '', false)
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Firebase/A_firebasejs/A_firebase-base.js')
      .addIncludeFile(
        'Extensions/Firebase/A_firebasejs/B_firebase-remote-config.js'
      )
      .addIncludeFile('Extensions/Firebase/B_firebasetools/C_firebasetools.js')
      .addIncludeFile(
        'Extensions/Firebase/B_firebasetools/D_remoteconfigtools.js'
      )
      .setFunctionName('firebase.remoteConfig().getNumber');

    extension
      .addAction(
        'SetRemoteConfigAutoUpdateInterval',
        _('Set Remote Config Auto Update Interval'),
        _('Sets Remote Config Auto Update Interval.'),
        _('Set Remote Config Auto Update Interval to _PARAM0_'),
        _('Remote Config'),
        'JsPlatform/Extensions/firebase.png',
        'JsPlatform/Extensions/firebase.png'
      )
      .addParameter('number', _('Update Interval in ms'), '', false)
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Firebase/A_firebasejs/A_firebase-base.js')
      .addIncludeFile(
        'Extensions/Firebase/A_firebasejs/B_firebase-remote-config.js'
      )
      .addIncludeFile('Extensions/Firebase/B_firebasetools/C_firebasetools.js')
      .addIncludeFile(
        'Extensions/Firebase/B_firebasetools/D_remoteconfigtools.js'
      )
      .setFunctionName(
        'gdjs.evtTools.firebaseTools.remoteConfig.setAutoUpdateInterval'
      );

    extension
      .addAction(
        'SetRemoteConfigDefaultConfig',
        _('Set the default configuration'),
        _(
          'As the Remote Config is stored online, you need to set default values ' +
            'or the Remote Config expressions to return while there is no internet or ' +
            'the config is still loading.'
        ),
        _('Set default config to _PARAM0_'),
        _('Remote Config'),
        'JsPlatform/Extensions/firebase.png',
        'JsPlatform/Extensions/firebase.png'
      )
      .addParameter('scenevar', _('Structure with defaults'), '', false)
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Firebase/A_firebasejs/A_firebase-base.js')
      .addIncludeFile(
        'Extensions/Firebase/A_firebasejs/B_firebase-remote-config.js'
      )
      .addIncludeFile('Extensions/Firebase/B_firebasetools/C_firebasetools.js')
      .addIncludeFile(
        'Extensions/Firebase/B_firebasetools/D_remoteconfigtools.js'
      )
      .setFunctionName(
        'gdjs.evtTools.firebaseTools.remoteConfig.setDefaultConfig'
      );

    extension
      .addAction(
        'ForceReloadRemoteConfig',
        _('Force sync the configuration'),
        _('Use this to sync the Remote Config with the client at any time.'),
        _('Synchronize Remote Config'),
        _('Remote Config'),
        'JsPlatform/Extensions/firebase.png',
        'JsPlatform/Extensions/firebase.png'
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Firebase/A_firebasejs/A_firebase-base.js')
      .addIncludeFile(
        'Extensions/Firebase/A_firebasejs/B_firebase-remote-config.js'
      )
      .setFunctionName('firebase.remoteConfig().fetchAndActivate');

    /* ====== AUTHENTICATION ====== */
    // Auth Instructions
    extension
      .addAction(
        'CreateBasicAccount',
        _('Create account with email'),
        _('Create an account with email and password as credentials.'),
        _(
          'Create account with email _PARAM0_ and password _PARAM1_ (store result in _PARAM2_)'
        ),
        _('Authentication'),
        'JsPlatform/Extensions/firebase.png',
        'JsPlatform/Extensions/firebase.png'
      )
      .addParameter('string', _('Email'), '', false)
      .addParameter('string', _('Password'), '', false)
      .addParameter(
        'scenevar',
        _('Callback variable with state (ok or error)'),
        '',
        true
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Firebase/A_firebasejs/A_firebase-base.js')
      .addIncludeFile('Extensions/Firebase/A_firebasejs/B_firebase-auth.js')
      .addIncludeFile('Extensions/Firebase/B_firebasetools/C_firebasetools.js')
      .addIncludeFile('Extensions/Firebase/B_firebasetools/D_authtools.js')
      .setFunctionName(
        'gdjs.evtTools.firebaseTools.auth.createAccountWithEmail'
      );

    extension
      .addAction(
        'BasicAccountSignIn',
        _('Sign into an account with email'),
        _('Sign into an account with email and password as credentials. '),
        _(
          'Connect to account with email _PARAM0_ and password _PARAM1_ (store result in _PARAM2_)'
        ),
        _('Authentication'),
        'JsPlatform/Extensions/firebase.png',
        'JsPlatform/Extensions/firebase.png'
      )
      .addParameter('string', _('Email'), '', false)
      .addParameter('string', _('Password'), '', false)
      .addParameter(
        'scenevar',
        _('Callback variable with state (ok or error)'),
        '',
        true
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Firebase/A_firebasejs/A_firebase-base.js')
      .addIncludeFile('Extensions/Firebase/A_firebasejs/B_firebase-auth.js')
      .addIncludeFile('Extensions/Firebase/B_firebasetools/C_firebasetools.js')
      .addIncludeFile('Extensions/Firebase/B_firebasetools/D_authtools.js')
      .setFunctionName('gdjs.evtTools.firebaseTools.auth.signInWithEmail');

    extension
      .addAction(
        'Logout',
        _('Log out of the account'),
        _('Logs out of the current account. '),
        _('Log out from the account'),
        _('Authentication'),
        'JsPlatform/Extensions/firebase.png',
        'JsPlatform/Extensions/firebase.png'
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Firebase/A_firebasejs/A_firebase-base.js')
      .addIncludeFile('Extensions/Firebase/A_firebasejs/B_firebase-auth.js')
      .addIncludeFile('Extensions/Firebase/B_firebasetools/C_firebasetools.js')
      .addIncludeFile('Extensions/Firebase/B_firebasetools/D_authtools.js')
      .setFunctionName('firebase.auth().signOut');

    extension
      .addAction(
        'ProviderAccountSignIn',
        _('Sign into an account via an external provider'),
        _(
          "Signs into an account using an external provider's system. " +
            'The available providers are: "google", "facebook", "github" and "twitter".\n' +
            'Provider authentication only works in the browser! Not on previews or pc/mobile exports.'
        ),
        _(
          'Connect to account via provider _PARAM0_ (store result in _PARAM1_)'
        ),
        _('Authentication'),
        'JsPlatform/Extensions/firebase.png',
        'JsPlatform/Extensions/firebase.png'
      )
      .addParameter(
        'stringWithSelector',
        _('Provider'),
        '["google", "facebook", "github", "twitter"]',
        false
      )
      .addParameter(
        'scenevar',
        _('Callback variable with state (ok or error)'),
        '',
        true
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Firebase/A_firebasejs/A_firebase-base.js')
      .addIncludeFile('Extensions/Firebase/A_firebasejs/B_firebase-auth.js')
      .addIncludeFile('Extensions/Firebase/B_firebasetools/C_firebasetools.js')
      .addIncludeFile('Extensions/Firebase/B_firebasetools/D_authtools.js')
      .setFunctionName('gdjs.evtTools.firebaseTools.auth.signInWithProvider');

    extension
      .addAction(
        'AnonymousSignIn',
        _('Sign In as an anonymous guest'),
        _('Sign into a temporary anonymous account.'),
        _('Authenticate anonymously (store result in _PARAM0_)'),
        _('Authentication'),
        'JsPlatform/Extensions/firebase.png',
        'JsPlatform/Extensions/firebase.png'
      )
      .addParameter(
        'scenevar',
        _('Callback variable with state (ok or error)'),
        '',
        true
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Firebase/A_firebasejs/A_firebase-base.js')
      .addIncludeFile('Extensions/Firebase/A_firebasejs/B_firebase-auth.js')
      .addIncludeFile('Extensions/Firebase/B_firebasetools/C_firebasetools.js')
      .addIncludeFile('Extensions/Firebase/B_firebasetools/D_authtools.js')
      .setFunctionName('gdjs.evtTools.firebaseTools.auth.anonymSignIn');

    extension
      .addCondition(
        'IsSignedIn',
        _('Is the user signed in?'),
        _(
          'Checks if the user is signed in. \nYou should always use ' +
            'this before actions requiring authentications.'
        ),
        _('Check for authentication'),
        _('Authentication'),
        'JsPlatform/Extensions/firebase.png',
        'JsPlatform/Extensions/firebase.png'
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Firebase/A_firebasejs/A_firebase-base.js')
      .addIncludeFile('Extensions/Firebase/A_firebasejs/B_firebase-auth.js')
      .addIncludeFile('Extensions/Firebase/B_firebasetools/C_firebasetools.js')
      .addIncludeFile('Extensions/Firebase/B_firebasetools/D_authtools.js')
      .setFunctionName('gdjs.evtTools.firebaseTools.auth.isAuthenticated');

    extension
      .addStrExpression(
        'GetAuthToken',
        _('User authentication token'),
        _(
          'Get the user authentication token. The token is the proof of authentication.'
        ),
        _('Authentication'),
        'JsPlatform/Extensions/firebase.png'
      )
      .addParameter('string', _('Setting Name'), '', false)
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Firebase/A_firebasejs/A_firebase-base.js')
      .addIncludeFile('Extensions/Firebase/A_firebasejs/B_firebase-auth.js')
      .addIncludeFile('Extensions/Firebase/B_firebasetools/C_firebasetools.js')
      .addIncludeFile('Extensions/Firebase/B_firebasetools/D_authtools.js')
      .setFunctionName('gdjs.evtTools.firebaseTools.auth.token');

    // User management instructions
    extension
      .addCondition(
        'IsEmailVerified',
        _('Is the user email address verified'),
        _('Checks if the email address of the user got verified.'),
        _('The email of the user is verified'),
        _('Authentication/User Management'),
        'JsPlatform/Extensions/firebase.png',
        'JsPlatform/Extensions/firebase.png'
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Firebase/A_firebasejs/A_firebase-base.js')
      .addIncludeFile('Extensions/Firebase/A_firebasejs/B_firebase-auth.js')
      .addIncludeFile('Extensions/Firebase/B_firebasetools/C_firebasetools.js')
      .addIncludeFile('Extensions/Firebase/B_firebasetools/D_authtools.js')
      .setFunctionName(
        'gdjs.evtTools.firebaseTools.auth.userManagement.isEmailVerified'
      );

    extension
      .addStrExpression(
        'GetUserEmail',
        _('User email address'),
        _('Return the user email address.'),
        _('Authentication/User Management'),
        'JsPlatform/Extensions/firebase.png'
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Firebase/A_firebasejs/A_firebase-base.js')
      .addIncludeFile('Extensions/Firebase/A_firebasejs/B_firebase-auth.js')
      .addIncludeFile('Extensions/Firebase/B_firebasetools/C_firebasetools.js')
      .addIncludeFile('Extensions/Firebase/B_firebasetools/D_authtools.js')
      .setFunctionName(
        'gdjs.evtTools.firebaseTools.auth.userManagement.getEmail'
      );

    extension
      .addStrExpression(
        'GetAccountCreationTime',
        _('Accounts creation time'),
        _('Return the accounts creation time.'),
        _('Authentication/User Management'),
        'JsPlatform/Extensions/firebase.png'
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Firebase/A_firebasejs/A_firebase-base.js')
      .addIncludeFile('Extensions/Firebase/A_firebasejs/B_firebase-auth.js')
      .addIncludeFile('Extensions/Firebase/B_firebasetools/C_firebasetools.js')
      .addIncludeFile('Extensions/Firebase/B_firebasetools/D_authtools.js')
      .setFunctionName(
        'gdjs.evtTools.firebaseTools.auth.userManagement.getCreationTime'
      );

    extension
      .addStrExpression(
        'GetLastLoginTime',
        _('User last login time'),
        _('Return the user last login time.'),
        _('Authentication/User Management'),
        'JsPlatform/Extensions/firebase.png'
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Firebase/A_firebasejs/A_firebase-base.js')
      .addIncludeFile('Extensions/Firebase/A_firebasejs/B_firebase-auth.js')
      .addIncludeFile('Extensions/Firebase/B_firebasetools/C_firebasetools.js')
      .addIncludeFile('Extensions/Firebase/B_firebasetools/D_authtools.js')
      .setFunctionName(
        'gdjs.evtTools.firebaseTools.auth.userManagement.getLastLoginTime'
      );

    extension
      .addStrExpression(
        'GetUserDisplayName',
        _('User display name'),
        _('Return the user display name.'),
        _('Authentication/User Management'),
        'JsPlatform/Extensions/firebase.png'
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Firebase/A_firebasejs/A_firebase-base.js')
      .addIncludeFile('Extensions/Firebase/A_firebasejs/B_firebase-auth.js')
      .addIncludeFile('Extensions/Firebase/B_firebasetools/C_firebasetools.js')
      .addIncludeFile('Extensions/Firebase/B_firebasetools/D_authtools.js')
      .setFunctionName(
        'gdjs.evtTools.firebaseTools.auth.userManagement.getDisplayName'
      );

    extension
      .addStrExpression(
        'GetPhoneNumber',
        _('User phone number'),
        _('Return the user phone number.'),
        _('Authentication/User Management'),
        'JsPlatform/Extensions/firebase.png'
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Firebase/A_firebasejs/A_firebase-base.js')
      .addIncludeFile('Extensions/Firebase/A_firebasejs/B_firebase-auth.js')
      .addIncludeFile('Extensions/Firebase/B_firebasetools/C_firebasetools.js')
      .addIncludeFile('Extensions/Firebase/B_firebasetools/D_authtools.js')
      .setFunctionName(
        'gdjs.evtTools.firebaseTools.auth.userManagement.getPhoneNumber'
      );

    extension
      .addStrExpression(
        'GetUserUID',
        _('User UID'),
        _(
          'Return the user Unique IDentifier. Use that to link data to an ' +
            'user instead of the name or email.'
        ),
        _('Authentication/User Management'),
        'JsPlatform/Extensions/firebase.png'
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Firebase/A_firebasejs/A_firebase-base.js')
      .addIncludeFile('Extensions/Firebase/A_firebasejs/B_firebase-auth.js')
      .addIncludeFile('Extensions/Firebase/B_firebasetools/C_firebasetools.js')
      .addIncludeFile('Extensions/Firebase/B_firebasetools/D_authtools.js')
      .setFunctionName(
        'gdjs.evtTools.firebaseTools.auth.userManagement.getUID'
      );

    extension
      .addStrExpression(
        'GetTenantID',
        _('User tenant ID'),
        _('Return the user tenant ID. For advanced usage only.'),
        _('Authentication/User Management'),
        'JsPlatform/Extensions/firebase.png'
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Firebase/A_firebasejs/A_firebase-base.js')
      .addIncludeFile('Extensions/Firebase/A_firebasejs/B_firebase-auth.js')
      .addIncludeFile('Extensions/Firebase/B_firebasetools/C_firebasetools.js')
      .addIncludeFile('Extensions/Firebase/B_firebasetools/D_authtools.js')
      .setFunctionName(
        'gdjs.evtTools.firebaseTools.auth.userManagement.getTenantID'
      );

    extension
      .addStrExpression(
        'GetRefreshToken',
        _('User refresh token'),
        _('Return the user refresh token. For advanced usage only.'),
        _('Authentication/User Management'),
        'JsPlatform/Extensions/firebase.png'
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Firebase/A_firebasejs/A_firebase-base.js')
      .addIncludeFile('Extensions/Firebase/A_firebasejs/B_firebase-auth.js')
      .addIncludeFile('Extensions/Firebase/B_firebasetools/C_firebasetools.js')
      .addIncludeFile('Extensions/Firebase/B_firebasetools/D_authtools.js')
      .setFunctionName(
        'gdjs.evtTools.firebaseTools.auth.userManagement.getRefreshToken'
      );

    extension
      .addStrExpression(
        'GetPhotoURL',
        _('Profile picture URL'),
        _('Gets an URL to the user profile picture.'),
        _('Authentication/User Management'),
        'JsPlatform/Extensions/firebase.png'
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Firebase/A_firebasejs/A_firebase-base.js')
      .addIncludeFile('Extensions/Firebase/A_firebasejs/B_firebase-auth.js')
      .addIncludeFile('Extensions/Firebase/B_firebasetools/C_firebasetools.js')
      .addIncludeFile('Extensions/Firebase/B_firebasetools/D_authtools.js')
      .setFunctionName(
        'gdjs.evtTools.firebaseTools.auth.userManagement.getPhotoURL'
      );

    extension
      .addAction(
        'SendPasswordResetEmail',
        _('Send a password reset email'),
        _('Send a password reset link per email.'),
        _('Send a password reset email'),
        _('Authentication/User Management'),
        'JsPlatform/Extensions/firebase.png',
        'JsPlatform/Extensions/firebase.png'
      )
      .addParameter(
        'string',
        _('Email of the user whose password must be reset'),
        '',
        false
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Firebase/A_firebasejs/A_firebase-base.js')
      .addIncludeFile('Extensions/Firebase/A_firebasejs/B_firebase-auth.js')
      .addIncludeFile('Extensions/Firebase/B_firebasetools/C_firebasetools.js')
      .setFunctionName('firebase.auth().sendPasswordResetEmail');

    extension
      .addAction(
        'SendEmailVerification',
        _('Send a verification email'),
        _('Send a link per email to verify the user email.'),
        _('Send a verification email'),
        _('Authentication/User Management'),
        'JsPlatform/Extensions/firebase.png',
        'JsPlatform/Extensions/firebase.png'
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Firebase/A_firebasejs/A_firebase-base.js')
      .addIncludeFile('Extensions/Firebase/A_firebasejs/B_firebase-auth.js')
      .addIncludeFile('Extensions/Firebase/B_firebasetools/C_firebasetools.js')
      .addIncludeFile('Extensions/Firebase/B_firebasetools/D_authtools.js')
      .setFunctionName(
        'gdjs.evtTools.firebaseTools.auth.userManagement.sendVerificationEmail'
      );

    extension
      .addAction(
        'SetDisplayName',
        _('Display name'),
        _('Sets the user display name.'),
        _("Set the user's display name to _PARAM0_"),
        _('Authentication/User Management'),
        'JsPlatform/Extensions/firebase.png',
        'JsPlatform/Extensions/firebase.png'
      )
      .addParameter('string', _('New display name'), '', false)
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Firebase/A_firebasejs/A_firebase-base.js')
      .addIncludeFile('Extensions/Firebase/A_firebasejs/B_firebase-auth.js')
      .addIncludeFile('Extensions/Firebase/B_firebasetools/C_firebasetools.js')
      .addIncludeFile('Extensions/Firebase/B_firebasetools/D_authtools.js')
      .setFunctionName(
        'gdjs.evtTools.firebaseTools.auth.userManagement.setDisplayName'
      );

    extension
      .addAction(
        'SetPhotoURL',
        _('Profile picture'),
        _('Change the user profile picture URL to a new one.'),
        _("Change the user's profile picture URL to _PARAM0_"),
        _('Authentication/User Management'),
        'JsPlatform/Extensions/firebase.png',
        'JsPlatform/Extensions/firebase.png'
      )
      .addParameter('string', _('New profile picture URL'), '', false)
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Firebase/A_firebasejs/A_firebase-base.js')
      .addIncludeFile('Extensions/Firebase/A_firebasejs/B_firebase-auth.js')
      .addIncludeFile('Extensions/Firebase/B_firebasetools/C_firebasetools.js')
      .addIncludeFile('Extensions/Firebase/B_firebasetools/D_authtools.js')
      .setFunctionName(
        'gdjs.evtTools.firebaseTools.auth.userManagement.setPhotoURL'
      );

    // Advanced Authentication Instructions
    extension
      .addAction(
        'ChangeEmail',
        _('User email'),
        _(
          'This action is dangerous so it requires reauthentication.\n' +
            "Changes the user's email address."
        ),
        _(
          "Change the user's email to _PARAM0_ and store result in _PARAM4_ (send verification email: _PARAM3_)"
        ),
        _('Authentication/User Management/Advanced'),
        'JsPlatform/Extensions/firebase.png',
        'JsPlatform/Extensions/firebase.png'
      )
      .addParameter('string', _('Old email'), '', false)
      .addParameter('string', _('Password'), '', false)
      .addParameter('string', _('New email'), '', false)
      .addParameter(
        'yesorno',
        _('Send a verification email before doing the change?'),
        '',
        false
      )
      .setDefaultValue('true')
      .addParameter(
        'scenevar',
        _('Callback variable with state (ok or error)'),
        '',
        true
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Firebase/A_firebasejs/A_firebase-base.js')
      .addIncludeFile('Extensions/Firebase/A_firebasejs/B_firebase-auth.js')
      .addIncludeFile('Extensions/Firebase/B_firebasetools/C_firebasetools.js')
      .addIncludeFile('Extensions/Firebase/B_firebasetools/D_authtools.js')
      .setFunctionName(
        'gdjs.evtTools.firebaseTools.auth.userManagement.dangerous.changeEmail'
      );

    extension
      .addAction(
        'ChangeEmailProvider',
        _('User email (Provider)'),
        _(
          'This action is dangerous so it requires reauthentication.\n' +
            "Changes the user's email address.\n" +
            'This is the same as Change the user email but reauthenticates via an external provider.'
        ),
        _(
          "Change the user's email to _PARAM0_ and store result in _PARAM2_ (send verification email: _PARAM1_)"
        ),
        _('Authentication/User Management/Advanced'),
        'JsPlatform/Extensions/firebase.png',
        'JsPlatform/Extensions/firebase.png'
      )
      .addParameter('string', _('New email'), '', false)
      .addParameter(
        'yesorno',
        _('Send a verification email before doing the change?'),
        '',
        false
      )
      .setDefaultValue('true')
      .addParameter(
        'scenevar',
        _('Callback variable with state (ok or error)'),
        '',
        true
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Firebase/A_firebasejs/A_firebase-base.js')
      .addIncludeFile('Extensions/Firebase/A_firebasejs/B_firebase-auth.js')
      .addIncludeFile('Extensions/Firebase/B_firebasetools/C_firebasetools.js')
      .addIncludeFile('Extensions/Firebase/B_firebasetools/D_authtools.js')
      .setFunctionName(
        'gdjs.evtTools.firebaseTools.auth.userManagement.dangerous.changeEmailProvider'
      );

    extension
      .addAction(
        'ChangePassword',
        _('User password'),
        _(
          'This action is dangerous so it requires reauthentication.\n' +
            'Changes the user password.'
        ),
        _(
          'Change the user password to _PARAM2_ and store result in ' +
            '_PARAM4_ (send verification email: _PARAM3_)'
        ),
        _('Authentication/User Management/Advanced'),
        'JsPlatform/Extensions/firebase.png',
        'JsPlatform/Extensions/firebase.png'
      )
      .addParameter('string', _('Email'), '', false)
      .addParameter('string', _('Old password'), '', false)
      .addParameter('string', _('New password'), '', false)
      .addParameter(
        'yesorno',
        _('Send a verification email before doing the change?'),
        '',
        false
      )
      .setDefaultValue('true')
      .addParameter(
        'scenevar',
        _('Callback variable with state (ok or error)'),
        '',
        true
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Firebase/A_firebasejs/A_firebase-base.js')
      .addIncludeFile('Extensions/Firebase/A_firebasejs/B_firebase-auth.js')
      .addIncludeFile('Extensions/Firebase/B_firebasetools/C_firebasetools.js')
      .addIncludeFile('Extensions/Firebase/B_firebasetools/D_authtools.js')
      .setFunctionName(
        'gdjs.evtTools.firebaseTools.auth.userManagement.dangerous.changePassword'
      );

    extension
      .addAction(
        'ChangePasswordProvider',
        _('User password (Provider)'),
        _(
          'This action is dangerous so it requires reauthentication.\n' +
            'Changes the user password.\n' +
            'This is the same as "Change the user password" but reauthenticates via an external provider.'
        ),
        _(
          'Change the user password to _PARAM0_ and store result in ' +
            '_PARAM2_ (send verification email: _PARAM1_)'
        ),
        _('Authentication/User Management/Advanced'),
        'JsPlatform/Extensions/firebase.png',
        'JsPlatform/Extensions/firebase.png'
      )
      .addParameter('string', _('New Password'), '', false)
      .addParameter(
        'yesorno',
        _('Send a verification email before doing the change?'),
        '',
        false
      )
      .setDefaultValue('true')
      .addParameter(
        'scenevar',
        _('Callback variable with state (ok or error)'),
        '',
        true
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Firebase/A_firebasejs/A_firebase-base.js')
      .addIncludeFile('Extensions/Firebase/A_firebasejs/B_firebase-auth.js')
      .addIncludeFile('Extensions/Firebase/B_firebasetools/C_firebasetools.js')
      .addIncludeFile('Extensions/Firebase/B_firebasetools/D_authtools.js')
      .setFunctionName(
        'gdjs.evtTools.firebaseTools.auth.userManagement.dangerous.changePasswordProvider'
      );

    extension
      .addAction(
        'DeleteUser',
        _('Delete the user account'),
        _(
          'This action is dangerous so it requires reauthentication.\n' +
            'Deletes the user account.'
        ),
        _('Delete the user account and store result in _PARAM2_'),
        _('Authentication/User Management/Advanced'),
        'JsPlatform/Extensions/firebase.png',
        'JsPlatform/Extensions/firebase.png'
      )
      .addParameter('string', _('Email'), '', false)
      .addParameter('string', _('Password'), '', false)
      .addParameter(
        'scenevar',
        _('Callback variable with state (ok or error)'),
        '',
        true
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Firebase/A_firebasejs/A_firebase-base.js')
      .addIncludeFile('Extensions/Firebase/A_firebasejs/B_firebase-auth.js')
      .addIncludeFile('Extensions/Firebase/B_firebasetools/C_firebasetools.js')
      .addIncludeFile('Extensions/Firebase/B_firebasetools/D_authtools.js')
      .setFunctionName(
        'gdjs.evtTools.firebaseTools.auth.userManagement.dangerous.deleteUser'
      );

    extension
      .addAction(
        'DeleteUserProvider',
        _('Delete the user account (Provider)'),
        _(
          'This action is dangerous so it requires reauthentication.\n' +
            'Deletes the user account.\n' +
            'This is the same as "Delete the user account" but reauthenticates via an external provider.'
        ),
        _('Delete the user account and store result in _PARAM0_'),
        _('Authentication/User Management/Advanced'),
        'JsPlatform/Extensions/firebase.png',
        'JsPlatform/Extensions/firebase.png'
      )
      .addParameter(
        'scenevar',
        _('Callback variable with state (ok or error)'),
        '',
        true
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Firebase/A_firebasejs/A_firebase-base.js')
      .addIncludeFile('Extensions/Firebase/A_firebasejs/B_firebase-auth.js')
      .addIncludeFile('Extensions/Firebase/B_firebasetools/C_firebasetools.js')
      .addIncludeFile('Extensions/Firebase/B_firebasetools/D_authtools.js')
      .setFunctionName(
        'gdjs.evtTools.firebaseTools.auth.userManagement.dangerous.deleteUserProvider'
      );

    /* ====== PERFORMANCE ====== */

    extension
      .addAction(
        'EnablePerformance',
        _('Enable performance measuring'),
        _('Enables performance measuring.'),
        _('Enable performance measuring'),
        _('Performance Measuring'),
        'JsPlatform/Extensions/firebase.png',
        'JsPlatform/Extensions/firebase.png'
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Firebase/A_firebasejs/A_firebase-base.js')
      .addIncludeFile(
        'Extensions/Firebase/A_firebasejs/B_firebase-performance.js'
      )
      .addIncludeFile('Extensions/Firebase/B_firebasetools/C_firebasetools.js')
      .setFunctionName('firebase.performance');

    extension
      .addAction(
        'AddTracer',
        _('Create a custom performance tracker'),
        _(
          "Creates a new custom performance tracker (If it doesn't already exists). " +
            'They are used to measure performance of custom events.'
        ),
        _('Create performance tracker: _PARAM0_'),
        _('Performance Measuring'),
        'JsPlatform/Extensions/firebase.png',
        'JsPlatform/Extensions/firebase.png'
      )
      .addParameter('string', _('Tracker Name'), '', false)
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Firebase/A_firebasejs/A_firebase-base.js')
      .addIncludeFile(
        'Extensions/Firebase/A_firebasejs/B_firebase-performance.js'
      )
      .addIncludeFile('Extensions/Firebase/B_firebasetools/C_firebasetools.js')
      .addIncludeFile(
        'Extensions/Firebase/B_firebasetools/D_performancetools.js'
      )
      .setFunctionName('gdjs.evtTools.firebaseTools.performance.getTracer');

    extension
      .addAction(
        'StartTracer',
        _('Start a tracer'),
        _('Start measuring performance for that tracer'),
        _('Start performance measuring on tracer _PARAM0_'),
        _('Performance Measuring'),
        'JsPlatform/Extensions/firebase.png',
        'JsPlatform/Extensions/firebase.png'
      )
      .addParameter('string', _('Tracker Name'), '', false)
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Firebase/A_firebasejs/A_firebase-base.js')
      .addIncludeFile(
        'Extensions/Firebase/A_firebasejs/B_firebase-performance.js'
      )
      .addIncludeFile('Extensions/Firebase/B_firebasetools/C_firebasetools.js')
      .addIncludeFile(
        'Extensions/Firebase/B_firebasetools/D_performancetools.js'
      )
      .setFunctionName('gdjs.evtTools.firebaseTools.performance.startTracer');

    extension
      .addAction(
        'StopTracer',
        _('Stop a tracer'),
        _('Stop measuring performance for that tracer'),
        _('Stop performance measuring on tracer _PARAM0_'),
        _('Performance Measuring'),
        'JsPlatform/Extensions/firebase.png',
        'JsPlatform/Extensions/firebase.png'
      )
      .addParameter('string', _('Tracker Name'), '', false)
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Firebase/A_firebasejs/A_firebase-base.js')
      .addIncludeFile(
        'Extensions/Firebase/A_firebasejs/B_firebase-performance.js'
      )
      .addIncludeFile('Extensions/Firebase/B_firebasetools/C_firebasetools.js')
      .addIncludeFile(
        'Extensions/Firebase/B_firebasetools/D_performancetools.js'
      )
      .setFunctionName('gdjs.evtTools.firebaseTools.performance.stopTracer');

    extension
      .addAction(
        'RecordTracer',
        _('Record performance'),
        _(
          'Record performance for a delimited period of time. ' +
            'Use this if you want to measure the performance for a specified duration.'
        ),
        _(
          'Record performance for _PARAM1_ms with a delay of _PARAM2_ms (store in tracker _PARAM0_)'
        ),
        _('Performance Measuring'),
        'JsPlatform/Extensions/firebase.png',
        'JsPlatform/Extensions/firebase.png'
      )
      .addParameter('string', _('Tracker Name'), '', false)
      .addParameter(
        'number',
        _('Delay before measuring start (in ms)'),
        '',
        false
      )
      .addParameter('number', _('Measuring duration (in ms)'), '', false)
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Firebase/A_firebasejs/A_firebase-base.js')
      .addIncludeFile(
        'Extensions/Firebase/A_firebasejs/B_firebase-performance.js'
      )
      .addIncludeFile('Extensions/Firebase/B_firebasetools/C_firebasetools.js')
      .addIncludeFile(
        'Extensions/Firebase/B_firebasetools/D_performancetools.js'
      )
      .setFunctionName(
        'gdjs.evtTools.firebaseTools.performance.recordPerformance'
      );

    /* ====== FUNCTIONS ====== */

    extension
      .addAction(
        'CallHttpFunction',
        _('Call a HTTP function'),
        _('Calls a HTTP function by name, and store the result in a variable.'),
        _(
          'Call HTTP Function _PARAM0_ with parameter(s) _PARAM1_ ' +
            '(Callback variables: Value: _PARAM2_ State: _PARAM3_)'
        ),
        _('Functions'),
        'JsPlatform/Extensions/firebase.png',
        'JsPlatform/Extensions/firebase.png'
      )
      .addParameter('string', _('HTTP Function Name'), '', false)
      .addParameter('string', _('Parameter(s) as JSON or string.'), '', false)
      .addParameter(
        'scenevar',
        _('Callback variable with returned value'),
        '',
        true
      )
      .addParameter(
        'scenevar',
        _('Callback variable with state (ok or error)'),
        '',
        true
      )
      .markAsAdvanced()
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Firebase/A_firebasejs/A_firebase-base.js')
      .addIncludeFile(
        'Extensions/Firebase/A_firebasejs/B_firebase-functions.js'
      )
      .addIncludeFile('Extensions/Firebase/B_firebasetools/C_firebasetools.js')
      .addIncludeFile('Extensions/Firebase/B_firebasetools/D_functionstools.js')
      .setFunctionName('gdjs.evtTools.firebaseTools.functions.call');

    /* ====== MESSAGING ====== */

    /* TODO: reported as needs a service worker, and auto generating one is not currently possible.
		extension
          .addAction(
            'EnableMessaging',
            _('Enable Messaging'),
			_('Enables Firebase push messaging.'),
			_('Enable Firebase Messaging with Public Key _PARAM0_.'),
            _('Messaging'),
			'JsPlatform/Extensions/firebase.png',
			'JsPlatform/Extensions/firebase.png'
		  )
		  .addParameter("string", _("Public Key (VAPID)"), "", false)
		  .getCodeExtraInformation()
          .setIncludeFile('Extensions/Firebase/A_firebasejs/A_firebase-base.js')
		  .addIncludeFile('Extensions/Firebase/A_firebasejs/B_firebase-messaging.js')
		  .addIncludeFile('Extensions/Firebase/A_firebasejs/firebase-messaging-sw.js')
		  .setFunctionName('firebase.messaging().usePublicVapidKey');

		*/

    /* ====== CLOUD FIRESTORE ====== */

    extension
      .addStrExpression(
        'ServerTimestamp',
        _('Get server timestamp'),
        _(
          'Set a field to the timestamp on the server when the request arrives there'
        ),
        _('Cloud Firestore Database'),
        'JsPlatform/Extensions/firebase.png'
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Firebase/A_firebasejs/A_firebase-base.js')
      .addIncludeFile(
        'Extensions/Firebase/A_firebasejs/B_firebase-firestore.js'
      )
      .addIncludeFile('Extensions/Firebase/B_firebasetools/C_firebasetools.js')
      .addIncludeFile(
        'Extensions/Firebase/B_firebasetools/D_cloudfirestoretools.js'
      )
      .setFunctionName(
        'gdjs.evtTools.firebaseTools.firestore.getServerTimestamp'
      );

    extension
      .addAction(
        'FirestoreStartQuery',
        _('Start a query'),
        _(
          'Start a query on a collection. ' +
            'A query allows to get a filtered and ordered list of documents in a collection.'
        ),
        _('Create a query named _PARAM0_ for collection _PARAM1_'),
        _('Cloud Firestore Database/Queries/Create'),
        'JsPlatform/Extensions/firebase.png',
        'JsPlatform/Extensions/firebase.png'
      )
      .addParameter('string', _('Query name'), '', false)
      .addParameter('string', _('Collection'), '', false)
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Firebase/A_firebasejs/A_firebase-base.js')
      .addIncludeFile(
        'Extensions/Firebase/A_firebasejs/B_firebase-firestore.js'
      )
      .addIncludeFile('Extensions/Firebase/B_firebasetools/C_firebasetools.js')
      .addIncludeFile(
        'Extensions/Firebase/B_firebasetools/D_cloudfirestoretools.js'
      )
      .setFunctionName('gdjs.evtTools.firebaseTools.firestore.startQuery');

    extension
      .addAction(
        'FirestoreStartQueryFrom',
        _('Start a query from another query'),
        _('Start a query with the same collection and filters as another one.'),
        _('Create a query named _PARAM0_ from query _PARAM1_'),
        _('Cloud Firestore Database/Queries/Create'),
        'JsPlatform/Extensions/firebase.png',
        'JsPlatform/Extensions/firebase.png'
      )
      .addParameter('string', _('Query name'), '', false)
      .addParameter('string', _('Source query name'), '', false)
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Firebase/A_firebasejs/A_firebase-base.js')
      .addIncludeFile(
        'Extensions/Firebase/A_firebasejs/B_firebase-firestore.js'
      )
      .addIncludeFile('Extensions/Firebase/B_firebasetools/C_firebasetools.js')
      .addIncludeFile(
        'Extensions/Firebase/B_firebasetools/D_cloudfirestoretools.js'
      )
      .setFunctionName('gdjs.evtTools.firebaseTools.firestore.startQueryFrom');

    const operatorDesc =
      'See the [Firebase documentation]' +
      '(https://firebase.google.com/docs/firestore/query-data/queries#query_operators) to understand the operators. ' +
      "It is important as some [don't work when combined]" +
      '(https://firebase.google.com/docs/firestore/query-data/queries#query_limitations).';

    extension
      .addAction(
        'FirestoreQueryWhereNumber',
        _('Filter by field value'),
        _('Only match the documents that have a field passing a check.'),
        _(
          'Filter query _PARAM0_ to only keep documents whose field _PARAM1__PARAM2__PARAM3_'
        ),
        _('Cloud Firestore Database/Queries/Filters'),
        'JsPlatform/Extensions/firebase.png',
        'JsPlatform/Extensions/firebase.png'
      )
      .addParameter('string', _('Query name'), '', false)
      .addParameter('string', _('Field to check'), '', false)
      .addParameter(
        'stringWithSelector',
        _('Check type'),
        '["<", "<=", "==", "!=", ">=", ">", "array-contains"]',
        false
      )
      .setParameterLongDescription(operatorDesc)
      .addParameter('expression', _('Value to check'), '', false)
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Firebase/A_firebasejs/A_firebase-base.js')
      .addIncludeFile(
        'Extensions/Firebase/A_firebasejs/B_firebase-firestore.js'
      )
      .addIncludeFile('Extensions/Firebase/B_firebasetools/C_firebasetools.js')
      .addIncludeFile(
        'Extensions/Firebase/B_firebasetools/D_cloudfirestoretools.js'
      )
      .setFunctionName('gdjs.evtTools.firebaseTools.firestore.queryWhere');

    extension
      .addAction(
        'FirestoreQueryWhereText',
        _('Filter by field text'),
        _('Only match the documents that have a field passing a check.'),
        _(
          'Filter query _PARAM0_ to remove documents whose field _PARAM1_ is not _PARAM2__PARAM3_'
        ),
        _('Cloud Firestore Database/Queries/Filters'),
        'JsPlatform/Extensions/firebase.png',
        'JsPlatform/Extensions/firebase.png'
      )
      .addParameter('string', _('Query name'), '', false)
      .addParameter('string', _('Field to check'), '', false)
      .addParameter(
        'stringWithSelector',
        _('Check type'),
        '["<", "<=", "==", "!=", ">=", ">", "array-contains"]',
        false
      )
      .setParameterLongDescription(operatorDesc)
      .addParameter('string', _('Text to check'), '', false)
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Firebase/A_firebasejs/A_firebase-base.js')
      .addIncludeFile(
        'Extensions/Firebase/A_firebasejs/B_firebase-firestore.js'
      )
      .addIncludeFile('Extensions/Firebase/B_firebasetools/C_firebasetools.js')
      .addIncludeFile(
        'Extensions/Firebase/B_firebasetools/D_cloudfirestoretools.js'
      )
      .setFunctionName('gdjs.evtTools.firebaseTools.firestore.queryWhere');

    extension
      .addAction(
        'FirestoreQueryOrderBy',
        _('Order by field value'),
        _('Orders all documents in the query by a the value of a field.'),
        _('Order query _PARAM0_ by field _PARAM1_ (direction: _PARAM2_)'),
        _('Cloud Firestore Database/Queries/Filters'),
        'JsPlatform/Extensions/firebase.png',
        'JsPlatform/Extensions/firebase.png'
      )
      .addParameter('string', _('Query name'), '', false)
      .addParameter('string', _('Field to order by'), '', false)
      .setParameterLongDescription(
        'Note that [some limitations may apply when combined with a where query](https://firebase.google.com/docs/firestore/query-data/order-limit-data#limitations).'
      )
      .addParameter(
        'stringWithSelector',
        _('Direction (ascending or descending)'),
        '["asc", "desc"]',
        false
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Firebase/A_firebasejs/A_firebase-base.js')
      .addIncludeFile(
        'Extensions/Firebase/A_firebasejs/B_firebase-firestore.js'
      )
      .addIncludeFile('Extensions/Firebase/B_firebasetools/C_firebasetools.js')
      .addIncludeFile(
        'Extensions/Firebase/B_firebasetools/D_cloudfirestoretools.js'
      )
      .setFunctionName('gdjs.evtTools.firebaseTools.firestore.queryOrderBy');

    extension
      .addAction(
        'FirestoreQueryLimit',
        _('Limit amount of documents'),
        _(
          'Limits the amount of documents returned by the query. Can only be used after an order filter.'
        ),
        _(
          'Limit query _PARAM0_ to _PARAM1_ documents (begin from the end: _PARAM2_)'
        ),
        _('Cloud Firestore Database/Queries/Filters'),
        'JsPlatform/Extensions/firebase.png',
        'JsPlatform/Extensions/firebase.png'
      )
      .addParameter('string', _('Query name'), '', false)
      .addParameter('expression', _('Amount to limit by'), '', false)
      .addParameter('yesorno', _('Begin from the end'), '', false)
      .setDefaultValue('false')
      .setParameterLongDescription(
        'If yes, the last X documents will be kept, else the first X documents will be kept.'
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Firebase/A_firebasejs/A_firebase-base.js')
      .addIncludeFile(
        'Extensions/Firebase/A_firebasejs/B_firebase-firestore.js'
      )
      .addIncludeFile('Extensions/Firebase/B_firebasetools/C_firebasetools.js')
      .addIncludeFile(
        'Extensions/Firebase/B_firebasetools/D_cloudfirestoretools.js'
      )
      .setFunctionName('gdjs.evtTools.firebaseTools.firestore.queryLimit');

    extension
      .addAction(
        'FirestoreQuerySkipSome',
        _('Skip some documents'),
        _(
          'Removes documents before or after a certain value on the field ordered by in a query. Can only be used after an order filter.'
        ),
        _(
          'Skip documents with fields (before: _PARAM2_) value _PARAM1_ in query _PARAM0_ (include documents at that value: _PARAM3_)'
        ),
        _('Cloud Firestore Database/Queries/Filters'),
        'JsPlatform/Extensions/firebase.png',
        'JsPlatform/Extensions/firebase.png'
      )
      .addParameter('string', _('Query name'), '', false)
      .addParameter(
        'expression',
        _('The value of the field ordered by to skip after'),
        '',
        false
      )
      .addParameter('yesorno', _('Skip documents before?'), '', false)
      .setParameterLongDescription(
        'If yes, the documents with a bigger field value will be kept, else the documents with a smaller field value be kept by the query.'
      )
      .addParameter(
        'yesorno',
        _(
          'Include documents which field value equals the value to skip after?'
        ),
        '',
        false
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Firebase/A_firebasejs/A_firebase-base.js')
      .addIncludeFile(
        'Extensions/Firebase/A_firebasejs/B_firebase-firestore.js'
      )
      .addIncludeFile('Extensions/Firebase/B_firebasetools/C_firebasetools.js')
      .addIncludeFile(
        'Extensions/Firebase/B_firebasetools/D_cloudfirestoretools.js'
      )
      .setFunctionName('gdjs.evtTools.firebaseTools.firestore.querySkipSome');

    extension
      .addAction(
        'FirestoreExecuteQuery',
        _('Run a query once'),
        _('Runs the query once and store results in a scene variable.'),
        _(
          'Run query _PARAM0_ and store results into _PARAM1_ (store result state in _PARAM2_)'
        ),
        _('Cloud Firestore Database/Queries/Run'),
        'JsPlatform/Extensions/firebase.png',
        'JsPlatform/Extensions/firebase.png'
      )
      .addParameter('string', _('Query name'), '', false)
      .addParameter(
        'scenevar',
        _('Callback variable where to load the results'),
        '',
        true
      )
      .setParameterLongDescription(
        'See how the data will be filled in this structure variable on [the wiki page](https://wiki.gdevelop.io/gdevelop5/all-features/firebase/firestore#the_query_result).'
      )
      .addParameter(
        'scenevar',
        _('Callback variable with state (ok or error message)'),
        '',
        true
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Firebase/A_firebasejs/A_firebase-base.js')
      .addIncludeFile(
        'Extensions/Firebase/A_firebasejs/B_firebase-firestore.js'
      )
      .addIncludeFile('Extensions/Firebase/B_firebasetools/C_firebasetools.js')
      .addIncludeFile(
        'Extensions/Firebase/B_firebasetools/D_cloudfirestoretools.js'
      )
      .setFunctionName('gdjs.evtTools.firebaseTools.firestore.executeQuery');

    extension
      .addAction(
        'FirestoreWatchQuery',
        _('Continuously run (watch) a query'),
        _(
          'Runs a query continuously, so that every time a new documents starts ' +
            'or stops matching the query, or a document that matches the query has been changed, the variables will be filled with the new results.'
        ),
        _(
          'Run query _PARAM0_ continuously and store results into _PARAM1_ each time documents matching the query are changed (store result state in _PARAM2_)'
        ),
        _('Cloud Firestore Database/Queries/Run'),
        'JsPlatform/Extensions/firebase.png',
        'JsPlatform/Extensions/firebase.png'
      )
      .addParameter('string', _('Query name'), '', false)
      .addParameter(
        'scenevar',
        _('Callback variable where to load the results'),
        '',
        true
      )
      .setParameterLongDescription(
        'See the shape of the returned data on [the wiki page]().'
      )
      .addParameter(
        'scenevar',
        _('Callback variable with state (ok or error message)'),
        '',
        true
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Firebase/A_firebasejs/A_firebase-base.js')
      .addIncludeFile(
        'Extensions/Firebase/A_firebasejs/B_firebase-firestore.js'
      )
      .addIncludeFile('Extensions/Firebase/B_firebasetools/C_firebasetools.js')
      .addIncludeFile(
        'Extensions/Firebase/B_firebasetools/D_cloudfirestoretools.js'
      )
      .setFunctionName('gdjs.evtTools.firebaseTools.firestore.watchQuery');

    extension
      .addAction(
        'FirestoreEnablePersistence',
        _('Enable persistence'),
        _(
          'When persistence is enabled, all data that is fetched ' +
            'from the database is being automatically stored to allow to ' +
            'continue accessing the data if cut off from the network, instead of waiting for reconnection.\n' +
            'This needs to be called before any other firestore operation, otherwise it will fail.'
        ),
        _('Enable persistence'),
        _('Cloud Firestore Database'),
        'JsPlatform/Extensions/firebase.png',
        'JsPlatform/Extensions/firebase.png'
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Firebase/A_firebasejs/A_firebase-base.js')
      .addIncludeFile(
        'Extensions/Firebase/A_firebasejs/B_firebase-firestore.js'
      )
      .addIncludeFile('Extensions/Firebase/B_firebasetools/C_firebasetools.js')
      .addIncludeFile(
        'Extensions/Firebase/B_firebasetools/D_cloudfirestoretools.js'
      )
      .setFunctionName('firebase.firestore().enablePersistence');

    extension
      .addAction(
        'FirestoreDisablePersistence',
        _('Disable persistence'),
        _(
          'Disables the storing of fetched data and clear all the data that has been stored.\n' +
            'This needs to be called before any other firestore operation, otherwise it will fail.'
        ),
        _('Disable persistence'),
        _('Cloud Firestore Database'),
        'JsPlatform/Extensions/firebase.png',
        'JsPlatform/Extensions/firebase.png'
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Firebase/A_firebasejs/A_firebase-base.js')
      .addIncludeFile(
        'Extensions/Firebase/A_firebasejs/B_firebase-firestore.js'
      )
      .addIncludeFile('Extensions/Firebase/B_firebasetools/C_firebasetools.js')
      .addIncludeFile(
        'Extensions/Firebase/B_firebasetools/D_cloudfirestoretools.js'
      )
      .setFunctionName('firebase.firestore().clearPersistence');

    extension
      .addAction(
        'FirestoreEnableNetwork',
        _('Re-enable network'),
        _('Re-enables the connection to the database after disabling it.'),
        _('Re-enable network'),
        _('Cloud Firestore Database'),
        'JsPlatform/Extensions/firebase.png',
        'JsPlatform/Extensions/firebase.png'
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Firebase/A_firebasejs/A_firebase-base.js')
      .addIncludeFile(
        'Extensions/Firebase/A_firebasejs/B_firebase-firestore.js'
      )
      .addIncludeFile('Extensions/Firebase/B_firebasetools/C_firebasetools.js')
      .addIncludeFile(
        'Extensions/Firebase/B_firebasetools/D_cloudfirestoretools.js'
      )
      .setFunctionName('firebase.firestore().enableNetwork');

    extension
      .addAction(
        'FirestoreDisableNetwork',
        _('Disable network'),
        _(
          'Disables the connection to the database.\n' +
            'While the network is disabled, any read operations will return results from ' +
            'cache, and any write operations will be queued until the network is restored.'
        ),
        _('Disable network'),
        _('Cloud Firestore Database'),
        'JsPlatform/Extensions/firebase.png',
        'JsPlatform/Extensions/firebase.png'
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Firebase/A_firebasejs/A_firebase-base.js')
      .addIncludeFile(
        'Extensions/Firebase/A_firebasejs/B_firebase-firestore.js'
      )
      .addIncludeFile('Extensions/Firebase/B_firebasetools/C_firebasetools.js')
      .addIncludeFile(
        'Extensions/Firebase/B_firebasetools/D_cloudfirestoretools.js'
      )
      .setFunctionName('firebase.firestore().disableNetwork');

    extension
      .addAction(
        'FirestoreWriteDocument',
        _('Write a document to firestore'),
        _('Writes a document (variable) to cloud firestore.'),
        _(
          'Write _PARAM2_ to firestore in document _PARAM1_ of collection _PARAM0_ (store result state in _PARAM3_)'
        ),
        _('Cloud Firestore Database/Documents'),
        'JsPlatform/Extensions/firebase.png',
        'JsPlatform/Extensions/firebase.png'
      )
      .addParameter('string', _('Collection'), '', false)
      .addParameter('string', _('Document'), '', false)
      .addParameter('scenevar', _('Variable to write'), '', false)
      .addParameter(
        'scenevar',
        _('Callback variable with state (ok or error)'),
        '',
        true
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Firebase/A_firebasejs/A_firebase-base.js')
      .addIncludeFile(
        'Extensions/Firebase/A_firebasejs/B_firebase-firestore.js'
      )
      .addIncludeFile('Extensions/Firebase/B_firebasetools/C_firebasetools.js')
      .addIncludeFile(
        'Extensions/Firebase/B_firebasetools/D_cloudfirestoretools.js'
      )
      .setFunctionName('gdjs.evtTools.firebaseTools.firestore.writeDocument');

    extension
      .addAction(
        'FirestoreAddDocument',
        _('Add a document to firestore'),
        _('Adds a document (variable) to cloud firestore with a unique name.'),
        _(
          'Add _PARAM1_ to firestore collection _PARAM0_ (store result state in _PARAM2_)'
        ),
        _('Cloud Firestore Database/Documents'),
        'JsPlatform/Extensions/firebase.png',
        'JsPlatform/Extensions/firebase.png'
      )
      .addParameter('string', _('Collection'), '', false)
      .addParameter('scenevar', _('Variable to write'), '', false)
      .addParameter(
        'scenevar',
        _('Callback variable with state (ok or error)'),
        '',
        true
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Firebase/A_firebasejs/A_firebase-base.js')
      .addIncludeFile(
        'Extensions/Firebase/A_firebasejs/B_firebase-firestore.js'
      )
      .addIncludeFile('Extensions/Firebase/B_firebasetools/C_firebasetools.js')
      .addIncludeFile(
        'Extensions/Firebase/B_firebasetools/D_cloudfirestoretools.js'
      )
      .setFunctionName('gdjs.evtTools.firebaseTools.firestore.addDocument');

    extension
      .addAction(
        'FirestoreWriteField',
        _('Write a field in firestore'),
        _('Writes a field of a firestore document.'),
        _(
          'Write _PARAM3_ to firestore in field _PARAM2_ of document _PARAM1_ in collection _PARAM0_ (store result state in _PARAM4_, merge instead of overwriting: _PARAM5_)'
        ),
        _('Cloud Firestore Database/Fields'),
        'JsPlatform/Extensions/firebase.png',
        'JsPlatform/Extensions/firebase.png'
      )
      .addParameter('string', _('Collection'), '', false)
      .addParameter('string', _('Document'), '', false)
      .addParameter('string', _('Field to write'), '', false)
      .addParameter('string', _('Value to write'), '', false)
      .addParameter(
        'scenevar',
        _('Callback variable with state (ok or error)'),
        '',
        true
      )
      .addParameter(
        'yesorno',
        _(
          'If the document already exists, merge them instead of replacing the old one?'
        ),
        '',
        true
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Firebase/A_firebasejs/A_firebase-base.js')
      .addIncludeFile(
        'Extensions/Firebase/A_firebasejs/B_firebase-firestore.js'
      )
      .addIncludeFile('Extensions/Firebase/B_firebasetools/C_firebasetools.js')
      .addIncludeFile(
        'Extensions/Firebase/B_firebasetools/D_cloudfirestoretools.js'
      )
      .setFunctionName('gdjs.evtTools.firebaseTools.firestore.writeField');

    extension
      .addAction(
        'FirestoreUpdateDocument',
        _('Update a document in firestore'),
        _('Updates a firestore document (variable).'),
        _(
          'Update firestore document _PARAM1_ in collection _PARAM0_ with _PARAM2_ (store result state in _PARAM3_)'
        ),
        _('Cloud Firestore Database/Documents'),
        'JsPlatform/Extensions/firebase.png',
        'JsPlatform/Extensions/firebase.png'
      )
      .addParameter('string', _('Collection'), '', false)
      .addParameter('string', _('Document'), '', false)
      .addParameter('scenevar', _('Variable to update with'), '', false)
      .addParameter(
        'scenevar',
        _('Callback variable with state (ok or error)'),
        '',
        true
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Firebase/A_firebasejs/A_firebase-base.js')
      .addIncludeFile(
        'Extensions/Firebase/A_firebasejs/B_firebase-firestore.js'
      )
      .addIncludeFile('Extensions/Firebase/B_firebasetools/C_firebasetools.js')
      .addIncludeFile(
        'Extensions/Firebase/B_firebasetools/D_cloudfirestoretools.js'
      )
      .setFunctionName('gdjs.evtTools.firebaseTools.firestore.updateDocument');

    extension
      .addAction(
        'FirestoreUpdateField',
        _('Update a field of a document'),
        _('Updates a field of a firestore document.'),
        _(
          'Update field _PARAM2_ of firestore document _PARAM1_ in collection _PARAM0_ with _PARAM3_ (store result state in _PARAM4_)'
        ),
        _('Cloud Firestore Database/Fields'),
        'JsPlatform/Extensions/firebase.png',
        'JsPlatform/Extensions/firebase.png'
      )
      .addParameter('string', _('Collection'), '', false)
      .addParameter('string', _('Document'), '', false)
      .addParameter('string', _('Field to update'), '', false)
      .addParameter('string', _('Value to write'), '', false)
      .addParameter(
        'scenevar',
        _('Callback variable with state (ok or error)'),
        '',
        true
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Firebase/A_firebasejs/A_firebase-base.js')
      .addIncludeFile(
        'Extensions/Firebase/A_firebasejs/B_firebase-firestore.js'
      )
      .addIncludeFile('Extensions/Firebase/B_firebasetools/C_firebasetools.js')
      .addIncludeFile(
        'Extensions/Firebase/B_firebasetools/D_cloudfirestoretools.js'
      )
      .setFunctionName('gdjs.evtTools.firebaseTools.firestore.updateField');

    extension
      .addAction(
        'FirestoreDeleteDocument',
        _('Delete a document in firestore'),
        _('Deletes a firestore document (variable).'),
        _(
          'Delete firestore document _PARAM1_ in collection _PARAM0_ (store result state in _PARAM2_)'
        ),
        _('Cloud Firestore Database/Documents'),
        'JsPlatform/Extensions/firebase.png',
        'JsPlatform/Extensions/firebase.png'
      )
      .addParameter('string', _('Collection'), '', false)
      .addParameter('string', _('Document'), '', false)
      .addParameter(
        'scenevar',
        _('Callback variable with state (ok or error)'),
        '',
        true
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Firebase/A_firebasejs/A_firebase-base.js')
      .addIncludeFile(
        'Extensions/Firebase/A_firebasejs/B_firebase-firestore.js'
      )
      .addIncludeFile('Extensions/Firebase/B_firebasetools/C_firebasetools.js')
      .addIncludeFile(
        'Extensions/Firebase/B_firebasetools/D_cloudfirestoretools.js'
      )
      .setFunctionName('gdjs.evtTools.firebaseTools.firestore.deleteDocument');

    extension
      .addAction(
        'FirestoreDeleteField',
        _('Delete a field of a document'),
        _('Deletes a field of a firestore document.'),
        _(
          'Delete field _PARAM2_ of firestore document _PARAM1_ in collection _PARAM0_ with (store result state in _PARAM3_)'
        ),
        _('Cloud Firestore Database/Fields'),
        'JsPlatform/Extensions/firebase.png',
        'JsPlatform/Extensions/firebase.png'
      )
      .addParameter('string', _('Collection'), '', false)
      .addParameter('string', _('Document'), '', false)
      .addParameter('string', _('Field to delete'), '', false)
      .addParameter(
        'scenevar',
        _('Callback variable with state (ok or error)'),
        '',
        true
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Firebase/A_firebasejs/A_firebase-base.js')
      .addIncludeFile(
        'Extensions/Firebase/A_firebasejs/B_firebase-firestore.js'
      )
      .addIncludeFile('Extensions/Firebase/B_firebasetools/C_firebasetools.js')
      .addIncludeFile(
        'Extensions/Firebase/B_firebasetools/D_cloudfirestoretools.js'
      )
      .setFunctionName('gdjs.evtTools.firebaseTools.firestore.deleteField');

    extension
      .addAction(
        'FirestoreGetDocument',
        _('Get a document from firestore'),
        _('Gets a firestore document and store it in a variable.'),
        _(
          'Load firestore document _PARAM1_ from collection _PARAM0_ into _PARAM2_ (store result state in _PARAM3_)'
        ),
        _('Cloud Firestore Database/Documents'),
        'JsPlatform/Extensions/firebase.png',
        'JsPlatform/Extensions/firebase.png'
      )
      .addParameter('string', _('Collection'), '', false)
      .addParameter('string', _('Document'), '', false)
      .addParameter(
        'scenevar',
        _('Callback variable where to load the document'),
        '',
        true
      )
      .addParameter(
        'scenevar',
        _('Callback variable with state (ok or error)'),
        '',
        true
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Firebase/A_firebasejs/A_firebase-base.js')
      .addIncludeFile(
        'Extensions/Firebase/A_firebasejs/B_firebase-firestore.js'
      )
      .addIncludeFile('Extensions/Firebase/B_firebasetools/C_firebasetools.js')
      .addIncludeFile(
        'Extensions/Firebase/B_firebasetools/D_cloudfirestoretools.js'
      )
      .setFunctionName('gdjs.evtTools.firebaseTools.firestore.getDocument');

    extension
      .addAction(
        'FirestoreGetField',
        _('Get a field of a document'),
        _('Return the value of a field in a firestore document.'),
        _(
          'Load field _PARAM2_ of firestore document _PARAM1_ in collection _PARAM0_ into _PARAM3_ (store result state in _PARAM4_)'
        ),
        _('Cloud Firestore Database/Fields'),
        'JsPlatform/Extensions/firebase.png',
        'JsPlatform/Extensions/firebase.png'
      )
      .addParameter('string', _('Collection'), '', false)
      .addParameter('string', _('Document'), '', false)
      .addParameter('string', _('Field to get'), '', false)
      .addParameter(
        'scenevar',
        _("Callback variable where to store the field's value"),
        '',
        true
      )
      .addParameter(
        'scenevar',
        _('Callback variable with state (ok or error)'),
        '',
        true
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Firebase/A_firebasejs/A_firebase-base.js')
      .addIncludeFile(
        'Extensions/Firebase/A_firebasejs/B_firebase-firestore.js'
      )
      .addIncludeFile('Extensions/Firebase/B_firebasetools/C_firebasetools.js')
      .addIncludeFile(
        'Extensions/Firebase/B_firebasetools/D_cloudfirestoretools.js'
      )
      .setFunctionName('gdjs.evtTools.firebaseTools.firestore.getField');

    extension
      .addAction(
        'FirestoreHasDocument',
        _("Check for a document's existence"),
        _(
          'Checks for the existence of a document. Sets the result variable to true if it exists else to false.'
        ),
        _(
          'Check for existence of _PARAM1_ in collection _PARAM0_ and store result in _PARAM2_ (store result state in _PARAM3_)'
        ),
        _('Cloud Firestore Database/Documents'),
        'JsPlatform/Extensions/firebase.png',
        'JsPlatform/Extensions/firebase.png'
      )
      .addParameter('string', _('Collection'), '', false)
      .addParameter('string', _('Document'), '', false)
      .addParameter(
        'scenevar',
        _('Callback variable where to store the result'),
        '',
        true
      )
      .addParameter(
        'scenevar',
        _('Callback variable with state (ok or error)'),
        '',
        true
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Firebase/A_firebasejs/A_firebase-base.js')
      .addIncludeFile(
        'Extensions/Firebase/A_firebasejs/B_firebase-firestore.js'
      )
      .addIncludeFile('Extensions/Firebase/B_firebasetools/C_firebasetools.js')
      .addIncludeFile(
        'Extensions/Firebase/B_firebasetools/D_cloudfirestoretools.js'
      )
      .setFunctionName('gdjs.evtTools.firebaseTools.firestore.hasDocument');

    extension
      .addAction(
        'FirestoreHasField',
        _("Check for existence of a document's field"),
        _(
          'Checks for the existence of a field in a document. Sets the result variable to 1 if it exists else to 2.'
        ),
        _(
          'Check for existence of _PARAM2_ in document _PARAM1_ of collection _PARAM0_ and store result in _PARAM3_ (store result state in _PARAM4_)'
        ),
        _('Cloud Firestore Database/Fields'),
        'JsPlatform/Extensions/firebase.png',
        'JsPlatform/Extensions/firebase.png'
      )
      .addParameter('string', _('Collection'), '', false)
      .addParameter('string', _('Document'), '', false)
      .addParameter('string', _('Field to check'), '', false)
      .addParameter(
        'scenevar',
        _('Callback Variable where to store the result'),
        '',
        true
      )
      .addParameter(
        'scenevar',
        _('Callback variable with state (ok or error)'),
        '',
        true
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Firebase/A_firebasejs/A_firebase-base.js')
      .addIncludeFile(
        'Extensions/Firebase/A_firebasejs/B_firebase-firestore.js'
      )
      .addIncludeFile('Extensions/Firebase/B_firebasetools/C_firebasetools.js')
      .addIncludeFile(
        'Extensions/Firebase/B_firebasetools/D_cloudfirestoretools.js'
      )
      .setFunctionName('gdjs.evtTools.firebaseTools.firestore.hasField');

    extension
      .addAction(
        'FirestoreListDocuments',
        _('List all documents of a collection'),
        _(
          'Generates a list of all document names in a collection, and stores it as a structure.'
        ),
        _(
          'List all documents in _PARAM0_ and store result in _PARAM1_ (store result state in _PARAM2_)'
        ),
        _('Cloud Firestore Database'),
        'JsPlatform/Extensions/firebase.png',
        'JsPlatform/Extensions/firebase.png'
      )
      .addParameter('string', _('Collection'), '', false)
      .addParameter(
        'scenevar',
        _('Callback Variable where to store the result'),
        '',
        true
      )
      .addParameter(
        'scenevar',
        _('Callback variable with state (ok or error)'),
        '',
        true
      )
      .setHidden()
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Firebase/A_firebasejs/A_firebase-base.js')
      .addIncludeFile(
        'Extensions/Firebase/A_firebasejs/B_firebase-firestore.js'
      )
      .addIncludeFile('Extensions/Firebase/B_firebasetools/C_firebasetools.js')
      .addIncludeFile(
        'Extensions/Firebase/B_firebasetools/D_cloudfirestoretools.js'
      )
      .setFunctionName('gdjs.evtTools.firebaseTools.firestore.listDocuments');

    /* ====== STORAGE ====== */

    extension
      .addAction(
        'StorageUpload',
        _('Upload a file'),
        _('Upload a file to firebase Storage.'),
        _(
          'Save _PARAM0_ in location _PARAM1_ to Firebase storage and store access URL in _PARAM3_ (Format: _PARAM2_, Store result state in _PARAM4_)'
        ),
        _('Storage'),
        'JsPlatform/Extensions/firebase.png',
        'JsPlatform/Extensions/firebase.png'
      )
      .addParameter('string', _('Upload ID'), '', false)
      .addParameter('string', _('File content'), '', false)
      .addParameter('string', _('Storage path'), '', false)
      .addParameter(
        'stringWithSelector',
        _('File content format'),
        '["none", "base64", "base64url", "data_url"]',
        false
      )
      .setDefaultValue('none')
      .addParameter(
        'scenevar',
        _('Callback variable with state (ok or error)'),
        '',
        true
      )
      .addParameter(
        'scenevar',
        _('Callback variable with the url to the uploaded file'),
        '',
        true
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Firebase/A_firebasejs/A_firebase-base.js')
      .addIncludeFile('Extensions/Firebase/A_firebasejs/B_firebase-storage.js')
      .addIncludeFile('Extensions/Firebase/B_firebasetools/C_firebasetools.js')
      .addIncludeFile('Extensions/Firebase/B_firebasetools/D_storagetools.js')
      .setFunctionName('gdjs.evtTools.firebaseTools.storage.uploadFile');

    extension
      .addAction(
        'StorageDownload',
        _('Get Download URL'),
        _('Get a unique download URL for a file.'),
        _(
          'Get a download url for _PARAM0_ and store it in _PARAM1_ (store result state in _PARAM2_)'
        ),
        _('Storage'),
        'JsPlatform/Extensions/firebase.png',
        'JsPlatform/Extensions/firebase.png'
      )
      .addParameter('string', _('Storage path to the file'), '', false)
      .addParameter(
        'scenevar',
        _('Callback variable where to store the result'),
        '',
        true
      )
      .addParameter(
        'scenevar',
        _('Callback variable with state (ok or error)'),
        '',
        true
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Firebase/A_firebasejs/A_firebase-base.js')
      .addIncludeFile('Extensions/Firebase/A_firebasejs/B_firebase-storage.js')
      .addIncludeFile('Extensions/Firebase/B_firebasetools/C_firebasetools.js')
      .addIncludeFile('Extensions/Firebase/B_firebasetools/D_storagetools.js')
      .setFunctionName('gdjs.evtTools.firebaseTools.storage.getDownloadURL');

    /* ====== REALTIME DATABASE ====== */

    extension
      .addAction(
        'DatabaseWriteVariable',
        _('Write a variable to Database'),
        _('Writes a variable to Database.'),
        _(
          'Write _PARAM1_ to Database in _PARAM0_ (store result state in _PARAM2_)'
        ),
        _('Realtime Database'),
        'JsPlatform/Extensions/firebase.png',
        'JsPlatform/Extensions/firebase.png'
      )
      .addParameter('string', _('Path'), '', false)
      .addParameter('scenevar', _('Variable to write'), '', false)
      .addParameter(
        'scenevar',
        _('Callback variable with state (ok or error)'),
        '',
        true
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Firebase/A_firebasejs/A_firebase-base.js')
      .addIncludeFile('Extensions/Firebase/A_firebasejs/B_firebase-database.js')
      .addIncludeFile('Extensions/Firebase/B_firebasetools/C_firebasetools.js')
      .addIncludeFile('Extensions/Firebase/B_firebasetools/D_databasetools.js')
      .setFunctionName('gdjs.evtTools.firebaseTools.database.writeVariable');

    extension
      .addAction(
        'DatabaseWriteField',
        _('Write a field in Database'),
        _('Writes a field of a Database document.'),
        _(
          'Write _PARAM2_ in field _PARAM1_ of _PARAM0_ (store result state in _PARAM3_)'
        ),
        _('Realtime Database'),
        'JsPlatform/Extensions/firebase.png',
        'JsPlatform/Extensions/firebase.png'
      )
      .addParameter('string', _('Path'), '', false)
      .addParameter('string', _('Field to write'), '', false)
      .addParameter('string', _('Value to write'), '', false)
      .addParameter(
        'scenevar',
        _('Callback variable with state (ok or error)'),
        '',
        true
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Firebase/A_firebasejs/A_firebase-base.js')
      .addIncludeFile('Extensions/Firebase/A_firebasejs/B_firebase-database.js')
      .addIncludeFile('Extensions/Firebase/B_firebasetools/C_firebasetools.js')
      .addIncludeFile('Extensions/Firebase/B_firebasetools/D_databasetools.js')
      .setFunctionName('gdjs.evtTools.firebaseTools.database.writeField');

    extension
      .addAction(
        'DatabaseUpdateVariable',
        _('Update a document in Database'),
        _('Updates a variable on the database.'),
        _(
          'Update variable _PARAM0_ with _PARAM1_ (store result state in _PARAM2_)'
        ),
        _('Realtime Database'),
        'JsPlatform/Extensions/firebase.png',
        'JsPlatform/Extensions/firebase.png'
      )
      .addParameter('string', _('Path'), '', false)
      .addParameter('scenevar', _('Variable to update with'), '', false)
      .addParameter(
        'scenevar',
        _('Callback variable with state (ok or error)'),
        '',
        true
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Firebase/A_firebasejs/A_firebase-base.js')
      .addIncludeFile('Extensions/Firebase/A_firebasejs/B_firebase-database.js')
      .addIncludeFile('Extensions/Firebase/B_firebasetools/C_firebasetools.js')
      .addIncludeFile('Extensions/Firebase/B_firebasetools/D_databasetools.js')
      .setFunctionName('gdjs.evtTools.firebaseTools.database.updateVariable');

    extension
      .addAction(
        'DatabaseUpdateField',
        _('Update a field of a document'),
        _('Updates a field of a Database document.'),
        _(
          'Update field _PARAM1_ of _PARAM0_ with _PARAM2_ (store result state in _PARAM3_)'
        ),
        _('Realtime Database'),
        'JsPlatform/Extensions/firebase.png',
        'JsPlatform/Extensions/firebase.png'
      )
      .addParameter('string', _('Path'), '', false)
      .addParameter('string', _('Field to update'), '', false)
      .addParameter('string', _('Value to write'), '', false)
      .addParameter(
        'scenevar',
        _('Callback variable with state (ok or error)'),
        '',
        true
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Firebase/A_firebasejs/A_firebase-base.js')
      .addIncludeFile('Extensions/Firebase/A_firebasejs/B_firebase-database.js')
      .addIncludeFile('Extensions/Firebase/B_firebasetools/C_firebasetools.js')
      .addIncludeFile('Extensions/Firebase/B_firebasetools/D_databasetools.js')
      .setFunctionName('gdjs.evtTools.firebaseTools.database.updateField');

    extension
      .addAction(
        'DatabaseDeleteVariable',
        _('Delete a database variable'),
        _('Deletes a variable from the database.'),
        _(
          'Delete variable _PARAM0_ from database (store result state in _PARAM1_)'
        ),
        _('Realtime Database'),
        'JsPlatform/Extensions/firebase.png',
        'JsPlatform/Extensions/firebase.png'
      )
      .addParameter('string', _('Path'), '', false)
      .addParameter(
        'scenevar',
        _('Callback variable with state (ok or error)'),
        '',
        true
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Firebase/A_firebasejs/A_firebase-base.js')
      .addIncludeFile('Extensions/Firebase/A_firebasejs/B_firebase-database.js')
      .addIncludeFile('Extensions/Firebase/B_firebasetools/C_firebasetools.js')
      .addIncludeFile('Extensions/Firebase/B_firebasetools/D_databasetools.js')
      .setFunctionName('gdjs.evtTools.firebaseTools.database.deleteVariable');

    extension
      .addAction(
        'DatabaseDeleteField',
        _('Delete a field of a variable'),
        _('Deletes a field of a variable on the database.'),
        _(
          'Delete field _PARAM1_ of variable _PARAM0_ on the database (store result state in _PARAM2_)'
        ),
        _('Realtime Database'),
        'JsPlatform/Extensions/firebase.png',
        'JsPlatform/Extensions/firebase.png'
      )
      .addParameter('string', _('Path'), '', false)
      .addParameter('string', _('Field to delete'), '', false)
      .addParameter(
        'scenevar',
        _('Callback variable with state (ok or error)'),
        '',
        true
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Firebase/A_firebasejs/A_firebase-base.js')
      .addIncludeFile('Extensions/Firebase/A_firebasejs/B_firebase-database.js')
      .addIncludeFile('Extensions/Firebase/B_firebasetools/C_firebasetools.js')
      .addIncludeFile('Extensions/Firebase/B_firebasetools/D_databasetools.js')
      .setFunctionName('gdjs.evtTools.firebaseTools.database.deleteField');

    extension
      .addAction(
        'DatabaseGetVariable',
        _('Get a variable from the database'),
        _(
          'Gets a variable from the database and store it in a Scene variable.'
        ),
        _(
          'Load database variable _PARAM0_ into _PARAM1_ (store result state in _PARAM2_)'
        ),
        _('Realtime Database'),
        'JsPlatform/Extensions/firebase.png',
        'JsPlatform/Extensions/firebase.png'
      )
      .addParameter('string', _('Path'), '', false)
      .addParameter(
        'scenevar',
        _('Callback variable where to store the data'),
        '',
        true
      )
      .addParameter(
        'scenevar',
        _('Callback variable with state (ok or error)'),
        '',
        true
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Firebase/A_firebasejs/A_firebase-base.js')
      .addIncludeFile('Extensions/Firebase/A_firebasejs/B_firebase-database.js')
      .addIncludeFile('Extensions/Firebase/B_firebasetools/C_firebasetools.js')
      .addIncludeFile('Extensions/Firebase/B_firebasetools/D_databasetools.js')
      .setFunctionName('gdjs.evtTools.firebaseTools.database.getVariable');

    extension
      .addAction(
        'DatabaseGetField',
        _('Get a field of a variable'),
        _(
          'Return the value of a field in a variable from the database and store it in a scene variable.'
        ),
        _(
          'Load field _PARAM1_ of database variable _PARAM0_ into _PARAM2_ (store result state in _PARAM3_)'
        ),
        _('Realtime Database'),
        'JsPlatform/Extensions/firebase.png',
        'JsPlatform/Extensions/firebase.png'
      )
      .addParameter('string', _('Path'), '', false)
      .addParameter('string', _('Field to get'), '', false)
      .addParameter(
        'scenevar',
        _("Callback variable where to store the field's value"),
        '',
        true
      )
      .addParameter(
        'scenevar',
        _('Callback variable with state (ok or error)'),
        '',
        true
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Firebase/A_firebasejs/A_firebase-base.js')
      .addIncludeFile('Extensions/Firebase/A_firebasejs/B_firebase-database.js')
      .addIncludeFile('Extensions/Firebase/B_firebasetools/C_firebasetools.js')
      .addIncludeFile('Extensions/Firebase/B_firebasetools/D_databasetools.js')
      .setFunctionName('gdjs.evtTools.firebaseTools.database.getField');

    extension
      .addAction(
        'DatabaseHasVariable',
        _("Check for a variable's existence"),
        _(
          'Checks for the existence of a variable. Sets the result variable to 1 if it exists else to 2.'
        ),
        _(
          'Check for existence of _PARAM0_ and store result in _PARAM1_ (store result state in _PARAM2_)'
        ),
        _('Realtime Database'),
        'JsPlatform/Extensions/firebase.png',
        'JsPlatform/Extensions/firebase.png'
      )
      .addParameter('string', _('Path'), '', false)
      .addParameter(
        'scenevar',
        _('Callback variable where to store the result'),
        '',
        true
      )
      .addParameter(
        'scenevar',
        _('Callback variable with state (ok or error)'),
        '',
        true
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Firebase/A_firebasejs/A_firebase-base.js')
      .addIncludeFile('Extensions/Firebase/A_firebasejs/B_firebase-database.js')
      .addIncludeFile('Extensions/Firebase/B_firebasetools/C_firebasetools.js')
      .addIncludeFile('Extensions/Firebase/B_firebasetools/D_databasetools.js')
      .setFunctionName('gdjs.evtTools.firebaseTools.database.hasVariable');

    extension
      .addAction(
        'DatabaseHasField',
        _("Check for existence of a variable's field"),
        _(
          'Checks for the existence of a field in a variable. Sets the result variable to 1 if it exists else to 2.'
        ),
        _(
          'Check for existence of _PARAM1_ in database variable _PARAM0_ and store result in _PARAM2_ (store result state in _PARAM3_)'
        ),
        _('Realtime Database'),
        'JsPlatform/Extensions/firebase.png',
        'JsPlatform/Extensions/firebase.png'
      )
      .addParameter('string', _('Path'), '', false)
      .addParameter('string', _('Field to check'), '', false)
      .addParameter(
        'scenevar',
        _('Callback Variable where to store the result'),
        '',
        true
      )
      .addParameter(
        'scenevar',
        _('Callback variable with state (ok or error)'),
        '',
        true
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Firebase/A_firebasejs/A_firebase-base.js')
      .addIncludeFile('Extensions/Firebase/A_firebasejs/B_firebase-database.js')
      .addIncludeFile('Extensions/Firebase/B_firebasetools/C_firebasetools.js')
      .addIncludeFile('Extensions/Firebase/B_firebasetools/D_databasetools.js')
      .setFunctionName('gdjs.evtTools.firebaseTools.database.hasField');

    return extension;
  },
  runExtensionSanityTests: function (gd, extension) {
    return [];
  },
};
