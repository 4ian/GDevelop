/*
 * GDevelop Core
 * Copyright 2008-present Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#ifndef GDCORE_EXPRESSIONVALIDATOR_H
#define GDCORE_EXPRESSIONVALIDATOR_H

#include <memory>
#include <vector>
#include <optional>
#include "GDCore/Events/Parsers/ExpressionParser2Node.h"
#include "GDCore/Events/Parsers/ExpressionParser2NodeWorker.h"
#include "GDCore/Tools/MakeUnique.h"
#include "GDCore/Tools/Localization.h"
#include "GDCore/Extensions/Metadata/ExpressionMetadata.h"

namespace gd {
class Expression;
class ObjectsContainer;
class VariablesContainer;
class Platform;
class ParameterMetadata;
class ExpressionMetadata;
class VariablesContainersList;
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
                      // TODO: use EventsScope
                      const gd::ObjectsContainer &globalObjectsContainer_,
                      const gd::ObjectsContainer &objectsContainer_,
                      const gd::VariablesContainersList &variablesContainersList_,
                      const gd::String &rootType_)
      : platform(platform_),
        globalObjectsContainer(globalObjectsContainer_),
        objectsContainer(objectsContainer_),
        variablesContainersList(variablesContainersList_),
        parentType(StringToType(gd::ParameterMetadata::GetExpressionValueType(rootType_))),
        childType(Type::Unknown) {};
  virtual ~ExpressionValidator(){};

  /**
   * \brief Helper function to check if a given node does not contain
   * any error including non-fatal ones.
   */
  static bool HasNoErrors(const gd::Platform &platform,
                      // TODO: use EventsScope
                      const gd::ObjectsContainer &globalObjectsContainer,
                      const gd::ObjectsContainer &objectsContainer,
                      const gd::VariablesContainersList &variablesContainersList_,
                      const gd::String &rootType,
                      gd::ExpressionNode& node) {
    gd::ExpressionValidator validator(platform, globalObjectsContainer, objectsContainer, variablesContainersList_, rootType);
    node.Visit(validator);
    return validator.GetAllErrors().empty();
  }

  /**
   * \brief Get only the fatal errors
   *
   * Expressions with fatal error can't be generated.
   */
  const std::vector<ExpressionParserDiagnostic*>& GetFatalErrors() {
    return fatalErrors;
  };

  /**
   * \brief Get all the errors
   *
   * No errors means that the expression is valid.
   */
  const std::vector<ExpressionParserDiagnostic*>& GetAllErrors() {
    return allErrors;
  };

 protected:
  void OnVisitSubExpressionNode(SubExpressionNode& node) override {
    ReportAnyError(node);
    node.expression->Visit(*this);
  }
  void OnVisitOperatorNode(OperatorNode& node) override {
    ReportAnyError(node);

    node.leftHandSide->Visit(*this);
    const Type leftType = childType;

    if (leftType == Type::Number) {
      if (node.op == ' ') {
        RaiseError("syntax_error",
            "No operator found. Did you forget to enter an operator (like +, -, "
            "* or /) between numbers or expressions?", node.rightHandSide->location);
      }
    }
    else if (leftType == Type::String) {
      if (node.op == ' ') {
        RaiseError("syntax_error",
            "You must add the operator + between texts or expressions. For "
            "example: \"Your name: \" + VariableString(PlayerName).", node.rightHandSide->location);
      }
      else if (node.op != '+') {
      RaiseOperatorError(
          _("You've used an operator that is not supported. Only + can be used "
            "to concatenate texts."),
            ExpressionParserLocation(node.leftHandSide->location.GetEndPosition() + 1, node.location.GetEndPosition()));
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

    parentType = leftType;
    node.rightHandSide->Visit(*this);
    const Type rightType = childType;

    childType = leftType;
  }
  void OnVisitUnaryOperatorNode(UnaryOperatorNode& node) override {
    ReportAnyError(node);
    node.factor->Visit(*this);
    const Type rightType = childType;

    if (rightType == Type::Number) {
      if (node.op != '+' && node.op != '-') {
        // This is actually a dead code because the parser takes them as
        // binary operations with an empty left side which makes as much sense.
        RaiseTypeError(
          _("You've used an \"unary\" operator that is not supported. Operator "
            "should be "
            "either + or -."),
          node.location);
      }
    } else if (rightType == Type::String) {
      RaiseTypeError(
          _("You've used an operator that is not supported. Only + can be used "
            "to concatenate texts, and must be placed between two texts (or "
            "expressions)."),
          node.location);
    } else if (rightType == Type::Object) {
      RaiseTypeError(
          _("Operators (+, -) can't be used with an object name. Remove the "
            "operator."),
          node.location);
    } else if (rightType == Type::Variable) {
      RaiseTypeError(
          _("Operators (+, -) can't be used in variable names. Remove "
            "the operator from the variable name."),
          node.location);
    }
  }
  void OnVisitNumberNode(NumberNode& node) override {
    ReportAnyError(node);
    childType = Type::Number;
    if (parentType == Type::String) {
      RaiseTypeError(
          _("You entered a number, but a text was expected (in quotes)."),
          node.location);
    } else if (parentType != Type::Number &&
               parentType != Type::NumberOrString) {
      RaiseTypeError(_("You entered a number, but this type was expected:") +
                         " " + TypeToString(parentType),
                     node.location);
    }
  }
  void OnVisitTextNode(TextNode& node) override {
    ReportAnyError(node);
    childType = Type::String;
    if (parentType == Type::Number) {
      RaiseTypeError(_("You entered a text, but a number was expected."),
                     node.location);
    } else if (parentType != Type::String &&
               parentType != Type::NumberOrString) {
      RaiseTypeError(_("You entered a text, but this type was expected:") +
                         " " + TypeToString(parentType),
                     node.location);
    }
  }
  void OnVisitVariableNode(VariableNode& node) override {
    ReportAnyError(node);
    if (node.child) {
      node.child->Visit(*this);
    }
    childType = Type::Variable;
    if (parentType == Type::String) {
      ValidateVariable(node);
    } else if (parentType == Type::Number) {
      ValidateVariable(node);
    } else if (parentType == Type::NumberOrString) {
      ValidateVariable(node);
    } else if (parentType != Type::Variable) {
      RaiseTypeError(_("You entered a variable, but this type was expected:") +
                         " " + TypeToString(parentType),
                     node.location);
    }
  }
  void OnVisitVariableAccessorNode(VariableAccessorNode& node) override {
    ReportAnyError(node);
    if (node.child) {
      node.child->Visit(*this);
    }
  }
  void OnVisitVariableBracketAccessorNode(
      VariableBracketAccessorNode& node) override {
    ReportAnyError(node);

    Type currentParentType = parentType;
    parentType = Type::NumberOrString;
    node.expression->Visit(*this);
    parentType = currentParentType;

    if (node.child) {
      node.child->Visit(*this);
    }
  }
  void OnVisitIdentifierNode(IdentifierNode& node) override {
    ReportAnyError(node);
    if (parentType == Type::String) {
      auto variableType = ValidateMaybeObjectVariableOrVariable(node);

      if (!variableType) {
        // The identifier is not a variable, so either the variable is not properly declared
        // or it's a text without quotes.
        RaiseTypeError(_("You must wrap your text inside double quotes "
                              "(example: \"Hello world\")."),
                            node.location);
      }
    }
    else if (parentType == Type::Number) {
      auto variableType = ValidateMaybeObjectVariableOrVariable(node);

      if (!variableType) {
        // The identifier is not a variable, so the variable is not properly declared.
        RaiseTypeError(
            _("You must enter a number."), node.location);
      }
    }
    else if (parentType == Type::NumberOrString) {
      auto variableType = ValidateMaybeObjectVariableOrVariable(node);

      if (!variableType) {
        // The identifier is not a variable, so either the variable is not properly declared
        // or it's a text without quotes.
        RaiseTypeError(
            _("You must enter a number or a text, wrapped inside double quotes "
              "(example: \"Hello world\")."),
            node.location);
      }
    }
    else if (parentType != Type::Object && parentType != Type::Variable) {
      // It can't happen.
      RaiseTypeError(
          _("You've entered a name, but this type was expected:") + " " + TypeToString(parentType),
          node.location);
    }
    childType = parentType;
  }
  void OnVisitObjectFunctionNameNode(ObjectFunctionNameNode& node) override {
    ReportAnyError(node);
  }
  void OnVisitFunctionCallNode(FunctionCallNode& node) override {
    childType = ValidateFunction(node);
  }
  void OnVisitEmptyNode(EmptyNode& node) override {
    ReportAnyError(node);
    gd::String message;
    if (parentType == Type::Number) {
      message = _("You must enter a number or a valid expression call.");
    } else if (parentType == Type::String) {
      message = _(
          "You must enter a text (between quotes) or a valid expression call.");
    } else if (parentType == Type::Variable) {
      message = _("You must enter a variable name.");
    } else if (parentType == Type::Object) {
      message = _("You must enter a valid object name.");
    } else {
      // It can't happen.
      message = _("You must enter a valid expression.");
    }
    RaiseTypeError(message, node.location);
    childType = Type::Empty;
  }

 private:
  enum Type {Unknown = 0, Number, String, NumberOrString, Variable, Object, Empty};
  Type ValidateFunction(const gd::FunctionCallNode& function);
  std::optional<Type> ValidateMaybeObjectVariableOrVariable(const gd::IdentifierNode& identifier);
  void ValidateVariable(const gd::VariableNode& variable);

  void ReportAnyError(const ExpressionNode& node, bool isFatal = true) {
    if (node.diagnostic && node.diagnostic->IsError()) {
      // Syntax errors are holden by the AST nodes.
      // It's fine to give pointers on them as the AST live longer than errors
      // handling.
      allErrors.push_back(node.diagnostic.get());
      if (isFatal) {
        fatalErrors.push_back(node.diagnostic.get());
      }
    }
  }

  void RaiseError(const gd::String &type,
      const gd::String &message, const ExpressionParserLocation &location, bool isFatal = true) {
    auto diagnostic = gd::make_unique<ExpressionParserError>(
        type, message, location);
    allErrors.push_back(diagnostic.get());
    if (isFatal) {
      fatalErrors.push_back(diagnostic.get());
    }
    // Errors found by the validator are not holden by the AST nodes.
    // They must be owned by the validator to keep living while errors are
    // handled by the caller.
    supplementalErrors.push_back(std::move(diagnostic));
  }

  void RaiseTypeError(
      const gd::String &message, const ExpressionParserLocation &location, bool isFatal = true) {
    RaiseError("type_error", message, location, isFatal);
  }

  void RaiseOperatorError(
      const gd::String &message, const ExpressionParserLocation &location) {
    RaiseError("invalid_operator", message, location);
  }

  static Type StringToType(const gd::String &type);
  static const gd::String &TypeToString(Type type);
  static const gd::String unknownTypeString;
  static const gd::String numberTypeString;
  static const gd::String stringTypeString;
  static const gd::String numberOrStringTypeString;
  static const gd::String variableTypeString;
  static const gd::String objectTypeString;
  static const gd::String identifierTypeString;
  static const gd::String emptyTypeString;

  std::vector<ExpressionParserDiagnostic*> fatalErrors;
  std::vector<ExpressionParserDiagnostic*> allErrors;
  std::vector<std::unique_ptr<ExpressionParserDiagnostic>> supplementalErrors;
  Type childType;
  Type parentType;
  const gd::Platform &platform;
  const gd::ObjectsContainer &globalObjectsContainer;
  const gd::ObjectsContainer &objectsContainer;
  const gd::VariablesContainersList &variablesContainersList;
};

}  // namespace gd

#endif  // GDCORE_EXPRESSIONVALIDATOR_H
