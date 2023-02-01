namespace gdjs {
  declare var admob: any;
  declare var cordova: any;

  export namespace adMob {
    const logger = new gdjs.Logger('AdMob');

    export enum AdSizeType {
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

    // Admob does not initialize automatically, so we store a flag to know if it's initialized.
    let admobStarted = false;

    // Banner
    let banner;
    let bannerRequestedAdSizeType: AdSizeType = AdSizeType.SMART_BANNER;
    let bannerConfigured = false; // Becomes true when the user configures the ad id and the position of the banner.
    let bannerLoaded = false; // Becomes true when the banner is loaded by loaded.
    let bannerShowing = false; // Becomes true when loaded or when the user shows/hides the banner.
    let bannerErrored = false; // Becomes true when the banner fails to load.

    // Interstitial
    let interstitial;
    let interstitialLoading = false;
    let interstitialReady = false;
    let interstitialErrored = false;
    let interstitialShowing = false;

    // Reward video
    let video;
    let videoLoading = false;
    let videoReady = false;
    let videoErrored = false;
    let videoShowing = false;
    let videoRewardReceived = false;

    let npaValue = '0'; // TODO: expose an API to change this and also an automatic way using the consent SDK.

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
    const getAdUnitId = (androidAdUnitId, iosAdUnitId) => {
      if (typeof cordova === 'undefined') {
        logger.warn('Cordova is not available.');
        return;
      }
      if (cordova.platformId === 'android') {
        return androidAdUnitId;
      } else if (cordova.platformId === 'ios') {
        return iosAdUnitId;
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

      admob.setDevMode(enable);
    };

    // Banner
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
      const adUnitId = getAdUnitId(androidAdUnitId, iosAdUnitId);
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

    // Interstitial
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
      if (interstitialLoading || interstitialShowing) {
        return;
      }

      const adUnitId = getAdUnitId(androidAdUnitId, iosAdUnitId);
      if (!adUnitId) return;

      interstitialLoading = true;
      interstitialReady = false;
      interstitialErrored = false;

      interstitial = new admob.InterstitialAd({
        adUnitId,
        npa: npaValue,
      });

      try {
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
      }
      interstitialErrored = false;

      try {
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

    // Reward video
    export const isVideoLoading = () => videoLoading;
    export const isVideoReady = () => videoReady;
    export const isVideoShowing = () => videoShowing;
    export const isVideoErrored = () => videoErrored;

    /** Check if the reward of the video was received. */
    export const wasVideoRewardReceived = function (markAsClaimed) {
      const reward = videoRewardReceived;
      if (markAsClaimed) {
        videoRewardReceived = false;
      }
      return reward;
    };

    /** Load a reward video. */
    export const loadVideo = async (androidID, iosID, displayWhenLoaded) => {
      if (!checkIfAdMobIsAvailable()) return;
      if (videoLoading || videoShowing) {
        return;
      }

      const adUnitId = getAdUnitId(androidID, iosID);
      if (!adUnitId) return;

      videoLoading = true;
      videoReady = false;
      videoErrored = false;

      video = new admob.RewardedAd({
        adUnitId,
        npa: npaValue,
      });

      try {
        await video.load();
        logger.info('AdMob reward video successfully loaded.');
        videoLoading = false;
        videoReady = true;
        if (displayWhenLoaded) showVideo();
      } catch (error) {
        videoLoading = false;
        videoReady = false;
        videoErrored = true;
        logger.error('Error while loading a reward video:', error);
      }
    };

    /** Show the loaded reward video. */
    export const showVideo = async () => {
      if (!checkIfAdMobIsAvailable()) return;

      if (!video) {
        logger.warn('Video has not been set up, call loadVideo first.');
        return;
      }
      if (!videoReady) {
        logger.info('Video not loaded yet, cannot display it.');
      }
      videoErrored = false;

      try {
        await video.show();
        // Video will be shown and
        // `videoShowing` will be updated thanks to events
        // (but it's too early to change it now).
      } catch (error) {
        logger.error('Error while showing an AdMob reward video:', error);
        videoShowing = false;
        videoErrored = true;
      }
    };

    /** Mark the reward of the video as claimed. */
    export const markVideoRewardAsClaimed = () => {
      videoRewardReceived = false;
    };

    // Admob initialization listener
    document.addEventListener(
      'deviceready',
      async () => {
        // Obtain user consent ?

        await admob.start();

        admobStarted = true;
      },
      false
    );

    // Banner event listeners:
    document.addEventListener('admob.banner.load', () => {
      bannerShowing = true;
      bannerLoaded = true;
    });
    document.addEventListener('admob.banner.load_fail', () => {
      bannerShowing = false;
      bannerLoaded = false;
      bannerErrored = true;
    });

    document.addEventListener('admob.banner.open', () => {
      // Not implemented.
    });

    document.addEventListener('admob.banner.exit_app', () => {
      // Not implemented.
    });
    document.addEventListener('admob.banner.close', () => {
      // Not implemented.
    });

    // Interstitial event listeners
    document.addEventListener('admob.interstitial.load', () => {
      interstitialReady = true;
      interstitialLoading = false;
    });
    document.addEventListener('admob.interstitial.load_fail', () => {
      interstitialLoading = false;
    });
    document.addEventListener('admob.interstitial.open', () => {
      interstitialShowing = true;
      interstitialReady = false;
    });
    document.addEventListener('admob.interstitial.close', () => {
      interstitialShowing = false;
    });
    document.addEventListener('admob.interstitial.exit_app', () => {
      // Not implemented.
    });

    // Reward video event listeners
    document.addEventListener('admob.reward_video.load', () => {
      videoReady = true;
      videoLoading = false;
    });
    document.addEventListener('admob.reward_video.load_fail', () => {
      videoLoading = false;
    });
    document.addEventListener('admob.reward_video.open', () => {
      videoShowing = true;
      videoReady = false;
    });
    document.addEventListener('admob.reward_video.close', () => {
      videoShowing = false;
    });
    document.addEventListener('admob.reward_video.start', () => {
      // Not implemented.
    });
    document.addEventListener('admob.reward_video.complete', () => {
      // Not implemented.
    });
    document.addEventListener('admob.reward_video.reward', () => {
      videoRewardReceived = true;
    });
    document.addEventListener('admob.reward_video.exit_app', () => {
      // Not implemented.
    });
  }
}
