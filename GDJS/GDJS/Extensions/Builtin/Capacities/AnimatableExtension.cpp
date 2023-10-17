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

  GetBehaviorMetadata("AnimatableCapability::AnimatableBehavior")
      .SetIncludeFile("object-capabilities/AnimatableBehavior.js");

  auto& actions = GetAllActionsForBehavior("AnimatableCapability::AnimatableBehavior");
  auto& conditions = GetAllConditionsForBehavior("AnimatableCapability::AnimatableBehavior");
  auto& expressions = GetAllExpressionsForBehavior("AnimatableCapability::AnimatableBehavior");
  auto& strExpressions = GetAllStrExpressionsForBehavior("AnimatableCapability::AnimatableBehavior");

  actions["AnimatableCapability::AnimatableBehavior::SetIndex"]
      .SetFunctionName("setAnimationIndex")
      .SetGetter("getAnimationIndex")
      .SetIncludeFile("object-capabilities/AnimatableBehavior.js");
  conditions["AnimatableCapability::AnimatableBehavior::Index"]
      .SetFunctionName("getAnimationIndex")
      .SetIncludeFile("object-capabilities/AnimatableBehavior.js");
  expressions["Index"]
      .SetFunctionName("getAnimationIndex")
      .SetIncludeFile("object-capabilities/AnimatableBehavior.js");

  actions["AnimatableCapability::AnimatableBehavior::SetName"]
      .SetFunctionName("setAnimationName")
      .SetGetter("getAnimationName")
      .SetIncludeFile("object-capabilities/AnimatableBehavior.js");
  conditions["AnimatableCapability::AnimatableBehavior::Name"]
      .SetFunctionName("getAnimationName")
      .SetIncludeFile("object-capabilities/AnimatableBehavior.js");
  strExpressions["Name"]
      .SetFunctionName("getAnimationName")
      .SetIncludeFile("object-capabilities/AnimatableBehavior.js");

  actions["AnimatableCapability::AnimatableBehavior::SetSpeedScale"]
      .SetFunctionName("setAnimationSpeedScale")
      .SetGetter("getAnimationSpeedScale")
      .SetIncludeFile("object-capabilities/AnimatableBehavior.js");
  conditions["AnimatableCapability::AnimatableBehavior::SpeedScale"]
      .SetFunctionName("getAnimationSpeedScale")
      .SetIncludeFile("object-capabilities/AnimatableBehavior.js");
  expressions["SpeedScale"]
      .SetFunctionName("getAnimationSpeedScale")
      .SetIncludeFile("object-capabilities/AnimatableBehavior.js");

  actions["AnimatableCapability::AnimatableBehavior::PauseAnimation"]
      .SetFunctionName("pauseAnimation")
      .SetIncludeFile("object-capabilities/AnimatableBehavior.js");
  actions["AnimatableCapability::AnimatableBehavior::PlayAnimation"]
      .SetFunctionName("resumeAnimation")
      .SetIncludeFile("object-capabilities/AnimatableBehavior.js");

  conditions["AnimatableCapability::AnimatableBehavior::IsAnimationPaused"]
      .SetFunctionName("isAnimationPaused")
      .SetIncludeFile("object-capabilities/AnimatableBehavior.js");
  conditions["AnimatableCapability::AnimatableBehavior::HasAnimationEnded"]
      .SetFunctionName("hasAnimationEnded")
      .SetIncludeFile("object-capabilities/AnimatableBehavior.js");

  actions["AnimatableCapability::AnimatableBehavior::SetElapsedTime"]
      .SetFunctionName("setAnimationElapsedTime")
      .SetGetter("getAnimationElapsedTime")
      .SetIncludeFile("object-capabilities/AnimatableBehavior.js");
  conditions["AnimatableCapability::AnimatableBehavior::ElapsedTime"]
      .SetFunctionName("getAnimationElapsedTime")
      .SetIncludeFile("object-capabilities/AnimatableBehavior.js");
  expressions["ElapsedTime"]
      .SetFunctionName("getAnimationElapsedTime")
      .SetIncludeFile("object-capabilities/AnimatableBehavior.js");
  expressions["Duration"]
      .SetFunctionName("getAnimationDuration")
      .SetIncludeFile("object-capabilities/AnimatableBehavior.js");
}

}  // namespace gdjs
