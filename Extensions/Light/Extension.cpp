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
                                  _("Lumières"),
                                  _("Permet d'afficher des lumières et d'utiliser des obstacles à celles ci."),
                                  "Compil Games",
                                  "zlib/libpng License ( Open Source )")

                DECLARE_OBJECT("Light",
                               _("Lumière"),
                               _("Objet émettant de la lumière"),
                               "Extensions/lightIcon32.png",
                               &CreateLightObject,
                               &DestroyLightObject,
                               "LightObject");

                    #if defined(GD_IDE_ONLY)

                    objInfos.SetIncludeFile("Light/LightObject.h");

                    DECLARE_OBJECT_ACTION("ChangeColor",
                                   _("Couleur"),
                                   _("Change la couleur de la lumière."),
                                   _("Changer la couleur de _PARAM0_ en _PARAM1_"),
                                   _("Paramétrage"),
                                   "Extensions/lightIcon24.png",
                                   "Extensions/lightIcon16.png");

                        instrInfo.AddParameter("object", _("Objet"), "Light", false);
                        instrInfo.AddParameter("color", _("Couleur"), "", false);


                    instrInfo.cppCallingInformation.SetFunctionName("SetColor").SetIncludeFile("Light/LightObject.h");

                    DECLARE_END_OBJECT_ACTION()

                    DECLARE_OBJECT_ACTION("Intensity",
                                   _("Intensité"),
                                   _("Modifie l'intensité d'une lumière"),
                                   _("Faire _PARAM2__PARAM1_ à l'intensité de _PARAM0_"),
                                   _("Paramétrage"),
                                   "Extensions/lightIcon24.png",
                                   "Extensions/lightIcon16.png");

                        instrInfo.AddParameter("object", _("Objet"), "Light", false);
                        instrInfo.AddParameter("expression", _("Valeur"), "", false);
                        instrInfo.AddParameter("operator", _("Signe de la modification"), "", false);


                    instrInfo.cppCallingInformation.SetFunctionName("SetIntensity").SetManipulatedType("number").SetAssociatedGetter("GetIntensity").SetIncludeFile("Light/LightObject.h");

                    DECLARE_END_OBJECT_ACTION()

                    DECLARE_OBJECT_CONDITION("Intensity",
                                   _("Intensité"),
                                   _("Teste la valeur de l'intensité d'une lumière."),
                                   _("L'intensité de _PARAM0_ est _PARAM2_ à _PARAM1_"),
                                   _("Paramétrage"),
                                   "Extensions/lightIcon24.png",
                                   "Extensions/lightIcon16.png");

                        instrInfo.AddParameter("object", _("Objet"), "Light", false);
                        instrInfo.AddParameter("expression", _("Valeur à tester"), "", false);
                        instrInfo.AddParameter("relationalOperator", _("Signe du test"), "", false);


                    instrInfo.cppCallingInformation.SetFunctionName("GetIntensity").SetManipulatedType("number").SetIncludeFile("Light/LightObject.h");

                    DECLARE_END_OBJECT_CONDITION()

                    DECLARE_OBJECT_ACTION("Radius",
                                   _("Rayon"),
                                   _("Modifie le rayon d'une lumière"),
                                   _("Faire _PARAM2__PARAM1_ au rayon de _PARAM0_"),
                                   _("Paramétrage"),
                                   "Extensions/lightIcon24.png",
                                   "Extensions/lightIcon16.png");

                        instrInfo.AddParameter("object", _("Objet"), "Light", false);
                        instrInfo.AddParameter("expression", _("Valeur"), "", false);
                        instrInfo.AddParameter("operator", _("Signe de la modification"), "", false);


                    instrInfo.cppCallingInformation.SetFunctionName("SetRadius").SetManipulatedType("number").SetAssociatedGetter("GetRadius").SetIncludeFile("Light/LightObject.h");

                    DECLARE_END_OBJECT_ACTION()

                    DECLARE_OBJECT_CONDITION("Radius",
                                   _("Rayon"),
                                   _("Teste le rayon d'une lumière."),
                                   _("Le rayon de _PARAM0_ est _PARAM2_ à _PARAM1_"),
                                   _("Paramétrage"),
                                   "Extensions/lightIcon24.png",
                                   "Extensions/lightIcon16.png");

                        instrInfo.AddParameter("object", _("Objet"), "Light", false);
                        instrInfo.AddParameter("expression", _("Valeur à tester"), "", false);
                        instrInfo.AddParameter("relationalOperator", _("Signe du test"), "", false);


                    instrInfo.cppCallingInformation.SetFunctionName("GetRadius").SetManipulatedType("number").SetIncludeFile("Light/LightObject.h");

                    DECLARE_END_OBJECT_CONDITION()

                    DECLARE_OBJECT_ACTION("Quality",
                                   _("Qualité"),
                                   _("Modifie la qualité d'une lumière"),
                                   _("Faire _PARAM2__PARAM1_ à la qualité de _PARAM0_"),
                                   _("Paramétrage"),
                                   "Extensions/lightIcon24.png",
                                   "Extensions/lightIcon16.png");

                        instrInfo.AddParameter("object", _("Objet"), "Light", false);
                        instrInfo.AddParameter("expression", _("Valeur"), "", false);
                        instrInfo.AddParameter("operator", _("Signe de la modification"), "", false);


                    instrInfo.cppCallingInformation.SetFunctionName("SetQuality").SetManipulatedType("number").SetAssociatedGetter("GetQuality").SetIncludeFile("Light/LightObject.h");

                    DECLARE_END_OBJECT_ACTION()

                    DECLARE_OBJECT_CONDITION("Quality",
                                   _("Qualité"),
                                   _("Teste la valeur de la qualité d'une lumière."),
                                   _("La qualité de _PARAM0_ est _PARAM2_ à _PARAM1_"),
                                   _("Paramétrage"),
                                   "Extensions/lightIcon24.png",
                                   "Extensions/lightIcon16.png");

                        instrInfo.AddParameter("object", _("Objet"), "Light", false);
                        instrInfo.AddParameter("expression", _("Valeur à tester"), "", false);
                        instrInfo.AddParameter("relationalOperator", _("Signe du test"), "", false);


                    instrInfo.cppCallingInformation.SetFunctionName("GetQuality").SetManipulatedType("number").SetIncludeFile("Light/LightObject.h");

                    DECLARE_END_OBJECT_CONDITION()

                    DECLARE_OBJECT_ACTION("ChangeGlobalColor",
                                   _("Couleur globale"),
                                   _("Change la couleur de la scène pour une lumière globale."),
                                   _("Changer la couleur globale de la scène de _PARAM0_ en _PARAM1_"),
                                   _("Paramétrage"),
                                   "Extensions/lightIcon24.png",
                                   "Extensions/lightIcon16.png");

                        instrInfo.AddParameter("object", _("Objet"), "Light", false);
                        instrInfo.AddParameter("color", _("Couleur"), "", false);


                    instrInfo.cppCallingInformation.SetFunctionName("SetGlobalColor").SetIncludeFile("Light/LightObject.h");

                    DECLARE_END_OBJECT_ACTION()

                    DECLARE_OBJECT_ACTION("SetGlobalLight",
                                   _("Rendre une lumière globale"),
                                   _("Rend une lumière globale ou normale."),
                                   _("Rendre _PARAM0_ globale : _PARAM1_"),
                                   _("Type de lumière"),
                                   "Extensions/lightIcon24.png",
                                   "Extensions/lightIcon16.png");

                        instrInfo.AddParameter("object", _("Objet"), "Light", false);
                        instrInfo.AddParameter("yesorno", _("Rendre la lumière globale"), "", false);


                    instrInfo.cppCallingInformation.SetFunctionName("SetGlobalLight").SetIncludeFile("Light/LightObject.h");

                    DECLARE_END_OBJECT_ACTION()

                    DECLARE_OBJECT_CONDITION("GlobalLight",
                                   _("Une lumière est globale"),
                                   _("Renvoi vrai si la lumière est globale."),
                                   _("_PARAM0_ est une lumière globale"),
                                   _("Type de lumière"),
                                   "Extensions/lightIcon24.png",
                                   "Extensions/lightIcon16.png");

                        instrInfo.AddParameter("object", _("Objet"), "Light", false);


                    instrInfo.cppCallingInformation.SetFunctionName("IsGlobalLight").SetIncludeFile("Light/LightObject.h");

                    DECLARE_END_OBJECT_CONDITION()

