/**
 
 GDevelop - Light3D Object Extension
 Copyright (c) 2024 GDevelop Team
 This project is released under the MIT License.
 */
#if defined(GD_IDE_ONLY)
#include <iostream>

#include "GDCore/Extensions/PlatformExtension.h"
#include "GDCore/Tools/Localization.h"
#include "Light3DObject.h"

void DeclareLight3DExtension(gd::PlatformExtension& extension);

class Light3DJsExtension : public gd::PlatformExtension {
 public:
  Light3DJsExtension() {
    DeclareLight3DExtension(*this);

    GetObjectMetadata("Light3D::Light3D")
        .SetIncludeFile("Extensions/Light3D/light3druntimeobject.js")
        .AddIncludeFile("Extensions/Light3D/Light3DRuntimeObjectRenderer.js");

    // Link C++ functions to JavaScript
    GetAllActionsForObject("Light3D::Light3D")["Light3D::SetEnabled"]
        .SetFunctionName("setEnabled")
        .SetGetter("isEnabled");
    GetAllConditionsForObject("Light3D::Light3D")["Light3D::IsEnabled"]
        .SetFunctionName("isEnabled");
    
    GetAllActionsForObject("Light3D::Light3D")["Light3D::SetColor"]
        .SetFunctionName("setColor");
    
    GetAllActionsForObject("Light3D::Light3D")["Light3D::SetIntensity"]
        .SetFunctionName("setIntensity")
        .SetGetter("getIntensity");
    GetAllConditionsForObject("Light3D::Light3D")["Light3D::Intensity"]
        .SetFunctionName("getIntensity");
    GetAllExpressionsForObject("Light3D::Light3D")["Intensity"]
        .SetFunctionName("getIntensity");

    GetAllActionsForObject("Light3D::Light3D")["Light3D::SetDistance"]
        .SetFunctionName("setDistance")
        .SetGetter("getDistance");
    GetAllConditionsForObject("Light3D::Light3D")["Light3D::Distance"]
        .SetFunctionName("getDistance");
    GetAllExpressionsForObject("Light3D::Light3D")["Distance"]
        .SetFunctionName("getDistance");

    GetAllActionsForObject("Light3D::Light3D")["Light3D::SetDecay"]
        .SetFunctionName("setDecay")
        .SetGetter("getDecay");
    GetAllConditionsForObject("Light3D::Light3D")["Light3D::Decay"]
        .SetFunctionName("getDecay");
    GetAllExpressionsForObject("Light3D::Light3D")["Decay"]
        .SetFunctionName("getDecay");

    GetAllActionsForObject("Light3D::Light3D")["Light3D::SetAngle"]
        .SetFunctionName("setAngle")
        .SetGetter("getAngle");
    GetAllConditionsForObject("Light3D::Light3D")["Light3D::Angle"]
        .SetFunctionName("getAngle");
    GetAllExpressionsForObject("Light3D::Light3D")["Angle"]
        .SetFunctionName("getAngle");

    GetAllActionsForObject("Light3D::Light3D")["Light3D::SetPenumbra"]
        .SetFunctionName("setPenumbra")
        .SetGetter("getPenumbra");
    GetAllConditionsForObject("Light3D::Light3D")["Light3D::Penumbra"]
        .SetFunctionName("getPenumbra");
    GetAllExpressionsForObject("Light3D::Light3D")["Penumbra"]
        .SetFunctionName("getPenumbra");

    GetAllActionsForObject("Light3D::Light3D")["Light3D::SetCastShadow"]
        .SetFunctionName("setCastShadow");
    GetAllConditionsForObject("Light3D::Light3D")["Light3D::IsCastingShadow"]
        .SetFunctionName("isCastingShadow");

    GetAllActionsForObject("Light3D::Light3D")["Light3D::SetShadowMapSize"]
        .SetFunctionName("setShadowMapSize");
    GetAllConditionsForObject("Light3D::Light3D")["Light3D::ShadowMapSize"]
        .SetFunctionName("getShadowMapSize");
    GetAllExpressionsForObject("Light3D::Light3D")["ShadowMapSize"]
        .SetFunctionName("getShadowMapSize");

    GetAllActionsForObject("Light3D::Light3D")["Light3D::SetShadowBias"]
        .SetFunctionName("setShadowBias");
    GetAllConditionsForObject("Light3D::Light3D")["Light3D::ShadowBias"]
        .SetFunctionName("getShadowBias");
    GetAllExpressionsForObject("Light3D::Light3D")["ShadowBias"]
        .SetFunctionName("getShadowBias");

    GetAllActionsForObject("Light3D::Light3D")["Light3D::SetShadowNormalBias"]
        .SetFunctionName("setShadowNormalBias");
    GetAllConditionsForObject("Light3D::Light3D")["Light3D::ShadowNormalBias"]
        .SetFunctionName("getShadowNormalBias");
    GetAllExpressionsForObject("Light3D::Light3D")["ShadowNormalBias"]
        .SetFunctionName("getShadowNormalBias");

    GetAllActionsForObject("Light3D::Light3D")["Light3D::SetShadowRadius"]
        .SetFunctionName("setShadowRadius");
    GetAllConditionsForObject("Light3D::Light3D")["Light3D::ShadowRadius"]
        .SetFunctionName("getShadowRadius");
    GetAllExpressionsForObject("Light3D::Light3D")["ShadowRadius"]
        .SetFunctionName("getShadowRadius");

    GetAllActionsForObject("Light3D::Light3D")["Light3D::SetShadowNear"]
        .SetFunctionName("setShadowNear");
    GetAllConditionsForObject("Light3D::Light3D")["Light3D::ShadowNear"]
        .SetFunctionName("getShadowNear");
    GetAllExpressionsForObject("Light3D::Light3D")["ShadowNear"]
        .SetFunctionName("getShadowNear");

    GetAllActionsForObject("Light3D::Light3D")["Light3D::SetShadowFar"]
        .SetFunctionName("setShadowFar");
    GetAllConditionsForObject("Light3D::Light3D")["Light3D::ShadowFar"]
        .SetFunctionName("getShadowFar");
    GetAllExpressionsForObject("Light3D::Light3D")["ShadowFar"]
        .SetFunctionName("getShadowFar");

    GetAllActionsForObject("Light3D::Light3D")["Light3D::SetShadowFocus"]
        .SetFunctionName("setShadowFocus");
    GetAllConditionsForObject("Light3D::Light3D")["Light3D::ShadowFocus"]
        .SetFunctionName("getShadowFocus");
    GetAllExpressionsForObject("Light3D::Light3D")["ShadowFocus"]
        .SetFunctionName("getShadowFocus");

    GetAllActionsForObject("Light3D::Light3D")["Light3D::SetFlickerEnabled"]
        .SetFunctionName("setFlickerEnabled");
    GetAllConditionsForObject("Light3D::Light3D")["Light3D::IsFlickerEnabled"]
        .SetFunctionName("isFlickerEnabled");

    GetAllActionsForObject("Light3D::Light3D")["Light3D::SetFlickerSpeed"]
        .SetFunctionName("setFlickerSpeed");
    GetAllConditionsForObject("Light3D::Light3D")["Light3D::FlickerSpeed"]
        .SetFunctionName("getFlickerSpeed");
    GetAllExpressionsForObject("Light3D::Light3D")["FlickerSpeed"]
        .SetFunctionName("getFlickerSpeed");

    GetAllActionsForObject("Light3D::Light3D")["Light3D::SetZPosition"]
        .SetFunctionName("setZ");
    GetAllConditionsForObject("Light3D::Light3D")["Light3D::ZPosition"]
        .SetFunctionName("getZ");
    GetAllExpressionsForObject("Light3D::Light3D")["ZPosition"]
        .SetFunctionName("getZ");

    GetAllActionsForObject("Light3D::Light3D")["Light3D::ToggleLight"]
        .SetFunctionName("toggleLight");

    GetAllActionsForObject("Light3D::Light3D")["Light3D::ToggleFlicker"]
        .SetFunctionName("toggleFlicker");

    GetAllConditionsForObject("Light3D::Light3D")["Light3D::LightType"]
        .SetFunctionName("isLightType");
    
    GetAllActionsForObject("Light3D::Light3D")["Light3D::SetLightType"]
        .SetFunctionName("setLightType");
    
    GetAllExpressionsForObject("Light3D::Light3D")["LightType"]
        .SetFunctionName("getLightType");

    GetAllExpressionsForObject("Light3D::Light3D")["ColorR"]
        .SetFunctionName("getColorR");

    GetAllExpressionsForObject("Light3D::Light3D")["ColorG"]
        .SetFunctionName("getColorG");

    GetAllExpressionsForObject("Light3D::Light3D")["ColorB"]
        .SetFunctionName("getColorB");

    StripUnimplementedInstructionsAndExpressions();

    GD_COMPLETE_EXTENSION_COMPILATION_INFORMATION();
  };
};

#if defined(EMSCRIPTEN)
extern "C" gd::PlatformExtension* CreateGDJSLight3DExtension() {
  return new Light3DJsExtension;
}
#else
/**
 * Used by GDevelop to create the extension class
 * -- Do not need to be modified. --
 */
extern "C" gd::PlatformExtension* GD_EXTENSION_API CreateGDJSExtension() {
  return new Light3DJsExtension;
}
#endif
#endif
