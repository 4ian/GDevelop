/*
 * GDevelop JS Platform
 * Copyright 2008-2023 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "GDJS/Extensions/Builtin/Capacities/ScalableExtension.h"
#include "GDCore/Extensions/Builtin/AllBuiltinExtensions.h"
#include "GDCore/Extensions/Metadata/InstructionMetadata.h"
#include "GDCore/Tools/Localization.h"

namespace gdjs {

ScalableExtension::ScalableExtension() {
  gd::BuiltinExtensionsImplementer::ImplementsScalableExtension(*this);

  auto& actions = GetAllActionsForBehavior("ScalableBehavior");
  auto& conditions = GetAllConditionsForBehavior("ScalableBehavior");
  auto& expressions = GetAllExpressionsForBehavior("ScalableBehavior");

  actions["SetValue"]
      .SetFunctionName("setScale")
      .SetIncludeFile("object-capabilities/ScalableBehavior.js");
  conditions["Value"]
      .SetFunctionName("getScale")
      .SetIncludeFile("object-capabilities/ScalableBehavior.js");
  expressions["Value"]
      .SetFunctionName("getScale")
      .SetIncludeFile("object-capabilities/ScalableBehavior.js");

  actions["SetX"]
      .SetFunctionName("setScaleX")
      .SetIncludeFile("object-capabilities/ScalableBehavior.js");
  conditions["X"]
      .SetFunctionName("getScaleX")
      .SetIncludeFile("object-capabilities/ScalableBehavior.js");
  expressions["X"]
      .SetFunctionName("getScaleX")
      .SetIncludeFile("object-capabilities/ScalableBehavior.js");

  actions["SetY"]
      .SetFunctionName("setScaleY")
      .SetIncludeFile("object-capabilities/ScalableBehavior.js");
  conditions["Y"]
      .SetFunctionName("getScaleY")
      .SetIncludeFile("object-capabilities/ScalableBehavior.js");
  expressions["Y"]
      .SetFunctionName("getScaleY")
      .SetIncludeFile("object-capabilities/ScalableBehavior.js");
}

}  // namespace gdjs
