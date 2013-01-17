/** \file
 *  Game Develop
 *  2008-2013 Florian Rival (Florian.Rival@gmail.com)
 */

#include "GDL/BuiltinExtensions/AdvancedExtension.h"
#include "GDL/ExtensionBase.h"

AdvancedExtension::AdvancedExtension()
{
    DECLARE_THE_EXTENSION("BuiltinAdvanced",
                          _("Advanced control features"),
                          _("Builtin extension providing advanced control features."),
                          "Compil Games",
                          "Freeware")

    #if defined(GD_IDE_ONLY)
    DECLARE_CONDITION("Toujours",
                   _("Always"),
                   _("This condition returns always true ( and always false if contrary is checked )."),
                   _("Always"),
                   _("Other"),
                   "res/conditions/toujours24.png",
                   "res/conditions/toujours.png");

        instrInfo.AddCodeOnlyParameter("conditionInverted", "");

        instrInfo.cppCallingInformation.SetFunctionName("GDpriv::CommonInstructions::LogicalNegation").SetIncludeFile("GDL/BuiltinExtensions/CommonInstructionsTools.h");

    DECLARE_END_CONDITION()
    #endif
}

