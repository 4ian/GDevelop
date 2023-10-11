/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the GNU Lesser General Public
 * License.
 */
#include "GDCore/Extensions/Builtin/AllBuiltinExtensions.h"
#include "GDCore/Project/Behavior.h"
#include "GDCore/Project/BehaviorsSharedData.h"
#include "GDCore/Project/Object.h"
#include "GDCore/Tools/Localization.h"

using namespace std;
namespace gd {

void GD_CORE_API BuiltinExtensionsImplementer::ImplementsResizableExtension(
    gd::PlatformExtension &extension) {
  extension
      .SetExtensionInformation("ResizableCapability",
                               _("Resizable capability"),
                               _("Change the object dimensions."),
                               "Florian Rival",
                               "Open source (MIT License)")
      .SetExtensionHelpPath("/objects");
  extension.AddInstructionOrExpressionGroupMetadata(_("Size")).SetIcon(
      "res/actions/scale24_black.png");

  gd::BehaviorMetadata &aut =
      extension
          .AddBehavior("ResizableBehavior",
                       _("Resizable capability"),
                       "Resizable",
                       _("Change the object dimensions."),
                       "",
                       "res/actions/scale24_black.png",
                       "ResizableBehavior",
                       std::make_shared<gd::Behavior>(),
                       std::make_shared<gd::BehaviorsSharedData>())
          .SetHidden();

  aut.AddScopedAction("SetWidth",
                      _("Width"),
                      _("Change the width of the object."),
                      _("the width"),
                      _("Size"),
                      "res/actions/scaleWidth24_black.png",
                      "res/actions/scaleWidth_black.png")
      .AddParameter("object", _("Object"))
      .AddParameter("behavior", _("Behavior"), "ResizableBehavior")
      .UseStandardOperatorParameters(
          "number",
          ParameterOptions::MakeNewOptions().SetDescription(_("Width")))
      .MarkAsAdvanced();

  aut.AddScopedCondition("Width",
                         _("Width"),
                         _("Compare the width of the object."),
                         _("the width"),
                         _("Size"),
                         "res/conditions/scaleWidth24_black.png",
                         "res/conditions/scaleWidth_black.png")
      .AddParameter("object", _("Object"))
      .AddParameter("behavior", _("Behavior"), "ResizableBehavior")
      .UseStandardRelationalOperatorParameters(
          "number",
          ParameterOptions::MakeNewOptions().SetDescription(_("Width")))
      .MarkAsAdvanced();

  aut.AddScopedAction("SetHeight",
                      _("Height"),
                      _("Change the height of the object."),
                      _("the height"),
                      _("Size"),
                      "res/actions/scaleHeight24_black.png",
                      "res/actions/scaleHeight_black.png")
      .AddParameter("object", _("Object"))
      .AddParameter("behavior", _("Behavior"), "ResizableBehavior")
      .UseStandardOperatorParameters(
          "number",
          ParameterOptions::MakeNewOptions().SetDescription(_("Height")))
      .MarkAsAdvanced();

  aut.AddScopedCondition("Height",
                         _("Height"),
                         _("Compare the height of the object."),
                         _("the height"),
                         _("Size"),
                         "res/conditions/scaleHeight24_black.png",
                         "res/conditions/scaleHeight_black.png")
      .AddParameter("object", _("Object"))
      .AddParameter("behavior", _("Behavior"), "ResizableBehavior")
      .UseStandardRelationalOperatorParameters(
          "number",
          ParameterOptions::MakeNewOptions().SetDescription(_("Height")))
      .MarkAsAdvanced();

  aut.AddScopedAction(
         "SetSize",
         _("Size"),
         _("Change the size of an object."),
         _("Change the size of _PARAM0_: set to _PARAM2_ x _PARAM3_"),
         _("Size"),
         "res/actions/scale24_black.png",
         "res/actions/scale_black.png")
      .AddParameter("object", _("Object"))
      .AddParameter("behavior", _("Behavior"), "ResizableBehavior")
      .AddParameter("expression", _("Width"))
      .AddParameter("expression", _("Height"))
      .MarkAsAdvanced();
}

}  // namespace gd
