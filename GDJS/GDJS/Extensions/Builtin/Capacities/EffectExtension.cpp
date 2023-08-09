/*
 * GDevelop JS Platform
 * Copyright 2008-2023 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "GDJS/Extensions/Builtin/Capacities/EffectExtension.h"
#include "GDCore/Extensions/Builtin/AllBuiltinExtensions.h"
#include "GDCore/Extensions/Metadata/InstructionMetadata.h"
#include "GDCore/Tools/Localization.h"

namespace gdjs {

EffectExtension::EffectExtension() {
  gd::BuiltinExtensionsImplementer::ImplementsEffectExtension(*this);

  GetBehaviorMetadata("EffectCapability::EffectBehavior")
      .SetIncludeFile("object-capabilities/EffectBehavior.js");

  auto& actions = GetAllActionsForBehavior("EffectCapability::EffectBehavior");
  auto& conditions = GetAllConditionsForBehavior("EffectCapability::EffectBehavior");

  actions["EffectCapability::EffectBehavior::SetEffectDoubleParameter"]
      .SetFunctionName("setEffectDoubleParameter")
      .SetIncludeFile("object-capabilities/EffectBehavior.js");
  actions["EffectCapability::EffectBehavior::SetEffectStringParameter"]
      .SetFunctionName("setEffectStringParameter")
      .SetIncludeFile("object-capabilities/EffectBehavior.js");
  actions["EffectCapability::EffectBehavior::SetEffectBooleanParameter"]
      .SetFunctionName("setEffectBooleanParameter")
      .SetIncludeFile("object-capabilities/EffectBehavior.js");

  actions["EffectCapability::EffectBehavior::EnableEffect"]
      .SetFunctionName("enableEffect")
      .SetIncludeFile("object-capabilities/EffectBehavior.js");
  conditions["EffectCapability::EffectBehavior::IsEffectEnabled"]
      .SetFunctionName("isEffectEnabled")
      .SetIncludeFile("object-capabilities/EffectBehavior.js");
}

}  // namespace gdjs
