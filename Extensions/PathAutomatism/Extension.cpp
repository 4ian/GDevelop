/**

GDevelop - Path Automatism Extension
Copyright (c) 2010-2015 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/
/**
 * Contributors to the extension:
 * Victor Levasseur ( Created Path automatism editor and enhanced extension )
 */

#include "GDCpp/ExtensionBase.h"
#include "GDCore/Tools/Version.h"
#include "PathAutomatism.h"
#include "ScenePathDatas.h"


/**
 * \brief This class declares information about the extension.
 */
class Extension : public ExtensionBase
{
public:

    /**
     * Constructor of an extension declares everything the extension contains: objects, actions, conditions and expressions.
     */
    Extension()
    {
        SetExtensionInformation("PathAutomatism",
                              GD_T("Path Automatism"),
                              GD_T("Automatism allowing to move objects on a predefined path"),
                              "Florian Rival",
                              "Open source (MIT License)");

            {
                gd::AutomatismMetadata & aut = AddAutomatism("PathAutomatism",
                      GD_T("Path"),
                      GD_T("Path"),
                      GD_T("Make objects move on a predefined path."),
                      "",
                      "CppPlatform/Extensions/pathicon.png",
                      "PathAutomatism",
                      std::shared_ptr<gd::Automatism>(new PathAutomatism),
                      std::shared_ptr<gd::AutomatismsSharedData>(new ScenePathDatas));

                #if defined(GD_IDE_ONLY)

                aut.SetIncludeFile("PathAutomatism/PathAutomatism.h");

                aut.AddAction("SetReverseAtEnd",
                               GD_T("De/activate rounding"),
                               GD_T("Activate or desactivate rounding"),
                               GD_T("Activate rounding for _PARAM0_: _PARAM2_"),
                               GD_T("Options"),
                               "CppPlatform/Extensions/pathicon24.png",
                               "CppPlatform/Extensions/pathicon16.png")
                    .AddParameter("object", GD_T("Object"))
                    .AddParameter("automatism", GD_T("Automatism"), "PathAutomatism", false)
                    .AddParameter("yesorno", GD_T("Activate"))
                    .codeExtraInformation.SetFunctionName("SetReverseAtEnd").SetIncludeFile("PathAutomatism/PathAutomatism.h");

                aut.AddAction("SetStopAtEnd",
                               GD_T("De/activate the stop at the end of the path"),
                               GD_T("Activate or deactivate the stop at the end of the object"),
                               GD_T("Stop _PARAM0_ when the end of the path is reached: _PARAM2_"),
                               GD_T("Options"),
                               "CppPlatform/Extensions/pathicon24.png",
                               "CppPlatform/Extensions/pathicon16.png")
                    .AddParameter("object", GD_T("Object"))
                    .AddParameter("automatism", GD_T("Automatism"), "PathAutomatism", false)
                    .AddParameter("yesorno", GD_T("Activate"))
                    .codeExtraInformation.SetFunctionName("SetStopAtEnd").SetIncludeFile("PathAutomatism/PathAutomatism.h");

                aut.AddCondition("ReverseAtEnd",
                               GD_T("Rounds"),
                               GD_T("Return true if the object round"),
                               GD_T("_PARAM0_ is rounding"),
                               GD_T("Options"),
                               "CppPlatform/Extensions/pathicon24.png",
                               "CppPlatform/Extensions/pathicon16.png")
                    .AddParameter("object", GD_T("Object"))
                    .AddParameter("automatism", GD_T("Automatism"), "PathAutomatism", false)
                    .codeExtraInformation.SetFunctionName("ReverseAtEnd").SetIncludeFile("PathAutomatism/PathAutomatism.h");

                aut.AddCondition("StopAtEnd",
                               GD_T("Stop at the end of the path"),
                               GD_T("Return true if the object stops at the end of its path."),
                               GD_T("_PARAM0_ stops at the end of the path"),
                               GD_T("Options"),
                               "CppPlatform/Extensions/pathicon24.png",
                               "CppPlatform/Extensions/pathicon16.png")
                    .AddParameter("object", GD_T("Object"))
                    .AddParameter("automatism", GD_T("Automatism"), "PathAutomatism", false)
                    .codeExtraInformation.SetFunctionName("StopAtEnd").SetIncludeFile("PathAutomatism/PathAutomatism.h");

                aut.AddAction("Reverse",
                               GD_T("Invert the movement on the path"),
                               GD_T("Invert the movement on the path."),
                               GD_T("Invert the sens of the movement of _PARAM0_ on its path"),
                               GD_T("Movement"),
                               "CppPlatform/Extensions/pathicon24.png",
                               "CppPlatform/Extensions/pathicon16.png")
                    .AddParameter("object", GD_T("Object"))
                    .AddParameter("automatism", GD_T("Automatism"), "PathAutomatism", false)
                    .codeExtraInformation.SetFunctionName("Reverse").SetIncludeFile("PathAutomatism/PathAutomatism.h");

                aut.AddCondition("GetSegment",
                               GD_T("Number of the segment on the path"),
                               GD_T("True if the number of the current segment on the path satisfies the test."),
                               GD_T("The number of the current segment of the path of _PARAM0_ is _PARAM2__PARAM3_"),
                               GD_T("Position"),
                               "CppPlatform/Extensions/pathicon24.png",
                               "CppPlatform/Extensions/pathicon16.png")
                    .AddParameter("object", GD_T("Object"))
                    .AddParameter("automatism", GD_T("Automatism"), "PathAutomatism", false)
                    .AddParameter("relationalOperator", GD_T("Comparison sign"))
                    .AddParameter("expression", GD_T("Value"))
                    .codeExtraInformation.SetFunctionName("GetCurrentSegment").SetManipulatedType("number").SetIncludeFile("PathAutomatism/PathAutomatism.h");

                aut.AddAction("EnterSegment",
                               GD_T("Position on the segment of a path"),
                               GD_T("Put the object directly on specific segment of the path"),
                               GD_T("Do _PARAM2__PARAM3_ to number of the current segment of _PARAM0_"),
                               GD_T("Position"),
                               "CppPlatform/Extensions/pathicon24.png",
                               "CppPlatform/Extensions/pathicon16.png")
                    .AddParameter("object", GD_T("Object"))
                    .AddParameter("automatism", GD_T("Automatism"), "PathAutomatism", false)
                    .AddParameter("operator", GD_T("Modification sign"))
                    .AddParameter("expression", GD_T("Value"))
                    .codeExtraInformation.SetFunctionName("SetCurrentSegment").SetAssociatedGetter("GetCurrentSegment").SetManipulatedType("number").SetIncludeFile("PathAutomatism/PathAutomatism.h");

                aut.AddExpression("Segment", GD_T("Current segment"), GD_T("Number of the current segment"), GD_T("Position"), "CppPlatform/Extensions/pathicon16.png")
                    .AddParameter("object", GD_T("Object"))
                    .AddParameter("automatism", GD_T("Automatism"), "PathAutomatism", false)
                    .codeExtraInformation.SetFunctionName("GetCurrentSegment").SetIncludeFile("PathAutomatism/PathAutomatism.h");

                aut.AddCondition("GetPosition",
                               GD_T("Position of the object on the segment"),
                               GD_T("Return true if the position on the path satisfy the test.\nPosition on a segment is a value between 0 and 1."),
                               GD_T("The position of _PARAM0_ on the current segment is _PARAM2__PARAM3_"),
                               GD_T("Position"),
                               "CppPlatform/Extensions/pathicon24.png",
                               "CppPlatform/Extensions/pathicon16.png")
                    .AddParameter("object", GD_T("Object"))
                    .AddParameter("automatism", GD_T("Automatism"), "PathAutomatism", false)
                    .AddParameter("relationalOperator", GD_T("Comparison sign"))
                    .AddParameter("expression", GD_T("Value"))
                    .codeExtraInformation.SetFunctionName("GetPositionOnSegment").SetManipulatedType("number").SetIncludeFile("PathAutomatism/PathAutomatism.h");

                aut.AddAction("SetPosition",
                               GD_T("Put the object on a precise position of the current segment"),
                               GD_T("Put the object on a precise position on the current segment."),
                               GD_T("Put _PARAM0_ on _PARAM2__PARAM3_ on the current segment"),
                               GD_T("Position"),
                               "CppPlatform/Extensions/pathicon24.png",
                               "CppPlatform/Extensions/pathicon16.png")
                    .AddParameter("object", GD_T("Object"))
                    .AddParameter("automatism", GD_T("Automatism"), "PathAutomatism", false)
                    .AddParameter("operator", GD_T("Modification sign"))
                    .AddParameter("expression", GD_T("Value"))
                    .codeExtraInformation.SetFunctionName("SetPositionOnSegment").SetAssociatedGetter("GetPositionOnSegment").SetManipulatedType("number").SetIncludeFile("PathAutomatism/PathAutomatism.h");

                aut.AddExpression("Position", GD_T("Position on the segment"), GD_T("Position on the segment ( value between 0 and 1 )"), GD_T("Position"), "CppPlatform/Extensions/pathicon16.png")
                    .AddParameter("object", GD_T("Object"))
                    .AddParameter("automatism", GD_T("Automatism"), "PathAutomatism", false)
                    .codeExtraInformation.SetFunctionName("GetPositionOnSegment").SetIncludeFile("PathAutomatism/PathAutomatism.h");

                aut.AddCondition("GetPathName",
                               GD_T("Path name"),
                               GD_T("Test the path name."),
                               GD_T("The name of the current path of _PARAM0_ is _PARAM1__PARAM2_"),
                               GD_T("Path"),
                               "CppPlatform/Extensions/pathicon24.png",
                               "CppPlatform/Extensions/pathicon16.png")
                    .AddParameter("object", GD_T("Object"))
                    .AddParameter("automatism", GD_T("Automatism"), "PathAutomatism", false)
                    .AddParameter("relationalOperator", GD_T("Comparison sign"))
                    .AddParameter("string", GD_T("Name"))
                    .codeExtraInformation.SetFunctionName("GetCurrentPathName").SetManipulatedType("string").SetIncludeFile("PathAutomatism/PathAutomatism.h");

                aut.AddAction("SetPathName",
                               GD_T("Change the path"),
                               GD_T("Change the path used."),
                               GD_T("Set _PARAM2_ as the current path of _PARAM0_"),
                               GD_T("Path"),
                               "CppPlatform/Extensions/pathicon24.png",
                               "CppPlatform/Extensions/pathicon16.png")
                    .AddParameter("object", GD_T("Object"))
                    .AddParameter("automatism", GD_T("Automatism"), "PathAutomatism", false)
                    .AddParameter("string", GD_T("Name"))
                    .codeExtraInformation.SetFunctionName("ChangeCurrentPath").SetIncludeFile("PathAutomatism/PathAutomatism.h");

                aut.AddStrExpression("CurrentPathName", GD_T("Current path name"), GD_T("Current path name"), GD_T("Path"), "CppPlatform/Extensions/pathicon16.png")
                    .AddParameter("object", GD_T("Object"))
                    .AddParameter("automatism", GD_T("Automatism"), "PathAutomatism", false)
                    .codeExtraInformation.SetFunctionName("GetCurrentPathName").SetIncludeFile("PathAutomatism/PathAutomatism.h");

                aut.AddCondition("GetOffsetX",
                               GD_T("X position of the path"),
                               GD_T("Return true if the X position satisfies the test."),
                               GD_T("The X position of the path of _PARAM0_ is _PARAM2__PARAM3_"),
                               GD_T("Path position"),
                               "CppPlatform/Extensions/pathicon24.png",
                               "CppPlatform/Extensions/pathicon16.png")
                    .AddParameter("object", GD_T("Object"))
                    .AddParameter("automatism", GD_T("Automatism"), "PathAutomatism", false)
                    .AddParameter("relationalOperator", GD_T("Comparison sign"))
                    .AddParameter("expression", GD_T("Value"))
                    .codeExtraInformation.SetFunctionName("GetOffsetX").SetManipulatedType("number").SetIncludeFile("PathAutomatism/PathAutomatism.h");

                aut.AddAction("SetOffsetX",
                               GD_T("Modify the path X position"),
                               GD_T("Change the path X position."),
                               GD_T("Do _PARAM2__PARAM3_ to the X position of the path of _PARAM0_"),
                               GD_T("Path position"),
                               "CppPlatform/Extensions/pathicon24.png",
                               "CppPlatform/Extensions/pathicon16.png")
                    .AddParameter("object", GD_T("Object"))
                    .AddParameter("automatism", GD_T("Automatism"), "PathAutomatism", false)
                    .AddParameter("operator", GD_T("Modification sign"))
                    .AddParameter("expression", GD_T("Value"))
                    .codeExtraInformation.SetFunctionName("SetOffsetX").SetAssociatedGetter("GetOffsetX").SetManipulatedType("number").SetIncludeFile("PathAutomatism/PathAutomatism.h");

                aut.AddExpression("PathX", GD_T("X position of the path"), GD_T("X position of the path"), GD_T("Path position"), "CppPlatform/Extensions/pathicon16.png")
                    .AddParameter("object", GD_T("Object"))
                    .AddParameter("automatism", GD_T("Automatism"), "PathAutomatism", false)
                    .codeExtraInformation.SetFunctionName("GetOffsetX").SetIncludeFile("PathAutomatism/PathAutomatism.h");

                aut.AddCondition("GetOffsetY",
                               GD_T("Path Y position"),
                               GD_T("Return true if the Y position satisfies the test."),
                               GD_T("The Y position of the path of _PARAM0_ is _PARAM2__PARAM3_"),
                               GD_T("Path position"),
                               "CppPlatform/Extensions/pathicon24.png",
                               "CppPlatform/Extensions/pathicon16.png")
                    .AddParameter("object", GD_T("Object"))
                    .AddParameter("automatism", GD_T("Automatism"), "PathAutomatism", false)
                    .AddParameter("relationalOperator", GD_T("Comparison sign"))
                    .AddParameter("expression", GD_T("Value"))
                    .codeExtraInformation.SetFunctionName("GetOffsetY").SetManipulatedType("number").SetIncludeFile("PathAutomatism/PathAutomatism.h");

                aut.AddAction("SetOffsetY",
                               GD_T("Modify the path Y position"),
                               GD_T("Change the path Y position."),
                               GD_T("Do _PARAM2__PARAM3_ to the Y position of the path of _PARAM0_"),
                               GD_T("Path position"),
                               "CppPlatform/Extensions/pathicon24.png",
                               "CppPlatform/Extensions/pathicon16.png")
                    .AddParameter("object", GD_T("Object"))
                    .AddParameter("automatism", GD_T("Automatism"), "PathAutomatism", false)
                    .AddParameter("operator", GD_T("Modification sign"))
                    .AddParameter("expression", GD_T("Value"))
                    .codeExtraInformation.SetFunctionName("SetOffsetY").SetAssociatedGetter("GetOffsetY").SetManipulatedType("number").SetIncludeFile("PathAutomatism/PathAutomatism.h");

                aut.AddExpression("PathY", GD_T("Path Y position"), GD_T("Path Y position"), GD_T("Path position"), "CppPlatform/Extensions/pathicon16.png")
                    .AddParameter("object", GD_T("Object"))
                    .AddParameter("automatism", GD_T("Automatism"), "PathAutomatism", false)
                    .codeExtraInformation.SetFunctionName("GetOffsetY").SetIncludeFile("PathAutomatism/PathAutomatism.h");

                aut.AddCondition("GetFollowAngle",
                               GD_T("Automatic rotation"),
                               GD_T("Return true if the object's angle is automatically updated."),
                               GD_T("The angle of _PARAM0_ is automatically updated on the path"),
                               GD_T("Options"),
                               "CppPlatform/Extensions/pathicon24.png",
                               "CppPlatform/Extensions/pathicon16.png")
                    .AddParameter("object", GD_T("Object"))
                    .AddParameter("automatism", GD_T("Automatism"), "PathAutomatism", false)
                    .codeExtraInformation.SetFunctionName("FollowAngle").SetIncludeFile("PathAutomatism/PathAutomatism.h");

                aut.AddAction("SetFollowAngle",
                               GD_T("De/activate automatic rotation"),
                               GD_T("Activate or deactivate the automatic update of the angle of the object on the path."),
                               GD_T("Activate automatic rotation of _PARAM0_: _PARAM2_"),
                               GD_T("Options"),
                               "CppPlatform/Extensions/pathicon24.png",
                               "CppPlatform/Extensions/pathicon16.png")
                    .AddParameter("object", GD_T("Object"))
                    .AddParameter("automatism", GD_T("Automatism"), "PathAutomatism", false)
                    .AddParameter("yesorno", GD_T("Activate \?"))
                    .codeExtraInformation.SetFunctionName("SetFollowAngle").SetIncludeFile("PathAutomatism/PathAutomatism.h");

                aut.AddCondition("GetAngleOffset",
                               GD_T("Angle offset"),
                               GD_T("Return true if the angle offset satifies the condition."),
                               GD_T("The angle offset of _PARAM0_ is _PARAM2__PARAM3_"),
                               GD_T("Options"),
                               "CppPlatform/Extensions/pathicon24.png",
                               "CppPlatform/Extensions/pathicon16.png")
                    .AddParameter("object", GD_T("Object"))
                    .AddParameter("automatism", GD_T("Automatism"), "PathAutomatism", false)
                    .AddParameter("relationalOperator", GD_T("Comparison sign"))
                    .AddParameter("expression", GD_T("Value"))
                    .codeExtraInformation.SetFunctionName("GetAngleOffset").SetManipulatedType("number").SetIncludeFile("PathAutomatism/PathAutomatism.h");

                aut.AddAction("SetAngleOffset",
                               GD_T("Change the angle offset"),
                               GD_T("Change the angle offset"),
                               GD_T("Do _PARAM2__PARAM3_ to angle offset of _PARAM0_"),
                               GD_T("Options"),
                               "CppPlatform/Extensions/pathicon24.png",
                               "CppPlatform/Extensions/pathicon16.png")
                    .AddParameter("object", GD_T("Object"))
                    .AddParameter("automatism", GD_T("Automatism"), "PathAutomatism", false)
                    .AddParameter("operator", GD_T("Modification sign"))
                    .AddParameter("expression", GD_T("Value"))
                    .codeExtraInformation.SetFunctionName("SetAngleOffset").SetAssociatedGetter("GetAngleOffset").SetManipulatedType("number").SetIncludeFile("PathAutomatism/PathAutomatism.h");

                aut.AddExpression("AngleOffset", GD_T("Angle offset"), GD_T("Add an offset to the angle of the object"), GD_T("Options"), "CppPlatform/Extensions/pathicon16.png")
                    .AddParameter("object", GD_T("Object"))
                    .AddParameter("automatism", GD_T("Automatism"), "PathAutomatism", false)
                    .codeExtraInformation.SetFunctionName("GetAngleOffset").SetIncludeFile("PathAutomatism/PathAutomatism.h");

                aut.AddCondition("GetSpeed",
                               GD_T("Speed"),
                               GD_T("Return true if the speed satisfy the condition."),
                               GD_T("The speed of _PARAM0_ on the path is _PARAM2__PARAM3_"),
                               GD_T("Movement"),
                               "CppPlatform/Extensions/pathicon24.png",
                               "CppPlatform/Extensions/pathicon16.png")
                    .AddParameter("object", GD_T("Object"))
                    .AddParameter("automatism", GD_T("Automatism"), "PathAutomatism", false)
                    .AddParameter("relationalOperator", GD_T("Comparison sign"))
                    .AddParameter("expression", GD_T("Value"))
                    .codeExtraInformation.SetFunctionName("GetSpeed").SetManipulatedType("number").SetIncludeFile("PathAutomatism/PathAutomatism.h");

                aut.AddAction("SetSpeed",
                               GD_T("Change the speed"),
                               GD_T("Change the speed of the object on the path."),
                               GD_T("Do _PARAM1__PARAM2_ to the speed of _PARAM0_ on the path"),
                               GD_T("Movement"),
                               "CppPlatform/Extensions/pathicon24.png",
                               "CppPlatform/Extensions/pathicon16.png")
                    .AddParameter("object", GD_T("Object"))
                    .AddParameter("automatism", GD_T("Automatism"), "PathAutomatism", false)
                    .AddParameter("operator", GD_T("Modification sign"))
                    .AddParameter("expression", GD_T("Value"))
                    .codeExtraInformation.SetFunctionName("SetSpeed").SetAssociatedGetter("GetSpeed").SetManipulatedType("number").SetIncludeFile("PathAutomatism/PathAutomatism.h");

                aut.AddExpression("Speed", GD_T("Speed"), GD_T("Moving speed on the path"), GD_T("Movement"), "CppPlatform/Extensions/pathicon16.png")
                    .AddParameter("object", GD_T("Object"))
                    .AddParameter("automatism", GD_T("Automatism"), "PathAutomatism", false)
                    .codeExtraInformation.SetFunctionName("GetSpeed").SetIncludeFile("PathAutomatism/PathAutomatism.h");

                #endif

            };

        GD_COMPLETE_EXTENSION_COMPILATION_INFORMATION();
    };
};

/**
 * Used by GDevelop to create the extension class
 * -- Do not need to be modified. --
 */
extern "C" ExtensionBase * GD_EXTENSION_API CreateGDExtension() {
    return new Extension;
}
