/*
 * GDevelop Core
 * Copyright 2008-present Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#ifndef GDCORE_EXPRESSIONPARSER2_H
#define GDCORE_EXPRESSIONPARSER2_H

#include <memory>
#include <utility>
#include <vector>
#include "ExpressionParser2Node.h"
#include "GDCore/Extensions/Metadata/ExpressionMetadata.h"
#include "GDCore/Extensions/Metadata/MetadataProvider.h"
#include "GDCore/Project/Layout.h"  // For GetTypeOfObject and GetTypeOfBehavior
#include "GDCore/String.h"
#include "GDCore/Tools/Localization.h"
#include "GDCore/Tools/MakeUnique.h"
namespace gd {
class Expression;
class ObjectsContainer;
class Platform;
class ParameterMetadata;
class ExpressionMetadata;
}  // namespace gd

namespace gd {

/** \brief Parse an expression, returning a tree of node corresponding
 * to the parsed expression.
 *
 * This is a LL(1) parser. This could be extracted to a generic/reusable
 * parser by refactoring out the dependency on gd::MetadataProvider (injecting
 * instead functions to be called to query supported functions).
 *
 * \see gd::ExpressionParserDiagnostic
 * \see gd::ExpressionNode
 */
class GD_CORE_API ExpressionParser2 {
 public:
  ExpressionParser2(const gd::Platform &platform_,
                    const gd::ObjectsContainer &globalObjectsContainer_,
                    const gd::ObjectsContainer &objectsContainer_);
  virtual ~ExpressionParser2(){};

  /**
   * Parse the given expression with the specified type.
   *
   * \param type Type of the expression: "string", "number",
   * type supported by gd::ParameterMetadata::IsObject, types supported by
   * gd::ParameterMetadata::IsExpression or "unknown".
   * \param expression The expression to parse
   * \param objectName Specify the object name, only for the
   * case of "objectvar" type.
   *
   * \return The node representing the expression as a parsed tree.
   */
  std::unique_ptr<ExpressionNode> ParseExpression(
      const gd::String &type,
      const gd::String &expression_,
      const gd::String &objectName = "") {
    expression = expression_;

    currentPosition = 0;
    return Start(type, objectName);
  }

 private:
  /** \name Grammar
   * Each method is a part of the grammar.
   */
  ///@{
  std::unique_ptr<ExpressionNode> Start(const gd::String &type,
                                        const gd::String &objectName = "") {
    size_t expressionStartPosition = GetCurrentPosition();
    auto expression = Expression(type, objectName);

    // Check for extra characters at the end of the expression
    if (!IsEndReached()) {
      auto op = gd::make_unique<OperatorNode>(type, ' ');
      op->leftHandSide = std::move(expression);
      op->rightHandSide = ReadUntilEnd("unknown");

      op->rightHandSide->diagnostic = RaiseSyntaxError(
          _("The expression has extra character at the end that should be "
            "removed (or completed if your expression is not finished)."));

      op->location = ExpressionParserLocation(expressionStartPosition,
                                              GetCurrentPosition());
      return std::move(op);
    }

    return expression;
  }

  std::unique_ptr<ExpressionNode> Expression(
      const gd::String &type, const gd::String &objectName = "") {
    SkipAllWhitespaces();

    size_t expressionStartPosition = GetCurrentPosition();
    std::unique_ptr<ExpressionNode> leftHandSide = Term(type, objectName);

    SkipAllWhitespaces();

    if (IsEndReached()) return leftHandSide;
    if (CheckIfChar(IsExpressionEndingChar)) return leftHandSide;
    if (CheckIfChar(IsExpressionOperator)) {
      auto op = gd::make_unique<OperatorNode>(type, GetCurrentChar());
      op->leftHandSide = std::move(leftHandSide);
      op->diagnostic = ValidateOperator(type, GetCurrentChar());
      SkipChar();
      op->rightHandSide = Expression(type, objectName);

      op->location = ExpressionParserLocation(expressionStartPosition,
                                              GetCurrentPosition());
      return std::move(op);
    }

    if (type == "string") {
      leftHandSide->diagnostic = RaiseSyntaxError(
          "You must add the operator + between texts or expressions. For "
          "example: \"Your name: \" + VariableString(PlayerName).");
    } else if (type == "number") {
      leftHandSide->diagnostic = RaiseSyntaxError(
          "No operator found. Did you forget to enter an operator (like +, -, "
          "* or /) between numbers or expressions?");
    } else {
      leftHandSide->diagnostic = RaiseSyntaxError(
          "More than one term was found. Verify that your expression is "
          "properly written.");
    }

    auto op = gd::make_unique<OperatorNode>(type, ' ');
    op->leftHandSide = std::move(leftHandSide);
    op->rightHandSide = Expression(type, objectName);
    op->location =
        ExpressionParserLocation(expressionStartPosition, GetCurrentPosition());
    return std::move(op);
  }

