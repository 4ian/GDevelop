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
    extension.setExtensionInformation(
      'AdMob',
      _('AdMob'),
      _(
        'Allow the game to display AdMob banner, interstitial and reward video ads'
      ),
      'Franco Maciel',
      'MIT'
    );

    // Banner
    extension
      .addCondition(
        'BannerLoading',
        _('Banner loading'),
        _('Check if a banner is currently loading.'),
        _('Banner is loading'),
        _('AdMob'),
        'JsPlatform/Extensions/admobicon24.png',
        'JsPlatform/Extensions/admobicon16.png'
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/AdMob/admobtools.js')
      .setFunctionName('gdjs.adMob.isBannerLoading');

    extension
      .addCondition(
        'BannerReady',
        _('Banner ready'),
        _('Check if a banner is ready to be displayed.'),
        _('Banner is ready'),
        _('AdMob'),
        'JsPlatform/Extensions/admobicon24.png',
        'JsPlatform/Extensions/admobicon16.png'
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/AdMob/admobtools.js')
      .setFunctionName('gdjs.adMob.isBannerReady');

    extension
      .addCondition(
        'BannerShowing',
        _('Banner showing'),
        _('Check if there is a banner being displayed.'),
        _('Banner is showing'),
        _('AdMob'),
        'JsPlatform/Extensions/admobicon24.png',
        'JsPlatform/Extensions/admobicon16.png'
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/AdMob/admobtools.js')
      .setFunctionName('gdjs.adMob.isBannerShowing');

    extension
      .addCondition(
        'BannerExists',
        _('Banner exists'),
        _('Check if there is a banner in memory (visible or hidden).'),
        _('Banner exists'),
        _('AdMob'),
        'JsPlatform/Extensions/admobicon24.png',
        'JsPlatform/Extensions/admobicon16.png'
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/AdMob/admobtools.js')
      .setFunctionName('gdjs.adMob.existBanner');

    extension
      .addAction(
        'LoadBanner',
        _('Load banner'),
        _(
          'Start loading a banner, you can display it automatically when finish loading.\nIf test mode is set to true a test banner will be displayed.'
        ),
        _(
          'Load banner (at top: _PARAM2_, overlap: _PARAM3_, show on load: _PARAM4_, test mode: _PARAM5_)'
        ),
        _('AdMob'),
        'JsPlatform/Extensions/admobicon24.png',
        'JsPlatform/Extensions/admobicon16.png'
      )
      .addParameter('string', _('Android banner ID'), '', false)
      .addParameter('string', _('iOS banner ID'), '', false)
      .addParameter(
        'yesorno',
        _('Display at top? (bottom otherwise)'),
        '',
        false
      )
      .setDefaultValue('false')
      .addParameter('yesorno', _('Overlap webview?'), '', false)
      .setDefaultValue('true')
      .addParameter('yesorno', _('Display on load complete?'), '', false)
      .setDefaultValue('true')
      .addParameter('yesorno', _('Test mode?'), '', false)
      .setDefaultValue('true')
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/AdMob/admobtools.js')
      .setFunctionName('gdjs.adMob.loadBanner');

    extension
      .addAction(
        'ShowBanner',
        _('Show banner'),
        _('Show the banner, will work only when the banner is fully loaded.'),
        _('Show banner'),
        _('AdMob'),
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
        _('AdMob'),
        'JsPlatform/Extensions/admobicon24.png',
        'JsPlatform/Extensions/admobicon16.png'
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/AdMob/admobtools.js')
      .setFunctionName('gdjs.adMob.hideBanner');

    extension
      .addAction(
        'RemoveBanner',
        _('Remove banner'),
        _(
          'Remove the banner. You have to load another banner to show it again.'
        ),
        _('Remove banner'),
        _('AdMob'),
        'JsPlatform/Extensions/admobicon24.png',
        'JsPlatform/Extensions/admobicon16.png'
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/AdMob/admobtools.js')
      .setFunctionName('gdjs.adMob.removeBanner');

    // Interstitial
    extension
      .addCondition(
        'InterstitialLoading',
        _('Interstitial loading'),
        _('Check if an interstitial is currently loading.'),
        _('Interstitial is loading'),
        _('AdMob'),
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
        _('AdMob'),
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
        _('AdMob'),
        'JsPlatform/Extensions/admobicon24.png',
        'JsPlatform/Extensions/admobicon16.png'
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/AdMob/admobtools.js')
      .setFunctionName('gdjs.adMob.isInterstitialShowing');

    extension
      .addAction(
        'LoadInterstitial',
        _('Load interstitial'),
        _(
          'Start loading an interstitial, you can display it automatically when finish loading.\nIf test mode is set to true a test interstitial will be displayed.'
        ),
        _('Load interstitial (show on load: _PARAM2_, test mode: _PARAM3_)'),
        _('AdMob'),
        'JsPlatform/Extensions/admobicon24.png',
        'JsPlatform/Extensions/admobicon16.png'
      )
      .addParameter('string', _('Android interstitial ID'), '', false)
      .addParameter('string', _('iOS interstitial ID'), '', false)
      .addParameter('yesorno', _('Display on load complete?'), '', false)
      .setDefaultValue('true')
      .addParameter('yesorno', _('Test mode?'), '', false)
      .setDefaultValue('true')
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/AdMob/admobtools.js')
      .setFunctionName('gdjs.adMob.loadInterstitial');

    extension
      .addAction(
        'ShowInterstitial',
        _('Show interstitial'),
        _(
          'Show the interstitial, will work only when the interstitial is fully loaded.'
        ),
        _('Show interstitial'),
        _('AdMob'),
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
        _('AdMob'),
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
        _('AdMob'),
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
        _('AdMob'),
        'JsPlatform/Extensions/admobicon24.png',
        'JsPlatform/Extensions/admobicon16.png'
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/AdMob/admobtools.js')
      .setFunctionName('gdjs.adMob.isVideoShowing');

    extension
      .addCondition(
        'VideoReward',
        _('Video reward'),
        _(
          'Check if there is a video reward.\nYou can mark it as non-claimed yet, so you can check this reward in other events.'
        ),
        _('Video reward given'),
        _('AdMob'),
        'JsPlatform/Extensions/admobicon24.png',
        'JsPlatform/Extensions/admobicon16.png'
      )
      .addParameter('yesorno', _('Mark as claimed'), '', false)
      .setDefaultValue('true')
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/AdMob/admobtools.js')
      .setFunctionName('gdjs.adMob.existVideoReward');

    extension
      .addAction(
        'LoadVideo',
        _('Load video'),
        _(
          'Start loading a reward video, you can display it automatically when finish loading.\nIf test mode is set to true a test video will be displayed.'
        ),
        _('Load reward video (show on load: _PARAM2_, test mode: _PARAM3_)'),
        _('AdMob'),
        'JsPlatform/Extensions/admobicon24.png',
        'JsPlatform/Extensions/admobicon16.png'
      )
      .addParameter('string', _('Android reward video ID'), '', false)
      .addParameter('string', _('iOS reward video ID'), '', false)
      .addParameter('yesorno', _('Display on load complete?'), '', false)
      .setDefaultValue('true')
      .addParameter('yesorno', _('Test mode?'), '', false)
      .setDefaultValue('true')
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/AdMob/admobtools.js')
      .setFunctionName('gdjs.adMob.loadVideo');

    extension
      .addAction(
        'ShowVideo',
        _('Show video'),
        _(
          'Show the reward video, will work only when the video is fully loaded.'
        ),
        _('Show reward video'),
        _('AdMob'),
        'JsPlatform/Extensions/admobicon24.png',
        'JsPlatform/Extensions/admobicon16.png'
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/AdMob/admobtools.js')
      .setFunctionName('gdjs.adMob.showVideo');

    extension
      .addAction(
        'ClaimReward',
        _('Claim reward'),
        _('Mark the video reward as claimed.'),
        _('Claim video reward'),
        _('AdMob'),
        'JsPlatform/Extensions/admobicon24.png',
        'JsPlatform/Extensions/admobicon16.png'
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/AdMob/admobtools.js')
      .setFunctionName('gdjs.adMob.claimVideoReward');

    return extension;
  },
  runExtensionSanityTests: function(gd, extension) {
    return [];
  },
};
