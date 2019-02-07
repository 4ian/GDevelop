/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#ifndef GDCORE_VARIABLEPARSER_H
#define GDCORE_VARIABLEPARSER_H

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
namespace gd {
class VariableParserCallbacks;
}

namespace gd {

/** \brief Parse a variable expression.
 *
 * Parse an variable expression ( like
myVariable.child["subchild"+ToString(i)].subsubchild ),
 * calling callbacks when a token is reached.
 *
 * Usage example:
\code
    //...

    //VariableCodeGenerationCallbacks is a class inheriting from
gd::VariableParserCallbacks VariableCodeGenerationCallbacks callbacks(output,
*this, context, VariableCodeGenerationCallbacks::PROJECT_VARIABLE);

    gd::VariableParser parser(parameter);
    if ( !parser.Parse(callbacks) )
        cout << "Error :" << parser.GetFirstError() << " in: "<< parameter <<
endl;
\endcode
 *
 * Here is the parsed grammar:   <br>
 * S -> VarName X  <br>
 * X -> e | . S | [StringExpression] X   <br>
 *
 * where e = nothing (end of expression), StringExpression = A valid string
expression and
 * S is the start.
 *
 * \see gd::VariableParserCallbacks
 */
class GD_CORE_API VariableParser {
 public:
  /**
   * \brief Default constructor
   * \param expressionPlainString The string representing the expression to be
   * parsed.
   */
  VariableParser(const gd::String& expressionPlainString_)
      : currentPositionIt(), expression(expressionPlainString_){};
  virtual ~VariableParser();

  /**
   * Parse the expression, calling each callback when necessary.
   * \param callbacks The callbacks to be called.
   * \return true if expression was correctly parsed.
   * \see gd::VariableParserCallbacks
   */
  bool Parse(VariableParserCallbacks& callbacks);

  /**
   * \brief Return the description of the error that was found
   */
  const gd::String& GetFirstError() { return firstErrorStr; }

  /**
   * \brief Return the position of the error that was found
   * \return The position, or gd::String::npos if no error is found
   */
  size_t GetFirstErrorPosition() { return firstErrorPos; }

  gd::String firstErrorStr;
  size_t firstErrorPos;

 private:
  void S();
  void X();

  /**
   * \brief Skip the string expression, starting from the current position.
   * \return The string expression skipped. currentPosition is now put on the
   * closing bracket.
   */
  gd::String SkipStringExpression();

  void ReadToken();

  enum TokenType {
    TS_PERIOD,
    TS_OPENING_BRACKET,
    TS_CLOSING_BRACKET,
    TS_VARNAME,
    TS_INVALID
  };

  TokenType currentTokenType;
  gd::String currentToken;
  gd::String::const_iterator currentPositionIt;
  gd::String expression;

  VariableParserCallbacks* callbacks;
  bool rootVariableParsed;
};

/**
 * \brief Callbacks called by VariableParser when parsing a variable expression.
 */
class GD_CORE_API VariableParserCallbacks {
 public:
  /**
   * \brief Called when the first variable has been parsed. ( varName1 in
   * varName1.child for example. ) \param variableName The variable name.
   */
  virtual void OnRootVariable(gd::String variableName) = 0;

  /**
   * \brief Called when accessing the child of a structure variable. ( child in
   * varName1.child for example. ) \param variableName The child variable name.
   */
  virtual void OnChildVariable(gd::String variableName) = 0;

  /**
   * \brief Called when accessing the child of a structure variable using a
   * string expression in square brackets. ( "subscript" in
   * varName1["subscript"] for example. )
   *
   * \param variableName The expression used to access the child variable.
   */
  virtual void OnChildSubscript(gd::String stringExpression) = 0;
};

}  // namespace gd

#endif  // GDEXPRESSIONPARSER_H
