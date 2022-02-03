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
                    _("Value of a scene variable"),
                    _("Compare the value of a scene variable."),
                    _("the scene variable _PARAM0_"),
                    _("Scene variables"),
                    "res/conditions/var24.png",
                    "res/conditions/var.png")
      .AddParameter("scenevar", _("Variable"))
      .UseStandardRelationalOperatorParameters("number");

  extension
      .AddCondition("VarSceneTxt",
                    _("Text of a scene variable"),
                    _("Compare the text of a scene variable."),
                    _("the text of scene variable _PARAM0_"),
                    _("Scene variables"),
                    "res/conditions/var24.png",
                    "res/conditions/var.png")
      .AddParameter("scenevar", _("Variable"))
      .UseStandardRelationalOperatorParameters("string");

  extension
      .AddCondition(
          "SceneVariableAsBoolean",
          _("Boolean value of a scene variable"),
          _("Compare the boolean value of a scene variable."),
          _("The boolean value of scene variable _PARAM0_ is _PARAM1_"),
          _("Scene variables"),
          "res/conditions/var24.png",
          "res/conditions/var.png")
      .AddParameter("scenevar", _("Variable"))
      .AddParameter("trueorfalse", _("Check if the value is"))
      .SetDefaultValue("true");

  extension
      .AddCondition(
          "VariableChildExists",
          _("Child existence"),
          _("Check if the specified child of the scene variable exists."),
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
                    _("Check if the specified child of the global "
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
                    "Test if a scene variable is defined",
                    "Test if the scene variable exists.",
                    "Scene variable _PARAM0_ is defined",
                    _("Scene variables"),
                    "res/conditions/var24.png",
                    "res/conditions/var.png")
      .AddCodeOnlyParameter("currentScene", "")
      .AddParameter("string", _("Variable"))
      .SetHidden();

  extension
      .AddCondition("VarGlobal",
                    _("Value of a global variable"),
                    _("Compare the value of a global variable."),
                    _("the global variable _PARAM0_"),
                    _("Global variables"),
                    "res/conditions/var24.png",
                    "res/conditions/var.png")
      .AddParameter("globalvar", _("Variable"))
      .UseStandardRelationalOperatorParameters("number")
      .MarkAsAdvanced();

  extension
      .AddCondition("VarGlobalTxt",
                    _("Text of a global variable"),
                    _("Compare the text of a global variable."),
                    _("the text of the global variable _PARAM0_"),
                    _("Global variables"),
                    "res/conditions/var24.png",
                    "res/conditions/var.png")
      .AddParameter("globalvar", _("Variable"))
      .UseStandardRelationalOperatorParameters("string")
      .MarkAsAdvanced();

  extension
      .AddCondition(
          "GlobalVariableAsBoolean",
          _("Boolean value of a global variable"),
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
                    "Test if a global variable is defined",
                    "Test if a global variable exists",
                    "Global variable _PARAM0_ is defined",
                    _("Global variables"),
                    "res/conditions/var24.png",
                    "res/conditions/var.png")
      .AddCodeOnlyParameter("currentScene", "")
      .AddParameter("string", _("Variable"))
      .MarkAsAdvanced()
      .SetHidden();

  extension
      .AddAction("ModVarScene",
                 _("Value of a scene variable"),
                 _("Change the value of a scene variable."),
                 _("the scene variable _PARAM0_"),
                 _("Scene variables"),
                 "res/actions/var24.png",
                 "res/actions/var.png")
      .AddParameter("scenevar", _("Variable"))
      .UseStandardOperatorParameters("number");

  extension
      .AddAction("ModVarSceneTxt",
                 _("String of a scene variable"),
                 _("Modify the text of a scene variable."),
                 _("the text of scene variable _PARAM0_"),
                 _("Scene variables"),
                 "res/actions/var24.png",
                 "res/actions/var.png")
      .AddParameter("scenevar", _("Variable"))
      .UseStandardOperatorParameters("string");

  extension
      .AddAction(
          "SetSceneVariableAsBoolean",
          _("Boolean value of a scene variable"),
          _("Modify the boolean value of a scene variable."),
          _("Set the boolean value of scene variable _PARAM0_ to _PARAM1_"),
          _("Scene variables"),
          "res/conditions/var24.png",
          "res/conditions/var.png")
      .AddParameter("scenevar", _("Variable"))
      .AddParameter("trueorfalse", _("New Value:"));

  extension
      .AddAction("ToggleSceneVariableAsBoolean",
                 _("Toggle boolean value of a scene variable"),
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
                 _("Value of a global variable"),
                 _("Change the value of a global variable"),
                 _("the global variable _PARAM0_"),
                 _("Global variables"),
                 "res/actions/var24.png",
                 "res/actions/var.png")
      .AddParameter("globalvar", _("Variable"))
      .UseStandardOperatorParameters("number")
      .MarkAsAdvanced();

  extension
      .AddAction("ModVarGlobalTxt",
                 _("String of a global variable"),
                 _("Modify the text of a global variable."),
                 _("the text of global variable _PARAM0_"),
                 _("Global variables"),
                 "res/actions/var24.png",
                 "res/actions/var.png")
      .AddParameter("globalvar", _("Variable"))
      .UseStandardOperatorParameters("string")
      .MarkAsAdvanced();

  extension
      .AddAction(
          "SetGlobalVariableAsBoolean",
          _("Boolean value of a global variable"),
          _("Modify the boolean value of a global variable."),
          _("Set the boolean value of global variable _PARAM0_ to _PARAM1_"),
          _("Global variables"),
          "res/conditions/var24.png",
          "res/conditions/var.png")
      .AddParameter("globalvar", _("Variable"))
      .AddParameter("trueorfalse", _("New Value:"));

  extension
      .AddAction("ToggleGlobalVariableAsBoolean",
                 _("Toggle boolean value of a global variable"),
                 _("Toggle the boolean value of a global variable.") + "\n" +
                     _("If it was true, it will become false, and if it was "
                       "false it will become true."),
                 _("Toggle the boolean value of global variable _PARAM0_"),
                 _("Global variables"),
                 "res/conditions/var24.png",
                 "res/conditions/var.png")
      .AddParameter("globalvar", _("Variable"));

  extension
      .AddAction("VariableRemoveChild",
                 _("Remove a child"),
                 _("Remove a child from a scene variable."),
                 _("Remove child _PARAM1_ from scene variable _PARAM0_"),
                 _("Scene variables/Collections/Structures"),
                 "res/actions/var24.png",
                 "res/actions/var.png")
      .AddParameter("scenevar", _("Variable"))
      .AddParameter("string", _("Child's name"))
      .MarkAsAdvanced();

  extension
      .AddAction("GlobalVariableRemoveChild",
                 _("Remove a child"),
                 _("Remove a child from a global variable."),
                 _("Remove child _PARAM1_ from global variable _PARAM0_"),
                 _("Global variables/Collections/Structures"),
                 "res/actions/var24.png",
                 "res/actions/var.png")
      .AddParameter("globalvar", _("Variable"))
      .AddParameter("string", _("Child's name"))
      .MarkAsAdvanced();

  extension
      .AddAction("VariableClearChildren",
                 _("Clear scene variable"),
                 _("Remove all the children from the scene variable."),
                 _("Clear children from scene variable _PARAM0_"),
                 _("Scene variables/Collections"),
                 "res/actions/var24.png",
                 "res/actions/var.png")
      .AddParameter("scenevar", _("Variable"))
      .MarkAsAdvanced();

  extension
      .AddAction("GlobalVariableClearChildren",
                 _("Clear global variable"),
                 _("Remove all the children from the global variable."),
                 _("Clear children from global variable _PARAM0_"),
                 _("Global variables/Collections"),
                 "res/actions/var24.png",
                 "res/actions/var.png")
      .AddParameter("globalvar", _("Variable"))
      .MarkAsAdvanced();

  extension
      .AddAction("SceneVariablePush",
                 _("Append variable to a scene array"),
                 _("Appends a variable at the end of a scene array variable."),
                 _("Append variable _PARAM1_ to array variable _PARAM0_"),
                 _("Scene variables/Collections/Arrays"),
                 "res/actions/var24.png",
                 "res/actions/var.png")
      .AddParameter("scenevar", _("Array variable"))
      .AddParameter("scenevar", _("Scene variable with the content to append"))
      .SetParameterLongDescription(_("The content of the variable will *be copied* and appended at the end of the array."))
      .MarkAsAdvanced();

  extension
      .AddAction("SceneVariablePushString",
                 _("Append a string to a scene array"),
                 _("Appends a string at the end of a scene array variable."),
                 _("Append string _PARAM1_ to array variable _PARAM0_"),
                 _("Scene variables/Collections/Arrays"),
                 "res/actions/var24.png",
                 "res/actions/var.png")
      .AddParameter("scenevar", _("Array variable"))
      .AddParameter("string", _("String to append"))
      .MarkAsAdvanced();

  extension
      .AddAction("SceneVariablePushNumber",
                 _("Append a number to a scene array"),
                 _("Appends a number at the end of a scene array variable."),
                 _("Append number _PARAM1_ to array variable _PARAM0_"),
                 _("Scene variables/Collections/Arrays"),
                 "res/actions/var24.png",
                 "res/actions/var.png")
      .AddParameter("scenevar", _("Array variable"))
      .AddParameter("expression", _("Number to append"))
      .MarkAsAdvanced();

  extension
      .AddAction("SceneVariablePushBool",
                 _("Append a boolean to a scene array"),
                 _("Appends a boolean at the end of a scene array variable."),
                 _("Append boolean _PARAM1_ to array variable _PARAM0_"),
                 _("Scene variables/Collections/Arrays"),
                 "res/actions/var24.png",
                 "res/actions/var.png")
      .AddParameter("scenevar", _("Array variable"))
      .AddParameter("trueorfalse", _("Boolean to append"))
      .MarkAsAdvanced();

  extension
      .AddAction(
          "SceneVariableRemoveAt",
          _("Remove variable from a scene array (by index)"),
          _("Removes a variable at the specified index of a scene array variable."),
          _("Remove variable at index _PARAM1_ from scene array variable _PARAM0_"),
          _("Scene variables/Collections/Arrays"),
          "res/actions/var24.png",
          "res/actions/var.png")
      .AddParameter("scenevar", _("Variable"))
      .AddParameter("expression", _("Index to remove"))
      .MarkAsAdvanced();

  extension
      .AddAction("GlobalVariablePush",
                 _("Append variable to a global array"),
                 _("Appends a variable at the end of a global array variable."),
                 _("Append variable _PARAM1_ to array variable _PARAM0_"),
                 _("Global variables/Collections/Arrays"),
                 "res/actions/var24.png",
                 "res/actions/var.png")
      .AddParameter("globalvar", _("Array variable"))
      .AddParameter("scenevar", _("Scene variable with the content to append"))
      .SetParameterLongDescription(_("The content of the variable will *be copied* and appended at the end of the array."))
      .MarkAsAdvanced();

  extension
      .AddAction(
          "GlobalVariableRemoveAt",
          _("Remove variable from a global array (by index)"),
          _("Removes a variable at the specified index of a global array variable."),
          _("Remove variable at index _PARAM1_ from global array variable _PARAM0_"),
          _("Global variables/Collections/Arrays"),
          "res/actions/var24.png",
          "res/actions/var.png")
      .AddParameter("globalvar", _("Variable"))
      .AddParameter("expression", _("Index to remove"))
      .MarkAsAdvanced();

  extension
      .AddAction("GlobalVariablePushString",
                 _("Append a string to a global array"),
                 _("Appends a string at the end of a global array variable."),
                 _("Append string _PARAM1_ to array variable _PARAM0_"),
                 _("Global variables/Collections/Arrays"),
                 "res/actions/var24.png",
                 "res/actions/var.png")
      .AddParameter("globalvar", _("Array variable"))
      .AddParameter("string", _("String to append"))
      .MarkAsAdvanced();

  extension
      .AddAction("GlobalVariablePushNumber",
                 _("Append a number to a global array"),
                 _("Appends a number at the end of a global array variable."),
                 _("Append number _PARAM1_ to array variable _PARAM0_"),
                 _("Global variables/Collections/Arrays"),
                 "res/actions/var24.png",
                 "res/actions/var.png")
      .AddParameter("globalvar", _("Array variable"))
      .AddParameter("expression", _("Number to append"))
      .MarkAsAdvanced();

  extension
      .AddAction("GlobalVariablePushBool",
                 _("Append a boolean to a global array"),
                 _("Appends a boolean at the end of a global array variable."),
                 _("Append boolean _PARAM1_ to array variable _PARAM0_"),
                 _("Global variables/Collections/Arrays"),
                 "res/actions/var24.png",
                 "res/actions/var.png")
      .AddParameter("globalvar", _("Array variable"))
      .AddParameter("trueorfalse", _("Boolean to append"))
      .MarkAsAdvanced();

  extension
      .AddExpression("GlobalVariableChildCount",
                     _("Number of children of a global variable"),
                     _("Number of children of a global variable"),
                     _("Global variables"),
                     "res/actions/var.png")
      .AddParameter("globalvar", _("Variable"));

  extension
      .AddExpression("VariableChildCount",
                     _("Number of children of a scene variable"),
                     _("Number of children of a scene variable"),
                     _("Scene variables"),
                     "res/actions/var.png")
      .AddParameter("scenevar", _("Variable"));

  extension
      .AddExpression("Variable",
                     _("Value of a scene variable"),
                     _("Value of a scene variable"),
                     _("Scene variables"),
                     "res/actions/var.png")
      .AddParameter("scenevar", _("Variable"));

  extension
      .AddStrExpression("VariableString",
                        _("Text of a scene variable"),
                        _("Text of a scene variable"),
                        _("Scene variables"),
                        "res/actions/var.png")
      .AddParameter("scenevar", _("Variable"));

  extension
      .AddExpression("GlobalVariable",
                     _("Value of a global variable"),
                     _("Value of a global variable"),
                     _("Global variables"),
                     "res/actions/var.png")
      .AddParameter("globalvar", _("Name of the global variable"));

  extension
      .AddStrExpression("GlobalVariableString",
                        _("Text of a global variable"),
                        _("Text of a global variable"),
                        _("Global variables"),
                        "res/actions/var.png")
      .AddParameter("globalvar", _("Variable"));
}

}  // namespace gd
