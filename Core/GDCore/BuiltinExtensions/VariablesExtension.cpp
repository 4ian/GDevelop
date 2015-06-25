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
               _("Value of a variable"),
               _("Compare the value of a scene variable."),
               GD_T("Variable _PARAM0_ is _PARAM1__PARAM2_"),
               _("Variables"),
               "res/conditions/var24.png",
               "res/conditions/var.png")
        .AddParameter("scenevar", GD_T("Variable"))
        .AddParameter("relationalOperator", GD_T("Sign of the test"))
        .AddParameter("expression", GD_T("Value to compare"))
        .SetManipulatedType("number");

    extension.AddCondition("VarSceneTxt",
             _("Text of a variable"),
             _("Compare the text of a scene variable."),
             GD_T("The text of variable _PARAM0_ is _PARAM1__PARAM2_"),
             _("Variables"),
             "res/conditions/var24.png",
             "res/conditions/var.png")
        .AddParameter("scenevar", GD_T("Variable"))
        .AddParameter("relationalOperator", GD_T("Sign of the test"))
        .AddParameter("string", GD_T("Text to compare"))
        .SetManipulatedType("string");

    extension.AddCondition("VariableChildExists",
             _("Child existence"),
             _("Return true if the specified child of the variable exists."),
             GD_T("Child _PARAM1_ of variable _PARAM0_ exists"),
             _("Variables/Structures"),
             "res/conditions/var24.png",
             "res/conditions/var.png")
        .AddParameter("scenevar", GD_T("Variable"))
        .AddParameter("string", GD_T("Name of the child"))
        .MarkAsAdvanced();

    extension.AddCondition("GlobalVariableChildExists",
             _("Child existence"),
             _("Return true if the specified child of the global variable exists."),
             GD_T("Child _PARAM1_ of global variable _PARAM0_ exists"),
             _("Variables/Global variables/Structures"),
             "res/conditions/var24.png",
             "res/conditions/var.png")
        .AddParameter("globalvar", GD_T("Variable"))
        .AddParameter("string", GD_T("Name of the child"))
        .MarkAsAdvanced();

    extension.AddCondition("VarSceneDef",
                   _("Test if a scene variable is defined"),
                   _("Test if the scene variable exist."),
                   GD_T("Variable _PARAM0_ is defined"),
                   _("Variables"),
                   "res/conditions/var24.png",
                   "res/conditions/var.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("string", GD_T("Variable"))
        .SetHidden();

    extension.AddCondition("VarGlobal",
               _("Value of a global variable"),
               _("Compare the value of a global variable."),
               GD_T("Global variable _PARAM0_ is _PARAM1__PARAM2_"),
               _("Variables/Global variables"),
               "res/conditions/var24.png",
               "res/conditions/var.png")
        .AddParameter("globalvar", GD_T("Variable"))
        .AddParameter("relationalOperator", GD_T("Sign of the test"))
        .AddParameter("expression", GD_T("Value to compare"))
        .MarkAsAdvanced()
        .SetManipulatedType("number");

    extension.AddCondition("VarGlobalTxt",
               _("Text of a global variable"),
               _("Compare the text of a global variable."),
               GD_T("The text of the global variable _PARAM0_ is _PARAM1__PARAM2_"),
               _("Variables/Global variables"),
               "res/conditions/var24.png",
               "res/conditions/var.png")
        .AddParameter("globalvar", GD_T("Variable"))
        .AddParameter("relationalOperator", GD_T("Sign of the test"))
        .AddParameter("string", GD_T("Text to compare"))
        .MarkAsAdvanced()
        .SetManipulatedType("string");

    extension.AddCondition("VarGlobalDef",
                   _("Test if a global variable is defined"),
                   _("Test if a global variable exists"),
                   GD_T("Global variable _PARAM0_ is defined"),
                   _("Variables/Global variables"),
                   "res/conditions/var24.png",
                   "res/conditions/var.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("string", GD_T("Variable"))
        .MarkAsAdvanced()
        .SetHidden();

    extension.AddAction("ModVarScene",
               _("Value of a variable"),
               _("Modify the value of a scene variable."),
               GD_T("Do _PARAM1__PARAM2_ to variable _PARAM0_"),
               _("Variables"),
               "res/actions/var24.png",
               "res/actions/var.png")
        .AddParameter("scenevar", GD_T("Variable"))
        .AddParameter("operator", GD_T("Modification's sign"))
        .AddParameter("expression", GD_T("Value"))
        .SetManipulatedType("number");

    extension.AddAction("ModVarSceneTxt",
               _("String of a variable"),
               _("Modify the text of a scene variable."),
               GD_T("Do _PARAM1__PARAM2_ to the text of variable _PARAM0_"),
               _("Variables"),
               "res/actions/var24.png",
               "res/actions/var.png")
        .AddParameter("scenevar", GD_T("Variable"))
        .AddParameter("operator", GD_T("Modification's sign"))
        .AddParameter("string", GD_T("Text"))
        .SetManipulatedType("string");

    extension.AddAction("ModVarGlobal",
               _("Value of a global variable"),
               _("Modify the value of a global variable"),
               GD_T("Do _PARAM1__PARAM2_ to global variable _PARAM0_"),
               _("Variables/Global variables"),
               "res/actions/var24.png",
               "res/actions/var.png")
        .AddParameter("globalvar", GD_T("Variable"))
        .AddParameter("operator", GD_T("Modification's sign"))
        .AddParameter("expression", GD_T("Value"))
        .MarkAsAdvanced()
        .SetManipulatedType("number");

    extension.AddAction("ModVarGlobalTxt",
               _("String of a global variable"),
               _("Modify the text of a global variable."),
               GD_T("Do _PARAM1__PARAM2_ to the text of global variable _PARAM0_"),
               _("Variables/Global variables"),
               "res/actions/var24.png",
               "res/actions/var.png")
        .AddParameter("globalvar", GD_T("Variable"))
        .AddParameter("operator", GD_T("Modification's sign"))
        .AddParameter("string", GD_T("Text"))
        .MarkAsAdvanced()
        .SetManipulatedType("string");

    extension.AddAction("VariableRemoveChild",
               _("Remove a child"),
               _("Remove a child from a variable."),
               GD_T("Remove child _PARAM1_ from variable _PARAM0_"),
               _("Variables/Structure"),
               "res/actions/var24.png",
               "res/actions/var.png")
        .AddParameter("scenevar", GD_T("Variable"))
        .AddParameter("string", GD_T("Child's name"))
        .MarkAsAdvanced();

    extension.AddAction("GlobalVariableRemoveChild",
               _("Remove a child"),
               _("Remove a child from a global variable."),
               GD_T("Remove child _PARAM1_ from global variable _PARAM0_"),
               _("Variables/Global variables/Structure"),
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
