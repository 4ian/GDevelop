/*
 * GDevelop Core
 * Copyright 2008-2014 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the GNU Lesser General Public License.
 */
#include "AllBuiltinExtensions.h"
#include "GDCore/Tools/Localization.h"

using namespace std;
namespace gd
{

void GD_CORE_API BuiltinExtensionsImplementer::ImplementsCommonConversionsExtension(gd::PlatformExtension & extension)
{
    extension.SetExtensionInformation("BuiltinCommonConversions",
                          _("Standard Conversions"),
                          _("Built-in extension providing standard conversions expressions."),
                          "Florian Rival",
                          "Freeware");

    #if defined(GD_IDE_ONLY)

    extension.AddExpression("ToNumber",
                       _("Text > Number"),
                       _("Convert the text to a number"),
                       _("Conversion"),
                       "res/conditions/toujours24.png")
        .AddParameter("string", _("Text to convert in a number"), "",false);

    extension.AddStrExpression("ToString",
                       _("Number > Text"),
                       _("Convert the result of the expression in a text"),
                       _("Conversion"),
                       "res/conditions/toujours24.png")
        .AddParameter("expression", _("Expression to be converted to a text"), "",false);

    extension.AddStrExpression("LargeNumberToString",
                       _("Number > Text ( without scientific notation )"),
                       _("Convert the result of the expression in a text, without using the scientific notation"),
                       _("Conversion"),
                       "res/conditions/toujours24.png")
        .AddParameter("expression", _("Expression to be converted to a text"), "",false);

    extension.AddExpression("ToRad",
                       _("Degrees > Radians"),
                       _("Converts the angle, expressed in degrees, into radians"),
                       _("Conversion"),
                       "res/conditions/toujours24.png")
        .AddParameter("expression", _("Angle, in degrees"), "",false);


    extension.AddExpression("ToDeg",
                       _("Radians > Degrees"),
                       _("Converts the angle, expressed in radians, into degrees"),
                       _("Conversion"),
                       "res/conditions/toujours24.png")
        .AddParameter("expression", _("Angle, in radians"), "",false);
    #endif
}

}
