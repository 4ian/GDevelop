/*
 * GDevelop JS Platform
 * Copyright 2008-present Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "LayoutCodeGenerator.h"

#include <set>
#include <vector>

#include "EventsCodeGenerator.h"
#include "GDCore/Events/CodeGeneration/EventsCodeGenerationContext.h"
#include "GDCore/Events/CodeGeneration/ExpressionCodeGenerator.h"
#include "GDCore/Events/Expression.h"
#include "GDCore/Events/Parsers/ExpressionParser2.h"
#include "GDCore/Events/Parsers/ExpressionParser2Node.h"
#include "GDCore/Events/Parsers/ExpressionParser2NodePrinter.h"
#include "GDCore/Events/Parsers/ExpressionParser2NodeWorker.h"
#include "GDCore/Extensions/Metadata/ParameterMetadata.h"
#include "GDCore/IDE/SceneNameMangler.h"
#include "GDCore/Project/ProjectScopedContainers.h"

namespace gdjs {

namespace {
/**
 * How many instances at most are read when an expression is evaluated on all
 * of them. The answer travels on the debugger channel every 300 ms, with a
 * one second timeout: an unbounded list would make it miss its deadline on a
 * scene holding thousands of instances.
 */
const std::size_t maxEvaluatedInstancesCount = 200;

/**
 * Collect the text of every variable used in an expression (`Score`,
 * `Player.Life`, `Inventory["key"].count`...), in order of appearance.
 */
class ExpressionVariablesCollector : public gd::ExpressionParser2NodeWorker {
 public:
  ExpressionVariablesCollector(
      const gd::ProjectScopedContainers& projectScopedContainers_)
      : projectScopedContainers(projectScopedContainers_) {}

  const std::vector<gd::String>& GetVariableExpressions() const {
    return variableExpressions;
  }

 protected:
  void OnVisitSubExpressionNode(gd::SubExpressionNode& node) override {
    node.expression->Visit(*this);
  }
  void OnVisitOperatorNode(gd::OperatorNode& node) override {
    node.leftHandSide->Visit(*this);
    node.rightHandSide->Visit(*this);
  }
  void OnVisitUnaryOperatorNode(gd::UnaryOperatorNode& node) override {
    node.factor->Visit(*this);
  }
  void OnVisitNumberNode(gd::NumberNode& node) override {}
  void OnVisitTextNode(gd::TextNode& node) override {}
  void OnVisitVariableNode(gd::VariableNode& node) override {
    Add(gd::ExpressionParser2NodePrinter::PrintNode(node));
    // Variables can also be used inside brackets: `Items[Selected]`.
    VisitBracketExpressions(node.child.get());
  }
  void OnVisitVariableAccessorNode(gd::VariableAccessorNode& node) override {}
  void OnVisitVariableBracketAccessorNode(
      gd::VariableBracketAccessorNode& node) override {}
  void OnVisitIdentifierNode(gd::IdentifierNode& node) override {
    // A bare identifier is a variable (or an object variable, for
    // `Object.Variable`), unless it's the name of an object (for example a
    // parameter of a function like `Distance(Player, Enemy)`).
    const bool isVariable =
        projectScopedContainers.GetVariablesContainersList().Has(
            node.identifierName);
    const bool isObjectVariable =
        !node.childIdentifierName.empty() &&
        projectScopedContainers.GetObjectsContainersList()
            .HasObjectOrGroupNamed(node.identifierName);
    if (isVariable || isObjectVariable) {
      Add(gd::ExpressionParser2NodePrinter::PrintNode(node));
    }
  }
  void OnVisitObjectFunctionNameNode(
      gd::ObjectFunctionNameNode& node) override {}
  void OnVisitFunctionCallNode(gd::FunctionCallNode& node) override {
    for (auto& parameter : node.parameters) parameter->Visit(*this);
  }
  void OnVisitEmptyNode(gd::EmptyNode& node) override {}

