/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "AllBuiltinExtensions.h"
#include "GDCore/Tools/Localization.h"

using namespace std;
namespace gd {

void GD_CORE_API BuiltinExtensionsImplementer::ImplementsAdvancedExtension(
    gd::PlatformExtension& extension) {
  extension
      .SetExtensionInformation(
          "BuiltinAdvanced",
          _("Event functions"),
          _("Advanced control features for functions made with events."),
          "Florian Rival",
          "Open source (MIT License)")
      .SetCategory("Advanced");
  extension.AddInstructionOrExpressionGroupMetadata(_("Event functions"))
      .SetIcon("res/function32.png");

  extension
      .AddAction(
          "SetReturnNumber",
          _("Set number return value"),
          _("Set the return value of the events function to the specified "
            "number (to be used with \"Expression\" functions)."),
          _("Set return value to number _PARAM0_"),
          "",
          "res/function32.png",
          "res/function32.png")
      .SetHelpPath("/events/functions/return")
      .AddParameter("expression", "The number to be returned")
      .MarkAsAdvanced();

  extension
      .AddAction(
          "SetReturnString",
          _("Set text return value"),
          _("Set the return value of the events function to the specified text "
            "(to be used with \"String Expression\" functions)."),
          _("Set return value to text _PARAM0_"),
          "",
          "res/function32.png",
          "res/function32.png")
      .SetHelpPath("/events/functions/return")
      .AddParameter("string", "The text to be returned")
      .MarkAsAdvanced();

  extension
      .AddAction("SetReturnBoolean",
                 _("Set condition return value"),
                 _("Set the return value of the Condition events function to "
                   "either true (condition will pass) or false."),
                 _("Set return value of the condition to _PARAM0_"),
                 "",
                 "res/function32.png",
                 "res/function32.png")
      .SetHelpPath("/events/functions/return")
      .AddParameter("trueorfalse", "Should the condition be true or false?")
      .MarkAsAdvanced();

  extension
      .AddCondition("GetArgumentAsBoolean",
                    _("Check if a function parameter is set to true (or yes)"),
                    _("Check if the specified function parameter (also called "
                      "\"argument\") is set to True or Yes. If the argument is "
                      "a string, an empty string is considered as \"false\". "
                      "If it's a number, 0 is considered as \"false\"."),
                    _("Parameter _PARAM0_ is true"),
                    "",
                    "res/function32.png",
                    "res/function32.png")
      .AddParameter("functionParameterName", "Parameter name")
      .MarkAsAdvanced();

  extension
      .AddExpression(
          "GetArgumentAsNumber",
          _("Get function parameter value"),
          _("Get function parameter (also called \"argument\") value."),
          "",
          "res/function16.png")
      .AddParameter("functionParameterName", "Parameter name");

  extension
      .AddStrExpression(
          "GetArgumentAsString",
          _("Get function parameter text"),
          _("Get function parameter (also called \"argument\") text."),
          "",
          "res/function16.png")
      .AddParameter("functionParameterName", "Parameter name");

  extension
      .AddCondition(
          "CompareArgumentAsNumber",
          _("Compare function parameter value"),
          _("Compare function parameter (also called \"argument\") value."),
          _("Parameter _PARAM0_"),
          "",
          "res/function32.png",
          "res/function16.png")
      .AddParameter("functionParameterName", "Parameter name")
      .UseStandardRelationalOperatorParameters("number");

  extension
      .AddCondition(
          "CompareArgumentAsString",
          _("Compare function parameter text"),
          _("Compare function parameter (also called \"argument\") text."),
          _("Parameter _PARAM0_"),
          "",
          "res/function32.png",
          "res/function16.png")
      .AddParameter("functionParameterName", "Parameter name")
      .UseStandardRelationalOperatorParameters("string");
}

}  // namespace gd