  std::unique_ptr<ExpressionNode> Term(const gd::String &type,
                                       const gd::String &objectName) {
    SkipAllWhitespaces();

    size_t expressionStartPosition = GetCurrentPosition();
    std::unique_ptr<ExpressionNode> factor = Factor(type, objectName);

    SkipAllWhitespaces();

    // This while loop is used instead of a recursion (like in Expression)
    // to guarantee the proper operator precedence. (Expression could also
    // be reworked to use a while loop).
    while (CheckIfChar(IsTermOperator)) {
      auto op = gd::make_unique<OperatorNode>(type, GetCurrentChar());
      op->leftHandSide = std::move(factor);
      op->diagnostic = ValidateOperator(type, GetCurrentChar());
      SkipChar();
      op->rightHandSide = Factor(type, objectName);
      op->location = ExpressionParserLocation(expressionStartPosition,
                                              GetCurrentPosition());
      SkipAllWhitespaces();

      factor = std::move(op);
    }

    return factor;
  };

  std::unique_ptr<ExpressionNode> Factor(const gd::String &type,
                                         const gd::String &objectName) {
    SkipAllWhitespaces();

    size_t expressionStartPosition = GetCurrentPosition();
    std::unique_ptr<ExpressionNode> factor;

    if (CheckIfChar(IsQuote)) {
      factor = ReadText();
      if (type == "number")
        factor->diagnostic =
            RaiseTypeError(_("You entered a text, but a number was expected."),
                           expressionStartPosition);
      else if (type != "string")
        factor->diagnostic = RaiseTypeError(
            _("You entered a text, but this type was expected:") + type,
            expressionStartPosition);
    } else if (CheckIfChar(IsUnaryOperator)) {
      auto unaryOperator =
          gd::make_unique<UnaryOperatorNode>(type, GetCurrentChar());
      unaryOperator->diagnostic = ValidateUnaryOperator(type, GetCurrentChar());
      SkipChar();
      unaryOperator->factor = Factor(type, objectName);

      unaryOperator->location = ExpressionParserLocation(
          expressionStartPosition, GetCurrentPosition());
      factor = std::move(unaryOperator);
    } else if (CheckIfChar(IsNumberFirstChar)) {
      factor = ReadNumber();
      if (type == "string")
        factor->diagnostic = RaiseTypeError(
            _("You entered a number, but a text was expected (in quotes)."),
            expressionStartPosition);
      else if (type != "number")
        factor->diagnostic = RaiseTypeError(
            _("You entered a number, but this type was expected:") + type,
            expressionStartPosition);
    } else if (CheckIfChar(IsOpeningParenthesis)) {
      SkipChar();
      factor = SubExpression(type, objectName);

      if (!CheckIfChar(IsClosingParenthesis)) {
        factor->diagnostic =
            RaiseSyntaxError(_("Missing a closing parenthesis. Add a closing "
                               "parenthesis for each opening parenthesis."));
      }
      SkipIfChar(IsClosingParenthesis);
    } else if (IsIdentifierAllowedChar()) {
      // This is a place where the grammar differs according to the
      // type being expected.
      if (gd::ParameterMetadata::IsExpression("variable", type)) {
        factor = Variable(type, objectName);
      } else {
        factor = Identifier(type);
      }
    } else {
      factor = ReadUntilWhitespace(type);
      factor->diagnostic = RaiseEmptyError(type, expressionStartPosition);
    }

    return factor;
  }

  std::unique_ptr<SubExpressionNode> SubExpression(
      const gd::String &type, const gd::String &objectName) {
    size_t expressionStartPosition = GetCurrentPosition();
    auto subExpression =
        gd::make_unique<SubExpressionNode>(type, Expression(type, objectName));
    subExpression->location =
        ExpressionParserLocation(expressionStartPosition, GetCurrentPosition());

    return std::move(subExpression);
  };

