/**

GDevelop - DestroyOutside Behavior Extension
Copyright (c) 2014-2016 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/

#include "DestroyOutsideBehavior.h"
#include "GDCore/Extensions/PlatformExtension.h"
#include "GDCore/Project/BehaviorsSharedData.h"
#include "GDCore/Tools/Localization.h"

void DeclareDestroyOutsideBehaviorExtension(gd::PlatformExtension& extension) {
  extension
      .SetExtensionInformation("DestroyOutsideBehavior",
                               _("Destroy Outside Screen Behavior"),
                               _("This behavior can be used to destroy "
                                 "objects when they go outside of "
                                 "the bounds of the camera. Useful for bullets "
                                 "or other short-lived objects."),
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
