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

  GetBehaviorMetadata("ScalableCapability::ScalableBehavior")
      .SetIncludeFile("object-capabilities/ScalableBehavior.js");

  auto& actions = GetAllActionsForBehavior("ScalableCapability::ScalableBehavior");
  auto& conditions = GetAllConditionsForBehavior("ScalableCapability::ScalableBehavior");
  auto& expressions = GetAllExpressionsForBehavior("ScalableCapability::ScalableBehavior");

  actions["ScalableCapability::ScalableBehavior::SetValue"]
      .SetFunctionName("setScale")
      .SetGetter("getScale")
      .SetIncludeFile("object-capabilities/ScalableBehavior.js");
  conditions["ScalableCapability::ScalableBehavior::Value"]
      .SetFunctionName("getScale")
      .SetIncludeFile("object-capabilities/ScalableBehavior.js");
  expressions["Value"]
      .SetFunctionName("getScale")
      .SetIncludeFile("object-capabilities/ScalableBehavior.js");

  actions["ScalableCapability::ScalableBehavior::SetX"]
      .SetFunctionName("setScaleX")
      .SetGetter("getScaleX")
      .SetIncludeFile("object-capabilities/ScalableBehavior.js");
  conditions["ScalableCapability::ScalableBehavior::X"]
      .SetFunctionName("getScaleX")
      .SetIncludeFile("object-capabilities/ScalableBehavior.js");
  expressions["X"]
      .SetFunctionName("getScaleX")
      .SetIncludeFile("object-capabilities/ScalableBehavior.js");

  actions["ScalableCapability::ScalableBehavior::SetY"]
      .SetFunctionName("setScaleY")
      .SetGetter("getScaleY")
      .SetIncludeFile("object-capabilities/ScalableBehavior.js");
  conditions["ScalableCapability::ScalableBehavior::Y"]
      .SetFunctionName("getScaleY")
      .SetIncludeFile("object-capabilities/ScalableBehavior.js");
  expressions["Y"]
      .SetFunctionName("getScaleY")
      .SetIncludeFile("object-capabilities/ScalableBehavior.js");
}

}  // namespace gdjs
