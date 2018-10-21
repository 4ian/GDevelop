/**
 * @memberof gdjs
 * @class adMob
 * @static
 * @private
 */
gdjs.adMob = {
  videoLoading: false,
  videoReady: false,
  videoShowing: false,
  videoReward: false
};

gdjs.adMob.isVideoLoading = function() {
  return gdjs.adMob.videoLoading;
};

gdjs.adMob.isVideoReady = function() {
  return gdjs.adMob.videoReady;
};

gdjs.adMob.isVideoShowing = function() {
  return gdjs.adMob.videoShowing;
};

gdjs.adMob.existVideoReward = function(markAsClaimed) {
  var reward = gdjs.adMob.videoReward;
  if (markAsClaimed) gdjs.adMob.videoReward = false;
  return reward;
};

gdjs.adMob._getPlatformName = function() {
  if (/(android)/i.test(navigator.userAgent)) {
    return "android";
  } else if (/(ipod|iphone|ipad)/i.test(navigator.userAgent)) {
    return "ios";
  } else {
    return "windowsPhone";
  }
};

gdjs.adMob.loadVideo = function(androidID, iosID, displayOnLoading, testMode) {
  if (typeof admob === "undefined") return;

  admob.rewardvideo.config({
    id: gdjs.adMob._getPlatformName() === "android" ? androidID : iosID, // Support Android & iOS
    autoShow: displayOnLoading,
    isTesting: testMode
  });
  admob.rewardvideo.prepare();

  gdjs.adMob.videoLoading = true;
  gdjs.adMob.videoReady = false;

  document.addEventListener(
    "admob.rewardvideo.events.LOAD",
    function() {
      gdjs.adMob.videoReady = true;
      gdjs.adMob.videoLoading = false;
    },
    false
  );
  document.addEventListener(
    "admob.rewardvideo.events.LOAD_FAIL",
    function() {
      gdjs.adMob.videoLoading = false;
    },
    false
  );
  document.addEventListener(
    "admob.rewardvideo.events.OPEN",
    function() {
      gdjs.adMob.videoShowing = true;
      gdjs.adMob.videoReady = false;
    },
    false
  );
  document.addEventListener(
    "admob.rewardvideo.events.CLOSE",
    function() {
      gdjs.adMob.videoShowing = false;
    },
    false
  );
  document.addEventListener(
    "admob.rewardvideo.events.REWARD",
    function() {
      gdjs.adMob.videoReward = true;
    },
    false
  );
};

gdjs.adMob.showVideo = function() {
  if (typeof admob === "undefined") return;

  if (gdjs.adMob.videoReady && !gdjs.adMob.videoShowing) {
    admob.rewardvideo.show();
  }
};

gdjs.adMob.claimVideoReward = function() {
  gdjs.adMob.videoReward = false;
};
