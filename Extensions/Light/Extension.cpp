/**

Game Develop - Light Extension
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

#include "GDL/ExtensionBase.h"
#include "GDL/Version.h"
#include "LightObstacleAutomatism.h"
#include "LightObject.h"
#include <boost/version.hpp>

/**
 * This class declare information about the extension.
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
                                  _(""),
                                  "Compil Games",
                                  "zlib/libpng License ( Open Source )")

                DECLARE_OBJECT("Light",
                               _("Lumière"),
                               _("Objet émettant de la lumière"),
                               "Extensions/texticon.png",
                               &CreateLightObject,
                               &DestroyLightObject);

                    DECLARE_OBJECT_ACTION("ChangeColor",
                                   _("Changer la couleur d'un objet texte"),
                                   _("Change la couleur du texte. Par défaut, la couleur est le blanc."),
                                   _("Changer la couleur de _PARAM0_ en _PARAM1_"),
                                   _("Effets"),
                                   "res/actions/color24.png",
                                   "res/actions/color.png",
                                   &LightObject::ActChangeColor);

                        DECLARE_PARAMETER("object", _("Objet"), true, "Light")
                        DECLARE_PARAMETER("color", _("Couleur"), false, "")
                        MAIN_OBJECTS_IN_PARAMETER(0)

                    DECLARE_END_OBJECT_ACTION()

                    DECLARE_OBJECT_ACTION("Intensity",
                                   _("Intensité"),
                                   _("Modifie l'intensité d'une lumière"),
                                   _("Faire _PARAM2__PARAM1_ à l'intensité de _PARAM0_"),
                                   _("Lumières"),
                                   "res/actions/opacity24.png",
                                   "res/actions/opacity.png",
                                   &LightObject::ActIntensity);

                        DECLARE_PARAMETER("object", _("Objet"), true, "Light")
                        DECLARE_PARAMETER("expression", _("Valeur"), false, "")
                        DECLARE_PARAMETER("signe", _("Signe de la modification"), false, "")
                        MAIN_OBJECTS_IN_PARAMETER(0)

                    DECLARE_END_OBJECT_ACTION()

                    DECLARE_OBJECT_CONDITION("Intensity",
                                   _("Intensité"),
                                   _("Teste la valeur de l'intensité d'une lumière."),
                                   _("L'intensité de _PARAM0_ est _PARAM2_ à _PARAM1_"),
                                   _("Lumières"),
                                   "res/conditions/opacity24.png",
                                   "res/conditions/opacity.png",
                                   &LightObject::CondIntensity);

                        DECLARE_PARAMETER("object", _("Objet"), true, "Light")
                        DECLARE_PARAMETER("expression", _("Valeur à tester"), false, "")
                        DECLARE_PARAMETER("signe", _("Signe du test"), false, "")
                        MAIN_OBJECTS_IN_PARAMETER(0)

                    DECLARE_END_OBJECT_CONDITION()

                    DECLARE_OBJECT_ACTION("Angle",
                                   _("Régler l'angle d'un objet texte"),
                                   _("Modifie l'angle d'un objet texte."),
                                   _("Faire _PARAM2__PARAM1_ à l'angle de _PARAM0_"),
                                   _("Rotation"),
                                   "res/actions/rotate24.png",
                                   "res/actions/rotate.png",
                                   &LightObject::ActAngle);

                        DECLARE_PARAMETER("object", _("Objet"), true, "Light")
                        DECLARE_PARAMETER("expression", _("Valeur"), false, "")
                        DECLARE_PARAMETER("signe", _("Signe de la modification"), false, "")
                        MAIN_OBJECTS_IN_PARAMETER(0)

                    DECLARE_END_OBJECT_ACTION()

                    DECLARE_OBJECT_CONDITION("Angle",
                                   _("Angle d'un objet texte"),
                                   _("Teste la valeur de l'angle d'un objet texte."),
                                   _("L'angle de _PARAM0_ est _PARAM2_ à _PARAM1_"),
                                   _("Rotation"),
                                   "res/conditions/rotate24.png",
                                   "res/conditions/rotate.png",
                                   &LightObject::CondAngle);

                        DECLARE_PARAMETER("object", _("Objet"), true, "Light")
                        DECLARE_PARAMETER("expression", _("Valeur à tester"), false, "")
                        DECLARE_PARAMETER("signe", _("Signe du test"), false, "")
                        MAIN_OBJECTS_IN_PARAMETER(0)

                    DECLARE_END_OBJECT_CONDITION()

                    DECLARE_OBJECT_EXPRESSION("Intensity", _("Intensité"), _("Intensité"), _("Lumières"), "res/actions/opacity.png", &LightObject::ExpIntensity)
                        DECLARE_PARAMETER("object", _("Objet"), true, "Light")
                    DECLARE_END_OBJECT_EXPRESSION()

                    DECLARE_OBJECT_EXPRESSION("Angle", _("Angle"), _("Angle"), _("Lumières"), "res/actions/rotate.png", &LightObject::ExpAngle)
                        DECLARE_PARAMETER("object", _("Objet"), true, "Light")
                    DECLARE_END_OBJECT_EXPRESSION()

                DECLARE_END_OBJECT()

                DECLARE_AUTOMATISM("LightObstacleAutomatism",
                          _("LightObstacle"),
                          _("LightObstacle"),
                          _("Automatisme permettant de déplacer les objets en évitant les obstacles."),
                          "",
                          "Extensions/LightObstacleicon24.png",
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
