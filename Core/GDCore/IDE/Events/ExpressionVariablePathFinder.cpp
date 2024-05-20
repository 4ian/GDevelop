/*
 * GDevelop Core
 * Copyright 2008-present Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "ExpressionVariablePathFinder.h"

#include "GDCore/Extensions/Metadata/MetadataProvider.h"

namespace gd {

/**
 * \brief Find the pre-scoped container of legacy variables or the object name
 * from the function call node.
 */
class GD_CORE_API ExpressionLiteralFinder : public ExpressionParser2NodeWorker {
public:
  virtual ~ExpressionLiteralFinder(){};

  gd::String literalValue;

  ExpressionLiteralFinder() : literalValue(""){};

protected:
  void OnVisitSubExpressionNode(SubExpressionNode &node) override {}
  void OnVisitOperatorNode(OperatorNode &node) override {}
  void OnVisitUnaryOperatorNode(UnaryOperatorNode &node) override {}
  void OnVisitNumberNode(NumberNode &node) override {
    literalValue = node.number;
  }
  void OnVisitTextNode(TextNode &node) override { literalValue = node.text; }
  void OnVisitVariableNode(VariableNode &node) override {}
  void OnVisitVariableAccessorNode(VariableAccessorNode &node) override {}
  void OnVisitIdentifierNode(IdentifierNode &node) override {}
  void OnVisitEmptyNode(EmptyNode &node) override {}
  void OnVisitObjectFunctionNameNode(ObjectFunctionNameNode &node) override {}
  void OnVisitVariableBracketAccessorNode(
      VariableBracketAccessorNode &node) override {}
  void OnVisitFunctionCallNode(FunctionCallNode &functionCall) override {}
};

void ExpressionVariablePathFinder::OnVisitVariableBracketAccessorNode(
    VariableBracketAccessorNode &node) {
  // Try to find a literal accessor or add a child with an empty name, which
  // will be interpreted as "take the first child/item of the structure/array".
  gd::ExpressionLiteralFinder expressionLiteralFinder;
  if (node.expression) {
    node.expression->Visit(expressionLiteralFinder);
  }
  childVariableNames.push_back(expressionLiteralFinder.literalValue);

  if (node.child && &node != lastNodeToCheck) {
    node.child->Visit(*this);
  }
}

/**
 * \brief Find the pre-scoped container of legacy variables or the object name
 * from the function call node.
 */
class GD_CORE_API ExpressionVariableContextFinder
    : public ExpressionParser2NodeWorker {
 public:

  virtual ~ExpressionVariableContextFinder(){};

  gd::String objectName;
  gd::String parameterType;
  gd::ExpressionNode* variableNode;

  ExpressionVariableContextFinder(
      const gd::Platform& platform_,
      const gd::ProjectScopedContainers& projectScopedContainers_)
      : platform(platform_),
        projectScopedContainers(projectScopedContainers_),
        variableNode(nullptr),
        objectName(""),
        parameterType("") {};

 protected:
  void OnVisitSubExpressionNode(SubExpressionNode& node) override {}
  void OnVisitOperatorNode(OperatorNode& node) override {}
  void OnVisitUnaryOperatorNode(UnaryOperatorNode& node) override {}
  void OnVisitNumberNode(NumberNode& node) override {}
  void OnVisitTextNode(TextNode& node) override {}
  void OnVisitVariableNode(VariableNode& node) override {
    if (variableNode) {
      // This is not possible
      return;
    }
    variableNode = &node;

    // Check if the parent is a function call, in which we might be dealing
    // with a legacy pre-scoped variable parameter:
    if (node.parent) node.parent->Visit(*this);
  }
  void OnVisitVariableAccessorNode(VariableAccessorNode& node) override {
    if (node.parent) node.parent->Visit(*this);
  }
  void OnVisitIdentifierNode(IdentifierNode& node) override {
    if (variableNode) {
      // This is not possible
      return;
    }
    // This node is not necessarily a variable node.
    // It will be checked when visiting the FunctionCallNode, just after.
    variableNode = &node;

    // Check if the parent is a function call, in which we might be dealing
    // with a legacy pre-scoped variable parameter:
    if (node.parent) node.parent->Visit(*this);
  }
  void OnVisitEmptyNode(EmptyNode& node) override {}
  void OnVisitObjectFunctionNameNode(ObjectFunctionNameNode& node) override {}
  void OnVisitVariableBracketAccessorNode(
      VariableBracketAccessorNode& node) override {
    if (node.parent) node.parent->Visit(*this);
      }
  void OnVisitFunctionCallNode(FunctionCallNode& functionCall) override {
    int parameterIndex = -1;
    for (int i = 0; i < functionCall.parameters.size(); i++) {
      if (functionCall.parameters.at(i).get() == variableNode) {
        parameterIndex = i;
        break;
      }
    }
    if (parameterIndex < 0) {
      return;
    }

    const auto& objectsContainersList =
        projectScopedContainers.GetObjectsContainersList();

    const gd::ParameterMetadata* parameterMetadata =
        MetadataProvider::GetFunctionCallParameterMetadata(
            platform, objectsContainersList, functionCall, parameterIndex);
    if (parameterMetadata == nullptr) return;  // Unexpected

    if (parameterMetadata->GetType() == "objectvar") {
      // Legacy convention where a "objectvar"
      // parameter represents a variable of the object represented by the
      // previous "object" parameter. The object on which the function is
      // called is returned if no previous parameters are objects.
      objectName = functionCall.objectName;
      for (int previousIndex = parameterIndex - 1; previousIndex >= 0;
            previousIndex--) {
        const gd::ParameterMetadata* previousParameterMetadata =
            MetadataProvider::GetFunctionCallParameterMetadata(
                platform, objectsContainersList, functionCall, previousIndex);
        if (previousParameterMetadata != nullptr &&
            gd::ParameterMetadata::IsObject(
                previousParameterMetadata->GetType())) {
          auto previousParameterNode =
              functionCall.parameters[previousIndex].get();
          IdentifierNode* objectNode =
              dynamic_cast<IdentifierNode*>(previousParameterNode);
          objectName = objectNode->identifierName;
          break;
        }
      }
      parameterType = parameterMetadata->GetType();
    }
  }

 private:
  const gd::Platform& platform;
  const gd::ProjectScopedContainers& projectScopedContainers;

};

VariableAndItsParent ExpressionVariablePathFinder::GetLastParentOfNode(
    const gd::Platform &platform,
    const gd::ProjectScopedContainers &projectScopedContainers,
    gd::ExpressionNode &node) {

  gd::ExpressionVariableContextFinder contextFinder(platform,
                                                    projectScopedContainers);
  node.Visit(contextFinder);
  if (!contextFinder.variableNode) {
    return {};
  }

  gd::ExpressionVariablePathFinder typeFinder(platform, projectScopedContainers,
                                              contextFinder.parameterType,
                                              contextFinder.objectName, &node);
  contextFinder.variableNode->Visit(typeFinder);

  if (typeFinder.variableName.empty() || !typeFinder.variablesContainer) {
    return {};
  }
  return typeFinder.WalkUntilLastParent(*typeFinder.variablesContainer,
                                        typeFinder.childVariableNames);
}

}  // namespace gd