  std::unique_ptr<IdentifierOrFunctionCallOrObjectFunctionNameOrEmptyNode>
  Identifier(const gd::String &type) {
    auto identifierAndLocation = ReadIdentifierName();
    gd::String name = identifierAndLocation.name;
    auto nameLocation = identifierAndLocation.location;

    SkipAllWhitespaces();

    // We consider a namespace separator to be allowed here and be part of the
    // function name (or object name, but object names are not allowed to
    // contain a ":"). This is because functions from extensions have their
    // extension name prefix, and separated by the namespace separator. This
    // could maybe be refactored to create different nodes in the future.
    if (IsNamespaceSeparator()) {
      SkipNamespaceSeparator();
      SkipAllWhitespaces();

      auto postNamespaceIdentifierAndLocation = ReadIdentifierName();
      name += NAMESPACE_SEPARATOR;
      name += postNamespaceIdentifierAndLocation.name;
      ExpressionParserLocation completeNameLocation(
          nameLocation.GetStartPosition(),
          postNamespaceIdentifierAndLocation.location.GetEndPosition());
      nameLocation = completeNameLocation;
    }

    if (CheckIfChar(IsOpeningParenthesis)) {
      ExpressionParserLocation openingParenthesisLocation = SkipChar();
      return FreeFunction(type, name, nameLocation, openingParenthesisLocation);
    } else if (CheckIfChar(IsDot)) {
      ExpressionParserLocation dotLocation = SkipChar();
      SkipAllWhitespaces();
      return ObjectFunctionOrBehaviorFunction(
          type, name, nameLocation, dotLocation);
    } else {
      auto identifier = gd::make_unique<IdentifierNode>(name, type);
      if (type == "string") {
        identifier->diagnostic =
            RaiseTypeError(_("You must wrap your text inside double quotes "
                             "(example: \"Hello world\")."),
                           nameLocation.GetStartPosition());
      } else if (type == "number") {
        identifier->diagnostic = RaiseTypeError(
            _("You must enter a number."), nameLocation.GetStartPosition());
      } else if (!gd::ParameterMetadata::IsObject(type)) {
        identifier->diagnostic = RaiseTypeError(
            _("You've entered a name, but this type was expected:") + type,
            nameLocation.GetStartPosition());
      }

      identifier->location = ExpressionParserLocation(
          nameLocation.GetStartPosition(), GetCurrentPosition());
      return std::move(identifier);
    }
  }

  std::unique_ptr<VariableNode> Variable(const gd::String &type,
                                         const gd::String &objectName) {
    auto identifierAndLocation = ReadIdentifierName();
    const gd::String &name = identifierAndLocation.name;
    const auto &nameLocation = identifierAndLocation.location;

    auto variable = gd::make_unique<VariableNode>(type, name, objectName);
    variable->child = VariableAccessorOrVariableBracketAccessor();

    variable->location = ExpressionParserLocation(
        nameLocation.GetStartPosition(), GetCurrentPosition());
    variable->nameLocation = nameLocation;
    return std::move(variable);
  }

  std::unique_ptr<VariableAccessorOrVariableBracketAccessorNode>
  VariableAccessorOrVariableBracketAccessor() {
    size_t childStartPosition = GetCurrentPosition();

    SkipAllWhitespaces();
    if (CheckIfChar(IsOpeningSquareBracket)) {
      SkipChar();
      auto child =
          gd::make_unique<VariableBracketAccessorNode>(Expression("string"));

      if (!CheckIfChar(IsClosingSquareBracket)) {
        child->diagnostic =
            RaiseSyntaxError(_("Missing a closing bracket. Add a closing "
                               "bracket for each opening bracket."));
      }
      SkipIfChar(IsClosingSquareBracket);
      child->child = VariableAccessorOrVariableBracketAccessor();
      child->location =
          ExpressionParserLocation(childStartPosition, GetCurrentPosition());

      return std::move(child);
    } else if (CheckIfChar(IsDot)) {
      auto dotLocation = SkipChar();
      SkipAllWhitespaces();

      auto identifierAndLocation = ReadIdentifierName();
      auto child =
          gd::make_unique<VariableAccessorNode>(identifierAndLocation.name);
      child->child = VariableAccessorOrVariableBracketAccessor();
      child->nameLocation = identifierAndLocation.location;
      child->dotLocation = dotLocation;
      child->location =
          ExpressionParserLocation(childStartPosition, GetCurrentPosition());

      return std::move(child);
    }

    return std::move(
        std::unique_ptr<VariableAccessorOrVariableBracketAccessorNode>());
  }

