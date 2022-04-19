/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */

#include "GDCore/Events/Expression.h"

#include "GDCore/Events/Parsers/ExpressionParser2.h"
#include "GDCore/String.h"

namespace gd {

Expression::Expression() : node(nullptr), parserObjectsContainer(nullptr){};

Expression::Expression(gd::String plainString_)
    : node(nullptr), parserObjectsContainer(nullptr), plainString(plainString_){};

Expression::Expression(const char* plainString_)
    : node(nullptr), parserObjectsContainer(nullptr), plainString(plainString_){};

Expression::Expression(const Expression& copy)
    : node(nullptr), parserObjectsContainer(nullptr), plainString{copy.plainString} {};

Expression& Expression::operator=(const Expression& expression) {
  plainString = expression.plainString;
  node = nullptr;
  return *this;
};

Expression::~Expression(){};

ExpressionNode* Expression::GetRootNode(
    const gd::String& type, gd::ExpressionParser2& parser) const {
  if (!node) {
    node = std::move(parser.ParseExpression(type, plainString));
    parserObjectsContainer = &parser.GetObjectsContainer();
  }
  if (&parser.GetObjectsContainer() != parserObjectsContainer) {
      std::cout << "Unable to get events from a link ( Invalid start )"
                << std::endl;
  }
  return node.get();
}

}  // namespace gd
