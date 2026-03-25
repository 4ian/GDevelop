/**
GDevelop - Sticker3D Behavior Extension
Copyright (c) 2024 GDevelop Team
This project is released under the MIT License.
*/
#if defined(GD_IDE_ONLY)
#include "GDCore/Extensions/PlatformExtension.h"
#include "GDCore/Tools/Localization.h"

#include <iostream>

void DeclareSticker3DBehaviorExtension(gd::PlatformExtension& extension);

/**
 * \brief This class declares information about the JS extension.
 */
class Sticker3DBehaviorJsExtension : public gd::PlatformExtension {
 public:
  /**
   * \brief Constructor of an extension declares everything the extension
   * contains: objects, actions, conditions and expressions.
   */
  Sticker3DBehaviorJsExtension() {
    DeclareSticker3DBehaviorExtension(*this);

    GetBehaviorMetadata("Sticker3DBehavior::Sticker3DBehavior")
        .SetIncludeFile("Extensions/Sticker3DBehavior/sticker3druntimebehavior.js");
    
    auto& behavior = GetBehaviorMetadata("Sticker3DBehavior::Sticker3DBehavior");

    behavior
        .AddScopedAction(
            "StickTo3DObject",
            _("Stick to a 3D object"),
            _("Stick this 3D object to another 3D object. It will follow the position of the 3D object it is stuck to."),
            _("Stick _PARAM0_ to _PARAM2_"),
            _("Sticker"),
            "res/conditions/3d_box.svg",
            "res/conditions/3d_box.svg")
        .AddParameter("object", _("Object"), "", false)
        .AddParameter("behavior", _("Behavior"), "Sticker3DBehavior")
        .AddParameter("objectPtr", _("3D object to stick to"), "", false)
        .SetFunctionName("stickTo3DObject");

    behavior
        .AddScopedAction(
            "Unstick",
            _("Unstick from 3D object"),
            _("Unstick this 3D object from the 3D object it is stuck to."),
            _("Unstick _PARAM0_"),
            _("Sticker"),
            "res/conditions/3d_box.svg",
            "res/conditions/3d_box.svg")
        .AddParameter("object", _("Object"), "", false)
        .AddParameter("behavior", _("Behavior"), "Sticker3DBehavior")
        .SetFunctionName("unstick");

    behavior
        .AddScopedCondition(
            "IsStuck",
            _("Is stuck to another 3D object"),
            _("Check if the 3D object is currently stuck to another 3D object."),
            _("_PARAM0_ is stuck to another 3D object"),
            _("Sticker"),
            "res/conditions/3d_box.svg",
            "res/conditions/3d_box.svg")
        .AddParameter("object", _("Object"), "", false)
        .AddParameter("behavior", _("Behavior"), "Sticker3DBehavior")
        .SetFunctionName("isStuck");

    behavior
        .AddScopedAction(
            "SetOffsetX",
            _("Set X offset"),
            _("Set the X offset from the stuck-to 3D object."),
            _("Set X offset of _PARAM0_ to _PARAM2_"),
            _("Sticker ❯ Offset"),
            "res/conditions/3d_box.svg",
            "res/conditions/3d_box.svg")
        .AddParameter("object", _("Object"), "", false)
        .AddParameter("behavior", _("Behavior"), "Sticker3DBehavior")
        .AddParameter("number", _("X offset"), "", false)
        .SetFunctionName("setOffsetX");

    behavior
        .AddScopedAction(
            "SetOffsetY",
            _("Set Y offset"),
            _("Set the Y offset from the stuck-to 3D object."),
            _("Set Y offset of _PARAM0_ to _PARAM2_"),
            _("Sticker ❯ Offset"),
            "res/conditions/3d_box.svg",
            "res/conditions/3d_box.svg")
        .AddParameter("object", _("Object"), "", false)
        .AddParameter("behavior", _("Behavior"), "Sticker3DBehavior")
        .AddParameter("number", _("Y offset"), "", false)
        .SetFunctionName("setOffsetY");

    behavior
        .AddScopedAction(
            "SetOffsetZ",
            _("Set Z offset"),
            _("Set the Z offset from the stuck-to 3D object."),
            _("Set Z offset of _PARAM0_ to _PARAM2_"),
            _("Sticker ❯ Offset"),
            "res/conditions/3d_box.svg",
            "res/conditions/3d_box.svg")
        .AddParameter("object", _("Object"), "", false)
        .AddParameter("behavior", _("Behavior"), "Sticker3DBehavior")
        .AddParameter("number", _("Z offset"), "", false)
        .SetFunctionName("setOffsetZ");

    behavior
        .AddExpression(
            "OffsetX",
            _("X offset"),
            _("Get the X offset from the stuck-to 3D object."),
            _("Sticker ❯ Offset"),
            "res/conditions/3d_box.svg")
        .AddParameter("object", _("Object"), "", false)
        .AddParameter("behavior", _("Behavior"), "Sticker3DBehavior")
        .SetFunctionName("getOffsetX");

    behavior
        .AddExpression(
            "OffsetY",
            _("Y offset"),
            _("Get the Y offset from the stuck-to 3D object."),
            _("Sticker ❯ Offset"),
            "res/conditions/3d_box.svg")
        .AddParameter("object", _("Object"), "", false)
        .AddParameter("behavior", _("Behavior"), "Sticker3DBehavior")
        .SetFunctionName("getOffsetY");

    behavior
        .AddExpression(
            "OffsetZ",
            _("Z offset"),
            _("Get the Z offset from the stuck-to 3D object."),
            _("Sticker ❯ Offset"),
            "res/conditions/3d_box.svg")
        .AddParameter("object", _("Object"), "", false)
        .AddParameter("behavior", _("Behavior"), "Sticker3DBehavior")
        .SetFunctionName("getOffsetZ");

    behavior
        .AddScopedAction(
            "SetFollowRotation",
            _("Follow rotation"),
            _("Enable or disable rotation following the 3D object it is stuck to."),
            _("Set _PARAM0_ to follow rotation: _PARAM2_"),
            _("Sticker"),
            "res/conditions/3d_box.svg",
            "res/conditions/3d_box.svg")
        .AddParameter("object", _("Object"), "", false)
        .AddParameter("behavior", _("Behavior"), "Sticker3DBehavior")
        .AddParameter("yesorno", _("Follow rotation"))
        .SetFunctionName("setFollowRotation");

    behavior
        .AddScopedCondition(
            "FollowRotation",
            _("Follows rotation"),
            _("Check if the 3D object follows the rotation of the 3D object it is stuck to."),
            _("_PARAM0_ follows rotation"),
            _("Sticker"),
            "res/conditions/3d_box.svg",
            "res/conditions/3d_box.svg")
        .AddParameter("object", _("Object"), "", false)
        .AddParameter("behavior", _("Behavior"), "Sticker3DBehavior")
        .SetFunctionName("followsRotation");

    GD_COMPLETE_EXTENSION_COMPILATION_INFORMATION();
  };
};

#if defined(EMSCRIPTEN)
extern "C" gd::PlatformExtension* CreateGDJSSticker3DBehaviorExtension() {
  return new Sticker3DBehaviorJsExtension;
}
#else
/**
 * Used by GDevelop to create the extension class
 * -- Do not need to be modified. --
 */
extern "C" gd::PlatformExtension* GD_EXTENSION_API CreateGDJSExtension() {
  return new Sticker3DBehaviorJsExtension;
}
#endif
#endif