  std::unique_ptr<FunctionCallNode> FreeFunction(
      const gd::String &type,
      const gd::String &functionFullName,
      const ExpressionParserLocation &identifierLocation,
      const ExpressionParserLocation &openingParenthesisLocation) {
    // TODO: error if trying to use function for type != "number" && != "string"
    // + Test for it

    // This could be improved to have the type passed to a single
    // GetExpressionMetadata function.
    const gd::ExpressionMetadata &metadata =
        type == "number" ? MetadataProvider::GetExpressionMetadata(
                               platform, functionFullName)
                         : MetadataProvider::GetStrExpressionMetadata(
                               platform, functionFullName);

    auto parametersNode = Parameters(metadata.parameters);
    auto function = gd::make_unique<FunctionCallNode>(
        type, std::move(parametersNode.parameters), metadata, functionFullName);
    function->diagnostic = std::move(parametersNode.diagnostic);
    if (!function->diagnostic)
      function->diagnostic =
          ValidateFunction(*function, identifierLocation.GetStartPosition());

    function->location = ExpressionParserLocation(
        identifierLocation.GetStartPosition(), GetCurrentPosition());
    function->functionNameLocation = identifierLocation;
    function->openingParenthesisLocation = openingParenthesisLocation;
    function->closingParenthesisLocation =
        parametersNode.closingParenthesisLocation;
    return std::move(function);
  }

  std::unique_ptr<FunctionCallOrObjectFunctionNameOrEmptyNode>
  ObjectFunctionOrBehaviorFunction(
      const gd::String &type,
      const gd::String &objectName,
      const ExpressionParserLocation &objectNameLocation,
      const ExpressionParserLocation &objectNameDotLocation) {
    auto identifierAndLocation = ReadIdentifierName();
    const gd::String &objectFunctionOrBehaviorName = identifierAndLocation.name;
    const auto &objectFunctionOrBehaviorNameLocation =
        identifierAndLocation.location;

    SkipAllWhitespaces();

    if (IsNamespaceSeparator()) {
      ExpressionParserLocation namespaceSeparatorLocation =
          SkipNamespaceSeparator();
      SkipAllWhitespaces();
      return BehaviorFunction(type,
                              objectName,
                              objectFunctionOrBehaviorName,
                              objectNameLocation,
                              objectNameDotLocation,
                              objectFunctionOrBehaviorNameLocation,
                              namespaceSeparatorLocation);
    } else if (CheckIfChar(IsOpeningParenthesis)) {
      ExpressionParserLocation openingParenthesisLocation = SkipChar();

      gd::String objectType =
          GetTypeOfObject(globalObjectsContainer, objectsContainer, objectName);

      // This could be improved to have the type passed to a single
      // GetExpressionMetadata function.
      const gd::ExpressionMetadata &metadata =
          type == "number"
              ? MetadataProvider::GetObjectExpressionMetadata(
                    platform, objectType, objectFunctionOrBehaviorName)
              : MetadataProvider::GetObjectStrExpressionMetadata(
                    platform, objectType, objectFunctionOrBehaviorName);

      auto parametersNode = Parameters(metadata.parameters, objectName);
      auto function = gd::make_unique<FunctionCallNode>(
          type,
          objectName,
          std::move(parametersNode.parameters),
          metadata,
          objectFunctionOrBehaviorName);
      function->diagnostic = std::move(parametersNode.diagnostic);
      if (!function->diagnostic)
        function->diagnostic =
            ValidateFunction(*function, objectNameLocation.GetStartPosition());

      function->location = ExpressionParserLocation(
          objectNameLocation.GetStartPosition(), GetCurrentPosition());
      function->objectNameLocation = objectNameLocation;
      function->objectNameDotLocation = objectNameDotLocation;
      function->functionNameLocation = objectFunctionOrBehaviorNameLocation;
      function->openingParenthesisLocation = openingParenthesisLocation;
      function->closingParenthesisLocation =
          parametersNode.closingParenthesisLocation;
      return std::move(function);
    }

    auto node = gd::make_unique<ObjectFunctionNameNode>(
        type, objectName, objectFunctionOrBehaviorName);
    node->diagnostic = RaiseSyntaxError(
        _("An opening parenthesis (for an object expression), or double colon "
          "(::) was expected (for a behavior expression)."));

    node->location = ExpressionParserLocation(
        objectNameLocation.GetStartPosition(), GetCurrentPosition());
    node->objectNameLocation = objectNameLocation;
    node->objectNameDotLocation = objectNameDotLocation;
    node->objectFunctionOrBehaviorNameLocation =
        objectFunctionOrBehaviorNameLocation;
    return std::move(node);
  }

