/**

GDevelop - AdMob Object Extension
Copyright (c) 2008-2016 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/
#if defined(GD_IDE_ONLY)
#include "GDCore/Extensions/PlatformExtension.h"

#include "AdMobObject.h"

#include <iostream>
#include "GDCore/Tools/Localization.h"

void DeclareAdMobObjectExtension(gd::PlatformExtension & extension);

/**
 * \brief This class declares information about the JS extension.
 */
class AdMobObjectJsExtension : public gd::PlatformExtension
{
public:

    /**
     * Constructor of an extension declares everything the extension contains: objects, actions, conditions and expressions.
     */
    AdMobObjectJsExtension()
    {
        DeclareAdMobObjectExtension(*this);

        GetObjectMetadata("AdMobObject::AdMob").SetIncludeFile("Extensions/AdMobObject/admobruntimeobject.js");

        GetAllActionsForObject("AdMobObject::AdMob")["AdMobObject::ShowBanner"].SetFunctionName("showBanner");
        GetAllActionsForObject("AdMobObject::AdMob")["AdMobObject::HideBanner"].SetFunctionName("hideBanner");
        GetAllConditionsForObject("AdMobObject::AdMob")["AdMobObject::BannerDisplayed"].SetFunctionName("isBannerDisplayed");
        GetAllActionsForObject("AdMobObject::AdMob")["AdMobObject::PreloadInterstitial"].SetFunctionName("prepareInterstitial");
        GetAllActionsForObject("AdMobObject::AdMob")["AdMobObject::ShowInterstitial"].SetFunctionName("showInterstitial");
        GetAllConditionsForObject("AdMobObject::AdMob")["AdMobObject::InterstitialReady"].SetFunctionName("isInterstitialReady");

        GD_COMPLETE_EXTENSION_COMPILATION_INFORMATION();
    };
};

#if defined(EMSCRIPTEN)
extern "C" gd::PlatformExtension * CreateGDJSAdMobObjectExtension() {
    return new AdMobObjectJsExtension;
}
#else
/**
 * Used by GDevelop to create the extension class
 * -- Do not need to be modified. --
 */
extern "C" gd::PlatformExtension * GD_EXTENSION_API CreateGDJSExtension() {
    return new AdMobObjectJsExtension;
}
#endif
#endif