/*
                    DECLARE_OBJECT_ACTION("Angle",
                                   _("Régler l'angle d'un objet texte"),
                                   _("Modifie l'angle d'un objet texte."),
                                   _("Faire _PARAM2__PARAM1_ à l'angle de _PARAM0_"),
                                   _("Rotation"),
                                   "Extensions/lightIcon24.png",
                                   "Extensions/lightIcon16.png",
                                   &LightObject::ActAngle);

                        instrInfo.AddParameter("object", _("Objet"), "Light", false);
                        instrInfo.AddParameter("expression", _("Valeur"), "", false);
                        instrInfo.AddParameter("operator", _("Signe de la modification"), "", false);


                    DECLARE_END_OBJECT_ACTION()

                    DECLARE_OBJECT_CONDITION("Angle",
                                   _("Angle d'un objet texte"),
                                   _("Teste la valeur de l'angle d'un objet texte."),
                                   _("L'angle de _PARAM0_ est _PARAM2_ à _PARAM1_"),
                                   _("Rotation"),
                                   "Extensions/lightIcon24.png",
                                   "Extensions/lightIcon16.png",
                                   &LightObject::CondAngle);

                        instrInfo.AddParameter("object", _("Objet"), "Light", false);
                        instrInfo.AddParameter("expression", _("Valeur à tester"), "", false);
                        instrInfo.AddParameter("relationalOperator", _("Signe du test"), "", false);


                    DECLARE_END_OBJECT_CONDITION()*/

                    DECLARE_OBJECT_EXPRESSION("Intensity", _("Intensité"), _("Intensité"), _("Paramétrage"), "Extensions/lightIcon16.png")
                        instrInfo.AddParameter("object", _("Objet"), "Light", false);

                        instrInfo.cppCallingInformation.SetFunctionName("GetIntensity").SetIncludeFile("Light/LightObject.h");
                    DECLARE_END_OBJECT_EXPRESSION()
                    DECLARE_OBJECT_EXPRESSION("Radius", _("Rayon"), _("Rayon"), _("Paramétrage"), "Extensions/lightIcon16.png")
                        instrInfo.AddParameter("object", _("Objet"), "Light", false);

                        instrInfo.cppCallingInformation.SetFunctionName("GetRadius").SetIncludeFile("Light/LightObject.h");
                    DECLARE_END_OBJECT_EXPRESSION()
                    DECLARE_OBJECT_EXPRESSION("Quality", _("Qualité"), _("Qualité"), _("Paramétrage"), "Extensions/lightIcon16.png")
                        instrInfo.AddParameter("object", _("Objet"), "Light", false);

                        instrInfo.cppCallingInformation.SetFunctionName("GetQuality").SetIncludeFile("Light/LightObject.h");
                    DECLARE_END_OBJECT_EXPRESSION()

                    /*
                    DECLARE_OBJECT_EXPRESSION("Angle", _("Angle"), _("Angle"), _("Lumières"), "Extensions/lightIcon16.png", &LightObject::ExpAngle)
                        instrInfo.AddParameter("object", _("Objet"), "Light", false);
                    DECLARE_END_OBJECT_EXPRESSION()*/

                    #endif

                DECLARE_END_OBJECT()

                DECLARE_AUTOMATISM("LightObstacleAutomatism",
                          _("Obstacle à la lumière"),
                          _("LightObstacle"),
                          _("Automatisme permettant de déplacer les objets en évitant les obstacles."),
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
