/**

GDevelop - Box 3D Extension
Copyright (c) 2008-2015 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/

#include "GDCpp/ExtensionBase.h"
#include "GDCore/Tools/Version.h"
#include "Box3DObject.h"

#include <iostream>

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
        SetExtensionInformation("Box3DObject",
                              GD_T("3D Box Object"),
                              GD_T("Extension allowing to use 3D Box objects."),
                              "Florian Rival",
                              "Open source (MIT License)");

        {
            gd::ObjectMetadata & obj = AddObject("Box3D",
                       GD_T("3D Box"),
                       GD_T("Displays a 3D Box"),
                       "CppPlatform/Extensions/Box3Dicon.png",
                       &CreateBox3DObject);

            AddRuntimeObject(obj, "RuntimeBox3DObject", &CreateRuntimeBox3DObject);

            #if defined(GD_IDE_ONLY)

            obj.SetIncludeFile("Box3DObject/Box3DObject.h");

            obj.AddAction("Width",
                           GD_T("Width"),
                           GD_T("Modify the width of a 3D Box."),
                           GD_T("Do _PARAM1__PARAM2_ to the width of _PARAM0_"),
                           GD_T("Size"),
                           "res/actions/scaleWidth24.png",
                           "res/actions/scaleWidth.png")

                .AddParameter("object", GD_T("Object"), "Box3D", false)
                .AddParameter("operator", GD_T("Modification's sign"))
                .AddParameter("expression", GD_T("Value"))

                .SetFunctionName("SetWidth").SetManipulatedType("number").SetGetter("GetWidth").SetIncludeFile("Box3DObject/Box3DObject.h");

            obj.AddCondition("Width",
                           GD_T("Width"),
                           GD_T("Compare the width of a 3D Box."),
                           GD_T("width of _PARAM0_ is _PARAM1__PARAM2_"),
                           GD_T("Size"),
                           "res/conditions/scaleWidth24.png",
                           "res/conditions/scaleWidth.png")

                .AddParameter("object", GD_T("Object"), "Box3D", false)
                .AddParameter("relationalOperator", GD_T("Sign of the test"))
                .AddParameter("expression", GD_T("Value to test"))

                .SetFunctionName("GetWidth").SetManipulatedType("number").SetIncludeFile("Box3DObject/Box3DObject.h");


            obj.AddAction("Height",
                           GD_T("Height"),
                           GD_T("Modify the height of a 3D Box."),
                           GD_T("Do _PARAM1__PARAM2_ to the height of _PARAM0_"),
                           GD_T("Size"),
                           "res/actions/scaleHeight24.png",
                           "res/actions/scaleHeight.png")

                .AddParameter("object", GD_T("Object"), "Box3D", false)
                .AddParameter("operator", GD_T("Modification's sign"))
                .AddParameter("expression", GD_T("Value"))

                .SetFunctionName("SetHeight").SetManipulatedType("number").SetGetter("GetHeight").SetIncludeFile("Box3DObject/Box3DObject.h");


            obj.AddCondition("Height",
                           GD_T("Height"),
                           GD_T("Compare the height of a 3D Box."),
                           GD_T("height of _PARAM0_ is _PARAM1__PARAM2_"),
                           GD_T("Size"),
                           "res/conditions/scaleHeight24.png",
                           "res/conditions/scaleHeight.png")

                .AddParameter("object", GD_T("Object"), "Box3D", false)
                .AddParameter("relationalOperator", GD_T("Sign of the test"))
                .AddParameter("expression", GD_T("Value to test"))

                .SetFunctionName("SetHeight").SetManipulatedType("number").SetGetter("GetHeight").SetIncludeFile("Box3DObject/Box3DObject.h");


            obj.AddAction("Depth",
                           GD_T("Depth"),
                           GD_T("Modify the depth of a 3D Box."),
                           GD_T("Do _PARAM1__PARAM2_ to the depth of _PARAM0_"),
                           GD_T("Size"),
                           "res/actions/depth24.png",
                           "res/actions/depth.png")

                .AddParameter("object", GD_T("Object"), "Box3D", false)
                .AddParameter("operator", GD_T("Modification's sign"))
                .AddParameter("expression", GD_T("Value"))

                .SetFunctionName("SetDepth").SetManipulatedType("number").SetGetter("GetDepth").SetIncludeFile("Box3DObject/Box3DObject.h");


            obj.AddCondition("Depth",
                           GD_T("Depth"),
                           GD_T("Compare the depth of a 3D Box."),
                           GD_T("depth of _PARAM0_ is _PARAM1__PARAM2_"),
                           GD_T("Size"),
                           "res/conditions/depth24.png",
                           "res/conditions/depth.png")

                .AddParameter("object", GD_T("Object"), "Box3D", false)
                .AddParameter("relationalOperator", GD_T("Sign of the test"))
                .AddParameter("expression", GD_T("Value to test"))

                .SetFunctionName("GetDepth").SetManipulatedType("number").SetIncludeFile("Box3DObject/Box3DObject.h");


            obj.AddAction("ZPosition",
                           GD_T("Z Position"),
                           GD_T("Modify the Z Position of a 3D Box."),
                           GD_T("Do _PARAM1__PARAM2_ to the Z position of _PARAM0_"),
                           "",
                           "res/actions/position24.png",
                           "res/actions/position.png")

                .AddParameter("object", GD_T("Object"), "Box3D", false)
                .AddParameter("operator", GD_T("Modification's sign"))
                .AddParameter("expression", GD_T("Value"))

                .SetFunctionName("SetZPosition").SetManipulatedType("number").SetGetter("GetZPosition").SetIncludeFile("Box3DObject/Box3DObject.h");


            obj.AddCondition("ZPosition",
                           GD_T("Z Position"),
                           GD_T("Compare Z position of a 3D Box."),
                           GD_T("Z position of _PARAM0_ is _PARAM1__PARAM2_"),
                           "",
                           "res/conditions/position24.png",
                           "res/conditions/position.png")

                .AddParameter("object", GD_T("Object"), "Box3D", false)
                .AddParameter("relationalOperator", GD_T("Sign of the test"))
                .AddParameter("expression", GD_T("Value to test"))

                .SetFunctionName("GetZPosition").SetManipulatedType("number").SetIncludeFile("Box3DObject/Box3DObject.h");


            obj.AddAction("Yaw",
                           GD_T("Yaw"),
                           GD_T("Modify Yaw of a 3D Box object."),
                           GD_T("Do _PARAM1__PARAM2_ to yaw of _PARAM0_"),
                           GD_T("Angle"),
                           "res/actions/rotate24.png",
                           "res/actions/rotate.png")

                .AddParameter("object", GD_T("Object"), "Box3D", false)
                .AddParameter("operator", GD_T("Modification's sign"))
                .AddParameter("expression", GD_T("Value"))

                .SetFunctionName("SetAngle").SetManipulatedType("number").SetGetter("GetAngle").SetIncludeFile("Box3DObject/Box3DObject.h");


            obj.AddCondition("Yaw",
                           GD_T("Yaw"),
                           GD_T("Compare Yaw of a 3D Box object."),
                           GD_T("Yaw of _PARAM0_ is _PARAM1__PARAM2_"),
                           GD_T("Angle"),
                           "res/conditions/rotate24.png",
                           "res/conditions/rotate.png")

                .AddParameter("object", GD_T("Object"), "Box3D", false)
                .AddParameter("relationalOperator", GD_T("Sign of the test"))
                .AddParameter("expression", GD_T("Value to test"))

                .SetFunctionName("GetAngle").SetManipulatedType("number").SetIncludeFile("Box3DObject/Box3DObject.h");


            obj.AddAction("Pitch",
                           GD_T("Pitch"),
                           GD_T("Modify Pitch of a 3D Box object."),
                           GD_T("Do _PARAM1__PARAM2_ to pitch of _PARAM0_"),
                           GD_T("Angle"),
                           "res/actions/rotate24.png",
                           "res/actions/rotate.png")

                .AddParameter("object", GD_T("Object"), "Box3D", false)
                .AddParameter("operator", GD_T("Modification's sign"))
                .AddParameter("expression", GD_T("Value"))

                .SetFunctionName("SetPitch").SetManipulatedType("number").SetGetter("GetPitch").SetIncludeFile("Box3DObject/Box3DObject.h");


            obj.AddCondition("Pitch",
                           GD_T("Pitch"),
                           GD_T("Compare Pitch of a 3D Box object."),
                           GD_T("Pitch of _PARAM0_ is _PARAM1__PARAM2_"),
                           GD_T("Angle"),
                           "res/conditions/rotate24.png",
                           "res/conditions/rotate.png")

                .AddParameter("object", GD_T("Object"), "Box3D", false)
                .AddParameter("relationalOperator", GD_T("Sign of the test"))
                .AddParameter("expression", GD_T("Value to test"))

                .SetFunctionName("GetPitch").SetManipulatedType("number").SetIncludeFile("Box3DObject/Box3DObject.h");


            obj.AddAction("Roll",
                           GD_T("Roll"),
                           GD_T("Modify Roll of a 3D Box object."),
                           GD_T("Do _PARAM1__PARAM2_ to roll of _PARAM0_"),
                           GD_T("Angle"),
                           "res/actions/rotate24.png",
                           "res/actions/rotate.png")
                .AddParameter("object", GD_T("Object"), "Box3D", false)
                .AddParameter("operator", GD_T("Modification's sign"))
                .AddParameter("expression", GD_T("Value"))

                .SetFunctionName("SetRoll").SetManipulatedType("number").SetGetter("GetRoll").SetIncludeFile("Box3DObject/Box3DObject.h");


            obj.AddCondition("Roll",
                           GD_T("Roll"),
                           GD_T("Compare Roll of a 3D Box object."),
                           GD_T("Roll of _PARAM0_ is _PARAM1__PARAM2_"),
                           GD_T("Angle"),
                           "res/conditions/rotate24.png",
                           "res/conditions/rotate.png")

                .AddParameter("object", GD_T("Object"), "Box3D", false)
                .AddParameter("relationalOperator", GD_T("Sign of the test"))
                .AddParameter("expression", GD_T("Value to test"))
                .SetFunctionName("GetRoll").SetManipulatedType("number").SetIncludeFile("Box3DObject/Box3DObject.h");

            obj.AddExpression("Depth", GD_T("Depth of the 3D Box"), GD_T("Depth of the 3D Box"), GD_T("Size"), "res/actions/scaleHeight.png")
                .AddParameter("object", GD_T("Object"), "Box3D", false)
                .codeExtraInformation.SetFunctionName("GetDepth").SetIncludeFile("Box3DObject/Box3DObject.h");

            obj.AddExpression("Z", GD_T("Z Position"), GD_T("Z Position"), GD_T("Position"), "res/actions/scaleHeight.png")
                .AddParameter("object", GD_T("Object"), "Box3D", false)
                .SetFunctionName("GetZPosition").SetIncludeFile("Box3DObject/Box3DObject.h");

            obj.AddExpression("Yaw", GD_T("Yaw"), GD_T("Yaw"), GD_T("Angle"), "res/actions/scaleHeight.png")
                .AddParameter("object", GD_T("Object"), "Box3D", false)
                .SetFunctionName("GetAngle").SetIncludeFile("Box3DObject/Box3DObject.h");

            obj.AddExpression("Pitch", GD_T("Pitch"), GD_T("Pitch"), GD_T("Angle"), "res/actions/scaleHeight.png")
                .AddParameter("object", GD_T("Object"), "Box3D", false)
                .SetFunctionName("GetPitch").SetIncludeFile("Box3DObject/Box3DObject.h");

            obj.AddExpression("Roll", GD_T("Roll"), GD_T("Roll"), GD_T("Angle"), "res/actions/scaleHeight.png")
                .AddParameter("object", GD_T("Object"), "Box3D", false)
                .SetFunctionName("GetRoll").SetIncludeFile("Box3DObject/Box3DObject.h");

            #endif

        }

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
