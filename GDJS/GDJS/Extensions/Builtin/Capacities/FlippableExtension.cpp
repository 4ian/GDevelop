/*
 * GDevelop JS Platform
 * Copyright 2008-2023 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "GDJS/Extensions/Builtin/Capacities/FlippableExtension.h"
#include "GDCore/Extensions/Builtin/AllBuiltinExtensions.h"
#include "GDCore/Extensions/Metadata/InstructionMetadata.h"
#include "GDCore/Tools/Localization.h"

namespace gdjs {

FlippableExtension::FlippableExtension() {
  gd::BuiltinExtensionsImplementer::ImplementsFlippableExtension(*this);

  GetBehaviorMetadata("FlippableCapability::FlippableBehavior")
      .SetIncludeFile("object-capabilities/FlippableBehavior.js");

  auto& actions = GetAllActionsForBehavior("FlippableCapability::FlippableBehavior");
  auto& conditions = GetAllConditionsForBehavior("FlippableCapability::FlippableBehavior");

  actions["FlippableCapability::FlippableBehavior::FlipX"]
      .SetFunctionName("flipX")
      .SetIncludeFile("object-capabilities/FlippableBehavior.js");
  conditions["FlippableCapability::FlippableBehavior::FlippedX"]
      .SetFunctionName("isFlippedX")
      .SetIncludeFile("object-capabilities/FlippableBehavior.js");

  actions["FlippableCapability::FlippableBehavior::FlipY"]
      .SetFunctionName("flipY")
      .SetIncludeFile("object-capabilities/FlippableBehavior.js");
  conditions["FlippableCapability::FlippableBehavior::FlippedY"]
      .SetFunctionName("isFlippedY")
      .SetIncludeFile("object-capabilities/FlippableBehavior.js");
}

}  // namespace gdjs
