/**

Game Develop - Text Object Extension
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
/**
 * Contributors to the extension:
 * Victor Levasseur ( Bold/Italic/Underlined styles )
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
                           &DestroyTextObject,
                           "TextObject");

                #if defined(GD_IDE_ONLY)

                objInfos.SetIncludeFile("TextObject/TextObject.h");

                DECLARE_OBJECT_ACTION("String",
                               _("Modifier le texte"),
                               _("Modifier le texte d'un objet texte."),
                               _("Faire _PARAM2__PARAM1_ au texte de _PARAM0_"),
                               _("Texte"),
                               "res/actions/text24.png",
                               "res/actions/text.png");

                    instrInfo.AddParameter("object", _("Objet"), "Text", false);
                    instrInfo.AddParameter("string", _("Texte"), "", false);
                    instrInfo.AddParameter("operator", _("Signe de la modification"), "", false);

                    instrInfo.cppCallingInformation.SetFunctionName("SetString").SetManipulatedType("string").SetAssociatedGetter("GetString").SetIncludeFile("TextObject/TextObject.h");

                DECLARE_END_OBJECT_ACTION()

                DECLARE_OBJECT_CONDITION("String",
                               _("Tester le texte"),
                               _("Teste le texte d'un objet texte."),
                               _("Le texte de _PARAM0_ est _PARAM2_ à _PARAM1_"),
                               _("Texte"),
                               "res/conditions/text24.png",
                               "res/conditions/text.png");

                    instrInfo.AddParameter("object", _("Objet"), "Text", false);
                    instrInfo.AddParameter("string", _("Texte à tester"), "", false);
                    instrInfo.AddParameter("relationalOperator", _("Signe du test"), "", false);

                    instrInfo.cppCallingInformation.SetFunctionName("GetString").SetManipulatedType("string").SetIncludeFile("TextObject/TextObject.h");

                DECLARE_END_OBJECT_CONDITION()

                DECLARE_OBJECT_ACTION("Font",
                               _("Police de caractère"),
                               _("Modifie la police de caractère du texte."),
                               _("Changer la police de _PARAM0_ en _PARAM1_"),
                               _("Police"),
                               "res/actions/font24.png",
                               "res/actions/font.png");

                    instrInfo.AddParameter("object", _("Objet"), "Text", false);
                    instrInfo.AddParameter("police", _("Valeur"), "", false);


                    instrInfo.cppCallingInformation.SetFunctionName("SetFont").SetManipulatedType("string").SetIncludeFile("TextObject/TextObject.h");

                DECLARE_END_OBJECT_ACTION()

                DECLARE_OBJECT_ACTION("Size",
                               _("Taille"),
                               _("Modifie la taille du texte."),
                               _("Faire _PARAM2__PARAM1_ à la taille du texte de _PARAM0_"),
                               _("Taille"),
                               "res/actions/characterSize24.png",
                               "res/actions/characterSize.png");

                    instrInfo.AddParameter("object", _("Objet"), "Text", false);
                    instrInfo.AddParameter("expression", _("Valeur"), "", false);
                    instrInfo.AddParameter("operator", _("Signe de la modification"), "", false);


                    instrInfo.cppCallingInformation.SetFunctionName("SetCharacterSize").SetManipulatedType("number").SetAssociatedGetter("GetCharacterSize").SetIncludeFile("TextObject/TextObject.h");

                DECLARE_END_OBJECT_ACTION()

                DECLARE_OBJECT_CONDITION("Size",
                               _("Taille"),
                               _("Teste la taille du texte."),
                               _("La taille du texte de _PARAM0_ est _PARAM2_ à _PARAM1_"),
                               _("Taille"),
                               "res/conditions/characterSize24.png",
                               "res/conditions/characterSize.png");

                    instrInfo.AddParameter("object", _("Objet"), "Text", false);
                    instrInfo.AddParameter("expression", _("Taille à tester"), "", false);
                    instrInfo.AddParameter("relationalOperator", _("Signe du test"), "", false);


                    instrInfo.cppCallingInformation.SetFunctionName("GetCharacterSize").SetManipulatedType("number").SetIncludeFile("TextObject/TextObject.h");

                DECLARE_END_OBJECT_CONDITION()

                DECLARE_OBJECT_ACTION("ChangeColor",
                               _("Couleur"),
                               _("Change la couleur du texte. Par défaut, la couleur est le blanc."),
                               _("Changer la couleur de _PARAM0_ en _PARAM1_"),
                               _("Effets"),
                               "res/actions/color24.png",
                               "res/actions/color.png");

                    instrInfo.AddParameter("object", _("Objet"), "Text", false);
                    instrInfo.AddParameter("color", _("Couleur"), "", false);


                    instrInfo.cppCallingInformation.SetFunctionName("SetColor").SetIncludeFile("TextObject/TextObject.h");

                DECLARE_END_OBJECT_ACTION()

                DECLARE_OBJECT_ACTION("Opacity",
                               _("Opacité"),
                               _("Modifie la transparence d'un objet texte."),
                               _("Faire _PARAM2__PARAM1_ à l'opacité de _PARAM0_"),
                               _("Visibilité"),
                               "res/actions/opacity24.png",
                               "res/actions/opacity.png");

                    instrInfo.AddParameter("object", _("Objet"), "Text", false);
                    instrInfo.AddParameter("expression", _("Valeur"), "", false);
                    instrInfo.AddParameter("operator", _("Signe de la modification"), "", false);


                    instrInfo.cppCallingInformation.SetFunctionName("SetOpacity").SetManipulatedType("number").SetAssociatedGetter("GetOpacity").SetIncludeFile("TextObject/TextObject.h");

                DECLARE_END_OBJECT_ACTION()

                DECLARE_OBJECT_CONDITION("Opacity",
                               _("Opacité"),
                               _("Teste la valeur de l'opacité ( transparence ) d'un objet texte."),
                               _("L'opacité de _PARAM0_ est _PARAM2_ à _PARAM1_"),
                               _("Visibilité"),
                               "res/conditions/opacity24.png",
                               "res/conditions/opacity.png");

                    instrInfo.AddParameter("object", _("Objet"), "Text", false);
                    instrInfo.AddParameter("expression", _("Valeur à tester"), "", false);
                    instrInfo.AddParameter("relationalOperator", _("Signe du test"), "", false);


                    instrInfo.cppCallingInformation.SetFunctionName("GetOpacity").SetManipulatedType("number").SetIncludeFile("TextObject/TextObject.h");


                DECLARE_END_OBJECT_CONDITION()


                DECLARE_OBJECT_ACTION("SetSmooth",
                               _("Lissage"),
                               _("Active ou désactive le lissage d'un texte."),
                               _("Liser _PARAM0_ : _PARAM1_"),
                               _("Visibilité"),
                               "res/actions/opacity24.png",
                               "res/actions/opacity.png");

                    instrInfo.AddParameter("object", _("Objet"), "Text", false);
                    instrInfo.AddParameter("yesorno", _("Lisser le texte"), "", false);

                    instrInfo.cppCallingInformation.SetFunctionName("SetSmooth").SetIncludeFile("TextObject/TextObject.h");

                DECLARE_END_OBJECT_ACTION()

                DECLARE_OBJECT_CONDITION("Smoothed",
                               _("Lissage"),
                               _("Teste si un objet texte est lissé."),
                               _("_PARAM0_ est lissé"),
                               _("Visibilité"),
                               "res/conditions/opacity24.png",
                               "res/conditions/opacity.png");

                    instrInfo.AddParameter("object", _("Objet"), "Text", false);

                    instrInfo.cppCallingInformation.SetFunctionName("IsSmoothed").SetIncludeFile("TextObject/TextObject.h");

                DECLARE_END_OBJECT_CONDITION()

                DECLARE_OBJECT_ACTION("SetBold",
                               _("Gras"),
                               _("Met ou non le texte en gras."),
                               _("Mettre en gras _PARAM0_ : _PARAM1_"),
                               _("Style"),
                               "res/actions/bold.png",
                               "res/actions/bold16.png");

                    instrInfo.AddParameter("object", _("Objet"), "Text", false);
                    instrInfo.AddParameter("yesorno", _("Mettre en gras"), "", false);

                    instrInfo.cppCallingInformation.SetFunctionName("SetBold").SetIncludeFile("TextObject/TextObject.h");

                DECLARE_END_OBJECT_ACTION()

                DECLARE_OBJECT_CONDITION("IsBold",
                               _("Gras"),
                               _("Teste si un objet texte est en gras."),
                               _("_PARAM0_ est en gras"),
                               _("Style"),
                               "res/conditions/bold.png",
                               "res/conditions/bold16.png");

                    instrInfo.AddParameter("object", _("Objet"), "Text", false);

                    instrInfo.cppCallingInformation.SetFunctionName("IsBold").SetIncludeFile("TextObject/TextObject.h");

                DECLARE_END_OBJECT_CONDITION()

                DECLARE_OBJECT_ACTION("SetItalic",
                               _("Italique"),
                               _("Met ou non le texte en italique."),
                               _("Mettre en italique _PARAM0_ : _PARAM1_"),
                               _("Style"),
                               "res/actions/italic.png",
                               "res/actions/italic16.png");

                    instrInfo.AddParameter("object", _("Objet"), "Text", false);
                    instrInfo.AddParameter("yesorno", _("Mettre en italique"), "", false);

                    instrInfo.cppCallingInformation.SetFunctionName("SetItalic").SetIncludeFile("TextObject/TextObject.h");

                DECLARE_END_OBJECT_ACTION()

                DECLARE_OBJECT_CONDITION("IsItalic",
                               _("Italique"),
                               _("Teste si un objet texte est en italique."),
                               _("_PARAM0_ est en italique"),
                               _("Style"),
                               "res/conditions/italic.png",
                               "res/conditions/italic16.png");

                    instrInfo.AddParameter("object", _("Objet"), "Text", false);

                    instrInfo.cppCallingInformation.SetFunctionName("IsItalic").SetIncludeFile("TextObject/TextObject.h");

                DECLARE_END_OBJECT_CONDITION()

                DECLARE_OBJECT_ACTION("SetUnderlined",
                               _("Souligné"),
                               _("Souligne ou non le texte."),
                               _("Souligner _PARAM0_ : _PARAM1_"),
                               _("Style"),
                               "res/actions/underline.png",
                               "res/actions/underline16.png");

                    instrInfo.AddParameter("object", _("Objet"), "Text", false);
                    instrInfo.AddParameter("yesorno", _("Souligner"), "", false);

                    instrInfo.cppCallingInformation.SetFunctionName("SetUnderlined").SetIncludeFile("TextObject/TextObject.h");

                DECLARE_END_OBJECT_ACTION()

                DECLARE_OBJECT_CONDITION("IsUnderlined",
                               _("Souligné"),
                               _("Teste si un objet texte est souligné."),
                               _("_PARAM0_ est souligné"),
                               _("Style"),
                               "res/conditions/underline.png",
                               "res/conditions/underline16.png");

                    instrInfo.AddParameter("object", _("Objet"), "Text", false);

                    instrInfo.cppCallingInformation.SetFunctionName("IsUnderlined").SetIncludeFile("TextObject/TextObject.h");

                DECLARE_END_OBJECT_CONDITION()

                DECLARE_OBJECT_ACTION("Angle",
                               _("Angle"),
                               _("Modifie l'angle d'un objet texte."),
                               _("Faire _PARAM2__PARAM1_ à l'angle de _PARAM0_"),
                               _("Rotation"),
                               "res/actions/rotate24.png",
                               "res/actions/rotate.png");

                    instrInfo.AddParameter("object", _("Objet"), "Text", false);
                    instrInfo.AddParameter("expression", _("Valeur"), "", false);
                    instrInfo.AddParameter("operator", _("Signe de la modification"), "", false);


                    instrInfo.cppCallingInformation.SetFunctionName("SetAngle").SetManipulatedType("number").SetAssociatedGetter("GetAngle").SetIncludeFile("TextObject/TextObject.h");

                DECLARE_END_OBJECT_ACTION()

                DECLARE_OBJECT_CONDITION("Angle",
                               _("Angle"),
                               _("Teste la valeur de l'angle d'un objet texte."),
                               _("L'angle de _PARAM0_ est _PARAM2_ à _PARAM1_"),
                               _("Rotation"),
                               "res/conditions/rotate24.png",
                               "res/conditions/rotate.png");

                    instrInfo.AddParameter("object", _("Objet"), "Text", false);
                    instrInfo.AddParameter("expression", _("Valeur à tester"), "", false);
                    instrInfo.AddParameter("relationalOperator", _("Signe du test"), "", false);


                    instrInfo.cppCallingInformation.SetFunctionName("GetAngle").SetManipulatedType("number").SetIncludeFile("TextObject/TextObject.h");

                DECLARE_END_OBJECT_CONDITION()

                DECLARE_OBJECT_EXPRESSION("Opacity", _("Opacité"), _("Opacité"), _("Opacité"), "res/actions/opacity.png")
                    instrInfo.AddParameter("object", _("Objet"), "Text", false);

                    instrInfo.cppCallingInformation.SetFunctionName("GetOpacity").SetIncludeFile("TextObject/TextObject.h");
                DECLARE_END_OBJECT_EXPRESSION()

                DECLARE_OBJECT_EXPRESSION("Angle", _("Angle"), _("Angle"), _("Rotation"), "res/actions/rotate.png")
                    instrInfo.AddParameter("object", _("Objet"), "Text", false);

                    instrInfo.cppCallingInformation.SetFunctionName("GetAngle").SetIncludeFile("TextObject/TextObject.h");
                DECLARE_END_OBJECT_EXPRESSION()

                DECLARE_OBJECT_STR_EXPRESSION("String", _("Texte"), _("Texte"), _("Texte"), "res/texteicon.png")
                    instrInfo.AddParameter("object", _("Objet"), "Text", false);

                    instrInfo.cppCallingInformation.SetFunctionName("GetString").SetIncludeFile("TextObject/TextObject.h");
                DECLARE_END_OBJECT_STR_EXPRESSION()

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
