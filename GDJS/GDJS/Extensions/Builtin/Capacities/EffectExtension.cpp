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

  auto& actions = GetAllActionsForBehavior("EffectBehavior");
  auto& conditions = GetAllConditionsForBehavior("EffectBehavior");
  auto& expressions = GetAllExpressionsForBehavior("EffectBehavior");
  auto& strExpressions = GetAllStrExpressionsForBehavior("EffectBehavior");

  actions["SetEffectDoubleParameter"]
      .SetFunctionName("setEffectDoubleParameter")
      .SetIncludeFile("object-capabilities/EffectBehavior.js");
  actions["SetEffectStringParameter"]
      .SetFunctionName("setEffectStringParameter")
      .SetIncludeFile("object-capabilities/EffectBehavior.js");
  actions["SetEffectBooleanParameter"]
      .SetFunctionName("setEffectBooleanParameter")
      .SetIncludeFile("object-capabilities/EffectBehavior.js");

  actions["EnableEffect"]
      .SetFunctionName("enableEffect")
      .SetIncludeFile("object-capabilities/EffectBehavior.js");
  conditions["IsEffectEnabled"]
      .SetFunctionName("isEffectEnabled")
      .SetIncludeFile("object-capabilities/EffectBehavior.js");
}

}  // namespace gdjs
