/** \file
 *  Game Develop
 *  2008-2013 Florian Rival (Florian.Rival@gmail.com)
 */

#include "GDCpp/BuiltinExtensions/StringInstructionsExtension.h"
#include "GDCpp/ExtensionBase.h"

StringInstructionsExtension::StringInstructionsExtension()
{
    SetExtensionInformation("BuiltinStringInstructions",
                          _("Text manipulation"),
                          _("Built-in extension providing expressions for manipulating texts."),
                          "Florian Rival",
                          "Freeware");

    #if defined(GD_IDE_ONLY)

    AddStrExpression("NewLine",
                   _("Insert a new line"),
                   _("Insert a new line"),
                   _("Manipulation on text"),
                   "res/conditions/toujours24.png")
        .codeExtraInformation.SetFunctionName("GDpriv::StringTools::NewLine").SetIncludeFile("GDCpp/BuiltinExtensions/StringTools.h");

    AddStrExpression("SubStr",
                   _("Get a portion of text from a text"),
                   _("Get a portion of text from a text"),
                   _("Manipulation on text"),
                   "res/conditions/toujours24.png")

        .AddParameter("string", _("Text"), "",false)
        .AddParameter("expression", _("Start position of the portion ( The first letter is at position 0 )"), "",false)
        .AddParameter("expression", _("Length of the portion"), "",false)
        .codeExtraInformation.SetFunctionName("GDpriv::StringTools::SubStr").SetIncludeFile("GDCpp/BuiltinExtensions/StringTools.h");

    AddStrExpression("StrAt",
                   _("Get a character from a text"),
                   _("Get a character from a text"),
                   _("Manipulation on text"),
                   "res/conditions/toujours24.png")

        .AddParameter("string", _("Text"), "",false)
        .AddParameter("expression", _("Position of the character ( The first letter is at position 0 )"), "",false)
        .codeExtraInformation.SetFunctionName("GDpriv::StringTools::StrAt").SetIncludeFile("GDCpp/BuiltinExtensions/StringTools.h");

    AddExpression("StrLength",
                   _("Length of a text"),
                   _("Length of a text"),
                   _("Manipulation on text"),
                   "res/conditions/toujours24.png")

        .AddParameter("string", _("Text"), "",false)
        .codeExtraInformation.SetFunctionName("GDpriv::StringTools::StrLen").SetIncludeFile("GDCpp/BuiltinExtensions/StringTools.h");



    AddExpression("StrFind",
                   _("Search in a text"),
                   _("Search in a text ( Return the position of the result or -1 if not found )"),
                   _("Manipulation on text"),
                   "res/conditions/toujours24.png")

        .AddParameter("string", _("Text"), "",false)
        .AddParameter("string", _("Text to search for"), "",false)
        .codeExtraInformation.SetFunctionName("GDpriv::StringTools::StrFind").SetIncludeFile("GDCpp/BuiltinExtensions/StringTools.h");



    AddExpression("StrRFind",
                   _("Search in a text from end"),
                   _("Search in a text from the end ( Return the position of the result or -1 if not found )"),
                   _("Manipulation on text"),
                   "res/conditions/toujours24.png")

        .AddParameter("string", _("Text"), "",false)
        .AddParameter("string", _("Text to search for"), "",false)
        .codeExtraInformation.SetFunctionName("GDpriv::StringTools::StrRFind").SetIncludeFile("GDCpp/BuiltinExtensions/StringTools.h");



    AddExpression("StrFindFrom",
                   _("Search in a text, starting from a position"),
                   _("Search in a text starting from a position ( Return the position of the result or -1 if not found )"),
                   _("Manipulation on text"),
                   "res/conditions/toujours24.png")

        .AddParameter("string", _("Text"), "",false)
        .AddParameter("string", _("Text to search for"), "",false)
        .AddParameter("expression", _("Position from which searching must begin"), "",false)
        .codeExtraInformation.SetFunctionName("GDpriv::StringTools::StrFindFrom").SetIncludeFile("GDCpp/BuiltinExtensions/StringTools.h");



    AddExpression("StrRFindFrom",
                   _("Search in a text from the end, starting from a position"),
                   _("Search in a text from the end, starting from a position ( Return the position of the result or -1 if not found )"),
                   _("Manipulation on text"),
                   "res/conditions/toujours24.png")

        .AddParameter("string", _("Text"), "",false)
        .AddParameter("string", _("Text to search for"), "",false)
        .AddParameter("expression", _("Position from which searching must begin"), "",false)
        .codeExtraInformation.SetFunctionName("GDpriv::StringTools::StrRFindFrom").SetIncludeFile("GDCpp/BuiltinExtensions/StringTools.h");


    #endif
}

