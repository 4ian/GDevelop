/**

GDevelop - Anchor Behavior Extension
Copyright (c) 2016 Victor Levasseur (victorlevasseur52@gmail.com)
This project is released under the MIT License.
*/

#include "AnchorBehavior.h"
#include "GDCore/Extensions/PlatformExtension.h"
#include "GDCore/Project/BehaviorsSharedData.h"
#include "GDCore/Tools/Localization.h"

void DeclareAnchorBehaviorExtension(gd::PlatformExtension& extension) {
  extension
      .SetExtensionInformation("AnchorBehavior",
                               _("Anchor"),
                               _("Anchor objects to the window's bounds."),
                               "Victor Levasseur",
                               "Open source (MIT License)")
      .SetCategory("User interface")
      .SetTags("anchor, ui, layout")
      .SetExtensionHelpPath("/behaviors/anchor");

  gd::BehaviorMetadata& aut = extension.AddBehavior(
      "AnchorBehavior",
      _("Anchor"),
      "Anchor",
      _("Anchor objects to the window's bounds."),
      "",
      "CppPlatform/Extensions/AnchorIcon.png",
      "AnchorBehavior",
      std::make_shared<AnchorBehavior>(),
      std::make_shared<gd::BehaviorsSharedData>());
}
