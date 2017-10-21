/**

GDevelop - AdMob Object Extension
Copyright (c) 2008-2016 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/

if (typeof AdMob !== "undefined")
    console.warn("AdMob plugin for Cordova is not installed - no ads will be displayed. Ensure you have installed com.google.cordova.admob or cordova-plugin-admobpro.");

/**
 * The AdMobRuntimeObject displays an AdMob ad banner on screen.
 * This works with Cordova compatible platforms with `cordova-plugin-admobpro` plugin installed.
 *
 * @namespace gdjs
 * @class AdMobRuntimeObject
 * @extends RuntimeObject
 * @namespace gdjs
 */
gdjs.AdMobRuntimeObject = function(runtimeScene, objectData)
{
    gdjs.RuntimeObject.call(this, runtimeScene, objectData);

    this._androidBannerId = objectData.androidBannerId;
    this._androidInterstitialId = objectData.androidInterstitialId;
    this._iosBannerId = objectData.iosBannerId;
    this._iosInterstitialId = objectData.iosInterstitialId;
    this._isTesting = objectData.isTesting;
    this._position = objectData.position;
    this._overlap = objectData.overlap;
    this._showOnStartup = objectData.showOnStartup;

    this._bannerDisplayed = false;
    this._interstitialReady = false;

    if (this._showOnStartup)
        this.createBanner();

    document.addEventListener('onAdPresent', this._onAdPresent.bind(this), false);
    document.addEventListener('onAdDismiss', this._onAdDismiss.bind(this), false);
};

gdjs.AdMobRuntimeObject.prototype = Object.create( gdjs.RuntimeObject.prototype );
gdjs.AdMobRuntimeObject.thisIsARuntimeObjectConstructor = "AdMobObject::AdMob";

gdjs.AdMobRuntimeObject.getPlatformName = function() {
    if( /(android)/i.test(navigator.userAgent) ) {
        return "android";
    } else if(/(ipod|iphone|ipad)/i.test(navigator.userAgent)) {
        return "ios";
    } else {
        return "windowsPhone";
    }
};

gdjs.AdMobRuntimeObject.prototype._onAdPresent = function(data) {
    if (data.adType == 'interstitial')
        this._interstitialReady = false;
};

gdjs.AdMobRuntimeObject.prototype._onAdDismiss = function(data) {
    if (data.adType == 'interstitial')
        this._interstitialReady = false;
};

gdjs.AdMobRuntimeObject.prototype.createBanner = function() {
    if (typeof AdMob === "undefined") return;

    var adName = "_" + gdjs.AdMobRuntimeObject.getPlatformName() + "BannerId";
    if (!this.hasOwnProperty(adName)) return;
    var adId = this[adName];

    var position = AdMob.AD_POSITION.TOP_CENTER;
    if (this._position === "Bottom")
        position = AdMob.AD_POSITION.BOTTOM_CENTER;

    var that = this;
    AdMob.createBanner({
        adId: adId || 'not-specified-xxx', //Avoid a crash by never letting the id empty.
        position: position,
        autoShow: true,
        overlap: this._overlap,
        isTesting: this._isTesting
    }, function() {
        that._bannerDisplayed = true;
    }, function() {
        that._bannerDisplayed = false;
    });
};

gdjs.AdMobRuntimeObject.prototype.showBanner = function() {
    if (typeof AdMob === "undefined") return;

    if (!this._bannerDisplayed)
        this.createBanner();
}

gdjs.AdMobRuntimeObject.prototype.hideBanner = function() {
    if (typeof AdMob === "undefined") return;

    this._bannerDisplayed = false;
    AdMob.removeBanner();
};

gdjs.AdMobRuntimeObject.prototype.isBannerDisplayed = function() {
    return this._bannerDisplayed;
};

gdjs.AdMobRuntimeObject.prototype.showInterstitial = function(runtimeScene) {
    if (typeof AdMob === "undefined") return;

    if (!this._interstitialReady) {
        this.prepareInterstitial(function() {
            AdMob.showInterstitial();
        })
    } else {
        AdMob.showInterstitial();
    }
};

gdjs.AdMobRuntimeObject.prototype.prepareInterstitial = function(cb) {
    if (typeof AdMob === "undefined") return;

    var adName = "_" + gdjs.AdMobRuntimeObject.getPlatformName() + "InterstitialId";
    if (!this.hasOwnProperty(adName)) return;
    var adId = this[adName];

    var that = this;
    AdMob.prepareInterstitial({
        adId: adId || 'not-specified-xxx', //Avoid a crash by never letting the id empty.
        autoShow: false
    }, function() {
        that._interstitialReady = true;
        cb();
    }, function() {
        that._interstitialReady = false;
        cb();
    });
};

gdjs.AdMobRuntimeObject.prototype.isInterstitialReady = function() {
    return this._interstitialReady;
};

gdjs.AdMobRuntimeObject.prototype.onDeletedFromScene = function(runtimeScene) {
    gdjs.RuntimeObject.prototype.onDeletedFromScene.call(this, runtimeScene);
    if (typeof AdMob === "undefined") return;

    document.removeEventListener('onAdPresent', this._onAdPresent, false);
    document.removeEventListener('onAdDismiss', this._onAdDismiss, false);
    if (this._bannerDisplayed) this.hideBanner();
};

gdjs.AdMobRuntimeObject.prototype.setLayer = function(layer) {
     // No renderable object
};

gdjs.AdMobRuntimeObject.prototype.setZOrder = function(z) {
     // No renderable object
};
