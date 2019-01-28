/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "GDCore/Events/Parsers/VariableParser.h"
#include <vector>
#include "GDCore/String.h"
namespace gd {
class Layout;
}
namespace gd {
class Project;
}
namespace gd {
class Platform;
}
#include "GDCore/Tools/Localization.h"

namespace gd {

VariableParser::~VariableParser() {}

bool VariableParser::Parse(VariableParserCallbacks& callbacks_) {
  callbacks = &callbacks_;
  rootVariableParsed = false;
  firstErrorStr.clear();
  firstErrorPos = 0;
  currentPositionIt = expression.begin();
  currentTokenType = TS_INVALID;
  currentToken.clear();
  S();

  return firstErrorStr == "";
}

void VariableParser::ReadToken() {
  currentTokenType = TS_INVALID;
  currentToken.clear();
  while (currentPositionIt != expression.end()) {
    char32_t currentChar = *currentPositionIt;
    if (currentChar == U'[' || currentChar == U']' || currentChar == U'.') {
      if (currentTokenType == TS_VARNAME)
        return;  // We've parsed a variable name.
    }

    if (currentChar == U'[') {
      currentTokenType = TS_OPENING_BRACKET;
      currentToken.clear();
      ++currentPositionIt;
      return;
    } else if (currentChar == U']') {
      currentTokenType = TS_CLOSING_BRACKET;
      currentToken.clear();
      ++currentPositionIt;
      return;
    } else if (currentChar == U'.') {
      currentTokenType = TS_PERIOD;
      currentToken.clear();
      ++currentPositionIt;
      return;
    }

    currentTokenType = TS_VARNAME;  // We're parsing a variable name.
    currentToken.push_back(currentChar);
    ++currentPositionIt;
  }

  // Can be reached if we are at the end of the expression. In this case,
  // currentTokenType will be either TS_VARNAME or TS_INVALID.
}

void VariableParser::S() {
  ReadToken();
  if (currentTokenType != TS_VARNAME) {
    firstErrorStr = _("Expecting a variable name.");
    firstErrorPos = std::distance<gd::String::const_iterator>(
        expression.begin(), currentPositionIt);
    return;
  }

  if (!rootVariableParsed) {
    rootVariableParsed = true;
    if (callbacks) callbacks->OnRootVariable(currentToken);
  } else if (callbacks)
    callbacks->OnChildVariable(currentToken);

  X();
}

void VariableParser::X() {
  ReadToken();
  if (currentTokenType == TS_INVALID)
    return;  // Ended parsing.
  else if (currentTokenType == TS_PERIOD)
    S();
  else if (currentTokenType == TS_OPENING_BRACKET) {
    gd::String strExpr = SkipStringExpression();

    ReadToken();
    if (currentTokenType != TS_CLOSING_BRACKET) {
      firstErrorStr = _("Expecting ]");
      firstErrorPos = std::distance<gd::String::const_iterator>(
          expression.begin(), currentPositionIt);
      return;
    }
    if (callbacks) callbacks->OnChildSubscript(strExpr);
    X();
  }
}

gd::String VariableParser::SkipStringExpression() {
  gd::String stringExpression;
  bool insideStringLiteral = false;
  bool lastCharacterWasBackslash = false;
  unsigned int nestedBracket = 0;
  while (currentPositionIt != expression.end()) {
    char32_t currentChar = *currentPositionIt;
    if (currentChar == U'\"') {
      if (!insideStringLiteral)
        insideStringLiteral = true;
      else if (!lastCharacterWasBackslash)
        insideStringLiteral = false;
    } else if (currentChar == U'[' && !insideStringLiteral) {
      nestedBracket++;
    } else if (currentChar == U']' && !insideStringLiteral) {
      if (nestedBracket == 0)
        return stringExpression;  // Found the end of the string litteral.
      nestedBracket--;
    }

    lastCharacterWasBackslash = currentChar == U'\\';
    stringExpression.push_back(currentChar);
    ++currentPositionIt;
  }

  // End of the expression reached (so expression is invalid by the way)
  return stringExpression;
}

}  // namespace gd