  std::unique_ptr<FunctionCallOrObjectFunctionNameOrEmptyNode> BehaviorFunction(
      const gd::String &type,
      const gd::String &objectName,
      const gd::String &behaviorName,
      const ExpressionParserLocation &objectNameLocation,
      const ExpressionParserLocation &objectNameDotLocation,
      const ExpressionParserLocation &behaviorNameLocation,
      const ExpressionParserLocation &behaviorNameNamespaceSeparatorLocation) {
    auto identifierAndLocation = ReadIdentifierName();
    const gd::String &functionName = identifierAndLocation.name;
    const auto &functionNameLocation = identifierAndLocation.location;

    SkipAllWhitespaces();

    if (CheckIfChar(IsOpeningParenthesis)) {
      ExpressionParserLocation openingParenthesisLocation = SkipChar();

      gd::String behaviorType = GetTypeOfBehavior(
          globalObjectsContainer, objectsContainer, behaviorName);

      // This could be improved to have the type passed to a single
      // GetExpressionMetadata function.
      const gd::ExpressionMetadata &metadata =
          type == "number" ? MetadataProvider::GetBehaviorExpressionMetadata(
                                 platform, behaviorType, functionName)
                           : MetadataProvider::GetBehaviorStrExpressionMetadata(
                                 platform, behaviorType, functionName);

      auto parametersNode =
          Parameters(metadata.parameters, objectName, behaviorName);
      auto function = gd::make_unique<FunctionCallNode>(
          type,
          objectName,
          behaviorName,
          std::move(parametersNode.parameters),
          metadata,
          functionName);
      function->diagnostic = std::move(parametersNode.diagnostic);
      if (!function->diagnostic)
        function->diagnostic =
            ValidateFunction(*function, objectNameLocation.GetStartPosition());

      function->location = ExpressionParserLocation(
          objectNameLocation.GetStartPosition(), GetCurrentPosition());
      function->objectNameLocation = objectNameLocation;
      function->objectNameDotLocation = objectNameDotLocation;
      function->behaviorNameLocation = behaviorNameLocation;
      function->behaviorNameNamespaceSeparatorLocation =
          behaviorNameNamespaceSeparatorLocation;
      function->openingParenthesisLocation = openingParenthesisLocation;
      function->closingParenthesisLocation =
          parametersNode.closingParenthesisLocation;
      function->functionNameLocation = functionNameLocation;
      return std::move(function);
    } else {
      auto node = gd::make_unique<ObjectFunctionNameNode>(
          type, objectName, behaviorName, functionName);
      node->diagnostic = RaiseSyntaxError(
          _("An opening parenthesis was expected here to call a function."));

      node->location = ExpressionParserLocation(
          objectNameLocation.GetStartPosition(), GetCurrentPosition());
      node->objectNameLocation = objectNameLocation;
      node->objectNameDotLocation = objectNameDotLocation;
      node->objectFunctionOrBehaviorNameLocation = behaviorNameLocation;
      node->behaviorNameNamespaceSeparatorLocation =
          behaviorNameNamespaceSeparatorLocation;
      node->behaviorFunctionNameLocation = functionNameLocation;
      return std::move(node);
    }
  }

  // A temporary node that will be integrated into function nodes.
  struct ParametersNode {
    std::vector<std::unique_ptr<ExpressionNode>> parameters;
    std::unique_ptr<gd::ExpressionParserError> diagnostic;
    ExpressionParserLocation closingParenthesisLocation;
  };

