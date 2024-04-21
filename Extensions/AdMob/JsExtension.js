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
        'AdMob',
        _('AdMob'),
        _(
          'Allow to display AdMob banners, app open, interstitials, rewarded interstitials and rewarded video ads.'
        ),
        'Florian Rival',
        'MIT'
      )
      .setExtensionHelpPath('/all-features/admob')
      .setCategory('Ads');
    extension
      .addInstructionOrExpressionGroupMetadata(_('AdMob'))
      .setIcon('JsPlatform/Extensions/admobicon24.png');

    extension
      .addDependency()
      .setName('Consent Cordova plugin')
      .setDependencyType('cordova')
      .setExportName('cordova-plugin-consent')
      .setVersion('2.4.0')
      .onlyIfOtherDependencyIsExported('AdMob Cordova plugin');

    extension
      .registerProperty('AdMobAppIdAndroid')
      .setLabel(_('AdMob Android App ID'))
      .setDescription('ca-app-pub-XXXXXXXXXXXXXXXX~YYYYYYYYYY')
      .setType('string');

    extension
      .registerProperty('AdMobAppIdIos')
      .setLabel(_('AdMob iOS App ID'))
      .setDescription('ca-app-pub-XXXXXXXXXXXXXXXX~YYYYYYYYYY')
      .setType('string');

    extension
      .addDependency()
      .setName('AdMob Cordova plugin')
      .setDependencyType('cordova')
      .setExportName('admob-plus-cordova')
      .setVersion('1.28.0')
      .setExtraSetting(
        'APP_ID_ANDROID',
        new gd.PropertyDescriptor('AdMobAppIdAndroid').setType(
          'ExtensionProperty'
        )
      )
      .setExtraSetting(
        'APP_ID_IOS',
        new gd.PropertyDescriptor('AdMobAppIdIos').setType('ExtensionProperty')
      )
      .onlyIfSomeExtraSettingsNonEmpty();

    extension
      .addAction(
        'SetTestMode',
        _('Enable test mode'),
        _(
          'Activate or deactivate the test mode ("development" mode).\n' +
            'When activated, tests ads will be served instead of real ones.\n' +
            '\n' +
            'It is important to enable test ads during development so that you can click on them without ' +
            'charging advertisers. If you click on too many ads without being in test mode, you risk your ' +
            'account being flagged for invalid activity.'
        ),
        _('Enable test mode (serving test ads, for development): _PARAM0_'),
        '',
        'JsPlatform/Extensions/admobicon24.png',
        'JsPlatform/Extensions/admobicon16.png'
      )
      .addParameter('yesorno', _('Enable test mode?'), '', false)
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/AdMob/admobtools.js')
      .setFunctionName('gdjs.adMob.setTestMode');

    // App Open
    extension
      .addCondition(
        'AppOpenLoading',
        _('App open loading'),
        _('Check if an app open is currently loading.'),
        _('App open is loading'),
        '',
        'JsPlatform/Extensions/admobicon24.png',
        'JsPlatform/Extensions/admobicon16.png'
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/AdMob/admobtools.js')
      .setFunctionName('gdjs.adMob.isAppOpenLoading');

    extension
      .addCondition(
        'AppOpenReady',
        _('App open ready'),
        _('Check if an app open is ready to be displayed.'),
        _('App open is ready'),
        '',
        'JsPlatform/Extensions/admobicon24.png',
        'JsPlatform/Extensions/admobicon16.png'
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/AdMob/admobtools.js')
      .setFunctionName('gdjs.adMob.isAppOpenReady');

    extension
      .addCondition(
        'AppOpenShowing',
        _('App open showing'),
        _('Check if there is an app open being displayed.'),
        _('App open is showing'),
        '',
        'JsPlatform/Extensions/admobicon24.png',
        'JsPlatform/Extensions/admobicon16.png'
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/AdMob/admobtools.js')
      .setFunctionName('gdjs.adMob.isAppOpenShowing');

    extension
      .addCondition(
        'AppOpenErrored',
        _('App open errored'),
        _('Check if there was an error while loading the app open.'),
        _('App open had an error'),
        '',
        'JsPlatform/Extensions/admobicon24.png',
        'JsPlatform/Extensions/admobicon16.png'
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/AdMob/admobtools.js')
      .setFunctionName('gdjs.adMob.isAppOpenErrored');

    extension
      .addAction(
        'LoadAppOpen',
        _('Load app open'),
        _(
          'Start loading an app open (that can be displayed automatically when the loading is finished).\nIf test mode is set, a test app open will be displayed.'
        ),
        _(
          'Load app open with Android ad unit ID: _PARAM0_, iOS ad unit ID: _PARAM1_ (landscape: _PARAM2_, display automatically when loaded: _PARAM3_)'
        ),
        '',
        'JsPlatform/Extensions/admobicon24.png',
        'JsPlatform/Extensions/admobicon16.png'
      )
      .addParameter('string', _('Android app open ID'), '', false)
      .setParameterLongDescription(
        'Get it from your AdMob account. You can use `"ca-app-pub-3940256099942544/3419835294"` for loading a test app open.'
      )
      .addParameter('string', _('iOS app open ID'), '', false)
      .setParameterLongDescription(
        'Get it from your AdMob account. You can use `"ca-app-pub-3940256099942544/5662855259"` for loading a test app open.'
      )
      .addParameter(
        'yesorno',
        _('Display in landscape? (portrait otherwise)'),
        '',
        false
      )
      .setDefaultValue('false')
      .addParameter(
        'yesorno',
        _('Displayed automatically when loading is finished?'),
        '',
        false
      )
      .setDefaultValue('true')
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/AdMob/admobtools.js')
      .setFunctionName('gdjs.adMob.loadAppOpen');

    extension
      .addAction(
        'ShowAppOpen',
        _('Show app open'),
        _(
          'Show the app open that was loaded. Will work only when the app open is fully loaded.'
        ),
        _('Show the loaded app open'),
        '',
        'JsPlatform/Extensions/admobicon24.png',
        'JsPlatform/Extensions/admobicon16.png'
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/AdMob/admobtools.js')
      .setFunctionName('gdjs.adMob.showAppOpen');

    // Banner
    extension
      .addCondition(
        'BannerShowing',
        _('Banner showing'),
        _('Check if there is a banner being displayed.'),
        _('Banner is showing'),
        '',
        'JsPlatform/Extensions/admobicon24.png',
        'JsPlatform/Extensions/admobicon16.png'
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/AdMob/admobtools.js')
      .setFunctionName('gdjs.adMob.isBannerShowing');

    extension
      .addCondition(
        'BannerConfigured',
        _('Banner configured'),
        _('Check if there is a banner correctly configured ready to be shown.'),
        _('Banner is configured'),
        '',
        'JsPlatform/Extensions/admobicon24.png',
        'JsPlatform/Extensions/admobicon16.png'
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/AdMob/admobtools.js')
      .setFunctionName('gdjs.adMob.isBannerConfigured');

    extension
      .addCondition(
        'BannerLoaded',
        _('Banner loaded'),
        _('Check if there is a banner correctly loaded ready to be shown.'),
        _('Banner is loaded'),
        '',
        'JsPlatform/Extensions/admobicon24.png',
        'JsPlatform/Extensions/admobicon16.png'
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/AdMob/admobtools.js')
      .setFunctionName('gdjs.adMob.isBannerLoaded');

    extension
      .addCondition(
        'BannerErrored',
        _('Banner had an error'),
        _('Check if there was a error while displaying a banner.'),
        _('Banner ad had an error'),
        '',
        'JsPlatform/Extensions/admobicon24.png',
        'JsPlatform/Extensions/admobicon16.png'
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/AdMob/admobtools.js')
      .setFunctionName('gdjs.adMob.isBannerErrored');

    // Deprecated conditions, as banners can't be pre-loaded anymore.
    extension
      .addDuplicatedCondition('BannerReady', 'BannerShowing')
      .setHidden();
    extension
      .addDuplicatedCondition('Bannerloading', 'BannerShowing')
      .setHidden();
    extension
      .addDuplicatedCondition('BannerExists', 'BannerShowing')
      .setHidden();

    extension
      .addAction(
        'SetupBanner',
        _('Configure the banner'),
        _(
          "Configure a banner, which can then be displayed.\nIf a banner is already displayed, it will be removed\nIf test mode is set, a test banner will be displayed.\n\nOnce a banner is positioned (at the top or bottom of the game), it can't be moved anymore."
        ),
        _(
          'Configure the banner with Android ad unit ID: _PARAM0_, iOS ad unit ID: _PARAM1_, display at top: _PARAM2_'
        ),
        '',
        'JsPlatform/Extensions/admobicon24.png',
        'JsPlatform/Extensions/admobicon16.png'
      )
      .addParameter('string', _('Android banner ID'), '', false)
      .setParameterLongDescription(
        'Get it from your AdMob account. You can use `"ca-app-pub-3940256099942544/6300978111"` for showing a test banner.'
      )
      .addParameter('string', _('iOS banner ID'), '', false)
      .setParameterLongDescription(
        'Get it from your AdMob account. You can use `"ca-app-pub-3940256099942544/2934735716"` for showing a test banner.'
      )
      .addParameter(
        'yesorno',
        _('Display at top? (bottom otherwise)'),
        '',
        false
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/AdMob/admobtools.js')
      .setFunctionName('gdjs.adMob.setupBanner');

    // Deprecated action (was renamed):
    extension.addDuplicatedAction('LoadBanner', 'SetupBanner').setHidden();

    extension
      .addAction(
        'ShowBanner',
        _('Show banner'),
        _('Show the banner that was previously set up.'),
        _('Show banner'),
        '',
        'JsPlatform/Extensions/admobicon24.png',
        'JsPlatform/Extensions/admobicon16.png'
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/AdMob/admobtools.js')
      .setFunctionName('gdjs.adMob.showBanner');

    extension
      .addAction(
        'HideBanner',
        _('Hide banner'),
        _(
          'Hide the banner. You can show it again with the corresponding action.'
        ),
        _('Hide banner'),
        '',
        'JsPlatform/Extensions/admobicon24.png',
        'JsPlatform/Extensions/admobicon16.png'
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/AdMob/admobtools.js')
      .setFunctionName('gdjs.adMob.hideBanner');

    // Deprecated action (not applicable anymore):
    extension.addDuplicatedAction('RemoveBanner', 'HideBanner').setHidden();

    // Interstitial
    extension
      .addCondition(
        'InterstitialLoading',
        _('Interstitial loading'),
        _('Check if an interstitial is currently loading.'),
        _('Interstitial is loading'),
        '',
        'JsPlatform/Extensions/admobicon24.png',
        'JsPlatform/Extensions/admobicon16.png'
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/AdMob/admobtools.js')
      .setFunctionName('gdjs.adMob.isInterstitialLoading');

    extension
      .addCondition(
        'InterstitialReady',
        _('Interstitial ready'),
        _('Check if an interstitial is ready to be displayed.'),
        _('Interstitial is ready'),
        '',
        'JsPlatform/Extensions/admobicon24.png',
        'JsPlatform/Extensions/admobicon16.png'
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/AdMob/admobtools.js')
      .setFunctionName('gdjs.adMob.isInterstitialReady');

    extension
      .addCondition(
        'InterstitialShowing',
        _('Interstitial showing'),
        _('Check if there is an interstitial being displayed.'),
        _('Interstitial is showing'),
        '',
        'JsPlatform/Extensions/admobicon24.png',
        'JsPlatform/Extensions/admobicon16.png'
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/AdMob/admobtools.js')
      .setFunctionName('gdjs.adMob.isInterstitialShowing');

    extension
      .addCondition(
        'InterstitialErrored',
        _('Interstitial had an error'),
        _('Check if there was a error while loading the interstitial.'),
        _('Interstitial ad had an error'),
        '',
        'JsPlatform/Extensions/admobicon24.png',
        'JsPlatform/Extensions/admobicon16.png'
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/AdMob/admobtools.js')
      .setFunctionName('gdjs.adMob.isInterstitialErrored');

    extension
      .addAction(
        'LoadInterstitial',
        _('Load interstitial'),
        _(
          'Start loading an interstitial (that can be displayed automatically when the loading is finished).\nIf test mode is set, a test interstitial will be displayed.'
        ),
        _(
          'Load interstitial with Android ad unit ID: _PARAM0_, iOS ad unit ID: _PARAM1_ (display automatically when loaded: _PARAM2_)'
        ),
        '',
        'JsPlatform/Extensions/admobicon24.png',
        'JsPlatform/Extensions/admobicon16.png'
      )
      .addParameter('string', _('Android interstitial ID'), '', false)
      .setParameterLongDescription(
        'Get it from your AdMob account. You can use `"ca-app-pub-3940256099942544/1033173712"` for loading a test interstitial.'
      )
      .addParameter('string', _('iOS interstitial ID'), '', false)
      .setParameterLongDescription(
        'Get it from your AdMob account. You can use `"ca-app-pub-3940256099942544/4411468910"` for loading a test interstitial.'
      )
      .addParameter(
        'yesorno',
        _('Displayed automatically when loading is finished?'),
        '',
        false
      )
      .setDefaultValue('true')
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/AdMob/admobtools.js')
      .setFunctionName('gdjs.adMob.loadInterstitial');

    extension
      .addAction(
        'ShowInterstitial',
        _('Show interstitial'),
        _(
          'Show the interstitial that was loaded. Will work only when the interstitial is fully loaded.'
        ),
        _('Show the loaded interstitial'),
        '',
        'JsPlatform/Extensions/admobicon24.png',
        'JsPlatform/Extensions/admobicon16.png'
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/AdMob/admobtools.js')
      .setFunctionName('gdjs.adMob.showInterstitial');

    // Rewarded Interstitial
    extension
      .addCondition(
        'RewardedInterstitialLoading',
        _('Rewarded interstitial loading'),
        _('Check if a rewarded interstitial is currently loading.'),
        _('Rewarded interstitial is loading'),
        '',
        'JsPlatform/Extensions/admobicon24.png',
        'JsPlatform/Extensions/admobicon16.png'
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/AdMob/admobtools.js')
      .setFunctionName('gdjs.adMob.isRewardedInterstitialLoading');

    extension
      .addCondition(
        'RewardedInterstitialReady',
        _('Rewarded interstitial ready'),
        _('Check if a rewarded interstitial is ready to be displayed.'),
        _('Rewarded interstitial is ready'),
        '',
        'JsPlatform/Extensions/admobicon24.png',
        'JsPlatform/Extensions/admobicon16.png'
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/AdMob/admobtools.js')
      .setFunctionName('gdjs.adMob.isRewardedInterstitialReady');

    extension
      .addCondition(
        'RewardedInterstitialShowing',
        _('Rewarded interstitial showing'),
        _('Check if there is a rewarded interstitial being displayed.'),
        _('Rewarded interstitial is showing'),
        '',
        'JsPlatform/Extensions/admobicon24.png',
        'JsPlatform/Extensions/admobicon16.png'
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/AdMob/admobtools.js')
      .setFunctionName('gdjs.adMob.isRewardedInterstitialShowing');

    extension
      .addCondition(
        'RewardedInterstitialErrored',
        _('Rewarded interstitial had an error'),
        _(
          'Check if there was a error while loading the rewarded interstitial.'
        ),
        _('Rewarded Interstitial had an error'),
        '',
        'JsPlatform/Extensions/admobicon24.png',
        'JsPlatform/Extensions/admobicon16.png'
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/AdMob/admobtools.js')
      .setFunctionName('gdjs.adMob.isRewardedInterstitialErrored');

    extension
      .addCondition(
        'RewardedInterstitialRewardReceived',
        _('Rewarded Interstitial reward received'),
        _(
          'Check if the reward of the rewarded interstitial was given to the user.\nYou can mark this reward as cleared, so that the condition will be false and you can show later another rewarded interstitial.'
        ),
        _(
          'User got the reward of the rewarded interstitial (and clear this reward: _PARAM0_)'
        ),
        '',
        'JsPlatform/Extensions/admobicon24.png',
        'JsPlatform/Extensions/admobicon16.png'
      )
      .addParameter(
        'yesorno',
        _('Clear the reward (needed to show another rewarded interstitial)'),
        '',
        false
      )
      .setDefaultValue('true')
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/AdMob/admobtools.js')
      .setFunctionName('gdjs.adMob.wasRewardedInterstitialRewardReceived');

    extension
      .addAction(
        'LoadRewardedInterstitial',
        _('Load rewarded interstitial'),
        _(
          'Start loading a rewarded interstitial (that can be displayed automatically when the loading is finished).\nIf test mode is set, a test rewarded interstitial will be displayed.\nThis is similar to a rewarded video, but can be displayed at any time, and the user can close it.'
        ),
        _(
          'Load rewarded interstitial with Android ad unit ID: _PARAM0_, iOS ad unit ID: _PARAM1_ (display automatically when loaded: _PARAM2_)'
        ),
        '',
        'JsPlatform/Extensions/admobicon24.png',
        'JsPlatform/Extensions/admobicon16.png'
      )
      .addParameter('string', _('Android rewarded interstitial ID'), '', false)
      .setParameterLongDescription(
        'Get it from your AdMob account. You can use `"ca-app-pub-3940256099942544/5354046379"` for loading a test rewarded interstitial.'
      )
      .addParameter('string', _('iOS interstitial ID'), '', false)
      .setParameterLongDescription(
        'Get it from your AdMob account. You can use `"ca-app-pub-3940256099942544/6978759866"` for loading a test rewarded interstitial.'
      )
      .addParameter(
        'yesorno',
        _('Displayed automatically when loading is finished?'),
        '',
        false
      )
      .setDefaultValue('true')
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/AdMob/admobtools.js')
      .setFunctionName('gdjs.adMob.loadRewardedInterstitial');

    extension
      .addAction(
        'ShowRewardedInterstitial',
        _('Show rewarded interstitial'),
        _(
          'Show the rewarded interstitial that was loaded. Will work only when the rewarded interstitial is fully loaded.'
        ),
        _('Show the loaded rewarded interstitial'),
        '',
        'JsPlatform/Extensions/admobicon24.png',
        'JsPlatform/Extensions/admobicon16.png'
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/AdMob/admobtools.js')
      .setFunctionName('gdjs.adMob.showRewardedInterstitial');

    extension
      .addAction(
        'ClaimRewardedInterstitialReward',
        _('Mark the reward of the rewarded interstitial as claimed'),
        _(
          'Mark the rewarded interstitial reward as claimed. Useful if you used the condition to check if the reward was given to the user without clearing the reward.'
        ),
        _('Mark the reward of the rewarded interstitial as claimed'),
        '',
        'JsPlatform/Extensions/admobicon24.png',
        'JsPlatform/Extensions/admobicon16.png'
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/AdMob/admobtools.js')
      .setFunctionName('gdjs.adMob.markRewardedInterstitialRewardAsClaimed');

    // Rewarded video
    extension
      .addCondition(
        'RewardedVideoLoading',
        _('Rewarded video loading'),
        _('Check if a rewarded video is currently loading.'),
        _('Rewarded video is loading'),
        '',
        'JsPlatform/Extensions/admobicon24.png',
        'JsPlatform/Extensions/admobicon16.png'
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/AdMob/admobtools.js')
      .setFunctionName('gdjs.adMob.isRewardedVideoLoading');

    // Deprecated condition (was renamed):
    extension
      .addDuplicatedCondition('VideoLoading', 'RewardedVideoLoading')
      .setHidden();

    extension
      .addCondition(
        'RewardedVideoReady',
        _('Rewarded video ready'),
        _('Check if a rewarded video is ready to be displayed.'),
        _('Rewarded video is ready'),
        '',
        'JsPlatform/Extensions/admobicon24.png',
        'JsPlatform/Extensions/admobicon16.png'
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/AdMob/admobtools.js')
      .setFunctionName('gdjs.adMob.isRewardedVideoReady');

    // Deprecated condition (was renamed):
    extension
      .addDuplicatedCondition('VideoReady', 'RewardedVideoReady')
      .setHidden();

    extension
      .addCondition(
        'RewardedVideoShowing',
        _('Rewarded video showing'),
        _('Check if there is a rewarded video being displayed.'),
        _('Rewarded video is showing'),
        '',
        'JsPlatform/Extensions/admobicon24.png',
        'JsPlatform/Extensions/admobicon16.png'
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/AdMob/admobtools.js')
      .setFunctionName('gdjs.adMob.isRewardedVideoShowing');

    // Deprecated condition (was renamed):
    extension
      .addDuplicatedCondition('VideoShowing', 'RewardedVideoShowing')
      .setHidden();

    extension
      .addCondition(
        'RewardedVideoErrored',
        _('Rewarded video had an error'),
        _('Check if there was a error while loading the rewarded video.'),
        _('Rewarded video ad had an error'),
        '',
        'JsPlatform/Extensions/admobicon24.png',
        'JsPlatform/Extensions/admobicon16.png'
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/AdMob/admobtools.js')
      .setFunctionName('gdjs.adMob.isRewardedVideoErrored');

    // Deprecated condition (was renamed):
    extension
      .addDuplicatedCondition('VideoErrored', 'RewardedVideoErrored')
      .setHidden();

    extension
      .addCondition(
        'RewardedVideoRewardReceived',
        _('Rewarded Video reward received'),
        _(
          'Check if the reward of the rewarded video was given to the user.\nYou can mark this reward as cleared, so that the condition will be false and you can show later another rewarded video.'
        ),
        _(
          'User got the reward of the rewarded video (and clear this reward: _PARAM0_)'
        ),
        '',
        'JsPlatform/Extensions/admobicon24.png',
        'JsPlatform/Extensions/admobicon16.png'
      )
      .addParameter(
        'yesorno',
        _('Clear the reward (needed to show another rewarded video)'),
        '',
        false
      )
      .setDefaultValue('true')
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/AdMob/admobtools.js')
      .setFunctionName('gdjs.adMob.wasRewardedVideoRewardReceived');

    // Deprecated condition (was renamed):
    extension
      .addDuplicatedCondition('VideoReward', 'RewardedVideoRewardReceived')
      .setHidden();

    extension
      .addAction(
        'LoadRewardedVideo',
        _('Load rewarded video'),
        _(
          'Start loading a reward video (that can be displayed automatically when the loading is finished).\nIf test mode is set, a test video will be displayed.'
        ),
        _(
          'Load reward video with Android ad unit ID: _PARAM0_, iOS ad unit ID: _PARAM1_ (display automatically when loaded: _PARAM2_)'
        ),
        '',
        'JsPlatform/Extensions/admobicon24.png',
        'JsPlatform/Extensions/admobicon16.png'
      )
      .addParameter('string', _('Android reward video ID'), '', false)
      .setParameterLongDescription(
        'Get it from your AdMob account. You can use `"ca-app-pub-3940256099942544/5224354917"` for loading a test rewarded video.'
      )
      .addParameter('string', _('iOS reward video ID'), '', false)
      .setParameterLongDescription(
        'Get it from your AdMob account. You can use `"ca-app-pub-3940256099942544/1712485313"` for loading a test rewarded video.'
      )
      .addParameter(
        'yesorno',
        _('Displayed automatically when loading is finished?'),
        '',
        false
      )
      .setDefaultValue('true')
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/AdMob/admobtools.js')
      .setFunctionName('gdjs.adMob.loadRewardedVideo');

    // Deprecated action (was renamed):
    extension.addDuplicatedAction('LoadVideo', 'LoadRewardedVideo').setHidden();

    extension
      .addAction(
        'ShowRewardedVideo',
        _('Show rewarded video'),
        _(
          'Show the reward video that was loaded. Will work only when the video is fully loaded.'
        ),
        _('Show the loaded reward video'),
        '',
        'JsPlatform/Extensions/admobicon24.png',
        'JsPlatform/Extensions/admobicon16.png'
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/AdMob/admobtools.js')
      .setFunctionName('gdjs.adMob.showRewardedVideo');

    // Deprecated action (was renamed):
    extension.addDuplicatedAction('ShowVideo', 'ShowRewardedVideo').setHidden();

    extension
      .addAction(
        'ClaimRewardedVideoReward',
        _('Mark the reward of the rewarded video as claimed'),
        _(
          'Mark the rewarded video reward as claimed. Useful if you used the condition to check if the reward was given to the user without clearing the reward.'
        ),
        _('Mark the reward of the rewarded video as claimed'),
        '',
        'JsPlatform/Extensions/admobicon24.png',
        'JsPlatform/Extensions/admobicon16.png'
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/AdMob/admobtools.js')
      .setFunctionName('gdjs.adMob.markRewardedVideoRewardAsClaimed');

    // Deprecated action (was renamed):
    extension
      .addDuplicatedAction('ClaimReward', 'ClaimRewardedVideoReward')
      .setHidden();

    return extension;
  },
  runExtensionSanityTests: function (gd, extension) {
    return [];
  },
};
