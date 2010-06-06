/**

Game Develop - Function Extension
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
#include "FunctionActions.h"
#include "FunctionEvent.h"
#include "FunctionExpressions.h"
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
            DECLARE_THE_EXTENSION("Function",
                                  _("Evenements fonctions"),
                                  _("Extension permettant d'utiliser des évènements agissant comme des fonctions."),
                                  "Compil Games",
                                  "zlib/libpng License ( Open Source )")

            DECLARE_ACTION("LaunchFunction",
                           _("Lancer une fonction"),
                           _("Lance une fonction"),
                           _("Lancer _PARAM0_"),
                           _("Fonctions"),
                           "res/actions/function24.png",
                           "res/actions/function.png",
                           &ActLaunchFunction);

                DECLARE_PARAMETER("", _("Nom de la fonction"), false, "")
                DECLARE_PARAMETER("yesorno", _("Garder les objets concernés"), false, "")
                DECLARE_PARAMETER_OPTIONAL("text", _("Paramètre 1"), false, "")
                DECLARE_PARAMETER_OPTIONAL("text", _("Paramètre 2"), false, "")
                DECLARE_PARAMETER_OPTIONAL("text", _("Paramètre 3"), false, "")
                DECLARE_PARAMETER_OPTIONAL("text", _("Paramètre 4"), false, "")
                DECLARE_PARAMETER_OPTIONAL("text", _("Paramètre 5"), false, "")
                DECLARE_PARAMETER_OPTIONAL("text", _("Paramètre 6"), false, "")

            DECLARE_END_ACTION()

            DECLARE_EVENT("Function",
                          _("Fonction"),
                          "Évènement fonction : L'évènement lancé uniquement grâce à l'action \"Lancer une fonction\"",
                          "",
                          "res/function.png",
                          FunctionEvent)

            DECLARE_END_EVENT()

            DECLARE_STR_EXPRESSION("Parameter",
                           _("Paramètre de la fonction actuel"),
                           _("Renvoi le texte contenue dans un paramètre de la fonction actuellement lancée"),
                           _("Fonction"),
                           "res/function.png",
                           &ExpGetFunctionParameter)

                DECLARE_PARAMETER("expression", _("Numéro du paramètre ( Commence à 0 ! )"), false, "")

            DECLARE_END_STR_EXPRESSION()

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
