/**

Game Develop - Path Automatism Extension
Copyright (c) 2010-2011 Florian Rival (Florian.Rival@gmail.com)

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

#include "GDL/ExtensionBase.h"
#include "GDL/Version.h"
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
            DECLARE_THE_EXTENSION("PathAutomatism",
                                  _("Path Automatism"),
                                  _("Automatism allowing to move objects on a predefined path"),
                                  "Compil Games",
                                  "zlib/libpng License ( Open Source )")

                DECLARE_AUTOMATISM("PathAutomatism",
                          _("Path"),
                          _("Path"),
                          _("Automatism allowing to move objects on a predefined path."),
                          "",
                          "res/path32.png",
                          PathAutomatism,
                          ScenePathDatas)

                    #if defined(GD_IDE_ONLY)

                    automatismInfo.SetIncludeFile("PathAutomatism/PathAutomatism.h");

                    DECLARE_AUTOMATISM_ACTION("SetReverseAtEnd",
                                   _("De/activate rounding"),
                                   _("Activate or desactivate rounding"),
                                   _("Activate rounding for _PARAM0_: _PARAM2_"),
                                   _("Options"),
                                   "res/actions/window24.png",
                                   "res/actions/window.png");

                        instrInfo.AddParameter("object", _("Object"), "", false);
                        instrInfo.AddParameter("automatism", _("Automatism"), "PathAutomatism", false);
                        instrInfo.AddParameter("yesorno", _("Activate"), "", false);

                        instrInfo.cppCallingInformation.SetFunctionName("SetReverseAtEnd").SetIncludeFile("PathAutomatism/PathAutomatism.h");

                    DECLARE_END_AUTOMATISM_ACTION()

                    DECLARE_AUTOMATISM_ACTION("SetStopAtEnd",
                                   _("De/activate the stop at the end of the path"),
                                   _("Activate or deactivate the stop at the end of the object"),
                                   _("Stop _PARAM0_ when the end of the path is reached: _PARAM2_"),
                                   _("Options"),
                                   "res/actions/window24.png",
                                   "res/actions/window.png");

                        instrInfo.AddParameter("object", _("Object"), "", false);
                        instrInfo.AddParameter("automatism", _("Automatism"), "PathAutomatism", false);
                        instrInfo.AddParameter("yesorno", _("Activate"), "", false);

                        instrInfo.cppCallingInformation.SetFunctionName("SetStopAtEnd").SetIncludeFile("PathAutomatism/PathAutomatism.h");

                    DECLARE_END_AUTOMATISM_ACTION()

                    DECLARE_AUTOMATISM_CONDITION("ReverseAtEnd",
                                   _("Rounds"),
                                   _("Return true if the object round"),
                                   _("_PARAM0_ is rounding"),
                                   _("Options"),
                                   "res/actions/window24.png",
                                   "res/actions/window.png");

                        instrInfo.AddParameter("object", _("Object"), "", false);
                        instrInfo.AddParameter("automatism", _("Automatism"), "PathAutomatism", false);

                        instrInfo.cppCallingInformation.SetFunctionName("ReverseAtEnd").SetIncludeFile("PathAutomatism/PathAutomatism.h");
                    DECLARE_END_AUTOMATISM_CONDITION()

                    DECLARE_AUTOMATISM_CONDITION("StopAtEnd",
                                   _("Stop at the end of the path"),
                                   _("Return true if the object stops at the end of its path."),
                                   _("_PARAM0_ stops at the end of the path"),
                                   _("Options"),
                                   "res/actions/window24.png",
                                   "res/actions/window.png");

                        instrInfo.AddParameter("object", _("Object"), "", false);
                        instrInfo.AddParameter("automatism", _("Automatism"), "PathAutomatism", false);

                        instrInfo.cppCallingInformation.SetFunctionName("StopAtEnd").SetIncludeFile("PathAutomatism/PathAutomatism.h");

                    DECLARE_END_AUTOMATISM_CONDITION()

                    DECLARE_AUTOMATISM_ACTION("Reverse",
                                   _("Invert the movement on the path"),
                                   _("Invert the movement on the path."),
                                   _("Invert the sens of the movement of _PARAM0_ on its path"),
                                   _("Movement"),
                                   "res/actions/window24.png",
                                   "res/actions/window.png");

                        instrInfo.AddParameter("object", _("Object"), "", false);
                        instrInfo.AddParameter("automatism", _("Automatism"), "PathAutomatism", false);

                        instrInfo.cppCallingInformation.SetFunctionName("Reverse").SetIncludeFile("PathAutomatism/PathAutomatism.h");

                    DECLARE_END_AUTOMATISM_ACTION()

                    DECLARE_AUTOMATISM_CONDITION("GetSegment",
                                   _("Number of the segment on the path"),
                                   _("True if the number of the current segment on the path satisfies the test."),
                                   _("The number of the current segment of the path of _PARAM0_ is _PARAM3__PARAM2_"),
                                   _("Position"),
                                   "res/actions/window24.png",
                                   "res/actions/window.png");

                        instrInfo.AddParameter("object", _("Object"), "", false);
                        instrInfo.AddParameter("automatism", _("Automatism"), "PathAutomatism", false);
                        instrInfo.AddParameter("expression", _("Value"), "", false);
                        instrInfo.AddParameter("relationalOperator", _("Comparison sign"), "", false);

                        instrInfo.cppCallingInformation.SetFunctionName("GetCurrentSegment").SetManipulatedType("number").SetIncludeFile("PathAutomatism/PathAutomatism.h");

                    DECLARE_END_AUTOMATISM_CONDITION()

                    DECLARE_AUTOMATISM_ACTION("EnterSegment",
                                   _("Position on the segment of a path"),
                                   _("Put the object directly on specific segment of the path"),
                                   _("Do _PARAM3__PARAM2_ to number of the current segment of _PARAM0_"),
                                   _("Position"),
                                   "res/actions/window24.png",
                                   "res/actions/window.png");

                        instrInfo.AddParameter("object", _("Object"), "", false);
                        instrInfo.AddParameter("automatism", _("Automatism"), "PathAutomatism", false);
                        instrInfo.AddParameter("expression", _("Value"), "", false);
                        instrInfo.AddParameter("operator", _("Modification sign"), "", false);

                        instrInfo.cppCallingInformation.SetFunctionName("SetCurrentSegment").SetAssociatedGetter("GetCurrentSegment").SetManipulatedType("number").SetIncludeFile("PathAutomatism/PathAutomatism.h");

                    DECLARE_END_AUTOMATISM_ACTION()

                    DECLARE_AUTOMATISM_EXPRESSION("Segment", _("Current segment"), _("Number of the current segment"), _("Position"), "res/actions/window.png")
                        instrInfo.AddParameter("object", _("Object"), "", false);
                        instrInfo.AddParameter("automatism", _("Automatism"), "PathAutomatism", false);

                        instrInfo.cppCallingInformation.SetFunctionName("GetCurrentSegment").SetIncludeFile("PathAutomatism/PathAutomatism.h");
                    DECLARE_END_AUTOMATISM_EXPRESSION()

                    DECLARE_AUTOMATISM_CONDITION("GetPosition",
                                   _("Position of the object on the segment"),
                                   _("Return true if the position on the path satisfy the test.\nPosition on a segment is a value between 0 and 1."),
                                   _("The position of _PARAM0_ on the current segment is _PARAM3__PARAM2_"),
                                   _("Position"),
                                   "res/actions/window24.png",
                                   "res/actions/window.png");

                        instrInfo.AddParameter("object", _("Object"), "", false);
                        instrInfo.AddParameter("automatism", _("Automatism"), "PathAutomatism", false);
                        instrInfo.AddParameter("expression", _("Value"), "", false);
                        instrInfo.AddParameter("relationalOperator", _("Comparison sign"), "", false);

                        instrInfo.cppCallingInformation.SetFunctionName("GetPositionOnSegment").SetManipulatedType("number").SetIncludeFile("PathAutomatism/PathAutomatism.h");

                    DECLARE_END_AUTOMATISM_CONDITION()

                    DECLARE_AUTOMATISM_ACTION("SetPosition",
                                   _("Put the object on a precise position of the current segment"),
                                   _("Put the object on a precise position on the current segment."),
                                   _("Put _PARAM0_ on _PARAM3__PARAM2_ on the current segment"),
                                   _("Position"),
                                   "res/actions/window24.png",
                                   "res/actions/window.png");

                        instrInfo.AddParameter("object", _("Object"), "", false);
                        instrInfo.AddParameter("automatism", _("Automatism"), "PathAutomatism", false);
                        instrInfo.AddParameter("expression", _("Value"), "", false);
                        instrInfo.AddParameter("operator", _("Modification sign"), "", false);

                        instrInfo.cppCallingInformation.SetFunctionName("SetPositionOnSegment").SetAssociatedGetter("GetPositionOnSegment").SetManipulatedType("number").SetIncludeFile("PathAutomatism/PathAutomatism.h");

                    DECLARE_END_AUTOMATISM_ACTION()

                    DECLARE_AUTOMATISM_EXPRESSION("Position", _("Position on the segment"), _("Position on the segment ( value between 0 and 1 )"), _("Position"), "res/actions/window.png")
                        instrInfo.AddParameter("object", _("Object"), "", false);
                        instrInfo.AddParameter("automatism", _("Automatism"), "PathAutomatism", false);

                        instrInfo.cppCallingInformation.SetFunctionName("GetPositionOnSegment").SetIncludeFile("PathAutomatism/PathAutomatism.h");
                    DECLARE_END_AUTOMATISM_EXPRESSION()

                    DECLARE_AUTOMATISM_CONDITION("GetPathName",
                                   _("Path name"),
                                   _("Test the path name."),
                                   _("The name of the current path of _PARAM0_ is _PARAM2__PARAM1_"),
                                   _("Path"),
                                   "res/actions/window24.png",
                                   "res/actions/window.png");

                        instrInfo.AddParameter("object", _("Object"), "", false);
                        instrInfo.AddParameter("automatism", _("Automatism"), "PathAutomatism", false);
                        instrInfo.AddParameter("string", _("Name"), "", false);
                        instrInfo.AddParameter("relationalOperator", _("Comparison sign"), "", false);

                        instrInfo.cppCallingInformation.SetFunctionName("GetCurrentPathName").SetManipulatedType("string").SetIncludeFile("PathAutomatism/PathAutomatism.h");

                    DECLARE_END_AUTOMATISM_CONDITION()

                    DECLARE_AUTOMATISM_ACTION("SetPathName",
                                   _("Change the path"),
                                   _("Change the path used."),
                                   _("Set _PARAM2_ as the current path of _PARAM0_"),
                                   _("Path"),
                                   "res/actions/window24.png",
                                   "res/actions/window.png");

                        instrInfo.AddParameter("object", _("Object"), "", false);
                        instrInfo.AddParameter("automatism", _("Automatism"), "PathAutomatism", false);
                        instrInfo.AddParameter("string", _("Name"), "", false);

                        instrInfo.cppCallingInformation.SetFunctionName("ChangeCurrentPath").SetIncludeFile("PathAutomatism/PathAutomatism.h");

                    DECLARE_END_AUTOMATISM_ACTION()

                    DECLARE_AUTOMATISM_STR_EXPRESSION("CurrentPathName", _("Current path name"), _("Current path name"), _("Path"), "res/actions/window.png")
                        instrInfo.AddParameter("object", _("Object"), "", false);
                        instrInfo.AddParameter("automatism", _("Automatism"), "PathAutomatism", false);

                        instrInfo.cppCallingInformation.SetFunctionName("GetCurrentPathName").SetIncludeFile("PathAutomatism/PathAutomatism.h");
                    DECLARE_END_AUTOMATISM_STR_EXPRESSION()

                    DECLARE_AUTOMATISM_CONDITION("GetOffsetX",
                                   _("X position of the path"),
                                   _("Return true if the X position satisfies the test."),
                                   _("The X position of the path of _PARAM0_ is _PARAM3__PARAM2_"),
                                   _("Path position"),
                                   "res/actions/window24.png",
                                   "res/actions/window.png");

                        instrInfo.AddParameter("object", _("Object"), "", false);
                        instrInfo.AddParameter("automatism", _("Automatism"), "PathAutomatism", false);
                        instrInfo.AddParameter("expression", _("Value"), "", false);
                        instrInfo.AddParameter("relationalOperator", _("Comparison sign"), "", false);

                        instrInfo.cppCallingInformation.SetFunctionName("GetOffsetX").SetManipulatedType("number").SetIncludeFile("PathAutomatism/PathAutomatism.h");

                    DECLARE_END_AUTOMATISM_CONDITION()

                    DECLARE_AUTOMATISM_ACTION("SetOffsetX",
                                   _("Modify the path X position"),
                                   _("Change the path X position."),
                                   _("Do _PARAM3__PARAM2_ to the X position of the path of _PARAM0_"),
                                   _("Path position"),
                                   "res/actions/window24.png",
                                   "res/actions/window.png");

                        instrInfo.AddParameter("object", _("Object"), "", false);
                        instrInfo.AddParameter("automatism", _("Automatism"), "PathAutomatism", false);
                        instrInfo.AddParameter("expression", _("Value"), "", false);
                        instrInfo.AddParameter("operator", _("Modification sign"), "", false);

                        instrInfo.cppCallingInformation.SetFunctionName("SetOffsetX").SetAssociatedGetter("GetOffsetX").SetManipulatedType("number").SetIncludeFile("PathAutomatism/PathAutomatism.h");

                    DECLARE_END_AUTOMATISM_ACTION()

                    DECLARE_AUTOMATISM_EXPRESSION("PathX", _("X position of the path"), _("X position of the path"), _("Path position"), "res/actions/window.png")
                        instrInfo.AddParameter("object", _("Object"), "", false);
                        instrInfo.AddParameter("automatism", _("Automatism"), "PathAutomatism", false);

                        instrInfo.cppCallingInformation.SetFunctionName("GetOffsetX").SetIncludeFile("PathAutomatism/PathAutomatism.h");
                    DECLARE_END_AUTOMATISM_EXPRESSION()

                    DECLARE_AUTOMATISM_CONDITION("GetOffsetY",
                                   _("Path Y position"),
                                   _("Return true if the Y position satisfies the test."),
                                   _("The Y position of the path of _PARAM0_ is _PARAM3__PARAM2_"),
                                   _("Path position"),
                                   "res/actions/window24.png",
                                   "res/actions/window.png");

                        instrInfo.AddParameter("object", _("Object"), "", false);
                        instrInfo.AddParameter("automatism", _("Automatism"), "PathAutomatism", false);
                        instrInfo.AddParameter("expression", _("Value"), "", false);
                        instrInfo.AddParameter("relationalOperator", _("Comparison sign"), "", false);

                        instrInfo.cppCallingInformation.SetFunctionName("GetOffsetY").SetManipulatedType("number").SetIncludeFile("PathAutomatism/PathAutomatism.h");

                    DECLARE_END_AUTOMATISM_CONDITION()

                    DECLARE_AUTOMATISM_ACTION("SetOffsetY",
                                   _("Modify the path Y position"),
                                   _("Change the path Y position."),
                                   _("Do _PARAM3__PARAM2_ to the Y position of the path of _PARAM0_"),
                                   _("Path position"),
                                   "res/actions/window24.png",
                                   "res/actions/window.png");

                        instrInfo.AddParameter("object", _("Object"), "", false);
                        instrInfo.AddParameter("automatism", _("Automatism"), "PathAutomatism", false);
                        instrInfo.AddParameter("expression", _("Value"), "", false);
                        instrInfo.AddParameter("operator", _("Modification sign"), "", false);

                        instrInfo.cppCallingInformation.SetFunctionName("SetOffsetY").SetAssociatedGetter("GetOffsetY").SetManipulatedType("number").SetIncludeFile("PathAutomatism/PathAutomatism.h");

                    DECLARE_END_AUTOMATISM_ACTION()

                    DECLARE_AUTOMATISM_EXPRESSION("PathY", _("Path Y position"), _("Path Y position"), _("Path position"), "res/actions/window.png")
                        instrInfo.AddParameter("object", _("Object"), "", false);
                        instrInfo.AddParameter("automatism", _("Automatism"), "PathAutomatism", false);

                        instrInfo.cppCallingInformation.SetFunctionName("GetOffsetY").SetIncludeFile("PathAutomatism/PathAutomatism.h");
                    DECLARE_END_AUTOMATISM_EXPRESSION()

                    DECLARE_AUTOMATISM_CONDITION("GetFollowAngle",
                                   _("Automatic rotation"),
                                   _("Return true if the object's angle is automatically updated."),
                                   _("The angle of _PARAM0_ is automatically updated on the path"),
                                   _("Options"),
                                   "res/actions/window24.png",
                                   "res/actions/window.png");

                        instrInfo.AddParameter("object", _("Object"), "", false);
                        instrInfo.AddParameter("automatism", _("Automatism"), "PathAutomatism", false);

                        instrInfo.cppCallingInformation.SetFunctionName("FollowAngle").SetIncludeFile("PathAutomatism/PathAutomatism.h");

                    DECLARE_END_AUTOMATISM_CONDITION()

                    DECLARE_AUTOMATISM_ACTION("SetFollowAngle",
                                   _("De/activate automatic rotation"),
                                   _("Activate or deactivate the automatic update of the angle of the object on the path."),
                                   _("Activate automatic rotation of _PARAM0_: _PARAM2_"),
                                   _("Options"),
                                   "res/actions/window24.png",
                                   "res/actions/window.png");

                        instrInfo.AddParameter("object", _("Object"), "", false);
                        instrInfo.AddParameter("automatism", _("Automatism"), "PathAutomatism", false);
                        instrInfo.AddParameter("yesorno", _("Activate \?"), "", false);

                        instrInfo.cppCallingInformation.SetFunctionName("SetFollowAngle").SetIncludeFile("PathAutomatism/PathAutomatism.h");

                    DECLARE_END_AUTOMATISM_ACTION()

                    DECLARE_AUTOMATISM_CONDITION("GetAngleOffset",
                                   _("Angle offset"),
                                   _("Return true if the angle offset satifies the condition."),
                                   _("The angle offset of _PARAM0_ is _PARAM3__PARAM2_"),
                                   _("Options"),
                                   "res/actions/window24.png",
                                   "res/actions/window.png");

                        instrInfo.AddParameter("object", _("Object"), "", false);
                        instrInfo.AddParameter("automatism", _("Automatism"), "PathAutomatism", false);
                        instrInfo.AddParameter("expression", _("Value"), "", false);
                        instrInfo.AddParameter("relationalOperator", _("Comparison sign"), "", false);

                        instrInfo.cppCallingInformation.SetFunctionName("GetAngleOffset").SetManipulatedType("number").SetIncludeFile("PathAutomatism/PathAutomatism.h");

                    DECLARE_END_AUTOMATISM_CONDITION()

                    DECLARE_AUTOMATISM_ACTION("SetAngleOffset",
                                   _("Change the angle offset"),
                                   _("Change the angle offset"),
                                   _("Do _PARAM3__PARAM2_ to angle offset of _PARAM0_"),
                                   _("Options"),
                                   "res/actions/window24.png",
                                   "res/actions/window.png");

                        instrInfo.AddParameter("object", _("Object"), "", false);
                        instrInfo.AddParameter("automatism", _("Automatism"), "PathAutomatism", false);
                        instrInfo.AddParameter("expression", _("Value"), "", false);
                        instrInfo.AddParameter("operator", _("Modification sign"), "", false);

                        instrInfo.cppCallingInformation.SetFunctionName("SetAngleOffset").SetAssociatedGetter("GetAngleOffset").SetManipulatedType("number").SetIncludeFile("PathAutomatism/PathAutomatism.h");

                    DECLARE_END_AUTOMATISM_ACTION()

                    DECLARE_AUTOMATISM_EXPRESSION("AngleOffset", _("Angle offset"), _("Add an offset to the angle of the object"), _("Options"), "res/actions/window.png")
                        instrInfo.AddParameter("object", _("Object"), "", false);
                        instrInfo.AddParameter("automatism", _("Automatism"), "PathAutomatism", false);

                        instrInfo.cppCallingInformation.SetFunctionName("GetAngleOffset").SetIncludeFile("PathAutomatism/PathAutomatism.h");
                    DECLARE_END_AUTOMATISM_EXPRESSION()

                    DECLARE_AUTOMATISM_CONDITION("GetSpeed",
                                   _("Speed"),
                                   _("Return true if the speed satisfy the condition."),
                                   _("The speed of _PARAM0_ on the path is _PARAM3__PARAM2_"),
                                   _("Movement"),
                                   "res/actions/window24.png",
                                   "res/actions/window.png");

                        instrInfo.AddParameter("object", _("Object"), "", false);
                        instrInfo.AddParameter("automatism", _("Automatism"), "PathAutomatism", false);
                        instrInfo.AddParameter("expression", _("Value"), "", false);
                        instrInfo.AddParameter("relationalOperator", _("Comparison sign"), "", false);

                        instrInfo.cppCallingInformation.SetFunctionName("GetSpeed").SetManipulatedType("number").SetIncludeFile("PathAutomatism/PathAutomatism.h");

                    DECLARE_END_AUTOMATISM_CONDITION()

                    DECLARE_AUTOMATISM_ACTION("SetSpeed",
                                   _("Change the speed"),
                                   _("Change the speed of the object on the path."),
                                   _("Do _PARAM2__PARAM1_ to speed of of _PARAM0_ on the path"),
                                   _("Movement"),
                                   "res/actions/window24.png",
                                   "res/actions/window.png");

                        instrInfo.AddParameter("object", _("Object"), "", false);
                        instrInfo.AddParameter("automatism", _("Automatism"), "PathAutomatism", false);
                        instrInfo.AddParameter("expression", _("Value"), "", false);
                        instrInfo.AddParameter("operator", _("Modification sign"), "", false);

                        instrInfo.cppCallingInformation.SetFunctionName("SetSpeed").SetAssociatedGetter("GetSpeed").SetManipulatedType("number").SetIncludeFile("PathAutomatism/PathAutomatism.h");

                    DECLARE_END_AUTOMATISM_ACTION()

                    DECLARE_AUTOMATISM_EXPRESSION("Speed", _("Speed"), _("Moving speed on the path"), _("Movement"), "res/actions/window.png")
                        instrInfo.AddParameter("object", _("Object"), "", false);
                        instrInfo.AddParameter("automatism", _("Automatism"), "PathAutomatism", false);

                        instrInfo.cppCallingInformation.SetFunctionName("GetSpeed").SetIncludeFile("PathAutomatism/PathAutomatism.h");
                    DECLARE_END_AUTOMATISM_EXPRESSION()

                    #endif

                DECLARE_END_AUTOMATISM();

            CompleteCompilationInformation();
        };
        virtual ~Extension() {};

    private:

        /**
         * This function is called by Game Develop so
         * as to complete information about how the extension was compiled ( which libs... )
         * -- Do not need to be modified. --
         */
        void CompleteCompilationInformation()
        {
            #if defined(GD_IDE_ONLY)
            compilationInfo.runtimeOnly = false;
            #else
            compilationInfo.runtimeOnly = true;
            #endif

            #if defined(__GNUC__)
            compilationInfo.gccMajorVersion = __GNUC__;
            compilationInfo.gccMinorVersion = __GNUC_MINOR__;
            compilationInfo.gccPatchLevel = __GNUC_PATCHLEVEL__;
            #endif

            compilationInfo.boostVersion = BOOST_VERSION;

            compilationInfo.sfmlMajorVersion = 2;
            compilationInfo.sfmlMinorVersion = 0;

            #if defined(GD_IDE_ONLY)
            compilationInfo.wxWidgetsMajorVersion = wxMAJOR_VERSION;
            compilationInfo.wxWidgetsMinorVersion = wxMINOR_VERSION;
            compilationInfo.wxWidgetsReleaseNumber = wxRELEASE_NUMBER;
            compilationInfo.wxWidgetsSubReleaseNumber = wxSUBRELEASE_NUMBER;
            #endif

            compilationInfo.gdlVersion = RC_FILEVERSION_STRING;
            compilationInfo.sizeOfpInt = sizeof(int*);

            compilationInfo.informationCompleted = true;
        }
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

