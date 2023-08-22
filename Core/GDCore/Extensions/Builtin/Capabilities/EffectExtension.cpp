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
      .SetIcon("res/actions/effect24.png");

  gd::BehaviorMetadata& aut = extension.AddBehavior(
      "EffectBehavior",
      _("Effect capability"),
      "Effect",
      _("Apply visual effects to objects."),
      "",
      "res/actions/effect24.png",
      "EffectBehavior",
      std::make_shared<gd::Behavior>(),
      std::make_shared<gd::BehaviorsSharedData>())
    .SetHidden();

  aut.AddScopedAction("EnableEffect",
                _("Enable an object effect"),
                _("Enable an effect on the object"),
                _("Enable effect _PARAM2_ on _PARAM0_: _PARAM3_"),
                _("Effects"),
                "res/actions/effect24.png",
                "res/actions/effect.png")
      .AddParameter("object", _("Object"))
      .AddParameter("behavior", _("Behavior"), "EffectBehavior")
      .AddParameter("objectEffectName", _("Effect name"))
      .AddParameter("yesorno", _("Enable?"))
      .MarkAsSimple();

  aut.AddScopedAction("SetEffectDoubleParameter",
                _("Effect parameter (number)"),
                _("Change the value of a parameter of an effect.") + "\n" +
                    _("You can find the parameter names (and change the effect "
                      "names) in the effects window."),
                _("Set _PARAM3_ to _PARAM4_ for effect _PARAM2_ of _PARAM0_"),
                _("Effects"),
                "res/actions/effect24.png",
                "res/actions/effect.png")
      .AddParameter("object", _("Object"))
      .AddParameter("behavior", _("Behavior"), "EffectBehavior")
      .AddParameter("objectEffectName", _("Effect name"))
      .AddParameter("objectEffectParameterName", _("Parameter name"))
      .AddParameter("expression", _("New value"))
      .MarkAsSimple();

  aut.AddScopedAction("SetEffectStringParameter",
                _("Effect parameter (string)"),
                _("Change the value (string) of a parameter of an effect.") +
                    "\n" +
                    _("You can find the parameter names (and change the effect "
                      "names) in the effects window."),
                _("Set _PARAM3_ to _PARAM4_ for effect _PARAM2_ of _PARAM0_"),
                _("Effects"),
                "res/actions/effect24.png",
                "res/actions/effect.png")
      .AddParameter("object", _("Object"))
      .AddParameter("behavior", _("Behavior"), "EffectBehavior")
      .AddParameter("objectEffectName", _("Effect name"))
      .AddParameter("objectEffectParameterName", _("Parameter name"))
      .AddParameter("string", _("New value"))
      .MarkAsSimple();

  aut.AddScopedAction("SetEffectBooleanParameter",
                _("Effect parameter (enable or disable)"),
                _("Enable or disable a parameter of an effect.") + "\n" +
                    _("You can find the parameter names (and change the effect "
                      "names) in the effects window."),
                _("Enable _PARAM3_ for effect _PARAM2_ of _PARAM0_: _PARAM4_"),
                _("Effects"),
                "res/actions/effect24.png",
                "res/actions/effect.png")
      .AddParameter("object", _("Object"))
      .AddParameter("behavior", _("Behavior"), "EffectBehavior")
      .AddParameter("objectEffectName", _("Effect name"))
      .AddParameter("objectEffectParameterName", _("Parameter name"))
      .AddParameter("yesorno", _("Enable?"))
      .MarkAsSimple();

  aut.AddScopedCondition("IsEffectEnabled",
                   _("Effect is enabled"),
                   _("Check if the effect on an object is enabled."),
                   _("Effect _PARAM2_ of _PARAM0_ is enabled"),
                   _("Effects"),
                   "res/actions/effect24.png",
                   "res/actions/effect.png")
      .AddParameter("object", _("Object"))
      .AddParameter("behavior", _("Behavior"), "EffectBehavior")
      .AddParameter("objectEffectName", _("Effect name"))
      .MarkAsSimple();
}

}  // namespace gd
