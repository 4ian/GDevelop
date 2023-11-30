/*
 * GDevelop Core
 * Copyright 2008-present Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "GDCore/Events/Parsers/ExpressionParser2.h"

#include <algorithm>
#include <memory>
#include <vector>

#include "GDCore/CommonTools.h"
#include "GDCore/Events/Expression.h"
#include "GDCore/Extensions/Metadata/ExpressionMetadata.h"
#include "GDCore/Extensions/Metadata/InstructionMetadata.h"
#include "GDCore/Extensions/Metadata/MetadataProvider.h"
#include "GDCore/Extensions/Platform.h"
#include "GDCore/Project/Layout.h"
#include "GDCore/Project/Project.h"
#include "GDCore/Tools/Localization.h"
#include "GDCore/Tools/MakeUnique.h"
#include "GrammarTerminals.h"

using namespace std;
using namespace gd::GrammarTerminals;

namespace gd {

gd::String ExpressionParser2::NAMESPACE_SEPARATOR = "::";

ExpressionParser2::ExpressionParser2()
    : expression(""),
      currentPosition(0) {}

std::unique_ptr<TextNode> ExpressionParser2::ReadText() {
  size_t textStartPosition = GetCurrentPosition();
  SkipAllWhitespaces();
  if (!CheckIfChar(IsQuote)) {
    auto text = gd::make_unique<TextNode>("");
	  // It can't happen.
    text->diagnostic =
        RaiseSyntaxError(_("A text must start with a double quote (\")."));
    text->location =
        ExpressionParserLocation(textStartPosition, GetCurrentPosition());
    return text;
  }
  SkipChar();

  gd::String parsedText = "";
  bool textParsingHasEnded = false;
  bool expectEscapedCharacter = false;
  while (!IsEndReached() && !textParsingHasEnded) {
    if (GetCurrentChar() == '"') {
      if (expectEscapedCharacter) {
        parsedText += '"';
        expectEscapedCharacter = false;
      } else {
        textParsingHasEnded = true;
      }
    } else if (GetCurrentChar() == '\\') {
      if (expectEscapedCharacter) {
        parsedText += '\\';
        expectEscapedCharacter = false;
      } else {
        expectEscapedCharacter = true;
      }
    } else {
      if (expectEscapedCharacter) {
        parsedText += '\\';
      }

      parsedText += GetCurrentChar();
    }

    currentPosition++;
  }

  auto text = gd::make_unique<TextNode>(parsedText);
  text->location =
      ExpressionParserLocation(textStartPosition, GetCurrentPosition());
  if (!textParsingHasEnded) {
    text->diagnostic =
        RaiseSyntaxError(_("A text must end with a double quote (\"). Add a "
                           "double quote to terminate the text."));
  }

  return text;
}

std::unique_ptr<NumberNode> ExpressionParser2::ReadNumber() {
  size_t numberStartPosition = GetCurrentPosition();
  SkipAllWhitespaces();
  gd::String parsedNumber;

  bool numberHasStarted = false;
  bool digitFound = false;
  bool dotFound = false;
  while (!IsEndReached()) {
    if (CheckIfChar(IsZeroDigit)) {
      numberHasStarted = true;
      digitFound = true;
      if (!parsedNumber.empty()) {  // Ignore leading 0s.
        parsedNumber += GetCurrentChar();
      }
    } else if (CheckIfChar(IsNonZeroDigit)) {
      numberHasStarted = true;
      digitFound = true;
      parsedNumber += GetCurrentChar();
    } else if (CheckIfChar(IsDot) && !dotFound) {
      numberHasStarted = true;
      dotFound = true;
      if (parsedNumber == "") {
        parsedNumber +=
            "0.";  // Normalize by adding a leading 0, only in this case.
      } else {
        parsedNumber += ".";
      }
    } else {
      break;
    }

    currentPosition++;
  }

  // parsedNumber can be empty in the only case where we have only seen
  // 0s (one or more), so normalize it to a single 0.
  if (parsedNumber.empty()) {
    parsedNumber = "0";
  }

  // Note that parsedNumber can finish by a dot (1., 2., 0.). This is
  // valid in most languages so we allow this.

  auto number = gd::make_unique<NumberNode>(parsedNumber);
  number->location =
      ExpressionParserLocation(numberStartPosition, GetCurrentPosition());
  if (!numberHasStarted || !digitFound) {
    number->diagnostic = RaiseSyntaxError(
        _("A number was expected. You must enter a number here."));
  }

  return number;
}

}  // namespace gd
