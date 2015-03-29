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

void GD_CORE_API BuiltinExtensionsImplementer::ImplementsStringInstructionsExtension(gd::PlatformExtension & extension)
{
    extension.SetExtensionInformation("BuiltinStringInstructions",
                          GD_T("Text manipulation"),
                          GD_T("Built-in extension providing expressions for manipulating texts."),
                          "Florian Rival",
                          "Open source (MIT License)");

    #if defined(GD_IDE_ONLY)
    extension.AddStrExpression("NewLine",
                   GD_T("Insert a new line"),
                   GD_T("Insert a new line"),
                   GD_T("Manipulation on text"),
                   "res/conditions/toujours24.png");

    extension.AddStrExpression("SubStr",
                   GD_T("Get a portion of a text"),
                   GD_T("Get a portion of a text"),
                   GD_T("Manipulation on text"),
                   "res/conditions/toujours24.png")

        .AddParameter("string", GD_T("Text"), "",false)
        .AddParameter("expression", GD_T("Start position of the portion ( The first letter is at position 0 )"), "",false)
        .AddParameter("expression", GD_T("Length of the portion"), "",false);

    extension.AddStrExpression("StrAt",
                   GD_T("Get a character from a text"),
                   GD_T("Get a character from a text"),
                   GD_T("Manipulation on text"),
                   "res/conditions/toujours24.png")

        .AddParameter("string", GD_T("Text"), "",false)
        .AddParameter("expression", GD_T("Position of the character ( The first letter is at position 0 )"), "",false);

    extension.AddExpression("StrLength",
                   GD_T("Length of a text"),
                   GD_T("Length of a text"),
                   GD_T("Manipulation on text"),
                   "res/conditions/toujours24.png")

        .AddParameter("string", GD_T("Text"), "",false);



    extension.AddExpression("StrFind",
                   GD_T("Search in a text"),
                   GD_T("Search in a text ( Return the position of the result or -1 if not found )"),
                   GD_T("Manipulation on text"),
                   "res/conditions/toujours24.png")

        .AddParameter("string", GD_T("Text"), "",false)
        .AddParameter("string", GD_T("Text to search for"), "",false);



    extension.AddExpression("StrRFind",
                   GD_T("Search in a text from end"),
                   GD_T("Search in a text from the end ( Return the position of the result or -1 if not found )"),
                   GD_T("Manipulation on text"),
                   "res/conditions/toujours24.png")

        .AddParameter("string", GD_T("Text"), "",false)
        .AddParameter("string", GD_T("Text to search for"), "",false);



    extension.AddExpression("StrFindFrom",
                   GD_T("Search in a text, starting from a position"),
                   GD_T("Search in a text starting from a position ( Return the position of the result or -1 if not found )"),
                   GD_T("Manipulation on text"),
                   "res/conditions/toujours24.png")

        .AddParameter("string", GD_T("Text"), "",false)
        .AddParameter("string", GD_T("Text to search for"), "",false)
        .AddParameter("expression", GD_T("Position of the first character in the string to be considered in the search"), "",false);



    extension.AddExpression("StrRFindFrom",
                   GD_T("Search in a text from the end, starting from a position"),
                   GD_T("Search in a text from the end, starting from a position ( Return the position of the result or -1 if not found )"),
                   GD_T("Manipulation on text"),
                   "res/conditions/toujours24.png")

        .AddParameter("string", GD_T("Text"), "",false)
        .AddParameter("string", GD_T("Text to search for"), "",false)
        .AddParameter("expression", GD_T("Position of the last character in the string to be considered in the search"), "",false);


    #endif
}

}
