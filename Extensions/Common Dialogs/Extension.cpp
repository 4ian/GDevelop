/**

Game Develop - Common Dialogs Extension
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
#include "CommonDialogsActions.h"
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
            DECLARE_THE_EXTENSION("CommonDialogs",
                                  _("Boites de dialogues communes"),
                                  _("Extension permettant d'afficher des boites de dialogues souvent utilisées ( Message, ouverture de fichier... )"),
                                  "Compil Games",
                                  "zlib/libpng License ( Open Source )")

            DECLARE_ACTION("ShowMsgBox",
                           _("Afficher une boite de message"),
                           _("Affiche une boite de message avec le texte indiqué, et un bouton ok."),
                           _("Afficher le message \"_PARAM0_\" avec le titre \"_PARAM1_\""),
                           _("Interfaces"),
                           "res/actions/msgbox24.png",
                           "res/actions/msgbox.png",
                           &ActShowMsgBox);

                DECLARE_PARAMETER("text", _("Message"), false, "")
                DECLARE_PARAMETER("text", _("Titre"), false, "")

            DECLARE_END_ACTION()

            DECLARE_ACTION("ShowOpenFile",
                           _("Afficher une fenêtre d'ouverture de fichier"),
                           _("Affiche une fenêtre permettant de choisir un fichier.\nLe nom et répertoire du fichier est enregistré dans la variable de la scène indiquée."),
                           _("Ouvrir une fenêtre de choix de fichier, et enregistrer le résultat dans _PARAM0_"),
                           _("Interfaces"),
                           "res/actions/openfile24.png",
                           "res/actions/openfile.png",
                           &ActShowOpenFile);

                DECLARE_PARAMETER("scenevar", _("Variable de la scène où enregistrer le résultat"), false, "")
                DECLARE_PARAMETER("text", _("Titre"), false, "")

            DECLARE_END_ACTION()

            DECLARE_ACTION("ShowTextInput",
                           _("Afficher une fenêtre d'entrée de texte"),
                           _("Affiche une fenêtre permettant d'entrer un texte.\nLe texte sera enregistré dans la variable de la scène indiquée."),
                           _("Ouvrir une fenêtre d'entrée de texte, et enregistrer le résultat dans _PARAM0_"),
                           _("Interfaces"),
                           "res/actions/textenter24.png",
                           "res/actions/textenter.png",
                           &ActShowTextInput);

                DECLARE_PARAMETER("scenevar", _("Variable de la scène où enregistrer le résultat"), false, "")
                DECLARE_PARAMETER("text", _("Message"), false, "")
                DECLARE_PARAMETER("text", _("Titre"), false, "")

            DECLARE_END_ACTION()

            DECLARE_ACTION("ShowYesNoMsgBox",
                           _("Afficher une boite de message Oui/Non"),
                           _("Affiche une fenêtre permettant de choisir entre oui ou non.\nLa réponse ( \"yes\" ou \"no\" ) sera enregistrée dans la variable de la scène indiquée."),
                           _("Ouvrir une fenêtre Oui/Non, et enregistrer le résultat dans _PARAM0_"),
                           _("Interfaces"),
                           "res/actions/msgbox24.png",
                           "res/actions/msgbox.png",
                           &ActShowYesNoMsgBox);

                DECLARE_PARAMETER("scenevar", _("Variable de la scène où enregistrer le résultat"), false, "")
                DECLARE_PARAMETER("text", _("Message"), false, "")
                DECLARE_PARAMETER("text", _("Titre"), false, "")

            DECLARE_END_ACTION()

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
