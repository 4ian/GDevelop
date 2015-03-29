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

            {
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
                               GD_T("Color"),
                               GD_T("Change light color."),
                               GD_T("Change color of _PARAM0_ to _PARAM1_"),
                               GD_T("Setup"),
                               "CppPlatform/Extensions/lightIcon24.png",
                               "CppPlatform/Extensions/lightIcon16.png")
                    .AddParameter("object", GD_T("Object"), "Light", false)
                    .AddParameter("color", GD_T("Color"))
                    .codeExtraInformation.SetFunctionName("SetColor").SetIncludeFile("Light/LightObject.h");


                obj.AddAction("Intensity",
                               GD_T("Intensity"),
                               GD_T("Modify the intensity of a light"),
                               GD_T("Do _PARAM1__PARAM2_ to the intensity of _PARAM0_"),
                               GD_T("Setup"),
                               "CppPlatform/Extensions/lightIcon24.png",
                               "CppPlatform/Extensions/lightIcon16.png")
                    .AddParameter("object", GD_T("Object"), "Light", false)
                    .AddParameter("operator", GD_T("Modification's sign"))
                    .AddParameter("expression", GD_T("Value"))
                .codeExtraInformation.SetFunctionName("SetIntensity").SetManipulatedType("number").SetAssociatedGetter("GetIntensity").SetIncludeFile("Light/LightObject.h");


                obj.AddCondition("Intensity",
                               GD_T("Intensity"),
                               GD_T("Test the intensity of a light."),
                               GD_T("Intensity of _PARAM0_ is _PARAM1__PARAM2_"),
                               GD_T("Setup"),
                               "CppPlatform/Extensions/lightIcon24.png",
                               "CppPlatform/Extensions/lightIcon16.png")
                    .AddParameter("object", GD_T("Object"), "Light", false)
                    .AddParameter("relationalOperator", GD_T("Sign of the test"))
                    .AddParameter("expression", GD_T("Value to test"))
                .codeExtraInformation.SetFunctionName("GetIntensity").SetManipulatedType("number").SetIncludeFile("Light/LightObject.h");


                obj.AddAction("Radius",
                               GD_T("Radius"),
                               GD_T("Modify the radius of a light"),
                               GD_T("Do _PARAM1__PARAM2_ to radius of _PARAM0_"),
                               GD_T("Setup"),
                               "CppPlatform/Extensions/lightIcon24.png",
                               "CppPlatform/Extensions/lightIcon16.png")
                    .AddParameter("object", GD_T("Object"), "Light", false)
                    .AddParameter("operator", GD_T("Modification's sign"))
                    .AddParameter("expression", GD_T("Value"))
                .codeExtraInformation.SetFunctionName("SetRadius").SetManipulatedType("number").SetAssociatedGetter("GetRadius").SetIncludeFile("Light/LightObject.h");


                obj.AddCondition("Radius",
                               GD_T("Radius"),
                               GD_T("Test the radius of a light."),
                               GD_T("The radius of _PARAM0_ is _PARAM2_ _PARAM1_"),
                               GD_T("Setup"),
                               "CppPlatform/Extensions/lightIcon24.png",
                               "CppPlatform/Extensions/lightIcon16.png")
                    .AddParameter("object", GD_T("Object"), "Light", false)
                    .AddParameter("relationalOperator", GD_T("Sign of the test"))
                    .AddParameter("expression", GD_T("Value to test"))
                .codeExtraInformation.SetFunctionName("GetRadius").SetManipulatedType("number").SetIncludeFile("Light/LightObject.h");


                obj.AddAction("Quality",
                               GD_T("Quality"),
                               GD_T("Modify the quality of a light"),
                               GD_T("Do _PARAM1__PARAM2_ to the quality of _PARAM0_"),
                               GD_T("Setup"),
                               "CppPlatform/Extensions/lightIcon24.png",
                               "CppPlatform/Extensions/lightIcon16.png")
                    .AddParameter("object", GD_T("Object"), "Light", false)
                    .AddParameter("operator", GD_T("Modification's sign"))
                    .AddParameter("expression", GD_T("Value"))
                .codeExtraInformation.SetFunctionName("SetQuality").SetManipulatedType("number").SetAssociatedGetter("GetQuality").SetIncludeFile("Light/LightObject.h");


                obj.AddCondition("Quality",
                               GD_T("Quality"),
                               GD_T("Test the quality of a light"),
                               GD_T("The quality of _PARAM0_ is _PARAM1__PARAM2_"),
                               GD_T("Setup"),
                               "CppPlatform/Extensions/lightIcon24.png",
                               "CppPlatform/Extensions/lightIcon16.png")
                    .AddParameter("object", GD_T("Object"), "Light", false)
                    .AddParameter("relationalOperator", GD_T("Sign of the test"))
                    .AddParameter("expression", GD_T("Value to test"))
                .codeExtraInformation.SetFunctionName("GetQuality").SetManipulatedType("number").SetIncludeFile("Light/LightObject.h");


                obj.AddAction("ChangeGlobalColor",
                               GD_T("Global color"),
                               GD_T("Change scene color for a global light."),
                               GD_T("Change scene global color of _PARAM0_ to _PARAM1_"),
                               GD_T("Setup"),
                               "CppPlatform/Extensions/lightIcon24.png",
                               "CppPlatform/Extensions/lightIcon16.png")
                    .AddParameter("object", GD_T("Object"), "Light", false)
                    .AddParameter("color", GD_T("Color"))
                .codeExtraInformation.SetFunctionName("SetGlobalColor").SetIncludeFile("Light/LightObject.h");


                obj.AddAction("SetGlobalLight",
                               GD_T("Make a light global"),
                               GD_T("Make a light global or simple."),
                               GD_T("Make _PARAM0_ global : _PARAM1_"),
                               GD_T("Light type"),
                               "CppPlatform/Extensions/lightIcon24.png",
                               "CppPlatform/Extensions/lightIcon16.png")
                    .AddParameter("object", GD_T("Object"), "Light", false)
                    .AddParameter("yesorno", GD_T("Make light global"))
                .codeExtraInformation.SetFunctionName("SetGlobalLight").SetIncludeFile("Light/LightObject.h");


                obj.AddCondition("GlobalLight",
                               GD_T("A light is global"),
                               GD_T("Return true if light is global"),
                               GD_T("_PARAM0_ is a global light"),
                               GD_T("Light type"),
                               "CppPlatform/Extensions/lightIcon24.png",
                               "CppPlatform/Extensions/lightIcon16.png")
                    .AddParameter("object", GD_T("Object"), "Light", false)
                .codeExtraInformation.SetFunctionName("IsGlobalLight").SetIncludeFile("Light/LightObject.h");


