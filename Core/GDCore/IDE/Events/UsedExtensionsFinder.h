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
class BehaviorContent;
}  // namespace gd

namespace gd {

class GD_CORE_API UsedExtensionsFinder
    : public ArbitraryObjectsWorker,
      public ArbitraryEventsWorkerWithContext,
      public ExpressionParser2NodeWorker {
 public:
  static std::set<gd::String> ScanProject(gd::Project& project);

 private:
  UsedExtensionsFinder(gd::Project& _project) { projectPtr = &_project; };
  gd::Project* projectPtr;
  std::set<gd::String> usedExtensions;

  // Object Visitor
  void DoVisitObject(gd::Object& object);

  // Behavior Visitor
  void DoVisitBehavior(gd::BehaviorContent& behavior);

  // Instructions Visitor
  bool DoVisitInstruction(gd::Instruction& instruction, bool isCondition);

  // Expression Visitor
  void OnVisitSubExpressionNode(SubExpressionNode& node);
  void OnVisitOperatorNode(OperatorNode& node);
  void OnVisitUnaryOperatorNode(UnaryOperatorNode& node);
  void OnVisitNumberNode(NumberNode& node);
  void OnVisitTextNode(TextNode& node);
  void OnVisitVariableNode(VariableNode& node);
  void OnVisitVariableAccessorNode(VariableAccessorNode& node);
  void OnVisitVariableBracketAccessorNode(VariableBracketAccessorNode& node);
  void OnVisitIdentifierNode(IdentifierNode& node);
  void OnVisitObjectFunctionNameNode(ObjectFunctionNameNode& node);
  void OnVisitFunctionCallNode(FunctionCallNode& node);
  void OnVisitEmptyNode(EmptyNode& node);
};

};  // namespace gd

#endif
