/*
 * GDevelop Core
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#include "AllBuiltinExtensions.h"
#include "GDCore/Tools/Localization.h"

using namespace std;
namespace gd
{

void GD_CORE_API BuiltinExtensionsImplementer::ImplementsCommonConversionsExtension(gd::PlatformExtension & extension)
{
    extension.SetExtensionInformation("BuiltinCommonConversions",
                          GD_T("Standard Conversions"),
                          GD_T("Built-in extension providing standard conversions expressions."),
                          "Florian Rival",
                          "Open source (MIT License)");

    #if defined(GD_IDE_ONLY)

    extension.AddExpression("ToNumber",
                       GD_T("Text > Number"),
                       GD_T("Convert the text to a number"),
                       GD_T("Conversion"),
                       "res/conditions/toujours24.png")
        .AddParameter("string", GD_T("Text to convert in a number"), "",false);

    extension.AddStrExpression("ToString",
                       GD_T("Number > Text"),
                       GD_T("Convert the result of the expression in a text"),
                       GD_T("Conversion"),
                       "res/conditions/toujours24.png")
        .AddParameter("expression", GD_T("Expression to be converted to a text"), "",false);

    extension.AddStrExpression("LargeNumberToString",
                       GD_T("Number > Text ( without scientific notation )"),
                       GD_T("Convert the result of the expression in a text, without using the scientific notation"),
                       GD_T("Conversion"),
                       "res/conditions/toujours24.png")
        .AddParameter("expression", GD_T("Expression to be converted to a text"), "",false);

    extension.AddExpression("ToRad",
                       GD_T("Degrees > Radians"),
                       GD_T("Converts the angle, expressed in degrees, into radians"),
                       GD_T("Conversion"),
                       "res/conditions/toujours24.png")
        .AddParameter("expression", GD_T("Angle, in degrees"), "",false);


    extension.AddExpression("ToDeg",
                       GD_T("Radians > Degrees"),
                       GD_T("Converts the angle, expressed in radians, into degrees"),
                       GD_T("Conversion"),
                       "res/conditions/toujours24.png")
        .AddParameter("expression", GD_T("Angle, in radians"), "",false);
    #endif
}

}
