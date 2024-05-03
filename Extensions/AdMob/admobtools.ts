namespace gdjs {
  declare var admob: any;
  declare var cordova: any;

  export namespace adMob {
    const logger = new gdjs.Logger('AdMob');

    const testAdIds = {
      appOpen: {
        android: 'ca-app-pub-3940256099942544/3419835294',
        ios: 'ca-app-pub-3940256099942544/5662855259',
      },
      banner: {
        android: 'ca-app-pub-3940256099942544/6300978111',
        ios: 'ca-app-pub-3940256099942544/2934735716',
      },
      interstitial: {
        android: 'ca-app-pub-3940256099942544/1033173712',
        ios: 'ca-app-pub-3940256099942544/4411468910',
      },
      interstitialVideo: {
        android: 'ca-app-pub-3940256099942544/8691691433',
        ios: 'ca-app-pub-3940256099942544/5135589807',
      },
      rewarded: {
        android: 'ca-app-pub-3940256099942544/5224354917',
        ios: 'ca-app-pub-3940256099942544/1712485313',
      },
      rewardedInterstitial: {
        android: 'ca-app-pub-3940256099942544/5354046379',
        ios: 'ca-app-pub-3940256099942544/6978759866',
      },
      native: {
        android: 'ca-app-pub-3940256099942544/2247696110',
        ios: 'ca-app-pub-3940256099942544/3986624511',
      },
      nativeVideo: {
        android: 'ca-app-pub-3940256099942544/1044960115',
        ios: 'ca-app-pub-3940256099942544/2521693316',
      },
    };

    enum AdSizeType {
      BANNER,
      LARGE_BANNER,
      MEDIUM_RECTANGLE,
      FULL_BANNER,
      LEADERBOARD,
      SMART_BANNER,
    }

    const adSizeTypes = {
      BANNER: AdSizeType.BANNER,
      LARGE_BANNER: AdSizeType.LARGE_BANNER,
      MEDIUM_RECTANGLE: AdSizeType.MEDIUM_RECTANGLE,
      FULL_BANNER: AdSizeType.FULL_BANNER,
      LEADERBOARD: AdSizeType.LEADERBOARD,
      SMART_BANNER: AdSizeType.SMART_BANNER,
    };

    enum AppOpenAdOrientation {
      Portrait = 1,
      PortraitUpsideDown = 2,
      LandscapeRight = 3,
      LandscapeLeft = 4,
    }

    // Admob does not initialize automatically, so we store a flag to know if it's initialized.
    let admobStarted = false;
    let isUsingTestAds = false;

    // Banner
    let banner;
    let bannerRequestedAdSizeType: AdSizeType = AdSizeType.SMART_BANNER;
    let bannerConfigured = false; // Becomes true when the user configures the ad id and the position of the banner.
    let bannerLoaded = false; // Becomes true when the banner is loaded by loaded.
    let bannerShowing = false; // Becomes true when loaded or when the user shows/hides the banner.
    let bannerErrored = false; // Becomes true when the banner fails to load.

    // Interstitial
    let interstitial;
    let interstitialLoading = false; // Becomes true when the interstitial is loading.
    let interstitialReady = false; // Becomes true when the interstitial is loaded and ready to be shown.
    let interstitialShowing = false; // Becomes true when the interstitial is showing.
    let interstitialErrored = false; // Becomes true when the interstitial fails to load.

    // App Open
    let appOpen;
    let appOpenLoading = false; // Becomes true when the appOpen is loading.
    let appOpenReady = false; // Becomes true when the appOpen is loaded and ready to be shown.
    let appOpenShowing = false; // Becomes true when the appOpen is showing.
    let appOpenErrored = false; // Becomes true when the appOpen fails to load.

    // Rewarded interstitial
    let rewardedInterstitial;
    let rewardedInterstitialLoading = false; // Becomes true when the interstitial is loading.
    let rewardedInterstitialReady = false; // Becomes true when the interstitial is loaded and ready to be shown.
    let rewardedInterstitialShowing = false; // Becomes true when the interstitial is showing.
    let rewardedInterstitialRewardReceived = false; // Becomes true when the interstitial is closed and the reward is received.
    let rewardedInterstitialErrored = false; // Becomes true when the interstitial fails to load.

    // Rewarded video
    let rewardedVideo;
    let rewardedVideoLoading = false; // Becomes true when the video is loading.
    let rewardedVideoReady = false; // Becomes true when the video is loaded and ready to be shown.
    let rewardedVideoShowing = false; // Becomes true when the video is showing.
    let rewardedVideoRewardReceived = false; // Becomes true when the video is closed and the reward is received.
    let rewardedVideoErrored = false; // Becomes true when the video fails to load.

    let npaValue = '0'; // TODO: expose an API to change this and also an automatic way using the consent SDK.

    // Admob initialization listener
    document.addEventListener(
      'deviceready',
      async () => {
        // Obtain user consent ?

        await admob.start();

        logger.info('AdMob successfully started.');
        admobStarted = true;
      },
      false
    );

    /**
     * Helper to know if we are on mobile and admob is correctly initialized.
     */
    const checkIfAdMobIsAvailable = () => {
      if (typeof cordova === 'undefined') {
        logger.warn('We are not on mobile, AdMob will not be available.');
        return false;
      }
      if (typeof admob === 'undefined' || !admobStarted) {
        logger.warn('AdMob has not been configured or started properly.');
        return false;
      }
      return true;
    };

    /**
     * Helper to get the correct ad id depending on the platform. Android and iOS use different ids.
     */
    const getAdUnitId = (androidAdUnitId, iosAdUnitId, type) => {
      if (typeof cordova === 'undefined') {
        logger.warn('Cordova is not available.');
        return;
      }
      if (cordova.platformId === 'android') {
        return isUsingTestAds ? testAdIds[type].android : androidAdUnitId;
      } else if (cordova.platformId === 'ios') {
        return isUsingTestAds ? testAdIds[type].ios : iosAdUnitId;
      }

      logger.error('Unsupported platform: ', cordova.platformId);
      return null;
    };

    /**
     * Activate or deactivate the test mode ("development" mode).
     * When activated, tests ads will be served instead of real ones.
     *
     * It is important to enable test ads during development so that you can click on them without
     * charging advertisers. If you click on too many ads without being in test mode, you risk your
     * account being flagged for invalid activity.
     */
    export const setTestMode = (enable: boolean) => {
      if (!checkIfAdMobIsAvailable()) return;

      isUsingTestAds = enable;
    };

    // -------------------
    // ---- App Open -----
    // -------------------
    export const isAppOpenLoading = () => appOpenLoading;
    export const isAppOpenReady = () => appOpenReady;
    export const isAppOpenShowing = () => appOpenShowing;
    export const isAppOpenErrored = () => appOpenErrored;

    /** Load an AppOpen. */
    export const loadAppOpen = async (
      androidAdUnitId,
      iosAdUnitId,
      displayLandscape,
      displayWhenLoaded
    ) => {
      if (!checkIfAdMobIsAvailable()) return;
      // If an appOpen is already loading or showing, we don't stop it.
      if (appOpenLoading || appOpenShowing) {
        return;
      }

      const adUnitId = getAdUnitId(androidAdUnitId, iosAdUnitId, 'appOpen');
      if (!adUnitId) return;

      appOpenLoading = true;
      appOpenReady = false;
      appOpenErrored = false;

      appOpen = new admob.AppOpenAd({
        adUnitId,
        orientation: displayLandscape
          ? AppOpenAdOrientation.LandscapeLeft
          : AppOpenAdOrientation.Portrait,
      });

      appOpen.on('load', () => {
        appOpenReady = true;
        appOpenLoading = false;
      });
      appOpen.on('loadfail', () => {
        appOpenLoading = false;
        appOpenErrored = true;
      });
      appOpen.on('show', () => {
        appOpenShowing = true;
        appOpenReady = false;
      });
      appOpen.on('showfail', () => {
        appOpenShowing = false;
        appOpenErrored = true;
      });
      appOpen.on('dismiss', () => {
        appOpenShowing = false;
      });

      try {
        logger.info('Loading Admob App Open.');
        await appOpen.load();
        logger.info('AdMob App Open successfully loaded.');
        appOpenLoading = false;
        appOpenReady = true;
        if (displayWhenLoaded) showAppOpen();
      } catch (error) {
        logger.error('Error while loading an App Open:', error);
        appOpenLoading = false;
        appOpenReady = false;
        appOpenErrored = true;
      }
    };

    /** Show the loaded appOpen. */
    export const showAppOpen = async () => {
      if (!checkIfAdMobIsAvailable()) return;

      if (!appOpen) {
        logger.warn('App Open has not been set up, call loadAppOpen first.');
        return;
      }
      if (!appOpenReady) {
        logger.info('App Open not loaded yet, cannot display it.');
        return;
      }
      appOpenErrored = false;

      try {
        logger.info('Showing AdMob App Open.');
        await appOpen.show();
        // AppOpen will be shown and
        // `appOpenShowing` will be updated thanks to events
        // (but it's too early to change it now).
      } catch (error) {
        logger.error('Error while showing an AdMob App Open:', error);
        appOpenShowing = false;
        appOpenErrored = true;
      }
    };

    // -----------------
    // ---- Banner -----
    // -----------------
    export const isBannerConfigured = () => bannerConfigured;
    export const isBannerLoaded = () => bannerLoaded;
    export const isBannerShowing = () => bannerShowing;
    export const isBannerErrored = () => bannerErrored;

    export const setBannerAdSizeType = (
      bannerAdSizeType:
        | 'BANNER'
        | 'LARGE_BANNER'
        | 'MEDIUM_RECTANGLE'
        | 'FULL_BANNER'
        | 'LEADERBOARD'
        | 'SMART_BANNER'
    ) => {
      bannerRequestedAdSizeType =
        adSizeTypes[bannerAdSizeType] || AdSizeType.SMART_BANNER;
    };

    /**
     * Set up a banner that can then be displayed by calling `showBanner`.
     * If a banner is already set up, it will be hidden and replaced by the new one.
     */
    export const setupBanner = async (androidAdUnitId, iosAdUnitId, atTop) => {
      if (!checkIfAdMobIsAvailable()) return;
      const adUnitId = getAdUnitId(androidAdUnitId, iosAdUnitId, 'banner');
      if (!adUnitId) return;

      if (banner && bannerShowing) {
        logger.info('Banner already visible, hiding it to display new one.');
        await hideBanner();
      }

      bannerConfigured = false;
      bannerLoaded = false;

      banner = new admob.BannerAd({
        adUnitId,
        position: atTop ? 'top' : 'bottom',
        size: bannerRequestedAdSizeType,
      });

      banner.on('load', () => {
        bannerShowing = true;
        bannerLoaded = true;
      });
      banner.on('loadfail', () => {
        bannerShowing = false;
        bannerLoaded = false;
        bannerErrored = true;
      });

      bannerConfigured = true;
    };

    /**
     * Display a banner that was set up with `setupBanner` (and `setBannerAdSizeType`).
     */
    export const showBanner = async () => {
      if (!banner) {
        logger.info('Banner not configured, use setupBanner first.');
        return;
      }
      if (bannerShowing) {
        logger.info('Banner already visible. Ignoring.');
        return;
      }
      bannerErrored = false;

      try {
        logger.info('Showing AdMob banner.');
        await banner.show();
        if (bannerLoaded) {
          // Banner is already loaded, so it will be shown immediately.
          bannerShowing = true;
        }
      } catch (error) {
        bannerShowing = false;
        bannerErrored = true;
        logger.error('Error while showing an AdMob banner:', error);
      }
    };

    /** Hide the banner shown on screen. */
    export const hideBanner = async () => {
      if (!checkIfAdMobIsAvailable()) return;

      if (!banner || !bannerShowing) {
        logger.warn('No banner is being shown.');
        return;
      }

      await banner.hide();
      bannerShowing = false;
      // Note that the banner is still loaded, which is why bannerLoaded is not set to false.
      // We hide the banner, but keep it configured to display it again if needed.
    };

    // -----------------------
    // ---- Interstitial -----
    // -----------------------
    export const isInterstitialLoading = () => interstitialLoading;
    export const isInterstitialReady = () => interstitialReady;
    export const isInterstitialShowing = () => interstitialShowing;
    export const isInterstitialErrored = () => interstitialErrored;

    /** Load an interstitial. */
    export const loadInterstitial = async (
      androidAdUnitId,
      iosAdUnitId,
      displayWhenLoaded
    ) => {
      if (!checkIfAdMobIsAvailable()) return;
      // If an interstitial is already loading or showing, we don't stop it.
      if (interstitialLoading || interstitialShowing) {
        return;
      }

      const adUnitId = getAdUnitId(
        androidAdUnitId,
        iosAdUnitId,
        'interstitial'
      );
      if (!adUnitId) return;

      interstitialLoading = true;
      interstitialReady = false;
      interstitialErrored = false;

      interstitial = new admob.InterstitialAd({
        adUnitId,
        npa: npaValue,
      });

      interstitial.on('load', () => {
        interstitialReady = true;
        interstitialLoading = false;
      });
      interstitial.on('loadfail', () => {
        interstitialLoading = false;
        interstitialErrored = true;
      });
      interstitial.on('show', () => {
        interstitialShowing = true;
        interstitialReady = false;
      });
      interstitial.on('showfail', () => {
        interstitialShowing = false;
        interstitialErrored = true;
      });
      interstitial.on('dismiss', () => {
        interstitialShowing = false;
      });

      try {
        logger.info('Loading Admob interstitial.');
        await interstitial.load();
        logger.info('AdMob interstitial successfully loaded.');
        interstitialLoading = false;
        interstitialReady = true;
        if (displayWhenLoaded) showInterstitial();
      } catch (error) {
        logger.error('Error while loading a interstitial:', error);
        interstitialLoading = false;
        interstitialReady = false;
        interstitialErrored = true;
      }
    };

    /** Show the loaded interstitial. */
    export const showInterstitial = async () => {
      if (!checkIfAdMobIsAvailable()) return;

      if (!interstitial) {
        logger.warn(
          'Interstitial has not been set up, call loadInterstitial first.'
        );
        return;
      }
      if (!interstitialReady) {
        logger.info('Interstitial not loaded yet, cannot display it.');
        return;
      }
      interstitialErrored = false;

      try {
        logger.info('Showing AdMob interstitial.');
        await interstitial.show();
        // Interstitial will be shown and
        // `interstitialShowing` will be updated thanks to events
        // (but it's too early to change it now).
      } catch (error) {
        logger.error('Error while showing an AdMob interstitial:', error);
        interstitialShowing = false;
        interstitialErrored = true;
      }
    };

    // --------------------------------
    // ---- Rewarded Interstitial -----
    // --------------------------------
    export const isRewardedInterstitialLoading = () =>
      rewardedInterstitialLoading;
    export const isRewardedInterstitialReady = () => rewardedInterstitialReady;
    export const isRewardedInterstitialShowing = () =>
      rewardedInterstitialShowing;
    export const isRewardedInterstitialErrored = () =>
      rewardedInterstitialErrored;

    /** Check if the reward of the rewarded interstitial was received. */
    export const wasRewardedInterstitialRewardReceived = function (
      markAsClaimed
    ) {
      const reward = rewardedInterstitialRewardReceived;
      if (markAsClaimed) {
        rewardedInterstitialRewardReceived = false;
      }
      return reward;
    };

    /** Load a rewarded interstitial. */
    export const loadRewardedInterstitial = async (
      androidAdUnitID,
      iosAdUnitID,
      displayWhenLoaded
    ) => {
      if (!checkIfAdMobIsAvailable()) return;
      if (rewardedInterstitialLoading || rewardedInterstitialShowing) {
        return;
      }

      const adUnitId = getAdUnitId(
        androidAdUnitID,
        iosAdUnitID,
        'rewardedInterstitial'
      );
      if (!adUnitId) return;

      rewardedInterstitialLoading = true;
      rewardedInterstitialReady = false;
      rewardedInterstitialErrored = false;

      rewardedInterstitial = new admob.RewardedInterstitialAd({
        adUnitId,
        npa: npaValue,
      });

      // Rewarded video event listeners
      rewardedInterstitial.on('load', () => {
        rewardedInterstitialReady = true;
        rewardedInterstitialLoading = false;
      });
      rewardedInterstitial.on('loadfail', () => {
        rewardedInterstitialLoading = false;
        rewardedInterstitialErrored = true;
      });
      rewardedInterstitial.on('show', () => {
        rewardedInterstitialShowing = true;
        rewardedInterstitialReady = false;
      });
      rewardedInterstitial.on('showfail', () => {
        rewardedInterstitialShowing = false;
        rewardedInterstitialErrored = true;
      });
      rewardedInterstitial.on('dismiss', () => {
        rewardedInterstitialShowing = false;
      });
      rewardedInterstitial.on('reward', () => {
        rewardedInterstitialRewardReceived = true;
      });

      try {
        logger.info('Loading AdMob rewarded interstitial.');
        await rewardedInterstitial.load();
        logger.info('AdMob rewarded interstitial successfully loaded.');
        rewardedInterstitialLoading = false;
        rewardedInterstitialReady = true;
        if (displayWhenLoaded) showRewardedInterstitial();
      } catch (error) {
        rewardedInterstitialLoading = false;
        rewardedInterstitialReady = false;
        rewardedInterstitialErrored = true;
        logger.error('Error while loading a rewarded interstitial:', error);
      }
    };

    /** Show the loaded reward interstitial. */
    export const showRewardedInterstitial = async () => {
      if (!checkIfAdMobIsAvailable()) return;

      if (!rewardedInterstitial) {
        logger.warn(
          'interstitial has not been set up, call loadRewardedInterstitial first.'
        );
        return;
      }
      if (!rewardedInterstitialReady) {
        logger.info('Rewarded interstitial not loaded yet, cannot display it.');
      }
      rewardedInterstitialErrored = false;

      try {
        logger.info('Showing AdMob rewarded interstitial.');
        await rewardedInterstitial.show();
        // Rewarded interstitial will be shown and
        // `rewardedInterstitialShowing` will be updated thanks to events
        // (but it's too early to change it now).
      } catch (error) {
        logger.error(
          'Error while showing an AdMob rewarded interstitial:',
          error
        );
        rewardedInterstitialShowing = false;
        rewardedInterstitialErrored = true;
      }
    };

    /** Mark the reward of the interstitial as claimed. */
    export const markRewardedInterstitialRewardAsClaimed = () => {
      rewardedInterstitialRewardReceived = false;
    };

    // -------------------------
    // ---- Rewarded Video -----
    // -------------------------
    export const isRewardedVideoLoading = () => rewardedVideoLoading;
    export const isRewardedVideoReady = () => rewardedVideoReady;
    export const isRewardedVideoShowing = () => rewardedVideoShowing;
    export const isRewardedVideoErrored = () => rewardedVideoErrored;

    /** Check if the reward of the rewarded video was received. */
    export const wasRewardedVideoRewardReceived = function (markAsClaimed) {
      const reward = rewardedVideoRewardReceived;
      if (markAsClaimed) {
        rewardedVideoRewardReceived = false;
      }
      return reward;
    };

    /** Load a rewarded video. */
    export const loadRewardedVideo = async (
      androidAdUnitID,
      iosAdUnitID,
      displayWhenLoaded
    ) => {
      if (!checkIfAdMobIsAvailable()) return;
      if (rewardedVideoLoading || rewardedVideoShowing) {
        return;
      }

      const adUnitId = getAdUnitId(androidAdUnitID, iosAdUnitID, 'rewarded');
      if (!adUnitId) return;

      rewardedVideoLoading = true;
      rewardedVideoReady = false;
      rewardedVideoErrored = false;

      rewardedVideo = new admob.RewardedAd({
        adUnitId,
        npa: npaValue,
      });

      // Rewarded video event listeners
      rewardedVideo.on('load', () => {
        rewardedVideoReady = true;
        rewardedVideoLoading = false;
      });
      rewardedVideo.on('loadfail', () => {
        rewardedVideoLoading = false;
        rewardedVideoErrored = true;
      });
      rewardedVideo.on('show', () => {
        rewardedVideoShowing = true;
        rewardedVideoReady = false;
      });
      rewardedVideo.on('showfail', () => {
        rewardedVideoShowing = false;
        rewardedVideoErrored = true;
      });
      rewardedVideo.on('dismiss', () => {
        rewardedVideoShowing = false;
      });
      rewardedVideo.on('reward', () => {
        rewardedVideoRewardReceived = true;
      });

      try {
        logger.info('Loading AdMob rewarded video.');
        await rewardedVideo.load();
        logger.info('AdMob rewarded video successfully loaded.');
        rewardedVideoLoading = false;
        rewardedVideoReady = true;
        if (displayWhenLoaded) showRewardedVideo();
      } catch (error) {
        rewardedVideoLoading = false;
        rewardedVideoReady = false;
        rewardedVideoErrored = true;
        logger.error('Error while loading a rewarded video:', error);
      }
    };

    /** Show the loaded reward video. */
    export const showRewardedVideo = async () => {
      if (!checkIfAdMobIsAvailable()) return;

      if (!rewardedVideo) {
        logger.warn('Video has not been set up, call loadRewardedVideo first.');
        return;
      }
      if (!rewardedVideoReady) {
        logger.info('Rewarded video not loaded yet, cannot display it.');
      }
      rewardedVideoErrored = false;

      try {
        logger.info('Showing AdMob rewarded video.');
        await rewardedVideo.show();
        // Rewarded video will be shown and
        // `rewardedVideoShowing` will be updated thanks to events
        // (but it's too early to change it now).
      } catch (error) {
        logger.error('Error while showing an AdMob rewarded video:', error);
        rewardedVideoShowing = false;
        rewardedVideoErrored = true;
      }
    };

    /** Mark the reward of the video as claimed. */
    export const markRewardedVideoRewardAsClaimed = () => {
      rewardedVideoRewardReceived = false;
    };
  }
}
