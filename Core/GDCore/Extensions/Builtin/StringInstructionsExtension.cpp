/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "AllBuiltinExtensions.h"
#include "GDCore/Tools/Localization.h"

using namespace std;
namespace gd {

void GD_CORE_API
BuiltinExtensionsImplementer::ImplementsStringInstructionsExtension(
    gd::PlatformExtension& extension) {
  extension
      .SetExtensionInformation(
          "BuiltinStringInstructions",
          _("Text manipulation"),
          "Provides expressions to manipulate strings (also called texts).",
          "Florian Rival",
          "Open source (MIT License)")
      .SetExtensionHelpPath("" /*TODO: Add a documentation page for this */);
  extension.AddInstructionOrExpressionGroupMetadata(_("Text manipulation"))
      .SetIcon("res/actions/text24_black.png");

  extension.AddStrExpression("NewLine",
                             _("Insert a new line"),
                             _("Insert a new line"),
                             "",
                             "res/conditions/toujours24_black.png");

  extension
      .AddStrExpression("FromCodePoint",
                        _("Get character from code point"),
                        _("Get character from code point"),
                        "",
                        "res/conditions/toujours24_black.png")

      .AddParameter("expression", _("Code point"));

  extension
      .AddStrExpression("ToUpperCase",
                        _("Uppercase a text"),
                        _("Uppercase a text"),
                        "",
                        "res/conditions/toujours24_black.png")

      .AddParameter("string", _("Text"));

  extension
      .AddStrExpression("ToLowerCase",
                        _("Lowercase a text"),
                        _("Lowercase a text"),
                        "",
                        "res/conditions/toujours24_black.png")

      .AddParameter("string", _("Text"));

  extension
      .AddStrExpression("SubStr",
                        _("Get a portion of a text"),
                        _("Get a portion of a text"),
                        "",
                        "res/conditions/toujours24_black.png")

      .AddParameter("string", _("Text"))
      .AddParameter("expression",
                    _("Start position of the portion (the first letter is at "
                      "position 0)"))
      .AddParameter("expression", _("Length of the portion"));

  extension
      .AddStrExpression("StrAt",
                        _("Get a character from a text"),
                        _("Get a character from a text"),
                        "",
                        "res/conditions/toujours24_black.png")

      .AddParameter("string", _("Text"))
      .AddParameter(
          "expression",
          _("Position of the character (the first letter is at position 0)"));

  extension
      .AddStrExpression("StrRepeat",
                        _("Repeat a text"),
                        _("Repeat a text"),
                        "",
                        "res/conditions/toujours24_black.png")

      .AddParameter("string", _("Text to repeat"))
      .AddParameter("expression", _("Repetition count"));

  extension
      .AddExpression("StrLength",
                     _("Length of a text"),
                     _("Length of a text"),
                     "",
                     "res/conditions/toujours24_black.png")

      .AddParameter("string", _("Text"));

  extension
      .AddExpression("StrFind",
                     _("Search in a text"),
                     _("Search in a text (return the position of the result or "
                       "-1 if not found)"),
                     "",
                     "res/conditions/toujours24_black.png")

      .AddParameter("string", _("Text"))
      .AddParameter("string", _("Text to search for"));

  extension
      .AddExpression("StrRFind",
                     "Search in a text from the end",
                     "Search in a text from the end (return the position of "
                     "the result or -1 if not found)",
                     "",
                     "res/conditions/toujours24_black.png")

      .AddParameter("string", _("Text"))
      .AddParameter("string", _("Text to search for"))
      .SetHidden();  // Deprecated, see StrFindLast instead.

  extension
      .AddExpression(
          "StrFindLast",
          _("Search the last occurrence in a text"),
          _("Search the last occurrence in a string (return the position of "
            "the result, from the beginning of the string, or -1 if not "
            "found)"),
          "",
          "res/conditions/toujours24_black.png")

      .AddParameter("string", _("Text"))
      .AddParameter("string", _("Text to search for"));

  extension
      .AddExpression("StrFindFrom",
                     _("Search in a text, starting from a position"),
                     _("Search in a text, starting from a position (return the "
                       "position of the result or -1 if not found)"),
                     "",
                     "res/conditions/toujours24_black.png")

      .AddParameter("string", _("Text"))
      .AddParameter("string", _("Text to search for"))
      .AddParameter("expression",
                    _("Position of the first character in the string to be "
                      "considered in the search"));

  extension
      .AddExpression(
          "StrRFindFrom",
          "Search in a text from the end, starting from a position",
          "Search in a text from the end, starting from a position (return "
          "the position of the result or -1 if not found)",
          "",
          "res/conditions/toujours24_black.png")

      .AddParameter("string", _("Text"))
      .AddParameter("string", _("Text to search for"))
      .AddParameter("expression",
                    "Position of the last character in the string to be "
                    "considered in the search")
      .SetHidden();  // Deprecated, see StrFindLastFrom instead.

  extension
      .AddExpression(
          "StrFindLastFrom",
          _("Search the last occurrence in a text, starting from a position"),
          _("Search in a text the last occurrence, starting from a position "
            "(return "
            "the position of the result, from the beginning of the string, or "
            "-1 if not found)"),
          "",
          "res/conditions/toujours24_black.png")

      .AddParameter("string", _("Text"))
      .AddParameter("string", _("Text to search for"))
      .AddParameter("expression",
                    _("Position of the last character in the string to be "
                      "considered in the search"));

  extension
      .AddStrExpression("StrReplaceOne",
                        _("Replace the first occurrence of a text by another."),
                        _("Replace the first occurrence of a text by another."),
                        "",
                        "res/conditions/toujours24_black.png")
      .AddParameter("string", _("Text in which the replacement must be done"))
      .AddParameter("string", _("Text to find inside the first text"))
      .AddParameter("string", _("Replacement to put instead of the text to find"));

  extension
      .AddStrExpression("StrReplaceAll",
                        _("Replace all occurrences of a text by another."),
                        _("Replace all occurrences of a text by another."),
                        "",
                        "res/conditions/toujours24_black.png")
      .AddParameter("string", _("Text in which the replacement(s) must be done"))
      .AddParameter("string", _("Text to find inside the first text"))
      .AddParameter("string", _("Replacement to put instead of the text to find"));

}

}  // namespace gd
