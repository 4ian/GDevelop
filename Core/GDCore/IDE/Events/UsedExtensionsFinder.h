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

class GD_CORE_API UsedExtensionsResult {
public:
  /**
   * The extensions used by the project (or part of it).
   */
  const std::set<gd::String> &GetUsedExtensions() const {
    return usedExtensions;
  }

  /**
   * The include files used at runtime by the project (or part of it).
   */
  const std::set<gd::String> &GetUsedIncludeFiles() const {
    return usedIncludeFiles;
  }

  /**
   * The additional files required at runtime by the project (or part of it).
   */
  const std::set<gd::String> &GetUsedRequiredFiles() const {
    return usedRequiredFiles;
  }

  /**
   * \brief Return true when at least 1 object uses the 3D renderer.
   */
  bool Has3DObjects() const {
    return has3DObjects;
  }

  /**
   * The extensions used by the project (or part of it).
   */
  std::set<gd::String> &GetUsedExtensions() { return usedExtensions; }

  /**
   * The include files used at runtime by the project (or part of it).
   */
  std::set<gd::String> &GetUsedIncludeFiles() { return usedIncludeFiles; }

  /**
   * The additional files required at runtime by the project (or part of it).
   */
  std::set<gd::String> &GetUsedRequiredFiles() { return usedRequiredFiles; }

  void MarkAsHaving3DObjects() {
    has3DObjects = true;
  }

private:
  std::set<gd::String> usedExtensions;
  std::set<gd::String> usedIncludeFiles;
  std::set<gd::String> usedRequiredFiles;
  bool has3DObjects = false;
};

class GD_CORE_API UsedExtensionsFinder
    : public ArbitraryObjectsWorker,
      public ArbitraryEventsWorkerWithContext,
      public ExpressionParser2NodeWorker {
 public:
  static const UsedExtensionsResult ScanProject(gd::Project& project);

 private:
  UsedExtensionsFinder(gd::Project& project_) : project(project_){};
  gd::Project& project;
  gd::String rootType;
  UsedExtensionsResult result;

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
