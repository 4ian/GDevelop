/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */

#ifndef GDCORE_USED_EXTENSIONS_FINDER_H
#define GDCORE_USED_EXTENSIONS_FINDER_H
#include <set>

#include "GDCore/Events/Parsers/ExpressionParser2NodeWorker.h"
#include "GDCore/IDE/Events/ArbitraryEventsWorker.h"
#include "GDCore/IDE/Project/ArbitraryObjectsWorker.h"
#include "GDCore/String.h"

namespace gd {
class Project;
class Object;
class Behavior;
}  // namespace gd

namespace gd {

class GD_CORE_API UsedExtensionsFinder
    : public ArbitraryObjectsWorker,
      public ArbitraryEventsWorkerWithContext,
      public ExpressionParser2NodeWorker {
 public:
  static std::set<gd::String> ScanProject(gd::Project& project);

 private:
  UsedExtensionsFinder(gd::Project& project_) : project(project_){};
  gd::Project& project;
  gd::String rootType;
  std::set<gd::String> usedExtensions;

  // Object Visitor
  void DoVisitObject(gd::Object& object) override;

  // Behavior Visitor
  void DoVisitBehavior(gd::Behavior& behavior) override;

  // Instructions Visitor
  bool DoVisitInstruction(gd::Instruction& instruction,
                          bool isCondition) override;

  // Expression Visitor
  void OnVisitSubExpressionNode(SubExpressionNode& node) override;
  void OnVisitOperatorNode(OperatorNode& node) override;
  void OnVisitUnaryOperatorNode(UnaryOperatorNode& node) override;
  void OnVisitNumberNode(NumberNode& node) override;
  void OnVisitTextNode(TextNode& node) override;
  void OnVisitVariableNode(VariableNode& node) override;
  void OnVisitVariableAccessorNode(VariableAccessorNode& node) override;
  void OnVisitVariableBracketAccessorNode(
      VariableBracketAccessorNode& node) override;
  void OnVisitIdentifierNode(IdentifierNode& node) override;
  void OnVisitObjectFunctionNameNode(ObjectFunctionNameNode& node) override;
  void OnVisitFunctionCallNode(FunctionCallNode& node) override;
  void OnVisitEmptyNode(EmptyNode& node) override;
};

};  // namespace gd

#endif
