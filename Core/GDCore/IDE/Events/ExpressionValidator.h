/*
 * GDevelop Core
 * Copyright 2008-present Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#ifndef GDCORE_EXPRESSIONVALIDATOR_H
#define GDCORE_EXPRESSIONVALIDATOR_H

#include <memory>
#include <vector>
#include "GDCore/Events/Parsers/ExpressionParser2Node.h"
#include "GDCore/Events/Parsers/ExpressionParser2NodeWorker.h"
#include "GDCore/Tools/Localization.h"

namespace gd {
class Expression;
class ObjectsContainer;
class Platform;
class ParameterMetadata;
class ExpressionMetadata;
}  // namespace gd

namespace gd {

/**
 * \brief Validate that an expression is properly written by returning
 * any error attached to the nodes during parsing.
 *
 * \see gd::ExpressionParser2
 */
class GD_CORE_API ExpressionValidator : public ExpressionParser2NodeWorker {
 public:
  ExpressionValidator(const gd::Platform &platform_,
                      const gd::ObjectsContainer &globalObjectsContainer_,
                      const gd::ObjectsContainer &objectsContainer_,
                      const gd::String &type_)
      : platform(platform_),
        globalObjectsContainer(globalObjectsContainer_),
        objectsContainer(objectsContainer_),
        parentType(&type_) ,
        childType(nullptr) {};
  virtual ~ExpressionValidator(){};

  /**
   * \brief Helper function to check if a given node does not contain
   * any error.
   */
  static bool HasNoErrors(const gd::Platform &platform_,
                      const gd::ObjectsContainer &globalObjectsContainer_,
                      const gd::ObjectsContainer &objectsContainer_,
                      gd::ExpressionNode& node,
                      const gd::String &type) {
    gd::ExpressionValidator validator(platform_, globalObjectsContainer_, objectsContainer_, type);
    node.Visit(validator);
    return validator.GetErrors().empty();
  }

  /**
   * \brief Get all the errors
   *
   * No errors means that the expression is valid.
   */
  const std::vector<ExpressionParserDiagnostic*>& GetErrors() {
    return errors;
  };

