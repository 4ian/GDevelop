#pragma once
#include "GDCore/String.h"

namespace gd {

/**
 * Contains functions to handle the grammar of the expressions accepted by GDevelop.
 */
namespace GrammarTerminals {

inline bool IsWhitespace(gd::String::value_type character) {
  return character == ' ' || character == '\n' || character == '\r';
}

inline bool IsParameterSeparator(gd::String::value_type character) {
  return character == ',';
}

inline bool IsDot(gd::String::value_type character) { return character == '.'; }

inline bool IsQuote(gd::String::value_type character) {
  return character == '"';
}

inline bool IsBracket(gd::String::value_type character) {
  return character == '(' || character == ')' || character == '[' ||
         character == ']' || character == '{' || character == '}';
}

inline bool IsOpeningParenthesis(gd::String::value_type character) {
  return character == '(';
}

inline bool IsClosingParenthesis(gd::String::value_type character) {
  return character == ')';
}

inline bool IsOpeningSquareBracket(gd::String::value_type character) {
  return character == '[';
}

inline bool IsClosingSquareBracket(gd::String::value_type character) {
  return character == ']';
}

inline bool IsExpressionEndingChar(gd::String::value_type character) {
  return character == ',' || IsClosingParenthesis(character) ||
         IsClosingSquareBracket(character);
}

inline bool IsExpressionOperator(gd::String::value_type character) {
  return character == '+' || character == '-' || character == '<' ||
         character == '>' || character == '?' || character == '^' ||
         character == '=' || character == '\\' || character == ':' ||
         character == '!';
}

inline bool IsUnaryOperator(gd::String::value_type character) {
  return character == '+' || character == '-';
}

inline bool IsTermOperator(gd::String::value_type character) {
  return character == '/' || character == '*';
}

inline bool IsNumberFirstChar(gd::String::value_type character) {
  return character == '.' || (character >= '0' && character <= '9');
}

inline bool IsNonZeroDigit(gd::String::value_type character) {
  return (character >= '1' && character <= '9');
}

inline bool IsZeroDigit(gd::String::value_type character) {
  return character == '0';
}

inline bool IsAdditionalReservedCharacter(gd::String::value_type character) {
  // These characters are not part of the grammar - but are often used in programming language
  // and could become operators or part of the grammar one day.
  return character == '~' || character == '\'' || character == '%' ||
         character == '#' || character == '@' || character == '|' ||
         character == '&' || character == '`' || character == '$' ||
         character == ';';

}

/**
 * Check if the given character can be used in an identifier. This is
 * any unicode character, except for:
 * `, . " () [] {} + - < > ? ^ = \ : ! / * ~ ' % # @ | & $ ;`
 * and backtick and whitespaces (space, line break, carriage return).
 *
 * This is loosely based on what is allowed in languages like JavaScript
 * (see https://mathiasbynens.be/notes/javascript-properties), without support
 * for unicode escape syntax, and allowing all unicode ranges. The only
 * disallowed characters are the one used for the grammar.
 */
inline bool IsAllowedInIdentifier(gd::String::value_type character) {
  // Quickly compare if the character is a number or ASCII character.
  if ((character >= '0' && character <= '9') ||
      (character >= 'A' && character <= 'Z') ||
      (character >= 'a' && character <= 'z'))
    return true;

  // Otherwise do the full check against separators forbidden in identifiers.
  if (!IsParameterSeparator(character) && !IsDot(character) &&
      !IsQuote(character) && !IsBracket(character) &&
      !IsExpressionOperator(character) && !IsTermOperator(character) &&
      !IsWhitespace(character) && !IsAdditionalReservedCharacter(character)) {
    return true;
  }

  return false;
}

}  // namespace GrammarTerminals
}  // namespace gd