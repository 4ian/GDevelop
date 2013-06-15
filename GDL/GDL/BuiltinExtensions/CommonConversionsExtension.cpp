#include "GDL/BuiltinExtensions/CommonConversionsExtension.h"

CommonConversionsExtension::CommonConversionsExtension()
{
    SetExtensionInformation("BuiltinCommonConversions",
                          _("Standard Conversions"),
                          _("Built-in extension providing standard conversions expressions."),
                          "Compil Games",
                          "Freeware");
    #if defined(GD_IDE_ONLY)

    AddExpression("ToNumber",
                       _("Text > Number"),
                       _("Convert the text to a number"),
                       _("Conversion"),
                       "res/conditions/toujours24.png")

        .AddParameter("string", _("Text to convert in a number"), "",false)
        .codeExtraInformation.SetFunctionName("GDpriv::CommonInstructions::ToDouble").SetIncludeFile("GDL/BuiltinExtensions/CommonInstructionsTools.h");



    AddStrExpression("ToString",
                       _("Number > Text"),
                       _("Convert the result of the expression in a text"),
                       _("Conversion"),
                       "res/conditions/toujours24.png")

        .AddParameter("expression", _("Expression to be converted to a text"), "",false)
        .codeExtraInformation.SetFunctionName("GDpriv::CommonInstructions::ToString").SetIncludeFile("GDL/BuiltinExtensions/CommonInstructionsTools.h");

    AddStrExpression("LargeNumberToString",
                       _("Number > Text ( without scientific notation )"),
                       _("Convert the result of the expression in a text, without using the scientific notation"),
                       _("Conversion"),
                       "res/conditions/toujours24.png")

        .AddParameter("expression", _("Expression to be converted to a text"), "",false)
        .codeExtraInformation.SetFunctionName("GDpriv::CommonInstructions::LargeNumberToString").SetIncludeFile("GDL/BuiltinExtensions/CommonInstructionsTools.h");

    AddExpression("ToRad",
                       _("Degrees > Radians"),
                       _("Converts the angle, expressed in degrees, into radians"),
                       _("Conversion"),
                       "res/conditions/toujours24.png")

        .AddParameter("expression", _("Angle, in degrees"), "",false)
        .codeExtraInformation.SetFunctionName("GDpriv::CommonInstructions::ToRad").SetIncludeFile("GDL/BuiltinExtensions/CommonInstructionsTools.h");



    AddExpression("ToDeg",
                       _("Radians > Degrees"),
                       _("Converts the angle, expressed in radians, into degrees"),
                       _("Conversion"),
                       "res/conditions/toujours24.png")

        .AddParameter("expression", _("Angle, in radians"), "",false)
        .codeExtraInformation.SetFunctionName("GDpriv::CommonInstructions::ToDeg").SetIncludeFile("GDL/BuiltinExtensions/CommonInstructionsTools.h");


    #endif
}

