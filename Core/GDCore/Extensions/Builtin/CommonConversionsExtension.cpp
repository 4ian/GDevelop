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
BuiltinExtensionsImplementer::ImplementsCommonConversionsExtension(
    gd::PlatformExtension& extension) {
  extension
      .SetExtensionInformation(
          "BuiltinCommonConversions",
          _("Conversion"),
          "Expressions to convert number, texts and quantities.",
          "Florian Rival",
          "Open source (MIT License)")
      .SetExtensionHelpPath("/all-features/common-conversions");
  extension.AddInstructionOrExpressionGroupMetadata(_("Conversion"))
      .SetIcon("res/conditions/toujours24_black.png");

  extension
      .AddExpression("ToNumber",
                     _("Text > Number"),
                     _("Convert the text to a number"),
                     "",
                     "res/conditions/toujours24_black.png")
      .AddParameter("string", _("Text to convert to a number"));

  extension
      .AddStrExpression("ToString",
                        _("Number > Text"),
                        _("Convert the result of the expression to text"),
                        "",
                        "res/conditions/toujours24_black.png")
      .AddParameter("expression", _("Expression to be converted to text"));

  extension
      .AddStrExpression("LargeNumberToString",
                        _("Number > Text ( without scientific notation )"),
                        _("Convert the result of the expression to text, "
                          "without using the scientific notation"),
                        "",
                        "res/conditions/toujours24_black.png")
      .AddParameter("expression", _("Expression to be converted to text"));

  extension
      .AddExpression(
          "ToRad",
          _("Degrees > Radians"),
          _("Converts the angle, expressed in degrees, into radians"),
          "",
          "res/conditions/toujours24_black.png")
      .AddParameter("expression", _("Angle, in degrees"));

  extension
      .AddExpression(
          "ToDeg",
          _("Radians > Degrees"),
          _("Converts the angle, expressed in radians, into degrees"),
          "",
          "res/conditions/toujours24_black.png")
      .AddParameter("expression", _("Angle, in radians"));

  extension
      .AddStrExpression("ToJSON",
                        _("Convert scene variable to JSON"),
                        _("Convert a scene variable to JSON"),
                        _("JSON"),
                        "res/conditions/toujours24_black.png")
      .AddParameter("scenevar", _("Scene variable to be stringified"));

  extension
      .AddStrExpression("GlobalVarToJSON",
                        _("Convert global variable to JSON"),
                        _("Convert a global variable to JSON"),
                        _("JSON"),
                        "res/conditions/toujours24_black.png")
      .AddParameter("globalvar", _("The global variable to be stringified"));

  extension
      .AddStrExpression("ObjectVarToJSON",
                        _("Convert object variable to JSON"),
                        _("Convert an object variable to JSON"),
                        _("JSON"),
                        "res/conditions/toujours24_black.png")
      .AddParameter("objectPtr", _("The object with the variable"))
      .AddParameter("objectvar", _("The object variable to be stringified"));

  extension
      .AddAction(
          "JSONToVariableStructure",
          _("Convert JSON to a scene variable"),
          _("Parse a JSON object and store it into a scene variable"),
          _("Convert JSON string _PARAM0_ and store it into variable _PARAM1_"),
          "",
          "res/actions/net24.png",
          "res/actions/net.png")
      .AddParameter("string", _("JSON string"))
      .AddParameter("scenevar", _("Variable where store the JSON object"))
      .MarkAsAdvanced();

  extension
      .AddAction("JSONToGlobalVariableStructure",
                 _("Convert JSON to global variable"),
                 _("Parse a JSON object and store it into a global variable"),
                 _("Convert JSON string _PARAM0_ and store it into global "
                   "variable _PARAM1_"),
                 "",
                 "res/actions/net24.png",
                 "res/actions/net.png")
      .AddParameter("string", _("JSON string"))
      .AddParameter("globalvar",
                    _("Global variable where store the JSON object"))
      .MarkAsAdvanced();

  extension
      .AddAction("JSONToObjectVariableStructure",
                 _("Convert JSON to object variable"),
                 _("Parse a JSON object and store it into an object variable"),
                 _("Parse JSON string _PARAM0_ and store it into variable "
                   "_PARAM2_ of _PARAM1_"),
                 "",
                 "res/actions/net24.png",
                 "res/actions/net.png")
      .AddParameter("string", _("JSON string"))
      .AddParameter("objectPtr", _("Object"))
      .AddParameter("objectvar",
                    _("Object variable where store the JSON object"))
      .MarkAsAdvanced();
}

}  // namespace gd
