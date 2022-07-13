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
#include "GDCore/Events/Parsers/ExpressionParser2NodePrinter.h"
#include "GDCore/Events/Parsers/ExpressionParser2NodeWorker.h"
#include "GDCore/Events/Tools/EventsCodeNameMangler.h"
#include "GDCore/Extensions/Metadata/BehaviorMetadata.h"
#include "GDCore/Extensions/Metadata/ExpressionMetadata.h"
#include "GDCore/Extensions/Metadata/MetadataProvider.h"
#include "GDCore/Extensions/Metadata/ObjectMetadata.h"
#include "GDCore/Extensions/Platform.h"
#include "GDCore/Extensions/PlatformExtension.h"
#include "GDCore/IDE/Events/ExpressionValidator.h"
#include "GDCore/Project/Layout.h"
#include "GDCore/Project/Project.h"
#include "GDCore/IDE/Events/ExpressionTypeFinder.h"
#include "GDCore/IDE/Events/ExpressionVariableOwnerFinder.h"

namespace gd {

gd::String ExpressionCodeGenerator::GenerateExpressionCode(
    EventsCodeGenerator& codeGenerator,
    EventsCodeGenerationContext& context,
    const gd::String& rootType,
    const gd::Expression& expression,
    const gd::String& rootObjectName) {
  ExpressionCodeGenerator generator(rootType, rootObjectName, codeGenerator, context);

  auto node = expression.GetRootNode();
  if (!node) {
    std::cout << "Error: error while parsing: \"" << expression.GetPlainString()
              << "\" (" << rootType << ")" << std::endl;

    return generator.GenerateDefaultValue(rootType);
  }

  gd::ExpressionValidator validator(codeGenerator.GetPlatform(),
                                    codeGenerator.GetGlobalObjectsAndGroups(),
                                    codeGenerator.GetObjectsAndGroups(),
                                    rootType);
  node->Visit(validator);
  if (!validator.GetErrors().empty()) {
    std::cout << "Error: \"" << validator.GetErrors()[0]->GetMessage()
              << "\" in: \"" << expression.GetPlainString() << "\" ("
              << rootType << ")" << std::endl;

    return generator.GenerateDefaultValue(rootType);
  }

  node->Visit(generator);
  return generator.GetOutput();
}

void ExpressionCodeGenerator::OnVisitOperatorNode(OperatorNode& node) {
  node.leftHandSide->Visit(*this);
  output += " ";
  output.push_back(node.op);
  output += " ";
  node.rightHandSide->Visit(*this);
}

void ExpressionCodeGenerator::OnVisitUnaryOperatorNode(
    UnaryOperatorNode& node) {
  output.push_back(node.op);
  output += "(";  // Add extra parenthesis to ensure that things like --2 are
                  // properly outputted as -(-2) (GDevelop don't have -- or ++
                  // operators, but JavaScript and C++ have).
  node.factor->Visit(*this);
  output += ")";
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
  auto type = gd::ExpressionTypeFinder::GetType(codeGenerator.GetPlatform(),
                                            codeGenerator.GetGlobalObjectsAndGroups(),
                                            codeGenerator.GetObjectsAndGroups(),
                                            rootType,
                                            node);
  EventsCodeGenerator::VariableScope scope =
      type == "globalvar"
          ? gd::EventsCodeGenerator::PROJECT_VARIABLE
          : ((type == "scenevar")
                 ? gd::EventsCodeGenerator::LAYOUT_VARIABLE
                 : gd::EventsCodeGenerator::OBJECT_VARIABLE);
  auto objectName = gd::ExpressionVariableOwnerFinder::GetObjectName(codeGenerator.GetPlatform(),
                                        codeGenerator.GetGlobalObjectsAndGroups(),
                                        codeGenerator.GetObjectsAndGroups(),
                                        rootObjectName,
                                        node);
  output += codeGenerator.GenerateGetVariable(
      node.name, scope, context, objectName);
  if (node.child) node.child->Visit(*this);
}

void ExpressionCodeGenerator::OnVisitVariableAccessorNode(
    VariableAccessorNode& node) {
  output += codeGenerator.GenerateVariableAccessor(node.name);
  if (node.child) node.child->Visit(*this);
}

void ExpressionCodeGenerator::OnVisitVariableBracketAccessorNode(
    VariableBracketAccessorNode& node) {
  ExpressionCodeGenerator generator("string", "", codeGenerator, context);
  node.expression->Visit(generator);
  output +=
      codeGenerator.GenerateVariableBracketAccessor(generator.GetOutput());
  if (node.child) node.child->Visit(*this);
}

void ExpressionCodeGenerator::OnVisitIdentifierNode(IdentifierNode& node) {
  auto type = gd::ExpressionTypeFinder::GetType(codeGenerator.GetPlatform(),
                                            codeGenerator.GetGlobalObjectsAndGroups(),
                                            codeGenerator.GetObjectsAndGroups(),
                                            rootType,
                                            node);
  if (gd::ParameterMetadata::IsObject(type)) {
    output +=
        codeGenerator.GenerateObject(node.identifierName, type, context);
  } else if (gd::ParameterMetadata::IsExpression("variable", type)) {
      EventsCodeGenerator::VariableScope scope =
          type == "globalvar"
              ? gd::EventsCodeGenerator::PROJECT_VARIABLE
              : ((type == "scenevar")
                    ? gd::EventsCodeGenerator::LAYOUT_VARIABLE
                    : gd::EventsCodeGenerator::OBJECT_VARIABLE);

      auto objectName = gd::ExpressionVariableOwnerFinder::GetObjectName(codeGenerator.GetPlatform(),
                                            codeGenerator.GetGlobalObjectsAndGroups(),
                                            codeGenerator.GetObjectsAndGroups(),
                                            rootObjectName,
                                            node);
      output += codeGenerator.GenerateGetVariable(
          node.identifierName, scope, context, objectName);
      if (!node.childIdentifierName.empty()) {
        output += codeGenerator.GenerateVariableAccessor(node.childIdentifierName);
      }
  } else if (node.childIdentifierName.empty()) {
    output += "/* Error during generation, unrecognized identifier type: " +
              codeGenerator.ConvertToString(type) + " with value " +
              codeGenerator.ConvertToString(node.identifierName) + " */ " +
              codeGenerator.ConvertToStringExplicit(node.identifierName);
  }
  else {
    // This is for function names that are put in IdentifierNode
    // because the type is needed to tell them appart from variables.
    output += GenerateDefaultValue(type);
  }
}

void ExpressionCodeGenerator::OnVisitFunctionCallNode(FunctionCallNode& node) {
  auto type = gd::ExpressionTypeFinder::GetType(codeGenerator.GetPlatform(),
                                            codeGenerator.GetGlobalObjectsAndGroups(),
                                            codeGenerator.GetObjectsAndGroups(),
                                            rootType,
                                            node);

  const gd::ExpressionMetadata &metadata = MetadataProvider::GetFunctionCallMetadata(
      codeGenerator.GetPlatform(),
      codeGenerator.GetGlobalObjectsAndGroups(),
      codeGenerator.GetObjectsAndGroups(),
      node);

  if (gd::MetadataProvider::IsBadExpressionMetadata(metadata)) {
    output += "/* Error during generation, function not found: " +
              codeGenerator.ConvertToString(node.functionName) + " */ " +
              GenerateDefaultValue(type);
    return;
  }

  if (!node.objectName.empty()) {
    if (!node.behaviorName.empty()) {
      output += GenerateBehaviorFunctionCode(type,
                                             node.objectName,
                                             node.behaviorName,
                                             node.parameters,
                                             metadata);
    } else {
      output += GenerateObjectFunctionCode(
          type, node.objectName, node.parameters, metadata);
    }
  } else {
    output +=
        GenerateFreeFunctionCode(node.parameters, metadata);
  }
}

gd::String ExpressionCodeGenerator::GenerateFreeFunctionCode(
    const std::vector<std::unique_ptr<ExpressionNode>>& parameters,
    const ExpressionMetadata& expressionMetadata) {
  codeGenerator.AddIncludeFiles(
      expressionMetadata.codeExtraInformation.GetIncludeFiles());

  // Launch custom code generator if needed
  if (expressionMetadata.codeExtraInformation.HasCustomCodeGenerator()) {
    return expressionMetadata.codeExtraInformation.customCodeGenerator(
        PrintParameters(parameters), codeGenerator, context);
  }

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
  if (expressionMetadata.codeExtraInformation.HasCustomCodeGenerator()) {
    return expressionMetadata.codeExtraInformation.customCodeGenerator(
        PrintParameters(parameters), codeGenerator, context);
  }

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

    if (objInfo.IsUnsupportedBaseObjectCapability(
            expressionMetadata.GetRequiredBaseObjectCapability())) {
      // Do nothing, skipping objects not supporting the capability required by
      // this expression.
    } else {
      codeGenerator.AddIncludeFiles(objInfo.includeFiles);
      functionOutput = codeGenerator.GenerateObjectFunctionCall(
          realObjects[i],
          objInfo,
          expressionMetadata.codeExtraInformation,
          parametersCode,
          functionOutput,
          context);
    }
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
  if (expressionMetadata.codeExtraInformation.HasCustomCodeGenerator()) {
    return expressionMetadata.codeExtraInformation.customCodeGenerator(
        PrintParameters(parameters), codeGenerator, context);
  }

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
      if (nonCodeOnlyParameterIndex < parameters.size()) {
        auto objectName = gd::ExpressionVariableOwnerFinder::GetObjectName(codeGenerator.GetPlatform(),
                                              codeGenerator.GetGlobalObjectsAndGroups(),
                                              codeGenerator.GetObjectsAndGroups(),
                                              rootObjectName,
                                              *parameters[nonCodeOnlyParameterIndex].get());
        ExpressionCodeGenerator generator(parameterMetadata.GetType(), objectName, codeGenerator, context);
        parameters[nonCodeOnlyParameterIndex]->Visit(generator);
        parametersCode += generator.GetOutput();
      } else if (parameterMetadata.IsOptional()) {
        ExpressionCodeGenerator generator(parameterMetadata.GetType(), "", codeGenerator, context);
        // Optional parameters default value were not parsed at the time of the
        // expression parsing. Parse them now.
        ExpressionParser2 parser;
        auto node = parser.ParseExpression(parameterMetadata.GetDefaultValue());

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

std::vector<gd::Expression> ExpressionCodeGenerator::PrintParameters(
    const std::vector<std::unique_ptr<ExpressionNode>>& parameters) {
  // Printing parameters is only useful because custom code generator of
  // expression require to get the parameters of the expression as strings
  // (gd::Expression). Once the old ExpressionParser is removed, custom
  // code generator can be reworked to directly take the parsed nodes,
  // avoiding an extra and useless printing/parsing of their parameters.

  std::vector<gd::Expression> printedParameters;
  for (auto& parameter : parameters) {
    printedParameters.push_back(
        gd::ExpressionParser2NodePrinter::PrintNode(*parameter));
  }

  return printedParameters;
}

gd::String ExpressionCodeGenerator::GenerateDefaultValue(
    const gd::String& type) {
  if (gd::ParameterMetadata::IsExpression("variable", type)) {
    return codeGenerator.GenerateBadVariable();
  }
  if (gd::ParameterMetadata::IsObject(type)) {
    return codeGenerator.GenerateBadObject();
  }
  if (gd::ParameterMetadata::IsExpression("string", type)) {
    return "\"\"";
  }

  return "0";
}

void ExpressionCodeGenerator::OnVisitEmptyNode(EmptyNode& node) {
  auto type = gd::ExpressionTypeFinder::GetType(codeGenerator.GetPlatform(),
                                            codeGenerator.GetGlobalObjectsAndGroups(),
                                            codeGenerator.GetObjectsAndGroups(),
                                            rootType,
                                            node);
  output += GenerateDefaultValue(type);
}

void ExpressionCodeGenerator::OnVisitObjectFunctionNameNode(
    ObjectFunctionNameNode& node) {
  auto type = gd::ExpressionTypeFinder::GetType(codeGenerator.GetPlatform(),
                                            codeGenerator.GetGlobalObjectsAndGroups(),
                                            codeGenerator.GetObjectsAndGroups(),
                                            rootType,
                                            node);
  output += GenerateDefaultValue(type);
}

}  // namespace gd