/*
                obj.AddAction("Angle",
                               GD_T("Change the angle"),
                               GD_T("Modify the angle of a Text object."),
                               GD_T("Do _PARAM1__PARAM2_ to the angle of _PARAM0_"),
                               GD_T("Rotation"),
                               "CppPlatform/Extensions/lightIcon24.png",
                               "CppPlatform/Extensions/lightIcon16.png",
                               &LightObject::ActAngle)
                    .AddParameter("object", GD_T("Object"), "Light", false)
                    .AddParameter("operator", GD_T("Modification's sign"))
                    .AddParameter("expression", GD_T("Value"))



                obj.AddCondition("Angle",
                               GD_T("Angle d'un objet texte"),
                               GD_T("Test the value of the angle of a text object."),
                               GD_T("The angle of _PARAM0_ is _PARAM1__PARAM2_"),
                               GD_T("Rotation"),
                               "CppPlatform/Extensions/lightIcon24.png",
                               "CppPlatform/Extensions/lightIcon16.png",
                               &LightObject::CondAngle)
                    .AddParameter("object", GD_T("Object"), "Light", false)
                    .AddParameter("relationalOperator", GD_T("Sign of the test"))
                    .AddParameter("expression", GD_T("Value to test"))

*/

                obj.AddExpression("Intensity", GD_T("Intensity"), GD_T("Intensity"), GD_T("Setup"), "CppPlatform/Extensions/lightIcon16.png")
                    .AddParameter("object", GD_T("Object"), "Light", false)
                    .codeExtraInformation.SetFunctionName("GetIntensity").SetIncludeFile("Light/LightObject.h");

                obj.AddExpression("Radius", GD_T("Radius"), GD_T("Radius"), GD_T("Setup"), "CppPlatform/Extensions/lightIcon16.png")
                    .AddParameter("object", GD_T("Object"), "Light", false)
                    .codeExtraInformation.SetFunctionName("GetRadius").SetIncludeFile("Light/LightObject.h");

                obj.AddExpression("Quality", GD_T("Quality"), GD_T("Quality"), GD_T("Setup"), "CppPlatform/Extensions/lightIcon16.png")
                    .AddParameter("object", GD_T("Object"), "Light", false)
                    .codeExtraInformation.SetFunctionName("GetQuality").SetIncludeFile("Light/LightObject.h");


                /*
                obj.AddExpression("Angle", GD_T("Angle"), GD_T("Angle"), GD_T("Light"), "CppPlatform/Extensions/lightIcon16.png", &LightObject::ExpAngle)
                    .AddParameter("object", GD_T("Object"), "Light", false)
*/

                #endif

            }

            {
                AddAutomatism("LightObstacleAutomatism",
                      GD_T("Light obstacle"),
                      GD_T("LightObstacle"),
                      GD_T("Mark the objects as obstacles for Light objects."),
                      "",
                      "CppPlatform/Extensions/lightObstacleIcon32.png",
                      "LightObstacleAutomatism",
                      std::shared_ptr<gd::Automatism>(new LightObstacleAutomatism),
                      std::shared_ptr<gd::AutomatismsSharedData>(new SceneLightObstacleDatas));

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
