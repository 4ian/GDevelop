/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */

#include "GDL/BuiltinExtensions/StringInstructionsExtension.h"
#include "GDL/ExtensionBase.h"

StringInstructionsExtension::StringInstructionsExtension()
{
    DECLARE_THE_EXTENSION("BuiltinStringInstructions",
                          _("Text manipulation"),
                          _("Builtin extension providing expressions for manipulating texts."),
                          "Compil Games",
                          "Freeware")

    #if defined(GD_IDE_ONLY)

    DECLARE_STR_EXPRESSION("SubStr",
                   _("Get a portion of text from a text"),
                   _("Get a portion of text from a text"),
                   _("Manipulation on text"),
                   "res/conditions/toujours24.png")

        instrInfo.AddParameter("string", _("Text"), "",false);
        instrInfo.AddParameter("expression", _("Start position of the portion ( The first letter is at position 0 )"), "",false);
        instrInfo.AddParameter("expression", _("Length of the portion"), "",false);

        instrInfo.cppCallingInformation.SetFunctionName("GDpriv::StringTools::SubStr").SetIncludeFile("GDL/BuiltinExtensions/StringTools.h");

    DECLARE_END_STR_EXPRESSION()

    DECLARE_STR_EXPRESSION("StrAt",
                   _("Get a character from a text"),
                   _("Get a character from a text"),
                   _("Manipulation on text"),
                   "res/conditions/toujours24.png")

        instrInfo.AddParameter("string", _("Text"), "",false);
        instrInfo.AddParameter("expression", _("Position of the character ( The first letter is at position 0 )"), "",false);

        instrInfo.cppCallingInformation.SetFunctionName("GDpriv::StringTools::StrAt").SetIncludeFile("GDL/BuiltinExtensions/StringTools.h");

    DECLARE_END_STR_EXPRESSION()

    DECLARE_EXPRESSION("StrLength",
                   _("Length of a text"),
                   _("Length of a text"),
                   _("Manipulation on text"),
                   "res/conditions/toujours24.png")

        instrInfo.AddParameter("string", _("Text"), "",false);

        instrInfo.cppCallingInformation.SetFunctionName("GDpriv::StringTools::StrLen").SetIncludeFile("GDL/BuiltinExtensions/StringTools.h");

    DECLARE_END_EXPRESSION()

    DECLARE_EXPRESSION("StrFind",
                   _("Search in a text"),
                   _("Search in a text ( Return the position of the result or -1 if not found )"),
                   _("Manipulation on text"),
                   "res/conditions/toujours24.png")

        instrInfo.AddParameter("string", _("Text"), "",false);
        instrInfo.AddParameter("string", _("Text to search for"), "",false);

        instrInfo.cppCallingInformation.SetFunctionName("GDpriv::StringTools::StrFind").SetIncludeFile("GDL/BuiltinExtensions/StringTools.h");

    DECLARE_END_EXPRESSION()

    DECLARE_EXPRESSION("StrRFind",
                   _("Search in a text from end"),
                   _("Search in a text from the end ( Return the position of the result or -1 if not found )"),
                   _("Manipulation on text"),
                   "res/conditions/toujours24.png")

        instrInfo.AddParameter("string", _("Text"), "",false);
        instrInfo.AddParameter("string", _("Text to search for"), "",false);

        instrInfo.cppCallingInformation.SetFunctionName("GDpriv::StringTools::StrRFind").SetIncludeFile("GDL/BuiltinExtensions/StringTools.h");

    DECLARE_END_EXPRESSION()

    DECLARE_EXPRESSION("StrFindFrom",
                   _("Search in a text, starting from a position"),
                   _("Search in a text starting from a position ( Return the position of the result or -1 if not found )"),
                   _("Manipulation on text"),
                   "res/conditions/toujours24.png")

        instrInfo.AddParameter("string", _("Text"), "",false);
        instrInfo.AddParameter("string", _("Text to search for"), "",false);
        instrInfo.AddParameter("expression", _("Position from which searching must begin"), "",false);

        instrInfo.cppCallingInformation.SetFunctionName("GDpriv::StringTools::StrFindFrom").SetIncludeFile("GDL/BuiltinExtensions/StringTools.h");

    DECLARE_END_EXPRESSION()

    DECLARE_EXPRESSION("StrRFindFrom",
                   _("Search in a text from the end, starting from a position"),
                   _("Search in a text from the end, starting from a position ( Return the position of the result or -1 if not found )"),
                   _("Manipulation on text"),
                   "res/conditions/toujours24.png")

        instrInfo.AddParameter("string", _("Text"), "",false);
        instrInfo.AddParameter("string", _("Text to search for"), "",false);
        instrInfo.AddParameter("expression", _("Position from which searching must begin"), "",false);

        instrInfo.cppCallingInformation.SetFunctionName("GDpriv::StringTools::StrRFindFrom").SetIncludeFile("GDL/BuiltinExtensions/StringTools.h");

    DECLARE_END_EXPRESSION()
    #endif
}

