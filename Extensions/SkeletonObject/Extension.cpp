
/**
GDevelop - Skeleton Object Extension
Copyright (c) 2017-2018 Franco Maciel (francomaciel10@gmail.com)
This project is released under the MIT License.
*/

#include "GDCore/Extensions/PlatformExtension.h"
#include "GDCore/Tools/Localization.h"

#include "SkeletonObject.h"

void DeclareSkeletonObjectExtension(gd::PlatformExtension& extension) {
  extension
      .SetExtensionInformation("SkeletonObject",
                               _("Skeleton"),
                               _("Enables the use of animated skeleton objects "
                                 "made with DragonBones."),
                               "Franco Maciel",
                               "Open source (MIT License)")
      .SetExtensionHelpPath("/objects/skeleton");

  gd::ObjectMetadata& obj = extension.AddObject<SkeletonObject>(
      "Skeleton",
      _("Skeleton"),
      _("Object displayed using skeletal animation, powered by DragonBones. "
        "This object is experimental and searching for a maintainer."),
      "JsPlatform/Extensions/skeletonicon.png");

  // Object instructions
  obj.AddCondition("ScaleX",
                   _("Scale X"),
                   _("Check the object scale X."),
                   _("the current scale X"),
                   _("Size"),
                   "JsPlatform/Extensions/skeletonicon24.png",
                   "JsPlatform/Extensions/skeletonicon16.png")
      .AddParameter("object", _("Object"), "Skeleton")
      .UseStandardRelationalOperatorParameters("number");

  obj.AddAction("SetScaleX",
                _("Scale X"),
                _("Change the object scale X."),
                _("Set _PARAM0_ scale X _PARAM1__PARAM2_"),
                _("Size"),
                "JsPlatform/Extensions/skeletonicon24.png",
                "JsPlatform/Extensions/skeletonicon16.png")
      .AddParameter("object", _("Object"), "Skeleton")
      .UseStandardOperatorParameters("number");

  obj.AddExpression("ScaleX",
                    _("Scale X"),
                    _("Object scale X"),
                    _("Size"),
                    "JsPlatform/Extensions/skeletonicon16.png")
      .AddParameter("object", _("Object"), "Skeleton");

  obj.AddCondition("ScaleY",
                   _("Scale Y"),
                   _("Check the object scale Y."),
                   _("the current scale Y"),
                   _("Size"),
                   "JsPlatform/Extensions/skeletonicon24.png",
                   "JsPlatform/Extensions/skeletonicon16.png")
      .AddParameter("object", _("Object"), "Skeleton")
      .UseStandardRelationalOperatorParameters("number");

  obj.AddAction("SetScaleY",
                _("Scale Y"),
                _("Change the object scale Y."),
                _("Set _PARAM0_ scale Y _PARAM1__PARAM2_"),
                _("Size"),
                "JsPlatform/Extensions/skeletonicon24.png",
                "JsPlatform/Extensions/skeletonicon16.png")
      .AddParameter("object", _("Object"), "Skeleton")
      .UseStandardOperatorParameters("number");

  obj.AddExpression("ScaleY",
                    _("Scale Y"),
                    _("Object scale Y"),
                    _("Size"),
                    "JsPlatform/Extensions/skeletonicon16.png")
      .AddParameter("object", _("Object"), "Skeleton");

  obj.AddCondition("Width",
                   _("Width"),
                   _("Check the object width."),
                   _("the current width"),
                   _("Size"),
                   "JsPlatform/Extensions/skeletonicon24.png",
                   "JsPlatform/Extensions/skeletonicon16.png")
      .AddParameter("object", _("Object"), "Skeleton")
      .UseStandardRelationalOperatorParameters("number");

  obj.AddAction("SetWidth",
                _("Width"),
                _("Change the object width."),
                _("Set _PARAM0_ width _PARAM1__PARAM2_"),
                _("Size"),
                "JsPlatform/Extensions/skeletonicon24.png",
                "JsPlatform/Extensions/skeletonicon16.png")
      .AddParameter("object", _("Object"), "Skeleton")
      .UseStandardOperatorParameters("number");

  obj.AddExpression("Width",
                    _("Width"),
                    _("Object width"),
                    _("Size"),
                    "JsPlatform/Extensions/skeletonicon16.png")
      .AddParameter("object", _("Object"), "Skeleton");

  obj.AddCondition("Height",
                   _("Height"),
                   _("Check the object height."),
                   _("the current height"),
                   _("Size"),
                   "JsPlatform/Extensions/skeletonicon24.png",
                   "JsPlatform/Extensions/skeletonicon16.png")
      .AddParameter("object", _("Object"), "Skeleton")
      .UseStandardRelationalOperatorParameters("number");

  obj.AddAction("SetHeight",
                _("Height"),
                _("Change the object height."),
                _("Set _PARAM0_ height _PARAM1__PARAM2_"),
                _("Size"),
                "JsPlatform/Extensions/skeletonicon24.png",
                "JsPlatform/Extensions/skeletonicon16.png")
      .AddParameter("object", _("Object"), "Skeleton")
      .UseStandardOperatorParameters("number");

  obj.AddExpression("Height",
                    _("Height"),
                    _("Object height"),
                    _("Size"),
                    "JsPlatform/Extensions/skeletonicon16.png")
      .AddParameter("object", _("Object"), "Skeleton");

  obj.AddAction("SetDefaultHitbox",
                _("Default hitbox"),
                _("Change the object default hitbox to be used by other "
                  "conditions and behaviors."),
                _("Set _PARAM0_ default hitbox to _PARAM1_"),
                _("Size"),
                "JsPlatform/Extensions/skeletonicon24.png",
                "JsPlatform/Extensions/skeletonicon16.png")
      .AddParameter("object", _("Object"), "Skeleton")
      .AddParameter("string", _("Slot path"))
      .SetDefaultValue("\"\"");

  // Animation instructions
  obj.AddCondition("AnimationPaused",
                   _("Paused"),
                   _("Test if the animation for the skeleton is paused"),
                   _("Animation of _PARAM0_ is paused"),
                   _("Animation"),
                   "JsPlatform/Extensions/skeletonanimationicon24.png",
                   "JsPlatform/Extensions/skeletonanimationicon16.png")
      .AddParameter("object", _("Object"), "Skeleton");

  obj.AddAction("PauseAnimation",
                _("Pause"),
                _("Pauses animation for the skeleton"),
                _("Pause animation for _PARAM0_"),
                _("Animation"),
                "JsPlatform/Extensions/skeletonanimationicon24.png",
                "JsPlatform/Extensions/skeletonanimationicon16.png")
      .AddParameter("object", _("Object"), "Skeleton")
      .AddCodeOnlyParameter("yesorno", "")
      .SetDefaultValue("true");

  obj.AddAction("UnpauseAnimation",
                _("Unpause"),
                _("Unpauses animation for the skeleton"),
                _("Unpause animation for _PARAM0_"),
                _("Animation"),
                "JsPlatform/Extensions/skeletonanimationicon24.png",
                "JsPlatform/Extensions/skeletonanimationicon16.png")
      .AddParameter("object", _("Object"), "Skeleton")
      .AddCodeOnlyParameter("yesorno", "")
      .SetDefaultValue("false");

  obj.AddCondition("AnimationFinished",
                   _("Finished"),
                   _("Test if the animation has finished on this frame"),
                   _("Animation of _PARAM0_ has finished"),
                   _("Animation"),
                   "JsPlatform/Extensions/skeletonanimationicon24.png",
                   "JsPlatform/Extensions/skeletonanimationicon16.png")
      .AddParameter("object", _("Object"), "Skeleton");

  obj.AddCondition("AnimationTime",
                   _("Current time"),
                   _("Check the current animation elapsed time."),
                   _("the current animation time"),
                   _("Animation"),
                   "JsPlatform/Extensions/skeletonanimationicon24.png",
                   "JsPlatform/Extensions/skeletonanimationicon16.png")
      .AddParameter("object", _("Object"), "Skeleton")
      .UseStandardRelationalOperatorParameters("number");

  obj.AddAction("SetAnimationTime",
                _("Current time"),
                _("Change the current animation elapsed time."),
                _("Set _PARAM0_ current animation time _PARAM1__PARAM2_"),
                _("Animation"),
                "JsPlatform/Extensions/skeletonanimationicon24.png",
                "JsPlatform/Extensions/skeletonanimationicon16.png")
      .AddParameter("object", _("Object"), "Skeleton")
      .UseStandardOperatorParameters("number");

  obj.AddExpression("AnimationTime",
                    _("Current time"),
                    _("Current animation elapsed time"),
                    _("Animation"),
                    "JsPlatform/Extensions/skeletonanimationicon16.png")
      .AddParameter("object", _("Object"), "Skeleton");

  obj.AddExpression("AnimationTimeLength",
                    _("Animation time length"),
                    _("Current animation time length"),
                    _("Animation"),
                    "JsPlatform/Extensions/skeletonanimationicon16.png")
      .AddParameter("object", _("Object"), "Skeleton");

  obj.AddCondition(
         "AnimationFrame",
         _("Current frame"),
         _("Check the current animation frame.\nIf the animation is set as "
           "smooth, a float can be (and probably will be) returned."),
         _("the current animation frame"),
         _("Animation"),
         "JsPlatform/Extensions/skeletonanimationicon24.png",
         "JsPlatform/Extensions/skeletonanimationicon16.png")
      .AddParameter("object", _("Object"), "Skeleton")
      .UseStandardRelationalOperatorParameters("number");

  obj.AddAction("SetAnimationFrame",
                _("Current frame"),
                _("Change the current animation frame"),
                _("Set _PARAM0_ current animation frame _PARAM1__PARAM2_"),
                _("Animation"),
                "JsPlatform/Extensions/skeletonanimationicon24.png",
                "JsPlatform/Extensions/skeletonanimationicon16.png")
      .AddParameter("object", _("Object"), "Skeleton")
      .UseStandardRelationalOperatorParameters("number");

  obj.AddExpression("AnimationFrame",
                    _("Current frame"),
                    _("Current animation frame"),
                    _("Animation"),
                    "JsPlatform/Extensions/skeletonanimationicon16.png")
      .AddParameter("object", _("Object"), "Skeleton");

  obj.AddExpression("AnimationFrameLength",
                    _("Animation frame length"),
                    _("Current animation frame length"),
                    _("Animation"),
                    "JsPlatform/Extensions/skeletonanimationicon16.png")
      .AddParameter("object", _("Object"), "Skeleton");

  obj.AddCondition("AnimationIndex",
                   _("Animation index"),
                   _("Check the current animation index.\nIf not sure about "
                     "the index, you can use the \"by name\" action"),
                   _("the current animation"),
                   _("Animation"),
                   "JsPlatform/Extensions/skeletonanimationicon24.png",
                   "JsPlatform/Extensions/skeletonanimationicon16.png")
      .AddParameter("object", _("Object"), "Skeleton")
      .UseStandardRelationalOperatorParameters("number");

  obj.AddAction(
         "SetAnimationIndex",
         _("Animation index"),
         _("Change the current animation from the animation index.\nIf not "
           "sure about the index, you can use the \"by name\" action"),
         _("Set _PARAM0_ animation _PARAM1__PARAM2_"),
         _("Animation"),
         "JsPlatform/Extensions/skeletonanimationicon24.png",
         "JsPlatform/Extensions/skeletonanimationicon16.png")
      .AddParameter("object", _("Object"), "Skeleton")
      .UseStandardOperatorParameters("number")
      .AddParameter(
          "expression", _("Blend time (0 for automatic blending)"), "", true)
      .SetDefaultValue("0")
      .AddParameter("expression", _("Loops (0 for infinite loops)"), "", true)
      .SetDefaultValue("-1");

  obj.AddExpression("AnimationIndex",
                    _("Animation index"),
                    _("Current animation index"),
                    _("Animation"),
                    "JsPlatform/Extensions/skeletonanimationicon16.png")
      .AddParameter("object", _("Object"), "Skeleton");

  obj.AddCondition("AnimationName",
                   _("Animation name"),
                   _("Check the current animation name."),
                   _("the current animation"),
                   _("Animation"),
                   "JsPlatform/Extensions/skeletonanimationicon24.png",
                   "JsPlatform/Extensions/skeletonanimationicon16.png")
      .AddParameter("object", _("Object"), "Skeleton")
      .UseStandardRelationalOperatorParameters("string");

  obj.AddAction("SetAnimationName",
                _("Animation name"),
                _("Change the current animation from the animation name."),
                _("Set _PARAM0_ animation to _PARAM1_"),
                _("Animation"),
                "JsPlatform/Extensions/skeletonanimationicon24.png",
                "JsPlatform/Extensions/skeletonanimationicon16.png")
      .AddParameter("object", _("Object"), "Skeleton")
      .AddParameter("string", _("Text"))
      .AddParameter(
          "expression", _("Blend time (0 for automatic blending)"), "", true)
      .SetDefaultValue("0")
      .AddParameter("expression", _("Loops (0 for infinite loops)"), "", true)
      .SetDefaultValue("-1");

  obj.AddStrExpression("AnimationName",
                       _("Animation name"),
                       _("Current animation name"),
                       _("Animation"),
                       "JsPlatform/Extensions/skeletonanimationicon16.png")
      .AddParameter("object", _("Object"), "Skeleton");

  obj.AddCondition("AnimationSmooth",
                   _("Smooth"),
                   _("Check if the object animation interpolator is smooth."),
                   _("Animation mode of _PARAM0_ is smooth"),
                   _("Animation"),
                   "JsPlatform/Extensions/skeletonanimationicon24.png",
                   "JsPlatform/Extensions/skeletonanimationicon16.png")
      .AddParameter("object", _("Object"), "Skeleton");

  obj.AddAction("SetAnimationSmooth",
                _("Smooth"),
                _("Change the object animation interpolator."),
                _("Set animation mode of _PARAM0_ as smooth: _PARAM1_"),
                _("Animation"),
                "JsPlatform/Extensions/skeletonanimationicon24.png",
                "JsPlatform/Extensions/skeletonanimationicon16.png")
      .AddParameter("object", _("Object"), "Skeleton")
      .AddParameter("yesorno", _("Smooth"));

  obj.AddCondition("AnimationTimeScale",
                   _("Time scale"),
                   _("Check the animation time scale."),
                   _("the animation time scale"),
                   _("Animation"),
                   "JsPlatform/Extensions/skeletonanimationicon24.png",
                   "JsPlatform/Extensions/skeletonanimationicon16.png")
      .AddParameter("object", _("Object"), "Skeleton")
      .UseStandardRelationalOperatorParameters("number");

  obj.AddAction("SetAnimationTimeScale",
                _("Time scale"),
                _("Change the animation time scale"),
                _("Set _PARAM0_ animation time scale _PARAM1__PARAM2_"),
                _("Animation"),
                "JsPlatform/Extensions/skeletonanimationicon24.png",
                "JsPlatform/Extensions/skeletonanimationicon16.png")
      .AddParameter("object", _("Object"), "Skeleton")
      .UseStandardOperatorParameters("number");

  obj.AddExpression("AnimationTimeScale",
                    _("Time scale"),
                    _("Animation time scale"),
                    _("Animation"),
                    "JsPlatform/Extensions/skeletonanimationicon16.png")
      .AddParameter("object", _("Object"), "Skeleton");

  obj.AddAction("ResetAnimation",
                _("Reset"),
                _("Reset current animation"),
                _("Reset _PARAM0_ current animation"),
                _("Animation"),
                "JsPlatform/Extensions/skeletonanimationicon24.png",
                "JsPlatform/Extensions/skeletonanimationicon16.png")
      .AddParameter("object", _("Object"), "Skeleton");

  // Bone instructions
  obj.AddCondition(
         "BonePositionX",
         _("Position X"),
         _("Check the bone position X."),
         _("the current position X :_PARAM1_"),
         _("Bone"),
         "JsPlatform/Extensions/skeletonboneicon24.png",
         "JsPlatform/Extensions/skeletonboneicon16.png")
      .AddParameter("object", _("Object"), "Skeleton")
      .AddParameter("string", _("Bone path"))
      .SetDefaultValue("\"\"")
      .UseStandardRelationalOperatorParameters("number");

  obj.AddAction("SetBonePositionX",
                _("Position X"),
                _("Change the bone position X."),
                _("Set _PARAM0_:_PARAM1_ position X _PARAM2__PARAM3_"),
                _("Bone"),
                "JsPlatform/Extensions/skeletonboneicon24.png",
                "JsPlatform/Extensions/skeletonboneicon16.png")
      .AddParameter("object", _("Object"), "Skeleton")
      .AddParameter("string", _("Bone path"))
      .SetDefaultValue("\"\"")
      .UseStandardOperatorParameters("number");

  obj.AddExpression("BonePositionX",
                    _("Position X"),
                    _("Bone position X"),
                    _("Bone"),
                    "JsPlatform/Extensions/skeletonboneicon16.png")
      .AddParameter("object", _("Object"), "Skeleton")
      .AddParameter("string", _("Bone path"))
      .SetDefaultValue("\"\"");

  obj.AddCondition(
         "BonePositionY",
         _("Position Y"),
         _("Check the bone position Y."),
         _("the current position Y :_PARAM1_"),
         _("Bone"),
         "JsPlatform/Extensions/skeletonboneicon24.png",
         "JsPlatform/Extensions/skeletonboneicon16.png")
      .AddParameter("object", _("Object"), "Skeleton")
      .AddParameter("string", _("Bone path"))
      .SetDefaultValue("\"\"")
      .UseStandardRelationalOperatorParameters("number");

  obj.AddAction("SetBonePositionY",
                _("Position Y"),
                _("Change the bone position Y."),
                _("Set _PARAM0_:_PARAM1_ position Y _PARAM2__PARAM3_"),
                _("Bone"),
                "JsPlatform/Extensions/skeletonboneicon24.png",
                "JsPlatform/Extensions/skeletonboneicon16.png")
      .AddParameter("object", _("Object"), "Skeleton")
      .AddParameter("string", _("Bone path"))
      .SetDefaultValue("\"\"")
      .UseStandardOperatorParameters("number");

  obj.AddExpression("BonePositionY",
                    _("Position Y"),
                    _("Bone position Y"),
                    _("Bone"),
                    "JsPlatform/Extensions/skeletonboneicon16.png")
      .AddParameter("object", _("Object"), "Skeleton")
      .AddParameter("string", _("Bone path"))
      .SetDefaultValue("\"\"");

  obj.AddAction("SetBonePosition",
                _("Position"),
                _("Change the bone position."),
                _("Set _PARAM0_:_PARAM1_ position X _PARAM2__PARAM3_; Y "
                  "_PARAM4__PARAM5_"),
                _("Bone"),
                "JsPlatform/Extensions/skeletonboneicon24.png",
                "JsPlatform/Extensions/skeletonboneicon16.png")
      .AddParameter("object", _("Object"), "Skeleton")
      .AddParameter("string", _("Bone path"))
      .SetDefaultValue("\"\"")
      .AddParameter("operator", _("Modification's sign"))
      .AddParameter("expression", _("Position X"))
      .UseStandardOperatorParameters("number");

  obj.AddCondition("BoneAngle",
                   _("Angle"),
                   _("Check the bone angle (in degrees)."),
                   _("the current angle :_PARAM1_"),
                   _("Bone"),
                   "JsPlatform/Extensions/skeletonboneicon24.png",
                   "JsPlatform/Extensions/skeletonboneicon16.png")
      .AddParameter("object", _("Object"), "Skeleton")
      .AddParameter("string", _("Bone path"))
      .SetDefaultValue("\"\"")
      .AddParameter("relationalOperator", _("Sign of the test"))
      .AddParameter("expression", _("Value"));

  obj.AddAction("SetBoneAngle",
                _("Angle"),
                _("Change the bone angle (in degrees)."),
                _("Set _PARAM0_:_PARAM1_ angle _PARAM2__PARAM3_"),
                _("Bone"),
                "JsPlatform/Extensions/skeletonboneicon24.png",
                "JsPlatform/Extensions/skeletonboneicon16.png")
      .AddParameter("object", _("Object"), "Skeleton")
      .AddParameter("string", _("Bone path"))
      .SetDefaultValue("\"\"")
      .UseStandardOperatorParameters("number");

  obj.AddExpression("BoneAngle",
                    _("Angle"),
                    _("Slot angle (in degrees)"),
                    _("Bone"),
                    "JsPlatform/Extensions/skeletonboneicon16.png")
      .AddParameter("object", _("Object"), "Skeleton")
      .AddParameter("string", _("Bone path"))
      .SetDefaultValue("\"\"");

  obj.AddCondition(
         "BoneScaleX",
         _("Scale X"),
         _("Check the bone scale X."),
         _("the current scale X :_PARAM1_"),
         _("Bone"),
         "JsPlatform/Extensions/skeletonboneicon24.png",
         "JsPlatform/Extensions/skeletonboneicon16.png")
      .AddParameter("object", _("Object"), "Skeleton")
      .AddParameter("string", _("Bone path"))
      .SetDefaultValue("\"\"")
      .UseStandardRelationalOperatorParameters("number");

  obj.AddAction("SetBoneScaleX",
                _("Scale X"),
                _("Change the bone scale X."),
                _("Set _PARAM0_:_PARAM1_ scale X _PARAM2__PARAM3_"),
                _("Bone"),
                "JsPlatform/Extensions/skeletonboneicon24.png",
                "JsPlatform/Extensions/skeletonboneicon16.png")
      .AddParameter("object", _("Object"), "Skeleton")
      .AddParameter("string", _("Bone path"))
      .SetDefaultValue("\"\"")
      .UseStandardOperatorParameters("number");

  obj.AddExpression("BoneScaleX",
                    _("Scale X"),
                    _("Slot scale X"),
                    _("Bone"),
                    "JsPlatform/Extensions/skeletonboneicon16.png")
      .AddParameter("object", _("Object"), "Skeleton")
      .AddParameter("string", _("Bone path"))
      .SetDefaultValue("\"\"");

  obj.AddCondition(
         "BoneScaleY",
         _("Scale Y"),
         _("Check the bone scale Y."),
         _("the current scale Y :_PARAM1_"),
         _("Bone"),
         "JsPlatform/Extensions/skeletonboneicon24.png",
         "JsPlatform/Extensions/skeletonboneicon16.png")
      .AddParameter("object", _("Object"), "Skeleton")
      .AddParameter("string", _("Bone path"))
      .SetDefaultValue("\"\"")
      .UseStandardRelationalOperatorParameters("number");

  obj.AddAction("SetBoneScaleY",
                _("Scale Y"),
                _("Change the bone scale Y."),
                _("Set _PARAM0_:_PARAM1_ scale Y _PARAM2__PARAM3_"),
                _("Bone"),
                "JsPlatform/Extensions/skeletonboneicon24.png",
                "JsPlatform/Extensions/skeletonboneicon16.png")
      .AddParameter("object", _("Object"), "Skeleton")
      .AddParameter("string", _("Bone path"))
      .SetDefaultValue("\"\"")
      .UseStandardOperatorParameters("number");

  obj.AddExpression("BoneScaleY",
                    _("Scale Y"),
                    _("Slot scale Y"),
                    _("Bone"),
                    "JsPlatform/Extensions/skeletonboneicon16.png")
      .AddParameter("object", _("Object"), "Skeleton")
      .AddParameter("string", _("Bone path"))
      .SetDefaultValue("\"\"");

  obj.AddAction("SetBoneScale",
                _("Scale"),
                _("Change the bone scale."),
                _("Set _PARAM0_:_PARAM1_ scale X _PARAM2__PARAM3_; Y "
                  "_PARAM4__PARAM5_"),
                _("Bone"),
                "JsPlatform/Extensions/skeletonboneicon24.png",
                "JsPlatform/Extensions/skeletonboneicon16.png")
      .AddParameter("object", _("Object"), "Skeleton")
      .AddParameter("string", _("Bone path"))
      .SetDefaultValue("\"\"")
      .AddParameter("operator", _("Modification's sign"))
      .AddParameter("expression", _("Scale X"))
      .AddParameter("operator", _("Modification's sign"))
      .AddParameter("expression", _("Scale Y"));

  obj.AddAction("ResetBone",
                _("Reset"),
                _("Reset the bone transformation."),
                _("Reset _PARAM0_:_PARAM1_ transformation"),
                _("Bone"),
                "JsPlatform/Extensions/skeletonboneicon24.png",
                "JsPlatform/Extensions/skeletonboneicon16.png")
      .AddParameter("object", _("Object"), "Skeleton")
      .AddParameter("string", _("Bone path"))
      .SetDefaultValue("\"\"");

  // Slot instructions
  obj.AddAction("SetSlotColor",
                _("Color"),
                _("Change the slot color."),
                _("Set _PARAM0_:_PARAM1_ color to _PARAM2_"),
                _("Slot"),
                "JsPlatform/Extensions/skeletonsloticon24.png",
                "JsPlatform/Extensions/skeletonsloticon16.png")
      .AddParameter("object", _("Object"), "Skeleton")
      .AddParameter("string", _("Sloth path"))
      .SetDefaultValue("\"\"")
      .AddParameter("color", _("Color"));

  obj.AddCondition("SlotVisible",
                   _("Visible"),
                   _("Check the slot visibility."),
                   _("_PARAM0_:_PARAM1_ is visible"),
                   _("Slot"),
                   "JsPlatform/Extensions/skeletonsloticon24.png",
                   "JsPlatform/Extensions/skeletonsloticon16.png")
      .AddParameter("object", _("Object"), "Skeleton")
      .AddParameter("string", _("Slot path"))
      .SetDefaultValue("\"\"");

  obj.AddAction("ShowSlot",
                _("Show"),
                _("Show the slot, making it visible."),
                _("Show _PARAM0_:_PARAM1_"),
                _("Slot"),
                "JsPlatform/Extensions/skeletonsloticon24.png",
                "JsPlatform/Extensions/skeletonsloticon16.png")
      .AddParameter("object", _("Object"), "Skeleton")
      .AddParameter("string", _("Slot path"))
      .SetDefaultValue("\"\"")
      .AddCodeOnlyParameter("yesorno", "")
      .SetDefaultValue("true");

  obj.AddAction("HideSlot",
                _("Hide"),
                _("Hide the slot, making it invisible."),
                _("Hide _PARAM0_:_PARAM1_"),
                _("Slot"),
                "JsPlatform/Extensions/skeletonsloticon24.png",
                "JsPlatform/Extensions/skeletonsloticon16.png")
      .AddParameter("object", _("Object"), "Skeleton")
      .AddParameter("string", _("Slot path"))
      .SetDefaultValue("\"\"")
      .AddCodeOnlyParameter("yesorno", "")
      .SetDefaultValue("false");

  obj.AddCondition("SlotZOrder",
                   _("Z-order"),
                   _("Check the slot Z-order."),
                   _("the z-order :_PARAM1_"),
                   _("Slot"),
                   "JsPlatform/Extensions/skeletonsloticon24.png",
                   "JsPlatform/Extensions/skeletonsloticon16.png")
      .AddParameter("object", _("Object"), "Skeleton")
      .AddParameter("string", _("Slot path"))
      .SetDefaultValue("\"\"")
      .UseStandardRelationalOperatorParameters("number");

  obj.AddAction("SetSlotZOrder",
                _("Z-order"),
                _("Change the slot Z-order."),
                _("Set _PARAM0_:_PARAM1_ Z-order _PARAM2__PARAM3_"),
                _("Slot"),
                "JsPlatform/Extensions/skeletonsloticon24.png",
                "JsPlatform/Extensions/skeletonsloticon16.png")
      .AddParameter("object", _("Object"), "Skeleton")
      .AddParameter("string", _("Slot path"))
      .SetDefaultValue("\"\"")
      .UseStandardOperatorParameters("number");

  obj.AddExpression("SlotZOrder",
                    _("Z-order"),
                    _("Slot Z-order"),
                    _("Slot"),
                    "JsPlatform/Extensions/skeletonsloticon16.png")
      .AddParameter("object", _("Object"), "Skeleton")
      .AddParameter("string", _("Sloth path"))
      .SetDefaultValue("\"\"");

  obj.AddCondition("PointInsideSlot",
                   _("Point inside slot"),
                   _("Check if the point is inside the slot"),
                   _("The point _PARAM2_;_PARAM3_ is inside _PARAM0_:_PARAM1_"),
                   _("Collision"),
                   "res/conditions/collisionPoint24.png",
                   "res/conditions/collisionPoint.png")
      .AddParameter("object", _("Object"), "Skeleton")
      .AddParameter("string", _("Sloth path"))
      .SetDefaultValue("\"\"")
      .AddParameter("expression", _("Point X"))
      .AddParameter("expression", _("Point Y"));

  // Extension instructions
  extension
      .AddCondition("SlotCollidesWithObject",
                    _("Slot collides with object"),
                    _("Check if the slot collides with an object"),
                    _("_PARAM0_:_PARAM1_ collides with _PARAM2_"),
                    _("Collision"),
                    "res/conditions/collision24.png",
                    "res/conditions/collision.png")
      .AddParameter("objectList", _("Skeleton"), "Skeleton")
      .AddParameter("string", _("Sloth path"))
      .SetDefaultValue("\"\"")
      .AddParameter("objectList", _("Object"))
      .AddCodeOnlyParameter("conditionInverted", "");

  extension
      .AddCondition("SlotCollidesWithSlot",
                    _("Slot collides with slot"),
                    _("Check if the slot collides with another skeleton slot"),
                    _("_PARAM0_:_PARAM1_ collides with _PARAM2_:_PARAM3_"),
                    _("Collision"),
                    "res/conditions/collision24.png",
                    "res/conditions/collision.png")
      .AddParameter("objectList", _("Skeleton"), "Skeleton")
      .AddParameter("string", _("Sloth path"))
      .SetDefaultValue("\"\"")
      .AddParameter("objectList", _("Other skeleton"), "Skeleton")
      .AddParameter("string", _("Sloth path"))
      .SetDefaultValue("\"\"")
      .AddCodeOnlyParameter("conditionInverted", "");

  extension
      .AddCondition(
          "RaycastSlot",
          _("Raycast slot"),
          _("Same as Raycast, but intersects specific slots instead."),
          _("Raycast _PARAM0_:_PARAM1_ from _PARAM2_;_PARAM3_"),
          _("Collision"),
          "res/conditions/collision24.png",
          "res/conditions/collision.png")
      .AddParameter(
          "objectList", _("Skeleton to test against the ray"), "Skeleton")
      .AddParameter("string", _("Sloth path"))
      .SetDefaultValue("\"\"")
      .AddParameter("expression", _("Ray source X position"))
      .AddParameter("expression", _("Ray source Y position"))
      .AddParameter("expression", _("Ray angle (in degrees)"))
      .AddParameter("expression", _("Ray maximum distance (in pixels)"))
      .AddParameter(
          "scenevar",
          _("Scene variable where to store the X position of the intersection"))
      .AddParameter(
          "scenevar",
          _("Scene variable where to store the Y position of the intersection"))
      .AddCodeOnlyParameter("conditionInverted", "")
      .MarkAsAdvanced();
}
