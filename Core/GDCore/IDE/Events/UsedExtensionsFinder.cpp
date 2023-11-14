#include "UsedExtensionsFinder.h"

#include "GDCore/Events/Instruction.h"
#include "GDCore/Extensions/Metadata/MetadataProvider.h"
#include "GDCore/Extensions/Metadata/ParameterMetadataTools.h"
#include "GDCore/Extensions/PlatformExtension.h"
#include "GDCore/IDE/ProjectBrowserHelper.h"
#include "GDCore/IDE/WholeProjectRefactorer.h"
#include "GDCore/IDE/Events/ExpressionTypeFinder.h"
#include "GDCore/Project/Behavior.h"
#include "GDCore/Project/Object.h"
#include "GDCore/Project/Project.h"

namespace gd {

const UsedExtensionsResult UsedExtensionsFinder::ScanProject(gd::Project& project) {
  UsedExtensionsFinder worker(project);
  gd::ProjectBrowserHelper::ExposeProjectObjects(project, worker);
  gd::ProjectBrowserHelper::ExposeProjectEvents(project, worker);
  return worker.result;
};

// Objects scanner

void UsedExtensionsFinder::DoVisitObject(gd::Object &object) {
  auto metadata = gd::MetadataProvider::GetExtensionAndObjectMetadata(
      project.GetCurrentPlatform(), object.GetType());
  if (metadata.GetMetadata().IsRenderedIn3D()) {
    result.MarkAsHaving3DObjects();
  }
  result.GetUsedExtensions().insert(metadata.GetExtension().GetName());
  for (auto &&includeFile : metadata.GetMetadata().includeFiles) {
    result.GetUsedIncludeFiles().insert(includeFile);
  }
};

// Behaviors scanner

void UsedExtensionsFinder::DoVisitBehavior(gd::Behavior &behavior) {
  auto metadata = gd::MetadataProvider::GetExtensionAndBehaviorMetadata(
      project.GetCurrentPlatform(), behavior.GetTypeName());
  result.GetUsedExtensions().insert(metadata.GetExtension().GetName());
  for (auto &&includeFile : metadata.GetMetadata().includeFiles) {
    result.GetUsedIncludeFiles().insert(includeFile);
  }
  for (auto &&includeFile : metadata.GetMetadata().requiredFiles) {
    result.GetUsedRequiredFiles().insert(includeFile);
  }
};

// Instructions scanner

bool UsedExtensionsFinder::DoVisitInstruction(gd::Instruction& instruction,
                                              bool isCondition) {
  auto metadata =
      isCondition ? gd::MetadataProvider::GetExtensionAndConditionMetadata(
                        project.GetCurrentPlatform(), instruction.GetType())
                  : gd::MetadataProvider::GetExtensionAndActionMetadata(
                        project.GetCurrentPlatform(), instruction.GetType());
  result.GetUsedExtensions().insert(metadata.GetExtension().GetName());
  for (auto&& includeFile : metadata.GetMetadata().GetIncludeFiles()) {
    result.GetUsedIncludeFiles().insert(includeFile);
  }

  gd::ParameterMetadataTools::IterateOverParameters(
      instruction.GetParameters(),
      metadata.GetMetadata().GetParameters(),
      [this](const gd::ParameterMetadata& parameterMetadata,
          const gd::Expression& parameterValue,
          const gd::String& lastObjectName) {
    const gd::String& parameterType = parameterMetadata.GetType();

    if (gd::ParameterMetadata::IsExpression("string", parameterType)) {
      rootType = "string";
      parameterValue.GetRootNode()->Visit(*this);
    } else if (gd::ParameterMetadata::IsExpression("number", parameterType)) {
      rootType = "number";
      parameterValue.GetRootNode()->Visit(*this);
    } else if (gd::ParameterMetadata::IsExpression("variable", parameterType))
      result.GetUsedExtensions().insert("BuiltinVariables");
  });

  return false;
}

// Expressions scanner

// Ignore literals nodes
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
  result.GetUsedExtensions().insert("BuiltinVariables");

  auto type = gd::ExpressionTypeFinder::GetType(
      project.GetCurrentPlatform(), GetProjectScopedContainers(), rootType, node);

  if (gd::ParameterMetadata::IsExpression("variable", type)) {
    // Nothing to do (this can't reference an object)
  } else {
    GetProjectScopedContainers().MatchIdentifierWithName<void>(node.name,
      [&]() {
        // This represents an object.
        auto metadata = gd::MetadataProvider::GetExtensionAndObjectMetadata(
          project.GetCurrentPlatform(), node.name);
        result.GetUsedExtensions().insert(metadata.GetExtension().GetName());
        for (auto &&includeFile : metadata.GetMetadata().includeFiles) {
          result.GetUsedIncludeFiles().insert(includeFile);
        }
      }, [&]() {
        // This is a variable.
      }, [&]() {
        // This is a property.
      }, [&]() {
        // This is a parameter.
      }, [&]() {
        // This is something else.
      });
  }

  if (node.child) node.child->Visit(*this);
};

void UsedExtensionsFinder::OnVisitVariableAccessorNode(
    VariableAccessorNode& node) {
  result.GetUsedExtensions().insert("BuiltinVariables");
  if (node.child) node.child->Visit(*this);
};

void UsedExtensionsFinder::OnVisitVariableBracketAccessorNode(
    VariableBracketAccessorNode& node) {
  result.GetUsedExtensions().insert("BuiltinVariables");
  node.expression->Visit(*this);
  if (node.child) node.child->Visit(*this);
};

// Add extensions bound to Objects/Behaviors/Functions
void UsedExtensionsFinder::OnVisitIdentifierNode(IdentifierNode &node) {
  auto type = gd::ExpressionTypeFinder::GetType(
      project.GetCurrentPlatform(), GetProjectScopedContainers(), rootType, node);
  if (gd::ParameterMetadata::IsObject(type) ||
      GetObjectsContainersList().HasObjectOrGroupNamed(node.identifierName)) {
    // An object or object variable is used.
    auto metadata = gd::MetadataProvider::GetExtensionAndObjectMetadata(
        project.GetCurrentPlatform(), node.identifierName);
    result.GetUsedExtensions().insert(metadata.GetExtension().GetName());
    for (auto &&includeFile : metadata.GetMetadata().includeFiles) {
      result.GetUsedIncludeFiles().insert(includeFile);
    }
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

  result.GetUsedExtensions().insert(metadata.GetExtension().GetName());
  for (auto&& includeFile : metadata.GetMetadata().GetIncludeFiles()) {
    result.GetUsedIncludeFiles().insert(includeFile);
  }
};

}  // namespace gd
