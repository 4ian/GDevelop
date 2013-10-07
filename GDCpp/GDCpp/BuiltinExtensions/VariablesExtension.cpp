/** \file
 *  Game Develop
 *  2008-2013 Florian Rival (Florian.Rival@gmail.com)
 */

#include "GDCpp/BuiltinExtensions/VariablesExtension.h"
#include "GDCore/Events/EventsCodeGenerator.h"
#include "GDCore/Events/EventsCodeGenerationContext.h"
#include "GDCore/Events/ExpressionsCodeGeneration.h"
#include "GDCpp/CommonTools.h"
#include "GDCpp/Project.h"
#include "GDCpp/Scene.h"

VariablesExtension::VariablesExtension()
{
    SetExtensionInformation("BuiltinVariables",
                          _("Variable features"),
                          _("Built-in extension allowing to manipulate variables"),
                          "Florian Rival",
                          "Freeware");
    #if defined(GD_IDE_ONLY)
    AddCondition("VarScene",
               _("Scene variables"),
               _("Test a variable."),
               _("Variable _PARAM0_ is _PARAM1__PARAM2_"),
               _("Variables"),
               "res/conditions/var24.png",
               "res/conditions/var.png")
    .AddParameter("scenevar", _("Variable"))
    .AddParameter("relationalOperator", _("Sign of the test"))
    .AddParameter("expression", _("Value to test"))
    .codeExtraInformation.SetFunctionName("ReturnVariable").SetManipulatedType("number").SetIncludeFile("GDCpp/BuiltinExtensions/RuntimeSceneTools.h");

    AddCondition("VarSceneTxt",
             _("Text of a scene variable"),
             _("Test the text of a variable."),
             _("The text of variable _PARAM0_ is _PARAM1__PARAM2_"),
             _("Variables"),
             "res/conditions/var24.png",
             "res/conditions/var.png")
    .AddParameter("scenevar", _("Variable"))
    .AddParameter("relationalOperator", _("Sign of the test"))
    .AddParameter("string", _("Text to test"))
    .codeExtraInformation.SetFunctionName("ReturnVariable").SetManipulatedType("string").SetIncludeFile("GDCpp/BuiltinExtensions/RuntimeSceneTools.h");

    AddCondition("VariableChildExists",
             _("Child existence"),
             _("Return true if the specified child of the variable exists."),
             _("Child _PARAM1_ of variable _PARAM0_ exists"),
             _("Variables/Structures"),
             "res/conditions/var24.png",
             "res/conditions/var.png")
    .AddParameter("scenevar", _("Variable"))
    .AddParameter("string", _("Name of the child"))
    .codeExtraInformation.SetFunctionName("VariableChildExists").SetIncludeFile("GDCpp/BuiltinExtensions/RuntimeSceneTools.h");

    AddCondition("GlobalVariableChildExists",
             _("Child existence"),
             _("Return true if the specified child of the global variable exists."),
             _("Child _PARAM1_ of global variable _PARAM0_ exists"),
             _("Variables/Global variables/Structures"),
             "res/conditions/var24.png",
             "res/conditions/var.png")
    .AddParameter("globalvar", _("Variable"))
    .AddParameter("string", _("Name of the child"))
    .codeExtraInformation.SetFunctionName("VariableChildExists").SetIncludeFile("GDCpp/BuiltinExtensions/RuntimeSceneTools.h");

    AddCondition("VarSceneDef",
                   _("Test if a scene variable is defined"),
                   _("Test if the scene variable exist."),
                   _("Variable _PARAM0_ is defined"),
                   _("Variables"),
                   "res/conditions/var24.png",
                   "res/conditions/var.png")
    .AddCodeOnlyParameter("currentScene", "")
    .AddParameter("string", _("Variable"))
    .SetHidden()
    .codeExtraInformation.SetFunctionName("VariableExists").SetIncludeFile("GDCpp/BuiltinExtensions/RuntimeSceneTools.h");

    AddCondition("VarGlobal",
               _("Value of a global variable"),
               _("Compare the value of a global variable."),
               _("Global variable _PARAM0_ is _PARAM1__PARAM2_"),
               _("Variables/Global variables"),
               "res/conditions/var24.png",
               "res/conditions/var.png")
    .AddParameter("globalvar", _("Variable"))
    .AddParameter("relationalOperator", _("Sign of the test"))
    .AddParameter("expression", _("Value to test"))
    .codeExtraInformation.SetFunctionName("ReturnVariable").SetManipulatedType("number").SetIncludeFile("GDCpp/BuiltinExtensions/RuntimeSceneTools.h");

    AddCondition("VarGlobalTxt",
               _("Text of a global variable"),
               _("Compare the text of a global variable."),
               _("The text of the global variable _PARAM0_ is _PARAM1__PARAM2_"),
               _("Variables/Global variables"),
               "res/conditions/var24.png",
               "res/conditions/var.png")
    .AddParameter("globalvar", _("Variable"))
    .AddParameter("relationalOperator", _("Sign of the test"))
    .AddParameter("string", _("Text to test"))
    .codeExtraInformation.SetFunctionName("ReturnVariable").SetManipulatedType("string").SetIncludeFile("GDCpp/BuiltinExtensions/RuntimeSceneTools.h");

    AddCondition("VarGlobalDef",
                   _("Test if a global variable is defined"),
                   _("Test if a global variable exists"),
                   _("Global variable _PARAM0_ is defined"),
                   _("Variables/Global variables"),
                   "res/conditions/var24.png",
                   "res/conditions/var.png")
    .AddCodeOnlyParameter("currentScene", "")
    .AddParameter("string", _("Variable"))
    .SetHidden()
    .codeExtraInformation.SetFunctionName("VariableExists").SetIncludeFile("GDCpp/BuiltinExtensions/RuntimeSceneTools.h");

    
    AddAction("ModVarScene",
               _("Value of a variable"),
               _("Modify the value of a scene variable."),
               _("Do _PARAM1__PARAM2_ to variable _PARAM0_"),
               _("Variables"),
               "res/actions/var24.png",
               "res/actions/var.png")
    .AddParameter("scenevar", _("Variable"))
    .AddParameter("operator", _("Modification's sign"))
    .AddParameter("expression", _("Value"))
    .codeExtraInformation.SetFunctionName("ReturnVariable").SetManipulatedType("number").SetIncludeFile("GDCpp/BuiltinExtensions/RuntimeSceneTools.h");

    AddAction("ModVarSceneTxt",
               _("String of a variable"),
               _("Modify the text of a scene variable."),
               _("Do _PARAM1__PARAM2_ to the text of variable _PARAM0_"),
               _("Variables"),
               "res/actions/var24.png",
               "res/actions/var.png")
    .AddParameter("scenevar", _("Variable"))
    .AddParameter("operator", _("Modification's sign"))
    .AddParameter("string", _("Text"))
    .codeExtraInformation.SetFunctionName("ReturnVariable").SetManipulatedType("string").SetIncludeFile("GDCpp/BuiltinExtensions/RuntimeSceneTools.h");

    AddAction("ModVarGlobal",
               _("Value of a global variable"),
               _("Modify the value of a global variable"),
               _("Do _PARAM1__PARAM2_ to global variable _PARAM0_"),
               _("Variables/Global variables"),
               "res/actions/var24.png",
               "res/actions/var.png")
    .AddParameter("globalvar", _("Variable"))
    .AddParameter("operator", _("Modification's sign"))
    .AddParameter("expression", _("Value"))
    .codeExtraInformation.SetFunctionName("ReturnVariable").SetManipulatedType("number").SetIncludeFile("GDCpp/BuiltinExtensions/RuntimeSceneTools.h");

    AddAction("ModVarGlobalTxt",
               _("String of a global variable"),
               _("Modify the text of a global variable."),
               _("Do _PARAM1__PARAM2_ to the text of global variable _PARAM0_"),
               _("Variables/Global variables"),
               "res/actions/var24.png",
               "res/actions/var.png")
    .AddParameter("globalvar", _("Variable"))
    .AddParameter("operator", _("Modification's sign"))
    .AddParameter("string", _("Text"))
    .codeExtraInformation.SetFunctionName("ReturnVariable").SetManipulatedType("string").SetIncludeFile("GDCpp/BuiltinExtensions/RuntimeSceneTools.h");

    AddAction("VariableRemoveChild",
               _("Remove a child"),
               _("Remove a child from a variable."),
               _("Remove child _PARAM1_ from variable _PARAM0_"),
               _("Variables/Structure"),
               "res/actions/var24.png",
               "res/actions/var.png")
    .AddParameter("scenevar", _("Variable"))
    .AddParameter("string", _("Child's name"))
    .codeExtraInformation.SetFunctionName("VariableRemoveChild").SetIncludeFile("GDCpp/BuiltinExtensions/RuntimeSceneTools.h");

    AddAction("GlobalVariableRemoveChild",
               _("Remove a child"),
               _("Remove a child from a global variable."),
               _("Remove child _PARAM1_ from global variable _PARAM0_"),
               _("Variables/Global variables/Structure"),
               "res/actions/var24.png",
               "res/actions/var.png")
    .AddParameter("globalvar", _("Variable"))
    .AddParameter("string", _("Child's name"))
    .codeExtraInformation.SetFunctionName("VariableRemoveChild").SetIncludeFile("GDCpp/BuiltinExtensions/RuntimeSceneTools.h");

    AddExpression("Variable", _("Scene variables"), _("Scene variables"), _("Variables"), "res/actions/var.png")
    .AddParameter("scenevar", _("Variable"))
    .codeExtraInformation.SetFunctionName("GetVariableValue").SetIncludeFile("GDCpp/BuiltinExtensions/RuntimeSceneTools.h");

    AddStrExpression("VariableString", _("Scene variables"), _("Text of a scene variable"), _("Variables"), "res/actions/var.png")
    .AddParameter("scenevar", _("Variable"))
    .codeExtraInformation.SetFunctionName("GetVariableString").SetIncludeFile("GDCpp/BuiltinExtensions/RuntimeSceneTools.h");

    AddExpression("GlobalVariable", _("Global variables"), _("Global variable"), _("Variables"), "res/actions/var.png")
    .AddParameter("globalvar", _("Name of the global variable"))
    .codeExtraInformation.SetFunctionName("GetVariableValue").SetIncludeFile("GDCpp/BuiltinExtensions/RuntimeSceneTools.h");

    AddStrExpression("GlobalVariableString", _("Global variables"), _("Text of a global variable"), _("Variables"), "res/actions/var.png")
    .AddParameter("globalvar", _("Variable"))
    .codeExtraInformation.SetFunctionName("GetVariableString").SetIncludeFile("GDCpp/BuiltinExtensions/RuntimeSceneTools.h");
    #endif
}

