/**

GDevelop - Path Behavior Extension
Copyright (c) 2010-2016 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/
/**
 * Contributors to the extension:
 * Victor Levasseur ( Created Path behavior editor and enhanced extension )
 */

#include "GDCpp/Extensions/ExtensionBase.h"

#include "PathBehavior.h"
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
        SetExtensionInformation("PathBehavior",
                              _("Path Behavior"),
                              _("This Extension can move objects on predefined paths to avoid obstacles."),
                              "Florian Rival",
                              "Open source (MIT License)");

            {
                gd::BehaviorMetadata & aut = AddBehavior("PathBehavior",
                      _("Path"),
                      _("Path"),
                      _("Make objects move on predefined paths."),
                      "",
                      "CppPlatform/Extensions/pathicon.png",
                      "PathBehavior",
                      std::make_shared<PathBehavior>(),
                      std::make_shared<ScenePathDatas>());

                #if defined(GD_IDE_ONLY)

                aut.SetIncludeFile("PathBehavior/PathBehavior.h");

                aut.AddAction("SetReverseAtEnd",
                               _("De/activate rounding"),
                               _("Activate or deactivate rounding"),
                               _("Activate rounding for _PARAM0_: _PARAM2_"),
                               _("Options"),
                               "CppPlatform/Extensions/pathicon24.png",
                               "CppPlatform/Extensions/pathicon16.png")

                    .AddParameter("object", _("Object"))
                    .AddParameter("behavior", _("Behavior"), "PathBehavior")
                    .AddParameter("yesorno", _("Activate"))
                    .SetFunctionName("SetReverseAtEnd").SetIncludeFile("PathBehavior/PathBehavior.h");


                aut.AddAction("SetStopAtEnd",
                               _("Decide if the object should be stopped at the end of its path."),
                               _("Decide if the object should be stopped at the end of its path."),
                               _("Stop _PARAM0_ when the end of the path is reached: _PARAM2_"),
                               _("Options"),
                               "CppPlatform/Extensions/pathicon24.png",
                               "CppPlatform/Extensions/pathicon16.png")

                    .AddParameter("object", _("Object"))
                    .AddParameter("behavior", _("Behavior"), "PathBehavior")
                    .AddParameter("yesorno", _("Activate"))
                    .SetFunctionName("SetStopAtEnd").SetIncludeFile("PathBehavior/PathBehavior.h");


                aut.AddCondition("ReverseAtEnd",
                               _("Rounds"),
                               _("Return true if the object round"),
                               _("_PARAM0_ is rounding"),
                               _("Options"),
                               "CppPlatform/Extensions/pathicon24.png",
                               "CppPlatform/Extensions/pathicon16.png")

                    .AddParameter("object", _("Object"))
                    .AddParameter("behavior", _("Behavior"), "PathBehavior")
                    .SetFunctionName("ReverseAtEnd").SetIncludeFile("PathBehavior/PathBehavior.h");


                aut.AddCondition("StopAtEnd",
                               _("Stop at the end of the path"),
                               _("Return true if the object stops at the end of its path."),
                               _("_PARAM0_ stops at the end of the path"),
                               _("Options"),
                               "CppPlatform/Extensions/pathicon24.png",
                               "CppPlatform/Extensions/pathicon16.png")

                    .AddParameter("object", _("Object"))
                    .AddParameter("behavior", _("Behavior"), "PathBehavior")
                    .SetFunctionName("StopAtEnd").SetIncludeFile("PathBehavior/PathBehavior.h");


                aut.AddAction("Reverse",
                               _("Invert the movement on the path"),
                               _("Invert the movement on the path."),
                               _("Invert the sense of the movement of _PARAM0_ on its path"),
                               _("Movement"),
                               "CppPlatform/Extensions/pathicon24.png",
                               "CppPlatform/Extensions/pathicon16.png")

                    .AddParameter("object", _("Object"))
                    .AddParameter("behavior", _("Behavior"), "PathBehavior")
                    .SetFunctionName("Reverse").SetIncludeFile("PathBehavior/PathBehavior.h");


                aut.AddCondition("GetSegment",
                               _("Number of the segment on the path"),
                               _("True if the number of the current segment on the path satisfies the test."),
                               _("The number of the current segment of the path of _PARAM0_ is _PARAM2__PARAM3_"),
                               _("Position"),
                               "CppPlatform/Extensions/pathicon24.png",
                               "CppPlatform/Extensions/pathicon16.png")

                    .AddParameter("object", _("Object"))
                    .AddParameter("behavior", _("Behavior"), "PathBehavior")
                    .AddParameter("relationalOperator", _("Comparison sign"))
                    .AddParameter("expression", _("Value"))
                    .SetFunctionName("GetCurrentSegment").SetManipulatedType("number").SetIncludeFile("PathBehavior/PathBehavior.h");


                aut.AddAction("EnterSegment",
                               _("Position on the segment of a path"),
                               _("Put the object directly on a specific segment of the path"),
                               _("Do _PARAM2__PARAM3_ to number of the current segment of _PARAM0_"),
                               _("Position"),
                               "CppPlatform/Extensions/pathicon24.png",
                               "CppPlatform/Extensions/pathicon16.png")

                    .AddParameter("object", _("Object"))
                    .AddParameter("behavior", _("Behavior"), "PathBehavior")
                    .AddParameter("operator", _("Modification sign"))
                    .AddParameter("expression", _("Value"))
                    .SetFunctionName("SetCurrentSegment").SetGetter("GetCurrentSegment").SetManipulatedType("number").SetIncludeFile("PathBehavior/PathBehavior.h");

                aut.AddExpression("Segment", _("Current segment"), _("Number of the current segment"), _("Position"), "CppPlatform/Extensions/pathicon16.png")
                    .AddParameter("object", _("Object"))
                    .AddParameter("behavior", _("Behavior"), "PathBehavior")
                    .SetFunctionName("GetCurrentSegment").SetIncludeFile("PathBehavior/PathBehavior.h");


                aut.AddCondition("GetPosition",
                               _("Position of the object on the segment"),
                               _("Return true if the position on the path satisfies the test.\nPosition on a segment is a value between 0 and 1."),
                               _("The position of _PARAM0_ on the current segment is _PARAM2__PARAM3_"),
                               _("Position"),
                               "CppPlatform/Extensions/pathicon24.png",
                               "CppPlatform/Extensions/pathicon16.png")

                    .AddParameter("object", _("Object"))
                    .AddParameter("behavior", _("Behavior"), "PathBehavior")
                    .AddParameter("relationalOperator", _("Comparison sign"))
                    .AddParameter("expression", _("Value"))
                    .SetFunctionName("GetPositionOnSegment").SetManipulatedType("number").SetIncludeFile("PathBehavior/PathBehavior.h");


                aut.AddAction("SetPosition",
                               _("Put the object on a precise position of the current segment"),
                               _("Put the object on a precise position on the current segment."),
                               _("Put _PARAM0_ on _PARAM2__PARAM3_ on the current segment"),
                               _("Position"),
                               "CppPlatform/Extensions/pathicon24.png",
                               "CppPlatform/Extensions/pathicon16.png")

                    .AddParameter("object", _("Object"))
                    .AddParameter("behavior", _("Behavior"), "PathBehavior")
                    .AddParameter("operator", _("Modification sign"))
                    .AddParameter("expression", _("Value"))
                    .SetFunctionName("SetPositionOnSegment").SetGetter("GetPositionOnSegment").SetManipulatedType("number").SetIncludeFile("PathBehavior/PathBehavior.h");

                aut.AddExpression("Position", _("Position on the segment"), _("Position on the segment ( value between 0 and 1 )"), _("Position"), "CppPlatform/Extensions/pathicon16.png")
                    .AddParameter("object", _("Object"))
                    .AddParameter("behavior", _("Behavior"), "PathBehavior")
                    .SetFunctionName("GetPositionOnSegment").SetIncludeFile("PathBehavior/PathBehavior.h");


                aut.AddCondition("GetPathName",
                               _("Path name"),
                               _("Test the path name."),
                               _("The name of the current path of _PARAM0_ is _PARAM1__PARAM2_"),
                               _("Path"),
                               "CppPlatform/Extensions/pathicon24.png",
                               "CppPlatform/Extensions/pathicon16.png")

                    .AddParameter("object", _("Object"))
                    .AddParameter("behavior", _("Behavior"), "PathBehavior")
                    .AddParameter("relationalOperator", _("Comparison sign"))
                    .AddParameter("string", _("Name"))
                    .SetFunctionName("GetCurrentPathName").SetManipulatedType("string").SetIncludeFile("PathBehavior/PathBehavior.h");


                aut.AddAction("SetPathName",
                               _("Change the path"),
                               _("Change the path used."),
                               _("Set _PARAM2_ as the current path of _PARAM0_"),
                               _("Path"),
                               "CppPlatform/Extensions/pathicon24.png",
                               "CppPlatform/Extensions/pathicon16.png")

                    .AddParameter("object", _("Object"))
                    .AddParameter("behavior", _("Behavior"), "PathBehavior")
                    .AddParameter("string", _("Name"))
                    .SetFunctionName("ChangeCurrentPath").SetIncludeFile("PathBehavior/PathBehavior.h");

                aut.AddStrExpression("CurrentPathName", _("Current path name"), _("Current path name"), _("Path"), "CppPlatform/Extensions/pathicon16.png")
                    .AddParameter("object", _("Object"))
                    .AddParameter("behavior", _("Behavior"), "PathBehavior")
                    .SetFunctionName("GetCurrentPathName").SetIncludeFile("PathBehavior/PathBehavior.h");


                aut.AddCondition("GetOffsetX",
                               _("X position of the path"),
                               _("Return true if the X position satisfies the test."),
                               _("The X position of the path of _PARAM0_ is _PARAM2__PARAM3_"),
                               _("Path position"),
                               "CppPlatform/Extensions/pathicon24.png",
                               "CppPlatform/Extensions/pathicon16.png")

                    .AddParameter("object", _("Object"))
                    .AddParameter("behavior", _("Behavior"), "PathBehavior")
                    .AddParameter("relationalOperator", _("Comparison sign"))
                    .AddParameter("expression", _("Value"))
                    .SetFunctionName("GetOffsetX").SetManipulatedType("number").SetIncludeFile("PathBehavior/PathBehavior.h");


                aut.AddAction("SetOffsetX",
                               _("Modify the path's X position"),
                               _("Change the path's X position."),
                               _("Do _PARAM2__PARAM3_ to the X position of the path of _PARAM0_"),
                               _("Path position"),
                               "CppPlatform/Extensions/pathicon24.png",
                               "CppPlatform/Extensions/pathicon16.png")

                    .AddParameter("object", _("Object"))
                    .AddParameter("behavior", _("Behavior"), "PathBehavior")
                    .AddParameter("operator", _("Modification sign"))
                    .AddParameter("expression", _("Value"))
                    .SetFunctionName("SetOffsetX").SetGetter("GetOffsetX").SetManipulatedType("number").SetIncludeFile("PathBehavior/PathBehavior.h");

                aut.AddExpression("PathX", _("X position of the path"), _("X position of the path"), _("Path position"), "CppPlatform/Extensions/pathicon16.png")
                    .AddParameter("object", _("Object"))
                    .AddParameter("behavior", _("Behavior"), "PathBehavior")
                    .SetFunctionName("GetOffsetX").SetIncludeFile("PathBehavior/PathBehavior.h");


                aut.AddCondition("GetOffsetY",
                               _("Path Y position"),
                               _("Return true if the Y position satisfies the test."),
                               _("The Y position of the path of _PARAM0_ is _PARAM2__PARAM3_"),
                               _("Path position"),
                               "CppPlatform/Extensions/pathicon24.png",
                               "CppPlatform/Extensions/pathicon16.png")

                    .AddParameter("object", _("Object"))
                    .AddParameter("behavior", _("Behavior"), "PathBehavior")
                    .AddParameter("relationalOperator", _("Comparison sign"))
                    .AddParameter("expression", _("Value"))
                    .SetFunctionName("GetOffsetY").SetManipulatedType("number").SetIncludeFile("PathBehavior/PathBehavior.h");


                aut.AddAction("SetOffsetY",
                               _("Modify the path's Y position"),
                               _("Change the path's Y position."),
                               _("Do _PARAM2__PARAM3_ to the Y position of the path of _PARAM0_"),
                               _("Path position"),
                               "CppPlatform/Extensions/pathicon24.png",
                               "CppPlatform/Extensions/pathicon16.png")

                    .AddParameter("object", _("Object"))
                    .AddParameter("behavior", _("Behavior"), "PathBehavior")
                    .AddParameter("operator", _("Modification sign"))
                    .AddParameter("expression", _("Value"))
                    .SetFunctionName("SetOffsetY").SetGetter("GetOffsetY").SetManipulatedType("number").SetIncludeFile("PathBehavior/PathBehavior.h");

                aut.AddExpression("PathY", _("Path Y position"), _("Path Y position"), _("Path position"), "CppPlatform/Extensions/pathicon16.png")
                    .AddParameter("object", _("Object"))
                    .AddParameter("behavior", _("Behavior"), "PathBehavior")
                    .SetFunctionName("GetOffsetY").SetIncludeFile("PathBehavior/PathBehavior.h");


                aut.AddCondition("GetFollowAngle",
                               _("Automatic rotation"),
                               _("Return true if the object's angle is automatically updated."),
                               _("The angle of _PARAM0_ is automatically updated on the path"),
                               _("Options"),
                               "CppPlatform/Extensions/pathicon24.png",
                               "CppPlatform/Extensions/pathicon16.png")

                    .AddParameter("object", _("Object"))
                    .AddParameter("behavior", _("Behavior"), "PathBehavior")
                    .SetFunctionName("FollowAngle").SetIncludeFile("PathBehavior/PathBehavior.h");


                aut.AddAction("SetFollowAngle",
                               _("De/activate automatic rotation"),
                               _("Activate or deactivate the automatic change of the angle of the object on the path."),
                               _("Activate automatic rotation of _PARAM0_: _PARAM2_"),
                               _("Options"),
                               "CppPlatform/Extensions/pathicon24.png",
                               "CppPlatform/Extensions/pathicon16.png")

                    .AddParameter("object", _("Object"))
                    .AddParameter("behavior", _("Behavior"), "PathBehavior")
                    .AddParameter("yesorno", _("Activate \?"))
                    .SetFunctionName("SetFollowAngle").SetIncludeFile("PathBehavior/PathBehavior.h");


                aut.AddCondition("GetAngleOffset",
                               _("Angle offset"),
                               _("Return true if the angle offset satifies the condition."),
                               _("The angle offset of _PARAM0_ is _PARAM2__PARAM3_"),
                               _("Options"),
                               "CppPlatform/Extensions/pathicon24.png",
                               "CppPlatform/Extensions/pathicon16.png")

                    .AddParameter("object", _("Object"))
                    .AddParameter("behavior", _("Behavior"), "PathBehavior")
                    .AddParameter("relationalOperator", _("Comparison sign"))
                    .AddParameter("expression", _("Value"))
                    .SetFunctionName("GetAngleOffset").SetManipulatedType("number").SetIncludeFile("PathBehavior/PathBehavior.h");


                aut.AddAction("SetAngleOffset",
                               _("Change the angle offset"),
                               _("Change the angle offset"),
                               _("Do _PARAM2__PARAM3_ to angle offset of _PARAM0_"),
                               _("Options"),
                               "CppPlatform/Extensions/pathicon24.png",
                               "CppPlatform/Extensions/pathicon16.png")

                    .AddParameter("object", _("Object"))
                    .AddParameter("behavior", _("Behavior"), "PathBehavior")
                    .AddParameter("operator", _("Modification sign"))
                    .AddParameter("expression", _("Value"))
                    .SetFunctionName("SetAngleOffset").SetGetter("GetAngleOffset").SetManipulatedType("number").SetIncludeFile("PathBehavior/PathBehavior.h");

                aut.AddExpression("AngleOffset", _("Angle offset"), _("Add an offset to the angle of the object"), _("Options"), "CppPlatform/Extensions/pathicon16.png")
                    .AddParameter("object", _("Object"))
                    .AddParameter("behavior", _("Behavior"), "PathBehavior")
                    .SetFunctionName("GetAngleOffset").SetIncludeFile("PathBehavior/PathBehavior.h");


                aut.AddCondition("GetSpeed",
                               _("Speed"),
                               _("Return true if the speed satisfies the condition."),
                               _("The speed of _PARAM0_ on the path is _PARAM2__PARAM3_"),
                               _("Movement"),
                               "CppPlatform/Extensions/pathicon24.png",
                               "CppPlatform/Extensions/pathicon16.png")

                    .AddParameter("object", _("Object"))
                    .AddParameter("behavior", _("Behavior"), "PathBehavior")
                    .AddParameter("relationalOperator", _("Comparison sign"))
                    .AddParameter("expression", _("Value"))
                    .SetFunctionName("GetSpeed").SetManipulatedType("number").SetIncludeFile("PathBehavior/PathBehavior.h");


                aut.AddAction("SetSpeed",
                               _("Change the speed"),
                               _("Change the speed of the object on the path."),
                               _("Do _PARAM1__PARAM2_ to the speed of _PARAM0_ on the path"),
                               _("Movement"),
                               "CppPlatform/Extensions/pathicon24.png",
                               "CppPlatform/Extensions/pathicon16.png")

                    .AddParameter("object", _("Object"))
                    .AddParameter("behavior", _("Behavior"), "PathBehavior")
                    .AddParameter("operator", _("Modification sign"))
                    .AddParameter("expression", _("Value"))
                    .SetFunctionName("SetSpeed").SetGetter("GetSpeed").SetManipulatedType("number").SetIncludeFile("PathBehavior/PathBehavior.h");

                aut.AddExpression("Speed", _("Speed"), _("Moving speed on the path"), _("Movement"), "CppPlatform/Extensions/pathicon16.png")
                    .AddParameter("object", _("Object"))
                    .AddParameter("behavior", _("Behavior"), "PathBehavior")
                    .SetFunctionName("GetSpeed").SetIncludeFile("PathBehavior/PathBehavior.h");


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
