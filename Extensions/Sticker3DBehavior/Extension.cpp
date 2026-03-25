/**
GDevelop - Sticker3D Behavior Extension
Copyright (c) 2024 GDevelop Team
This project is released under the MIT License.
*/

#include "Sticker3DBehavior.h"
#include "GDCore/Extensions/PlatformExtension.h"
#include "GDCore/Project/BehaviorsSharedData.h"
#include "GDCore/Tools/Localization.h"

void DeclareSticker3DBehaviorExtension(gd::PlatformExtension& extension) {
  extension
      .SetExtensionInformation("Sticker3DBehavior",
                               _("3D sticker"),
                               _("Stick 3D objects together so they move as one."),
                               "GDevelop Team",
                               "Open source (MIT License)")
      .SetCategory("General")
      .SetTags("3d, stick, attach, parent, child")
      .SetExtensionHelpPath("/behaviors/sticker3d");

  gd::BehaviorMetadata& aut = extension.AddBehavior(
      "Sticker3DBehavior",
      _("3D sticker"),
      "Sticker3D",
      _("Stick this 3D object to another 3D object. When the stuck-to 3D object moves, this 3D object will follow it maintaining the offset."),
      "",
      "res/conditions/3d_box.svg",
      "Sticker3DBehavior",
      std::make_shared<Sticker3DBehavior>(),
      std::make_shared<gd::BehaviorsSharedData>());
}