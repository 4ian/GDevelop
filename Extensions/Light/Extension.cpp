/**

GDevelop - Light Extension
Copyright (c) 2010-2016 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/

#include "GDCpp/Extensions/ExtensionBase.h"

#include "LightObstacleBehavior.h"
#include "LightObject.h"
#include "SceneLightObstacleDatas.h"


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
        SetExtensionInformation("Light",
                              _("Light"),
                              _("This Extension is able to display Lights and use Light obstacles."),
                              "Florian Rival",
                              "Open source (MIT License)");

        gd::ObjectMetadata & obj = AddObject<LightObject>(
                   "Light",
                   _("Light"),
                   _("Emits light that can be stopped by objects"),
                   "CppPlatform/Extensions/lightIcon32.png");

        AddRuntimeObject<LightObject, RuntimeLightObject>(
            obj, "RuntimeLightObject");

        #if defined(GD_IDE_ONLY)
        LightObject::LoadEdittimeIcon();
        obj.SetIncludeFile("Light/LightObject.h");

        obj.AddAction("ChangeColor",
                       _("Color"),
                       _("Change light color."),
                       _("Change color of _PARAM0_ to _PARAM1_"),
                       _("Setup"),
                       "CppPlatform/Extensions/lightIcon24.png",
                       "CppPlatform/Extensions/lightIcon16.png")
            .AddParameter("object", _("Object"), "Light")
            .AddParameter("color", _("Color"))

            .SetFunctionName("SetColor").SetIncludeFile("Light/LightObject.h");


        obj.AddAction("Intensity",
                       _("Intensity"),
                       _("Modify the intensity of a light"),
                       _("Do _PARAM1__PARAM2_ to the intensity of _PARAM0_"),
                       _("Setup"),
                       "CppPlatform/Extensions/lightIcon24.png",
                       "CppPlatform/Extensions/lightIcon16.png")
            .AddParameter("object", _("Object"), "Light")
            .AddParameter("operator", _("Modification's sign"))
            .AddParameter("expression", _("Value"))

            .SetFunctionName("SetIntensity").SetManipulatedType("number").SetGetter("GetIntensity").SetIncludeFile("Light/LightObject.h");


        obj.AddCondition("Intensity",
                       _("Intensity"),
                       _("Test the intensity of a light."),
                       _("Intensity of _PARAM0_ is _PARAM1__PARAM2_"),
                       _("Setup"),
                       "CppPlatform/Extensions/lightIcon24.png",
                       "CppPlatform/Extensions/lightIcon16.png")
            .AddParameter("object", _("Object"), "Light")
            .AddParameter("relationalOperator", _("Sign of the test"))
            .AddParameter("expression", _("Value to test"))

            .SetFunctionName("GetIntensity").SetManipulatedType("number").SetIncludeFile("Light/LightObject.h");


        obj.AddAction("Radius",
                       _("Radius"),
                       _("Modify the radius of a light"),
                       _("Do _PARAM1__PARAM2_ to radius of _PARAM0_"),
                       _("Setup"),
                       "CppPlatform/Extensions/lightIcon24.png",
                       "CppPlatform/Extensions/lightIcon16.png")
            .AddParameter("object", _("Object"), "Light")
            .AddParameter("operator", _("Modification's sign"))
            .AddParameter("expression", _("Value"))

            .SetFunctionName("SetRadius").SetManipulatedType("number").SetGetter("GetRadius").SetIncludeFile("Light/LightObject.h");


        obj.AddCondition("Radius",
                       _("Radius"),
                       _("Test the radius of a light."),
                       _("The radius of _PARAM0_ is _PARAM2_ _PARAM1_"),
                       _("Setup"),
                       "CppPlatform/Extensions/lightIcon24.png",
                       "CppPlatform/Extensions/lightIcon16.png")
            .AddParameter("object", _("Object"), "Light")
            .AddParameter("relationalOperator", _("Sign of the test"))
            .AddParameter("expression", _("Value to test"))

            .SetFunctionName("GetRadius").SetManipulatedType("number").SetIncludeFile("Light/LightObject.h");


        obj.AddAction("Quality",
                       _("Quality"),
                       _("Modify the quality of a light"),
                       _("Do _PARAM1__PARAM2_ to the quality of _PARAM0_"),
                       _("Setup"),
                       "CppPlatform/Extensions/lightIcon24.png",
                       "CppPlatform/Extensions/lightIcon16.png")
            .AddParameter("object", _("Object"), "Light")
            .AddParameter("operator", _("Modification's sign"))
            .AddParameter("expression", _("Value"))

            .SetFunctionName("SetQuality").SetManipulatedType("number").SetGetter("GetQuality").SetIncludeFile("Light/LightObject.h");


        obj.AddCondition("Quality",
                       _("Quality"),
                       _("Test the quality of a light"),
                       _("The quality of _PARAM0_ is _PARAM1__PARAM2_"),
                       _("Setup"),
                       "CppPlatform/Extensions/lightIcon24.png",
                       "CppPlatform/Extensions/lightIcon16.png")
            .AddParameter("object", _("Object"), "Light")
            .AddParameter("relationalOperator", _("Sign of the test"))
            .AddParameter("expression", _("Value to test"))

            .SetFunctionName("GetQuality").SetManipulatedType("number").SetIncludeFile("Light/LightObject.h");


        obj.AddAction("ChangeGlobalColor",
                       _("Global color"),
                       _("Change scene color for a global light."),
                       _("Change scene global color of _PARAM0_ to _PARAM1_"),
                       _("Setup"),
                       "CppPlatform/Extensions/lightIcon24.png",
                       "CppPlatform/Extensions/lightIcon16.png")
            .AddParameter("object", _("Object"), "Light")
            .AddParameter("color", _("Color"))

            .SetFunctionName("SetGlobalColor").SetIncludeFile("Light/LightObject.h");


        obj.AddAction("SetGlobalLight",
                       _("Make a light global"),
                       _("Make a light global or simple."),
                       _("Make _PARAM0_ global : _PARAM1_"),
                       _("Light type"),
                       "CppPlatform/Extensions/lightIcon24.png",
                       "CppPlatform/Extensions/lightIcon16.png")
            .AddParameter("object", _("Object"), "Light")
            .AddParameter("yesorno", _("Make light global"))

            .SetFunctionName("SetGlobalLight").SetIncludeFile("Light/LightObject.h");


        obj.AddCondition("GlobalLight",
                       _("A light is global"),
                       _("Return true if a light is global"),
                       _("_PARAM0_ is a global light"),
                       _("Light type"),
                       "CppPlatform/Extensions/lightIcon24.png",
                       "CppPlatform/Extensions/lightIcon16.png")
            .AddParameter("object", _("Object"), "Light")

            .SetFunctionName("IsGlobalLight").SetIncludeFile("Light/LightObject.h");

        obj.AddExpression("Intensity", _("Intensity"), _("Intensity"), _("Setup"), "CppPlatform/Extensions/lightIcon16.png")
            .AddParameter("object", _("Object"), "Light")
            .SetFunctionName("GetIntensity").SetIncludeFile("Light/LightObject.h");

        obj.AddExpression("Radius", _("Radius"), _("Radius"), _("Setup"), "CppPlatform/Extensions/lightIcon16.png")
            .AddParameter("object", _("Object"), "Light")
            .SetFunctionName("GetRadius").SetIncludeFile("Light/LightObject.h");

        obj.AddExpression("Quality", _("Quality"), _("Quality"), _("Setup"), "CppPlatform/Extensions/lightIcon16.png")
            .AddParameter("object", _("Object"), "Light")
            .SetFunctionName("GetQuality").SetIncludeFile("Light/LightObject.h");
        #endif

        AddBehavior("LightObstacleBehavior",
              _("Light obstacle"),
              _("LightObstacle"),
              _("Mark the objects as obstacles for Light objects."),
              "",
              "CppPlatform/Extensions/lightObstacleIcon32.png",
              "LightObstacleBehavior",
              std::make_shared<LightObstacleBehavior>(),
              std::make_shared<SceneLightObstacleDatas>());

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