  ParametersNode Parameters(
      std::vector<gd::ParameterMetadata> parameterMetadata,
      const gd::String &objectName = "",
      const gd::String &behaviorName = "") {
    std::vector<std::unique_ptr<ExpressionNode>> parameters;

    // By convention, object is always the first parameter, and behavior the
    // second one.
    size_t parameterIndex =
        WrittenParametersFirstIndex(objectName, behaviorName);

    while (!IsEndReached()) {
      SkipAllWhitespaces();

      if (CheckIfChar(IsClosingParenthesis)) {
        auto closingParenthesisLocation = SkipChar();
        return ParametersNode{
            std::move(parameters), nullptr, closingParenthesisLocation};
      } else {
        if (parameterIndex < parameterMetadata.size()) {
          const gd::String &type = parameterMetadata[parameterIndex].GetType();
          if (parameterMetadata[parameterIndex].IsCodeOnly()) {
            // Do nothing, code only parameters are not written in expressions.
          } else if (gd::ParameterMetadata::IsExpression("number", type)) {
            parameters.push_back(Expression("number"));
          } else if (gd::ParameterMetadata::IsExpression("string", type)) {
            parameters.push_back(Expression("string"));
          } else if (gd::ParameterMetadata::IsExpression("variable", type)) {
            parameters.push_back(Expression(type, objectName));
          } else if (gd::ParameterMetadata::IsObject(type)) {
            parameters.push_back(Expression(type));
          } else {
            size_t parameterStartPosition = GetCurrentPosition();
            parameters.push_back(Expression("unknown"));
            parameters.back()->diagnostic =
                gd::make_unique<ExpressionParserError>(
                    "unknown_parameter_type",
                    _("This function is improperly set up. Reach out to the "
                      "extension developer or a GDevelop maintainer to fix "
                      "this issue"),
                    parameterStartPosition,
                    GetCurrentPosition());
          }
        } else {
          size_t parameterStartPosition = GetCurrentPosition();
          parameters.push_back(Expression("unknown"));
          parameters.back()
              ->diagnostic = gd::make_unique<ExpressionParserError>(
              "extra_parameter",
              _("This parameter was not expected by this expression. Remove it "
                "or verify that you've entered the proper expression name."),
              parameterStartPosition,
              GetCurrentPosition());
        }

        SkipAllWhitespaces();
        SkipIfChar(IsParameterSeparator);
        parameterIndex++;
      }
    }

    ExpressionParserLocation invalidClosingParenthesisLocation;
    return ParametersNode{
        std::move(parameters),
        RaiseSyntaxError(_("The list of parameters is not terminated. Add a "
                           "closing parenthesis to end the parameters.")),
        invalidClosingParenthesisLocation};
  }
  ///@}

  /** \name Validators
   * Return a diagnostic if any error is found
   */
  ///@{
  std::unique_ptr<ExpressionParserDiagnostic> ValidateFunction(
      const gd::FunctionCallNode &function, size_t functionStartPosition);

  std::unique_ptr<ExpressionParserDiagnostic> ValidateOperator(
      const gd::String &type, gd::String::value_type operatorChar) {
    if (type == "number") {
      if (operatorChar == '+' || operatorChar == '-' || operatorChar == '/' ||
          operatorChar == '*') {
        return gd::make_unique<ExpressionParserDiagnostic>();
      }

      return gd::make_unique<ExpressionParserError>(
          "invalid_operator",
          _("You've used an operator that is not supported. Operator should be "
            "either +, -, / or *."),
          GetCurrentPosition());
    } else if (type == "string") {
      if (operatorChar == '+') {
        return gd::make_unique<ExpressionParserDiagnostic>();
      }

      return gd::make_unique<ExpressionParserError>(
          "invalid_operator",
          _("You've used an operator that is not supported. Only + can be used "
            "to concatenate texts."),
          GetCurrentPosition());
    } else if (gd::ParameterMetadata::IsObject(type)) {
      return gd::make_unique<ExpressionParserError>(
          "invalid_operator",
          _("Operators (+, -, /, *) can't be used with an object name. Remove "
            "the operator."),
          GetCurrentPosition());
    } else if (gd::ParameterMetadata::IsExpression("variable", type)) {
      return gd::make_unique<ExpressionParserError>(
          "invalid_operator",
          _("Operators (+, -, /, *) can't be used in variable names. Remove "
            "the operator from the variable name."),
          GetCurrentPosition());
    }

    return gd::make_unique<ExpressionParserDiagnostic>();
  }

  std::unique_ptr<ExpressionParserDiagnostic> ValidateUnaryOperator(
      const gd::String &type, gd::String::value_type operatorChar) {
    if (type == "number") {
      if (operatorChar == '+' || operatorChar == '-') {
        return gd::make_unique<ExpressionParserDiagnostic>();
      }

      return gd::make_unique<ExpressionParserError>(
          "invalid_operator",
          _("You've used an \"unary\" operator that is not supported. Operator "
            "should be "
            "either + or -."),
          GetCurrentPosition());
    } else if (type == "string") {
      return gd::make_unique<ExpressionParserError>(
          "invalid_operator",
          _("You've used an operator that is not supported. Only + can be used "
            "to concatenate texts, and must be placed between two texts (or "
            "expressions)."),
          GetCurrentPosition());
    } else if (gd::ParameterMetadata::IsObject(type)) {
      return gd::make_unique<ExpressionParserError>(
          "invalid_operator",
          _("Operators (+, -) can't be used with an object name. Remove the "
            "operator."),
          GetCurrentPosition());
    } else if (gd::ParameterMetadata::IsExpression("variable", type)) {
      return gd::make_unique<ExpressionParserError>(
          "invalid_operator",
          _("Operators (+, -) can't be used in variable names. Remove "
            "the operator from the variable name."),
          GetCurrentPosition());
    }

    return gd::make_unique<ExpressionParserDiagnostic>();
  }
  ///@}

