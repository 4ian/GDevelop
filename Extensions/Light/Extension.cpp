/**

GDevelop - Light Extension
Copyright (c) 2010-2015 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/

#include "GDCpp/ExtensionBase.h"
#include "GDCore/Tools/Version.h"
#include "LightObstacleAutomatism.h"
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
                              GD_T("Light"),
                              GD_T("Allow to display lights and use light obstacles."),
                              "Florian Rival",
                              "Open source (MIT License)");

        gd::ObjectMetadata & obj = AddObject("Light",
                   GD_T("Light"),
                   GD_T("Emits light that can be stopped by objects"),
                   "CppPlatform/Extensions/lightIcon32.png",
                   &CreateLightObject);

        AddRuntimeObject(obj, "RuntimeLightObject", CreateRuntimeLightObject);

        #if defined(GD_IDE_ONLY)
        LightObject::LoadEdittimeIcon();
        obj.SetIncludeFile("Light/LightObject.h");

        obj.AddAction("ChangeColor",
                       _("Color"),
                       _("Change light color."),
                       GD_T("Change color of _PARAM0_ to _PARAM1_"),
                       _("Setup"),
                       "CppPlatform/Extensions/lightIcon24.png",
                       "CppPlatform/Extensions/lightIcon16.png")
            .AddParameter("object", GD_T("Object"), "Light", false)
            .AddParameter("color", GD_T("Color"))

            .SetFunctionName("SetColor").SetIncludeFile("Light/LightObject.h");


        obj.AddAction("Intensity",
                       _("Intensity"),
                       _("Modify the intensity of a light"),
                       GD_T("Do _PARAM1__PARAM2_ to the intensity of _PARAM0_"),
                       _("Setup"),
                       "CppPlatform/Extensions/lightIcon24.png",
                       "CppPlatform/Extensions/lightIcon16.png")
            .AddParameter("object", GD_T("Object"), "Light", false)
            .AddParameter("operator", GD_T("Modification's sign"))
            .AddParameter("expression", GD_T("Value"))

            .SetFunctionName("SetIntensity").SetManipulatedType("number").SetGetter("GetIntensity").SetIncludeFile("Light/LightObject.h");


        obj.AddCondition("Intensity",
                       _("Intensity"),
                       _("Test the intensity of a light."),
                       GD_T("Intensity of _PARAM0_ is _PARAM1__PARAM2_"),
                       _("Setup"),
                       "CppPlatform/Extensions/lightIcon24.png",
                       "CppPlatform/Extensions/lightIcon16.png")
            .AddParameter("object", GD_T("Object"), "Light", false)
            .AddParameter("relationalOperator", GD_T("Sign of the test"))
            .AddParameter("expression", GD_T("Value to test"))

            .SetFunctionName("GetIntensity").SetManipulatedType("number").SetIncludeFile("Light/LightObject.h");


        obj.AddAction("Radius",
                       _("Radius"),
                       _("Modify the radius of a light"),
                       GD_T("Do _PARAM1__PARAM2_ to radius of _PARAM0_"),
                       _("Setup"),
                       "CppPlatform/Extensions/lightIcon24.png",
                       "CppPlatform/Extensions/lightIcon16.png")
            .AddParameter("object", GD_T("Object"), "Light", false)
            .AddParameter("operator", GD_T("Modification's sign"))
            .AddParameter("expression", GD_T("Value"))

            .SetFunctionName("SetRadius").SetManipulatedType("number").SetGetter("GetRadius").SetIncludeFile("Light/LightObject.h");


        obj.AddCondition("Radius",
                       _("Radius"),
                       _("Test the radius of a light."),
                       GD_T("The radius of _PARAM0_ is _PARAM2_ _PARAM1_"),
                       _("Setup"),
                       "CppPlatform/Extensions/lightIcon24.png",
                       "CppPlatform/Extensions/lightIcon16.png")
            .AddParameter("object", GD_T("Object"), "Light", false)
            .AddParameter("relationalOperator", GD_T("Sign of the test"))
            .AddParameter("expression", GD_T("Value to test"))

            .SetFunctionName("GetRadius").SetManipulatedType("number").SetIncludeFile("Light/LightObject.h");


        obj.AddAction("Quality",
                       _("Quality"),
                       _("Modify the quality of a light"),
                       GD_T("Do _PARAM1__PARAM2_ to the quality of _PARAM0_"),
                       _("Setup"),
                       "CppPlatform/Extensions/lightIcon24.png",
                       "CppPlatform/Extensions/lightIcon16.png")
            .AddParameter("object", GD_T("Object"), "Light", false)
            .AddParameter("operator", GD_T("Modification's sign"))
            .AddParameter("expression", GD_T("Value"))

            .SetFunctionName("SetQuality").SetManipulatedType("number").SetGetter("GetQuality").SetIncludeFile("Light/LightObject.h");


        obj.AddCondition("Quality",
                       _("Quality"),
                       _("Test the quality of a light"),
                       GD_T("The quality of _PARAM0_ is _PARAM1__PARAM2_"),
                       _("Setup"),
                       "CppPlatform/Extensions/lightIcon24.png",
                       "CppPlatform/Extensions/lightIcon16.png")
            .AddParameter("object", GD_T("Object"), "Light", false)
            .AddParameter("relationalOperator", GD_T("Sign of the test"))
            .AddParameter("expression", GD_T("Value to test"))

            .SetFunctionName("GetQuality").SetManipulatedType("number").SetIncludeFile("Light/LightObject.h");


        obj.AddAction("ChangeGlobalColor",
                       _("Global color"),
                       _("Change scene color for a global light."),
                       GD_T("Change scene global color of _PARAM0_ to _PARAM1_"),
                       _("Setup"),
                       "CppPlatform/Extensions/lightIcon24.png",
                       "CppPlatform/Extensions/lightIcon16.png")
            .AddParameter("object", GD_T("Object"), "Light", false)
            .AddParameter("color", GD_T("Color"))

            .SetFunctionName("SetGlobalColor").SetIncludeFile("Light/LightObject.h");


        obj.AddAction("SetGlobalLight",
                       _("Make a light global"),
                       _("Make a light global or simple."),
                       GD_T("Make _PARAM0_ global : _PARAM1_"),
                       _("Light type"),
                       "CppPlatform/Extensions/lightIcon24.png",
                       "CppPlatform/Extensions/lightIcon16.png")
            .AddParameter("object", GD_T("Object"), "Light", false)
            .AddParameter("yesorno", GD_T("Make light global"))

            .SetFunctionName("SetGlobalLight").SetIncludeFile("Light/LightObject.h");


        obj.AddCondition("GlobalLight",
                       _("A light is global"),
                       _("Return true if light is global"),
                       GD_T("_PARAM0_ is a global light"),
                       _("Light type"),
                       "CppPlatform/Extensions/lightIcon24.png",
                       "CppPlatform/Extensions/lightIcon16.png")
            .AddParameter("object", GD_T("Object"), "Light", false)
            
            .SetFunctionName("IsGlobalLight").SetIncludeFile("Light/LightObject.h");

        obj.AddExpression("Intensity", GD_T("Intensity"), GD_T("Intensity"), GD_T("Setup"), "CppPlatform/Extensions/lightIcon16.png")
            .AddParameter("object", GD_T("Object"), "Light", false)
            .SetFunctionName("GetIntensity").SetIncludeFile("Light/LightObject.h");

        obj.AddExpression("Radius", GD_T("Radius"), GD_T("Radius"), GD_T("Setup"), "CppPlatform/Extensions/lightIcon16.png")
            .AddParameter("object", GD_T("Object"), "Light", false)
            .SetFunctionName("GetRadius").SetIncludeFile("Light/LightObject.h");

        obj.AddExpression("Quality", GD_T("Quality"), GD_T("Quality"), GD_T("Setup"), "CppPlatform/Extensions/lightIcon16.png")
            .AddParameter("object", GD_T("Object"), "Light", false)
            .SetFunctionName("GetQuality").SetIncludeFile("Light/LightObject.h");
        #endif

        AddAutomatism("LightObstacleAutomatism",
              GD_T("Light obstacle"),
              GD_T("LightObstacle"),
              GD_T("Mark the objects as obstacles for Light objects."),
              "",
              "CppPlatform/Extensions/lightObstacleIcon32.png",
              "LightObstacleAutomatism",
              std::shared_ptr<gd::Automatism>(new LightObstacleAutomatism),
              std::shared_ptr<gd::AutomatismsSharedData>(new SceneLightObstacleDatas));

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
