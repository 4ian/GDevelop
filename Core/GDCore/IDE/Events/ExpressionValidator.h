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
#include "GDCore/Extensions/Metadata/ExpressionMetadata.h"
#include "GDCore/Project/ProjectScopedContainers.h"
#include "GDCore/Project/VariablesContainersList.h"

namespace gd {
class Expression;
class ObjectsContainer;
class VariablesContainer;
class Platform;
class ParameterMetadata;
class ExpressionMetadata;
class VariablesContainersList;
class ProjectScopedContainers;
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
                      const gd::ProjectScopedContainers & projectScopedContainers_,
                      const gd::String &rootType_)
      : platform(platform_),
        projectScopedContainers(projectScopedContainers_),
        parentType(StringToType(gd::ParameterMetadata::GetExpressionValueType(rootType_))),
        childType(Type::Unknown),
        forbidsUsageOfBracketsBecauseParentIsObject(false) {};
  virtual ~ExpressionValidator(){};

  /**
   * \brief Helper function to check if a given node does not contain
   * any error including non-fatal ones.
   */
  static bool HasNoErrors(const gd::Platform &platform,
                      const gd::ProjectScopedContainers & projectScopedContainers,
                      const gd::String &rootType,
                      gd::ExpressionNode& node) {
    gd::ExpressionValidator validator(platform, projectScopedContainers, rootType);
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

    // The "required" type ("parentType")  will be used when visiting the first operand.
    // Note that it may be refined thanks to this first operand (see later).
    node.leftHandSide->Visit(*this);
    const Type leftType = childType; // Store the type of the first operand.

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

    // The "required" type ("parentType") of the second operator is decided by:
    // - the parent type. Unless it can (`number|string`) or should (`unknown`) be refined, then:
    // - the first operand.
    parentType = ShouldTypeBeRefined(parentType) ? leftType : parentType;
    node.rightHandSide->Visit(*this);
    const Type rightType = childType;

    // The type of the overall operator ("childType") is decided by:
    // - the parent type. Unless it can (`number|string`) or should (`unknown`) be refined, then:
    // - the first operand. Unless it can (`number|string`) or should (`unknown`) be refined, then:
    // - the right operand (which got visited knowing the type of the first operand, so it's
    // equal or strictly more precise than the left operand).
    childType = ShouldTypeBeRefined(parentType) ? (ShouldTypeBeRefined(leftType) ? leftType : rightType) : parentType;
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

    if (parentType == Type::Variable) {
      childType = Type::Variable;

      if (node.child) {
        node.child->Visit(*this);
      }
    } else if (parentType == Type::String || parentType == Type::Number || parentType == Type::NumberOrString) {
      // The node represents a variable or an object variable in an expression waiting for its *value* to be returned.
      childType = parentType;

      const auto& variablesContainersList = projectScopedContainers.GetVariablesContainersList();
      const auto& objectsContainersList = projectScopedContainers.GetObjectsContainersList();
      const auto& propertiesContainerList = projectScopedContainers.GetPropertiesContainersList();

      forbidsUsageOfBracketsBecauseParentIsObject = false;
      projectScopedContainers.MatchIdentifierWithName<void>(node.name,
        [&]() {
          // This represents an object.

          // While understood by the parser, it's forbidden to use the bracket notation just after
          // an object name (`MyObject["MyVariable"]`).
          forbidsUsageOfBracketsBecauseParentIsObject = true;
        }, [&]() {
          // This is a variable.
        }, [&]() {
          // This is a property.
          // Being in this node implies that there is at least a child - which is not supported for properties.
          RaiseTypeError(_("Accessing a child variable of a property is not possible - just write the property name."),
              node.location);
        }, [&]() {
          // This is a parameter.
          // Being in this node implies that there is at least a child - which is not supported for parameters.
          RaiseTypeError(_("Accessing a child variable of a parameter is not possible - just write the parameter name."),
              node.location);
        }, [&]() {
          // This is something else.
          RaiseTypeError(_("No object, variable or property with this name found."),
              node.location);
        });

      if (node.child) {
        node.child->Visit(*this);
      }

      forbidsUsageOfBracketsBecauseParentIsObject = false;
    } else {
      RaiseTypeError(_("You entered a variable, but this type was expected:") +
                         " " + TypeToString(parentType),
                     node.location);

      if (node.child) {
        node.child->Visit(*this);
      }
    }
  }
  void OnVisitVariableAccessorNode(VariableAccessorNode& node) override {
    ReportAnyError(node);

    // In the case we accessed an object variable (`MyObject.MyVariable`),
    // brackets can now be used (`MyObject.MyVariable["MyChildVariable"]` is now valid).
    forbidsUsageOfBracketsBecauseParentIsObject = false;

    if (node.child) {
      node.child->Visit(*this);
    }
  }
  void OnVisitVariableBracketAccessorNode(
      VariableBracketAccessorNode& node) override {
    ReportAnyError(node);

    if (forbidsUsageOfBracketsBecauseParentIsObject) {
      RaiseError("brackets_not_allowed_for_objects",
                 _("You can't use the brackets to access an object variable. "
                   "Use a dot followed by the variable name, like this: "
                   "`MyObject.MyVariable`."),
                 node.location);
    }
    forbidsUsageOfBracketsBecauseParentIsObject = false;

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
      if (!ValidateObjectVariableOrVariableOrProperty(node)) {
        // The identifier is not a variable, so either the variable is not properly declared
        // or it's a text without quotes.
        RaiseTypeError(_("You must wrap your text inside double quotes "
                              "(example: \"Hello world\")."),
                            node.location);
      }
    }
    else if (parentType == Type::Number) {
      if (!ValidateObjectVariableOrVariableOrProperty(node)) {
        // The identifier is not a variable, so the variable is not properly declared.
        RaiseTypeError(
            _("You must enter a number."), node.location);
      }
    }
    else if (parentType == Type::NumberOrString) {
      if (!ValidateObjectVariableOrVariableOrProperty(node)) {
        // The identifier is not a variable, so either the variable is not properly declared
        // or it's a text without quotes.
        RaiseTypeError(
            _("You must enter a number or a text, wrapped inside double quotes (example: \"Hello world\"), or a variable name."),
            node.location);
      }
    }
    else if (parentType != Type::Object && parentType != Type::Variable) {
      // It can't happen.
      RaiseTypeError(
          _("You've entered a name, but this type was expected:") + " " + TypeToString(parentType),
          node.location);
      childType = parentType;
    } else {
      childType = parentType;
    }
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
  bool ValidateObjectVariableOrVariableOrProperty(const gd::IdentifierNode& identifier);

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

  void ReadChildTypeFromVariable(gd::Variable::Type variableType) {
    if (variableType == gd::Variable::Number) {
      childType = Type::Number;
    } else if (variableType == gd::Variable::String) {
      childType = Type::String;
    } else {
      // Nothing - we don't know the precise type (this could be used as a string or as a number).
    }
  }

  static bool ShouldTypeBeRefined(Type type) {
    return (type == Type::Unknown || type == Type::NumberOrString);
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
  Type childType; ///< The type "discovered" down the tree and passed up.
  Type parentType; ///< The type "required" by the top of the tree.
  bool forbidsUsageOfBracketsBecauseParentIsObject;
  const gd::Platform &platform;
  const gd::ProjectScopedContainers &projectScopedContainers;
};

}  // namespace gd

#endif  // GDCORE_EXPRESSIONVALIDATOR_H
