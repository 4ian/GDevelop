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

void GD_CORE_API BuiltinExtensionsImplementer::ImplementsEffectExtension(
    gd::PlatformExtension& extension) {
  extension
      .SetExtensionInformation("EffectCapability",
                               _("Effect capability"),
                               _("Apply visual effects to objects."),
                               "Florian Rival",
                               "Open source (MIT License)")
      .SetExtensionHelpPath("/objects");
  extension.AddInstructionOrExpressionGroupMetadata(_("Effects"))
      .SetIcon("res/actions/effect_black.svg");

  gd::BehaviorMetadata& aut = extension.AddBehavior(
      "EffectBehavior",
      _("Effect capability"),
      "Effect",
      _("Apply visual effects to objects."),
      "",
      "res/actions/effect_black.svg",
      "EffectBehavior",
      std::make_shared<gd::Behavior>(),
      std::make_shared<gd::BehaviorsSharedData>())
    .SetHidden();

  aut.AddScopedAction("EnableEffect",
                _("Enable an object effect"),
                _("Enable an effect on the object"),
                _("Enable effect _PARAM2_ on _PARAM0_: _PARAM3_"),
                _("Effects"),
                "res/actions/effect_black.svg",
                "res/actions/effect_black.svg")
      .AddParameter("object", _("Object"))
      .AddParameter("behavior", _("Behavior"), "EffectBehavior")
      .AddParameter("objectEffectName", _("Effect name"))
      .AddParameter("yesorno", _("Enable?"))
      .MarkAsSimple();

  aut.AddScopedAction("SetEffectDoubleParameter",
                _("Effect property (number)"),
                _("Change the value of a property of an effect.") + "\n" +
                    _("You can find the property names (and change the effect "
                      "names) in the effects window."),
                _("Set _PARAM3_ to _PARAM4_ for effect _PARAM2_ of _PARAM0_"),
                _("Effects"),
                "res/actions/effect_black.svg",
                "res/actions/effect_black.svg")
      .AddParameter("object", _("Object"))
      .AddParameter("behavior", _("Behavior"), "EffectBehavior")
      .AddParameter("objectEffectName", _("Effect name"))
      .AddParameter("objectEffectParameterName", _("Property name"))
      .AddParameter("expression", _("New value"))
      .MarkAsSimple();

  aut.AddScopedAction("SetEffectStringParameter",
                _("Effect property (string)"),
                _("Change the value (string) of a property of an effect.") +
                    "\n" +
                    _("You can find the property names (and change the effect "
                      "names) in the effects window."),
                _("Set _PARAM3_ to _PARAM4_ for effect _PARAM2_ of _PARAM0_"),
                _("Effects"),
                "res/actions/effect_black.svg",
                "res/actions/effect_black.svg")
      .AddParameter("object", _("Object"))
      .AddParameter("behavior", _("Behavior"), "EffectBehavior")
      .AddParameter("objectEffectName", _("Effect name"))
      .AddParameter("objectEffectParameterName", _("Property name"))
      .AddParameter("string", _("New value"))
      .MarkAsSimple();

  aut.AddScopedAction("SetEffectBooleanParameter",
                _("Effect property (enable or disable)"),
                _("Enable or disable a property of an effect.") + "\n" +
                    _("You can find the property names (and change the effect "
                      "names) in the effects window."),
                _("Enable _PARAM3_ for effect _PARAM2_ of _PARAM0_: _PARAM4_"),
                _("Effects"),
                "res/actions/effect_black.svg",
                "res/actions/effect_black.svg")
      .AddParameter("object", _("Object"))
      .AddParameter("behavior", _("Behavior"), "EffectBehavior")
      .AddParameter("objectEffectName", _("Effect name"))
      .AddParameter("objectEffectParameterName", _("Property name"))
      .AddParameter("yesorno", _("Enable this property"))
      .MarkAsSimple();

  aut.AddScopedCondition("IsEffectEnabled",
                   _("Effect is enabled"),
                   _("Check if the effect on an object is enabled."),
                   _("Effect _PARAM2_ of _PARAM0_ is enabled"),
                   _("Effects"),
                   "res/actions/effect_black.svg",
                   "res/actions/effect_black.svg")
      .AddParameter("object", _("Object"))
      .AddParameter("behavior", _("Behavior"), "EffectBehavior")
      .AddParameter("objectEffectName", _("Effect name"))
      .MarkAsSimple();
}

}  // namespace gd
