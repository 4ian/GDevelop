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
#include "GDCore/Tools/MakeUnique.h"
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
                      const gd::String &rootType_)
      : platform(platform_),
        globalObjectsContainer(globalObjectsContainer_),
        objectsContainer(objectsContainer_),
        parentType(stringToType(rootType_)) ,
        childType(Type::Unknown) {};
  virtual ~ExpressionValidator(){};

  /**
   * \brief Helper function to check if a given node does not contain
   * any error.
   */
  static bool HasNoErrors(const gd::Platform &platform,
                      const gd::ObjectsContainer &globalObjectsContainer,
                      const gd::ObjectsContainer &objectsContainer,
                      const gd::String &rootType,
                      gd::ExpressionNode& node) {
    gd::ExpressionValidator validator(platform, globalObjectsContainer, objectsContainer, rootType);
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
      RaiseOperatorError(
          _("You've used an operator that is not supported. Only + can be used "
            "to concatenate texts."),
            node.rightHandSide->location);
      }
    } else if (leftType == Type::Object) {
      RaiseOperatorError(
          _("Operators (+, -, /, *) can't be used with an object name. Remove "
            "the operator."),
            node.rightHandSide->location);
    } else if (leftType == Type::Variable) {
      RaiseOperatorError(
          _("Operators (+, -, /, *) can't be used in variable names. Remove "
            "the operator from the variable name."),
            node.rightHandSide->location);
    }

    node.rightHandSide->Visit(*this);
    const Type rightType = childType;

    if (rightType == Type::String) {
      if (leftType == Type::Number) {
        RaiseTypeError(_("You entered a text, but a number was expected."),
                           node.rightHandSide->location);
        childType = Type::NumberOrString;
      }
      else if (leftType != Type::String && leftType != Type::NumberOrString) {
        RaiseTypeError(
            _("You entered a text, but this type was expected:") + typeToSting(leftType),
            node.rightHandSide->location);
        childType = Type::Unknown;
      }
    }
    else if (rightType == Type::Number) {
      if (leftType == Type::String) {
        RaiseTypeError(
            _("You entered a number, but a text was expected (in quotes)."),
            node.rightHandSide->location);
        childType = Type::NumberOrString;
      }
      else if (leftType != Type::Number && leftType != Type::NumberOrString) {
        RaiseTypeError(
            _("You entered a number, but this type was expected:") + typeToSting(leftType),
            node.rightHandSide->location);
        childType = Type::Unknown;
      }
    }
    else if (rightType == Type::Identifier) {
      if (leftType == Type::String) {
        RaiseTypeError(_("You must wrap your text inside double quotes "
                             "(example: \"Hello world\")."),
                           node.rightHandSide->location);
      }
      else if (leftType == Type::Number) {
        RaiseTypeError(
            _("You must enter a number."), node.rightHandSide->location);
      }
      else if (leftType == Type::NumberOrString) {
        RaiseTypeError(
            _("You must enter a number or a text, wrapped inside double quotes "
              "(example: \"Hello world\")."),
            node.rightHandSide->location);
      }
      else if (leftType != Type::Object) {
        RaiseTypeError(
            _("You've entered a name, but this type was expected:") + typeToSting(leftType),
            node.rightHandSide->location);
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
        RaiseTypeError(
          _("You've used an \"unary\" operator that is not supported. Operator "
            "should be "
            "either + or -."),
          node.factor->location);
        childType = Type::Unknown;
      }
    } else if (rightType == Type::String) {
      RaiseTypeError(
          _("You've used an operator that is not supported. Only + can be used "
            "to concatenate texts, and must be placed between two texts (or "
            "expressions)."),
          node.factor->location);
      childType = Type::Unknown;
    } else if (rightType == Type::Object) {
      RaiseTypeError(
          _("Operators (+, -) can't be used with an object name. Remove the "
            "operator."),
          node.factor->location);
      childType = Type::Unknown;
    } else if (rightType == Type::Variable) {
      RaiseTypeError(
          _("Operators (+, -) can't be used in variable names. Remove "
            "the operator from the variable name."),
          node.factor->location);
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

  void RaiseError(const gd::String &type, 
      const gd::String &message, const ExpressionParserLocation &location) {
    auto diagnostic = std::move(gd::make_unique<ExpressionParserError>(
        type, message, location));
    errors.push_back(diagnostic.get());
    supplementalErrors.push_back(std::move(diagnostic));
  }

  void RaiseTypeError(
      const gd::String &message, const ExpressionParserLocation &location) {
    RaiseError("type_error", message, location);
  }

  void RaiseOperatorError(
      const gd::String &message, const ExpressionParserLocation &location) {
    RaiseError("invalid_operator", message, location);
  }

  static Type stringToType(const gd::String &type);
  static const gd::String &typeToSting(Type type);
  static const gd::String unknownTypeString;
  static const gd::String numberTypeString;
  static const gd::String stringTypeString;
  static const gd::String numberOrStringTypeString;
  static const gd::String variableTypeString;
  static const gd::String objectTypeString;
  static const gd::String identifierTypeString;
  static const gd::String emptyTypeString;

  std::vector<ExpressionParserDiagnostic*> errors;
  std::vector<std::unique_ptr<ExpressionParserDiagnostic>> supplementalErrors;
  Type childType;
  Type parentType;
  gd::String lastObjectName;
  const gd::Platform &platform;
  const gd::ObjectsContainer &globalObjectsContainer;
  const gd::ObjectsContainer &objectsContainer;
};

}  // namespace gd

#endif  // GDCORE_EXPRESSIONVALIDATOR_H
