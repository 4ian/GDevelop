/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */

#pragma once

#include <set>

#include "GDCore/Events/Parsers/ExpressionParser2NodeWorker.h"
#include "GDCore/Extensions/Metadata/SourceFileMetadata.h"
#include "GDCore/Extensions/PlatformExtension.h"
#include "GDCore/IDE/Events/ArbitraryEventsWorker.h"
#include "GDCore/IDE/Project/ArbitraryObjectsWorker.h"
#include "GDCore/String.h"

namespace gd {
class Project;
class Object;
class Behavior;
} // namespace gd

namespace gd {

/**
 * @brief List extension usages for generated example web-pages.
 * 
 * Dependency transitivity is not ensured (see UsedExtensionsFinder).
 */
class GD_CORE_API ExampleExtensionUsagesFinder
    : public ArbitraryObjectsWorker,
      public ArbitraryEventsWorkerWithContext,
      public ExpressionParser2NodeWorker {
public:
  static std::set<gd::String> GetUsedExtensions(gd::Project &project);

private:
  ExampleExtensionUsagesFinder(gd::Project &project_) : project(project_){};
  gd::Project &project;
  gd::String rootType;
  bool isStoreExtension = false;

  // Result
  std::set<gd::String> usedExtensions;
  bool has3DObjects = false;

  void AddUsedExtension(const gd::PlatformExtension &extension);
  void AddUsedBuiltinExtension(const gd::String &extensionName);

  // Object Visitor
  void DoVisitObject(gd::Object &object) override;

  // Behavior Visitor
  void DoVisitBehavior(gd::Behavior &behavior) override;

  // Instructions Visitor
  bool DoVisitInstruction(gd::Instruction &instruction,
                          bool isCondition) override;

  // Expression Visitor
  void OnVisitSubExpressionNode(SubExpressionNode &node) override;
  void OnVisitOperatorNode(OperatorNode &node) override;
  void OnVisitUnaryOperatorNode(UnaryOperatorNode &node) override;
  void OnVisitNumberNode(NumberNode &node) override;
  void OnVisitTextNode(TextNode &node) override;
  void OnVisitVariableNode(VariableNode &node) override;
  void OnVisitVariableAccessorNode(VariableAccessorNode &node) override;
  void OnVisitVariableBracketAccessorNode(
      VariableBracketAccessorNode &node) override;
  void OnVisitIdentifierNode(IdentifierNode &node) override;
  void OnVisitObjectFunctionNameNode(ObjectFunctionNameNode &node) override;
  void OnVisitFunctionCallNode(FunctionCallNode &node) override;
  void OnVisitEmptyNode(EmptyNode &node) override;
};

}; // namespace gd
