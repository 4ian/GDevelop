/*
 * GDevelop C++ Platform
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

#include "GDCpp/Extensions/Builtin/VariablesExtension.h"
#include "GDCore/Events/CodeGeneration/EventsCodeGenerator.h"
#include "GDCore/Events/CodeGeneration/EventsCodeGenerationContext.h"
#include "GDCore/Events/CodeGeneration/ExpressionsCodeGeneration.h"
#include "GDCpp/Runtime/CommonTools.h"
#include "GDCpp/Runtime/Project/Project.h"
#include "GDCpp/Runtime/Project/Layout.h"
#include "GDCore/Extensions/Builtin/AllBuiltinExtensions.h"
#if !defined(GD_IDE_ONLY)
#include "GDCore/Extensions/Builtin/VariablesExtension.cpp"
#endif

VariablesExtension::VariablesExtension()
{
    gd::BuiltinExtensionsImplementer::ImplementsVariablesExtension(*this);

    #if defined(GD_IDE_ONLY)
    GetAllConditions()["VarScene"].SetFunctionName("ReturnVariable").SetManipulatedType("number").SetIncludeFile("GDCpp/Extensions/Builtin/RuntimeSceneTools.h");
    GetAllConditions()["VarSceneTxt"].SetFunctionName("ReturnVariable").SetManipulatedType("string").SetIncludeFile("GDCpp/Extensions/Builtin/RuntimeSceneTools.h");

    GetAllConditions()["VariableChildExists"].SetFunctionName("VariableChildExists").SetIncludeFile("GDCpp/Extensions/Builtin/RuntimeSceneTools.h");
    GetAllConditions()["GlobalVariableChildExists"].SetFunctionName("VariableChildExists").SetIncludeFile("GDCpp/Extensions/Builtin/RuntimeSceneTools.h");

    GetAllConditions()["VarSceneDef"].SetFunctionName("VariableExists").SetIncludeFile("GDCpp/Extensions/Builtin/RuntimeSceneTools.h");
    GetAllConditions()["VarGlobalDef"].SetFunctionName("VariableExists").SetIncludeFile("GDCpp/Extensions/Builtin/RuntimeSceneTools.h");

    GetAllConditions()["VarGlobal"].SetFunctionName("ReturnVariable").SetManipulatedType("number").SetIncludeFile("GDCpp/Extensions/Builtin/RuntimeSceneTools.h");
    GetAllConditions()["VarGlobalTxt"].SetFunctionName("ReturnVariable").SetManipulatedType("string").SetIncludeFile("GDCpp/Extensions/Builtin/RuntimeSceneTools.h");

    GetAllActions()["ModVarScene"].SetFunctionName("ReturnVariable").SetManipulatedType("number").SetIncludeFile("GDCpp/Extensions/Builtin/RuntimeSceneTools.h");
    GetAllActions()["ModVarSceneTxt"].SetFunctionName("ReturnVariable").SetManipulatedType("string").SetIncludeFile("GDCpp/Extensions/Builtin/RuntimeSceneTools.h");

    GetAllActions()["ModVarGlobal"].SetFunctionName("ReturnVariable").SetManipulatedType("number").SetIncludeFile("GDCpp/Extensions/Builtin/RuntimeSceneTools.h");
    GetAllActions()["ModVarGlobalTxt"].SetFunctionName("ReturnVariable").SetManipulatedType("string").SetIncludeFile("GDCpp/Extensions/Builtin/RuntimeSceneTools.h");

    GetAllActions()["VariableRemoveChild"].SetFunctionName("VariableRemoveChild").SetIncludeFile("GDCpp/Extensions/Builtin/RuntimeSceneTools.h");
    GetAllActions()["GlobalVariableRemoveChild"].SetFunctionName("VariableRemoveChild").SetIncludeFile("GDCpp/Extensions/Builtin/RuntimeSceneTools.h");

    GetAllActions()["VariableClearChildren"].SetFunctionName("VariableClearChildren").SetIncludeFile("GDCpp/Extensions/Builtin/RuntimeSceneTools.h");
    GetAllActions()["GlobalVariableClearChildren"].SetFunctionName("VariableClearChildren").SetIncludeFile("GDCpp/Extensions/Builtin/RuntimeSceneTools.h");

    GetAllExpressions()["Variable"].SetFunctionName("GetVariableValue").SetIncludeFile("GDCpp/Extensions/Builtin/RuntimeSceneTools.h");
    GetAllStrExpressions()["VariableString"].SetFunctionName("GetVariableString").SetIncludeFile("GDCpp/Extensions/Builtin/RuntimeSceneTools.h");

    GetAllExpressions()["GlobalVariable"].SetFunctionName("GetVariableValue").SetIncludeFile("GDCpp/Extensions/Builtin/RuntimeSceneTools.h");
    GetAllStrExpressions()["GlobalVariableString"].SetFunctionName("GetVariableString").SetIncludeFile("GDCpp/Extensions/Builtin/RuntimeSceneTools.h");
 
    GetAllExpressions()["VariableChildCount"].SetFunctionName("GetVariableChildCount").SetIncludeFile("GDCpp/Extensions/Builtin/RuntimeSceneTools.h"); 
    GetAllExpressions()["GlobalVariableChildCount"].SetFunctionName("GetVariableChildCount").SetIncludeFile("GDCpp/Extensions/Builtin/RuntimeSceneTools.h");   

#endif
}

