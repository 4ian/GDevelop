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
#include "GDCore/Extensions/Metadata/ObjectMetadata.h"
#include "GDCore/Project/Layout.h"  // For GetTypeOfObject and GetTypeOfBehavior
#include "GDCore/String.h"
#include "GDCore/Tools/Localization.h"
#include "GDCore/Tools/MakeUnique.h"
#include "GrammarTerminals.h"
namespace gd {
class Expression;
class ObjectsContainer;
class Platform;
class ParameterMetadata;
class ExpressionMetadata;
}  // namespace gd

namespace gd {

using namespace gd::GrammarTerminals;

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
  ExpressionParser2();
  virtual ~ExpressionParser2(){};

  /**
   * Parse the given expression into a tree of nodes.
   *
   * \param expression The expression to parse.
   *
   * \return The node representing the expression as a parsed tree.
   */
  std::unique_ptr<ExpressionNode> ParseExpression(
      const gd::String &expression_) {
    expression = expression_;

    currentPosition = 0;
    return Start();
  }

  /**
   * Given an object name (or empty if none) and a behavior name (or empty if
   * none), return the index of the first parameter that is inside the
   * parenthesis: 0, 1 or 2.
   *
   * For example, in an expression like `Object.MyBehavior::Method("hello")`,
   * the parameter "hello" is the second parameter (the first being by
   * convention Object, and the second MyBehavior, also by convention).
   */
  static size_t WrittenParametersFirstIndex(const gd::String &objectName,
                                            const gd::String &behaviorName) {
    // By convention, object is always the first parameter, and behavior the
    // second one.
    return !behaviorName.empty() ? 2 : (!objectName.empty() ? 1 : 0);
  }

 private:
  /** \name Grammar
   * Each method is a part of the grammar.
   */
  ///@{
  std::unique_ptr<ExpressionNode> Start() {
    size_t expressionStartPosition = GetCurrentPosition();
    auto expression = Expression();

    // Check for extra characters at the end of the expression
    if (!IsEndReached()) {
      auto op = gd::make_unique<OperatorNode>(' ');
      op->leftHandSide = std::move(expression);
      op->rightHandSide = ReadUntilEnd();
      op->rightHandSide->parent = op.get();

      op->rightHandSide->diagnostic = RaiseSyntaxError(
          _("The expression has extra character at the end that should be "
            "removed (or completed if your expression is not finished)."));

      op->location = ExpressionParserLocation(expressionStartPosition,
                                              GetCurrentPosition());
      return std::move(op);
    }

    return expression;
  }

  std::unique_ptr<ExpressionNode> Expression() {
    SkipAllWhitespaces();

    size_t expressionStartPosition = GetCurrentPosition();
    std::unique_ptr<ExpressionNode> leftHandSide = Term();

    SkipAllWhitespaces();

    if (IsEndReached()) return leftHandSide;
    if (CheckIfChar(IsExpressionEndingChar)) return leftHandSide;
    if (CheckIfChar(IsExpressionOperator)) {
      auto op = gd::make_unique<OperatorNode>(GetCurrentChar());
      op->leftHandSide = std::move(leftHandSide);
      op->leftHandSide->parent = op.get();
      op->diagnostic = ValidateOperator(GetCurrentChar());
      SkipChar();
      op->rightHandSide = Expression();
      op->rightHandSide->parent = op.get();

      op->location = ExpressionParserLocation(expressionStartPosition,
                                              GetCurrentPosition());
      return std::move(op);
    }

    leftHandSide->diagnostic = RaiseSyntaxError(
        "More than one term was found. Verify that your expression is "
        "properly written.");

    auto op = gd::make_unique<OperatorNode>(' ');
    op->leftHandSide = std::move(leftHandSide);
    op->leftHandSide->parent = op.get();
    op->rightHandSide = Expression();
    op->rightHandSide->parent = op.get();
    op->location =
        ExpressionParserLocation(expressionStartPosition, GetCurrentPosition());
    return std::move(op);
  }

