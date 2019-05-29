/**

GDevelop - Anchor Behavior Extension
Copyright (c) 2016 Victor Levasseur (victorlevasseur52@gmail.com)
This project is released under the MIT License.
*/

#include "AnchorBehavior.h"
#include "AnchorRuntimeBehavior.h"
#include "GDCpp/Extensions/ExtensionBase.h"
#include "GDCpp/Runtime/Project/BehaviorsSharedData.h"

void DeclareAnchorBehaviorExtension(gd::PlatformExtension& extension) {
  extension
      .SetExtensionInformation("AnchorBehavior",
                               _("Anchor"),
                               _("Anchor objects to the window's bounds."),
                               "Victor Levasseur",
                               "Open source (MIT License)")
      .SetExtensionHelpPath("/behaviors/anchor");

  gd::BehaviorMetadata& aut = extension.AddBehavior(
      "AnchorBehavior",
      _("Anchor"),
      "Anchor",
      _("Behavior that anchors objects to the window's bounds."),
      "",
      "CppPlatform/Extensions/AnchorIcon.png",
      "AnchorBehavior",
      std::make_shared<AnchorBehavior>(),
      std::make_shared<gd::BehaviorsSharedData>());
}

/**
 * \brief This class declares information about the extension.
 */
class AnchorBehaviorCppExtension : public ExtensionBase {
 public:
  /**
   * Constructor of an extension declares everything the extension contains:
   * objects, actions, conditions and expressions.
   */
  AnchorBehaviorCppExtension() {
    DeclareAnchorBehaviorExtension(*this);
    AddRuntimeBehavior<AnchorRuntimeBehavior>(
        GetBehaviorMetadata("AnchorBehavior::AnchorBehavior"),
        "AnchorRuntimeBehavior");
    GetBehaviorMetadata("AnchorBehavior::AnchorBehavior")
        .SetIncludeFile("AnchorBehavior/AnchorRuntimeBehavior.h");

    GD_COMPLETE_EXTENSION_COMPILATION_INFORMATION();
  };
};

#if defined(ANDROID)
extern "C" ExtensionBase* CreateGDCppAnchorBehaviorExtension() {
  return new AnchorBehaviorCppExtension;
}
#elif !defined(EMSCRIPTEN)
/**
 * Used by GDevelop to create the extension class
 * -- Do not need to be modified. --
 */
extern "C" ExtensionBase* GD_EXTENSION_API CreateGDExtension() {
  return new AnchorBehaviorCppExtension;
}
#endif
