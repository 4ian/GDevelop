/**

Game Develop - Box 3D Extension
Copyright (c) 2008-2012 Florian Rival (Florian.Rival@gmail.com)

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

#include "GDL/ExtensionBase.h"
#include "GDL/Version.h"
#include "Box3DObject.h"
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
            DECLARE_THE_EXTENSION("Box3DObject",
                                  _("3D Box Object"),
                                  _("Extension allowing to use 3D Box objects."),
                                  "Compil Games",
                                  "zlib/libpng License ( Open Source )")

            DECLARE_OBJECT("Box3D",
                           _("3D Box"),
                           _("Object displaying a 3D Box"),
                           "Extensions/Box3Dicon.png",
                           &CreateBox3DObject,
                           &DestroyBox3DObject,
                           "Box3DObject");
                #if defined(GD_IDE_ONLY)

                objInfos.SetIncludeFile("Box3DObject/Box3DObject.h");

                DECLARE_OBJECT_ACTION("Width",
                               _("Width"),
                               _("Modify the width of a 3D Box."),
                               _("Do _PARAM2__PARAM1_ to the width of _PARAM0_"),
                               _("Size"),
                               "res/actions/scaleWidth24.png",
                               "res/actions/scaleWidth.png");

                    instrInfo.AddParameter("object", _("Object"), "Box3D", false);
                    instrInfo.AddParameter("expression", _("Value"), "", false);
                    instrInfo.AddParameter("operator", _("Modification's sign"), "", false);


                    instrInfo.cppCallingInformation.SetFunctionName("SetWidth").SetManipulatedType("number").SetAssociatedGetter("GetWidth").SetIncludeFile("Box3DObject/Box3DObject.h");

                DECLARE_END_OBJECT_ACTION()

                DECLARE_OBJECT_CONDITION("Width",
                               _("Width"),
                               _("Test the width of a 3D Box."),
                               _("The width of _PARAM0_ is _PARAM2__PARAM1_"),
                               _("Size"),
                               "res/conditions/scaleWidth24.png",
                               "res/conditions/scaleWidth.png");

                    instrInfo.AddParameter("object", _("Object"), "Box3D", false);
                    instrInfo.AddParameter("expression", _("Value to test"), "", false);
                    instrInfo.AddParameter("relationalOperator", _("Sign of the test"), "", false);


                    instrInfo.cppCallingInformation.SetFunctionName("GetWidth").SetManipulatedType("number").SetIncludeFile("Box3DObject/Box3DObject.h");


                DECLARE_END_OBJECT_CONDITION()

                DECLARE_OBJECT_ACTION("Height",
                               _("Height"),
                               _("Modify the height of a 3D Box."),
                               _("Do _PARAM2__PARAM1_ to the height of _PARAM0_"),
                               _("Size"),
                               "res/actions/scaleHeight24.png",
                               "res/actions/scaleHeight.png");

                    instrInfo.AddParameter("object", _("Object"), "Box3D", false);
                    instrInfo.AddParameter("expression", _("Value"), "", false);
                    instrInfo.AddParameter("operator", _("Modification's sign"), "", false);


                    instrInfo.cppCallingInformation.SetFunctionName("SetHeight").SetManipulatedType("number").SetAssociatedGetter("GetHeight").SetIncludeFile("Box3DObject/Box3DObject.h");


                DECLARE_END_OBJECT_ACTION()

                DECLARE_OBJECT_CONDITION("Height",
                               _("Height"),
                               _("Test the height of a 3D Box."),
                               _("The height of _PARAM0_ is _PARAM2__PARAM1_"),
                               _("Size"),
                               "res/conditions/scaleHeight24.png",
                               "res/conditions/scaleHeight.png");

                    instrInfo.AddParameter("object", _("Object"), "Box3D", false);
                    instrInfo.AddParameter("expression", _("Value to test"), "", false);
                    instrInfo.AddParameter("relationalOperator", _("Sign of the test"), "", false);


                    instrInfo.cppCallingInformation.SetFunctionName("SetHeight").SetManipulatedType("number").SetAssociatedGetter("GetHeight").SetIncludeFile("Box3DObject/Box3DObject.h");


                DECLARE_END_OBJECT_CONDITION()

                DECLARE_OBJECT_ACTION("Depth",
                               _("Depth"),
                               _("Modify the depth of a 3D Box."),
                               _("Do _PARAM2__PARAM1_ to the depth of _PARAM0_"),
                               _("Size"),
                               "res/actions/depth24.png",
                               "res/actions/depth.png");

                    instrInfo.AddParameter("object", _("Object"), "Box3D", false);
                    instrInfo.AddParameter("expression", _("Value"), "", false);
                    instrInfo.AddParameter("operator", _("Modification's sign"), "", false);


                    instrInfo.cppCallingInformation.SetFunctionName("SetDepth").SetManipulatedType("number").SetAssociatedGetter("GetDepth").SetIncludeFile("Box3DObject/Box3DObject.h");


                DECLARE_END_OBJECT_ACTION()

                DECLARE_OBJECT_CONDITION("Depth",
                               _("Depth"),
                               _("Test the depth of a 3D Box."),
                               _("The depth of _PARAM0_ is _PARAM2__PARAM1_"),
                               _("Size"),
                               "res/conditions/depth24.png",
                               "res/conditions/depth.png");

                    instrInfo.AddParameter("object", _("Object"), "Box3D", false);
                    instrInfo.AddParameter("expression", _("Value to test"), "", false);
                    instrInfo.AddParameter("relationalOperator", _("Sign of the test"), "", false);

                    instrInfo.cppCallingInformation.SetFunctionName("GetDepth").SetManipulatedType("number").SetIncludeFile("Box3DObject/Box3DObject.h");


                DECLARE_END_OBJECT_CONDITION()

                DECLARE_OBJECT_ACTION("ZPosition",
                               _("Z Position"),
                               _("Modify the Z Position of a 3D Box."),
                               _("Do _PARAM2__PARAM1_ to the Z position of _PARAM0_"),
                               _("Position"),
                               "res/actions/position24.png",
                               "res/actions/position.png");

                    instrInfo.AddParameter("object", _("Object"), "Box3D", false);
                    instrInfo.AddParameter("expression", _("Value"), "", false);
                    instrInfo.AddParameter("operator", _("Modification's sign"), "", false);


                    instrInfo.cppCallingInformation.SetFunctionName("SetZPosition").SetManipulatedType("number").SetAssociatedGetter("GetZPosition").SetIncludeFile("Box3DObject/Box3DObject.h");


                DECLARE_END_OBJECT_ACTION()

                DECLARE_OBJECT_CONDITION("ZPosition",
                               _("Z Position"),
                               _("Test Z position of a 3D Box."),
                               _("The Z position of _PARAM0_ is _PARAM2__PARAM1_"),
                               _("Position"),
                               "res/conditions/position24.png",
                               "res/conditions/position.png");

                    instrInfo.AddParameter("object", _("Object"), "Box3D", false);
                    instrInfo.AddParameter("expression", _("Value to test"), "", false);
                    instrInfo.AddParameter("relationalOperator", _("Sign of the test"), "", false);


                    instrInfo.cppCallingInformation.SetFunctionName("GetZPosition").SetManipulatedType("number").SetIncludeFile("Box3DObject/Box3DObject.h");


                DECLARE_END_OBJECT_CONDITION()

                DECLARE_OBJECT_ACTION("Yaw",
                               _("Yaw"),
                               _("Modify Yaw of a 3D Box object."),
                               _("Do _PARAM2__PARAM1_ to yaw of _PARAM0_"),
                               _("Angle"),
                               "res/actions/rotate24.png",
                               "res/actions/rotate.png");

                    instrInfo.AddParameter("object", _("Object"), "Box3D", false);
                    instrInfo.AddParameter("expression", _("Value"), "", false);
                    instrInfo.AddParameter("operator", _("Modification's sign"), "", false);


                    instrInfo.cppCallingInformation.SetFunctionName("SetAngle").SetManipulatedType("number").SetAssociatedGetter("GetAngle").SetIncludeFile("Box3DObject/Box3DObject.h");


                DECLARE_END_OBJECT_ACTION()

                DECLARE_OBJECT_CONDITION("Yaw",
                               _("Yaw"),
                               _("Test Yaw of a 3D Box object."),
                               _("Yaw of _PARAM0_ is _PARAM2_ _PARAM1_"),
                               _("Angle"),
                               "res/conditions/rotate24.png",
                               "res/conditions/rotate.png");

                    instrInfo.AddParameter("object", _("Object"), "Box3D", false);
                    instrInfo.AddParameter("expression", _("Value to test"), "", false);
                    instrInfo.AddParameter("relationalOperator", _("Sign of the test"), "", false);


                    instrInfo.cppCallingInformation.SetFunctionName("GetAngle").SetManipulatedType("number").SetIncludeFile("Box3DObject/Box3DObject.h");


                DECLARE_END_OBJECT_CONDITION()

                DECLARE_OBJECT_ACTION("Pitch",
                               _("Pitch"),
                               _("Modify Pitch of a 3D Box object."),
                               _("Do _PARAM2__PARAM1_ to Pitch of _PARAM0_"),
                               _("Angle"),
                               "res/actions/rotate24.png",
                               "res/actions/rotate.png");

                    instrInfo.AddParameter("object", _("Object"), "Box3D", false);
                    instrInfo.AddParameter("expression", _("Value"), "", false);
                    instrInfo.AddParameter("operator", _("Modification's sign"), "", false);


                    instrInfo.cppCallingInformation.SetFunctionName("SetPitch").SetManipulatedType("number").SetAssociatedGetter("GetPitch").SetIncludeFile("Box3DObject/Box3DObject.h");


                DECLARE_END_OBJECT_ACTION()

                DECLARE_OBJECT_CONDITION("Pitch",
                               _("Pitch"),
                               _("Test Pitch of a 3D Box object."),
                               _("Pitch of _PARAM0_ is _PARAM2__PARAM1_"),
                               _("Angle"),
                               "res/conditions/rotate24.png",
                               "res/conditions/rotate.png");

                    instrInfo.AddParameter("object", _("Object"), "Box3D", false);
                    instrInfo.AddParameter("expression", _("Value to test"), "", false);
                    instrInfo.AddParameter("relationalOperator", _("Sign of the test"), "", false);


                    instrInfo.cppCallingInformation.SetFunctionName("GetPitch").SetManipulatedType("number").SetIncludeFile("Box3DObject/Box3DObject.h");


                DECLARE_END_OBJECT_CONDITION()

                DECLARE_OBJECT_ACTION("Roll",
                               _("Roll"),
                               _("Modify Roll of a 3D Box object."),
                               _("Do _PARAM2__PARAM1_ to the Roll of _PARAM0_"),
                               _("Angle"),
                               "res/actions/rotate24.png",
                               "res/actions/rotate.png");

                    instrInfo.AddParameter("object", _("Object"), "Box3D", false);
                    instrInfo.AddParameter("expression", _("Value"), "", false);
                    instrInfo.AddParameter("operator", _("Modification's sign"), "", false);


                    instrInfo.cppCallingInformation.SetFunctionName("SetRoll").SetManipulatedType("number").SetAssociatedGetter("GetRoll").SetIncludeFile("Box3DObject/Box3DObject.h");


                DECLARE_END_OBJECT_ACTION()

                DECLARE_OBJECT_CONDITION("Roll",
                               _("Roll"),
                               _("Test Roll of a 3D Box object."),
                               _("Roll of _PARAM0_ is _PARAM2_ _PARAM1_"),
                               _("Angle"),
                               "res/conditions/rotate24.png",
                               "res/conditions/rotate.png");

                    instrInfo.AddParameter("object", _("Object"), "Box3D", false);
                    instrInfo.AddParameter("expression", _("Value to test"), "", false);
                    instrInfo.AddParameter("relationalOperator", _("Sign of the test"), "", false);

                    instrInfo.cppCallingInformation.SetFunctionName("GetRoll").SetManipulatedType("number").SetIncludeFile("Box3DObject/Box3DObject.h");
                DECLARE_END_OBJECT_CONDITION()

                DECLARE_OBJECT_EXPRESSION("Depth", _("Depth of the 3D Box"), _("Depth of the 3D Box"), _("Size"), "res/actions/scaleHeight.png")
                    instrInfo.AddParameter("object", _("Object"), "Box3D", false);

                    instrInfo.cppCallingInformation.SetFunctionName("GetDepth").SetIncludeFile("Box3DObject/Box3DObject.h");
                DECLARE_END_OBJECT_EXPRESSION()

                DECLARE_OBJECT_EXPRESSION("Z", _("Z Position"), _("Z Position"), _("Position"), "res/actions/scaleHeight.png")
                    instrInfo.AddParameter("object", _("Object"), "Box3D", false);

                    instrInfo.cppCallingInformation.SetFunctionName("GetZPosition").SetIncludeFile("Box3DObject/Box3DObject.h");
                DECLARE_END_OBJECT_EXPRESSION()

                DECLARE_OBJECT_EXPRESSION("Yaw", _("Yaw"), _("Yaw"), _("Angle"), "res/actions/scaleHeight.png")
                    instrInfo.AddParameter("object", _("Object"), "Box3D", false);

                    instrInfo.cppCallingInformation.SetFunctionName("GetAngle").SetIncludeFile("Box3DObject/Box3DObject.h");
                DECLARE_END_OBJECT_EXPRESSION()

                DECLARE_OBJECT_EXPRESSION("Pitch", _("Pitch"), _("Pitch"), _("Angle"), "res/actions/scaleHeight.png")
                    instrInfo.AddParameter("object", _("Object"), "Box3D", false);

                    instrInfo.cppCallingInformation.SetFunctionName("GetPitch").SetIncludeFile("Box3DObject/Box3DObject.h");
                DECLARE_END_OBJECT_EXPRESSION()

                DECLARE_OBJECT_EXPRESSION("Roll", _("Roll"), _("Roll"), _("Angle"), "res/actions/scaleHeight.png")
                    instrInfo.AddParameter("object", _("Object"), "Box3D", false);

                    instrInfo.cppCallingInformation.SetFunctionName("GetRoll").SetIncludeFile("Box3DObject/Box3DObject.h");
                DECLARE_END_OBJECT_EXPRESSION()

                #endif

            DECLARE_END_OBJECT()

            CompleteCompilationInformation();
        };
        virtual ~Extension() {};

    protected:
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

