/** \file
 *  Game Develop
 *  2008-2014 Florian Rival (Florian.Rival@gmail.com)
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
                          _("Built-in extension providing expressions for manipulating texts."),
                          "Florian Rival",
                          "Freeware");

    #if defined(GD_IDE_ONLY)
    extension.AddStrExpression("NewLine",
                   _("Insert a new line"),
                   _("Insert a new line"),
                   _("Manipulation on text"),
                   "res/conditions/toujours24.png");

    extension.AddStrExpression("SubStr",
                   _("Get a portion of a text"),
                   _("Get a portion of a text"),
                   _("Manipulation on text"),
                   "res/conditions/toujours24.png")

        .AddParameter("string", _("Text"), "",false)
        .AddParameter("expression", _("Start position of the portion ( The first letter is at position 0 )"), "",false)
        .AddParameter("expression", _("Length of the portion"), "",false);

    extension.AddStrExpression("StrAt",
                   _("Get a character from a text"),
                   _("Get a character from a text"),
                   _("Manipulation on text"),
                   "res/conditions/toujours24.png")

        .AddParameter("string", _("Text"), "",false)
        .AddParameter("expression", _("Position of the character ( The first letter is at position 0 )"), "",false);

    extension.AddExpression("StrLength",
                   _("Length of a text"),
                   _("Length of a text"),
                   _("Manipulation on text"),
                   "res/conditions/toujours24.png")

        .AddParameter("string", _("Text"), "",false);



    extension.AddExpression("StrFind",
                   _("Search in a text"),
                   _("Search in a text ( Return the position of the result or -1 if not found )"),
                   _("Manipulation on text"),
                   "res/conditions/toujours24.png")

        .AddParameter("string", _("Text"), "",false)
        .AddParameter("string", _("Text to search for"), "",false);



    extension.AddExpression("StrRFind",
                   _("Search in a text from end"),
                   _("Search in a text from the end ( Return the position of the result or -1 if not found )"),
                   _("Manipulation on text"),
                   "res/conditions/toujours24.png")

        .AddParameter("string", _("Text"), "",false)
        .AddParameter("string", _("Text to search for"), "",false);



    extension.AddExpression("StrFindFrom",
                   _("Search in a text, starting from a position"),
                   _("Search in a text starting from a position ( Return the position of the result or -1 if not found )"),
                   _("Manipulation on text"),
                   "res/conditions/toujours24.png")

        .AddParameter("string", _("Text"), "",false)
        .AddParameter("string", _("Text to search for"), "",false)
        .AddParameter("expression", _("Position of the first character in the string to be considered in the search"), "",false);



    extension.AddExpression("StrRFindFrom",
                   _("Search in a text from the end, starting from a position"),
                   _("Search in a text from the end, starting from a position ( Return the position of the result or -1 if not found )"),
                   _("Manipulation on text"),
                   "res/conditions/toujours24.png")

        .AddParameter("string", _("Text"), "",false)
        .AddParameter("string", _("Text to search for"), "",false)
        .AddParameter("expression", _("Position of the last character in the string to be considered in the search"), "",false);


    #endif
}

}