
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
               "JsPlatform/Extensions/admobicon.png");

    #if !defined(GD_NO_WX_GUI)
    SkeletonObject::LoadEdittimeIcon();
    #endif

    obj.AddCondition("AnimationPaused",
        _("Paused"),
        _("Test if the animation for the skeleton is paused"),
        _("Animation of _PARAM0_ is paused"),
        _("Animation"),
        "JsPlatform/Extensions/admobicon24.png",
        "JsPlatform/Extensions/admobicon16.png")
        .AddParameter("object", _("Object"), "Skeleton");

    obj.AddAction("PauseAnimation",
        _("Pause"),
        _("Pauses animation for the skeleton"),
        _("Pause animation for _PARAM0_"),
        _("Animation"),
        "JsPlatform/Extensions/admobicon24.png",
        "JsPlatform/Extensions/admobicon16.png")
        .AddParameter("object", _("Object"), "Skeleton");

    obj.AddAction("UnpauseAnimation",
        _("Unpause"),
        _("Unpauses animation for the skeleton"),
        _("Unpause animation for _PARAM0_"),
        _("Animation"),
        "JsPlatform/Extensions/admobicon24.png",
        "JsPlatform/Extensions/admobicon16.png")
        .AddParameter("object", _("Object"), "Skeleton");

    obj.AddExpression("AnimationPlaying", _("Playing"), _("Current animation playing (0: paused, 1: playing)"), _("Animation"), "JsPlatform/Extensions/admobicon16.png")
        .AddParameter("object", _("Object"), "Skeleton");

    obj.AddCondition("AnimationFinished",
        _("Finished"),
        _("Test if the animation has finished this frame"),
        _("Animation of _PARAM0_ has finished"),
        _("Animation"),
        "JsPlatform/Extensions/admobicon24.png",
        "JsPlatform/Extensions/admobicon16.png")
        .AddParameter("object", _("Object"), "Skeleton");

    obj.AddCondition("AnimationTime",
        _("Current time"),
        _("Check the current animation elapsed time."),
        _("Current animation time of _PARAM0_ is _PARAM1_ _PARAM2_"),
        _("Animation"),
        "JsPlatform/Extensions/admobicon24.png",
        "JsPlatform/Extensions/admobicon16.png")
        .AddParameter("object", _("Object"), "Skeleton")
        .AddParameter("relationalOperator", _("Sign of the test"))
        .AddParameter("expression", _("Value"))
        .SetManipulatedType("number");

    obj.AddExpression("AnimationTime", _("Current time"), _("Current animation elapsed time"), _("Animation"), "JsPlatform/Extensions/admobicon16.png")
        .AddParameter("object", _("Object"), "Skeleton");

    obj.AddCondition("AnimationTimeLength",
        _("Time length"),
        _("Check the current animation time length."),
        _("The animation time length of _PARAM0_ is _PARAM1_ _PARAM2_"),
        _("Animation"),
        "JsPlatform/Extensions/admobicon24.png",
        "JsPlatform/Extensions/admobicon16.png")
        .AddParameter("object", _("Object"), "Skeleton")
        .AddParameter("relationalOperator", _("Sign of the test"))
        .AddParameter("expression", _("Value"))
        .SetManipulatedType("number");

    obj.AddExpression("AnimationTimeLenght", _("Animation time length"), _("Current animation time length"), _("Animation"), "JsPlatform/Extensions/admobicon16.png")
        .AddParameter("object", _("Object"), "Skeleton");

    obj.AddCondition("AnimationFrame",
        _("Current frame"),
        _("Check the current animation frame.\nIf the animation is smooth, a float can be (and probably will be) returned."),
        _("Current animation frame of _PARAM0_ is _PARAM1_ _PARAM2_"),
        _("Animation"),
        "JsPlatform/Extensions/admobicon24.png",
        "JsPlatform/Extensions/admobicon16.png")
        .AddParameter("object", _("Object"), "Skeleton")
        .AddParameter("relationalOperator", _("Sign of the test"))
        .AddParameter("expression", _("Value"))
        .SetManipulatedType("number");

    obj.AddExpression("AnimationFrame", _("Current frame"), _("Current animation frame"), _("Animation"), "JsPlatform/Extensions/admobicon16.png")
        .AddParameter("object", _("Object"), "Skeleton");

    obj.AddCondition("AnimationFrameLength",
        _("Frame length"),
        _("Check the current animation frame length."),
        _("The animation frame length of _PARAM0_ is _PARAM1_ _PARAM2_"),
        _("Animation"),
        "JsPlatform/Extensions/admobicon24.png",
        "JsPlatform/Extensions/admobicon16.png")
        .AddParameter("object", _("Object"), "Skeleton")
        .AddParameter("relationalOperator", _("Sign of the test"))
        .AddParameter("expression", _("Value"))
        .SetManipulatedType("number");

    obj.AddExpression("AnimationFrameLenght", _("Animation frame length"), _("Current animation frame length"), _("Animation"), "JsPlatform/Extensions/admobicon16.png")
        .AddParameter("object", _("Object"), "Skeleton");

    obj.AddCondition("CurrentAnimation",
        _("Animation"),
        _("Check the current animation index.\nIf not sure about the index, you can use the \"by name\" action"),
        _("Set the animation of _PARAM0_ to _PARAM1_"),
        _("Animation"),
        "JsPlatform/Extensions/admobicon24.png",
        "JsPlatform/Extensions/admobicon16.png")
        .AddParameter("object", _("Object"), "Skeleton")
        .AddParameter("relationalOperator", _("Sign of the test"))
        .AddParameter("expression", _("Value"))
        .SetManipulatedType("number");

    obj.AddAction("SetAnimation",
        _("Animation"),
        _("Change the current animation from the animation index.\nIf not sure about the index, you can use the \"by name\" action"),
        _("Set _PARAM0_ animation _PARAM1_ _PARAM2_"),
        _("Animation"),
        "JsPlatform/Extensions/admobicon24.png",
        "JsPlatform/Extensions/admobicon16.png")
        .AddParameter("object", _("Object"), "Skeleton")
        .AddParameter("operator", _("Modification's sign"))
        .AddParameter("expression", _("Value"))
        .AddParameter("expression", _("Blend time (0 for automatic blending)"), "", true).SetDefaultValue("0")
        .AddParameter("expression", _("Loops (0 for infinite loops)"), "", true).SetDefaultValue("-1");

    obj.AddExpression("CurrentAnimation", _("Current animation index"), _("Current animation index"), _("Animation"), "JsPlatform/Extensions/admobicon16.png")
        .AddParameter("object", _("Object"), "Skeleton");

    obj.AddCondition("CurrentAnimationName",
        _("Animation"),
        _("Check the current animation name."),
        _("The animation of _PARAM0_ is _PARAM1_ _PARAM2_"),
        _("Animation"),
        "JsPlatform/Extensions/admobicon24.png",
        "JsPlatform/Extensions/admobicon16.png")
        .AddParameter("object", _("Object"), "Skeleton")
        .AddParameter("relationalOperator", _("Sign of the test"))
        .AddParameter("string", _("Text"))
        .SetManipulatedType("string");

    obj.AddAction("SetAnimationName",
        _("Animation name"),
        _("Change the current animation from the animation name."),
        _("Set _PARAM0_ animation _PARAM1_ _PARAM2_"),
        _("Animation"),
        "JsPlatform/Extensions/admobicon24.png",
        "JsPlatform/Extensions/admobicon16.png")
        .AddParameter("object", _("Object"), "Skeleton")
        .AddParameter("operator", _("Modification's sign"))
        .AddParameter("string", _("Text"))
        .AddParameter("expression", _("Blend time (0 for automatic blending)"), "", true).SetDefaultValue("0")
        .AddParameter("expression", _("Loops (0 for infinite loops)"), "", true).SetDefaultValue("-1");

    obj.AddStrExpression("CurrentAnimationName", _("Current animation name"), _("Current animation name"), _("Animation"), "JsPlatform/Extensions/admobicon16.png")
        .AddParameter("object", _("Object"), "Skeleton");

    obj.AddAction("SetColor",
        _("Color"),
        _("Change the slot color."),
        _("Set _PARAM0_ color to _PARAM2_"),
        _("Slot"),
        "JsPlatform/Extensions/admobicon24.png",
        "JsPlatform/Extensions/admobicon16.png")
        .AddParameter("object", _("Object"), "Skeleton")
        .AddParameter("string", _("Sloth path"))
        .AddParameter("color", _("Color"));

    obj.AddCondition("SlotPositionX",
        _("Position X"),
        _("Check the slot position X."),
        _("Current position X of _PARAM0_:_PARAM1_ is _PARAM2_ _PARAM3_"),
        _("Slot"),
        "JsPlatform/Extensions/admobicon24.png",
        "JsPlatform/Extensions/admobicon16.png")
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
        "JsPlatform/Extensions/admobicon24.png",
        "JsPlatform/Extensions/admobicon16.png")
        .AddParameter("object", _("Object"), "Skeleton")
        .AddParameter("string", _("Slot path"))
        .AddParameter("operator", _("Modification's sign"))
        .AddParameter("expression", _("Value"))
        .SetManipulatedType("number");

    obj.AddCondition("SlotPositionY",
        _("Position Y"),
        _("Check the slot position Y."),
        _("Current position Y of _PARAM0_:_PARAM1_ is _PARAM2_ _PARAM3_"),
        _("Slot"),
        "JsPlatform/Extensions/admobicon24.png",
        "JsPlatform/Extensions/admobicon16.png")
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
        "JsPlatform/Extensions/admobicon24.png",
        "JsPlatform/Extensions/admobicon16.png")
        .AddParameter("object", _("Object"), "Skeleton")
        .AddParameter("string", _("Slot path"))
        .AddParameter("operator", _("Modification's sign"))
        .AddParameter("expression", _("Value"));

    obj.AddCondition("SlotAngle",
        _("Angle"),
        _("Check the slot angle."),
        _("Current angle of _PARAM0_:_PARAM1_ is _PARAM2_ _PARAM3_"),
        _("Slot"),
        "JsPlatform/Extensions/admobicon24.png",
        "JsPlatform/Extensions/admobicon16.png")
        .AddParameter("object", _("Object"), "Skeleton")
        .AddParameter("string", _("Slot path"))
        .AddParameter("relationalOperator", _("Sign of the test"))
        .AddParameter("expression", _("Value"))
        .SetManipulatedType("number");

    obj.AddAction("SetSlotAngle",
        _("Angle"),
        _("Change the slot angle."),
        _("Set _PARAM0_:_PARAM1_ angle _PARAM2_ _PARAM3_"),
        _("Slot"),
        "JsPlatform/Extensions/admobicon24.png",
        "JsPlatform/Extensions/admobicon16.png")
        .AddParameter("object", _("Object"), "Skeleton")
        .AddParameter("string", _("Slot path"))
        .AddParameter("operator", _("Modification's sign"))
        .AddParameter("expression", _("Value"));

    obj.AddCondition("SlotScaleX",
        _("Scale X"),
        _("Check the slot scale X."),
        _("Current scale X of _PARAM0_:_PARAM1_ is _PARAM2_ _PARAM3_"),
        _("Slot"),
        "JsPlatform/Extensions/admobicon24.png",
        "JsPlatform/Extensions/admobicon16.png")
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
        "JsPlatform/Extensions/admobicon24.png",
        "JsPlatform/Extensions/admobicon16.png")
        .AddParameter("object", _("Object"), "Skeleton")
        .AddParameter("string", _("Slot path"))
        .AddParameter("operator", _("Modification's sign"))
        .AddParameter("expression", _("Value"));

    obj.AddCondition("SlotScaleY",
        _("Scale Y"),
        _("Check the slot scale Y."),
        _("Current scale Y of _PARAM0_:_PARAM1_ is _PARAM2_ _PARAM3_"),
        _("Slot"),
        "JsPlatform/Extensions/admobicon24.png",
        "JsPlatform/Extensions/admobicon16.png")
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
        "JsPlatform/Extensions/admobicon24.png",
        "JsPlatform/Extensions/admobicon16.png")
        .AddParameter("object", _("Object"), "Skeleton")
        .AddParameter("string", _("Slot path"))
        .AddParameter("operator", _("Modification's sign"))
        .AddParameter("expression", _("Value"));

    extension.AddCondition("SlotCollidesWithObject",
        _("Collides"),
        _("Check if the slot collides with an object"),
        _("_PARAM0_:_PARAM1_ collides with _PARAM2_"),
        _("Slot"),
        "JsPlatform/Extensions/admobicon24.png",
        "JsPlatform/Extensions/admobicon16.png")
        .AddParameter("objectList", _("Skeleton"), "Skeleton")
        .AddParameter("string", _("Sloth path"))
        .AddParameter("objectList", _("Object"));

    extension.AddCondition("SlotCollidesWithSlot",
        _("Collides with slot"),
        _("Check if the slot collides with another skeleton slot"),
         _("_PARAM0_:_PARAM1_ collides with _PARAM2_:_PARAM3_"),
        _("Slot"),
        "JsPlatform/Extensions/admobicon24.png",
        "JsPlatform/Extensions/admobicon16.png")
        .AddParameter("objectList", _("Skeleton"), "Skeleton")
        .AddParameter("string", _("Sloth path"))
        .AddParameter("objectList", _("Other skeleton"), "Skeleton")
        .AddParameter("string", _("Sloth path"));
}
