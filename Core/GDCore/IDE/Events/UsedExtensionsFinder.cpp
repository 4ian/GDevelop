#include "UsedExtensionsFinder.h"

#include "GDCore/Events/Instruction.h"
#include "GDCore/Extensions/Metadata/MetadataProvider.h"
#include "GDCore/Extensions/PlatformExtension.h"
#include "GDCore/IDE/WholeProjectRefactorer.h"
#include "GDCore/IDE/Events/ExpressionTypeFinder.h"
#include "GDCore/Project/BehaviorContent.h"
#include "GDCore/Project/Object.h"
#include "GDCore/Project/Project.h"

namespace gd {

std::set<gd::String> UsedExtensionsFinder::ScanProject(gd::Project& project) {
  UsedExtensionsFinder worker(project);
  gd::WholeProjectRefactorer::ExposeProjectObjects(project, worker);
  gd::WholeProjectRefactorer::ExposeProjectEvents(project, worker);
  return worker.usedExtensions;
};

// Objects scanner

void UsedExtensionsFinder::DoVisitObject(gd::Object& object) {
  usedExtensions.insert(gd::MetadataProvider::GetExtensionAndObjectMetadata(
                            project.GetCurrentPlatform(), object.GetType())
                            .GetExtension()
                            .GetName());
};

// Behaviors scanner

void UsedExtensionsFinder::DoVisitBehavior(gd::BehaviorContent& behavior) {
  usedExtensions.insert(
      gd::MetadataProvider::GetExtensionAndBehaviorMetadata(
          project.GetCurrentPlatform(), behavior.GetTypeName())
          .GetExtension()
          .GetName());
};

// Instructions scanner

bool UsedExtensionsFinder::DoVisitInstruction(gd::Instruction& instruction,
                                              bool isCondition) {
  auto metadata =
      isCondition ? gd::MetadataProvider::GetExtensionAndConditionMetadata(
                        project.GetCurrentPlatform(), instruction.GetType())
                  : gd::MetadataProvider::GetExtensionAndActionMetadata(
                        project.GetCurrentPlatform(), instruction.GetType());
  usedExtensions.insert(metadata.GetExtension().GetName());

  size_t i = 0;
  for (auto expression : instruction.GetParameters()) {
    const gd::String& parameterType =
        metadata.GetMetadata().GetParameter(i).GetType();
    i++;

    if (gd::ParameterMetadata::IsExpression("string", parameterType)) {
      rootType = "string";
      expression.GetRootNode()->Visit(*this);
    } else if (gd::ParameterMetadata::IsExpression("number", parameterType)) {
      rootType = "number";
      expression.GetRootNode()->Visit(*this);
    } else if (gd::ParameterMetadata::IsExpression("variable", parameterType))
      usedExtensions.insert("BuiltinVariables");
  }
  return false;
}

// Expressions scanner

// Ignore litterals nodes
void UsedExtensionsFinder::OnVisitNumberNode(NumberNode& node){};
void UsedExtensionsFinder::OnVisitTextNode(TextNode& node){};

// Ignore nodes without valid extensions
void UsedExtensionsFinder::OnVisitEmptyNode(EmptyNode& node){};
void UsedExtensionsFinder::OnVisitObjectFunctionNameNode(
    ObjectFunctionNameNode& node){};

// Visit sub-expressions
void UsedExtensionsFinder::OnVisitSubExpressionNode(SubExpressionNode& node) {
  node.expression->Visit(*this);
};

void UsedExtensionsFinder::OnVisitOperatorNode(OperatorNode& node) {
  node.leftHandSide->Visit(*this);
  node.rightHandSide->Visit(*this);
};

void UsedExtensionsFinder::OnVisitUnaryOperatorNode(UnaryOperatorNode& node) {
  node.factor->Visit(*this);
};

// Add variable extension and visit sub-expressions on variable nodes
void UsedExtensionsFinder::OnVisitVariableNode(VariableNode& node) {
  usedExtensions.insert("BuiltinVariables");
  if (node.child) node.child->Visit(*this);
};

void UsedExtensionsFinder::OnVisitVariableAccessorNode(
    VariableAccessorNode& node) {
  usedExtensions.insert("BuiltinVariables");
  if (node.child) node.child->Visit(*this);
};

void UsedExtensionsFinder::OnVisitVariableBracketAccessorNode(
    VariableBracketAccessorNode& node) {
  usedExtensions.insert("BuiltinVariables");
  node.expression->Visit(*this);
  if (node.child) node.child->Visit(*this);
};

// Add extensions bound to Objects/Behaviors/Functions
void UsedExtensionsFinder::OnVisitIdentifierNode(IdentifierNode& node) {
  auto type = gd::ExpressionTypeFinder::GetType(project.GetCurrentPlatform(), GetGlobalObjectsContainer(), GetObjectsContainer(), rootType, node);
  if (gd::ParameterMetadata::IsObject(type)) {
    usedExtensions.insert(gd::MetadataProvider::GetExtensionAndObjectMetadata(
                              project.GetCurrentPlatform(), node.identifierName)
                              .GetExtension()
                              .GetName());
  }
};

void UsedExtensionsFinder::OnVisitFunctionCallNode(FunctionCallNode& node) {
  // Extensions of non-free functions are already found when scanning objects.
  if (!(node.objectName.empty() && node.behaviorName.empty())) return;
  gd::ExtensionAndMetadata<gd::ExpressionMetadata> metadata;

  // Try to find a free number expression
  metadata = gd::MetadataProvider::GetExtensionAndExpressionMetadata(
      project.GetCurrentPlatform(), node.functionName);
  if (gd::MetadataProvider::IsBadExpressionMetadata(metadata.GetMetadata())) {
    // Try to find a free str expression
    metadata = gd::MetadataProvider::GetExtensionAndStrExpressionMetadata(
        project.GetCurrentPlatform(), node.functionName);
    // No valid expression found, return.
    if (gd::MetadataProvider::IsBadExpressionMetadata(metadata.GetMetadata()))
      return;
  }

  usedExtensions.insert(metadata.GetExtension().GetName());
};

}  // namespace gd
