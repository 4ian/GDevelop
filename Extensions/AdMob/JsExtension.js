// @flow
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

/*::
// Import types to allow Flow to do static type checking on this file.
// Extensions declaration are typed using Flow (like the editor), but the files
// for the game engine are checked with TypeScript annotations.
import { type ObjectsRenderingService, type ObjectsEditorService } from '../JsExtensionTypes.flow.js'
*/

module.exports = {
  createExtension: function (
    _ /*: (string) => string */,
    gd /*: libGDevelop */
  ) {
    const extension = new gd.PlatformExtension();
    extension
      .setExtensionInformation(
        'AdMob',
        _('AdMob'),
        _(
          'Allow to display AdMob banners, interstitials and reward video ads.'
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
      .setExportName('gdevelop-cordova-admob-plus')
      .setVersion('0.45.0')
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
      .addDependency()
      .setName('Consent Cordova plugin')
      .setDependencyType('cordova')
      .setExportName('cordova-plugin-consent')
      .onlyIfOtherDependencyIsExported('AdMob Cordova plugin');

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

    // Banner
    extension
      .addCondition(
        'BannerLoading',
        _('Banner loading'),
        _(
          'Check if a banner is currently loading. It will be shown automatically when loaded.'
        ),
        _('Banner is loading'),
        '',
        'JsPlatform/Extensions/admobicon24.png',
        'JsPlatform/Extensions/admobicon16.png'
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/AdMob/admobtools.js')
      .setFunctionName('gdjs.adMob.isBannerLoading');

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
      .addDuplicatedCondition('BannerExists', 'BannerShowing')
      .setHidden();

    extension
      .addAction(
        'SetupBanner',
        _('Configure the banner'),
        _(
          "Configure a banner, which can then be displayed.\nIf test mode is set, a test banner will be displayed.\n\nOnce a banner is positioned (at the top or bottom of the game), it can't be moved anymore."
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
        'Get it from your AdMob account. You can use `"ca-app-pub-3940256099942544/6300978111"` for showing a test banner.'
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
        'Get it from your AdMob account. You can use `"ca-app-pub-3940256099942544/1033173712"` for loading a test interstitial.'
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

    // Reward video
    extension
      .addCondition(
        'VideoLoading',
        _('Video loading'),
        _('Check if a reward video is currently loading.'),
        _('Reward video is loading'),
        '',
        'JsPlatform/Extensions/admobicon24.png',
        'JsPlatform/Extensions/admobicon16.png'
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/AdMob/admobtools.js')
      .setFunctionName('gdjs.adMob.isVideoLoading');

    extension
      .addCondition(
        'VideoReady',
        _('Video ready'),
        _('Check if a reward video is ready to be displayed.'),
        _('Reward video is ready'),
        '',
        'JsPlatform/Extensions/admobicon24.png',
        'JsPlatform/Extensions/admobicon16.png'
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/AdMob/admobtools.js')
      .setFunctionName('gdjs.adMob.isVideoReady');

    extension
      .addCondition(
        'VideoShowing',
        _('Video showing'),
        _('Check if there is a reward video being displayed.'),
        _('Reward video is showing'),
        '',
        'JsPlatform/Extensions/admobicon24.png',
        'JsPlatform/Extensions/admobicon16.png'
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/AdMob/admobtools.js')
      .setFunctionName('gdjs.adMob.isVideoShowing');

    extension
      .addCondition(
        'VideoErrored',
        _('Video had an error'),
        _('Check if there was a error while loading the rewarded video.'),
        _('Video ad had an error'),
        '',
        'JsPlatform/Extensions/admobicon24.png',
        'JsPlatform/Extensions/admobicon16.png'
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/AdMob/admobtools.js')
      .setFunctionName('gdjs.adMob.isVideoErrored');

    extension
      .addCondition(
        'VideoReward',
        _('Video reward received'),
        _(
          'Check if the reward of the video was given to the user.\nYou can mark this reward as cleared, so that the condition will be false and you can show later another reward video.'
        ),
        _('User got the reward of the video (and clear this reward: _PARAM0_)'),
        '',
        'JsPlatform/Extensions/admobicon24.png',
        'JsPlatform/Extensions/admobicon16.png'
      )
      .addParameter(
        'yesorno',
        _('Clear the reward (needed to show another video)'),
        '',
        false
      )
      .setDefaultValue('true')
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/AdMob/admobtools.js')
      .setFunctionName('gdjs.adMob.wasVideoRewardReceived');

    extension
      .addAction(
        'LoadVideo',
        _('Load video'),
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
        'Get it from your AdMob account. You can use `"ca-app-pub-3940256099942544/5224354917"` for loading a test rewarded video.'
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
      .setFunctionName('gdjs.adMob.loadVideo');

    extension
      .addAction(
        'ShowVideo',
        _('Show video'),
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
      .setFunctionName('gdjs.adMob.showVideo');

    extension
      .addAction(
        'ClaimReward',
        _('Mark the reward of the video as claimed'),
        _(
          'Mark the video reward as claimed. Useful if you used the condition to check if the reward was given to the user without clearing the reward.'
        ),
        _('Mark the reward of the video as claimed'),
        '',
        'JsPlatform/Extensions/admobicon24.png',
        'JsPlatform/Extensions/admobicon16.png'
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/AdMob/admobtools.js')
      .setFunctionName('gdjs.adMob.markVideoRewardAsClaimed');

    return extension;
  },
  runExtensionSanityTests: function (
    gd /*: libGDevelop */,
    extension /*: gdPlatformExtension*/
  ) {
    return [];
  },
};
