#include "ExampleExtensionUsagesFinder.h"

#include "GDCore/Events/Instruction.h"
#include "GDCore/Extensions/Metadata/MetadataProvider.h"
#include "GDCore/Extensions/Metadata/ParameterMetadataTools.h"
#include "GDCore/Extensions/PlatformExtension.h"
#include "GDCore/IDE/Events/ExpressionTypeFinder.h"
#include "GDCore/IDE/ProjectBrowserHelper.h"
#include "GDCore/IDE/WholeProjectRefactorer.h"
#include "GDCore/Project/Behavior.h"
#include "GDCore/Project/EventsFunctionsExtension.h"
#include "GDCore/Project/Object.h"
#include "GDCore/Project/Project.h"

namespace gd {

std::set<gd::String>
ExampleExtensionUsagesFinder::GetUsedExtensions(gd::Project &project) {
  ExampleExtensionUsagesFinder worker(project);
  gd::ProjectBrowserHelper::ExposeProjectObjects(project, worker);
  gd::ProjectBrowserHelper::ExposeProjectEventsWithoutExtensions(project,
                                                                 worker);

  for (std::size_t e = 0; e < project.GetEventsFunctionsExtensionsCount();
       e++) {
    auto &eventsFunctionsExtension = project.GetEventsFunctionsExtension(e);
    worker.isStoreExtension =
        eventsFunctionsExtension.GetOriginName() == "gdevelop-extension-store";
    ProjectBrowserHelper::ExposeEventsFunctionsExtensionEvents(
        project, eventsFunctionsExtension, worker);
  }
  if (!worker.has3DObjects) {
    worker.usedExtensions.erase("Scene3D");
  }
  return worker.usedExtensions;
};

void ExampleExtensionUsagesFinder::AddUsedExtension(
    const gd::PlatformExtension &extension) {
  usedExtensions.insert(extension.GetName());
}

void ExampleExtensionUsagesFinder::AddUsedBuiltinExtension(
    const gd::String &extensionName) {
  usedExtensions.insert(extensionName);
}

// Objects scanner

void ExampleExtensionUsagesFinder::DoVisitObject(gd::Object &object) {
  auto metadata = gd::MetadataProvider::GetExtensionAndObjectMetadata(
      project.GetCurrentPlatform(), object.GetType());
  if (metadata.GetMetadata().IsRenderedIn3D()) {
    has3DObjects = true;
  }
  AddUsedExtension(metadata.GetExtension());
};

// Behaviors scanner

void ExampleExtensionUsagesFinder::DoVisitBehavior(gd::Behavior &behavior) {
  auto metadata = gd::MetadataProvider::GetExtensionAndBehaviorMetadata(
      project.GetCurrentPlatform(), behavior.GetTypeName());
  AddUsedExtension(metadata.GetExtension());
};

// Instructions scanner

bool ExampleExtensionUsagesFinder::DoVisitInstruction(
    gd::Instruction &instruction, bool isCondition) {
  auto metadata =
      isCondition ? gd::MetadataProvider::GetExtensionAndConditionMetadata(
                        project.GetCurrentPlatform(), instruction.GetType())
                  : gd::MetadataProvider::GetExtensionAndActionMetadata(
                        project.GetCurrentPlatform(), instruction.GetType());
  // Unused event-based objects or events-based behaviors may use object and
  // behavior instructions that should not be detected as extension usage.
  // The extension of actually used objects and behaviors will be detected on
  // scene objects. This is why object or behavior instructions usually don't
  // have any import.
  // Built-in extensions that are included by default don't declare any include
  // files on their instructions either. To still detect their usage, we
  // consider that main events and dedicated extensions can't have dead code.
  if (!isStoreExtension || !metadata.GetMetadata().GetIncludeFiles().empty()) {
    AddUsedExtension(metadata.GetExtension());
  }

  gd::ParameterMetadataTools::IterateOverParameters(
      instruction.GetParameters(), metadata.GetMetadata().GetParameters(),
      [this](const gd::ParameterMetadata &parameterMetadata,
             const gd::Expression &parameterValue,
             const gd::String &lastObjectName) {
        const gd::String &parameterType = parameterMetadata.GetType();

        if (gd::ParameterMetadata::IsExpression("string", parameterType)) {
          rootType = "string";
          parameterValue.GetRootNode()->Visit(*this);
        } else if (gd::ParameterMetadata::IsExpression("number",
                                                       parameterType)) {
          rootType = "number";
          parameterValue.GetRootNode()->Visit(*this);
        } else if (gd::ParameterMetadata::IsExpression("variable",
                                                       parameterType))
          AddUsedBuiltinExtension("BuiltinVariables");
      });

  return false;
}

// Expressions scanner

// Ignore literals nodes
void ExampleExtensionUsagesFinder::OnVisitNumberNode(NumberNode &node){};
void ExampleExtensionUsagesFinder::OnVisitTextNode(TextNode &node){};

// Ignore nodes without valid extensions
void ExampleExtensionUsagesFinder::OnVisitEmptyNode(EmptyNode &node){};
void ExampleExtensionUsagesFinder::OnVisitObjectFunctionNameNode(
    ObjectFunctionNameNode &node){};

// Visit sub-expressions
void ExampleExtensionUsagesFinder::OnVisitSubExpressionNode(
    SubExpressionNode &node) {
  node.expression->Visit(*this);
};

void ExampleExtensionUsagesFinder::OnVisitOperatorNode(OperatorNode &node) {
  node.leftHandSide->Visit(*this);
  node.rightHandSide->Visit(*this);
};

void ExampleExtensionUsagesFinder::OnVisitUnaryOperatorNode(
    UnaryOperatorNode &node) {
  node.factor->Visit(*this);
};

// Add variable extension and visit sub-expressions on variable nodes
void ExampleExtensionUsagesFinder::OnVisitVariableNode(VariableNode &node) {
  AddUsedBuiltinExtension("BuiltinVariables");

  auto type = gd::ExpressionTypeFinder::GetType(project.GetCurrentPlatform(),
                                                GetProjectScopedContainers(),
                                                rootType, node);

  if (gd::ParameterMetadata::IsExpression("variable", type)) {
    // Nothing to do (this can't reference an object)
  } else {
    GetProjectScopedContainers().MatchIdentifierWithName<void>(
        node.name,
        [&]() {
          // This represents an object.
          auto metadata = gd::MetadataProvider::GetExtensionAndObjectMetadata(
              project.GetCurrentPlatform(), node.name);
          AddUsedExtension(metadata.GetExtension());
        },
        [&]() {
          // This is a variable.
        },
        [&]() {
          // This is a property.
        },
        [&]() {
          // This is a parameter.
        },
        [&]() {
          // This is something else.
        });
  }

  if (node.child)
    node.child->Visit(*this);
};

void ExampleExtensionUsagesFinder::OnVisitVariableAccessorNode(
    VariableAccessorNode &node) {
  AddUsedBuiltinExtension("BuiltinVariables");
  if (node.child)
    node.child->Visit(*this);
};

void ExampleExtensionUsagesFinder::OnVisitVariableBracketAccessorNode(
    VariableBracketAccessorNode &node) {
  AddUsedBuiltinExtension("BuiltinVariables");
  node.expression->Visit(*this);
  if (node.child)
    node.child->Visit(*this);
};

// Add extensions bound to Objects/Behaviors/Functions
void ExampleExtensionUsagesFinder::OnVisitIdentifierNode(IdentifierNode &node) {
  auto type = gd::ExpressionTypeFinder::GetType(project.GetCurrentPlatform(),
                                                GetProjectScopedContainers(),
                                                rootType, node);
  if (gd::ParameterMetadata::IsObject(type) ||
      GetObjectsContainersList().HasObjectOrGroupNamed(node.identifierName)) {
    // An object or object variable is used.
    auto metadata = gd::MetadataProvider::GetExtensionAndObjectMetadata(
        project.GetCurrentPlatform(), node.identifierName);
    AddUsedExtension(metadata.GetExtension());
  }
};

void ExampleExtensionUsagesFinder::OnVisitFunctionCallNode(
    FunctionCallNode &node) {
  // Extensions of non-free functions are already found when scanning objects.
  if (!(node.objectName.empty() && node.behaviorName.empty()))
    return;
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

  // Unused event-based objects or events-based behaviors may use object and
  // behavior expressions that should not be detected as extension usage.
  // The extension of actually used objects and behaviors will be detected on
  // scene objects. This is why object or behavior expressions usually don't
  // have any import.
  // Built-in extensions that are included by default don't declare any include
  // files on their instructions either. To still detect their usage, we
  // consider that main events and dedicated extensions can't have dead code.
  if (!isStoreExtension || !metadata.GetMetadata().GetIncludeFiles().empty()) {
    AddUsedExtension(metadata.GetExtension());
  }
};

} // namespace gd
