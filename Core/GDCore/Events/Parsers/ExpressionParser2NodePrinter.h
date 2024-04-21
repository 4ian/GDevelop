/*
 * GDevelop Core
 * Copyright 2008-present Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#ifndef GDCORE_EXPRESSIONNODEPRINTER_H
#define GDCORE_EXPRESSIONNODEPRINTER_H

#include <memory>
#include <vector>

#include "GDCore/Events/Parsers/ExpressionParser2Node.h"
#include "GDCore/Events/Parsers/ExpressionParser2NodeWorker.h"
namespace gd {
class Expression;
class ObjectsContainer;
class Platform;
class ParameterMetadata;
class ExpressionMetadata;
}  // namespace gd

namespace gd {

/**
 * \brief Print the expression corresponding to a set of nodes
 * (i.e: this is doing the inverse operation of gd::ExpressionParser2).
 *
 * \see gd::ExpressionParser2
 */
class GD_CORE_API ExpressionParser2NodePrinter
    : public ExpressionParser2NodeWorker {
 public:
  ExpressionParser2NodePrinter(){};
  virtual ~ExpressionParser2NodePrinter(){};

  static gd::String PrintNode(gd::ExpressionNode& node) {
    gd::ExpressionParser2NodePrinter printer;
    node.Visit(printer);
    return printer.GetOutput();
  }

  /**
   * \brief Get the string corresponding to the expression nodes.
   */
  const gd::String& GetOutput() { return output; };

  static gd::String PrintStringLiteral(const gd::String& str) {
    return "\"" +
           str.FindAndReplace("\\", "\\\\").FindAndReplace("\"", "\\\"") + "\"";
  }

 protected:
  void OnVisitSubExpressionNode(SubExpressionNode& node) override {
    output += "(";
    node.expression->Visit(*this);
    output += ")";
  }
  void OnVisitOperatorNode(OperatorNode& node) override {
    node.leftHandSide->Visit(*this);
    if (node.op == ' ') {
      // There is no "space" operator. If it's there, it's because
      // an operator could not be found (that's an error). Add only
      // a whitespace between terms.
      output += " ";
    } else {
      output += " ";
      output.push_back(node.op);
      output += " ";
    }
    node.rightHandSide->Visit(*this);
  }
  void OnVisitUnaryOperatorNode(UnaryOperatorNode& node) override {
    output.push_back(node.op);
    node.factor->Visit(*this);
  }
  void OnVisitNumberNode(NumberNode& node) override { output += node.number; }
  void OnVisitTextNode(TextNode& node) override {
    output += PrintStringLiteral(node.text);
  }
  void OnVisitVariableNode(VariableNode& node) override {
    output += node.name;
    if (node.child) node.child->Visit(*this);
  }
  void OnVisitVariableAccessorNode(VariableAccessorNode& node) override {
    output += "." + node.name;
    if (node.child) node.child->Visit(*this);
  }
  void OnVisitVariableBracketAccessorNode(
      VariableBracketAccessorNode& node) override {
    output += "[";
    node.expression->Visit(*this);
    output += "]";
    if (node.child) node.child->Visit(*this);
  }
  void OnVisitIdentifierNode(IdentifierNode& node) override {
    output += node.identifierName;
    if (!node.childIdentifierName.empty()) {
      output += "." + node.childIdentifierName;
    }
  }
  void OnVisitObjectFunctionNameNode(ObjectFunctionNameNode& node) override {
    if (!node.behaviorFunctionName.empty()) {
      output += node.objectName + "." + node.objectFunctionOrBehaviorName +
                "::" + node.behaviorFunctionName;
    } else {
      output += node.objectName + "." + node.objectFunctionOrBehaviorName;
    }
  };
  void OnVisitFunctionCallNode(FunctionCallNode& node) override {
    if (!node.behaviorName.empty()) {
      output +=
          node.objectName + "." + node.behaviorName + "::" + node.functionName;
    } else if (!node.objectName.empty()) {
      output += node.objectName + "." + node.functionName;
    } else {
      output += node.functionName;
    }

    output += "(";

    bool isFirst = true;
    for (auto& parameterNode : node.parameters) {
      if (!isFirst) output += ", ";
      parameterNode->Visit(*this);
      isFirst = false;
    }

    output += ")";
  }
  void OnVisitEmptyNode(EmptyNode& node) override { output += node.text; }

 private:
  gd::String output;
};

}  // namespace gd

#endif  // GDCORE_EXPRESSIONNODEPRINTER_H
