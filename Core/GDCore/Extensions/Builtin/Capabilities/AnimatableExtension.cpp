/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the GNU Lesser General Public
 * License.
 */
#include "GDCore/Extensions/Builtin/AllBuiltinExtensions.h"
#include "GDCore/Extensions/Metadata/MultipleInstructionMetadata.h"
#include "GDCore/Project/Behavior.h"
#include "GDCore/Project/BehaviorsSharedData.h"
#include "GDCore/Project/Object.h"
#include "GDCore/Tools/Localization.h"

using namespace std;
namespace gd {

void GD_CORE_API BuiltinExtensionsImplementer::ImplementsAnimatableExtension(
    gd::PlatformExtension& extension) {
  extension
      .SetExtensionInformation("AnimatableCapability",
                               _("Animatable capability"),
                               _("Animate objects."),
                               "Florian Rival",
                               "Open source (MIT License)")
      .SetExtensionHelpPath("/objects");
  extension.AddInstructionOrExpressionGroupMetadata(_("Animatable capability"))
      .SetIcon("res/actions/animation24.png");
  extension.AddInstructionOrExpressionGroupMetadata(_("Animations and images"))
      .SetIcon("res/actions/animation24.png");

  gd::BehaviorMetadata& aut = extension.AddBehavior(
      "AnimatableBehavior",
      _("Animatable capability"),
      "Animation",
      _("Animate objects."),
      "",
      "res/actions/animation24.png",
      "AnimatableBehavior",
      std::make_shared<gd::Behavior>(),
      std::make_shared<gd::BehaviorsSharedData>())
    .SetHidden();

  aut.AddExpressionAndConditionAndAction(
         "number",
         "Index",
         _("Animation (by number)"),
         _("the animation played by the object using the animation number (from "
           "the animations list)"),
         _("the number of the animation"),
         _("Animations and images"),
         "res/actions/animation24.png")
      .AddParameter("object", _("Object"))
      .AddParameter("behavior", _("Behavior"), "AnimatableBehavior")
      .UseStandardParameters(
          "number", gd::ParameterOptions::MakeNewOptions().SetDescription(
                        _("Animation index")))
      .MarkAsSimple();
  aut.GetAllExpressions()["Index"].SetGroup("");

  aut.AddExpressionAndConditionAndAction(
         "string",
         "Name",
         _("Animation (by name)"),
         _("the animation played by the object using the name of the "
           "animation"),
         _("the animation"),
         _("Animations and images"),
         "res/actions/animation24.png")
      .AddParameter("object", _("Object"))
      .AddParameter("behavior", _("Behavior"), "AnimatableBehavior")
      .UseStandardParameters(
          "objectAnimationName", gd::ParameterOptions::MakeNewOptions().SetDescription(
                        _("Animation name")))
      .MarkAsSimple();
  aut.GetAllStrExpressions()["Name"].SetGroup("");

  aut.AddScopedAction("PauseAnimation",
                _("Pause the animation"),
                _("Pause the animation of the object."),
                _("Pause the animation of _PARAM0_"),
                _("Animations and images"),
                "res/actions/animation24.png",
                "res/actions/animation.png")
      .AddParameter("object", _("Object"))
      .AddParameter("behavior", _("Behavior"), "AnimatableBehavior")
      .MarkAsSimple();

  aut.AddScopedAction("PlayAnimation",
                _("Resume the animation"),
                _("Resume the animation of the object."),
                _("Resume the animation of _PARAM0_"),
                _("Animations and images"),
                "res/actions/animation24.png",
                "res/actions/animation.png")
      .AddParameter("object", _("Object"))
      .AddParameter("behavior", _("Behavior"), "AnimatableBehavior")
      .MarkAsSimple();

  aut.AddExpressionAndConditionAndAction(
         "number",
         "SpeedScale",
         _("Animation speed scale"),
         _("the animation speed scale (1 = the default speed, >1 = faster and "
           "<1 = slower)"),
         _("the animation speed scale"),
         _("Animations and images"),
         "res/actions/animation24.png")
      .AddParameter("object", _("Object"))
      .AddParameter("behavior", _("Behavior"), "AnimatableBehavior")
      .UseStandardParameters(
          "number", gd::ParameterOptions::MakeNewOptions().SetDescription(
                        _("Speed scale")))
      .MarkAsSimple();
  aut.GetAllExpressions()["SpeedScale"].SetGroup("");

  aut.AddScopedCondition("IsAnimationPaused",
                   _("Animation paused"),
                   _("Check if the animation of an object is paused."),
                   _("The animation of _PARAM0_ is paused"),
                   _("Animations and images"),
                   "res/conditions/animation24.png",
                   "res/conditions/animation.png")
      .AddParameter("object", _("Object"))
      .AddParameter("behavior", _("Behavior"), "AnimatableBehavior")
      .MarkAsSimple();

  aut.AddScopedCondition("HasAnimationEnded",
                   _("Animation finished"),
                   _("Check if the animation being played by the Sprite object "
                     "is finished."),
                   _("The animation of _PARAM0_ is finished"),
                   _("Animations and images"),
                   "res/conditions/animation24.png",
                   "res/conditions/animation.png")
      .AddParameter("object", _("Object"))
      .AddParameter("behavior", _("Behavior"), "AnimatableBehavior")
      .MarkAsSimple();

  aut.AddExpressionAndConditionAndAction(
         "number",
         "ElapsedTime",
         _("Animation elapsed time"),
         _("the elapsed time from the beginning of the animation (in seconds)"),
         _("the animation elapsed time"),
         _("Animations and images"),
         "res/actions/animation24.png")
      .AddParameter("object", _("Object"))
      .AddParameter("behavior", _("Behavior"), "AnimatableBehavior")
      .UseStandardParameters(
          "number", gd::ParameterOptions::MakeNewOptions().SetDescription(
                        _("Elapsed time (in seconds)")))
      .MarkAsAdvanced();
  aut.GetAllExpressions()["ElapsedTime"].SetGroup("");

  aut.AddExpression(
         "Duration",
         _("Animation duration"),
         _("Return the current animation duration (in seconds)."),
         _("Animations and images"),
         "res/actions/animation24.png")
      .AddParameter("object", _("Object"))
      .AddParameter("behavior", _("Behavior"), "AnimatableBehavior");
}

}  // namespace gd
