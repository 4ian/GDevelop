/**

Game Develop - Light Extension
Copyright (c) 2010-2012 Florian Rival (Florian.Rival@gmail.com)

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
#include "LightObstacleAutomatism.h"
#include "LightObject.h"
#include "SceneLightObstacleDatas.h"
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
            DECLARE_THE_EXTENSION("Light",
                                  _("Light"),
                                  _("Allow to display lights and use light obstacles."),
                                  "Compil Games",
                                  "zlib/libpng License ( Open Source )")

                DECLARE_OBJECT("Light",
                               _("Light"),
                               _("Object emitting light"),
                               "Extensions/lightIcon32.png",
                               &CreateLightObject,
                               &DestroyLightObject,
                               "LightObject");

                    #if defined(GD_IDE_ONLY)
                    LightObject::LoadEdittimeIcon();
                    objInfos.SetIncludeFile("Light/LightObject.h");

                    DECLARE_OBJECT_ACTION("ChangeColor",
                                   _("Color"),
                                   _("Change light color."),
                                   _("Change color of _PARAM0_ to _PARAM1_"),
                                   _("Setup"),
                                   "Extensions/lightIcon24.png",
                                   "Extensions/lightIcon16.png");

                        instrInfo.AddParameter("object", _("Object"), "Light", false);
                        instrInfo.AddParameter("color", _("Color"), "", false);


                    instrInfo.cppCallingInformation.SetFunctionName("SetColor").SetIncludeFile("Light/LightObject.h");

                    DECLARE_END_OBJECT_ACTION()

                    DECLARE_OBJECT_ACTION("Intensity",
                                   _("Intensity"),
                                   _("Modify the intensity of a light"),
                                   _("Do _PARAM2__PARAM1_ to the intensity of _PARAM0_"),
                                   _("Setup"),
                                   "Extensions/lightIcon24.png",
                                   "Extensions/lightIcon16.png");

                        instrInfo.AddParameter("object", _("Object"), "Light", false);
                        instrInfo.AddParameter("expression", _("Value"), "", false);
                        instrInfo.AddParameter("operator", _("Modification's sign"), "", false);


                    instrInfo.cppCallingInformation.SetFunctionName("SetIntensity").SetManipulatedType("number").SetAssociatedGetter("GetIntensity").SetIncludeFile("Light/LightObject.h");

                    DECLARE_END_OBJECT_ACTION()

                    DECLARE_OBJECT_CONDITION("Intensity",
                                   _("Intensity"),
                                   _("Test the intensity of a light."),
                                   _("Intensity of _PARAM0_ is _PARAM2__PARAM1_"),
                                   _("Setup"),
                                   "Extensions/lightIcon24.png",
                                   "Extensions/lightIcon16.png");

                        instrInfo.AddParameter("object", _("Object"), "Light", false);
                        instrInfo.AddParameter("expression", _("Value to test"), "", false);
                        instrInfo.AddParameter("relationalOperator", _("Sign of the test"), "", false);


                    instrInfo.cppCallingInformation.SetFunctionName("GetIntensity").SetManipulatedType("number").SetIncludeFile("Light/LightObject.h");

                    DECLARE_END_OBJECT_CONDITION()

                    DECLARE_OBJECT_ACTION("Radius",
                                   _("Radius"),
                                   _("Modify the radius of a liht"),
                                   _("Do _PARAM2__PARAM1_ to radius of _PARAM0_"),
                                   _("Setup"),
                                   "Extensions/lightIcon24.png",
                                   "Extensions/lightIcon16.png");

                        instrInfo.AddParameter("object", _("Object"), "Light", false);
                        instrInfo.AddParameter("expression", _("Value"), "", false);
                        instrInfo.AddParameter("operator", _("Modification's sign"), "", false);


                    instrInfo.cppCallingInformation.SetFunctionName("SetRadius").SetManipulatedType("number").SetAssociatedGetter("GetRadius").SetIncludeFile("Light/LightObject.h");

                    DECLARE_END_OBJECT_ACTION()

                    DECLARE_OBJECT_CONDITION("Radius",
                                   _("Radius"),
                                   _("Test the radius of a light."),
                                   _("The radius of _PARAM0_ is _PARAM2_ _PARAM1_"),
                                   _("Setup"),
                                   "Extensions/lightIcon24.png",
                                   "Extensions/lightIcon16.png");

                        instrInfo.AddParameter("object", _("Object"), "Light", false);
                        instrInfo.AddParameter("expression", _("Value to test"), "", false);
                        instrInfo.AddParameter("relationalOperator", _("Sign of the test"), "", false);


                    instrInfo.cppCallingInformation.SetFunctionName("GetRadius").SetManipulatedType("number").SetIncludeFile("Light/LightObject.h");

                    DECLARE_END_OBJECT_CONDITION()

                    DECLARE_OBJECT_ACTION("Quality",
                                   _("Quality"),
                                   _("Modify the quality of a light"),
                                   _("Do _PARAM2__PARAM1_ to the quality of _PARAM0_"),
                                   _("Setup"),
                                   "Extensions/lightIcon24.png",
                                   "Extensions/lightIcon16.png");

                        instrInfo.AddParameter("object", _("Object"), "Light", false);
                        instrInfo.AddParameter("expression", _("Value"), "", false);
                        instrInfo.AddParameter("operator", _("Modification's sign"), "", false);


                    instrInfo.cppCallingInformation.SetFunctionName("SetQuality").SetManipulatedType("number").SetAssociatedGetter("GetQuality").SetIncludeFile("Light/LightObject.h");

                    DECLARE_END_OBJECT_ACTION()

                    DECLARE_OBJECT_CONDITION("Quality",
                                   _("Quality"),
                                   _("Test the quality of a light"),
                                   _("The quality of _PARAM0_ is _PARAM2__PARAM1_"),
                                   _("Setup"),
                                   "Extensions/lightIcon24.png",
                                   "Extensions/lightIcon16.png");

                        instrInfo.AddParameter("object", _("Object"), "Light", false);
                        instrInfo.AddParameter("expression", _("Value to test"), "", false);
                        instrInfo.AddParameter("relationalOperator", _("Sign of the test"), "", false);


                    instrInfo.cppCallingInformation.SetFunctionName("GetQuality").SetManipulatedType("number").SetIncludeFile("Light/LightObject.h");

                    DECLARE_END_OBJECT_CONDITION()

                    DECLARE_OBJECT_ACTION("ChangeGlobalColor",
                                   _("Global color"),
                                   _("Change scene color for a global light."),
                                   _("Change scene global color of _PARAM0_ to _PARAM1_"),
                                   _("Setup"),
                                   "Extensions/lightIcon24.png",
                                   "Extensions/lightIcon16.png");

                        instrInfo.AddParameter("object", _("Object"), "Light", false);
                        instrInfo.AddParameter("color", _("Color"), "", false);


                    instrInfo.cppCallingInformation.SetFunctionName("SetGlobalColor").SetIncludeFile("Light/LightObject.h");

                    DECLARE_END_OBJECT_ACTION()

                    DECLARE_OBJECT_ACTION("SetGlobalLight",
                                   _("Make a light global"),
                                   _("Make a light global or simple."),
                                   _("Make _PARAM0_ global : _PARAM1_"),
                                   _("Light type"),
                                   "Extensions/lightIcon24.png",
                                   "Extensions/lightIcon16.png");

                        instrInfo.AddParameter("object", _("Object"), "Light", false);
                        instrInfo.AddParameter("yesorno", _("Make light global"), "", false);


                    instrInfo.cppCallingInformation.SetFunctionName("SetGlobalLight").SetIncludeFile("Light/LightObject.h");

                    DECLARE_END_OBJECT_ACTION()

                    DECLARE_OBJECT_CONDITION("GlobalLight",
                                   _("A light is global"),
                                   _("Return true if light is global"),
                                   _("_PARAM0_ is a global light"),
                                   _("Light type"),
                                   "Extensions/lightIcon24.png",
                                   "Extensions/lightIcon16.png");

                        instrInfo.AddParameter("object", _("Object"), "Light", false);


                    instrInfo.cppCallingInformation.SetFunctionName("IsGlobalLight").SetIncludeFile("Light/LightObject.h");

                    DECLARE_END_OBJECT_CONDITION()

/*
                    DECLARE_OBJECT_ACTION("Angle",
                                   _("Régler l'angle d'un objet texte"),
                                   _("Modify the angle of a Text object."),
                                   _("Do _PARAM2__PARAM1_ to the angle of _PARAM0_"),
                                   _("Rotation"),
                                   "Extensions/lightIcon24.png",
                                   "Extensions/lightIcon16.png",
                                   &LightObject::ActAngle);

                        instrInfo.AddParameter("object", _("Object"), "Light", false);
                        instrInfo.AddParameter("expression", _("Value"), "", false);
                        instrInfo.AddParameter("operator", _("Modification's sign"), "", false);


                    DECLARE_END_OBJECT_ACTION()

                    DECLARE_OBJECT_CONDITION("Angle",
                                   _("Angle d'un objet texte"),
                                   _("Test the value of the angle of a text object."),
                                   _("The angle of _PARAM0_ is _PARAM2__PARAM1_"),
                                   _("Rotation"),
                                   "Extensions/lightIcon24.png",
                                   "Extensions/lightIcon16.png",
                                   &LightObject::CondAngle);

                        instrInfo.AddParameter("object", _("Object"), "Light", false);
                        instrInfo.AddParameter("expression", _("Value to test"), "", false);
                        instrInfo.AddParameter("relationalOperator", _("Sign of the test"), "", false);


                    DECLARE_END_OBJECT_CONDITION()*/

                    DECLARE_OBJECT_EXPRESSION("Intensity", _("Intensity"), _("Intensity"), _("Setup"), "Extensions/lightIcon16.png")
                        instrInfo.AddParameter("object", _("Object"), "Light", false);

                        instrInfo.cppCallingInformation.SetFunctionName("GetIntensity").SetIncludeFile("Light/LightObject.h");
                    DECLARE_END_OBJECT_EXPRESSION()
                    DECLARE_OBJECT_EXPRESSION("Radius", _("Radius"), _("Radius"), _("Setup"), "Extensions/lightIcon16.png")
                        instrInfo.AddParameter("object", _("Object"), "Light", false);

                        instrInfo.cppCallingInformation.SetFunctionName("GetRadius").SetIncludeFile("Light/LightObject.h");
                    DECLARE_END_OBJECT_EXPRESSION()
                    DECLARE_OBJECT_EXPRESSION("Quality", _("Quality"), _("Quality"), _("Setup"), "Extensions/lightIcon16.png")
                        instrInfo.AddParameter("object", _("Object"), "Light", false);

                        instrInfo.cppCallingInformation.SetFunctionName("GetQuality").SetIncludeFile("Light/LightObject.h");
                    DECLARE_END_OBJECT_EXPRESSION()

                    /*
                    DECLARE_OBJECT_EXPRESSION("Angle", _("Angle"), _("Angle"), _("Light"), "Extensions/lightIcon16.png", &LightObject::ExpAngle)
                        instrInfo.AddParameter("object", _("Object"), "Light", false);
                    DECLARE_END_OBJECT_EXPRESSION()*/

                    #endif

                DECLARE_END_OBJECT()

                DECLARE_AUTOMATISM("LightObstacleAutomatism",
                          _("Light obstacle"),
                          _("LightObstacle"),
                          _("Automatism which move objects and avoid obstacles"),
                          "",
                          "Extensions/lightObstacleicon32.png",
                          LightObstacleAutomatism,
                          SceneLightObstacleDatas)

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

