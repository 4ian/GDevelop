namespace gdjs {
  declare var admob: any;

  export namespace adMob {
    export enum AdSizeType {
      BANNER,
      LARGE_BANNER,
      MEDIUM_RECTANGLE,
      FULL_BANNER,
      LEADERBOARD,
      SMART_BANNER,
    }

    // Banner
    let bannerAndroidId = '';
    let bannerIosId = '';
    let bannerPosition: 'top' | 'bottom' = 'top';
    let bannerRequestedAdSizeType: AdSizeType = AdSizeType.SMART_BANNER;

    let bannerLoading = false;
    let bannerErrored = false;
    let bannerShowing = false;

    // Interstitial
    let interstitialLoading = false;
    let interstitialReady = false;
    let interstitialErrored = false;
    let interstitialShowing = false;

    // Reward video
    let videoLoading = false;
    let videoReady = false;
    let videoErrored = false;
    let videoShowing = false;
    let videoRewardReceived = false;

    let npaValue = '0'; // TODO: expose an API to change this and also an automatic way using the consent SDK.

    /**
     * Activate or deactivate the test mode ("development" mode).
     * When activated, tests ads will be served instead of real ones.
     *
     * It is important to enable test ads during development so that you can click on them without
     * charging advertisers. If you click on too many ads without being in test mode, you risk your
     * account being flagged for invalid activity.
     */
    export const setTestMode = (enable: boolean) => {
      if (typeof admob === 'undefined') {
        return;
      }

      admob.setDevMode(enable);
    };

    // Banner
    /** Check if a banner is loading. */
    export const isBannerLoading = () => {
      return bannerLoading;
    };
    /** Check if a banner is being shown on screen. */
    export const isBannerShowing = () => {
      return bannerShowing;
    };
    /** Check if the banner had an error while loading it. */
    export const isBannerErrored = () => {
      return bannerErrored;
    };

    /**
     * Set up a banner that can then be displayed by calling `showBanner`.
     */
    export const setupBanner = function (androidID, iosID, atTop) {
      if (typeof admob === 'undefined') {
        return;
      }

      bannerAndroidId = androidID;
      bannerIosId = iosID;
      bannerPosition = atTop ? 'top' : 'bottom';
    };
    /**
     * Set the size of the banner to be shown when `showBanner` is called.
     * @param bannerAdSizeType The type of the banner to displayed
     */
    export const setBannerAdSizeType = (
      bannerAdSizeType:
        | 'BANNER'
        | 'LARGE_BANNER'
        | 'MEDIUM_RECTANGLE'
        | 'FULL_BANNER'
        | 'LEADERBOARD'
        | 'SMART_BANNER'
    ) => {
      const adSizeTypes = {
        BANNER: AdSizeType.BANNER,
        LARGE_BANNER: AdSizeType.LARGE_BANNER,
        MEDIUM_RECTANGLE: AdSizeType.MEDIUM_RECTANGLE,
        FULL_BANNER: AdSizeType.FULL_BANNER,
        LEADERBOARD: AdSizeType.LEADERBOARD,
        SMART_BANNER: AdSizeType.SMART_BANNER,
      };

      bannerRequestedAdSizeType =
        adSizeTypes[bannerAdSizeType] || AdSizeType.SMART_BANNER;
    };
    /**
     * Display the banner that was set up with `loadBanner` (and `setBannerAdSizeType`).
     */
    export const showBanner = () => {
      if (typeof admob === 'undefined') {
        return;
      }

      bannerLoading = true;
      bannerShowing = false;
      bannerErrored = false;
      admob.banner
        .show({
          id: {
            android: bannerAndroidId,
            ios: bannerIosId,
          },
          position: bannerPosition,
          size: bannerRequestedAdSizeType,
        })
        .then(
          () => {
            bannerShowing = true;
            bannerLoading = false;
            console.info('AdMob banner successfully shown.');
          },
          (error) => {
            bannerShowing = false;
            bannerLoading = false;
            bannerErrored = true;
            console.error('Error while showing an AdMob banner:', error);
          }
        );
    };
    /** Hide the banner shown on screen. */
    export const hideBanner = () => {
      if (typeof admob === 'undefined') {
        return;
      }

      bannerShowing = false;
      admob.banner.hide({
        android: bannerAndroidId,
        ios: bannerIosId,
      });
    };

    // Interstitial
    /** Check if the interstitial is loading. */
    export const isInterstitialLoading = () => {
      return interstitialLoading;
    };
    /** Check if the interstitial is ready to display. */
    export const isInterstitialReady = () => {
      return interstitialReady;
    };
    /** Check if the interstitial is shown on screen. */
    export const isInterstitialShowing = () => {
      return interstitialShowing;
    };
    /** Check if the interstitial had an error while loading it. */
    export const isInterstitialErrored = () => {
      return interstitialErrored;
    };

    /** Load an interstitial. */
    export const loadInterstitial = (androidID, iosID, displayWhenLoaded) => {
      if (typeof admob === 'undefined') {
        return;
      }
      if (interstitialLoading || interstitialReady || interstitialShowing) {
        return;
      }

      interstitialLoading = true;
      interstitialReady = false;
      interstitialErrored = false;
      admob.interstitial
        .load({
          id: {
            android: androidID,
            ios: iosID,
          },
          npa: npaValue,
        })
        .then(
          () => {
            console.info('AdMob interstitial successfully loaded.');
            if (displayWhenLoaded) showInterstitial();
          },
          (error) => {
            interstitialLoading = false;
            interstitialReady = false;
            interstitialErrored = true;
            console.error('Error while loading a interstitial:', error);
          }
        );
    };

    /** Show the loaded interstitial. */
    export const showInterstitial = () => {
      if (typeof admob === 'undefined') {
        return;
      }
      admob.interstitial.show().then(
        () => {
          // Interstitial will be shown and
          // `interstitialShowing` will be updated thanks to events
          // (but it's too early to change it now).
        },
        (error) => {
          interstitialShowing = false;
          interstitialErrored = true;
          console.error('Error while trying to show an interstitial:', error);
        }
      );
    };

    // Reward video
    /** Check if the video is loading. */
    export const isVideoLoading = () => {
      return videoLoading;
    };
    /** Check if the video is ready to display. */
    export const isVideoReady = () => {
      return videoReady;
    };
    /** Check if the video is shown on screen. */
    export const isVideoShowing = () => {
      return videoShowing;
    };
    /** Check if the video had an error while loading it. */
    export const isVideoErrored = () => {
      return videoErrored;
    };

    /** Check if the reward of the video was received. */
    export const wasVideoRewardReceived = function (markAsClaimed) {
      const reward = videoRewardReceived;
      if (markAsClaimed) {
        videoRewardReceived = false;
      }
      return reward;
    };

    /** Load a reward video. */
    export const loadVideo = function (androidID, iosID, displayWhenLoaded) {
      if (typeof admob === 'undefined') {
        return;
      }
      if (videoLoading || videoReady || videoShowing) {
        return;
      }

      videoLoading = true;
      videoReady = false;
      videoErrored = false;
      admob.rewardVideo
        .load({
          id: {
            android: androidID,
            ios: iosID,
          },
          npa: npaValue,
        })
        .then(
          () => {
            console.info('AdMob reward video successfully loaded.');

            if (displayWhenLoaded) showVideo();
          },
          (error) => {
            videoLoading = false;
            videoReady = false;
            videoErrored = true;
            console.error('Error while loading a reward video:', error);
          }
        );
    };

    /** Show the loaded reward video. */
    export const showVideo = () => {
      if (typeof admob === 'undefined') {
        return;
      }

      admob.rewardVideo.show().then(
        () => {
          // Video will be shown and
          // `videoShowing` will be updated thanks to events
          // (but it's too early to change it now).
        },
        (error) => {
          videoShowing = false;
          videoErrored = true;
          console.error('Error while trying to show a reward video:', error);
        }
      );
    };

    /** Mark the reward of the video as claimed. */
    export const markVideoRewardAsClaimed = () => {
      videoRewardReceived = false;
    };

    // Banner event listeners:
    document.addEventListener('admob.banner.load', () => {
      bannerShowing = true;
      bannerLoading = false;
    });
    document.addEventListener('admob.banner.load_fail', () => {
      bannerLoading = false;
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
