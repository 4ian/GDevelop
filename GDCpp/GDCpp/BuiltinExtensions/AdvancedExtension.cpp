/** \file
 *  Game Develop
 *  2008-2013 Florian Rival (Florian.Rival@gmail.com)
 */

#include "GDCpp/BuiltinExtensions/AdvancedExtension.h"
#include "GDCpp/ExtensionBase.h"

AdvancedExtension::AdvancedExtension()
{
    SetExtensionInformation("BuiltinAdvanced",
                          _("Advanced control features"),
                          _("Built-in extension providing advanced control features."),
                          "Florian Rival",
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
    .codeExtraInformation.SetFunctionName("GDpriv::CommonInstructions::LogicalNegation").SetIncludeFile("GDCpp/BuiltinExtensions/CommonInstructionsTools.h");
    #endif
}