 protected:
  void OnVisitSubExpressionNode(SubExpressionNode& node) override {
    ReportAnyError(node);
    node.expression->Visit(*this);
  }
  void OnVisitOperatorNode(OperatorNode& node) override {
    node.leftHandSide->Visit(*this);
    const gd::String &leftType = *childType;
    ReportAnyError(node);

    if (leftType == "string") {
      if (node.op != '+') {
      errors.push_back(RaiseOperatorError(
          _("You've used an operator that is not supported. Only + can be used "
            "to concatenate texts."),
            node.rightHandSide->location).get());
      }
    } else if (gd::ParameterMetadata::IsObject(leftType)) {
      errors.push_back(RaiseOperatorError(
          _("Operators (+, -, /, *) can't be used with an object name. Remove "
            "the operator."),
            node.rightHandSide->location).get());
    } else if (gd::ParameterMetadata::IsExpression("variable", leftType)) {
      errors.push_back(RaiseOperatorError(
          _("Operators (+, -, /, *) can't be used in variable names. Remove "
            "the operator from the variable name."),
            node.rightHandSide->location).get());
    }

    node.rightHandSide->Visit(*this);
    const gd::String &rightType = *childType;

    if (rightType == "string") {
      if (leftType == "number") {
        errors.push_back(RaiseTypeError(_("You entered a text, but a number was expected."),
                           node.rightHandSide->location).get());
        childType = &String("number|string");
      }
      else if (leftType != "string" && leftType != "number|string") {
        errors.push_back(RaiseTypeError(
            _("You entered a text, but this type was expected:") + leftType,
            node.rightHandSide->location).get());
        childType = &String("unknown");
      }
    }
    else if (rightType == "number") {
      if (leftType == "string") {
        errors.push_back(RaiseTypeError(
            _("You entered a number, but a text was expected (in quotes)."),
            node.rightHandSide->location).get());
        childType = &String("number|string");
      }
      else if (leftType != "number" && leftType != "number|string") {
        errors.push_back(RaiseTypeError(
            _("You entered a number, but this type was expected:") + leftType,
            node.rightHandSide->location).get());
        childType = &String("unknown");
      }
    }
    else if (rightType == "variable|identifier") {
      if (leftType == "string") {
        errors.push_back(RaiseTypeError(_("You must wrap your text inside double quotes "
                             "(example: \"Hello world\")."),
                           node.rightHandSide->location.GetStartPosition()).get());
      }
      else if (leftType == "number") {
        errors.push_back(RaiseTypeError(
            _("You must enter a number."), node.rightHandSide->location.GetStartPosition()).get());
      }
      else if (leftType == "number|string") {
        errors.push_back(RaiseTypeError(
            _("You must enter a number or a text, wrapped inside double quotes "
              "(example: \"Hello world\")."),
            node.rightHandSide->location).get());
      }
      else if (!gd::ParameterMetadata::IsObject(leftType)) {
        errors.push_back(RaiseTypeError(
            _("You've entered a name, but this type was expected:") + leftType,
            node.rightHandSide->location).get());
      }
      childType = &String("unknown");
    }
  }
  void OnVisitUnaryOperatorNode(UnaryOperatorNode& node) override {
    ReportAnyError(node);
    node.factor->Visit(*this);
    const gd::String &rightType = *childType;

    if (rightType == "number") {
      if (node.op != '+' && node.op != '-') {
        errors.push_back(RaiseTypeError(
          _("You've used an \"unary\" operator that is not supported. Operator "
            "should be "
            "either + or -."),
          node.factor->location).get());
        childType = &String("unknown");
      }
    } else if (rightType == "string") {
      errors.push_back(RaiseTypeError(
          _("You've used an operator that is not supported. Only + can be used "
            "to concatenate texts, and must be placed between two texts (or "
            "expressions)."),
          node.factor->location).get());
      childType = &String("unknown");
    } else if (gd::ParameterMetadata::IsObject(rightType)) {
      errors.push_back(RaiseTypeError(
          _("Operators (+, -) can't be used with an object name. Remove the "
            "operator."),
          node.factor->location).get());
      childType = &String("unknown");
    } else if (gd::ParameterMetadata::IsExpression("variable", rightType)) {
      errors.push_back(RaiseTypeError(
          _("Operators (+, -) can't be used in variable names. Remove "
            "the operator from the variable name."),
          node.factor->location).get());
      childType = &String("unknown");
    }
  }
  void OnVisitNumberNode(NumberNode& node) override {
    ReportAnyError(node);
    childType = &gd::String("number");
  }
  void OnVisitTextNode(TextNode& node) override {
    ReportAnyError(node);
    childType = &gd::String("string");
  }
  void OnVisitVariableNode(VariableNode& node) override {
    ReportAnyError(node);
    if (node.child) {
      node.child->Visit(*this);
    }
    childType = &gd::String("variable");
  }
  void OnVisitVariableAccessorNode(VariableAccessorNode& node) override {
    ReportAnyError(node);
    if (node.child) node.child->Visit(*this);
  }
  void OnVisitVariableBracketAccessorNode(
      VariableBracketAccessorNode& node) override {
    ReportAnyError(node);
    node.expression->Visit(*this);
    if (node.child) node.child->Visit(*this);
  }
  void OnVisitIdentifierNode(IdentifierNode& node) override {
    ReportAnyError(node);
    childType = &gd::String("identifier");
  }
  void OnVisitObjectFunctionNameNode(ObjectFunctionNameNode& node) override {
    ReportAnyError(node);
  }
  void OnVisitFunctionCallNode(FunctionCallNode& node) override {
    childType = &ValidateFunction(node);
  }
  void OnVisitEmptyNode(EmptyNode& node) override {
    ReportAnyError(node);
    childType = &gd::String("empty");
  }

 private:
  const gd::String& ExpressionValidator::ValidateFunction(const gd::FunctionCallNode& function);

  void ReportAnyError(const ExpressionNode& node) {
    if (node.diagnostic && node.diagnostic->IsError()) {
      errors.push_back(node.diagnostic.get());
    }
  }

  std::unique_ptr<ExpressionParserError> RaiseTypeError(
      const gd::String &message, const ExpressionParserLocation &location) {
    return std::move(gd::make_unique<ExpressionParserError>(
        "type_error", message, location.GetStartPosition(), location.GetEndPosition()));
  }

  std::unique_ptr<ExpressionParserError> RaiseOperatorError(
      const gd::String &message, const ExpressionParserLocation &location) {
    return std::move(gd::make_unique<ExpressionParserError>(
        "invalid_operator", message, location.GetStartPosition(), location.GetEndPosition()));
  }

  std::vector<ExpressionParserDiagnostic*> errors;
  const mutable gd::String *childType;
  const mutable gd::String *parentType;
  gd::String lastObjectName;
  const gd::Platform &platform;
  const gd::ObjectsContainer &globalObjectsContainer;
  const gd::ObjectsContainer &objectsContainer;
};

}  // namespace gd

#endif  // GDCORE_EXPRESSIONVALIDATOR_H
