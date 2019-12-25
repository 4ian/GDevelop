/**

GDevelop - DestroyOutside Behavior Extension
Copyright (c) 2014-2016 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/

#include "DestroyOutsideBehavior.h"
#include "DestroyOutsideRuntimeBehavior.h"
#include "GDCpp/Extensions/ExtensionBase.h"

void DeclareDestroyOutsideBehaviorExtension(gd::PlatformExtension& extension) {
  extension
      .SetExtensionInformation("DestroyOutsideBehavior",
                               _("Destroy Outside Screen Behavior"),
                               _("This Extension can be used to destroy "
                                 "objects when they go outside of "
                                 "the borders of the game's window."),
                               "Florian Rival",
                               "Open source (MIT License)")
      .SetExtensionHelpPath("/behaviors/destroyoutside");

  gd::BehaviorMetadata& aut =
      extension.AddBehavior("DestroyOutside",
                            _("Destroy when outside of the screen"),
                            _("DestroyOutside"),
                            _("Automatically destroy the object when it goes "
                              "outside of the screen's borders."),
                            "",
                            "CppPlatform/Extensions/destroyoutsideicon.png",
                            "DestroyOutsideBehavior",
                            std::make_shared<DestroyOutsideBehavior>(),
                            std::shared_ptr<gd::BehaviorsSharedData>());

#if defined(GD_IDE_ONLY)
  aut.AddCondition("ExtraBorder",
                   _("Additional border"),
                   _("Compare the additional border that the object must cross "
                     "before being deleted."),
                   _("the additional border"),
                   "",
                   "CppPlatform/Extensions/destroyoutsideicon24.png",
                   "CppPlatform/Extensions/destroyoutsideicon16.png")
      .AddParameter("object", _("Object"))
      .AddParameter("behavior", _("Behavior"), "DestroyOutside")
      .UseStandardRelationalOperatorParameters("number")
      .MarkAsAdvanced()
      .SetFunctionName("GetExtraBorder")
      .SetIncludeFile("DestroyOutsideBehavior/DestroyOutsideRuntimeBehavior.h");

  aut.AddAction("ExtraBorder",
                _("Additional border"),
                _("Change the additional border that the object must cross "
                  "before being deleted."),
                _("the additional border"),
                "",
                "CppPlatform/Extensions/destroyoutsideicon24.png",
                "CppPlatform/Extensions/destroyoutsideicon16.png")
      .AddParameter("object", _("Object"))
      .AddParameter("behavior", _("Behavior"), "DestroyOutside")
      .UseStandardOperatorParameters("number")
      .MarkAsAdvanced()
      .SetFunctionName("SetExtraBorder")
      .SetGetter("GetExtraBorder")
      .SetIncludeFile("DestroyOutsideBehavior/DestroyOutsideRuntimeBehavior.h");
#endif
}

/**
 * \brief This class declares information about the extension.
 */
class DestroyOutsideBehaviorCppExtension : public ExtensionBase {
 public:
  /**
   * Constructor of an extension declares everything the extension contains:
   * objects, actions, conditions and expressions.
   */
  DestroyOutsideBehaviorCppExtension() {
    DeclareDestroyOutsideBehaviorExtension(*this);
    AddRuntimeBehavior<DestroyOutsideRuntimeBehavior>(
        GetBehaviorMetadata("DestroyOutsideBehavior::DestroyOutside"),
        "DestroyOutsideRuntimeBehavior");
    GetBehaviorMetadata("DestroyOutsideBehavior::DestroyOutside")
        .SetIncludeFile("DestroyOutsideBehavior/DestroyOutsideRuntimeBehavior.h");

    GD_COMPLETE_EXTENSION_COMPILATION_INFORMATION();
  };
};

#if defined(ANDROID)
extern "C" ExtensionBase* CreateGDCppDestroyOutsideBehaviorExtension() {
  return new DestroyOutsideBehaviorCppExtension;
}
#elif !defined(EMSCRIPTEN)
/**
 * Used by GDevelop to create the extension class
 * -- Do not need to be modified. --
 */
extern "C" ExtensionBase* GD_EXTENSION_API CreateGDExtension() {
  return new DestroyOutsideBehaviorCppExtension;
}
#endif
