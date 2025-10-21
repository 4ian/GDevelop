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

void GD_CORE_API BuiltinExtensionsImplementer::ImplementsTextContainerExtension(
    gd::PlatformExtension& extension) {
  extension
      .SetExtensionInformation("TextContainerCapability",
                               _("Objects containing a text"),
                               _("Allows an object to contain a text, usually shown on screen, that can be modified."),
                               "Florian Rival",
                               "Open source (MIT License)")
      .SetExtensionHelpPath("/objects");
  extension.AddInstructionOrExpressionGroupMetadata(_("Objects containing a text"))
      .SetIcon("res/conditions/text24_black.png");

  gd::BehaviorMetadata& aut = extension.AddBehavior(
      "TextContainerBehavior",
      _("Objects containing a text"),
      "Text",
      _("Allows an object to contain a text, usually shown on screen, that can be modified."),
      "",
      "res/conditions/text24_black.png",
      "TextContainerBehavior",
      std::make_shared<gd::Behavior>(),
      std::make_shared<gd::BehaviorsSharedData>())
    .SetHidden();

  aut.AddExpressionAndConditionAndAction(
         "string",
         "Value",
         _("Text"),
         _("the text"),
         _("the text"),
         "",
         "res/conditions/text24_black.png")
      .AddParameter("object", _("Object"))
      .AddParameter("behavior", _("Behavior"), "TextContainerBehavior")
      .UseStandardParameters(
          "string", gd::ParameterOptions::MakeNewOptions().SetDescription(
                        _("Text")))
      .MarkAsSimple();
  aut.GetAllStrExpressions()["Value"].SetGroup("");
}

}  // namespace gd
