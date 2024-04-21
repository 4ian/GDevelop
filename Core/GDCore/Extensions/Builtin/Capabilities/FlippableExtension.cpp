/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the GNU Lesser General Public
 * License.
 */
#include "GDCore/Extensions/Builtin/AllBuiltinExtensions.h"
#include "GDCore/Extensions/Metadata/MultipleInstructionMetadata.h"
#include "GDCore/Project/Behavior.h"
#include "GDCore/Project/BehaviorsSharedData.h"
#include "GDCore/Project/Object.h"
#include "GDCore/Tools/Localization.h"

using namespace std;
namespace gd {

void GD_CORE_API BuiltinExtensionsImplementer::ImplementsFlippableExtension(
    gd::PlatformExtension& extension) {
  extension
      .SetExtensionInformation("FlippableCapability",
                               _("Flippable capability"),
                               _("Flip objects."),
                               "Florian Rival",
                               "Open source (MIT License)")
      .SetExtensionHelpPath("/objects");
  extension.AddInstructionOrExpressionGroupMetadata(_("Effects"))
      .SetIcon("res/actions/effect_black.svg");

  gd::BehaviorMetadata& aut = extension.AddBehavior(
      "FlippableBehavior",
      _("Flippable capability"),
      "Flippable",
      _("Flip objects."),
      "",
      "res/actions/flipX24.png",
      "FlippableBehavior",
      std::make_shared<gd::Behavior>(),
      std::make_shared<gd::BehaviorsSharedData>())
    .SetHidden();

  aut.AddScopedAction("FlipX",
                _("Flip the object horizontally"),
                _("Flip the object horizontally"),
                _("Flip horizontally _PARAM0_: _PARAM2_"),
                _("Effects"),
                "res/actions/flipX24.png",
                "res/actions/flipX.png")
      .AddParameter("object", _("Object"))
      .AddParameter("behavior", _("Behavior"), "FlippableBehavior")
      .AddParameter("yesorno", _("Activate flipping"))
      .MarkAsSimple();

  aut.AddScopedAction("FlipY",
                _("Flip the object vertically"),
                _("Flip the object vertically"),
                _("Flip vertically _PARAM0_: _PARAM2_"),
                _("Effects"),
                "res/actions/flipY24.png",
                "res/actions/flipY.png")
      .AddParameter("object", _("Object"))
      .AddParameter("behavior", _("Behavior"), "FlippableBehavior")
      .AddParameter("yesorno", _("Activate flipping"))
      .MarkAsSimple();

  aut.AddScopedCondition("FlippedX",
                   _("Horizontally flipped"),
                   _("Check if the object is horizontally flipped"),
                   _("_PARAM0_ is horizontally flipped"),
                   _("Effects"),
                   "res/actions/flipX24.png",
                   "res/actions/flipX.png")
      .AddParameter("object", _("Object"))
      .AddParameter("behavior", _("Behavior"), "FlippableBehavior");

  aut.AddScopedCondition("FlippedY",
                   _("Vertically flipped"),
                   _("Check if the object is vertically flipped"),
                   _("_PARAM0_ is vertically flipped"),
                   _("Effects"),
                   "res/actions/flipY24.png",
                   "res/actions/flipY.png")
      .AddParameter("object", _("Object"))
      .AddParameter("behavior", _("Behavior"), "FlippableBehavior");
}

}  // namespace gd
