/**

Game Develop - Text Object Extension
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
#include "TextObject.h"
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
            DECLARE_THE_EXTENSION("TextObject",
                                  _("Objet Texte"),
                                  _("Extension permettant d'utiliser un objet affichant du texte."),
                                  "Compil Games",
                                  "zlib/libpng License ( Open Source )")

            //Declaration of all objects available
            DECLARE_OBJECT("Text",
                           _("Texte"),
                           _("Objet affichant un texte"),
                           "Extensions/texticon.png",
                           &CreateTextObject,
                           &DestroyTextObject);

                DECLARE_OBJECT_ACTION("String",
                               _("Modifier le texte"),
                               _("Modifier le texte d'un objet texte."),
                               _("Faire _PARAM2__PARAM1_ au texte de _PARAM0_"),
                               _("Texte"),
                               "res/actions/text24.png",
                               "res/actions/text.png",
                               &TextObject::ActString);

                    DECLARE_PARAMETER("object", _("Objet"), true, "Text")
                    DECLARE_PARAMETER("text", _("Texte"), false, "")
                    DECLARE_PARAMETER("signe", _("Signe de la modification"), false, "")
                    MAIN_OBJECTS_IN_PARAMETER(0)

                DECLARE_END_OBJECT_ACTION()

                DECLARE_OBJECT_CONDITION("String",
                               _("Tester le texte"),
                               _("Teste le texte d'un objet texte."),
                               _("Le texte de _PARAM0_ est _PARAM2_ à _PARAM1_"),
                               _("Texte"),
                               "res/conditions/text24.png",
                               "res/conditions/text.png",
                               &TextObject::CondString);

                    DECLARE_PARAMETER("object", _("Objet"), true, "Text")
                    DECLARE_PARAMETER("text", _("Texte à tester"), false, "")
                    DECLARE_PARAMETER("signe", _("Signe du test"), false, "")
                    MAIN_OBJECTS_IN_PARAMETER(0)

                DECLARE_END_OBJECT_CONDITION()

                DECLARE_OBJECT_ACTION("Font",
                               _("Changer la police"),
                               _("Modifie la police de caractère du texte."),
                               _("Changer la police de _PARAM0_ en _PARAM1_"),
                               _("Police"),
                               "res/actions/font24.png",
                               "res/actions/font.png",
                               &TextObject::ActFont);

                    DECLARE_PARAMETER("object", _("Objet"), true, "Text")
                    DECLARE_PARAMETER("police", _("Valeur"), false, "")
                    MAIN_OBJECTS_IN_PARAMETER(0)

                DECLARE_END_OBJECT_ACTION()

                DECLARE_OBJECT_ACTION("Size",
                               _("Régler la taille du texte"),
                               _("Modifie la taille du texte."),
                               _("Faire _PARAM2__PARAM1_ à la taille du texte de _PARAM0_"),
                               _("Taille"),
                               "res/actions/characterSize24.png",
                               "res/actions/characterSize.png",
                               &TextObject::ActSize);

                    DECLARE_PARAMETER("object", _("Objet"), true, "Text")
                    DECLARE_PARAMETER("expression", _("Valeur"), false, "")
                    DECLARE_PARAMETER("signe", _("Signe de la modification"), false, "")
                    MAIN_OBJECTS_IN_PARAMETER(0)

                DECLARE_END_OBJECT_ACTION()

                DECLARE_OBJECT_CONDITION("Size",
                               _("Taille du texte"),
                               _("Teste la taille du texte."),
                               _("La taille du texte de _PARAM0_ est _PARAM2_ à _PARAM1_"),
                               _("Taille"),
                               "res/conditions/characterSize24.png",
                               "res/conditions/characterSize.png",
                               &TextObject::CondSize);

                    DECLARE_PARAMETER("object", _("Objet"), true, "Text")
                    DECLARE_PARAMETER("expression", _("Taille à tester"), false, "")
                    DECLARE_PARAMETER("signe", _("Signe du test"), false, "")
                    MAIN_OBJECTS_IN_PARAMETER(0)

                DECLARE_END_OBJECT_CONDITION()

                DECLARE_OBJECT_ACTION("ChangeColor",
                               _("Changer la couleur d'un objet texte"),
                               _("Change la couleur du texte. Par défaut, la couleur est le blanc."),
                               _("Changer la couleur de _PARAM0_ en _PARAM1_"),
                               _("Effets"),
                               "res/actions/color24.png",
                               "res/actions/color.png",
                               &TextObject::ActChangeColor);

                    DECLARE_PARAMETER("object", _("Objet"), true, "Text")
                    DECLARE_PARAMETER("color", _("Couleur"), false, "")
                    MAIN_OBJECTS_IN_PARAMETER(0)

                DECLARE_END_OBJECT_ACTION()

                DECLARE_OBJECT_ACTION("Opacity",
                               _("Régler l'opacité d'un objet"),
                               _("Modifie la transparence d'un objet texte."),
                               _("Faire _PARAM2__PARAM1_ à l'opacité de _PARAM0_"),
                               _("Visibilité"),
                               "res/actions/opacity24.png",
                               "res/actions/opacity.png",
                               &TextObject::ActOpacity);

                    DECLARE_PARAMETER("object", _("Objet"), true, "Text")
                    DECLARE_PARAMETER("expression", _("Valeur"), false, "")
                    DECLARE_PARAMETER("signe", _("Signe de la modification"), false, "")
                    MAIN_OBJECTS_IN_PARAMETER(0)

                DECLARE_END_OBJECT_ACTION()

                DECLARE_OBJECT_CONDITION("Opacity",
                               _("Opacité d'un objet"),
                               _("Teste la valeur de l'opacité ( transparence ) d'un objet texte."),
                               _("L'opacité de _PARAM0_ est _PARAM2_ à _PARAM1_"),
                               _("Visibilité"),
                               "res/conditions/opacity24.png",
                               "res/conditions/opacity.png",
                               &TextObject::CondOpacity);

                    DECLARE_PARAMETER("object", _("Objet"), true, "Text")
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
                               &TextObject::ActAngle);

                    DECLARE_PARAMETER("object", _("Objet"), true, "Text")
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
                               &TextObject::CondAngle);

                    DECLARE_PARAMETER("object", _("Objet"), true, "Text")
                    DECLARE_PARAMETER("expression", _("Valeur à tester"), false, "")
                    DECLARE_PARAMETER("signe", _("Signe du test"), false, "")
                    MAIN_OBJECTS_IN_PARAMETER(0)

                DECLARE_END_OBJECT_CONDITION()

                DECLARE_OBJECT_EXPRESSION("Opacity", _("Opacité"), _("Opacité"), _("Opacité"), "res/actions/opacity.png", &TextObject::GetOpacity)
                    DECLARE_PARAMETER("object", _("Objet"), true, "Text")
                DECLARE_END_OBJECT_EXPRESSION()

                DECLARE_OBJECT_EXPRESSION("Angle", _("Angle"), _("Angle"), _("Rotation"), "res/actions/rotate.png", &TextObject::GetAngle)
                    DECLARE_PARAMETER("object", _("Objet"), true, "Text")
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
            compilationInfo.sizeOfpInt = sizeof(int*);

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
