/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
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
                          _("Text manipulation"),
                          _("Built-in extension providing expressions for manipulating text objects."),
                          "Florian Rival",
                          "Open source (MIT License)");

    #if defined(GD_IDE_ONLY)
    extension.AddStrExpression("NewLine",
                   _("Insert a new line"),
                   _("Insert a new line"),
                   _("Manipulation of text"),
                   "res/conditions/toujours24.png");

    extension.AddStrExpression("FromCodePoint",
                   _("Get character from code point"),
                   _("Get character from code point"),
                   _("Manipulation of text"),
                   "res/conditions/toujours24.png")

        .AddParameter("expression", _("Code point"));

    extension.AddStrExpression("ToUpperCase",
                   _("Uppercase a text"),
                   _("Uppercase a text"),
                   _("Manipulation of text"),
                   "res/conditions/toujours24.png")

        .AddParameter("string", _("Text"));

    extension.AddStrExpression("ToLowerCase",
                   _("Lowercase a text"),
                   _("Lowercase a text"),
                   _("Manipulation of text"),
                   "res/conditions/toujours24.png")

        .AddParameter("string", _("Text"));

    extension.AddStrExpression("SubStr",
                   _("Get a portion of a text"),
                   _("Get a portion of a text"),
                   _("Manipulation of text"),
                   "res/conditions/toujours24.png")

        .AddParameter("string", _("Text"))
        .AddParameter("expression", _("Start position of the portion (the first letter is at position 0)"))
        .AddParameter("expression", _("Length of the portion"));

    extension.AddStrExpression("StrAt",
                   _("Get a character from a text"),
                   _("Get a character from a text"),
                   _("Manipulation of text"),
                   "res/conditions/toujours24.png")

        .AddParameter("string", _("Text"))
        .AddParameter("expression", _("Position of the character (the first letter is at position 0)"));

    extension.AddStrExpression("StrRepeat",
                   _("Repeat a text"),
                   _("Repeat a text"),
                   _("Manipulation of text"),
                   "res/conditions/toujours24.png")

        .AddParameter("string", _("Text to repeat"))
        .AddParameter("expression", _("Repetition count"));

    extension.AddExpression("StrLength",
                   _("Length of a text"),
                   _("Length of a text"),
                   _("Manipulation of text"),
                   "res/conditions/toujours24.png")

        .AddParameter("string", _("Text"));


    extension.AddExpression("StrFind",
                   _("Search in a text"),
                   _("Search in a text (return the position of the result or -1 if not found)"),
                   _("Manipulation of text"),
                   "res/conditions/toujours24.png")

        .AddParameter("string", _("Text"))
        .AddParameter("string", _("Text to search for"));


    extension.AddExpression("StrRFind",
                   _("Search in a text from the end"),
                   _("Search in a text from the end (return the position of the result or -1 if not found)"),
                   _("Manipulation of text"),
                   "res/conditions/toujours24.png")

        .AddParameter("string", _("Text"))
        .AddParameter("string", _("Text to search for"));



    extension.AddExpression("StrFindFrom",
                   _("Search in a text, starting from a position"),
                   _("Search in a text, starting from a position (return the position of the result or -1 if not found)"),
                   _("Manipulation of text"),
                   "res/conditions/toujours24.png")

        .AddParameter("string", _("Text"))
        .AddParameter("string", _("Text to search for"))
        .AddParameter("expression", _("Position of the first character in the string to be considered in the search"));



    extension.AddExpression("StrRFindFrom",
                   _("Search in a text from the end, starting from a position"),
                   _("Search in a text from the end, starting from a position (return the position of the result or -1 if not found)"),
                   _("Manipulation of text"),
                   "res/conditions/toujours24.png")

        .AddParameter("string", _("Text"))
        .AddParameter("string", _("Text to search for"))
        .AddParameter("expression", _("Position of the last character in the string to be considered in the search"));


    #endif
}

}
