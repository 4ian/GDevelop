/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */

#include "GDL/BuiltinExtensions/AdvancedExtension.h"
#include "GDL/ExtensionBase.h"

AdvancedExtension::AdvancedExtension()
{
    DECLARE_THE_EXTENSION("BuiltinAdvanced",
                          _("Fonctionnalités de contrôle avancé"),
                          _("Extension offrant des fonctionnalités de contrôle avancé, integrée en standard"),
                          "Compil Games",
                          "Freeware")

    #if defined(GD_IDE_ONLY)
    DECLARE_CONDITION("Toujours",
                   _("Toujours"),
                   _("Cette condition renvoie toujours vrai ( et toujours faux si le contraire est activé )."),
                   _("Toujours"),
                   _("Autre"),
                   "res/conditions/toujours24.png",
                   "res/conditions/toujours.png");

        instrInfo.AddCodeOnlyParameter("conditionInverted", "");

        instrInfo.cppCallingInformation.SetFunctionName("LogicalNegation").SetIncludeFile("GDL/BuiltinExtensions/CommonInstructionsTools.h");

    DECLARE_END_CONDITION()
    #endif
}