  /** \name Parsing tokens
   * Read tokens or characters
   */
  ///@{
  ExpressionParserLocation SkipChar() {
    size_t startPosition = currentPosition;
    return ExpressionParserLocation(startPosition, ++currentPosition);
  }

  void SkipAllWhitespaces() {
    while (currentPosition < expression.size() &&
           IsWhitespace(expression[currentPosition])) {
      currentPosition++;
    }
  }

  void SkipIfChar(
      const std::function<bool(gd::String::value_type)> &predicate) {
    if (CheckIfChar(predicate)) {
      currentPosition++;
    }
  }

  ExpressionParserLocation SkipNamespaceSeparator() {
    size_t startPosition = currentPosition;
    // Namespace separator is a special kind of delimiter as it is 2 characters
    // long
    if (IsNamespaceSeparator()) {
      currentPosition += NAMESPACE_SEPARATOR.size();
    }

    return ExpressionParserLocation(startPosition, currentPosition);
  }

  bool CheckIfChar(
      const std::function<bool(gd::String::value_type)> &predicate) {
    if (currentPosition >= expression.size()) return false;
    gd::String::value_type character = expression[currentPosition];

    return predicate(character);
  }

  bool IsIdentifierAllowedChar() {
    if (currentPosition >= expression.size()) return false;
    gd::String::value_type character = expression[currentPosition];

    // Quickly compare if the character is a number or ASCII character.
    if ((character >= '0' && character <= '9') ||
        (character >= 'A' && character <= 'Z') ||
        (character >= 'a' && character <= 'z'))
      return true;

    // Otherwise do the full check against separators forbidden in identifiers.
    if (!IsParameterSeparator(character) && !IsDot(character) &&
        !IsQuote(character) && !IsBracket(character) &&
        !IsExpressionOperator(character) && !IsTermOperator(character)) {
      return true;
    }

    return false;
  }

  static bool IsWhitespace(gd::String::value_type character) {
    return character == ' ' || character == '\n' || character == '\r';
  }

  static bool IsParameterSeparator(gd::String::value_type character) {
    return character == ',';
  }

  static bool IsDot(gd::String::value_type character) {
    return character == '.';
  }

  static bool IsQuote(gd::String::value_type character) {
    return character == '"';
  }

  static bool IsBracket(gd::String::value_type character) {
    return character == '(' || character == ')' || character == '[' ||
           character == ']' || character == '{' || character == '}';
  }

  static bool IsOpeningParenthesis(gd::String::value_type character) {
    return character == '(';
  }

  static bool IsClosingParenthesis(gd::String::value_type character) {
    return character == ')';
  }

  static bool IsOpeningSquareBracket(gd::String::value_type character) {
    return character == '[';
  }

  static bool IsClosingSquareBracket(gd::String::value_type character) {
    return character == ']';
  }

  static bool IsExpressionEndingChar(gd::String::value_type character) {
    return character == ',' || IsClosingParenthesis(character) ||
           IsClosingSquareBracket(character);
  }

  static bool IsExpressionOperator(gd::String::value_type character) {
    return character == '+' || character == '-' || character == '<' ||
           character == '>' || character == '?' || character == '^' ||
           character == '=' || character == '\\' || character == ':' ||
           character == '!';
  }

  static bool IsUnaryOperator(gd::String::value_type character) {
    return character == '+' || character == '-';
  }

  static bool IsTermOperator(gd::String::value_type character) {
    return character == '/' || character == '*';
  }

  static bool IsNumberFirstChar(gd::String::value_type character) {
    return character == '.' || (character >= '0' && character <= '9');
  }

  static bool IsNonZeroDigit(gd::String::value_type character) {
    return (character >= '1' && character <= '9');
  }

  static bool IsZeroDigit(gd::String::value_type character) {
    return character == '0';
  }

  bool IsNamespaceSeparator() {
    // Namespace separator is a special kind of delimiter as it is 2 characters
    // long
    return (currentPosition + NAMESPACE_SEPARATOR.size() <= expression.size() &&
            expression.substr(currentPosition, NAMESPACE_SEPARATOR.size()) ==
                NAMESPACE_SEPARATOR);
  }

  bool IsEndReached() { return currentPosition >= expression.size(); }

  // A temporary node used when reading an identifier
  struct IdentifierAndLocation {
    gd::String name;
    ExpressionParserLocation location;
  };

