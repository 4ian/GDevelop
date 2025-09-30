/**

GDevelop - DestroyOutside Behavior Extension
Copyright (c) 2014-2016 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/

#include "DestroyOutsideBehavior.h"
#include "GDCore/Extensions/Metadata/MultipleInstructionMetadata.h"
#include "GDCore/Extensions/PlatformExtension.h"
#include "GDCore/Project/BehaviorsSharedData.h"
#include "GDCore/Tools/Localization.h"

void DeclareDestroyOutsideBehaviorExtension(gd::PlatformExtension& extension) {
  extension
      .SetExtensionInformation(
          "DestroyOutsideBehavior",
          _("Destroy Outside Screen Behavior"),
          _("This behavior can be used to destroy objects when they go "
            "outside of the bounds of the 2D camera. Useful for 2D bullets or "
            "other short-lived objects. Don't use it for 3D objects in a "
            "FPS/TPS game or any game with a camera not being a top view "
            "(for 3D objects, prefer comparing the position, for example Z "
            "position to see if an object goes outside of the bound of the "
            "map). If the object appears outside of the screen, it's not "
            "removed unless it goes beyond the unseen object grace distance."),
          "Florian Rival",
          "Open source (MIT License)")
      .SetCategory("Game mechanic")
      .SetTags("screen")
      .SetExtensionHelpPath("/behaviors/destroyoutside");

  gd::BehaviorMetadata& aut =
      extension
          .AddBehavior("DestroyOutside",
                       _("Destroy when outside of the screen"),
                       _("DestroyOutside"),
                       _("Destroy objects automatically when they go "
                         "outside of the 2D camera borders."),
                       "",
                       "CppPlatform/Extensions/destroyoutsideicon.png",
                       "DestroyOutsideBehavior",
                       std::make_shared<DestroyOutsideBehavior>(),
                       std::shared_ptr<gd::BehaviorsSharedData>())
          .SetQuickCustomizationVisibility(gd::QuickCustomization::Hidden);

  aut.AddExpressionAndConditionAndAction(
      "number",
      "ExtraBorder",
      _("Additional border (extra distance before deletion)"),
      _("the extra distance (in pixels) the object must "
        "travel beyond the screen before it gets deleted."),
      _("the additional border"),
      _("Destroy outside configuration"),
      "CppPlatform/Extensions/destroyoutsideicon24.png");

  // Deprecated:
  aut.AddDuplicatedAction("ExtraBorder", "DestroyOutside::SetExtraBorder")
      .SetHidden();
  aut.AddDuplicatedCondition("ExtraBorder", "DestroyOutside::ExtraBorder")
      .SetHidden();

  aut.AddExpressionAndConditionAndAction(
      "number",
      "UnseenGraceDistance",
      _("Unseen object grace distance"),
      _("the grace distance (in pixels) before deleting the object if it has "
        "never been visible on the screen. Useful to avoid objects being "
        "deleted before they are visible when they spawn."),
      _("the unseen grace distance"),
      _("Destroy outside configuration"),
      "CppPlatform/Extensions/destroyoutsideicon24.png");
}
