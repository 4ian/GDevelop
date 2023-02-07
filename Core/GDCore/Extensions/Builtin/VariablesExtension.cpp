/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "AllBuiltinExtensions.h"
#include "GDCore/Tools/Localization.h"

using namespace std;
namespace gd {

void GD_CORE_API BuiltinExtensionsImplementer::ImplementsVariablesExtension(
    gd::PlatformExtension& extension) {
  extension
      .SetExtensionInformation(
          "BuiltinVariables",
          _("Variables"),
          "Actions, conditions and expressions to handle variables, from "
          "simple variables like the player score, the number of remaining "
          "lives to complex variables containing arbitrary data like an "
          "inventory or the result of a web request.",
          "Florian Rival",
          "Open source (MIT License)")
      .SetExtensionHelpPath("/all-features/variables");
  extension.AddInstructionOrExpressionGroupMetadata(_("Variables"))
      .SetIcon("res/conditions/var24.png");

  extension
      .AddCondition("VarScene",
                    _("Number"),
                    _("Compare the number value of a scene variable."),
                    _("The number of scene variable _PARAM0_"),
                    _("Scene variables"),
                    "res/conditions/var24.png",
                    "res/conditions/var.png")
      .AddParameter("scenevar", _("Variable"))
      .UseStandardRelationalOperatorParameters(
          "number", ParameterOptions::MakeNewOptions());

  extension
      .AddCondition("VarSceneTxt",
                    _("Text"),
                    _("Compare the text of a scene variable."),
                    _("The text of scene variable _PARAM0_"),
                    _("Scene variables"),
                    "res/conditions/var24.png",
                    "res/conditions/var.png")
      .AddParameter("scenevar", _("Variable"))
      .UseStandardRelationalOperatorParameters(
          "string", ParameterOptions::MakeNewOptions());

  extension
      .AddCondition(
          "SceneVariableAsBoolean",
          _("Boolean"),
          _("Compare the boolean value of a scene variable."),
          _("The boolean value of scene variable _PARAM0_ is _PARAM1_"),
          _("Scene variables"),
          "res/conditions/var24.png",
          "res/conditions/var.png")
      .AddParameter("scenevar", _("Variable"))
      .AddParameter("trueorfalse", _("Check if the value is"))
      .SetDefaultValue("true");

  extension
      .AddCondition("VariableChildExists",
                    _("Child existence"),
                    _("Check if the specified child of the scene structure "
                      "variable exists."),
                    _("Child _PARAM1_ of scene variable _PARAM0_ exists"),
                    _("Scene variables/Collections/Structures"),
                    "res/conditions/var24.png",
                    "res/conditions/var.png")
      .AddParameter("scenevar", _("Variable"))
      .AddParameter("string", _("Name of the child"))
      .MarkAsAdvanced();

  extension
      .AddCondition("GlobalVariableChildExists",
                    _("Child existence"),
                    _("Check if the specified child of the global structure "
                      "variable exists."),
                    _("Child _PARAM1_ of global variable _PARAM0_ exists"),
                    _("Global variables/Collections/Structures"),
                    "res/conditions/var24.png",
                    "res/conditions/var.png")
      .AddParameter("globalvar", _("Variable"))
      .AddParameter("string", _("Name of the child"))
      .MarkAsAdvanced();

  extension
      .AddCondition("VarSceneDef",
                    "Variable defined",
                    "Test if the scene variable exists.",
                    "Scene variable _PARAM0_ is defined",
                    _("Scene variables"),
                    "res/conditions/var24.png",
                    "res/conditions/var.png")
      .AddCodeOnlyParameter("currentScene", "")
      .AddParameter("string", _("Variable"))
      .SetHidden();  // Deprecated.

  extension
      .AddCondition("VarGlobal",
                    _("Number"),
                    _("Compare the number value of a global variable."),
                    _("the global variable _PARAM0_"),
                    _("Global variables"),
                    "res/conditions/var24.png",
                    "res/conditions/var.png")
      .AddParameter("globalvar", _("Variable"))
      .UseStandardRelationalOperatorParameters(
          "number", ParameterOptions::MakeNewOptions())
      .MarkAsAdvanced();

  extension
      .AddCondition("VarGlobalTxt",
                    _("Text"),
                    _("Compare the text of a global variable."),
                    _("the text of the global variable _PARAM0_"),
                    _("Global variables"),
                    "res/conditions/var24.png",
                    "res/conditions/var.png")
      .AddParameter("globalvar", _("Variable"))
      .UseStandardRelationalOperatorParameters(
          "string", ParameterOptions::MakeNewOptions())
      .MarkAsAdvanced();

  extension
      .AddCondition(
          "GlobalVariableAsBoolean",
          _("Boolean"),
          _("Compare the boolean value of a global variable."),
          _("The boolean value of global variable _PARAM0_ is _PARAM1_"),
          _("Global variables"),
          "res/conditions/var24.png",
          "res/conditions/var.png")
      .AddParameter("globalvar", _("Variable"))
      .AddParameter("trueorfalse", _("Check if the value is"))
      .SetDefaultValue("true");

  extension
      .AddCondition("VarGlobalDef",
                    "Variable defined",
                    "Test if a global variable exists.",
                    "Global variable _PARAM0_ is defined",
                    _("Global variables"),
                    "res/conditions/var24.png",
                    "res/conditions/var.png")
      .AddCodeOnlyParameter("currentScene", "")
      .AddParameter("string", _("Variable"))
      .MarkAsAdvanced()
      .SetHidden();  // Deprecated.

  extension
      .AddAction("ModVarScene",
                 _("Change number"),
                 _("Modify the number value of a scene variable."),
                 _("the scene variable _PARAM0_"),
                 _("Scene variables"),
                 "res/actions/var24.png",
                 "res/actions/var.png")
      .AddParameter("scenevar", _("Variable"))
      .UseStandardOperatorParameters("number",
                                     ParameterOptions::MakeNewOptions());

  extension
      .AddAction("ModVarSceneTxt",
                 _("Change text"),
                 _("Modify the text of a scene variable."),
                 _("the text of scene variable _PARAM0_"),
                 _("Scene variables"),
                 "res/actions/var24.png",
                 "res/actions/var.png")
      .AddParameter("scenevar", _("Variable"))
      .UseStandardOperatorParameters("string",
                                     ParameterOptions::MakeNewOptions());

  extension
      .AddAction(
          "SetSceneVariableAsBoolean",
          _("Change boolean"),
          _("Modify the boolean value of a scene variable."),
          _("Set the boolean value of scene variable _PARAM0_ to _PARAM1_"),
          _("Scene variables"),
          "res/conditions/var24.png",
          "res/conditions/var.png")
      .AddParameter("scenevar", _("Variable"))
      .AddParameter("trueorfalse", _("New Value:"));

  extension
      .AddAction("ToggleSceneVariableAsBoolean",
                 _("Toggle boolean"),
                 _("Toggle the boolean value of a scene variable.") + "\n" +
                     _("If it was true, it will become false, and if it was "
                       "false it will become true."),
                 _("Toggle the boolean value of scene variable _PARAM0_"),
                 _("Scene variables"),
                 "res/conditions/var24.png",
                 "res/conditions/var.png")
      .AddParameter("scenevar", _("Variable"));

  extension
      .AddAction("ModVarGlobal",
                 _("Change number"),
                 _("Modify the number value of a global variable."),
                 _("the global variable _PARAM0_"),
                 _("Global variables"),
                 "res/actions/var24.png",
                 "res/actions/var.png")
      .AddParameter("globalvar", _("Variable"))
      .UseStandardOperatorParameters("number",
                                     ParameterOptions::MakeNewOptions())
      .MarkAsAdvanced();

  extension
      .AddAction("ModVarGlobalTxt",
                 _("Change text"),
                 _("Modify the text of a global variable."),
                 _("the text of global variable _PARAM0_"),
                 _("Global variables"),
                 "res/actions/var24.png",
                 "res/actions/var.png")
      .AddParameter("globalvar", _("Variable"))
      .UseStandardOperatorParameters("string",
                                     ParameterOptions::MakeNewOptions())
      .MarkAsAdvanced();

  extension
      .AddAction(
          "SetGlobalVariableAsBoolean",
          _("Change boolean"),
          _("Modify the boolean value of a global variable."),
          _("Set the boolean value of global variable _PARAM0_ to _PARAM1_"),
          _("Global variables"),
          "res/conditions/var24.png",
          "res/conditions/var.png")
      .AddParameter("globalvar", _("Variable"))
      .AddParameter("trueorfalse", _("New Value:"));

  extension
      .AddAction("ToggleGlobalVariableAsBoolean",
                 _("Toggle boolean"),
                 _("Toggle the boolean value of a global variable.") + "\n" +
                     _("If it was true, it will become false, and if it was "
                       "false it will become true."),
                 _("Toggle the boolean value of global variable _PARAM0_"),
                 _("Global variables"),
                 "res/conditions/var24.png",
                 "res/conditions/var.png")
      .AddParameter("globalvar", _("Variable"));

  extension
      .AddAction(
          "VariableRemoveChild",
          _("Remove a child"),
          _("Remove a child from a scene structure variable."),
          _("Remove child _PARAM1_ from scene structure variable _PARAM0_"),
          _("Scene variables/Collections/Structures"),
          "res/actions/var24.png",
          "res/actions/var.png")
      .AddParameter("scenevar", _("Variable"))
      .AddParameter("string", _("Child's name"))
      .MarkAsAdvanced();

  extension
      .AddAction(
          "GlobalVariableRemoveChild",
          _("Remove a child"),
          _("Remove a child from a global structure variable."),
          _("Remove child _PARAM1_ from global structure variable _PARAM0_"),
          _("Global variables/Collections/Structures"),
          "res/actions/var24.png",
          "res/actions/var.png")
      .AddParameter("globalvar", _("Variable"))
      .AddParameter("string", _("Child's name"))
      .MarkAsAdvanced();

  extension
      .AddAction("VariableClearChildren",
                 _("Clear"),
                 _("Remove all the children from the scene structure or array "
                   "variable."),
                 _("Clear children from scene variable _PARAM0_"),
                 _("Scene variables/Collections"),
                 "res/actions/var24.png",
                 "res/actions/var.png")
      .AddParameter("scenevar", _("Variable"))
      .MarkAsAdvanced();

  extension
      .AddAction("GlobalVariableClearChildren",
                 _("Clear"),
                 _("Remove all the children from the global structure or array "
                   "variable."),
                 _("Clear children from global variable _PARAM0_"),
                 _("Global variables/Collections"),
                 "res/actions/var24.png",
                 "res/actions/var.png")
      .AddParameter("globalvar", _("Variable"))
      .MarkAsAdvanced();

  extension
      .AddAction("SceneVariablePush",
                 _("Add existing variable"),
                 _("Adds an existing variable at the end of a scene array "
                   "variable."),
                 _("Add variable _PARAM1_ to array variable _PARAM0_"),
                 _("Scene variables/Collections/Arrays"),
                 "res/actions/var24.png",
                 "res/actions/var.png")
      .AddParameter("scenevar", _("Array variable"))
      .AddParameter("scenevar", _("Scene variable with the content to add"))
      .SetParameterLongDescription(
          _("The content of the variable will *be copied* and added at the "
            "end of the array."))
      .MarkAsAdvanced();

  extension
      .AddAction(
          "SceneVariablePushString",
          _("Add text"),
          _("Adds a text (string) at the end of a scene array variable."),
          _("Add text _PARAM1_ to array variable _PARAM0_"),
          _("Scene variables/Collections/Arrays"),
          "res/actions/var24.png",
          "res/actions/var.png")
      .AddParameter("scenevar", _("Array variable"))
      .AddParameter("string", _("Text to add"))
      .MarkAsAdvanced();

  extension
      .AddAction("SceneVariablePushNumber",
                 _("Add number"),
                 _("Adds a number at the end of a scene array variable."),
                 _("Add number _PARAM1_ to array variable _PARAM0_"),
                 _("Scene variables/Collections/Arrays"),
                 "res/actions/var24.png",
                 "res/actions/var.png")
      .AddParameter("scenevar", _("Array variable"))
      .AddParameter("expression", _("Number to add"))
      .MarkAsAdvanced();

  extension
      .AddAction("SceneVariablePushBool",
                 _("Add boolean"),
                 _("Adds a boolean at the end of a scene array variable."),
                 _("Add boolean _PARAM1_ to array variable _PARAM0_"),
                 _("Scene variables/Collections/Arrays"),
                 "res/actions/var24.png",
                 "res/actions/var.png")
      .AddParameter("scenevar", _("Array variable"))
      .AddParameter("trueorfalse", _("Boolean to add"))
      .MarkAsAdvanced();

  extension
      .AddAction("SceneVariableRemoveAt",
                 _("Remove variable by index"),
                 _("Removes a variable at the specified index of a scene array "
                   "variable."),
                 _("Remove variable at index _PARAM1_ from scene array "
                   "variable _PARAM0_"),
                 _("Scene variables/Collections/Arrays"),
                 "res/actions/var24.png",
                 "res/actions/var.png")
      .AddParameter("scenevar", _("Variable"))
      .AddParameter("expression", _("Index to remove"))
      .MarkAsAdvanced();

  extension
      .AddCondition("SceneVariableSize",
                    _("Size"),
                    _("Compare the size of a scene array variable."),
                    _("The size of the array variable _PARAM0_"),
                    _("Scene variables/Collections/Arrays"),
                    "res/conditions/var24.png",
                    "res/conditions/var.png")
      .AddParameter("scenevar", _("Variable"))
      .UseStandardRelationalOperatorParameters(
          "number", ParameterOptions::MakeNewOptions())
      .MarkAsAdvanced();

  extension
      .AddExpression(
          "SceneVariableFirst",
          _("First value"),
          _("Get the value of the first element of a scene array variable."),
          _("Scene variables/Collections/Arrays"),
          "res/actions/var.png")
      .AddParameter("scenevar", _("Variable"));

  extension
      .AddExpression(
          "SceneVariableLast",
          _("Last value"),
          _("Get the value of the last element of a scene array variable."),
          _("Scene variables/Collections/Arrays"),
          "res/actions/var.png")
      .AddParameter("scenevar", _("Variable"));

  extension
      .AddExpression("SceneVariableAt",
                     _("Value at index"),
                     _("Get the value of the element at a given index of a "
                       "scene array variable. Remember that an array starts "
                       "at index 0 and ends at index size-1."),
                     _("Scene variables/Collections/Arrays"),
                     "res/actions/var.png")
      .AddParameter("scenevar", _("Variable"))
      .AddParameter("expression", _("Index of the element"));

  extension
      .AddAction(
          "GlobalVariablePush",
          _("Add existing variable"),
          _("Adds an existing variable at the end of a global array variable."),
          _("Add variable _PARAM1_ to array variable _PARAM0_"),
          _("Global variables/Collections/Arrays"),
          "res/actions/var24.png",
          "res/actions/var.png")
      .AddParameter("globalvar", _("Array variable"))
      .AddParameter("scenevar", _("Scene variable with the content to add"))
      .SetParameterLongDescription(
          _("The content of the variable will *be copied* and added at the "
            "end of the array."))
      .MarkAsAdvanced();

  extension
      .AddAction("GlobalVariableRemoveAt",
                 _("Remove variable by index"),
                 _("Removes a variable at the specified index of a global "
                   "array variable."),
                 _("Remove variable at index _PARAM1_ from global array "
                   "variable _PARAM0_"),
                 _("Global variables/Collections/Arrays"),
                 "res/actions/var24.png",
                 "res/actions/var.png")
      .AddParameter("globalvar", _("Variable"))
      .AddParameter("expression", _("Index to remove"))
      .MarkAsAdvanced();

  extension
      .AddAction(
          "GlobalVariablePushString",
          _("Add text"),
          _("Adds a text (string) at the end of a global array variable."),
          _("Add text _PARAM1_ to array variable _PARAM0_"),
          _("Global variables/Collections/Arrays"),
          "res/actions/var24.png",
          "res/actions/var.png")
      .AddParameter("globalvar", _("Array variable"))
      .AddParameter("string", _("Text to add"))
      .MarkAsAdvanced();

  extension
      .AddAction("GlobalVariablePushNumber",
                 _("Add number"),
                 _("Adds a number at the end of a global array variable."),
                 _("Add number _PARAM1_ to array variable _PARAM0_"),
                 _("Global variables/Collections/Arrays"),
                 "res/actions/var24.png",
                 "res/actions/var.png")
      .AddParameter("globalvar", _("Array variable"))
      .AddParameter("expression", _("Number to add"))
      .MarkAsAdvanced();

  extension
      .AddAction("GlobalVariablePushBool",
                 _("Add boolean"),
                 _("Adds a boolean at the end of a global array variable."),
                 _("Add boolean _PARAM1_ to array variable _PARAM0_"),
                 _("Global variables/Collections/Arrays"),
                 "res/actions/var24.png",
                 "res/actions/var.png")
      .AddParameter("globalvar", _("Array variable"))
      .AddParameter("trueorfalse", _("Boolean to add"))
      .MarkAsAdvanced();

  extension
      .AddCondition("GlobalVariableSize",
                    _("Size"),
                    _("Compare the size of a global array variable."),
                    _("The size of the array variable _PARAM0_"),
                    _("Global variables/Collections/Arrays"),
                    "res/conditions/var24.png",
                    "res/conditions/var.png")
      .AddParameter("globalvar", _("Variable"))
      .UseStandardRelationalOperatorParameters(
          "number", ParameterOptions::MakeNewOptions())
      .MarkAsAdvanced();

  extension
      .AddExpression(
          "GlobalVariableFirst",
          _("First value"),
          _("Get the value of the first element of a global array variable."),
          _("Global variables/Collections/Arrays"),
          "res/actions/var.png")
      .AddParameter("globalvar", _("Variable"));

  extension
      .AddExpression(
          "GlobalVariableLast",
          _("Last value"),
          _("Get the value of the last element of a global array variable."),
          _("Global variables/Collections/Arrays"),
          "res/actions/var.png")
      .AddParameter("globalvar", _("Variable"));

  extension
      .AddExpression("GlobalVariableAt",
                     _("Value at index"),
                     _("Get the value of the element at a given index of a "
                       "global array variable. Remember that an array starts "
                       "at index 0 and ends at index size-1."),
                     _("Global variables/Collections/Arrays"),
                     "res/actions/var.png")
      .AddParameter("globalvar", _("Variable"))
      .AddParameter("expression", _("Index of the element"));

  extension
      .AddExpression("GlobalVariableChildCount",
                     _("Size"),
                     _("Size of a global array or structure variable"),
                     _("Global variables/Collections"),
                     "res/actions/var.png")
      .AddParameter("globalvar", _("Variable"));

  extension
      .AddExpression("VariableChildCount",
                     _("Size"),
                     _("Size of a scene array or structure variable"),
                     _("Scene variables/Collections"),
                     "res/actions/var.png")
      .AddParameter("scenevar", _("Variable"));

  extension
      .AddExpression("Variable",
                     _("Number"),
                     _("Number value of a scene variable"),
                     _("Scene variables"),
                     "res/actions/var.png")
      .AddParameter("scenevar", _("Variable"));

  extension
      .AddStrExpression("VariableString",
                        _("Text"),
                        _("Text of a scene variable"),
                        _("Scene variables"),
                        "res/actions/var.png")
      .AddParameter("scenevar", _("Variable"));

  extension
      .AddExpression("GlobalVariable",
                     _("Number"),
                     _("Number value of a global variable"),
                     _("Global variables"),
                     "res/actions/var.png")
      .AddParameter("globalvar", _("Name of the global variable"));

  extension
      .AddStrExpression("GlobalVariableString",
                        _("Text"),
                        _("Text of a global variable"),
                        _("Global variables"),
                        "res/actions/var.png")
      .AddParameter("globalvar", _("Variable"));
}

}  // namespace gd
