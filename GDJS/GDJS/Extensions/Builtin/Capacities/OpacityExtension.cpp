/*
 * GDevelop JS Platform
 * Copyright 2008-2023 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "GDJS/Extensions/Builtin/Capacities/OpacityExtension.h"
#include "GDCore/Extensions/Builtin/AllBuiltinExtensions.h"
#include "GDCore/Extensions/Metadata/InstructionMetadata.h"
#include "GDCore/Tools/Localization.h"

namespace gdjs {

OpacityExtension::OpacityExtension() {
  gd::BuiltinExtensionsImplementer::ImplementsOpacityExtension(*this);

  auto& actions = GetAllActionsForBehavior("OpacityBehavior");
  auto& conditions = GetAllConditionsForBehavior("OpacityBehavior");
  auto& expressions = GetAllExpressionsForBehavior("OpacityBehavior");

  actions["SetValue"]
      .SetFunctionName("setOpacity")
      .SetIncludeFile("object-capabilities/OpacityBehavior.js");
  conditions["Value"]
      .SetFunctionName("getOpacity")
      .SetIncludeFile("object-capabilities/OpacityBehavior.js");
  expressions["Value"]
      .SetFunctionName("getOpacity")
      .SetIncludeFile("object-capabilities/ScalableBehavior.js");
}

}  // namespace gdjs
