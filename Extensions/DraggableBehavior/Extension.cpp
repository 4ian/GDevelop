/**

GDevelop - Draggable Behavior Extension
Copyright (c) 2014-2016 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/

#include "DraggableBehavior.h"
#include "GDCore/Extensions/PlatformExtension.h"
#include "GDCore/Project/BehaviorsSharedData.h"
#include "GDCore/Tools/Localization.h"

void DeclareDraggableBehaviorExtension(gd::PlatformExtension& extension) {
  extension
      .SetExtensionInformation(
          "DraggableBehavior",
          _("Draggable Behavior"),
          _("Allows objects to be moved using the mouse (or touch). Add the "
            "behavior to an object to make it draggable. Use events to enable "
            "or disable the behavior when needed."),
          "Florian Rival",
          "Open source (MIT License)")
      .SetExtensionHelpPath("/behaviors/draggable");

  gd::BehaviorMetadata& aut = extension.AddBehavior(
      "Draggable",
      _("Draggable object"),
      _("Draggable"),
      _("Allows objects to be moved using the mouse (or touch)."),
      "",
      "CppPlatform/Extensions/draggableicon.png",
      "DraggableBehavior",
      std::make_shared<DraggableBehavior>(),
      std::shared_ptr<gd::BehaviorsSharedData>());

#if defined(GD_IDE_ONLY)
  aut.AddCondition("Dragged",
                   _("Being dragged"),
                   _("Check if the object is being dragged"),
                   _("_PARAM0_ is being dragged"),
                   "",
                   "CppPlatform/Extensions/draggableicon24.png",
                   "CppPlatform/Extensions/draggableicon16.png")

      .AddParameter("object", _("Object"))
      .AddParameter("behavior", _("Behavior"), "Draggable")
      .SetFunctionName("IsDragged");
#endif
}
