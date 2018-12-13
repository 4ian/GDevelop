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

// Compatibility with old ExpressionParser
#include "GDCore/Events/CodeGeneration/ExpressionsCodeGeneration.h"
#include "GDCore/Events/CodeGeneration/VariableParserCallbacks.h"
#include "GDCore/Events/Parsers/ExpressionParser.h"
#include "GDCore/Events/Parsers/VariableParser.h"
// end of compatibility code

namespace gd {

bool ExpressionCodeGenerator::useOldExpressionParser = false;

gd::String ExpressionCodeGenerator::GenerateExpressionCode(
    EventsCodeGenerator& codeGenerator,
    EventsCodeGenerationContext& context,
    const gd::String& type,
    const gd::String& expression,
    const gd::String& objectName) {
  // Compatibility with old ExpressionParser
  if (useOldExpressionParser) {
    if (type == "number") {
      gd::String code = "";
      gd::CallbacksForGeneratingExpressionCode callbacks(
          code, codeGenerator, context);
      gd::ExpressionParser parser(expression);
      if (!parser.ParseMathExpression(codeGenerator.GetPlatform(),
                                      codeGenerator.GetGlobalObjectsAndGroups(),
                                      codeGenerator.GetObjectsAndGroups(),
                                      callbacks) ||
          code.empty()) {
        std::cout << "Error (old ExpressionParser): \""
                  << parser.GetFirstError() << "\" in: \"" << expression
                  << "\" (number)" << std::endl;
        code = "0";
      }

      return code;
    } else if (type == "string") {
      gd::String code = "";
      gd::CallbacksForGeneratingExpressionCode callbacks(
          code, codeGenerator, context);
      gd::ExpressionParser parser(expression);
      if (!parser.ParseStringExpression(
              codeGenerator.GetPlatform(),
              codeGenerator.GetGlobalObjectsAndGroups(),
              codeGenerator.GetObjectsAndGroups(),
              callbacks) ||
          code.empty()) {
        std::cout << "Error (old ExpressionParser): \""
                  << parser.GetFirstError() << "\" in: \"" << expression
                  << "\" (string)" << std::endl;
        code = "\"\"";
      }

      return code;
    } else if (type == "scenevar") {
      gd::String code = "";
      gd::VariableCodeGenerationCallbacks callbacks(
          code,
          codeGenerator,
          context,
          gd::EventsCodeGenerator::LAYOUT_VARIABLE);

      gd::VariableParser parser(expression);
      if (!parser.Parse(callbacks)) {
        std::cout << "Error (old VariableParser) :" << parser.GetFirstError()
                  << " in: " << expression << std::endl;
        code = codeGenerator.GenerateBadVariable();
      }
      return code;
    } else if (type == "globalvar") {
      gd::String code = "";
      gd::VariableCodeGenerationCallbacks callbacks(
          code,
          codeGenerator,
          context,
          gd::EventsCodeGenerator::PROJECT_VARIABLE);

      gd::VariableParser parser(expression);
      if (!parser.Parse(callbacks)) {
        std::cout << "Error (old VariableParser) :" << parser.GetFirstError()
                  << " in: " << expression << std::endl;
        code = codeGenerator.GenerateBadVariable();
      }
      return code;
    } else if (type == "objectvar") {
      gd::String code = "";

      // Object is either the object of the previous parameter or, if it is
      // empty, the object being picked by the instruction.
      gd::String object =
          objectName.empty() ? context.GetCurrentObject() : objectName;

      gd::VariableCodeGenerationCallbacks callbacks(
          code, codeGenerator, context, object);

      gd::VariableParser parser(expression);
      if (!parser.Parse(callbacks)) {
        std::cout << "Error (old VariableParser) :" << parser.GetFirstError()
                  << " in: " << expression << std::endl;
        code = codeGenerator.GenerateBadVariable();
      }
      return code;
    }

    std::cout << "Type error (old ExpressionParser): type \"" << type
              << "\" is not supported" << std::endl;
    return "/* Error during code generation: type " + type +
           " is not supported for old ExpressionParser. */ 0";
  }
  // end of compatibility code

  gd::ExpressionParser2 parser(codeGenerator.GetPlatform(),
                               codeGenerator.GetGlobalObjectsAndGroups(),
                               codeGenerator.GetObjectsAndGroups());
  auto node = parser.ParseExpression(type, expression, objectName);
  gd::ExpressionValidator validator;
  node->Visit(validator);
  if (!validator.GetErrors().empty()) {
    std::cout << "Error: \"" << validator.GetErrors()[0]->GetMessage()
              << "\" in: \"" << expression << "\" (" << type << ")"
              << std::endl;

    return GenerateDefaultValue(type);
  }

  ExpressionCodeGenerator generator(codeGenerator, context);
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
  EventsCodeGenerator::VariableScope scope =
      node.type == "globalvar"
          ? gd::EventsCodeGenerator::PROJECT_VARIABLE
          : ((node.type == "scenevar")
                 ? gd::EventsCodeGenerator::LAYOUT_VARIABLE
                 : gd::EventsCodeGenerator::OBJECT_VARIABLE);

  output += codeGenerator.GenerateGetVariable(
      node.name, scope, context, node.objectName);
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
      ExpressionCodeGenerator generator(codeGenerator, context);
      if (nonCodeOnlyParameterIndex < parameters.size()) {
        parameters[nonCodeOnlyParameterIndex]->Visit(generator);
        parametersCode += generator.GetOutput();
      } else if (parameterMetadata.IsOptional()) {
        // Optional parameters default value were not parsed at the time of the
        // expression parsing. Parse them now.
        ExpressionParser2 parser(codeGenerator.GetPlatform(),
                                 codeGenerator.GetGlobalObjectsAndGroups(),
                                 codeGenerator.GetObjectsAndGroups());
        auto node = parser.ParseExpression(parameterMetadata.GetType(),
                                           parameterMetadata.GetDefaultValue());

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
  return type == "string" ? "\"\"" : "0";
}

void ExpressionCodeGenerator::OnVisitEmptyNode(EmptyNode& node) {
  output += GenerateDefaultValue(node.type);
}

}  // namespace gd