  std::unique_ptr<ExpressionNode> Term() {
    SkipAllWhitespaces();

    size_t expressionStartPosition = GetCurrentPosition();
    std::unique_ptr<ExpressionNode> factor = Factor();

    SkipAllWhitespaces();

    // This while loop is used instead of a recursion (like in Expression)
    // to guarantee the proper operator precedence. (Expression could also
    // be reworked to use a while loop).
    while (CheckIfChar(IsTermOperator)) {
      auto op = gd::make_unique<OperatorNode>(GetCurrentChar());
      op->leftHandSide = std::move(factor);
      op->leftHandSide->parent = op.get();
      op->diagnostic = ValidateOperator(GetCurrentChar());
      SkipChar();
      op->rightHandSide = Factor();
      op->rightHandSide->parent = op.get();
      op->location = ExpressionParserLocation(expressionStartPosition,
                                              GetCurrentPosition());
      SkipAllWhitespaces();

      factor = std::move(op);
    }

    return factor;
  };

  std::unique_ptr<ExpressionNode> Factor() {
    SkipAllWhitespaces();
    size_t expressionStartPosition = GetCurrentPosition();

    if (CheckIfChar(IsQuote)) {
      std::unique_ptr<ExpressionNode> factor = ReadText();
      return factor;
    } else if (CheckIfChar(IsUnaryOperator)) {
      auto unaryOperatorCharacter = GetCurrentChar();
      SkipChar();

      auto operatorOperand = Factor();

      auto unaryOperator = gd::make_unique<UnaryOperatorNode>(
          unaryOperatorCharacter);
      unaryOperator->diagnostic = ValidateUnaryOperator(
          unaryOperatorCharacter, expressionStartPosition);
      unaryOperator->factor = std::move(operatorOperand);
      unaryOperator->factor->parent = unaryOperator.get();
      unaryOperator->location = ExpressionParserLocation(
          expressionStartPosition, GetCurrentPosition());

      return std::move(unaryOperator);
    } else if (CheckIfChar(IsNumberFirstChar)) {
      std::unique_ptr<ExpressionNode> factor = ReadNumber();
      return factor;
    } else if (CheckIfChar(IsOpeningParenthesis)) {
      SkipChar();
      std::unique_ptr<ExpressionNode> factor = SubExpression();

      if (!CheckIfChar(IsClosingParenthesis)) {
        factor->diagnostic =
            RaiseSyntaxError(_("Missing a closing parenthesis. Add a closing "
                               "parenthesis for each opening parenthesis."));
      }
      SkipIfChar(IsClosingParenthesis);
      return factor;
    } else if (CheckIfChar(IsAllowedInIdentifier)) {
      return Identifier();
    }

    std::unique_ptr<ExpressionNode> factor = ReadUntilWhitespace();
    return factor;
  }

  std::unique_ptr<SubExpressionNode> SubExpression() {
    size_t expressionStartPosition = GetCurrentPosition();

    auto expression = Expression();

    auto subExpression =
        gd::make_unique<SubExpressionNode>(std::move(expression));
    subExpression->location =
        ExpressionParserLocation(expressionStartPosition, GetCurrentPosition());

    return std::move(subExpression);
  };

