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
          _("Variable features"),
          _("Built-in extension allowing to manipulate variables"),
          "Florian Rival",
          "Open source (MIT License)")
      .SetExtensionHelpPath("/all-features/variables");

#if defined(GD_IDE_ONLY)
  extension
      .AddCondition("VarScene",
                    _("Value of a scene variable"),
                    _("Compare the value of a scene variable."),
                    _("the scene variable _PARAM0_"),
                    _("Variables"),
                    "res/conditions/var24.png",
                    "res/conditions/var.png")
      .AddParameter("scenevar", _("Variable"))
      .UseStandardRelationalOperatorParameters("number");

  extension
      .AddCondition("VarSceneTxt",
                    _("Text of a scene variable"),
                    _("Compare the text of a scene variable."),
                    _("the text of scene variable _PARAM0_"),
                    _("Variables"),
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
          _("Variables"),
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
          _("Variables/Collections/Structures"),
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
                    _("Variables/Global Variables/Collections/Structures"),
                    "res/conditions/var24.png",
                    "res/conditions/var.png")
      .AddParameter("globalvar", _("Variable"))
      .AddParameter("string", _("Name of the child"))
      .MarkAsAdvanced();

  extension
      .AddCondition("VarSceneDef",
                    _("Test if a scene variable is defined"),
                    _("Test if the scene variable exists."),
                    _("Scene variable _PARAM0_ is defined"),
                    _("Variables"),
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
                    _("Variables/Global variables"),
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
                    _("Variables/Global variables"),
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
          _("Variables/Global variables"),
          "res/conditions/var24.png",
          "res/conditions/var.png")
      .AddParameter("globalvar", _("Variable"))
      .AddParameter("trueorfalse", _("Check if the value is"))
      .SetDefaultValue("true");

  extension
      .AddCondition("VarGlobalDef",
                    _("Test if a global variable is defined"),
                    _("Test if a global variable exists"),
                    _("Global variable _PARAM0_ is defined"),
                    _("Variables/Global variables"),
                    "res/conditions/var24.png",
                    "res/conditions/var.png")
      .AddCodeOnlyParameter("currentScene", "")
      .AddParameter("string", _("Variable"))
      .MarkAsAdvanced()
      .SetHidden();

  extension
      .AddAction("ModVarScene",
                 _("Value of a scene variable"),
                 _("Modify the value of a scene variable."),
                 _("the scene variable _PARAM0_"),
                 _("Variables"),
                 "res/actions/var24.png",
                 "res/actions/var.png")
      .AddParameter("scenevar", _("Variable"))
      .UseStandardOperatorParameters("number");

  extension
      .AddAction("ModVarSceneTxt",
                 _("String of a scene variable"),
                 _("Modify the text of a scene variable."),
                 _("the text of scene variable _PARAM0_"),
                 _("Variables"),
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
          _("Variables"),
          "res/conditions/var24.png",
          "res/conditions/var.png")
      .AddParameter("scenevar", _("Variable"))
      .AddParameter("trueorfalse", _("New Value:"));

  extension
      .AddAction("ToggleSceneVariableAsBoolean",
                 _("Toggle boolean value of a scene variable"),
                 _("Toggle the boolean value of a scene variable.\n"
                   "If it was true, it will become false, and if it was false "
                   "it will become true."),
                 _("Toggle the boolean value of scene variable _PARAM0_"),
                 _("Variables"),
                 "res/conditions/var24.png",
                 "res/conditions/var.png")
      .AddParameter("scenevar", _("Variable"));

  extension
      .AddAction("ModVarGlobal",
                 _("Value of a global variable"),
                 _("Modify the value of a global variable"),
                 _("the global variable _PARAM0_"),
                 _("Variables/Global variables"),
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
                 _("Variables/Global variables"),
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
          _("Variables/Global variables"),
          "res/conditions/var24.png",
          "res/conditions/var.png")
      .AddParameter("globalvar", _("Variable"))
      .AddParameter("trueorfalse", _("New Value:"));

  extension
      .AddAction("ToggleGlobalVariableAsBoolean",
                 _("Toggle boolean value of a global variable"),
                 _("Toggle the boolean value of a global variable.\n"
                   "If it was true, it will become false, and if it was false "
                   "it will become true."),
                 _("Toggle the boolean value of global variable _PARAM0_"),
                 _("Variables/Global variables"),
                 "res/conditions/var24.png",
                 "res/conditions/var.png")
      .AddParameter("globalvar", _("Variable"));

  extension
      .AddAction("VariableRemoveChild",
                 _("Remove a child"),
                 _("Remove a child from a scene variable."),
                 _("Remove child _PARAM1_ from scene variable _PARAM0_"),
                 _("Variables/Collections/Structures"),
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
                 _("Variables/Global variables/Collections/Structures"),
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
                 _("Variables/Collections"),
                 "res/actions/var24.png",
                 "res/actions/var.png")
      .AddParameter("scenevar", _("Variable"))
      .MarkAsAdvanced();

  extension
      .AddAction("GlobalVariableClearChildren",
                 _("Clear global variable"),
                 _("Remove all the children from the global variable."),
                 _("Clear children from global variable _PARAM0_"),
                 _("Variables/Global variables/Collections"),
                 "res/actions/var24.png",
                 "res/actions/var.png")
      .AddParameter("globalvar", _("Variable"))
      .MarkAsAdvanced();

  extension
      .AddAction("SceneVariablePush",
                 _("Push variable on a scene array"),
                 _("Appends a variable at the end of a scene array variable."),
                 _("Append variable _PARAM0_ to array variable _PARAM1_"),
                 _("Variables/Collections/Arrays"),
                 "res/actions/var24.png",
                 "res/actions/var.png")
      .AddParameter("scenevar", _("Array variable"))
      .AddParameter("scenevar", _("Variable to push"))
      .MarkAsAdvanced();

  extension
      .AddAction("SceneVariablePushString",
                 _("Push a string on a scene array"),
                 _("Appends a string at the end of a scene array variable."),
                 _("Append string _PARAM1_ to array variable _PARAM0_"),
                 _("Variables/Collections/Arrays"),
                 "res/actions/var24.png",
                 "res/actions/var.png")
      .AddParameter("scenevar", _("Array variable"))
      .AddParameter("string", _("String to push"))
      .MarkAsAdvanced();

  extension
      .AddAction("SceneVariablePushNumber",
                 _("Push a number on a scene array"),
                 _("Appends a number at the end of a scene array variable."),
                 _("Append number _PARAM1_ to array variable _PARAM0_"),
                 _("Variables/Collections/Arrays"),
                 "res/actions/var24.png",
                 "res/actions/var.png")
      .AddParameter("scenevar", _("Array variable"))
      .AddParameter("expression", _("Number to push"))
      .MarkAsAdvanced();

  extension
      .AddAction("SceneVariablePushBool",
                 _("Push a boolean on a scene array"),
                 _("Appends a boolean at the end of a scene array variable."),
                 _("Append boolean _PARAM1_ to array variable _PARAM0_"),
                 _("Variables/Collections/Arrays"),
                 "res/actions/var24.png",
                 "res/actions/var.png")
      .AddParameter("scenevar", _("Array variable"))
      .AddParameter("trueorfalse", _("Boolean to push"))
      .MarkAsAdvanced();

  extension
      .AddAction(
          "SceneVariableRemoveAt",
          _("Remove index of scene array"),
          _("Removes a variable at an index of a scene array variable."),
          _("Remove variable at index _PARAM1_ from array variable _PARAM0_"),
          _("Variables/Collections/Arrays"),
          "res/actions/var24.png",
          "res/actions/var.png")
      .AddParameter("scenevar", _("Variable"))
      .AddParameter("expression", _("Index to remove"))
      .MarkAsAdvanced();

  extension
      .AddAction("GlobalVariablePush",
                 _("Push variable on a global array"),
                 _("Appends a variable at the end of a global array variable."),
                 _("Append variable _PARAM1_ to array variable _PARAM0_"),
                 _("Variables/Global variables/Collections/Arrays"),
                 "res/actions/var24.png",
                 "res/actions/var.png")
      .AddParameter("globalvar", _("Array variable"))
      .AddParameter("scenevar", _("Variable to push"))
      .MarkAsAdvanced();

  extension
      .AddAction(
          "GlobalVariableRemoveAt",
          _("Remove index of global array"),
          _("Removes a variable at an index of a global array variable."),
          _("Remove variable at index _PARAM1_ from array variable _PARAM0_"),
          _("Variables/Global variables/Collections/Arrays"),
          "res/actions/var24.png",
          "res/actions/var.png")
      .AddParameter("globalvar", _("Variable"))
      .AddParameter("expression", _("Index to remove"))
      .MarkAsAdvanced();

  extension
      .AddAction("GlobalVariablePushString",
                 _("Push a string on a global array"),
                 _("Appends a string at the end of a global array variable."),
                 _("Append string _PARAM1_ to array variable _PARAM0_"),
                 _("Variables/Global variables/Collections/Arrays"),
                 "res/actions/var24.png",
                 "res/actions/var.png")
      .AddParameter("globalvar", _("Array variable"))
      .AddParameter("string", _("String to push"))
      .MarkAsAdvanced();

  extension
      .AddAction("GlobalVariablePushNumber",
                 _("Push a number on a global array"),
                 _("Appends a number at the end of a global array variable."),
                 _("Append number _PARAM1_ to array variable _PARAM0_"),
                 _("Variables/Global variables/Collections/Arrays"),
                 "res/actions/var24.png",
                 "res/actions/var.png")
      .AddParameter("globalvar", _("Array variable"))
      .AddParameter("expression", _("Number to push"))
      .MarkAsAdvanced();

  extension
      .AddAction("GlobalVariablePushBool",
                 _("Push a boolean on a global array"),
                 _("Appends a boolean at the end of a global array variable."),
                 _("Append boolean _PARAM1_ to array variable _PARAM0_"),
                 _("Variables/Global variables/Collections/Arrays"),
                 "res/actions/var24.png",
                 "res/actions/var.png")
      .AddParameter("globalvar", _("Array variable"))
      .AddParameter("trueorfalse", _("Boolean to push"))
      .MarkAsAdvanced();

  extension
      .AddExpression("GlobalVariableChildCount",
                     _("Number of children of a global variable"),
                     _("Get the number of children of a global variable"),
                     _("Variables"),
                     "res/actions/var.png")
      .AddParameter("globalvar", _("Variable"));

  extension
      .AddExpression("VariableChildCount",
                     _("Number of children of a scene variable"),
                     _("Get the number of children of a scene variable"),
                     _("Variables"),
                     "res/actions/var.png")
      .AddParameter("scenevar", _("Variable"));

  extension
      .AddExpression("Variable",
                     _("Value of a scene variable"),
                     _("Value of a scene variable"),
                     _("Variables"),
                     "res/actions/var.png")
      .AddParameter("scenevar", _("Variable"));

  extension
      .AddStrExpression("VariableString",
                        _("Text of a scene variable"),
                        _("Text of a scene variable"),
                        _("Variables"),
                        "res/actions/var.png")
      .AddParameter("scenevar", _("Variable"));

  extension
      .AddExpression("GlobalVariable",
                     _("Value of a global variable"),
                     _("Value of a global variable"),
                     _("Variables"),
                     "res/actions/var.png")
      .AddParameter("globalvar", _("Name of the global variable"));

  extension
      .AddStrExpression("GlobalVariableString",
                        _("Text of a global variable"),
                        _("Text of a global variable"),
                        _("Variables"),
                        "res/actions/var.png")
      .AddParameter("globalvar", _("Variable"));
#endif
}

}  // namespace gd
