/*
 * GDevelop Core
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#include "AllBuiltinExtensions.h"
#include "GDCore/Tools/Localization.h"

using namespace std;
namespace gd
{

void GD_CORE_API BuiltinExtensionsImplementer::ImplementsVariablesExtension(gd::PlatformExtension & extension)
{
    extension.SetExtensionInformation("BuiltinVariables",
                          GD_T("Variable features"),
                          GD_T("Built-in extension allowing to manipulate variables"),
                          "Florian Rival",
                          "Open source (MIT License)");

    #if defined(GD_IDE_ONLY)
    extension.AddCondition("VarScene",
               GD_T("Value of a variable"),
               GD_T("Compare the value of a scene variable."),
               GD_T("Variable _PARAM0_ is _PARAM1__PARAM2_"),
               GD_T("Variables"),
               "res/conditions/var24.png",
               "res/conditions/var.png")
        .AddParameter("scenevar", GD_T("Variable"))
        .AddParameter("relationalOperator", GD_T("Sign of the test"))
        .AddParameter("expression", GD_T("Value to compare"))
        .SetManipulatedType("number");

    extension.AddCondition("VarSceneTxt",
             GD_T("Text of a variable"),
             GD_T("Compare the text of a scene variable."),
             GD_T("The text of variable _PARAM0_ is _PARAM1__PARAM2_"),
             GD_T("Variables"),
             "res/conditions/var24.png",
             "res/conditions/var.png")
        .AddParameter("scenevar", GD_T("Variable"))
        .AddParameter("relationalOperator", GD_T("Sign of the test"))
        .AddParameter("string", GD_T("Text to compare"))
        .SetManipulatedType("string");

    extension.AddCondition("VariableChildExists",
             GD_T("Child existence"),
             GD_T("Return true if the specified child of the variable exists."),
             GD_T("Child _PARAM1_ of variable _PARAM0_ exists"),
             GD_T("Variables/Structures"),
             "res/conditions/var24.png",
             "res/conditions/var.png")
        .AddParameter("scenevar", GD_T("Variable"))
        .AddParameter("string", GD_T("Name of the child"))
        .MarkAsAdvanced();

    extension.AddCondition("GlobalVariableChildExists",
             GD_T("Child existence"),
             GD_T("Return true if the specified child of the global variable exists."),
             GD_T("Child _PARAM1_ of global variable _PARAM0_ exists"),
             GD_T("Variables/Global variables/Structures"),
             "res/conditions/var24.png",
             "res/conditions/var.png")
        .AddParameter("globalvar", GD_T("Variable"))
        .AddParameter("string", GD_T("Name of the child"))
        .MarkAsAdvanced();

    extension.AddCondition("VarSceneDef",
                   GD_T("Test if a scene variable is defined"),
                   GD_T("Test if the scene variable exist."),
                   GD_T("Variable _PARAM0_ is defined"),
                   GD_T("Variables"),
                   "res/conditions/var24.png",
                   "res/conditions/var.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("string", GD_T("Variable"))
        .SetHidden();

    extension.AddCondition("VarGlobal",
               GD_T("Value of a global variable"),
               GD_T("Compare the value of a global variable."),
               GD_T("Global variable _PARAM0_ is _PARAM1__PARAM2_"),
               GD_T("Variables/Global variables"),
               "res/conditions/var24.png",
               "res/conditions/var.png")
        .AddParameter("globalvar", GD_T("Variable"))
        .AddParameter("relationalOperator", GD_T("Sign of the test"))
        .AddParameter("expression", GD_T("Value to compare"))
        .MarkAsAdvanced()
        .SetManipulatedType("number");

    extension.AddCondition("VarGlobalTxt",
               GD_T("Text of a global variable"),
               GD_T("Compare the text of a global variable."),
               GD_T("The text of the global variable _PARAM0_ is _PARAM1__PARAM2_"),
               GD_T("Variables/Global variables"),
               "res/conditions/var24.png",
               "res/conditions/var.png")
        .AddParameter("globalvar", GD_T("Variable"))
        .AddParameter("relationalOperator", GD_T("Sign of the test"))
        .AddParameter("string", GD_T("Text to compare"))
        .MarkAsAdvanced()
        .SetManipulatedType("string");

    extension.AddCondition("VarGlobalDef",
                   GD_T("Test if a global variable is defined"),
                   GD_T("Test if a global variable exists"),
                   GD_T("Global variable _PARAM0_ is defined"),
                   GD_T("Variables/Global variables"),
                   "res/conditions/var24.png",
                   "res/conditions/var.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("string", GD_T("Variable"))
        .MarkAsAdvanced()
        .SetHidden();

    extension.AddAction("ModVarScene",
               GD_T("Value of a variable"),
               GD_T("Modify the value of a scene variable."),
               GD_T("Do _PARAM1__PARAM2_ to variable _PARAM0_"),
               GD_T("Variables"),
               "res/actions/var24.png",
               "res/actions/var.png")
        .AddParameter("scenevar", GD_T("Variable"))
        .AddParameter("operator", GD_T("Modification's sign"))
        .AddParameter("expression", GD_T("Value"))
        .SetManipulatedType("number");

    extension.AddAction("ModVarSceneTxt",
               GD_T("String of a variable"),
               GD_T("Modify the text of a scene variable."),
               GD_T("Do _PARAM1__PARAM2_ to the text of variable _PARAM0_"),
               GD_T("Variables"),
               "res/actions/var24.png",
               "res/actions/var.png")
        .AddParameter("scenevar", GD_T("Variable"))
        .AddParameter("operator", GD_T("Modification's sign"))
        .AddParameter("string", GD_T("Text"))
        .SetManipulatedType("string");

    extension.AddAction("ModVarGlobal",
               GD_T("Value of a global variable"),
               GD_T("Modify the value of a global variable"),
               GD_T("Do _PARAM1__PARAM2_ to global variable _PARAM0_"),
               GD_T("Variables/Global variables"),
               "res/actions/var24.png",
               "res/actions/var.png")
        .AddParameter("globalvar", GD_T("Variable"))
        .AddParameter("operator", GD_T("Modification's sign"))
        .AddParameter("expression", GD_T("Value"))
        .MarkAsAdvanced()
        .SetManipulatedType("number");

    extension.AddAction("ModVarGlobalTxt",
               GD_T("String of a global variable"),
               GD_T("Modify the text of a global variable."),
               GD_T("Do _PARAM1__PARAM2_ to the text of global variable _PARAM0_"),
               GD_T("Variables/Global variables"),
               "res/actions/var24.png",
               "res/actions/var.png")
        .AddParameter("globalvar", GD_T("Variable"))
        .AddParameter("operator", GD_T("Modification's sign"))
        .AddParameter("string", GD_T("Text"))
        .MarkAsAdvanced()
        .SetManipulatedType("string");

    extension.AddAction("VariableRemoveChild",
               GD_T("Remove a child"),
               GD_T("Remove a child from a variable."),
               GD_T("Remove child _PARAM1_ from variable _PARAM0_"),
               GD_T("Variables/Structure"),
               "res/actions/var24.png",
               "res/actions/var.png")
        .AddParameter("scenevar", GD_T("Variable"))
        .AddParameter("string", GD_T("Child's name"))
        .MarkAsAdvanced();

    extension.AddAction("GlobalVariableRemoveChild",
               GD_T("Remove a child"),
               GD_T("Remove a child from a global variable."),
               GD_T("Remove child _PARAM1_ from global variable _PARAM0_"),
               GD_T("Variables/Global variables/Structure"),
               "res/actions/var24.png",
               "res/actions/var.png")
        .AddParameter("globalvar", GD_T("Variable"))
        .AddParameter("string", GD_T("Child's name"))
        .MarkAsAdvanced();

    extension.AddExpression("Variable", GD_T("Scene variables"), GD_T("Scene variables"), GD_T("Variables"), "res/actions/var.png")
        .AddParameter("scenevar", GD_T("Variable"));

    extension.AddStrExpression("VariableString", GD_T("Scene variables"), GD_T("Text of a scene variable"), GD_T("Variables"), "res/actions/var.png")
        .AddParameter("scenevar", GD_T("Variable"));

    extension.AddExpression("GlobalVariable", GD_T("Global variables"), GD_T("Global variable"), GD_T("Variables"), "res/actions/var.png")
        .AddParameter("globalvar", GD_T("Name of the global variable"));

    extension.AddStrExpression("GlobalVariableString", GD_T("Global variables"), GD_T("Text of a global variable"), GD_T("Variables"), "res/actions/var.png")
        .AddParameter("globalvar", GD_T("Variable"));
    #endif
}

}