  IdentifierAndLocation ReadIdentifierName() {
    gd::String name;
    size_t startPosition = currentPosition;
    while (currentPosition < expression.size() &&
           (IsIdentifierAllowedChar()
            // Allow whitespace in identifier name for compatibility
            ||
            expression[currentPosition] == ' ')) {
      name += expression[currentPosition];
      currentPosition++;
    }

    // Trim whitespace at the end (we allow them for compatibility inside
    // the name, but after the last character that is not whitespace, they
    // should be ignore again).
    if (!name.empty() && IsWhitespace(name[name.size() - 1])) {
      size_t lastCharacterPos = name.size() - 1;
      while (lastCharacterPos < name.size() &&
             IsWhitespace(name[lastCharacterPos])) {
        lastCharacterPos--;
      }
      if ((lastCharacterPos + 1) < name.size()) {
        name.erase(lastCharacterPos + 1);
      }
    }

    IdentifierAndLocation identifierAndLocation{
        name,
        // The location is ignoring the trailing whitespace (only whitespace
        // inside the identifier are allowed for compatibility).
        ExpressionParserLocation(startPosition, startPosition + name.size())};
    return identifierAndLocation;
  }

  std::unique_ptr<TextNode> ReadText();

  std::unique_ptr<NumberNode> ReadNumber();

  std::unique_ptr<EmptyNode> ReadUntilWhitespace(gd::String type) {
    size_t startPosition = GetCurrentPosition();
    gd::String text;
    while (currentPosition < expression.size() &&
           !IsWhitespace(expression[currentPosition])) {
      text += expression[currentPosition];
      currentPosition++;
    }

    auto node = gd::make_unique<EmptyNode>(type, text);
    node->location =
        ExpressionParserLocation(startPosition, GetCurrentPosition());
    return node;
  }

  std::unique_ptr<EmptyNode> ReadUntilEnd(gd::String type) {
    size_t startPosition = GetCurrentPosition();
    gd::String text;
    while (currentPosition < expression.size()) {
      text += expression[currentPosition];
      currentPosition++;
    }

    auto node = gd::make_unique<EmptyNode>(type, text);
    node->location =
        ExpressionParserLocation(startPosition, GetCurrentPosition());
    return node;
  }

  size_t GetCurrentPosition() { return currentPosition; }

  gd::String::value_type GetCurrentChar() {
    if (currentPosition < expression.size()) {
      return expression[currentPosition];
    }

    return '\n';  // Should not arise, unless GetCurrentChar was called when
                  // IsEndReached() is true (which is a logical error).
  }
  ///@}

  /** \name Raising errors
   * Helpers to attach errors to nodes
   */
  ///@{
  std::unique_ptr<ExpressionParserError> RaiseSyntaxError(
      const gd::String &message) {
    return std::move(gd::make_unique<ExpressionParserError>(
        "syntax_error", message, GetCurrentPosition()));
  }

  std::unique_ptr<ExpressionParserError> RaiseTypeError(
      const gd::String &message, size_t beginningPosition) {
    return std::move(gd::make_unique<ExpressionParserError>(
        "type_error", message, beginningPosition, GetCurrentPosition()));
  }

  std::unique_ptr<ExpressionParserError> RaiseEmptyError(
      const gd::String &type, size_t beginningPosition) {
    gd::String message;
    if (type == "number") {
      message = _("You must enter a number or a valid expression call.");
    } else if (type == "string") {
      message = _(
          "You must enter a text (between quotes) or a valid expression call.");
    } else if (gd::ParameterMetadata::IsExpression("variable", type)) {
      message = _("You must enter a variable name.");
    } else if (gd::ParameterMetadata::IsObject(type)) {
      message = _("You must enter a valid object name.");
    } else {
      message = _("You must enter a valid expression.");
    }

    return std::move(RaiseTypeError(message, beginningPosition));
  }
  ///@}

  static size_t WrittenParametersFirstIndex(const gd::String &objectName,
                                            const gd::String &behaviorName) {
    // By convention, object is always the first parameter, and behavior the
    // second one.
    return !behaviorName.empty() ? 2 : (!objectName.empty() ? 1 : 0);
  }

  gd::String expression;
  std::size_t currentPosition;

  const gd::Platform &platform;
  const gd::ObjectsContainer &globalObjectsContainer;
  const gd::ObjectsContainer &objectsContainer;

  static gd::String NAMESPACE_SEPARATOR;
};

}  // namespace gd

#endif  // GDCORE_EXPRESSIONPARSER2_H
