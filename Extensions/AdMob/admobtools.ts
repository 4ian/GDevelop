namespace gdjs {
  /**
   * @memberof gdjs
   * @class adMob
   * @static
   */
  gdjs.adMob = {
    // Banner
    bannerLoading: false,
    bannerReady: false,
    bannerShowing: false,
    bannerExists: false,
    bannerAutoshow: false,
    // Needed because the banner event listeners bug
    // Interstitial
    interstitialLoading: false,
    interstitialReady: false,
    interstitialShowing: false,
    // Reward video
    videoLoading: false,
    videoReady: false,
    videoShowing: false,
    videoReward: false,
  };
  gdjs.adMob._getPlatformName = function () {
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
  gdjs.adMob.isBannerLoading = function () {
    return gdjs.adMob.bannerLoading;
  };
  gdjs.adMob.isBannerReady = function () {
    // This block is needed because the banner event listeners bug
    if (gdjs.adMob.bannerAutoshow && gdjs.adMob.bannerReady) {
      gdjs.adMob.bannerReady = false;
      gdjs.adMob.bannerShowing = true;
      gdjs.adMob.bannerExists = true;
    }
    return gdjs.adMob.bannerReady;
  };
  gdjs.adMob.isBannerShowing = function () {
    // This block is needed because the banner event listeners bug
    if (gdjs.adMob.bannerAutoshow && gdjs.adMob.bannerReady) {
      gdjs.adMob.bannerReady = false;
      gdjs.adMob.bannerShowing = true;
      gdjs.adMob.bannerExists = true;
    }
    return gdjs.adMob.bannerShowing;
  };
  gdjs.adMob.existBanner = function () {
    // This block is needed because the banner event listeners bug
    if (gdjs.adMob.bannerAutoshow && gdjs.adMob.bannerReady) {
      gdjs.adMob.bannerReady = false;
      gdjs.adMob.bannerShowing = true;
      gdjs.adMob.bannerExists = true;
    }
    return gdjs.adMob.bannerExists;
  };
  gdjs.adMob.loadBanner = function (
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
  gdjs.adMob.showBanner = function () {
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
  gdjs.adMob.hideBanner = function () {
    if (typeof admob === 'undefined') {
      return;
    }
    if (gdjs.adMob.bannerExists) {
      gdjs.adMob.bannerShowing = false;
    }
    admob.banner.hide();
  };
  gdjs.adMob.removeBanner = function () {
    if (typeof admob === 'undefined') {
      return;
    }

    // These lines are needed because the banner event listeners bug
    gdjs.adMob.bannerExists = false;
    gdjs.adMob.bannerShowing = false;
    admob.banner.remove();
  };

  // Interstitial
  gdjs.adMob.isInterstitialLoading = function () {
    return gdjs.adMob.interstitialLoading;
  };
  gdjs.adMob.isInterstitialReady = function () {
    return gdjs.adMob.interstitialReady;
  };
  gdjs.adMob.isInterstitialShowing = function () {
    return gdjs.adMob.interstitialShowing;
  };
  gdjs.adMob.loadInterstitial = function (
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
  gdjs.adMob.showInterstitial = function () {
    if (typeof admob === 'undefined') {
      return;
    }
    admob.interstitial.show();
  };

  // Reward video
  gdjs.adMob.isVideoLoading = function () {
    return gdjs.adMob.videoLoading;
  };
  gdjs.adMob.isVideoReady = function () {
    return gdjs.adMob.videoReady;
  };
  gdjs.adMob.isVideoShowing = function () {
    return gdjs.adMob.videoShowing;
  };
  gdjs.adMob.existVideoReward = function (markAsClaimed) {
    const reward = gdjs.adMob.videoReward;
    if (markAsClaimed) {
      gdjs.adMob.videoReward = false;
    }
    return reward;
  };
  gdjs.adMob.loadVideo = function (
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
  gdjs.adMob.showVideo = function () {
    if (typeof admob === 'undefined') {
      return;
    }
    admob.rewardvideo.show();
  };
  gdjs.adMob.claimVideoReward = function () {
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
