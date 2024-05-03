/*
 * GDevelop JS Platform
 * Copyright 2008-2023 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "GDJS/Extensions/Builtin/Capacities/TextContainerExtension.h"
#include "GDCore/Extensions/Builtin/AllBuiltinExtensions.h"
#include "GDCore/Extensions/Metadata/InstructionMetadata.h"
#include "GDCore/Tools/Localization.h"

namespace gdjs {

TextContainerExtension::TextContainerExtension() {
  gd::BuiltinExtensionsImplementer::ImplementsTextContainerExtension(*this);

  GetBehaviorMetadata("TextContainerCapability::TextContainerBehavior")
      .SetIncludeFile("object-capabilities/TextContainerBehavior.js");

  auto& actions = GetAllActionsForBehavior("TextContainerCapability::TextContainerBehavior");
  auto& conditions = GetAllConditionsForBehavior("TextContainerCapability::TextContainerBehavior");
  auto& strExpressions = GetAllStrExpressionsForBehavior("TextContainerCapability::TextContainerBehavior");

  actions["TextContainerCapability::TextContainerBehavior::SetValue"]
      .SetFunctionName("setText")
      .SetGetter("getText")
      .SetIncludeFile("object-capabilities/TextContainerBehavior.js");
  conditions["TextContainerCapability::TextContainerBehavior::Value"]
      .SetFunctionName("getText")
      .SetIncludeFile("object-capabilities/TextContainerBehavior.js");
  strExpressions["Value"]
      .SetFunctionName("getText")
      .SetIncludeFile("object-capabilities/TextContainerBehavior.js");
}

}  // namespace gdjs
