/*
 * GDevelop Core
 * Copyright 2008-present Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "ExpressionCodeGenerator.h"
#include <memory>
#include <vector>
#include "GDCore/CommonTools.h"
#include "GDCore/Events/CodeGeneration/EventsCodeGenerationContext.h"
#include "GDCore/Events/CodeGeneration/EventsCodeGenerator.h"
#include "GDCore/Events/Parsers/ExpressionParser2.h"
#include "GDCore/Events/Parsers/ExpressionParser2Node.h"
#include "GDCore/Events/Parsers/ExpressionParser2NodeWorker.h"
#include "GDCore/Events/Tools/EventsCodeNameMangler.h"
#include "GDCore/Extensions/Metadata/BehaviorMetadata.h"
#include "GDCore/Extensions/Metadata/ExpressionMetadata.h"
#include "GDCore/Extensions/Metadata/MetadataProvider.h"
#include "GDCore/Extensions/Metadata/ObjectMetadata.h"
#include "GDCore/Extensions/Platform.h"
#include "GDCore/Extensions/PlatformExtension.h"
#include "GDCore/Project/Layout.h"
#include "GDCore/Project/Project.h"
namespace gd {

void ExpressionCodeGenerator::OnVisitOperatorNode(OperatorNode& node) {
  node.leftHandSide->Visit(*this);
  output += " ";
  output.push_back(node.op);
  output += " ";
  node.rightHandSide->Visit(*this);
}

void ExpressionCodeGenerator::OnVisitSubExpressionNode(
    SubExpressionNode& node) {
  output += "(";
  node.expression->Visit(*this);
  output += ")";
}

void ExpressionCodeGenerator::OnVisitNumberNode(NumberNode& node) {
  output += node.number;
}

void ExpressionCodeGenerator::OnVisitTextNode(TextNode& node) {
  output += codeGenerator.ConvertToStringExplicit(node.text);
}

void ExpressionCodeGenerator::OnVisitVariableNode(VariableNode& node) {
  // This "translation" from the type to an enum could be avoided
  // if all types were moved to an enum.
  EventsCodeGenerator::VariableScope scope =
      node.type == "globalvar"
          ? gd::EventsCodeGenerator::PROJECT_VARIABLE
          : ((node.type == "scenevar")
                 ? gd::EventsCodeGenerator::LAYOUT_VARIABLE
                 : gd::EventsCodeGenerator::OBJECT_VARIABLE);

  output +=
      codeGenerator.GenerateGetVariable(node.name, scope, node.objectName);
  if (node.child) node.child->Visit(*this);
}

void ExpressionCodeGenerator::OnVisitVariableAccessorNode(
    VariableAccessorNode& node) {
  output += codeGenerator.GenerateVariableAccessor(node.name);
  if (node.child) node.child->Visit(*this);
}

void ExpressionCodeGenerator::OnVisitVariableBracketAccessorNode(
    VariableBracketAccessorNode& node) {
  ExpressionCodeGenerator generator(codeGenerator, context);
  node.expression->Visit(generator);
  output +=
      codeGenerator.GenerateVariableBracketAccessor(generator.GetOutput());
  if (node.child) node.child->Visit(*this);
}

void ExpressionCodeGenerator::OnVisitIdentifierNode(IdentifierNode& node) {
  output += codeGenerator.ConvertToStringExplicit(node.identifierName);
}

void ExpressionCodeGenerator::OnVisitFunctionNode(FunctionNode& node) {
  if (gd::MetadataProvider::IsBadExpressionMetadata(node.expressionMetadata)) {
    output += "/* Error during generation, function not found: " +
              codeGenerator.ConvertToString(node.functionName) + " for type " +
              node.type + " */ " + GenerateDefaultValue(node.type);
    return;
  }

  if (!node.objectName.empty()) {
    if (!node.behaviorName.empty()) {
      output += GenerateBehaviorFunctionCode(node.type,
                                             node.objectName,
                                             node.behaviorName,
                                             node.parameters,
                                             node.expressionMetadata);
    } else {
      output += GenerateObjectFunctionCode(
          node.type, node.objectName, node.parameters, node.expressionMetadata);
    }
  } else {
    output +=
        GenerateFreeFunctionCode(node.parameters, node.expressionMetadata);
  }
}

gd::String ExpressionCodeGenerator::GenerateFreeFunctionCode(
    const std::vector<std::unique_ptr<ExpressionNode>>& parameters,
    const ExpressionMetadata& expressionMetadata) {
  codeGenerator.AddIncludeFiles(
      expressionMetadata.codeExtraInformation.GetIncludeFiles());

  // Launch custom code generator if needed
  // TODO: Add support for custom code generator
  // if (expressionMetadata.codeExtraInformation.HasCustomCodeGenerator()) {
  //   output += expressionMetadata.codeExtraInformation.customCodeGenerator(
  //       parameters, codeGenerator, context);
  //   return;
  // }

  gd::String parametersCode =
      GenerateParametersCodes(parameters, expressionMetadata, 0);

  return expressionMetadata.codeExtraInformation.functionCallName + "(" +
         parametersCode + ")";
}

