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

void GD_CORE_API BuiltinExtensionsImplementer::ImplementsScalableExtension(
    gd::PlatformExtension& extension) {
  extension
      .SetExtensionInformation("ScalableCapability",
                               _("Scalable capability"),
                               _("Change the object scale."),
                               "Florian Rival",
                               "Open source (MIT License)")
      .SetExtensionHelpPath("/objects");
  extension.AddInstructionOrExpressionGroupMetadata(_("Scalable capability"))
      .SetIcon("res/actions/scale24_black.png");
  extension.AddInstructionOrExpressionGroupMetadata(_("Size"))
      .SetIcon("res/actions/scale24_black.png");

  gd::BehaviorMetadata& aut = extension.AddBehavior(
      "ScalableBehavior",
      _("Scalable capability"),
      "Scale",
      _("Change the object scale."),
      "",
      "res/actions/scale24_black.png",
      "ResizableBehavior",
      std::make_shared<gd::Behavior>(),
      std::make_shared<gd::BehaviorsSharedData>())
    .SetHidden();

  aut.AddExpressionAndConditionAndAction(
         "number",
         "Value",
         _("Scale"),
         _("the scale of the object (default scale is 1)"),
         _("the scale"),
         _("Size"),
         "res/actions/scale24_black.png")
      .AddParameter("object", _("Object"))
      .AddParameter("behavior", _("Behavior"), "ScalableBehavior")
      .UseStandardParameters(
          "number",
          gd::ParameterOptions::MakeNewOptions().SetDescription(
              _("Scale (1 by default)")))
      .MarkAsAdvanced();
  aut.GetAllExpressions()["Value"].SetGroup("");

  aut.AddExpressionAndConditionAndAction(
         "number",
         "X",
         _("Scale on X axis"),
         _("the scale on X axis of the object (default scale is 1)"),
         _("the scale on X axis"),
         _("Size"),
         "res/actions/scaleWidth24_black.png")
      .AddParameter("object", _("Object"))
      .AddParameter("behavior", _("Behavior"), "ScalableBehavior")
      .UseStandardParameters(
          "number",
          gd::ParameterOptions::MakeNewOptions().SetDescription(
              _("Scale (1 by default)")))
      .MarkAsAdvanced();
  aut.GetAllExpressions()["X"].SetGroup("");

  aut.AddExpressionAndConditionAndAction(
         "number",
         "Y",
         _("Scale on Y axis"),
         _("the scale on Y axis of the object (default scale is 1)"),
         _("the scale on Y axis"),
         _("Size"),
         "res/actions/scaleHeight24_black.png")
      .AddParameter("object", _("Object"))
      .AddParameter("behavior", _("Behavior"), "ScalableBehavior")
      .UseStandardParameters(
          "number",
          gd::ParameterOptions::MakeNewOptions().SetDescription(
              _("Scale (1 by default)")))
      .MarkAsAdvanced();
  aut.GetAllExpressions()["Y"].SetGroup("");
}

}  // namespace gd