  std::unique_ptr<IdentifierOrFunctionCallOrObjectFunctionNameOrEmptyNode>
  Identifier() {
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
      return FreeFunction(name, nameLocation, openingParenthesisLocation);
    } else if (CheckIfChar(IsDot)) {
      ExpressionParserLocation dotLocation = SkipChar();
      SkipAllWhitespaces();
      return ObjectFunctionOrBehaviorFunctionOrVariable(
          name, nameLocation, dotLocation);
    } else if (CheckIfChar(IsOpeningSquareBracket)) {
      return Variable(name, nameLocation);
    } else {
      auto identifier = gd::make_unique<IdentifierNode>(name);
      identifier->location = ExpressionParserLocation(
          nameLocation.GetStartPosition(), GetCurrentPosition());
      identifier->identifierNameLocation = identifier->location;
      return std::move(identifier);
    }
  }

  std::unique_ptr<VariableNode> Variable(const gd::String &name, gd::ExpressionParserLocation nameLocation) {
    auto variable = gd::make_unique<VariableNode>(name);

    if (CheckIfChar(IsOpeningSquareBracket) || CheckIfChar(IsDot)) {
      variable->child = VariableAccessorOrVariableBracketAccessor();
      variable->child->parent = variable.get();
    }

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
      auto child = gd::make_unique<VariableBracketAccessorNode>(Expression());
      child->expression->parent = child.get();

      if (!CheckIfChar(IsClosingSquareBracket)) {
        child->diagnostic =
            RaiseSyntaxError(_("Missing a closing bracket. Add a closing "
                               "bracket for each opening bracket."));
      }
      SkipIfChar(IsClosingSquareBracket);

      SkipAllWhitespaces();
      if (CheckIfChar(IsOpeningSquareBracket) || CheckIfChar(IsDot)) {
        child->child = VariableAccessorOrVariableBracketAccessor();
        child->child->parent = child.get();
      }
      child->location =
          ExpressionParserLocation(childStartPosition, GetCurrentPosition());

      return std::move(child);
    } else if (CheckIfChar(IsDot)) {
      auto dotLocation = SkipChar();
      SkipAllWhitespaces();

      auto identifierAndLocation = ReadIdentifierName(/*allowDeprecatedSpacesInName=*/ false);
      auto child =
          gd::make_unique<VariableAccessorNode>(identifierAndLocation.name);
      if (identifierAndLocation.name.empty()) {
        child->diagnostic = RaiseSyntaxError(_("A name should be entered after the dot."));
      }

      SkipAllWhitespaces();
      if (CheckIfChar(IsOpeningSquareBracket) || CheckIfChar(IsDot)) {
        child->child = VariableAccessorOrVariableBracketAccessor();
        child->child->parent = child.get();
      }
      child->nameLocation = identifierAndLocation.location;
      child->dotLocation = dotLocation;
      child->location =
          ExpressionParserLocation(childStartPosition, GetCurrentPosition());

      return std::move(child);
    }

    // Should never happen, unless a node called this function without checking if the current character
    // was a dot or an opening bracket - this means there is an error in the grammar.
    auto unrecognisedNode = gd::make_unique<VariableAccessorOrVariableBracketAccessorNode>();
    unrecognisedNode->diagnostic = RaiseSyntaxError(_("A dot or bracket was expected here."));
    return std::move(unrecognisedNode);
  }

  std::unique_ptr<FunctionCallNode> FreeFunction(
      const gd::String &functionFullName,
      const ExpressionParserLocation &identifierLocation,
      const ExpressionParserLocation &openingParenthesisLocation) {
    // TODO: error if trying to use function for type != "number" && != "string"
    // + Test for it

    auto function =
        gd::make_unique<FunctionCallNode>(functionFullName);
    auto parametersNode = Parameters(function.get());
    function->parameters = std::move(parametersNode.parameters);
    function->diagnostic = std::move(parametersNode.diagnostic);

    function->location = ExpressionParserLocation(
        identifierLocation.GetStartPosition(), GetCurrentPosition());
    function->functionNameLocation = identifierLocation;
    function->openingParenthesisLocation = openingParenthesisLocation;
    function->closingParenthesisLocation =
        parametersNode.closingParenthesisLocation;

    return std::move(function);
  }

  std::unique_ptr<IdentifierOrFunctionCallOrObjectFunctionNameOrEmptyNode>
  ObjectFunctionOrBehaviorFunctionOrVariable(
      const gd::String &parentIdentifier,
      const ExpressionParserLocation &parentIdentifierLocation,
      const ExpressionParserLocation &parentIdentifierDotLocation) {
    auto childIdentifierAndLocation = ReadIdentifierName(/*allowDeprecatedSpacesInName=*/ false);
    const gd::String &childIdentifierName = childIdentifierAndLocation.name;
    const auto &childIdentifierNameLocation =
        childIdentifierAndLocation.location;

    std::unique_ptr<gd::ExpressionParserError> emptyNameError = childIdentifierName.empty() ?
      RaiseSyntaxError(_("A name should be entered after the dot.")) : nullptr;

    SkipAllWhitespaces();

    if (IsNamespaceSeparator()) {
      ExpressionParserLocation namespaceSeparatorLocation =
          SkipNamespaceSeparator();
      SkipAllWhitespaces();
      auto behaviorFunction = BehaviorFunction(parentIdentifier,
                              childIdentifierName,
                              parentIdentifierLocation,
                              parentIdentifierDotLocation,
                              childIdentifierNameLocation,
                              namespaceSeparatorLocation);

      if (emptyNameError) behaviorFunction->diagnostic = std::move(emptyNameError);
      return std::move(behaviorFunction);
    } else if (CheckIfChar(IsOpeningParenthesis)) {
      ExpressionParserLocation openingParenthesisLocation = SkipChar();

      auto function = gd::make_unique<FunctionCallNode>(
          parentIdentifier,
          childIdentifierName);
      auto parametersNode = Parameters(function.get(), parentIdentifier);
      function->parameters = std::move(parametersNode.parameters),
      function->diagnostic = emptyNameError ? std::move(emptyNameError) : std::move(parametersNode.diagnostic);

      function->location = ExpressionParserLocation(
          parentIdentifierLocation.GetStartPosition(), GetCurrentPosition());
      function->objectNameLocation = parentIdentifierLocation;
      function->objectNameDotLocation = parentIdentifierDotLocation;
      function->functionNameLocation = childIdentifierNameLocation;
      function->openingParenthesisLocation = openingParenthesisLocation;
      function->closingParenthesisLocation =
          parametersNode.closingParenthesisLocation;
      return std::move(function);
    } else if (CheckIfChar(IsDot) || CheckIfChar(IsOpeningSquareBracket)) {
      auto variable = gd::make_unique<VariableNode>(parentIdentifier);
      variable->diagnostic = std::move(emptyNameError);

      auto child =
          gd::make_unique<VariableAccessorNode>(childIdentifierName);
      child->child = VariableAccessorOrVariableBracketAccessor();
      child->child->parent = child.get();
      child->nameLocation = childIdentifierNameLocation;
      child->dotLocation = parentIdentifierDotLocation;
      child->location = ExpressionParserLocation(
          parentIdentifierDotLocation.GetStartPosition(), GetCurrentPosition());
      variable->child = std::move(child);
      variable->child->parent = variable.get();

      variable->location = ExpressionParserLocation(
          parentIdentifierLocation.GetStartPosition(), GetCurrentPosition());
      variable->nameLocation = parentIdentifierLocation;

      return std::move(variable);
    }

    auto node = gd::make_unique<IdentifierNode>(
        parentIdentifier, childIdentifierName);
    node->location = ExpressionParserLocation(
        parentIdentifierLocation.GetStartPosition(), GetCurrentPosition());
    node->identifierNameLocation = parentIdentifierLocation;
    node->identifierNameDotLocation = parentIdentifierDotLocation;
    node->childIdentifierNameLocation = childIdentifierNameLocation;
    node->diagnostic = std::move(emptyNameError);
    return std::move(node);
  }

  std::unique_ptr<FunctionCallOrObjectFunctionNameOrEmptyNode> BehaviorFunction(
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

      auto function = gd::make_unique<FunctionCallNode>(
          objectName,
          behaviorName,
          functionName);
      auto parametersNode =
          Parameters(function.get(), objectName, behaviorName);
      function->parameters = std::move(parametersNode.parameters);
      function->diagnostic = std::move(parametersNode.diagnostic);

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
          objectName, behaviorName, functionName);
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
      FunctionCallNode *functionCallNode,
      const gd::String &objectName = "",
      const gd::String &behaviorName = "") {
    std::vector<std::unique_ptr<ExpressionNode>> parameters;
    gd::String lastObjectName = "";

    bool previousCharacterIsParameterSeparator = false;
    while (!IsEndReached()) {
      SkipAllWhitespaces();

      if (CheckIfChar(IsClosingParenthesis) && !previousCharacterIsParameterSeparator) {
        auto closingParenthesisLocation = SkipChar();
        return ParametersNode{
            std::move(parameters), nullptr, closingParenthesisLocation};
      }
      bool isEmptyParameter = CheckIfChar(IsParameterSeparator)
          || (CheckIfChar(IsClosingParenthesis) && previousCharacterIsParameterSeparator);
      auto parameter = isEmptyParameter ? gd::make_unique<EmptyNode>() : Expression();
      parameter->parent = functionCallNode;
      parameters.push_back(std::move(parameter));

      SkipAllWhitespaces();
      previousCharacterIsParameterSeparator = CheckIfChar(IsParameterSeparator);
      SkipIfChar(IsParameterSeparator);
    }

    ExpressionParserLocation invalidClosingParenthesisLocation;
    return ParametersNode{
        std::move(parameters),
        RaiseSyntaxError(_("The list of parameters is not terminated. Add a "
                           "closing parenthesis to end the parameters.")),
        invalidClosingParenthesisLocation};
  }
  ///@}

  std::unique_ptr<ExpressionParserDiagnostic> ValidateOperator(
      gd::String::value_type operatorChar) {
    if (operatorChar == '+' || operatorChar == '-' || operatorChar == '/' ||
        operatorChar == '*') {
      return gd::make_unique<ExpressionParserDiagnostic>();
    }
    return gd::make_unique<ExpressionParserError>(
        "invalid_operator",
        _("You've used an operator that is not supported. Operator should be "
          "either +, -, / or *."),
        GetCurrentPosition());
  }

  std::unique_ptr<ExpressionParserDiagnostic> ValidateUnaryOperator(
      gd::String::value_type operatorChar,
      size_t position) {
    if (operatorChar == '+' || operatorChar == '-') {
      return gd::make_unique<ExpressionParserDiagnostic>();
    }

    return gd::make_unique<ExpressionParserError>(
        "invalid_operator",
        _("You've used an \"unary\" operator that is not supported. Operator "
          "should be "
          "either + or -."),
        position);
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

  IdentifierAndLocation ReadIdentifierName(bool allowDeprecatedSpacesInName = true) {
    gd::String name;
    size_t startPosition = currentPosition;
    while (currentPosition < expression.size() &&
           (CheckIfChar(IsAllowedInIdentifier)
            // Allow whitespace in identifier name for compatibility
            || (allowDeprecatedSpacesInName && expression[currentPosition] == ' '))) {
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

  std::unique_ptr<EmptyNode> ReadUntilWhitespace() {
    size_t startPosition = GetCurrentPosition();
    gd::String text;
    while (currentPosition < expression.size() &&
           !IsWhitespace(expression[currentPosition])) {
      text += expression[currentPosition];
      currentPosition++;
    }

    auto node = gd::make_unique<EmptyNode>(text);
    node->location =
        ExpressionParserLocation(startPosition, GetCurrentPosition());
    return node;
  }

  std::unique_ptr<EmptyNode> ReadUntilEnd() {
    size_t startPosition = GetCurrentPosition();
    gd::String text;
    while (currentPosition < expression.size()) {
      text += expression[currentPosition];
      currentPosition++;
    }

    auto node = gd::make_unique<EmptyNode>(text);
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
  ///@}

  gd::String expression;
  std::size_t currentPosition;

  static gd::String NAMESPACE_SEPARATOR;
};

}  // namespace gd

#endif  // GDCORE_EXPRESSIONPARSER2_H
