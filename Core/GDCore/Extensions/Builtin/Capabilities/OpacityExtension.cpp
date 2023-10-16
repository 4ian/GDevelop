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

void GD_CORE_API BuiltinExtensionsImplementer::ImplementsOpacityExtension(
    gd::PlatformExtension& extension) {
  extension
      .SetExtensionInformation("OpacityCapability",
                               _("Opacity capability"),
                               _("Change the object opacity."),
                               "Florian Rival",
                               "Open source (MIT License)")
      .SetExtensionHelpPath("/objects");
  extension.AddInstructionOrExpressionGroupMetadata(_("Opacity capability"))
      .SetIcon("res/actions/opacity24.png");
  extension.AddInstructionOrExpressionGroupMetadata(_("Visibility"))
      .SetIcon("res/actions/opacity24.png");

  gd::BehaviorMetadata& aut = extension.AddBehavior(
      "OpacityBehavior",
      _("Opacity capability"),
      "Opacity",
      _("Change the object opacity."),
      "",
      "res/actions/opacity24.png",
      "OpacityBehavior",
      std::make_shared<gd::Behavior>(),
      std::make_shared<gd::BehaviorsSharedData>())
    .SetHidden();

  aut.AddExpressionAndConditionAndAction(
         "number",
         "Value",
         _("Opacity"),
         _("the opacity of an object, between 0 (fully transparent) to 255 "
           "(opaque)"),
         _("the opacity"),
         _("Visibility"),
         "res/actions/opacity24.png")
      .AddParameter("object", _("Object"))
      .AddParameter("behavior", _("Behavior"), "OpacityBehavior")
      .UseStandardParameters(
          "number", gd::ParameterOptions::MakeNewOptions().SetDescription(
                        _("Opacity (0-255)")))
      .SetFunctionName("setOpacity")
      .SetGetter("getOpacity");
  aut.GetAllExpressions()["Value"].SetGroup("");
}

}  // namespace gd
