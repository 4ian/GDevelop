/**

GDevelop - AdMob Object Extension
Copyright (c) 2008-2016 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/

#include "GDCore/Extensions/PlatformExtension.h"
#include "GDCore/Tools/Localization.h"

#include "AdMobObject.h"

void DeclareAdMobObjectExtension(gd::PlatformExtension & extension)
{
    extension.SetExtensionInformation("AdMobObject",
                          _("AdMob banners and interstitial screens"),
                          _("Display an ads banner and interstitial screens powered by AdMob."),
                          "Florian Rival",
                          "Open source (MIT License)");

    gd::ObjectMetadata & obj = extension.AddObject<AdMobObject>(
               "AdMob",
               _("AdMob banner"),
               _("Display an ad banner or interstitial screen using AdMob"),
               "JsPlatform/Extensions/admobicon.png");

    obj.SetHelpUrl("/gdevelop/documentation/manual/built_admob");

    #if !defined(GD_NO_WX_GUI)
    AdMobObject::LoadEdittimeIcon();
    #endif

    obj.AddAction("ShowBanner",
        _("Show banner ad"),
        _("Show the banner ad"),
        _("Show the banner ad of _PARAM0_"),
        _("Banner"),
        "JsPlatform/Extensions/admobicon24.png",
        "JsPlatform/Extensions/admobicon16.png")
        .AddParameter("object", _("Object"), "AdMob");

    obj.AddAction("HideBanner",
        _("Hide banner ad"),
        _("Hide the banner ad"),
        _("Hide the banner ad of _PARAM0_"),
        _("Banner"),
        "JsPlatform/Extensions/admobicon24.png",
        "JsPlatform/Extensions/admobicon16.png")
        .AddParameter("object", _("Object"), "AdMob");

    obj.AddCondition("BannerDisplayed",
        _("Banner is displayed"),
        _("Return true if the object is currently displaying a banner"),
        _("_PARAM0_ is displaying a banner"),
        "",
        "JsPlatform/Extensions/admobicon24.png",
        "JsPlatform/Extensions/admobicon16.png")
        .AddParameter("object", _("Object"), "AdMob");

    obj.AddAction("PreloadInterstitial",
        _("Preload interstitial screen"),
        _("Preload the interstitial screen in memory, so that it can be shown later.\nYou can use this action at the beginning of a level for example."),
        _("Preload an interstitial screen for _PARAM0_"),
        _("Interstitial screen"),
        "JsPlatform/Extensions/admobicon24.png",
        "JsPlatform/Extensions/admobicon16.png")
        .AddParameter("object", _("Object"), "AdMob");

    obj.AddAction("ShowInterstitial",
        _("Show interstitial screen"),
        _("Show the interstitial screen.\nIf the interstitial screen has not been preloaded, it will be loaded and displayed when ready."),
        _("Show the interstitial screen of _PARAM0_"),
        _("Interstitial screen"),
        "JsPlatform/Extensions/admobicon24.png",
        "JsPlatform/Extensions/admobicon16.png")
        .AddParameter("object", _("Object"), "AdMob");

    obj.AddCondition("InterstitialReady",
        _("Interstitial screen is ready"),
        _("Return true if the interstitial screen was loaded and is ready to be shown."),
        _("Interstitial screen of _PARAM0_ is ready"),
        "",
        "JsPlatform/Extensions/admobicon24.png",
        "JsPlatform/Extensions/admobicon16.png")
        .AddParameter("object", _("Object"), "AdMob");
}
