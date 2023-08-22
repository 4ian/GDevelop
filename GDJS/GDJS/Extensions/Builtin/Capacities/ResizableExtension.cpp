/*
 * GDevelop JS Platform
 * Copyright 2008-2023 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "GDJS/Extensions/Builtin/Capacities/ResizableExtension.h"
#include "GDCore/Extensions/Builtin/AllBuiltinExtensions.h"
#include "GDCore/Extensions/Metadata/InstructionMetadata.h"
#include "GDCore/Tools/Localization.h"

namespace gdjs {

ResizableExtension::ResizableExtension() {
  gd::BuiltinExtensionsImplementer::ImplementsResizableExtension(*this);

  GetBehaviorMetadata("ResizableCapability::ResizableBehavior")
      .SetIncludeFile("object-capabilities/ResizableBehavior.js");

  auto& actions = GetAllActionsForBehavior("ResizableCapability::ResizableBehavior");
  auto& conditions = GetAllConditionsForBehavior("ResizableCapability::ResizableBehavior");

  actions["ResizableCapability::ResizableBehavior::SetWidth"]
      .SetFunctionName("setWidth")
      .SetGetter("getWidth")
      .SetIncludeFile("object-capabilities/ResizableBehavior.js");
  conditions["ResizableCapability::ResizableBehavior::Width"]
      .SetFunctionName("getWidth")
      .SetIncludeFile("object-capabilities/ResizableBehavior.js");

  actions["ResizableCapability::ResizableBehavior::SetHeight"]
      .SetFunctionName("setHeight")
      .SetGetter("getHeight")
      .SetIncludeFile("object-capabilities/ResizableBehavior.js");
  conditions["ResizableCapability::ResizableBehavior::Height"]
      .SetFunctionName("getHeight")
      .SetIncludeFile("object-capabilities/ResizableBehavior.js");

  actions["ResizableCapability::ResizableBehavior::SetSize"]
      .SetFunctionName("setSize")
      .SetIncludeFile("object-capabilities/ResizableBehavior.js");
}

}  // namespace gdjs
