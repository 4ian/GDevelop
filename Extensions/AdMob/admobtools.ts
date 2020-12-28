namespace gdjs {
  declare var admob: any;

  /**
   * @memberof gdjs
   * @class adMob
   * @static
   */
  export namespace adMob {
    // Banner
    export let bannerLoading = false;
    export let bannerReady = false;
    export let bannerShowing = false;
    export let bannerExists = false;
    export let bannerAutoshow = false;
    // Needed because the banner event listeners bug
    // Interstitial
    export let interstitialLoading = false;
    export let interstitialReady = false;
    export let interstitialShowing = false;
    // Reward video
    export let videoLoading = false;
    export let videoReady = false;
    export let videoShowing = false;
    export let videoReward = false;

    export const _getPlatformName = function () {
      if (/(android)/i.test(navigator.userAgent)) {
        return 'android';
      } else {
        if (/(ipod|iphone|ipad)/i.test(navigator.userAgent)) {
          return 'ios';
        } else {
          return 'windowsPhone';
        }
      }
    };

    // Banner
    export const isBannerLoading = function () {
      return gdjs.adMob.bannerLoading;
    };
    export const isBannerReady = function () {
      // This block is needed because the banner event listeners bug
      if (gdjs.adMob.bannerAutoshow && gdjs.adMob.bannerReady) {
        gdjs.adMob.bannerReady = false;
        gdjs.adMob.bannerShowing = true;
        gdjs.adMob.bannerExists = true;
      }
      return gdjs.adMob.bannerReady;
    };
    export const isBannerShowing = function () {
      // This block is needed because the banner event listeners bug
      if (gdjs.adMob.bannerAutoshow && gdjs.adMob.bannerReady) {
        gdjs.adMob.bannerReady = false;
        gdjs.adMob.bannerShowing = true;
        gdjs.adMob.bannerExists = true;
      }
      return gdjs.adMob.bannerShowing;
    };
    export const existBanner = function () {
      // This block is needed because the banner event listeners bug
      if (gdjs.adMob.bannerAutoshow && gdjs.adMob.bannerReady) {
        gdjs.adMob.bannerReady = false;
        gdjs.adMob.bannerShowing = true;
        gdjs.adMob.bannerExists = true;
      }
      return gdjs.adMob.bannerExists;
    };
    export const loadBanner = function (
      androidID,
      iosID,
      atTop,
      overlap,
      displayOnLoading,
      testMode
    ) {
      if (typeof admob === 'undefined') {
        return;
      }
      if (
        gdjs.adMob.bannerLoading ||
        gdjs.adMob.bannerReady ||
        gdjs.adMob.bannerExists
      ) {
        return;
      }
      admob.banner.config({
        id:
          // Support Android & iOS
          gdjs.adMob._getPlatformName() === 'android' ? androidID : iosID,
        bannerAtTop: atTop,
        overlap: overlap,
        autoShow: displayOnLoading,
        isTesting: testMode,
      });
      admob.banner.prepare();
      gdjs.adMob.bannerLoading = true;
      gdjs.adMob.bannerReady = false;

      // These lines are needed because the banner event listeners bug
      gdjs.adMob.bannerAutoshow = displayOnLoading;
      gdjs.adMob.bannerShowing = false;
      gdjs.adMob.bannerExists = false;
    };
    export const showBanner = function () {
      if (typeof admob === 'undefined') {
        return;
      }

      // This block is needed because the banner event listeners bug
      if (gdjs.adMob.bannerReady) {
        gdjs.adMob.bannerReady = false;
        gdjs.adMob.bannerExists = true;
      }
      if (gdjs.adMob.bannerExists) {
        gdjs.adMob.bannerShowing = true;
      }
      admob.banner.show();
    };
    export const hideBanner = function () {
      if (typeof admob === 'undefined') {
        return;
      }
      if (gdjs.adMob.bannerExists) {
        gdjs.adMob.bannerShowing = false;
      }
      admob.banner.hide();
    };
    export const removeBanner = function () {
      if (typeof admob === 'undefined') {
        return;
      }

      // These lines are needed because the banner event listeners bug
      gdjs.adMob.bannerExists = false;
      gdjs.adMob.bannerShowing = false;
      admob.banner.remove();
    };

    // Interstitial
    export const isInterstitialLoading = function () {
      return gdjs.adMob.interstitialLoading;
    };
    export const isInterstitialReady = function () {
      return gdjs.adMob.interstitialReady;
    };
    export const isInterstitialShowing = function () {
      return gdjs.adMob.interstitialShowing;
    };
    export const loadInterstitial = function (
      androidID,
      iosID,
      displayOnLoading,
      testMode
    ) {
      if (typeof admob === 'undefined') {
        return;
      }
      if (
        gdjs.adMob.interstitialLoading ||
        gdjs.adMob.interstitialReady ||
        gdjs.adMob.interstitialShowing
      ) {
        return;
      }
      admob.interstitial.config({
        id:
          // Support Android & iOS
          gdjs.adMob._getPlatformName() === 'android' ? androidID : iosID,
        autoShow: displayOnLoading,
        isTesting: testMode,
      });
      admob.interstitial.prepare();
      gdjs.adMob.interstitialLoading = true;
      gdjs.adMob.interstitialReady = false;
    };
    export const showInterstitial = function () {
      if (typeof admob === 'undefined') {
        return;
      }
      admob.interstitial.show();
    };

    // Reward video
    export const isVideoLoading = function () {
      return gdjs.adMob.videoLoading;
    };
    export const isVideoReady = function () {
      return gdjs.adMob.videoReady;
    };
    export const isVideoShowing = function () {
      return gdjs.adMob.videoShowing;
    };
    export const existVideoReward = function (markAsClaimed) {
      const reward = gdjs.adMob.videoReward;
      if (markAsClaimed) {
        gdjs.adMob.videoReward = false;
      }
      return reward;
    };
    export const loadVideo = function (
      androidID,
      iosID,
      displayOnLoading,
      testMode
    ) {
      if (typeof admob === 'undefined') {
        return;
      }
      if (
        gdjs.adMob.videoLoading ||
        gdjs.adMob.videoReady ||
        gdjs.adMob.videoShowing
      ) {
        return;
      }
      admob.rewardvideo.config({
        id:
          // Support Android & iOS
          gdjs.adMob._getPlatformName() === 'android' ? androidID : iosID,
        autoShow: displayOnLoading,
        isTesting: testMode,
      });
      admob.rewardvideo.prepare();
      gdjs.adMob.videoLoading = true;
      gdjs.adMob.videoReady = false;
    };
    export const showVideo = function () {
      if (typeof admob === 'undefined') {
        return;
      }
      admob.rewardvideo.show();
    };
    export const claimVideoReward = function () {
      gdjs.adMob.videoReward = false;
    };

    // Banner event listeners
    document.addEventListener(
      'admob.banner.events.LOAD',
      function () {
        gdjs.adMob.bannerReady = true;
        gdjs.adMob.bannerLoading = false;
      },
      false
    );
    document.addEventListener(
      'admob.banner.events.LOAD_FAIL',
      function () {
        gdjs.adMob.bannerLoading = false;
      },
      false
    );

    // BUG: These two never get called
    /*
document.addEventListener(
  "admob.banner.events.OPEN",
  function() {
    gdjs.adMob.bannerExists = true;
    gdjs.adMob.bannerShowing = true;
    gdjs.adMob.bannerReady = false;
  },
  false
);
document.addEventListener(
  "admob.banner.events.CLOSE",
  function() {
    gdjs.adMob.bannerExists = false;
    gdjs.adMob.bannerShowing = false;
  },
  false
);
*/

    // Interstitial event listeners
    document.addEventListener(
      'admob.interstitial.events.LOAD',
      function () {
        gdjs.adMob.interstitialReady = true;
        gdjs.adMob.interstitialLoading = false;
      },
      false
    );
    document.addEventListener(
      'admob.interstitial.events.LOAD_FAIL',
      function () {
        gdjs.adMob.interstitialLoading = false;
      },
      false
    );
    document.addEventListener(
      'admob.interstitial.events.OPEN',
      function () {
        gdjs.adMob.interstitialShowing = true;
        gdjs.adMob.interstitialReady = false;
      },
      false
    );
    document.addEventListener(
      'admob.interstitial.events.CLOSE',
      function () {
        gdjs.adMob.interstitialShowing = false;
      },
      false
    );

    // Reward video event listeners
    document.addEventListener(
      'admob.rewardvideo.events.LOAD',
      function () {
        gdjs.adMob.videoReady = true;
        gdjs.adMob.videoLoading = false;
      },
      false
    );
    document.addEventListener(
      'admob.rewardvideo.events.LOAD_FAIL',
      function () {
        gdjs.adMob.videoLoading = false;
      },
      false
    );
    document.addEventListener(
      'admob.rewardvideo.events.OPEN',
      function () {
        gdjs.adMob.videoShowing = true;
        gdjs.adMob.videoReady = false;
      },
      false
    );
    document.addEventListener(
      'admob.rewardvideo.events.CLOSE',
      function () {
        gdjs.adMob.videoShowing = false;
      },
      false
    );
    document.addEventListener(
      'admob.rewardvideo.events.REWARD',
      function () {
        gdjs.adMob.videoReward = true;
      },
      false
    );
  }
}
