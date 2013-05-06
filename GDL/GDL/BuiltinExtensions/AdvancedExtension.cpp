/** \file
 *  Game Develop
 *  2008-2013 Florian Rival (Florian.Rival@gmail.com)
 */

#include "GDL/BuiltinExtensions/AdvancedExtension.h"
#include "GDL/ExtensionBase.h"

AdvancedExtension::AdvancedExtension()
{
    SetExtensionInformation("BuiltinAdvanced",
                          _("Advanced control features"),
                          _("Builtin extension providing advanced control features."),
                          "Compil Games",
                          "Freeware");

    #if defined(GD_IDE_ONLY)
    AddCondition("Toujours",
                 _("Always"),
                 _("This condition returns always true ( and always false if contrary is checked )."),
                 _("Always"),
                 _("Other"),
                 "res/conditions/toujours24.png",
                 "res/conditions/toujours.png")
    .AddCodeOnlyParameter("conditionInverted", "")
    .codeExtraInformation.SetFunctionName("GDpriv::CommonInstructions::LogicalNegation").SetIncludeFile("GDL/BuiltinExtensions/CommonInstructionsTools.h");
    #endif
}