 private:
  void Add(const gd::String& variableExpression) {
    if (alreadyAdded.insert(variableExpression).second) {
      variableExpressions.push_back(variableExpression);
    }
  }

  void VisitBracketExpressions(
      gd::VariableAccessorOrVariableBracketAccessorNode* accessor) {
    while (accessor) {
      auto* bracketAccessor =
          dynamic_cast<gd::VariableBracketAccessorNode*>(accessor);
      if (bracketAccessor) bracketAccessor->expression->Visit(*this);
      accessor = accessor->child.get();
    }
  }

  const gd::ProjectScopedContainers& projectScopedContainers;
  std::vector<gd::String> variableExpressions;
  std::set<gd::String> alreadyAdded;
};
}  // namespace

gd::String LayoutCodeGenerator::GenerateExpressionEvaluationCode(
    const gd::Layout& layout,
    const gd::String& type,
    const gd::String& expression,
    const gd::String& objectName) {
  // The lists of objects live in a namespace of their own, so that they
  // never interfere with the ones of the code of the scene.
  const gd::String codeNamespace = "gdjs.__expressionEvaluationCode";
  EventsCodeGenerator codeGenerator(project, layout);
  codeGenerator.SetCodeNamespace(codeNamespace);
  gd::EventsCodeGenerationContext context;

  // `Object.Variable` is generated as an object variable: the generic
  // "variable" type only resolves scene, global and local variables.
  const auto& objectsContainersList = codeGenerator.GetObjectsContainersList();
  auto generateCode = [&](const gd::String& expressionType,
                          const gd::String& expressionText,
                          const gd::String& expressionObjectName) {
    if (gd::ParameterMetadata::IsExpression("variable", expressionType) &&
        expressionObjectName.empty()) {
      const auto dotPosition = expressionText.find('.');
      if (dotPosition != gd::String::npos) {
        const gd::String rootName = expressionText.substr(0, dotPosition);
        if (objectsContainersList.HasObjectOrGroupNamed(rootName)) {
          const gd::Expression childExpression(
              expressionText.substr(dotPosition + 1));
          return gd::ExpressionCodeGenerator::GenerateExpressionCode(
              codeGenerator, context, "objectvar", childExpression, rootName);
        }
      }
    }
    const gd::Expression expressionObject(expressionText);
    return gd::ExpressionCodeGenerator::GenerateExpressionCode(
        codeGenerator, context, expressionType, expressionObject,
        expressionObjectName);
  };

  const gd::String resultCode = generateCode(type, expression, objectName);

  // The object the expression reads, when it reads one: `Player.Life` names
  // it before the dot, and an object variable is given its object apart.
  const gd::String readObjectName = [&]() -> gd::String {
    if (!objectName.empty()) return objectName;
    if (gd::ParameterMetadata::IsExpression("variable", type)) {
      const auto dotPosition = expression.find('.');
      if (dotPosition != gd::String::npos) {
        const gd::String rootName = expression.substr(0, dotPosition);
        if (objectsContainersList.HasObjectOrGroupNamed(rootName))
          return rootName;
      }
    }
    return gd::String("");
  }();

  // Reading every instance asks the generator for `ObjList[i]` instead of
  // `ObjList[0]`, which it does as soon as an object is the current one. A
  // group never matches the objects it expands to, so it is left out: its
  // count is still reported, and its value stays that of the first instance.
  const bool isEvaluatedForAllInstances =
      evaluateForAllInstances && !readObjectName.empty() &&
      objectsContainersList.HasObjectNamed(readObjectName);
  gd::String instancesCode;
  if (isEvaluatedForAllInstances) {
    context.SetCurrentObject(readObjectName);
    const gd::String perInstanceResultCode =
        generateCode(type, expression, objectName);
    // Back to no current object: the variables below must not depend on the
    // instance being walked.
    context.SetNoCurrentObject();

    const gd::String objectListName =
        codeGenerator.GetObjectListName(readObjectName, context);
    instancesCode = "const gdjsEvaluatedInstances = [];\n"
                    "for (let i = 0, len = Math.min(" +
                    objectListName + ".length, " +
                    gd::String::From(maxEvaluatedInstancesCount) +
                    "); i < len; i++) {\n"
                    "  gdjsEvaluatedInstances.push({ id: " +
                    objectListName + "[i].id, result: " +
                    perInstanceResultCode + " });\n"
                    "}\n";
  }

  // The instances of the object are counted below: its list has to be
  // declared like the ones the expression itself uses, or the generated code
  // reads the length of a list that does not exist.
  const std::vector<gd::String> countedObjectNames =
      readObjectName.empty()
          ? std::vector<gd::String>()
          : objectsContainersList.ExpandObjectName(readObjectName);
  for (const auto& countedObjectName : countedObjectNames) {
    context.ObjectsListNeeded(countedObjectName);
  }

  gd::String variablesCode;
  gd::ExpressionParser2 parser;
  auto rootNode = parser.ParseExpression(expression);
  if (rootNode) {
    ExpressionVariablesCollector collector(
        codeGenerator.GetProjectScopedContainers());
    rootNode->Visit(collector);
    for (const auto& variableExpression : collector.GetVariableExpressions()) {
      variablesCode +=
          EventsCodeGenerator::ConvertToStringExplicit(variableExpression) +
          ": " + generateCode("variable", variableExpression, "") + ",\n";
    }
  }

  // Declare the lists of the objects used by the expressions, filled with
  // all their instances (as an expression outside of an event would be).
  gd::String objectsListsCode = codeNamespace + " = " + codeNamespace + " || {};\n";
  for (const auto& usedObjectName : context.GetObjectsListsToBeDeclared()) {
    const gd::String objectListName =
        codeGenerator.GetObjectListName(usedObjectName, context);
    objectsListsCode += objectListName + " = [];\n";
    objectsListsCode += "gdjs.copyArray(runtimeScene.getObjects(" +
                        EventsCodeGenerator::ConvertToStringExplicit(
                            usedObjectName) +
                        "), " + objectListName + ");\n";
  }

  // How many instances the object has, whether or not each of them is read:
  // it is what tells the user that the value shown is one of several.
  gd::String instancesCountCode = "0";
  {
    gd::String countCode;
    for (const auto& realObjectName : countedObjectNames) {
      if (!countCode.empty()) countCode += " + ";
      // Defensive: a list that ended up not being declared (an object that
      // does not exist anymore, for example) counts for nothing instead of
      // making the whole evaluation fail.
      const gd::String objectListName =
          codeGenerator.GetObjectListName(realObjectName, context);
      countCode += "(" + objectListName + " ? " + objectListName +
                   ".length : 0)";
    }
    if (!countCode.empty()) instancesCountCode = countCode;
  }

  return objectsListsCode + instancesCode + "return { result: " + resultCode +
         ", instancesCount: " + instancesCountCode + ", instances: " +
         (isEvaluatedForAllInstances ? "gdjsEvaluatedInstances" : "null") +
         ", variables: {\n" + variablesCode + "} };\n";
}
gd::String LayoutCodeGenerator::GenerateLayoutCompleteCode(
    const gd::Layout& layout,
    std::set<gd::String>& includeFiles,
      gd::DiagnosticReport& diagnosticReport,
    bool compilationForRuntime) {
  gd::String sceneMangledName =
      gd::SceneNameMangler::Get()->GetMangledSceneName(layout.GetName());
  gd::String codeNamespace = "gdjs." + sceneMangledName + "Code";

  gd::String layoutCode = EventsCodeGenerator::GenerateLayoutCode(
      project,
      layout,
      codeNamespace,
      includeFiles,
      diagnosticReport,
      compilationForRuntime,
      generateEventsExecutionTracking);

  // Export the symbols to avoid them being stripped by the Closure Compiler:
  gd::String exportCode =
      "gdjs['" + sceneMangledName + "Code']" + " = " + codeNamespace + ";\n";

  return layoutCode + "\n" + exportCode;
}

}  // namespace gdjs
