/**

Game Develop - TextEntry Object Extension
Copyright (c) 2011-2012 Florian Rival (Florian.Rival@gmail.com)

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
#include "TextEntryObject.h"
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
            DECLARE_THE_EXTENSION("TextEntryObject",
                                  _("Objet d'entrée de texte"),
                                  _("Extension permettant d'utiliser un objet captant le texte entré au clavier."),
                                  "Compil Games",
                                  "zlib/libpng License ( Open Source )")

            //Declaration of all objects available
            DECLARE_OBJECT("TextEntry",
                           _("Entrée de texte"),
                           _("Objet captant le texte entré au clavier"),
                           "Extensions/textentry.png",
                           &CreateTextEntryObject,
                           &DestroyTextEntryObject,
                           "TextEntryObject");

            #if defined(GD_IDE_ONLY)

                objInfos.SetIncludeFile("TextEntryObject/TextEntryObject.h");

                DECLARE_OBJECT_ACTION("String",
                               _("Texte en mémoire"),
                               _("Modifier le texte en mémoire de l'objet"),
                               _("Faire _PARAM2__PARAM1_ au texte en mémoire de _PARAM0_"),
                               _("Texte entré au clavier"),
                               "Extensions/textentry24.png",
                               "Extensions/textentryicon.png");

                    instrInfo.AddParameter("object", _("Objet"), "TextEntry", false);
                    instrInfo.AddParameter("string", _("Texte"), "", false);
                    instrInfo.AddParameter("operator", _("Signe de la modification"), "", false);

                    instrInfo.cppCallingInformation.SetFunctionName("SetString").SetManipulatedType("string").SetAssociatedGetter("GetString").SetIncludeFile("TextEntryObject/TextEntryObject.h");

                DECLARE_END_OBJECT_ACTION()

                DECLARE_OBJECT_CONDITION("String",
                               _("Texte en mémoire"),
                               _("Teste le texte d'un objet Entré de texte."),
                               _("Le texte de _PARAM0_ est _PARAM2_ à _PARAM1_"),
                               _("Texte entré au clavier"),
                               "Extensions/textentry24.png",
                               "Extensions/textentryicon.png");

                    instrInfo.AddParameter("object", _("Objet"), "TextEntry", false);
                    instrInfo.AddParameter("string", _("Texte à tester"), "", false);
                    instrInfo.AddParameter("relationalOperator", _("Signe du test"), "", false);

                    instrInfo.cppCallingInformation.SetFunctionName("GetString").SetManipulatedType("string").SetIncludeFile("TextEntryObject/TextEntryObject.h");

                DECLARE_END_OBJECT_CONDITION()

                DECLARE_OBJECT_ACTION("Activate",
                               _("De/Activer la capture de la saisie"),
                               _("Active ou désactive la capture du texte entré au clavier."),
                               _("Activer la capture par _PARAM0_ du texte entré au clavier : _PARAM1_"),
                               _("Paramétrage"),
                               "Extensions/textentry24.png",
                               "Extensions/textentryicon.png");

                    instrInfo.AddParameter("object", _("Objet"), "TextEntry", false);
                    instrInfo.AddParameter("yesorno", _("Activer"), "", false);

                    instrInfo.cppCallingInformation.SetFunctionName("Activate").SetIncludeFile("TextObject/TextObject.h");


                DECLARE_END_OBJECT_ACTION()

                DECLARE_OBJECT_CONDITION("Activated",
                               _("Capture de la saisie"),
                               _("Teste si l'objet capture le texte entré au clavier."),
                               _("_PARAM0_ capture le texte entré au clavier"),
                               _("Paramétrage"),
                               "Extensions/textentry24.png",
                               "Extensions/textentryicon.png");

                    instrInfo.AddParameter("object", _("Objet"), "TextEntry", false);

                    instrInfo.cppCallingInformation.SetFunctionName("IsActivated").SetIncludeFile("TextObject/TextObject.h");

                DECLARE_END_OBJECT_CONDITION()

                DECLARE_OBJECT_STR_EXPRESSION("String", _("Texte entré au clavier"), _("Texte entré au clavier"), _("Texte entré au clavier"), "res/texteicon.png")
                    instrInfo.AddParameter("object", _("Objet"), "TextEntry", false);

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
