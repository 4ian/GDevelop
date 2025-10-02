/**

GDevelop - DestroyOutside Extension
Copyright (c) 2014-2016 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/
#if defined(GD_IDE_ONLY)
#include <iostream>

#include "GDCore/Extensions/PlatformExtension.h"
#include "GDCore/Tools/Localization.h"

void DeclareDestroyOutsideBehaviorExtension(gd::PlatformExtension& extension);

/**
 * \brief This class declares information about the JS extension.
 */
class DestroyOutsideBehaviorJsExtension : public gd::PlatformExtension {
 public:
  /**
   * \brief Constructor of an extension declares everything the extension
   * contains: objects, actions, conditions and expressions.
   */
  DestroyOutsideBehaviorJsExtension() {
    DeclareDestroyOutsideBehaviorExtension(*this);

    GetBehaviorMetadata("DestroyOutsideBehavior::DestroyOutside")
        .SetIncludeFile(
            "Extensions/DestroyOutsideBehavior/"
            "destroyoutsideruntimebehavior.js");

    GetAllExpressionsForBehavior(
        "DestroyOutsideBehavior::DestroyOutside")["ExtraBorder"]
        .SetFunctionName("getExtraBorder");
    GetAllConditionsForBehavior("DestroyOutsideBehavior::DestroyOutside")
        ["DestroyOutsideBehavior::DestroyOutside::ExtraBorder"]
            .SetFunctionName("getExtraBorder");
    GetAllActionsForBehavior("DestroyOutsideBehavior::DestroyOutside")
        ["DestroyOutsideBehavior::DestroyOutside::SetExtraBorder"]
            .SetFunctionName("setExtraBorder")
            .SetGetter("getExtraBorder");

    // Deprecated:
    GetAllConditionsForBehavior("DestroyOutsideBehavior::DestroyOutside")
        ["DestroyOutsideBehavior::ExtraBorder"]
            .SetFunctionName("getExtraBorder");
    GetAllActionsForBehavior("DestroyOutsideBehavior::DestroyOutside")
        ["DestroyOutsideBehavior::ExtraBorder"]
            .SetFunctionName("setExtraBorder")
            .SetGetter("getExtraBorder");

    GetAllExpressionsForBehavior(
        "DestroyOutsideBehavior::DestroyOutside")["UnseenGraceDistance"]
        .SetFunctionName("getUnseenGraceDistance");
    GetAllConditionsForBehavior("DestroyOutsideBehavior::DestroyOutside")
        ["DestroyOutsideBehavior::DestroyOutside::UnseenGraceDistance"]
            .SetFunctionName("getUnseenGraceDistance");
    GetAllActionsForBehavior("DestroyOutsideBehavior::DestroyOutside")
        ["DestroyOutsideBehavior::DestroyOutside::SetUnseenGraceDistance"]
            .SetFunctionName("setUnseenGraceDistance")
            .SetGetter("getUnseenGraceDistance");

    GD_COMPLETE_EXTENSION_COMPILATION_INFORMATION();
  };
};

// We need a specific function to create the extension with emscripten.
#if defined(EMSCRIPTEN)
extern "C" gd::PlatformExtension* CreateGDJSDestroyOutsideBehaviorExtension() {
  return new DestroyOutsideBehaviorJsExtension;
}
#else
/**
 * Used by GDevelop to create the extension class
 * -- Do not need to be modified. --
 */
extern "C" gd::PlatformExtension* GD_EXTENSION_API CreateGDJSExtension() {
  return new DestroyOutsideBehaviorJsExtension;
}
#endif
#endif
