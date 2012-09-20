#include "GDL/BuiltinExtensions/CommonConversionsExtension.h"

CommonConversionsExtension::CommonConversionsExtension()
{
    DECLARE_THE_EXTENSION("BuiltinCommonConversions",
                          _("Standard Conversions"),
                          _("Builtin extension providing standard conversions expressions."),
                          "Compil Games",
                          "Freeware")
    #if defined(GD_IDE_ONLY)

    DECLARE_EXPRESSION("ToNumber",
                       _("Text > Number"),
                       _("Convert the text to a number"),
                       _("Conversion"),
                       "res/conditions/toujours24.png")

        instrInfo.AddParameter("string", _("Text to convert in a number"), "",false);

        instrInfo.cppCallingInformation.SetFunctionName("GDpriv::CommonInstructions::ToDouble").SetIncludeFile("GDL/BuiltinExtensions/CommonInstructionsTools.h");

    DECLARE_END_EXPRESSION()

    DECLARE_STR_EXPRESSION("ToString",
                       _("Number > Text"),
                       _("Convert the result of the expression in a text"),
                       _("Conversion"),
                       "res/conditions/toujours24.png")

        instrInfo.AddParameter("expression", _("Expression to be converted to a text"), "",false);

        instrInfo.cppCallingInformation.SetFunctionName("GDpriv::CommonInstructions::ToString").SetIncludeFile("GDL/BuiltinExtensions/CommonInstructionsTools.h");

    DECLARE_END_STR_EXPRESSION()

    DECLARE_STR_EXPRESSION("LargeNumberToString",
                       _("Number > Text ( without scientific notation )"),
                       _("Convert the result of the expression in a text, without using the scientific notation"),
                       _("Conversion"),
                       "res/conditions/toujours24.png")

        instrInfo.AddParameter("expression", _("Expression to be converted to a text"), "",false);

        instrInfo.cppCallingInformation.SetFunctionName("GDpriv::CommonInstructions::LargeNumberToString").SetIncludeFile("GDL/BuiltinExtensions/CommonInstructionsTools.h");

    DECLARE_END_STR_EXPRESSION()

    DECLARE_EXPRESSION("ToRad",
                       _("Degrees > Radians"),
                       _("Converts the angle, expressed in degrees, into radians"),
                       _("Conversion"),
                       "res/conditions/toujours24.png")

        instrInfo.AddParameter("expression", _("Angle, in degrees"), "",false);

        instrInfo.cppCallingInformation.SetFunctionName("GDpriv::CommonInstructions::ToRad").SetIncludeFile("GDL/BuiltinExtensions/CommonInstructionsTools.h");

    DECLARE_END_EXPRESSION()

    DECLARE_EXPRESSION("ToDeg",
                       _("Radians > Degrees"),
                       _("Converts the angle, expressed in radians, into degrees"),
                       _("Conversion"),
                       "res/conditions/toujours24.png")

        instrInfo.AddParameter("expression", _("Angle, in radians"), "",false);

        instrInfo.cppCallingInformation.SetFunctionName("GDpriv::CommonInstructions::ToDeg").SetIncludeFile("GDL/BuiltinExtensions/CommonInstructionsTools.h");

    DECLARE_END_EXPRESSION()
    #endif
}

