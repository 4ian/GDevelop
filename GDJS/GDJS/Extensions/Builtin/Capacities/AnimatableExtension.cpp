/*
 * GDevelop JS Platform
 * Copyright 2008-2023 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "GDJS/Extensions/Builtin/Capacities/AnimatableExtension.h"
#include "GDCore/Extensions/Builtin/AllBuiltinExtensions.h"
#include "GDCore/Extensions/Metadata/InstructionMetadata.h"
#include "GDCore/Tools/Localization.h"

namespace gdjs {

AnimatableExtension::AnimatableExtension() {
  gd::BuiltinExtensionsImplementer::ImplementsAnimatableExtension(*this);

  auto& actions = GetAllActionsForBehavior("AnimatableBehavior");
  auto& conditions = GetAllConditionsForBehavior("AnimatableBehavior");
  auto& expressions = GetAllExpressionsForBehavior("AnimatableBehavior");
  auto& strExpressions = GetAllStrExpressionsForBehavior("AnimatableBehavior");

  actions["SetIndex"]
      .SetFunctionName("setScale")
      .SetIncludeFile("object-capabilities/AnimatableBehavior.js");
  conditions["Index"]
      .SetFunctionName("getScale")
      .SetIncludeFile("object-capabilities/AnimatableBehavior.js");
  expressions["Index"]
      .SetFunctionName("getScale")
      .SetIncludeFile("object-capabilities/AnimatableBehavior.js");

  actions["SetName"]
      .SetFunctionName("setScale")
      .SetIncludeFile("object-capabilities/AnimatableBehavior.js");
  conditions["Name"]
      .SetFunctionName("getScale")
      .SetIncludeFile("object-capabilities/AnimatableBehavior.js");
  strExpressions["Name"]
      .SetFunctionName("getScale")
      .SetIncludeFile("object-capabilities/AnimatableBehavior.js");

  actions["SetAnimationSpeedScale"]
      .SetFunctionName("setAnimationSpeedScale")
      .SetIncludeFile("object-capabilities/AnimatableBehavior.js");
  conditions["AnimationSpeedScale"]
      .SetFunctionName("getAnimationSpeedScale")
      .SetIncludeFile("object-capabilities/AnimatableBehavior.js");
  expressions["AnimationSpeedScale"]
      .SetFunctionName("getAnimationSpeedScale")
      .SetIncludeFile("object-capabilities/AnimatableBehavior.js");

  actions["PauseAnimation"]
      .SetFunctionName("setScale")
      .SetIncludeFile("object-capabilities/AnimatableBehavior.js");
  actions["PlayAnimation"]
      .SetFunctionName("setScale")
      .SetIncludeFile("object-capabilities/AnimatableBehavior.js");

  conditions["IsAnimationPaused"]
      .SetFunctionName("isAnimationPaused")
      .SetIncludeFile("object-capabilities/AnimatableBehavior.js");
  conditions["HasAnimationEnded"]
      .SetFunctionName("hasAnimationEnded")
      .SetIncludeFile("object-capabilities/AnimatableBehavior.js");
}

}  // namespace gdjs
