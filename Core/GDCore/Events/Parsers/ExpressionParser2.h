/*
 * GDevelop Core
 * Copyright 2008-present Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#ifndef GDCORE_EXPRESSIONPARSER2_H
#define GDCORE_EXPRESSIONPARSER2_H

#include <memory>
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

  std::unique_ptr<ExpressionNode> ParseExpression(
      const gd::String &type,  // TODO: enumify type? "string", "number",
                               // "identifier", "variable", "unknown"
      const gd::String &expression_) {
    expression = expression_;

    currentPosition = 0;
    return Start(type);
  }

 private:
  /** \name Grammar
   * Each method is a part of the grammar.
   */
  ///@{
  std::unique_ptr<ExpressionNode> Start(const gd::String &type) {
    auto expression = Expression(type);
    if (!IsEndReached() && !expression->diagnostic->IsError()) {
      expression->diagnostic = RaiseSyntaxError(
          _("The expression has extra character at the end that should be "
            "removed (or completed if your expression is not finished)."));
    }

    return expression;
  }

  std::unique_ptr<ExpressionNode> Expression(
      const gd::String &type, const gd::String &objectName = "") {
    SkipWhitespace();

    size_t expressionStartPosition = GetCurrentPosition();
    std::unique_ptr<ExpressionNode> leftHandSide;

    if (IsAnyChar("\"")) {
      leftHandSide = ReadText();
      if (type == "number")
        leftHandSide->diagnostic =
            RaiseTypeError(_("You entered a text, but a number was expected."),
                           expressionStartPosition);
      else if (type != "string")
        leftHandSide->diagnostic = RaiseTypeError(
            _("You entered a text, but this type was expected:") + type,
            expressionStartPosition);
    } else if (IsAnyChar(NUMBER_FIRST_CHAR)) {
      leftHandSide = ReadNumber();
      if (type == "string")
        leftHandSide->diagnostic = RaiseTypeError(
            _("You entered a number, but a text was expected (in quotes)."),
            expressionStartPosition);
      else if (type != "number")
        leftHandSide->diagnostic = RaiseTypeError(
            _("You entered a number, but this type was expected:") + type,
            expressionStartPosition);
    } else if (IsAnyChar("(")) {
      SkipChar();
      leftHandSide = SubExpression(type, objectName);

      if (!IsAnyChar(")")) {
        leftHandSide->diagnostic =
            RaiseSyntaxError(_("Missing a closing parenthesis. Add a closing "
                               "parenthesis for each opening parenthesis."));
      }
      SkipIfIsAnyChar(")");
    } else if (IsIdentifierAllowedChar()) {
      // This is a place where the grammar differs according to the
      // type being expected.
      if (gd::ParameterMetadata::IsExpression("variable", type)) {
        leftHandSide = Variable(type, objectName);
      } else {
        leftHandSide = Identifier(type);
      }
    } else {
      leftHandSide = gd::make_unique<EmptyNode>(type);
      leftHandSide->diagnostic = RaiseSyntaxError(
          _("You must enter a text, number or a valid expression call."));
    }

    SkipWhitespace();

    if (IsEndReached()) return leftHandSide;
    if (IsAnyChar(",)]")) return leftHandSide;
    if (IsAnyChar(OPERATORS)) {
      auto op = gd::make_unique<OperatorNode>();
      op->op = GetCurrentChar();
      op->leftHandSide = std::move(leftHandSide);
      op->diagnostic = ValidateOperator(type, GetCurrentChar());
      SkipChar();
      op->rightHandSide = Expression(type, objectName);
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
    return leftHandSide;
  }

  std::unique_ptr<SubExpressionNode> SubExpression(
      const gd::String &type, const gd::String &objectName) {
    return std::move(
        gd::make_unique<SubExpressionNode>(Expression(type, objectName)));
  };

  std::unique_ptr<IdentifierOrFunctionOrEmptyNode> Identifier(
      const gd::String &type) {
    size_t identifierStartPosition = GetCurrentPosition();
    gd::String name = ReadIdentifierName();

    SkipWhitespace();

    if (IsAnyChar("(")) {
      SkipChar();
      return FreeFunction(type, name, identifierStartPosition);
    } else if (IsAnyChar(".")) {
      SkipChar();
      return ObjectFunctionOrBehaviorFunction(
          type, name, identifierStartPosition);
    } else {
      auto identifier = gd::make_unique<IdentifierNode>(name);
      if (type == "string") {
        identifier->diagnostic =
            RaiseTypeError(_("You must wrap your text inside double quotes "
                             "(example: \"Hello world\")."),
                           identifierStartPosition);
      } else if (type == "number") {
        identifier->diagnostic = RaiseTypeError(_("You must enter a number."),
                                                identifierStartPosition);
      } else if (type != "identifier") {
        identifier->diagnostic = RaiseTypeError(
            _("You've entered an identifier, but this type was expected:") +
                type,
            identifierStartPosition);
      }

      return std::move(identifier);
    }
  }

  std::unique_ptr<VariableNode> Variable(const gd::String &type,
                                         const gd::String &objectName) {
    size_t identifierStartPosition = GetCurrentPosition();

    gd::String name = ReadIdentifierName();
    auto variable = gd::make_unique<VariableNode>(type, name, objectName);
    variable->child = VariableAccessorOrVariableBracketAccessor();

    return std::move(variable);
  }

  std::unique_ptr<VariableAccessorOrVariableBracketAccessorNode>
  VariableAccessorOrVariableBracketAccessor() {
    std::unique_ptr<VariableAccessorOrVariableBracketAccessorNode> child;
    SkipWhitespace();
    if (IsAnyChar("[")) {
      SkipChar();
      child =
          gd::make_unique<VariableBracketAccessorNode>(Expression("string"));

      if (!IsAnyChar("]")) {
        child->diagnostic =
            RaiseSyntaxError(_("Missing a closing bracket. Add a closing "
                               "bracket for each opening bracket."));
      }
      SkipIfIsAnyChar("]");
      child->child = VariableAccessorOrVariableBracketAccessor();
    } else if (IsAnyChar(".")) {
      SkipChar();
      SkipWhitespace();

      child = gd::make_unique<VariableAccessorNode>(ReadIdentifierName());
      child->child = VariableAccessorOrVariableBracketAccessor();
    }

    return child;
  }

  std::unique_ptr<FunctionNode> FreeFunction(const gd::String &type,
                                             const gd::String &functionFullName,
                                             size_t functionStartPosition) {
    // TODO: error if trying to use function for type != "number" && != "string"
    // + Test for it

    // This could be improved to have the type passed to a single
    // GetExpressionMetadata function.
    const gd::ExpressionMetadata &metadata =
        type == "number" ? MetadataProvider::GetExpressionMetadata(
                               platform, functionFullName)
                         : MetadataProvider::GetStrExpressionMetadata(
                               platform, functionFullName);

    auto function = gd::make_unique<FunctionNode>(
        type, Parameters(metadata.parameters), metadata, functionFullName);
    function->diagnostic = ValidateFunction(type,
                                            metadata,
                                            0,
                                            functionFullName,
                                            function->parameters,
                                            functionStartPosition);

    return std::move(function);
  }

  std::unique_ptr<FunctionOrEmptyNode> ObjectFunctionOrBehaviorFunction(
      const gd::String &type,
      const gd::String &objectName,
      size_t functionStartPosition) {
    gd::String objectFunctionOrBehaviorName = ReadIdentifierName();

    SkipWhitespace();

    if (IsAnyChar(":")) {
      SkipChar();
      if (IsAnyChar(":")) {
        SkipChar();
        return BehaviorFunction(type,
                                objectName,
                                objectFunctionOrBehaviorName,
                                functionStartPosition);
      }
    } else if (IsAnyChar("(")) {
      SkipChar();

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

      auto function = gd::make_unique<FunctionNode>(
          type,
          objectName,
          Parameters(metadata.parameters, objectName),
          metadata,
          objectFunctionOrBehaviorName);
      function->diagnostic = ValidateFunction(type,
                                              metadata,
                                              1,
                                              objectFunctionOrBehaviorName,
                                              function->parameters,
                                              functionStartPosition);

      return std::move(function);
    }

    auto node = gd::make_unique<EmptyNode>(type);
    node->diagnostic = RaiseSyntaxError(
        _("An opening parenthesis (for an object expression), or double colon "
          "(::) was expected (for a behavior expression)."));

    return std::move(node);
  }

  std::unique_ptr<FunctionOrEmptyNode> BehaviorFunction(
      const gd::String &type,
      const gd::String &objectName,
      const gd::String &behaviorName,
      size_t functionStartPosition) {
    gd::String functionName = ReadIdentifierName();

    SkipWhitespace();

    if (IsAnyChar("(")) {
      SkipChar();

      gd::String behaviorType = GetTypeOfBehavior(
          globalObjectsContainer, objectsContainer, behaviorName);

      // This could be improved to have the type passed to a single
      // GetExpressionMetadata function.
      const gd::ExpressionMetadata &metadata =
          type == "number" ? MetadataProvider::GetBehaviorExpressionMetadata(
                                 platform, behaviorType, functionName)
                           : MetadataProvider::GetBehaviorStrExpressionMetadata(
                                 platform, behaviorType, functionName);

      auto function = gd::make_unique<FunctionNode>(
          type,
          objectName,
          behaviorName,
          Parameters(metadata.parameters, objectName, behaviorName),
          metadata,
          functionName);
      function->diagnostic = ValidateFunction(type,
                                              metadata,
                                              2,
                                              functionName,
                                              function->parameters,
                                              functionStartPosition);

      return std::move(function);
    } else {
      auto node = gd::make_unique<EmptyNode>(type);
      node->diagnostic = RaiseSyntaxError(
          _("An opening parenthesis was expected here to call a function."));

      return std::move(node);
    }
  }

  std::vector<std::unique_ptr<ExpressionNode>> Parameters(
      std::vector<gd::ParameterMetadata> parameterMetadata,
      const gd::String &objectName = "",
      const gd::String &behaviorName = "") {
    std::vector<std::unique_ptr<ExpressionNode>> parameters;

    // By convention, object is always the first parameter, and behavior the
    // second one.
    size_t parameterIndex =
        !behaviorName.empty() ? 2 : (!objectName.empty() ? 1 : 0);

    while (!IsEndReached()) {
      SkipWhitespace();

      if (IsAnyChar(")")) {
        SkipChar();
        return std::move(parameters);
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
          } else {
            parameters.push_back(Expression("identifier"));
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

        SkipWhitespace();
        SkipIfIsAnyChar(",");
        parameterIndex++;
      }
    }

    parameters.push_back(gd::make_unique<EmptyNode>("unknown"));
    parameters.back()->diagnostic =
        RaiseSyntaxError(_("The list of parameters is not terminated. Add a "
                           "closing parenthesis to end the parameters."));
    return std::move(parameters);
  }
  ///@}

  /** \name Validators
   * Return a diagnostic if any error is found
   */
  ///@{
  std::unique_ptr<ExpressionParserDiagnostic> ValidateFunction(
      const gd::String &type,
      const gd::ExpressionMetadata &metadata,
      size_t skippedParametersCount,
      const gd::String &functionFullName,
      const std::vector<std::unique_ptr<ExpressionNode>> &parameters,
      size_t functionStartPosition);

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
    } else if (type == "identifier") {
      return gd::make_unique<ExpressionParserError>(
          "invalid_operator",
          _("Operators (+, -, /, *) should not be used there."),
          GetCurrentPosition());
    }

    return gd::make_unique<ExpressionParserDiagnostic>();
  }
  ///@}

  /** \name Parsing tokens
   * Read tokens or characters
   */
  ///@{
  void SkipChar() { currentPosition++; }

  void SkipWhitespace() {
    while (currentPosition < expression.size() &&
           (expression[currentPosition] == ' ' ||
            (expression[currentPosition] == '\n') ||
            (expression[currentPosition] == '\r'))) {
      currentPosition++;
    }
  }

  void SkipIfIsAnyChar(const gd::String &allowedCharacters) {
    if (IsAnyChar(allowedCharacters)) {
      currentPosition++;
    }
  }

  bool IsAnyChar(const gd::String &allowedCharacters) {
    if (currentPosition < expression.size() &&
        allowedCharacters.find(expression[currentPosition]) !=
            gd::String::npos) {
      return true;
    }

    return false;
  }

  bool IsIdentifierAllowedChar() {
    if (currentPosition < expression.size() &&
        IDENTIFIER_SEPARATOR_CHAR.find(expression[currentPosition]) ==
            gd::String::npos) {
      return true;
    }

    return false;
  }

  bool IsEndReached() { return currentPosition >= expression.size(); }

  gd::String ReadIdentifierName() {
    gd::String name;
    while (currentPosition < expression.size() &&
           (IsIdentifierAllowedChar()
            // Allow whitespace in identifier name for compatibility
            || expression[currentPosition] == ' ')) {
      name += expression[currentPosition];
      currentPosition++;
    }

    // Trim whitespace at the end (we allow them for compatibility inside
    // the name, but after the last character that is not whitespace, they
    // should be ignore again).
    size_t lastCharacterPos = name.find_last_not_of(" ");
    if (!name.empty() && (lastCharacterPos + 1) < name.size()) {
      name.erase(lastCharacterPos + 1);
    }

    return name;
  }

  std::unique_ptr<TextNode> ReadText();

  std::unique_ptr<NumberNode> ReadNumber();

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

  const gd::Platform &platform;
  const gd::ObjectsContainer &globalObjectsContainer;
  const gd::ObjectsContainer &objectsContainer;

  static gd::String NUMBER_FIRST_CHAR;
  static gd::String IDENTIFIER_SEPARATOR_CHAR;
  static gd::String OPERATORS;
};

}  // namespace gd

#endif  // GDCORE_EXPRESSIONPARSER2_H