gd::String ExpressionCodeGenerator::GenerateObjectFunctionCode(
    const gd::String& type,
    const gd::String& objectName,
    const std::vector<std::unique_ptr<ExpressionNode>>& parameters,
    const ExpressionMetadata& expressionMetadata) {
  const gd::ObjectsContainer& globalObjectsAndGroups =
      codeGenerator.GetGlobalObjectsAndGroups();
  const gd::ObjectsContainer& objectsAndGroups =
      codeGenerator.GetObjectsAndGroups();

  codeGenerator.AddIncludeFiles(
      expressionMetadata.codeExtraInformation.GetIncludeFiles());

  // Launch custom code generator if needed
  // TODO: Add support for custom code generator
  // if (expressionMetadata.codeExtraInformation.HasCustomCodeGenerator()) {
  //   output += expressionMetadata.codeExtraInformation.customCodeGenerator(
  //       parameters, codeGenerator, context);
  //   return;
  // }

  // Prepare parameters
  gd::String parametersCode = GenerateParametersCodes(
      parameters,
      expressionMetadata,
      // By convention, the first parameter is the object
      1);

  gd::String functionOutput = GenerateDefaultValue(type);

  // Get object(s) concerned by function call
  std::vector<gd::String> realObjects =
      codeGenerator.ExpandObjectsName(objectName, context);
  for (std::size_t i = 0; i < realObjects.size(); ++i) {
    context.ObjectsListNeeded(realObjects[i]);

    gd::String objectType = gd::GetTypeOfObject(
        globalObjectsAndGroups, objectsAndGroups, realObjects[i]);
    const ObjectMetadata& objInfo = MetadataProvider::GetObjectMetadata(
        codeGenerator.GetPlatform(), objectType);

    codeGenerator.AddIncludeFiles(objInfo.includeFiles);
    functionOutput = codeGenerator.GenerateObjectFunctionCall(
        realObjects[i],
        objInfo,
        expressionMetadata.codeExtraInformation,
        parametersCode,
        functionOutput,
        context);
  }

  return functionOutput;
}
gd::String ExpressionCodeGenerator::GenerateBehaviorFunctionCode(
    const gd::String& type,
    const gd::String& objectName,
    const gd::String& behaviorName,
    const std::vector<std::unique_ptr<ExpressionNode>>& parameters,
    const ExpressionMetadata& expressionMetadata) {
  const gd::ObjectsContainer& globalObjectsAndGroups =
      codeGenerator.GetGlobalObjectsAndGroups();
  const gd::ObjectsContainer& objectsAndGroups =
      codeGenerator.GetObjectsAndGroups();

  codeGenerator.AddIncludeFiles(
      expressionMetadata.codeExtraInformation.GetIncludeFiles());

  // Launch custom code generator if needed
  // TODO: Add support for custom code generator
  // if (expressionMetadata.codeExtraInformation.HasCustomCodeGenerator()) {
  //   output += expressionMetadata.codeExtraInformation.customCodeGenerator(
  //       parameters, codeGenerator, context);
  //   return;
  // }

  // Prepare parameters
  gd::String parametersCode = GenerateParametersCodes(
      parameters,
      expressionMetadata,
      // By convention, the first parameters are the object and behavior
      2);

  // Get object(s) concerned by function call
  std::vector<gd::String> realObjects =
      codeGenerator.ExpandObjectsName(objectName, context);

  gd::String functionOutput = GenerateDefaultValue(type);

  gd::String behaviorType = gd::GetTypeOfBehavior(
      globalObjectsAndGroups, objectsAndGroups, behaviorName);
  const BehaviorMetadata& autoInfo = MetadataProvider::GetBehaviorMetadata(
      codeGenerator.GetPlatform(), behaviorType);

  for (std::size_t i = 0; i < realObjects.size(); ++i) {
    context.ObjectsListNeeded(realObjects[i]);

    codeGenerator.AddIncludeFiles(autoInfo.includeFiles);
    functionOutput = codeGenerator.GenerateObjectBehaviorFunctionCall(
        realObjects[i],
        behaviorName,
        autoInfo,
        expressionMetadata.codeExtraInformation,
        parametersCode,
        functionOutput,
        context);
  }

  return functionOutput;
}

gd::String ExpressionCodeGenerator::GenerateParametersCodes(
    const std::vector<std::unique_ptr<ExpressionNode>>& parameters,
    const ExpressionMetadata& expressionMetadata,
    size_t initialParameterIndex) {
  size_t nonCodeOnlyParameterIndex = 0;
  gd::String parametersCode;
  for (std::size_t i = initialParameterIndex;
       i < expressionMetadata.parameters.size();
       ++i) {
    if (i != initialParameterIndex) parametersCode += ", ";

    auto& parameterMetadata = expressionMetadata.parameters[i];
    if (!parameterMetadata.IsCodeOnly()) {
      ExpressionCodeGenerator generator(codeGenerator, context);
      if (nonCodeOnlyParameterIndex < parameters.size()) {
        parameters[nonCodeOnlyParameterIndex]->Visit(generator);
        parametersCode += generator.GetOutput();
      } else if (parameterMetadata.IsOptional()) {
        // Optional parameters default value were not parsed at the time of the expression parsing.
        // Parse them now.
        ExpressionParser2 parser(codeGenerator.GetPlatform(), codeGenerator.GetGlobalObjectsAndGroups(), codeGenerator.GetObjectsAndGroups());
        auto node = parser.ParseExpression(parameterMetadata.GetType(), parameterMetadata.GetDefaultValue());

        node->Visit(generator);
        parametersCode += generator.GetOutput();
      } else {
        parametersCode +=
            "/* Error during generation, parameter not existing in the nodes "
            "*/ " +
            GenerateDefaultValue(parameterMetadata.GetType());
      }

      nonCodeOnlyParameterIndex++;
    } else {
      parametersCode +=
          codeGenerator.GenerateParameterCodes(parameterMetadata.GetExtraInfo(),
                                               parameterMetadata,
                                               context,
                                               "",
                                               nullptr);
    }
  }

  return parametersCode;
}

gd::String ExpressionCodeGenerator::GenerateDefaultValue(
    const gd::String& type) {
  return type == "string" ? "\"\"" : "0";
}

void ExpressionCodeGenerator::OnVisitEmptyNode(EmptyNode& node) {
  output += GenerateDefaultValue(node.type);
}

}  // namespace gd
