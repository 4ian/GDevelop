/**

Game Develop - Path Automatism Extension
Copyright (c) 2010-2014 Florian Rival (Florian.Rival@gmail.com)

This software is provided 'as-is', without any express or implied
warranty. In no event will the authors be held liable for any damages
arising from the use of this software.

Permission is granted to anyone to use this software for any purpose,
including commercial applications, and to alter it and redistribute it
freely, subject to the following restrictions:

    1. The origin of this software must not be misrepresented; you must not
    claim that you wrote the original software. If you use this software
    in a product, an acknowledgment in the product documentation would be
    appreciated but is not required.

    2. Altered source versions must be plainly marked as such, and must not be
    misrepresented as being the original software.

    3. This notice may not be removed or altered from any source
    distribution.

*/
/**
 * Contributors to the extension:
 * Victor Levasseur ( Created Path automatism editor and enhanced extension )
 */

#include "GDCpp/ExtensionBase.h"
#include "GDCore/Tools/Version.h"
#include "PathAutomatism.h"
#include "ScenePathDatas.h"
#include <boost/version.hpp>

/**
 * \brief This class declares information about the extension.
 */
class Extension : public ExtensionBase
{
public:

    /**
     * Constructor of an extension declares everything the extension contains : Objects, actions, conditions and expressions.
     */
    Extension()
    {
        SetExtensionInformation("PathAutomatism",
                              _("Path Automatism"),
                              _("Automatism allowing to move objects on a predefined path"),
                              "Florian Rival",
                              "zlib/libpng License (Open Source)");

            {
                gd::AutomatismMetadata & aut = AddAutomatism("PathAutomatism",
                      _("Path"),
                      _("Path"),
                      _("Make objects move on a predefined path."),
                      "",
                      "CppPlatform/Extensions/pathicon.png",
                      "PathAutomatism",
                      boost::shared_ptr<gd::Automatism>(new PathAutomatism),
                      boost::shared_ptr<gd::AutomatismsSharedData>(new ScenePathDatas));

                #if defined(GD_IDE_ONLY)

                aut.SetIncludeFile("PathAutomatism/PathAutomatism.h");

                aut.AddAction("SetReverseAtEnd",
                               _("De/activate rounding"),
                               _("Activate or desactivate rounding"),
                               _("Activate rounding for _PARAM0_: _PARAM2_"),
                               _("Options"),
                               "CppPlatform/Extensions/pathicon24.png",
                               "CppPlatform/Extensions/pathicon16.png")
                    .AddParameter("object", _("Object"))
                    .AddParameter("automatism", _("Automatism"), "PathAutomatism", false)
                    .AddParameter("yesorno", _("Activate"))
                    .codeExtraInformation.SetFunctionName("SetReverseAtEnd").SetIncludeFile("PathAutomatism/PathAutomatism.h");

                aut.AddAction("SetStopAtEnd",
                               _("De/activate the stop at the end of the path"),
                               _("Activate or deactivate the stop at the end of the object"),
                               _("Stop _PARAM0_ when the end of the path is reached: _PARAM2_"),
                               _("Options"),
                               "CppPlatform/Extensions/pathicon24.png",
                               "CppPlatform/Extensions/pathicon16.png")
                    .AddParameter("object", _("Object"))
                    .AddParameter("automatism", _("Automatism"), "PathAutomatism", false)
                    .AddParameter("yesorno", _("Activate"))
                    .codeExtraInformation.SetFunctionName("SetStopAtEnd").SetIncludeFile("PathAutomatism/PathAutomatism.h");

                aut.AddCondition("ReverseAtEnd",
                               _("Rounds"),
                               _("Return true if the object round"),
                               _("_PARAM0_ is rounding"),
                               _("Options"),
                               "CppPlatform/Extensions/pathicon24.png",
                               "CppPlatform/Extensions/pathicon16.png")
                    .AddParameter("object", _("Object"))
                    .AddParameter("automatism", _("Automatism"), "PathAutomatism", false)
                    .codeExtraInformation.SetFunctionName("ReverseAtEnd").SetIncludeFile("PathAutomatism/PathAutomatism.h");

                aut.AddCondition("StopAtEnd",
                               _("Stop at the end of the path"),
                               _("Return true if the object stops at the end of its path."),
                               _("_PARAM0_ stops at the end of the path"),
                               _("Options"),
                               "CppPlatform/Extensions/pathicon24.png",
                               "CppPlatform/Extensions/pathicon16.png")
                    .AddParameter("object", _("Object"))
                    .AddParameter("automatism", _("Automatism"), "PathAutomatism", false)
                    .codeExtraInformation.SetFunctionName("StopAtEnd").SetIncludeFile("PathAutomatism/PathAutomatism.h");

                aut.AddAction("Reverse",
                               _("Invert the movement on the path"),
                               _("Invert the movement on the path."),
                               _("Invert the sens of the movement of _PARAM0_ on its path"),
                               _("Movement"),
                               "CppPlatform/Extensions/pathicon24.png",
                               "CppPlatform/Extensions/pathicon16.png")
                    .AddParameter("object", _("Object"))
                    .AddParameter("automatism", _("Automatism"), "PathAutomatism", false)
                    .codeExtraInformation.SetFunctionName("Reverse").SetIncludeFile("PathAutomatism/PathAutomatism.h");

                aut.AddCondition("GetSegment",
                               _("Number of the segment on the path"),
                               _("True if the number of the current segment on the path satisfies the test."),
                               _("The number of the current segment of the path of _PARAM0_ is _PARAM2__PARAM3_"),
                               _("Position"),
                               "CppPlatform/Extensions/pathicon24.png",
                               "CppPlatform/Extensions/pathicon16.png")
                    .AddParameter("object", _("Object"))
                    .AddParameter("automatism", _("Automatism"), "PathAutomatism", false)
                    .AddParameter("relationalOperator", _("Comparison sign"))
                    .AddParameter("expression", _("Value"))
                    .codeExtraInformation.SetFunctionName("GetCurrentSegment").SetManipulatedType("number").SetIncludeFile("PathAutomatism/PathAutomatism.h");

                aut.AddAction("EnterSegment",
                               _("Position on the segment of a path"),
                               _("Put the object directly on specific segment of the path"),
                               _("Do _PARAM2__PARAM3_ to number of the current segment of _PARAM0_"),
                               _("Position"),
                               "CppPlatform/Extensions/pathicon24.png",
                               "CppPlatform/Extensions/pathicon16.png")
                    .AddParameter("object", _("Object"))
                    .AddParameter("automatism", _("Automatism"), "PathAutomatism", false)
                    .AddParameter("operator", _("Modification sign"))
                    .AddParameter("expression", _("Value"))
                    .codeExtraInformation.SetFunctionName("SetCurrentSegment").SetAssociatedGetter("GetCurrentSegment").SetManipulatedType("number").SetIncludeFile("PathAutomatism/PathAutomatism.h");

                aut.AddExpression("Segment", _("Current segment"), _("Number of the current segment"), _("Position"), "CppPlatform/Extensions/pathicon16.png")
                    .AddParameter("object", _("Object"))
                    .AddParameter("automatism", _("Automatism"), "PathAutomatism", false)
                    .codeExtraInformation.SetFunctionName("GetCurrentSegment").SetIncludeFile("PathAutomatism/PathAutomatism.h");

                aut.AddCondition("GetPosition",
                               _("Position of the object on the segment"),
                               _("Return true if the position on the path satisfy the test.\nPosition on a segment is a value between 0 and 1."),
                               _("The position of _PARAM0_ on the current segment is _PARAM2__PARAM3_"),
                               _("Position"),
                               "CppPlatform/Extensions/pathicon24.png",
                               "CppPlatform/Extensions/pathicon16.png")
                    .AddParameter("object", _("Object"))
                    .AddParameter("automatism", _("Automatism"), "PathAutomatism", false)
                    .AddParameter("relationalOperator", _("Comparison sign"))
                    .AddParameter("expression", _("Value"))
                    .codeExtraInformation.SetFunctionName("GetPositionOnSegment").SetManipulatedType("number").SetIncludeFile("PathAutomatism/PathAutomatism.h");

                aut.AddAction("SetPosition",
                               _("Put the object on a precise position of the current segment"),
                               _("Put the object on a precise position on the current segment."),
                               _("Put _PARAM0_ on _PARAM2__PARAM3_ on the current segment"),
                               _("Position"),
                               "CppPlatform/Extensions/pathicon24.png",
                               "CppPlatform/Extensions/pathicon16.png")
                    .AddParameter("object", _("Object"))
                    .AddParameter("automatism", _("Automatism"), "PathAutomatism", false)
                    .AddParameter("operator", _("Modification sign"))
                    .AddParameter("expression", _("Value"))
                    .codeExtraInformation.SetFunctionName("SetPositionOnSegment").SetAssociatedGetter("GetPositionOnSegment").SetManipulatedType("number").SetIncludeFile("PathAutomatism/PathAutomatism.h");

                aut.AddExpression("Position", _("Position on the segment"), _("Position on the segment ( value between 0 and 1 )"), _("Position"), "CppPlatform/Extensions/pathicon16.png")
                    .AddParameter("object", _("Object"))
                    .AddParameter("automatism", _("Automatism"), "PathAutomatism", false)
                    .codeExtraInformation.SetFunctionName("GetPositionOnSegment").SetIncludeFile("PathAutomatism/PathAutomatism.h");

                aut.AddCondition("GetPathName",
                               _("Path name"),
                               _("Test the path name."),
                               _("The name of the current path of _PARAM0_ is _PARAM1__PARAM2_"),
                               _("Path"),
                               "CppPlatform/Extensions/pathicon24.png",
                               "CppPlatform/Extensions/pathicon16.png")
                    .AddParameter("object", _("Object"))
                    .AddParameter("automatism", _("Automatism"), "PathAutomatism", false)
                    .AddParameter("relationalOperator", _("Comparison sign"))
                    .AddParameter("string", _("Name"))
                    .codeExtraInformation.SetFunctionName("GetCurrentPathName").SetManipulatedType("string").SetIncludeFile("PathAutomatism/PathAutomatism.h");

                aut.AddAction("SetPathName",
                               _("Change the path"),
                               _("Change the path used."),
                               _("Set _PARAM2_ as the current path of _PARAM0_"),
                               _("Path"),
                               "CppPlatform/Extensions/pathicon24.png",
                               "CppPlatform/Extensions/pathicon16.png")
                    .AddParameter("object", _("Object"))
                    .AddParameter("automatism", _("Automatism"), "PathAutomatism", false)
                    .AddParameter("string", _("Name"))
                    .codeExtraInformation.SetFunctionName("ChangeCurrentPath").SetIncludeFile("PathAutomatism/PathAutomatism.h");

                aut.AddStrExpression("CurrentPathName", _("Current path name"), _("Current path name"), _("Path"), "CppPlatform/Extensions/pathicon16.png")
                    .AddParameter("object", _("Object"))
                    .AddParameter("automatism", _("Automatism"), "PathAutomatism", false)
                    .codeExtraInformation.SetFunctionName("GetCurrentPathName").SetIncludeFile("PathAutomatism/PathAutomatism.h");

                aut.AddCondition("GetOffsetX",
                               _("X position of the path"),
                               _("Return true if the X position satisfies the test."),
                               _("The X position of the path of _PARAM0_ is _PARAM2__PARAM3_"),
                               _("Path position"),
                               "CppPlatform/Extensions/pathicon24.png",
                               "CppPlatform/Extensions/pathicon16.png")
                    .AddParameter("object", _("Object"))
                    .AddParameter("automatism", _("Automatism"), "PathAutomatism", false)
                    .AddParameter("relationalOperator", _("Comparison sign"))
                    .AddParameter("expression", _("Value"))
                    .codeExtraInformation.SetFunctionName("GetOffsetX").SetManipulatedType("number").SetIncludeFile("PathAutomatism/PathAutomatism.h");

                aut.AddAction("SetOffsetX",
                               _("Modify the path X position"),
                               _("Change the path X position."),
                               _("Do _PARAM2__PARAM3_ to the X position of the path of _PARAM0_"),
                               _("Path position"),
                               "CppPlatform/Extensions/pathicon24.png",
                               "CppPlatform/Extensions/pathicon16.png")
                    .AddParameter("object", _("Object"))
                    .AddParameter("automatism", _("Automatism"), "PathAutomatism", false)
                    .AddParameter("operator", _("Modification sign"))
                    .AddParameter("expression", _("Value"))
                    .codeExtraInformation.SetFunctionName("SetOffsetX").SetAssociatedGetter("GetOffsetX").SetManipulatedType("number").SetIncludeFile("PathAutomatism/PathAutomatism.h");

                aut.AddExpression("PathX", _("X position of the path"), _("X position of the path"), _("Path position"), "CppPlatform/Extensions/pathicon16.png")
                    .AddParameter("object", _("Object"))
                    .AddParameter("automatism", _("Automatism"), "PathAutomatism", false)
                    .codeExtraInformation.SetFunctionName("GetOffsetX").SetIncludeFile("PathAutomatism/PathAutomatism.h");

                aut.AddCondition("GetOffsetY",
                               _("Path Y position"),
                               _("Return true if the Y position satisfies the test."),
                               _("The Y position of the path of _PARAM0_ is _PARAM2__PARAM3_"),
                               _("Path position"),
                               "CppPlatform/Extensions/pathicon24.png",
                               "CppPlatform/Extensions/pathicon16.png")
                    .AddParameter("object", _("Object"))
                    .AddParameter("automatism", _("Automatism"), "PathAutomatism", false)
                    .AddParameter("relationalOperator", _("Comparison sign"))
                    .AddParameter("expression", _("Value"))
                    .codeExtraInformation.SetFunctionName("GetOffsetY").SetManipulatedType("number").SetIncludeFile("PathAutomatism/PathAutomatism.h");

                aut.AddAction("SetOffsetY",
                               _("Modify the path Y position"),
                               _("Change the path Y position."),
                               _("Do _PARAM2__PARAM3_ to the Y position of the path of _PARAM0_"),
                               _("Path position"),
                               "CppPlatform/Extensions/pathicon24.png",
                               "CppPlatform/Extensions/pathicon16.png")
                    .AddParameter("object", _("Object"))
                    .AddParameter("automatism", _("Automatism"), "PathAutomatism", false)
                    .AddParameter("operator", _("Modification sign"))
                    .AddParameter("expression", _("Value"))
                    .codeExtraInformation.SetFunctionName("SetOffsetY").SetAssociatedGetter("GetOffsetY").SetManipulatedType("number").SetIncludeFile("PathAutomatism/PathAutomatism.h");

                aut.AddExpression("PathY", _("Path Y position"), _("Path Y position"), _("Path position"), "CppPlatform/Extensions/pathicon16.png")
                    .AddParameter("object", _("Object"))
                    .AddParameter("automatism", _("Automatism"), "PathAutomatism", false)
                    .codeExtraInformation.SetFunctionName("GetOffsetY").SetIncludeFile("PathAutomatism/PathAutomatism.h");

                aut.AddCondition("GetFollowAngle",
                               _("Automatic rotation"),
                               _("Return true if the object's angle is automatically updated."),
                               _("The angle of _PARAM0_ is automatically updated on the path"),
                               _("Options"),
                               "CppPlatform/Extensions/pathicon24.png",
                               "CppPlatform/Extensions/pathicon16.png")
                    .AddParameter("object", _("Object"))
                    .AddParameter("automatism", _("Automatism"), "PathAutomatism", false)
                    .codeExtraInformation.SetFunctionName("FollowAngle").SetIncludeFile("PathAutomatism/PathAutomatism.h");

                aut.AddAction("SetFollowAngle",
                               _("De/activate automatic rotation"),
                               _("Activate or deactivate the automatic update of the angle of the object on the path."),
                               _("Activate automatic rotation of _PARAM0_: _PARAM2_"),
                               _("Options"),
                               "CppPlatform/Extensions/pathicon24.png",
                               "CppPlatform/Extensions/pathicon16.png")
                    .AddParameter("object", _("Object"))
                    .AddParameter("automatism", _("Automatism"), "PathAutomatism", false)
                    .AddParameter("yesorno", _("Activate \?"))
                    .codeExtraInformation.SetFunctionName("SetFollowAngle").SetIncludeFile("PathAutomatism/PathAutomatism.h");

                aut.AddCondition("GetAngleOffset",
                               _("Angle offset"),
                               _("Return true if the angle offset satifies the condition."),
                               _("The angle offset of _PARAM0_ is _PARAM2__PARAM3_"),
                               _("Options"),
                               "CppPlatform/Extensions/pathicon24.png",
                               "CppPlatform/Extensions/pathicon16.png")
                    .AddParameter("object", _("Object"))
                    .AddParameter("automatism", _("Automatism"), "PathAutomatism", false)
                    .AddParameter("relationalOperator", _("Comparison sign"))
                    .AddParameter("expression", _("Value"))
                    .codeExtraInformation.SetFunctionName("GetAngleOffset").SetManipulatedType("number").SetIncludeFile("PathAutomatism/PathAutomatism.h");

                aut.AddAction("SetAngleOffset",
                               _("Change the angle offset"),
                               _("Change the angle offset"),
                               _("Do _PARAM2__PARAM3_ to angle offset of _PARAM0_"),
                               _("Options"),
                               "CppPlatform/Extensions/pathicon24.png",
                               "CppPlatform/Extensions/pathicon16.png")
                    .AddParameter("object", _("Object"))
                    .AddParameter("automatism", _("Automatism"), "PathAutomatism", false)
                    .AddParameter("operator", _("Modification sign"))
                    .AddParameter("expression", _("Value"))
                    .codeExtraInformation.SetFunctionName("SetAngleOffset").SetAssociatedGetter("GetAngleOffset").SetManipulatedType("number").SetIncludeFile("PathAutomatism/PathAutomatism.h");

                aut.AddExpression("AngleOffset", _("Angle offset"), _("Add an offset to the angle of the object"), _("Options"), "CppPlatform/Extensions/pathicon16.png")
                    .AddParameter("object", _("Object"))
                    .AddParameter("automatism", _("Automatism"), "PathAutomatism", false)
                    .codeExtraInformation.SetFunctionName("GetAngleOffset").SetIncludeFile("PathAutomatism/PathAutomatism.h");

                aut.AddCondition("GetSpeed",
                               _("Speed"),
                               _("Return true if the speed satisfy the condition."),
                               _("The speed of _PARAM0_ on the path is _PARAM2__PARAM3_"),
                               _("Movement"),
                               "CppPlatform/Extensions/pathicon24.png",
                               "CppPlatform/Extensions/pathicon16.png")
                    .AddParameter("object", _("Object"))
                    .AddParameter("automatism", _("Automatism"), "PathAutomatism", false)
                    .AddParameter("relationalOperator", _("Comparison sign"))
                    .AddParameter("expression", _("Value"))
                    .codeExtraInformation.SetFunctionName("GetSpeed").SetManipulatedType("number").SetIncludeFile("PathAutomatism/PathAutomatism.h");

                aut.AddAction("SetSpeed",
                               _("Change the speed"),
                               _("Change the speed of the object on the path."),
                               _("Do _PARAM1__PARAM2_ to speed of of _PARAM0_ on the path"),
                               _("Movement"),
                               "CppPlatform/Extensions/pathicon24.png",
                               "CppPlatform/Extensions/pathicon16.png")
                    .AddParameter("object", _("Object"))
                    .AddParameter("automatism", _("Automatism"), "PathAutomatism", false)
                    .AddParameter("operator", _("Modification sign"))
                    .AddParameter("expression", _("Value"))
                    .codeExtraInformation.SetFunctionName("SetSpeed").SetAssociatedGetter("GetSpeed").SetManipulatedType("number").SetIncludeFile("PathAutomatism/PathAutomatism.h");

                aut.AddExpression("Speed", _("Speed"), _("Moving speed on the path"), _("Movement"), "CppPlatform/Extensions/pathicon16.png")
                    .AddParameter("object", _("Object"))
                    .AddParameter("automatism", _("Automatism"), "PathAutomatism", false)
                    .codeExtraInformation.SetFunctionName("GetSpeed").SetIncludeFile("PathAutomatism/PathAutomatism.h");

                #endif

            };

        GD_COMPLETE_EXTENSION_COMPILATION_INFORMATION();
    };
    virtual ~Extension() {};
};

/**
 * Used by Game Develop to create the extension class
 * -- Do not need to be modified. --
 */
extern "C" ExtensionBase * GD_EXTENSION_API CreateGDExtension() {
    return new Extension;
}

/**
 * Used by Game Develop to destroy the extension class
 * -- Do not need to be modified. --
 */
extern "C" void GD_EXTENSION_API DestroyGDExtension(ExtensionBase * p) {
    delete p;
}

