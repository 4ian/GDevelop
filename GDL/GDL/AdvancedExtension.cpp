/** \file
 *  Game Develop
 *  2008-2011 Florian Rival (Florian.Rival@gmail.com)
 */

#include "GDL/AdvancedExtension.h"
#include "GDL/ExtensionBase.h"
#include "GDL/cScene.h"

AdvancedExtension::AdvancedExtension()
{
    DECLARE_THE_EXTENSION("BuiltinAdvanced",
                          _("Fonctionnalités de contrôle avancé"),
                          _("Extension offrant des fonctionnalités de contrôle avancé, integrée en standard"),
                          "Compil Games",
                          "Freeware")

    DECLARE_CONDITION("Toujours",
                   _("Toujours"),
                   _("Cette condition renvoie toujours vrai ( et toujours faux si le contraire est activé )."),
                   _("Toujours"),
                   _("Autre"),
                   "res/conditions/toujours24.png",
                   "res/conditions/toujours.png");

        DECLARE_CODEONLY_PARAMETER("conditionInverted", "")

        instrInfo.cppCallingInformation.SetFunctionName("LogicalNegation").SetIncludeFile("GDL/CommonInstructions.h");

    DECLARE_END_CONDITION()
}
