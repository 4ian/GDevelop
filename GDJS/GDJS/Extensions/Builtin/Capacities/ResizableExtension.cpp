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

  auto& actions = GetAllActionsForBehavior("ResizableBehavior");
  auto& conditions = GetAllConditionsForBehavior("ResizableBehavior");

  actions["SetWidth"]
      .SetFunctionName("setWidth")
      .SetIncludeFile("object-capabilities/ResizableBehavior.js");
  conditions["Width"]
      .SetFunctionName("getWidth")
      .SetIncludeFile("object-capabilities/ResizableBehavior.js");

  actions["SetHeight"]
      .SetFunctionName("setHeight")
      .SetIncludeFile("object-capabilities/ResizableBehavior.js");
  conditions["Height"]
      .SetFunctionName("getHeight")
      .SetIncludeFile("object-capabilities/ResizableBehavior.js");

  actions["SetSize"]
      .SetFunctionName("setSize")
      .SetIncludeFile("object-capabilities/ResizableBehavior.js");
}

}  // namespace gdjs
