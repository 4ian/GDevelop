
/**
GDevelop - Skeleton Object Extension
Copyright (c) 2017-2018 Franco Maciel (francomaciel10@gmail.com)
This project is released under the MIT License.
*/

#include "GDCore/Extensions/PlatformExtension.h"
#include "GDCore/Tools/Localization.h"

#include "SkeletonObject.h"

void DeclareSkeletonObjectExtension(gd::PlatformExtension & extension)
{
    extension.SetExtensionInformation("SkeletonObject",
                          _("Skeleton"),
                          _("Enables the use of animated skeleton objects.\nCurrently supported formats:\n    *DragonBones"),
                          "Franco Maciel",
                          "Open source (MIT License)");

    gd::ObjectMetadata & obj = extension.AddObject<SkeletonObject>(
               "Skeleton",
               _("Skeleton"),
               _("Object animated through bones"),
               "JsPlatform/Extensions/skeletonicon.png");

    #if !defined(GD_NO_WX_GUI)
    SkeletonObject::LoadEdittimeIcon();
    #endif

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
        .AddParameter("object", _("Object"), "Skeleton");

    obj.AddAction("UnpauseAnimation",
        _("Unpause"),
        _("Unpauses animation for the skeleton"),
        _("Unpause animation for _PARAM0_"),
        _("Animation"),
        "JsPlatform/Extensions/skeletonanimationicon24.png",
        "JsPlatform/Extensions/skeletonanimationicon16.png")
        .AddParameter("object", _("Object"), "Skeleton");

    obj.AddExpression("AnimationPlaying", _("Playing"), _("Current animation playing (0: paused, 1: playing)"), _("Animation"), "JsPlatform/Extensions/skeletonanimationicon16.png")
        .AddParameter("object", _("Object"), "Skeleton");

    obj.AddCondition("AnimationFinished",
        _("Finished"),
        _("Test if the animation has finished this frame"),
        _("Animation of _PARAM0_ has finished"),
        _("Animation"),
        "JsPlatform/Extensions/skeletonanimationicon24.png",
        "JsPlatform/Extensions/skeletonanimationicon16.png")
        .AddParameter("object", _("Object"), "Skeleton");

    obj.AddCondition("AnimationTime",
        _("Current time"),
        _("Check the current animation elapsed time."),
        _("Current animation time of _PARAM0_ is _PARAM1_ _PARAM2_"),
        _("Animation"),
        "JsPlatform/Extensions/skeletonanimationicon24.png",
        "JsPlatform/Extensions/skeletonanimationicon16.png")
        .AddParameter("object", _("Object"), "Skeleton")
        .AddParameter("relationalOperator", _("Sign of the test"))
        .AddParameter("expression", _("Value"))
        .SetManipulatedType("number");

    obj.AddExpression("AnimationTime", _("Current time"), _("Current animation elapsed time"), _("Animation"), "JsPlatform/Extensions/skeletonanimationicon16.png")
        .AddParameter("object", _("Object"), "Skeleton");

    obj.AddExpression("AnimationTimeLenght", _("Animation time length"), _("Current animation time length"), _("Animation"), "JsPlatform/Extensions/skeletonanimationicon16.png")
        .AddParameter("object", _("Object"), "Skeleton");

    obj.AddCondition("AnimationFrame",
        _("Current frame"),
        _("Check the current animation frame.\nIf the animation is set as smooth, a float can be (and probably will be) returned."),
        _("Current animation frame of _PARAM0_ is _PARAM1_ _PARAM2_"),
        _("Animation"),
        "JsPlatform/Extensions/skeletonanimationicon24.png",
        "JsPlatform/Extensions/skeletonanimationicon16.png")
        .AddParameter("object", _("Object"), "Skeleton")
        .AddParameter("relationalOperator", _("Sign of the test"))
        .AddParameter("expression", _("Value"))
        .SetManipulatedType("number");

    obj.AddExpression("AnimationFrame", _("Current frame"), _("Current animation frame"), _("Animation"), "JsPlatform/Extensions/skeletonanimationicon16.png")
        .AddParameter("object", _("Object"), "Skeleton");

    obj.AddExpression("AnimationFrameLenght", _("Animation frame length"), _("Current animation frame length"), _("Animation"), "JsPlatform/Extensions/skeletonanimationicon16.png")
        .AddParameter("object", _("Object"), "Skeleton");

    obj.AddCondition("CurrentAnimation",
        _("Animation index"),
        _("Check the current animation index.\nIf not sure about the index, you can use the \"by name\" action"),
        _("Set the animation of _PARAM0_ to _PARAM1_"),
        _("Animation"),
        "JsPlatform/Extensions/skeletonanimationicon24.png",
        "JsPlatform/Extensions/skeletonanimationicon16.png")
        .AddParameter("object", _("Object"), "Skeleton")
        .AddParameter("relationalOperator", _("Sign of the test"))
        .AddParameter("expression", _("Value"))
        .SetManipulatedType("number");

    obj.AddAction("SetAnimation",
        _("Animation index"),
        _("Change the current animation from the animation index.\nIf not sure about the index, you can use the \"by name\" action"),
        _("Set _PARAM0_ animation _PARAM1_ _PARAM2_"),
        _("Animation"),
        "JsPlatform/Extensions/skeletonanimationicon24.png",
        "JsPlatform/Extensions/skeletonanimationicon16.png")
        .AddParameter("object", _("Object"), "Skeleton")
        .AddParameter("operator", _("Modification's sign"))
        .AddParameter("expression", _("Value"))
        .AddParameter("expression", _("Blend time (0 for automatic blending)"), "", true).SetDefaultValue("0")
        .AddParameter("expression", _("Loops (0 for infinite loops)"), "", true).SetDefaultValue("-1");

    obj.AddExpression("CurrentAnimation", _("Current animation index"), _("Current animation index"), _("Animation"), "JsPlatform/Extensions/skeletonanimationicon16.png")
        .AddParameter("object", _("Object"), "Skeleton");

    obj.AddCondition("CurrentAnimationName",
        _("Animation name"),
        _("Check the current animation name."),
        _("The animation of _PARAM0_ is _PARAM1_ _PARAM2_"),
        _("Animation"),
        "JsPlatform/Extensions/skeletonanimationicon24.png",
        "JsPlatform/Extensions/skeletonanimationicon16.png")
        .AddParameter("object", _("Object"), "Skeleton")
        .AddParameter("relationalOperator", _("Sign of the test"))
        .AddParameter("string", _("Text"))
        .SetManipulatedType("string");

    obj.AddAction("SetAnimationName",
        _("Animation name"),
        _("Change the current animation from the animation name."),
        _("Set _PARAM0_ animation _PARAM1_ _PARAM2_"),
        _("Animation"),
        "JsPlatform/Extensions/skeletonanimationicon24.png",
        "JsPlatform/Extensions/skeletonanimationicon16.png")
        .AddParameter("object", _("Object"), "Skeleton")
        .AddParameter("operator", _("Modification's sign"))
        .AddParameter("string", _("Text"))
        .AddParameter("expression", _("Blend time (0 for automatic blending)"), "", true).SetDefaultValue("0")
        .AddParameter("expression", _("Loops (0 for infinite loops)"), "", true).SetDefaultValue("-1");

    obj.AddStrExpression("CurrentAnimationName", _("Current animation name"), _("Current animation name"), _("Animation"), "JsPlatform/Extensions/skeletonanimationicon16.png")
        .AddParameter("object", _("Object"), "Skeleton");

    obj.AddCondition("BonePositionX",
        _("Position X"),
        _("Check the bone position X."),
        _("Current position X of _PARAM0_:_PARAM1_ is _PARAM2_ _PARAM3_"),
        _("Bone"),
        "JsPlatform/Extensions/skeletonboneicon24.png",
        "JsPlatform/Extensions/skeletonboneicon16.png")
        .AddParameter("object", _("Object"), "Skeleton")
        .AddParameter("string", _("Bone path"))
        .AddParameter("relationalOperator", _("Sign of the test"))
        .AddParameter("expression", _("Value"))
        .SetManipulatedType("number");

    obj.AddAction("SetBonePositionX",
        _("Position X"),
        _("Change the bone position X."),
        _("Set _PARAM0_:_PARAM1_ position X _PARAM2_ _PARAM3_"),
        _("Bone"),
        "JsPlatform/Extensions/skeletonboneicon24.png",
        "JsPlatform/Extensions/skeletonboneicon16.png")
        .AddParameter("object", _("Object"), "Skeleton")
        .AddParameter("string", _("Bone path"))
        .AddParameter("operator", _("Modification's sign"))
        .AddParameter("expression", _("Value"))
        .SetManipulatedType("number");

    obj.AddExpression("BonePositionX", _("Position X"), _("Bone position X"), _("Bone"), "JsPlatform/Extensions/skeletonboneicon16.png")
        .AddParameter("object", _("Object"), "Skeleton")
        .AddParameter("string", _("Bone path"));

    obj.AddCondition("BonePositionY",
        _("Position Y"),
        _("Check the bone position Y."),
        _("Current position Y of _PARAM0_:_PARAM1_ is _PARAM2_ _PARAM3_"),
        _("Bone"),
        "JsPlatform/Extensions/skeletonboneicon24.png",
        "JsPlatform/Extensions/skeletonboneicon16.png")
        .AddParameter("object", _("Object"), "Skeleton")
        .AddParameter("string", _("Bone path"))
        .AddParameter("relationalOperator", _("Sign of the test"))
        .AddParameter("expression", _("Value"))
        .SetManipulatedType("number");

    obj.AddAction("SetBonePositionY",
        _("Position Y"),
        _("Change the bone position Y."),
        _("Set _PARAM0_:_PARAM1_ position Y _PARAM2_ _PARAM3_"),
        _("Bone"),
        "JsPlatform/Extensions/skeletonboneicon24.png",
        "JsPlatform/Extensions/skeletonboneicon16.png")
        .AddParameter("object", _("Object"), "Skeleton")
        .AddParameter("string", _("Bone path"))
        .AddParameter("operator", _("Modification's sign"))
        .AddParameter("expression", _("Value"))
        .SetManipulatedType("number");

    obj.AddExpression("BonePositionY", _("Position Y"), _("Bone position Y"), _("Bone"), "JsPlatform/Extensions/skeletonboneicon16.png")
        .AddParameter("object", _("Object"), "Skeleton")
        .AddParameter("string", _("Bone path"));

    obj.AddAction("SetBonePosition",
        _("Position"),
        _("Change the bone position."),
        _("Set _PARAM0_:_PARAM1_ position X _PARAM2_ _PARAM3_; Y _PARAM4_ _PARAM5_"),
        _("Bone"),
        "JsPlatform/Extensions/skeletonboneicon24.png",
        "JsPlatform/Extensions/skeletonboneicon16.png")
        .AddParameter("object", _("Object"), "Skeleton")
        .AddParameter("string", _("Bone path"))
        .AddParameter("operator", _("Modification's sign"))
        .AddParameter("expression", _("Position X"))
        .AddParameter("operator", _("Modification's sign"))
        .AddParameter("expression", _("Position Y"));

    obj.AddCondition("BoneAngle",
        _("Angle"),
        _("Check the bone angle (in degrees)."),
        _("Current angle of _PARAM0_:_PARAM1_ is _PARAM2_ _PARAM3_"),
        _("Bone"),
        "JsPlatform/Extensions/skeletonboneicon24.png",
        "JsPlatform/Extensions/skeletonboneicon16.png")
        .AddParameter("object", _("Object"), "Skeleton")
        .AddParameter("string", _("Bone path"))
        .AddParameter("relationalOperator", _("Sign of the test"))
        .AddParameter("expression", _("Value"))
        .SetManipulatedType("number");

    obj.AddAction("SetBoneAngle",
        _("Angle"),
        _("Change the bone angle (in degrees)."),
        _("Set _PARAM0_:_PARAM1_ angle _PARAM2_ _PARAM3_"),
        _("Bone"),
        "JsPlatform/Extensions/skeletonboneicon24.png",
        "JsPlatform/Extensions/skeletonboneicon16.png")
        .AddParameter("object", _("Object"), "Skeleton")
        .AddParameter("string", _("Bone path"))
        .AddParameter("operator", _("Modification's sign"))
        .AddParameter("expression", _("Value"))
        .SetManipulatedType("number");

    obj.AddExpression("BoneAngle", _("Angle"), _("Slot angle (in degrees)"), _("Bone"), "JsPlatform/Extensions/skeletonboneicon16.png")
        .AddParameter("object", _("Object"), "Skeleton")
        .AddParameter("string", _("Bone path"));

    obj.AddCondition("BoneScaleX",
        _("Scale X"),
        _("Check the bone scale X."),
        _("Current scale X of _PARAM0_:_PARAM1_ is _PARAM2_ _PARAM3_"),
        _("Bone"),
        "JsPlatform/Extensions/skeletonboneicon24.png",
        "JsPlatform/Extensions/skeletonboneicon16.png")
        .AddParameter("object", _("Object"), "Skeleton")
        .AddParameter("string", _("Bone path"))
        .AddParameter("relationalOperator", _("Sign of the test"))
        .AddParameter("expression", _("Value"))
        .SetManipulatedType("number");

    obj.AddAction("SetBoneScaleX",
        _("Scale X"),
        _("Change the bone scale X."),
        _("Set _PARAM0_:_PARAM1_ scale X _PARAM2_ _PARAM3_"),
        _("Bone"),
        "JsPlatform/Extensions/skeletonboneicon24.png",
        "JsPlatform/Extensions/skeletonboneicon16.png")
        .AddParameter("object", _("Object"), "Skeleton")
        .AddParameter("string", _("Bone path"))
        .AddParameter("operator", _("Modification's sign"))
        .AddParameter("expression", _("Value"))
        .SetManipulatedType("number");

    obj.AddExpression("BoneScaleX", _("Scale X"), _("Slot scale X"), _("Bone"), "JsPlatform/Extensions/skeletonboneicon16.png")
        .AddParameter("object", _("Object"), "Skeleton")
        .AddParameter("string", _("Bone path"));

    obj.AddCondition("BoneScaleY",
        _("Scale Y"),
        _("Check the bone scale Y."),
        _("Current scale Y of _PARAM0_:_PARAM1_ is _PARAM2_ _PARAM3_"),
        _("Bone"),
        "JsPlatform/Extensions/skeletonboneicon24.png",
        "JsPlatform/Extensions/skeletonboneicon16.png")
        .AddParameter("object", _("Object"), "Skeleton")
        .AddParameter("string", _("Bone path"))
        .AddParameter("relationalOperator", _("Sign of the test"))
        .AddParameter("expression", _("Value"))
        .SetManipulatedType("number");

    obj.AddAction("SetBoneScaleY",
        _("Scale Y"),
        _("Change the bone scale Y."),
        _("Set _PARAM0_:_PARAM1_ scale Y _PARAM2_ _PARAM3_"),
        _("Bone"),
        "JsPlatform/Extensions/skeletonboneicon24.png",
        "JsPlatform/Extensions/skeletonboneicon16.png")
        .AddParameter("object", _("Object"), "Skeleton")
        .AddParameter("string", _("Bone path"))
        .AddParameter("operator", _("Modification's sign"))
        .AddParameter("expression", _("Value"))
        .SetManipulatedType("number");

    obj.AddExpression("BoneScaleY", _("Scale Y"), _("Slot scale Y"), _("Bone"), "JsPlatform/Extensions/skeletonboneicon16.png")
        .AddParameter("object", _("Object"), "Skeleton")
        .AddParameter("string", _("Bone path"));

    obj.AddAction("SetBoneScale",
        _("Scale"),
        _("Change the bone scale."),
        _("Set _PARAM0_:_PARAM1_ scale X _PARAM2_ _PARAM3_; Y _PARAM4_ _PARAM5_"),
        _("Bone"),
        "JsPlatform/Extensions/skeletonboneicon24.png",
        "JsPlatform/Extensions/skeletonboneicon16.png")
        .AddParameter("object", _("Object"), "Skeleton")
        .AddParameter("string", _("Bone path"))
        .AddParameter("operator", _("Modification's sign"))
        .AddParameter("expression", _("Scale X"))
        .AddParameter("operator", _("Modification's sign"))
        .AddParameter("expression", _("Scale Y"));

    obj.AddCondition("SlotPositionX",
        _("Position X"),
        _("Check the slot position X."),
        _("Current position X of _PARAM0_:_PARAM1_ is _PARAM2_ _PARAM3_"),
        _("Slot"),
        "JsPlatform/Extensions/skeletonsloticon24.png",
        "JsPlatform/Extensions/skeletonsloticon16.png")
        .AddParameter("object", _("Object"), "Skeleton")
        .AddParameter("string", _("Slot path"))
        .AddParameter("relationalOperator", _("Sign of the test"))
        .AddParameter("expression", _("Value"))
        .SetManipulatedType("number");

    obj.AddAction("SetSlotPositionX",
        _("Position X"),
        _("Change the slot position X."),
        _("Set _PARAM0_:_PARAM1_ position X _PARAM2_ _PARAM3_"),
        _("Slot"),
        "JsPlatform/Extensions/skeletonsloticon24.png",
        "JsPlatform/Extensions/skeletonsloticon16.png")
        .AddParameter("object", _("Object"), "Skeleton")
        .AddParameter("string", _("Slot path"))
        .AddParameter("operator", _("Modification's sign"))
        .AddParameter("expression", _("Value"))
        .SetManipulatedType("number");

    obj.AddExpression("SlotPositionX", _("Position X"), _("Slot position X"), _("Slot"), "JsPlatform/Extensions/skeletonsloticon16.png")
        .AddParameter("object", _("Object"), "Skeleton")
        .AddParameter("string", _("Slot path"));

    obj.AddCondition("SlotPositionY",
        _("Position Y"),
        _("Check the slot position Y."),
        _("Current position Y of _PARAM0_:_PARAM1_ is _PARAM2_ _PARAM3_"),
        _("Slot"),
        "JsPlatform/Extensions/skeletonsloticon24.png",
        "JsPlatform/Extensions/skeletonsloticon16.png")
        .AddParameter("object", _("Object"), "Skeleton")
        .AddParameter("string", _("Slot path"))
        .AddParameter("relationalOperator", _("Sign of the test"))
        .AddParameter("expression", _("Value"))
        .SetManipulatedType("number");

    obj.AddAction("SetSlotPositionY",
        _("Position Y"),
        _("Change the slot position Y."),
        _("Set _PARAM0_:_PARAM1_ position Y _PARAM2_ _PARAM3_"),
        _("Slot"),
        "JsPlatform/Extensions/skeletonsloticon24.png",
        "JsPlatform/Extensions/skeletonsloticon16.png")
        .AddParameter("object", _("Object"), "Skeleton")
        .AddParameter("string", _("Slot path"))
        .AddParameter("operator", _("Modification's sign"))
        .AddParameter("expression", _("Value"))
        .SetManipulatedType("number");

    obj.AddExpression("SlotPositionY", _("Position Y"), _("Slot position Y"), _("Slot"), "JsPlatform/Extensions/skeletonsloticon16.png")
        .AddParameter("object", _("Object"), "Skeleton")
        .AddParameter("string", _("Slot path"));

    obj.AddAction("SetSlotPosition",
        _("Position"),
        _("Change the slot position."),
        _("Set _PARAM0_:_PARAM1_ position X _PARAM2_ _PARAM3_; Y _PARAM4_ _PARAM5_"),
        _("Slot"),
        "JsPlatform/Extensions/skeletonsloticon24.png",
        "JsPlatform/Extensions/skeletonsloticon16.png")
        .AddParameter("object", _("Object"), "Skeleton")
        .AddParameter("string", _("Slot path"))
        .AddParameter("operator", _("Modification's sign"))
        .AddParameter("expression", _("Position X"))
        .AddParameter("operator", _("Modification's sign"))
        .AddParameter("expression", _("Position Y"));

    obj.AddCondition("SlotAngle",
        _("Angle"),
        _("Check the slot angle (in degrees)."),
        _("Current angle of _PARAM0_:_PARAM1_ is _PARAM2_ _PARAM3_"),
        _("Slot"),
        "JsPlatform/Extensions/skeletonsloticon24.png",
        "JsPlatform/Extensions/skeletonsloticon16.png")
        .AddParameter("object", _("Object"), "Skeleton")
        .AddParameter("string", _("Slot path"))
        .AddParameter("relationalOperator", _("Sign of the test"))
        .AddParameter("expression", _("Value"))
        .SetManipulatedType("number");

    obj.AddAction("SetSlotAngle",
        _("Angle"),
        _("Change the slot angle (in degrees)."),
        _("Set _PARAM0_:_PARAM1_ angle _PARAM2_ _PARAM3_"),
        _("Slot"),
        "JsPlatform/Extensions/skeletonsloticon24.png",
        "JsPlatform/Extensions/skeletonsloticon16.png")
        .AddParameter("object", _("Object"), "Skeleton")
        .AddParameter("string", _("Slot path"))
        .AddParameter("operator", _("Modification's sign"))
        .AddParameter("expression", _("Value"))
        .SetManipulatedType("number");

    obj.AddExpression("SlotAngle", _("Angle"), _("Slot angle (in degrees)"), _("Slot"), "JsPlatform/Extensions/skeletonsloticon16.png")
        .AddParameter("object", _("Object"), "Skeleton")
        .AddParameter("string", _("Slot path"));

    obj.AddCondition("SlotScaleX",
        _("Scale X"),
        _("Check the slot scale X."),
        _("Current scale X of _PARAM0_:_PARAM1_ is _PARAM2_ _PARAM3_"),
        _("Slot"),
        "JsPlatform/Extensions/skeletonsloticon24.png",
        "JsPlatform/Extensions/skeletonsloticon16.png")
        .AddParameter("object", _("Object"), "Skeleton")
        .AddParameter("string", _("Slot path"))
        .AddParameter("relationalOperator", _("Sign of the test"))
        .AddParameter("expression", _("Value"))
        .SetManipulatedType("number");

    obj.AddAction("SetSlotScaleX",
        _("Scale X"),
        _("Change the slot scale X."),
        _("Set _PARAM0_:_PARAM1_ scale X _PARAM2_ _PARAM3_"),
        _("Slot"),
        "JsPlatform/Extensions/skeletonsloticon24.png",
        "JsPlatform/Extensions/skeletonsloticon16.png")
        .AddParameter("object", _("Object"), "Skeleton")
        .AddParameter("string", _("Slot path"))
        .AddParameter("operator", _("Modification's sign"))
        .AddParameter("expression", _("Value"))
        .SetManipulatedType("number");

    obj.AddExpression("SlotScaleX", _("Scale X"), _("Slot scale X"), _("Slot"), "JsPlatform/Extensions/skeletonsloticon16.png")
        .AddParameter("object", _("Object"), "Skeleton")
        .AddParameter("string", _("Slot path"));

    obj.AddCondition("SlotScaleY",
        _("Scale Y"),
        _("Check the slot scale Y."),
        _("Current scale Y of _PARAM0_:_PARAM1_ is _PARAM2_ _PARAM3_"),
        _("Slot"),
        "JsPlatform/Extensions/skeletonsloticon24.png",
        "JsPlatform/Extensions/skeletonsloticon16.png")
        .AddParameter("object", _("Object"), "Skeleton")
        .AddParameter("string", _("Slot path"))
        .AddParameter("relationalOperator", _("Sign of the test"))
        .AddParameter("expression", _("Value"))
        .SetManipulatedType("number");

    obj.AddAction("SetSlotScaleY",
        _("Scale Y"),
        _("Change the slot scale Y."),
        _("Set _PARAM0_:_PARAM1_ scale Y _PARAM2_ _PARAM3_"),
        _("Slot"),
        "JsPlatform/Extensions/skeletonsloticon24.png",
        "JsPlatform/Extensions/skeletonsloticon16.png")
        .AddParameter("object", _("Object"), "Skeleton")
        .AddParameter("string", _("Slot path"))
        .AddParameter("operator", _("Modification's sign"))
        .AddParameter("expression", _("Value"))
        .SetManipulatedType("number");

    obj.AddExpression("SlotScaleY", _("Scale Y"), _("Slot scale Y"), _("Slot"), "JsPlatform/Extensions/skeletonsloticon16.png")
        .AddParameter("object", _("Object"), "Skeleton")
        .AddParameter("string", _("Slot path"));

    obj.AddAction("SetSlotScale",
        _("Scale"),
        _("Change the slot scale."),
        _("Set _PARAM0_:_PARAM1_ scale X _PARAM2_ _PARAM3_; Y _PARAM4_ _PARAM5_"),
        _("Slot"),
        "JsPlatform/Extensions/skeletonsloticon24.png",
        "JsPlatform/Extensions/skeletonsloticon16.png")
        .AddParameter("object", _("Object"), "Skeleton")
        .AddParameter("string", _("Slot path"))
        .AddParameter("operator", _("Modification's sign"))
        .AddParameter("expression", _("Scale X"))
        .AddParameter("operator", _("Modification's sign"))
        .AddParameter("expression", _("Scale Y"));

    obj.AddAction("SlotColor",
        _("Color"),
        _("Change the slot color."),
        _("Set _PARAM0_:_PARAM1_ color to _PARAM2_"),
        _("Slot"),
        "JsPlatform/Extensions/skeletonsloticon24.png",
        "JsPlatform/Extensions/skeletonsloticon16.png")
        .AddParameter("object", _("Object"), "Skeleton")
        .AddParameter("string", _("Sloth path"))
        .AddParameter("color", _("Color"));

    obj.AddCondition("SlotVisible",
        _("Visible"),
        _("Check the slot visibility."),
        _("_PARAM0_:_PARAM1_ is visible"),
        _("Slot"),
        "JsPlatform/Extensions/skeletonsloticon24.png",
        "JsPlatform/Extensions/skeletonsloticon16.png")
        .AddParameter("object", _("Object"), "Skeleton")
        .AddParameter("string", _("Slot path"));

    obj.AddAction("SlotVisible",
        _("Visible"),
        _("Change the slot visibility."),
        _("Set _PARAM0_:_PARAM1_ visible: _PARAM2_"),
        _("Slot"),
        "JsPlatform/Extensions/skeletonsloticon24.png",
        "JsPlatform/Extensions/skeletonsloticon16.png")
        .AddParameter("object", _("Object"), "Skeleton")
        .AddParameter("string", _("Slot path"))
        .AddParameter("yesorno", _("Visible?"));

    obj.AddExpression("SlotVisible", _("Visible"), _("Slot visibility (0: hidden, 1: visible)"), _("Slot"), "JsPlatform/Extensions/skeletonsloticon16.png")
        .AddParameter("object", _("Object"), "Skeleton")
        .AddParameter("string", _("Sloth path"));

    obj.AddCondition("SlotZOrder",
        _("Z-order"),
        _("Check the slot Z-order."),
        _("Z-order of _PARAM0_:_PARAM1_ is _PARAM2_ _PARAM3_"),
        _("Slot"),
        "JsPlatform/Extensions/skeletonsloticon24.png",
        "JsPlatform/Extensions/skeletonsloticon16.png")
        .AddParameter("object", _("Object"), "Skeleton")
        .AddParameter("string", _("Slot path"))
        .AddParameter("relationalOperator", _("Sign of the test"))
        .AddParameter("expression", _("Value"))
        .SetManipulatedType("number");

    obj.AddAction("SetSlotZOrder",
        _("Z-order"),
        _("Change the slot Z-order."),
        _("Set _PARAM0_:_PARAM1_ Z-order _PARAM2_ _PARAM3_"),
        _("Slot"),
        "JsPlatform/Extensions/skeletonsloticon24.png",
        "JsPlatform/Extensions/skeletonsloticon16.png")
        .AddParameter("object", _("Object"), "Skeleton")
        .AddParameter("string", _("Slot path"))
        .AddParameter("operator", _("Modification's sign"))
        .AddParameter("expression", _("Value"))
        .SetManipulatedType("number");

    obj.AddExpression("SlotZOrder", _("Z-order"), _("Slot Z-order"), _("Slot"), "JsPlatform/Extensions/skeletonsloticon16.png")
        .AddParameter("object", _("Object"), "Skeleton")
        .AddParameter("string", _("Sloth path"));

    obj.AddCondition("PointInsideSlot",
        _("Point inside slot"),
        _("Check if the point is inside the slot"),
        _("The point _PARAM2_;_PARAM3_ is inside _PARAM0_:_PARAM1_"),
        _("Collision"),
        "res/conditions/collisionPoint24.png",
        "res/conditions/collisionPoint.png")
        .AddParameter("object", _("Object"), "Skeleton")
        .AddParameter("string", _("Sloth path"))
        .AddParameter("expression", _("Point X"))
        .AddParameter("expression", _("Point Y"));

    extension.AddCondition("SlotCollidesWithObject",
        _("Slot collides with object"),
        _("Check if the slot collides with an object"),
        _("_PARAM0_:_PARAM1_ collides with _PARAM2_"),
        _("Collision"),
        "res/conditions/collision24.png",
        "res/conditions/collision.png")
        .AddParameter("objectList", _("Skeleton"), "Skeleton")
        .AddParameter("string", _("Sloth path"))
        .AddParameter("objectList", _("Object"));

    extension.AddCondition("SlotCollidesWithSlot",
        _("Slot collides with slot"),
        _("Check if the slot collides with another skeleton slot"),
        _("_PARAM0_:_PARAM1_ collides with _PARAM2_:_PARAM3_"),
        _("Collision"),
        "res/conditions/collision24.png",
        "res/conditions/collision.png")
        .AddParameter("objectList", _("Skeleton"), "Skeleton")
        .AddParameter("string", _("Sloth path"))
        .AddParameter("objectList", _("Other skeleton"), "Skeleton")
        .AddParameter("string", _("Sloth path"));
}
