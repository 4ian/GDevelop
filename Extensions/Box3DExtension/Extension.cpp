/**

Game Develop - Box 3D Extension
Copyright (c) 2008-2010 Florian Rival (Florian.Rival@gmail.com)

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
            DECLARE_THE_EXTENSION("Box3DObject",
                                  _("Objet Boîte 3D"),
                                  _("Extension permettant d'utiliser des objets boites en 3D."),
                                  "Compil Games",
                                  "zlib/libpng License ( Open Source )")

            DECLARE_OBJECT("Box3D",
                           _("Boite en 3D"),
                           _("Objet affichant une boite en 3D"),
                           "Extensions/Box3Dicon.png",
                           &CreateBox3DObject,
                           &CreateBox3DObjectByCopy,
                           &DestroyBox3DObject);

                DECLARE_OBJECT_ACTION("Width",
                               _("Largeur"),
                               _("Modifie la largeur d'une boite 3D."),
                               _("Faire _PARAM2__PARAM1_ à la largeur de _PARAM0_"),
                               _("Taille"),
                               "res/actions/scaleWidth24.png",
                               "res/actions/scaleWidth.png",
                               &Box3DObject::ActWidth);

                    DECLARE_PARAMETER("objet", _("Objet"), true, "Box3D")
                    DECLARE_PARAMETER("expression", _("Valeur"), false, "")
                    DECLARE_PARAMETER("signe", _("Signe de la modification"), false, "")
                    MAIN_OBJECTS_IN_PARAMETER(0)

                DECLARE_END_OBJECT_ACTION()

                DECLARE_OBJECT_CONDITION("Width",
                               _("Largeur"),
                               _("Teste la largeur d'une boite 3D."),
                               _("La largeur de _PARAM0_ est _PARAM2_ à _PARAM1_"),
                               _("Taille"),
                               "res/conditions/scaleWidth24.png",
                               "res/conditions/scaleWidth.png",
                               &Box3DObject::CondWidth);

                    DECLARE_PARAMETER("objet", _("Objet"), true, "Box3D")
                    DECLARE_PARAMETER("expression", _("Valeur à tester"), false, "")
                    DECLARE_PARAMETER("signe", _("Signe du test"), false, "")
                    MAIN_OBJECTS_IN_PARAMETER(0)

                DECLARE_END_OBJECT_CONDITION()

                DECLARE_OBJECT_ACTION("Height",
                               _("Hauteur"),
                               _("Modifie la hauteur d'une boite 3D."),
                               _("Faire _PARAM2__PARAM1_ à la hauteur de _PARAM0_"),
                               _("Taille"),
                               "res/actions/scaleHeight24.png",
                               "res/actions/scaleHeight.png",
                               &Box3DObject::ActHeight);

                    DECLARE_PARAMETER("objet", _("Objet"), true, "Box3D")
                    DECLARE_PARAMETER("expression", _("Valeur"), false, "")
                    DECLARE_PARAMETER("signe", _("Signe de la modification"), false, "")
                    MAIN_OBJECTS_IN_PARAMETER(0)

                DECLARE_END_OBJECT_ACTION()

                DECLARE_OBJECT_CONDITION("Height",
                               _("Hauteur"),
                               _("Teste la hauteur d'une boite 3D."),
                               _("La hauteur de _PARAM0_ est _PARAM2_ à _PARAM1_"),
                               _("Taille"),
                               "res/conditions/scaleHeight24.png",
                               "res/conditions/scaleHeight.png",
                               &Box3DObject::CondHeight);

                    DECLARE_PARAMETER("objet", _("Objet"), true, "Box3D")
                    DECLARE_PARAMETER("expression", _("Valeur à tester"), false, "")
                    DECLARE_PARAMETER("signe", _("Signe du test"), false, "")
                    MAIN_OBJECTS_IN_PARAMETER(0)

                DECLARE_END_OBJECT_CONDITION()

                DECLARE_OBJECT_ACTION("Depth",
                               _("Profondeur"),
                               _("Modifie la profondeur d'une boite 3D."),
                               _("Faire _PARAM2__PARAM1_ à la profondeur de _PARAM0_"),
                               _("Taille"),
                               "res/actions/depth24.png",
                               "res/actions/depth.png",
                               &Box3DObject::ActDepth);

                    DECLARE_PARAMETER("objet", _("Objet"), true, "Box3D")
                    DECLARE_PARAMETER("expression", _("Valeur"), false, "")
                    DECLARE_PARAMETER("signe", _("Signe de la modification"), false, "")
                    MAIN_OBJECTS_IN_PARAMETER(0)

                DECLARE_END_OBJECT_ACTION()

                DECLARE_OBJECT_CONDITION("Depth",
                               _("Profondeur"),
                               _("Teste la profondeur d'une boite 3D."),
                               _("La profondeur de _PARAM0_ est _PARAM2_ à _PARAM1_"),
                               _("Taille"),
                               "res/conditions/depth24.png",
                               "res/conditions/depth.png",
                               &Box3DObject::CondDepth);

                    DECLARE_PARAMETER("objet", _("Objet"), true, "Box3D")
                    DECLARE_PARAMETER("expression", _("Valeur à tester"), false, "")
                    DECLARE_PARAMETER("signe", _("Signe du test"), false, "")
                    MAIN_OBJECTS_IN_PARAMETER(0)

                DECLARE_END_OBJECT_CONDITION()

                DECLARE_OBJECT_ACTION("ZPosition",
                               _("Position Z"),
                               _("Modifie la position Z d'une boite 3D."),
                               _("Faire _PARAM2__PARAM1_ à la position Z de _PARAM0_"),
                               _("Position"),
                               "res/actions/position24.png",
                               "res/actions/position.png",
                               &Box3DObject::ActZPosition);

                    DECLARE_PARAMETER("objet", _("Objet"), true, "Box3D")
                    DECLARE_PARAMETER("expression", _("Valeur"), false, "")
                    DECLARE_PARAMETER("signe", _("Signe de la modification"), false, "")
                    MAIN_OBJECTS_IN_PARAMETER(0)

                DECLARE_END_OBJECT_ACTION()

                DECLARE_OBJECT_CONDITION("ZPosition",
                               _("Position Z"),
                               _("Teste la position Z d'une boite 3D."),
                               _("La position Z de _PARAM0_ est _PARAM2_ à _PARAM1_"),
                               _("Position"),
                               "res/conditions/position24.png",
                               "res/conditions/position.png",
                               &Box3DObject::CondZPosition);

                    DECLARE_PARAMETER("objet", _("Objet"), true, "Box3D")
                    DECLARE_PARAMETER("expression", _("Valeur à tester"), false, "")
                    DECLARE_PARAMETER("signe", _("Signe du test"), false, "")
                    MAIN_OBJECTS_IN_PARAMETER(0)

                DECLARE_END_OBJECT_CONDITION()

                DECLARE_OBJECT_ACTION("Yaw",
                               _("Yaw"),
                               _("Modifie la rotation yaw d'une boite 3D."),
                               _("Faire _PARAM2__PARAM1_ au yaw de _PARAM0_"),
                               _("Angle"),
                               "res/actions/rotate24.png",
                               "res/actions/rotate.png",
                               &Box3DObject::ActYaw);

                    DECLARE_PARAMETER("objet", _("Objet"), true, "Box3D")
                    DECLARE_PARAMETER("expression", _("Valeur"), false, "")
                    DECLARE_PARAMETER("signe", _("Signe de la modification"), false, "")
                    MAIN_OBJECTS_IN_PARAMETER(0)

                DECLARE_END_OBJECT_ACTION()

                DECLARE_OBJECT_CONDITION("Yaw",
                               _("Yaw"),
                               _("Teste la rotation yaw d'une boite 3D."),
                               _("Le yaw de _PARAM0_ est _PARAM2_ à _PARAM1_"),
                               _("Angle"),
                               "res/conditions/rotate24.png",
                               "res/conditions/rotate.png",
                               &Box3DObject::CondYaw);

                    DECLARE_PARAMETER("objet", _("Objet"), true, "Box3D")
                    DECLARE_PARAMETER("expression", _("Valeur à tester"), false, "")
                    DECLARE_PARAMETER("signe", _("Signe du test"), false, "")
                    MAIN_OBJECTS_IN_PARAMETER(0)

                DECLARE_END_OBJECT_CONDITION()

                DECLARE_OBJECT_ACTION("Pitch",
                               _("Pitch"),
                               _("Modifie la rotation pitch d'une boite 3D."),
                               _("Faire _PARAM2__PARAM1_ au pitch de _PARAM0_"),
                               _("Angle"),
                               "res/actions/rotate24.png",
                               "res/actions/rotate.png",
                               &Box3DObject::ActPitch);

                    DECLARE_PARAMETER("objet", _("Objet"), true, "Box3D")
                    DECLARE_PARAMETER("expression", _("Valeur"), false, "")
                    DECLARE_PARAMETER("signe", _("Signe de la modification"), false, "")
                    MAIN_OBJECTS_IN_PARAMETER(0)

                DECLARE_END_OBJECT_ACTION()

                DECLARE_OBJECT_CONDITION("Pitch",
                               _("Pitch"),
                               _("Teste la rotation pitch d'une boite 3D."),
                               _("Le pitch de _PARAM0_ est _PARAM2_ à _PARAM1_"),
                               _("Angle"),
                               "res/conditions/rotate24.png",
                               "res/conditions/rotate.png",
                               &Box3DObject::CondPitch);

                    DECLARE_PARAMETER("objet", _("Objet"), true, "Box3D")
                    DECLARE_PARAMETER("expression", _("Valeur à tester"), false, "")
                    DECLARE_PARAMETER("signe", _("Signe du test"), false, "")
                    MAIN_OBJECTS_IN_PARAMETER(0)

                DECLARE_END_OBJECT_CONDITION()

                DECLARE_OBJECT_ACTION("Roll",
                               _("Roll"),
                               _("Modifie la rotation roll d'une boite 3D."),
                               _("Faire _PARAM2__PARAM1_ au roll de _PARAM0_"),
                               _("Angle"),
                               "res/actions/rotate24.png",
                               "res/actions/rotate.png",
                               &Box3DObject::ActRoll);

                    DECLARE_PARAMETER("objet", _("Objet"), true, "Box3D")
                    DECLARE_PARAMETER("expression", _("Valeur"), false, "")
                    DECLARE_PARAMETER("signe", _("Signe de la modification"), false, "")
                    MAIN_OBJECTS_IN_PARAMETER(0)

                DECLARE_END_OBJECT_ACTION()

                DECLARE_OBJECT_CONDITION("Roll",
                               _("Roll"),
                               _("Teste la rotation roll d'une boite 3D."),
                               _("Le roll de _PARAM0_ est _PARAM2_ à _PARAM1_"),
                               _("Angle"),
                               "res/conditions/rotate24.png",
                               "res/conditions/rotate.png",
                               &Box3DObject::CondRoll);

                    DECLARE_PARAMETER("objet", _("Objet"), true, "Box3D")
                    DECLARE_PARAMETER("expression", _("Valeur à tester"), false, "")
                    DECLARE_PARAMETER("signe", _("Signe du test"), false, "")
                    MAIN_OBJECTS_IN_PARAMETER(0)

                DECLARE_END_OBJECT_CONDITION()

                DECLARE_OBJECT_EXPRESSION("depth", _("Profondeur de la boite 3D"), _("Profondeur de la boite 3D"), _("Taille"), "res/actions/scaleHeight.png", &Box3DObject::ExpGetDepth)
                    DECLARE_PARAMETER("object", _("Objet"), true, "Box3D")
                DECLARE_END_OBJECT_EXPRESSION()

                DECLARE_OBJECT_EXPRESSION("z", _("Position Z"), _("Position Z"), _("Position"), "res/actions/scaleHeight.png", &Box3DObject::ExpGetZPosition)
                    DECLARE_PARAMETER("object", _("Objet"), true, "Box3D")
                DECLARE_END_OBJECT_EXPRESSION()

                DECLARE_OBJECT_EXPRESSION("yaw", _("Yaw"), _("Yaw"), _("Angle"), "res/actions/scaleHeight.png", &Box3DObject::ExpGetYaw)
                    DECLARE_PARAMETER("object", _("Objet"), true, "Box3D")
                DECLARE_END_OBJECT_EXPRESSION()

                DECLARE_OBJECT_EXPRESSION("pitch", _("Pitch"), _("Pitch"), _("Angle"), "res/actions/scaleHeight.png", &Box3DObject::ExpGetPitch)
                    DECLARE_PARAMETER("object", _("Objet"), true, "Box3D")
                DECLARE_END_OBJECT_EXPRESSION()

                DECLARE_OBJECT_EXPRESSION("roll", _("Roll"), _("Roll"), _("Angle"), "res/actions/scaleHeight.png", &Box3DObject::ExpGetRoll)
                    DECLARE_PARAMETER("object", _("Objet"), true, "Box3D")
                DECLARE_END_OBJECT_EXPRESSION()

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
            #if defined(GDE)
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

            #if defined(GDE)
            compilationInfo.wxWidgetsMajorVersion = wxMAJOR_VERSION;
            compilationInfo.wxWidgetsMinorVersion = wxMINOR_VERSION;
            compilationInfo.wxWidgetsReleaseNumber = wxRELEASE_NUMBER;
            compilationInfo.wxWidgetsSubReleaseNumber = wxSUBRELEASE_NUMBER;
            #endif

            compilationInfo.gdlVersion = RC_FILEVERSION_STRING;

            compilationInfo.informationCompleted = true;
        }
};

/**
 * Used by Game Develop to create the extension class
 * -- Do not need to be modified. --
 */
extern "C" ExtensionBase * CreateGDExtension() {
    return new Extension;
}

/**
 * Used by Game Develop to destroy the extension class
 * -- Do not need to be modified. --
 */
extern "C" void DestroyGDExtension(ExtensionBase * p) {
    delete p;
}
