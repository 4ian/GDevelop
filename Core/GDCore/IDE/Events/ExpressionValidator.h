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
        parentType(stringToType(type_)) ,
        childType(Type::Unknown) {};
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
    const Type leftType = childType;
    ReportAnyError(node);

    if (leftType == Type::String) {
      if (node.op != '+') {
      errors.push_back(RaiseOperatorError(
          _("You've used an operator that is not supported. Only + can be used "
            "to concatenate texts."),
            node.rightHandSide->location).get());
      }
    } else if (leftType == Type::Object) {
      errors.push_back(RaiseOperatorError(
          _("Operators (+, -, /, *) can't be used with an object name. Remove "
            "the operator."),
            node.rightHandSide->location).get());
    } else if (leftType == Type::Variable) {
      errors.push_back(RaiseOperatorError(
          _("Operators (+, -, /, *) can't be used in variable names. Remove "
            "the operator from the variable name."),
            node.rightHandSide->location).get());
    }

    node.rightHandSide->Visit(*this);
    const Type rightType = childType;

    if (rightType == Type::String) {
      if (leftType == Type::Number) {
        errors.push_back(RaiseTypeError(_("You entered a text, but a number was expected."),
                           node.rightHandSide->location).get());
        childType = Type::NumberOrString;
      }
      else if (leftType != Type::String && leftType != Type::NumberOrString) {
        errors.push_back(RaiseTypeError(
            _("You entered a text, but this type was expected:") + typeToSting(leftType),
            node.rightHandSide->location).get());
        childType = Type::Unknown;
      }
    }
    else if (rightType == Type::Number) {
      if (leftType == Type::String) {
        errors.push_back(RaiseTypeError(
            _("You entered a number, but a text was expected (in quotes)."),
            node.rightHandSide->location).get());
        childType = Type::NumberOrString;
      }
      else if (leftType != Type::Number && leftType != Type::NumberOrString) {
        errors.push_back(RaiseTypeError(
            _("You entered a number, but this type was expected:") + typeToSting(leftType),
            node.rightHandSide->location).get());
        childType = Type::Unknown;
      }
    }
    else if (rightType == Type::Identifier) {
      if (leftType == Type::String) {
        errors.push_back(RaiseTypeError(_("You must wrap your text inside double quotes "
                             "(example: \"Hello world\")."),
                           node.rightHandSide->location.GetStartPosition()).get());
      }
      else if (leftType == Type::Number) {
        errors.push_back(RaiseTypeError(
            _("You must enter a number."), node.rightHandSide->location.GetStartPosition()).get());
      }
      else if (leftType == Type::NumberOrString) {
        errors.push_back(RaiseTypeError(
            _("You must enter a number or a text, wrapped inside double quotes "
              "(example: \"Hello world\")."),
            node.rightHandSide->location).get());
      }
      else if (leftType != Type::Object) {
        errors.push_back(RaiseTypeError(
            _("You've entered a name, but this type was expected:") + typeToSting(leftType),
            node.rightHandSide->location).get());
      }
      childType = Type::Unknown;
    }
  }
  void OnVisitUnaryOperatorNode(UnaryOperatorNode& node) override {
    ReportAnyError(node);
    node.factor->Visit(*this);
    const Type rightType = childType;

    if (rightType == Type::Number) {
      if (node.op != '+' && node.op != '-') {
        errors.push_back(RaiseTypeError(
          _("You've used an \"unary\" operator that is not supported. Operator "
            "should be "
            "either + or -."),
          node.factor->location).get());
        childType = Type::Unknown;
      }
    } else if (rightType == Type::String) {
      errors.push_back(RaiseTypeError(
          _("You've used an operator that is not supported. Only + can be used "
            "to concatenate texts, and must be placed between two texts (or "
            "expressions)."),
          node.factor->location).get());
      childType = Type::Unknown;
    } else if (rightType == Type::Object) {
      errors.push_back(RaiseTypeError(
          _("Operators (+, -) can't be used with an object name. Remove the "
            "operator."),
          node.factor->location).get());
      childType = Type::Unknown;
    } else if (rightType == Type::Variable) {
      errors.push_back(RaiseTypeError(
          _("Operators (+, -) can't be used in variable names. Remove "
            "the operator from the variable name."),
          node.factor->location).get());
      childType = Type::Unknown;
    }
  }
  void OnVisitNumberNode(NumberNode& node) override {
    ReportAnyError(node);
    childType = Type::Number;
  }
  void OnVisitTextNode(TextNode& node) override {
    ReportAnyError(node);
    childType = Type::String;
  }
  void OnVisitVariableNode(VariableNode& node) override {
    ReportAnyError(node);
    if (node.child) {
      node.child->Visit(*this);
    }
    childType = Type::Variable;
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
    childType = Type::Identifier;
  }
  void OnVisitObjectFunctionNameNode(ObjectFunctionNameNode& node) override {
    ReportAnyError(node);
  }
  void OnVisitFunctionCallNode(FunctionCallNode& node) override {
    childType = ValidateFunction(node);
  }
  void OnVisitEmptyNode(EmptyNode& node) override {
    ReportAnyError(node);
    childType = Type::Empty;
  }

 private:
  enum Type {Unknown = 0, Number, String, NumberOrString, Identifier, Variable, Object, Empty};
  Type ValidateFunction(const gd::FunctionCallNode& function);

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

  static Type stringToType(const gd::String &type) {
    if (type == "number" || gd::ParameterMetadata::IsExpression("number", type)) {
      return Type::Number;
    }
    if (type == "string" || gd::ParameterMetadata::IsExpression("string", type)) {
      return Type::String;
    }
    if (type == "number|string") {
      return Type::NumberOrString;
    }
    if (type == "variable" || gd::ParameterMetadata::IsExpression("variable", type)) {
      return Type::Variable;
    }
    if (type == "object" || gd::ParameterMetadata::IsObject(type)) {
      return Type::Object;
    }
    return Type::Unknown;
  }

  static const gd::String &typeToSting(Type type) {
    switch (type) {
      case Type::Unknown:
      return gd::String("unknown");
      case Type::Number:
      return gd::String("number");
      case Type::String:
      return gd::String("string");
      case Type::NumberOrString:
      return gd::String("number|string");
      case Type::Variable:
      return gd::String("variable");
      case Type::Object:
      return gd::String("object");
    }
  }

  std::vector<ExpressionParserDiagnostic*> errors;
  Type childType;
  Type parentType;
  gd::String lastObjectName;
  const gd::Platform &platform;
  const gd::ObjectsContainer &globalObjectsContainer;
  const gd::ObjectsContainer &objectsContainer;
};

}  // namespace gd

#endif  // GDCORE_EXPRESSIONVALIDATOR_H
