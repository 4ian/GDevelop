/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "GDCore/IDE/Events/ExpressionNodeLocationFinder.h"
#include "DummyPlatform.h"
#include "GDCore/Events/Parsers/ExpressionParser2.h"
#include "GDCore/Extensions/Platform.h"
#include "GDCore/Extensions/PlatformExtension.h"
#include "GDCore/Project/Layout.h"
#include "GDCore/Project/Project.h"
#include "catch.hpp"

template <class TNode>
bool CheckNodeAtLocationIs(gd::ExpressionParser2& parser,
                           const gd::String& type,
                           const gd::String& expression,
                           size_t searchPosition) {
  auto node = parser.ParseExpression(type, expression);
  REQUIRE(node != nullptr);
  return dynamic_cast<TNode*>(
             gd::ExpressionNodeLocationFinder::GetNodeAtPosition(
                 *node, searchPosition)) != nullptr;
}

template <class TNode>
bool CheckParentNodeAtLocationIs(gd::ExpressionParser2& parser,
                           const gd::String& type,
                           const gd::String& expression,
                           size_t searchPosition) {
  auto node = parser.ParseExpression(type, expression);
  REQUIRE(node != nullptr);
  return dynamic_cast<TNode*>(
             gd::ExpressionNodeLocationFinder::GetParentNodeAtPosition(
                 *node, searchPosition)) != nullptr;
}

bool CheckNoNodeAtLocation(gd::ExpressionParser2& parser,
                           const gd::String& type,
                           const gd::String& expression,
                           size_t searchPosition) {
  auto node = parser.ParseExpression(type, expression);
  REQUIRE(node != nullptr);
  return gd::ExpressionNodeLocationFinder::GetNodeAtPosition(
             *node, searchPosition) == nullptr;
}

bool CheckNoParentNodeAtLocation(gd::ExpressionParser2& parser,
                           const gd::String& type,
                           const gd::String& expression,
                           size_t searchPosition) {
  auto node = parser.ParseExpression(type, expression);
  REQUIRE(node != nullptr);
  return gd::ExpressionNodeLocationFinder::GetParentNodeAtPosition(
             *node, searchPosition) == nullptr;
}

TEST_CASE("ExpressionNodeLocationFinder", "[common][events]") {
  gd::Project project;
  gd::Platform platform;
  SetupProjectWithDummyPlatform(project, platform);
  auto& layout1 = project.InsertNewLayout("Layout1", 0);
  layout1.InsertNewObject(project, "MyExtension::Sprite", "MySpriteObject", 0);

  gd::ExpressionParser2 parser(platform, project, layout1);

  SECTION("Empty expressions") {
    SECTION("Test 1") {
      REQUIRE(CheckNodeAtLocationIs<gd::EmptyNode>(
                  parser, "string", "", 0) == true);
      REQUIRE(CheckNoNodeAtLocation(parser, "string", "", 1) ==
              true);
    }
    SECTION("Test 2") {
      REQUIRE(CheckNoNodeAtLocation(parser, "string", " ", 0) ==
              true);
      REQUIRE(CheckNodeAtLocationIs<gd::EmptyNode>(
                  parser, "string", " ", 1) == true);
      REQUIRE(CheckNoNodeAtLocation(parser, "string", " ", 2) ==
              true);
    }
  }

  SECTION("Valid text") {
    SECTION("Test 1") {
      REQUIRE(CheckNodeAtLocationIs<gd::TextNode>(
                  parser, "string", "\"Hello world\"", 0) == true);
    }
    SECTION("Test 2") {
      REQUIRE(CheckNodeAtLocationIs<gd::TextNode>(
                  parser, "string", "\"Hello world\"", 1) == true);
    }
    SECTION("Test 3") {
      REQUIRE(CheckNodeAtLocationIs<gd::TextNode>(
                  parser, "string", "\"Hello world\"", 12) == true);
    }
    SECTION("Test 4") {
      REQUIRE(CheckNoNodeAtLocation(parser, "string", "\"Hello world\"", 13) ==
              true);
    }
    SECTION("Test 5") {
      REQUIRE(CheckNoNodeAtLocation(parser, "string", "\"Hello world\"", 99) ==
              true);
    }
  }
  SECTION("Valid text operators") {
    SECTION("Test 1") {
      REQUIRE(CheckNodeAtLocationIs<gd::TextNode>(
                  parser, "string", "\"Hello \" + \"World\"", 1) == true);
      REQUIRE(CheckNodeAtLocationIs<gd::OperatorNode>(
                  parser, "string", "\"Hello \" + \"World\"", 8) == true);
      REQUIRE(CheckNodeAtLocationIs<gd::TextNode>(
                  parser, "string", "\"Hello \" + \"World\"", 15) == true);
    }
  }
  SECTION("Invalid texts") {
    REQUIRE(CheckNodeAtLocationIs<gd::TextNode>(parser, "string", "\"", 0) ==
            true);
    REQUIRE(CheckNoNodeAtLocation(parser, "string", "\"", 1) == true);
    REQUIRE(CheckNodeAtLocationIs<gd::TextNode>(parser, "string", "\"a", 1) ==
            true);
  }

  SECTION("Invalid parenthesis") {
    REQUIRE(CheckNodeAtLocationIs<gd::SubExpressionNode>(
                parser, "string", "((\"hello\"", 1) == true);
    REQUIRE(CheckNodeAtLocationIs<gd::TextNode>(
                parser, "string", "((\"hello\"", 2) == true);
  }

  SECTION("Invalid text operators") {
    SECTION("Test 1") {
      REQUIRE(CheckNodeAtLocationIs<gd::TextNode>(
                  parser, "string", "\"Hello \" - \"World\"", 0) == true);
      REQUIRE(CheckNodeAtLocationIs<gd::TextNode>(
                  parser, "string", "\"Hello \" - \"World\"", 1) == true);
      REQUIRE(CheckNodeAtLocationIs<gd::OperatorNode>(
                  parser, "string", "\"Hello \" / \"World\"", 8) == true);
      REQUIRE(CheckNodeAtLocationIs<gd::TextNode>(
                  parser, "string", "\"Hello \" * \"World\"", 15) == true);
    }
  }

  SECTION("Valid unary operators") {
    SECTION("Test 1") {
      REQUIRE(CheckNodeAtLocationIs<gd::UnaryOperatorNode>(
                  parser, "number", "-123", 0) == true);
      REQUIRE(CheckNodeAtLocationIs<gd::UnaryOperatorNode>(
                  parser, "number", "+123", 0) == true);
      REQUIRE(CheckNodeAtLocationIs<gd::NumberNode>(
                  parser, "number", "-123", 1) == true);
      REQUIRE(CheckNodeAtLocationIs<gd::NumberNode>(
                  parser, "number", "-123", 2) == true);
      REQUIRE(CheckNodeAtLocationIs<gd::NumberNode>(
                  parser, "number", "-123", 3) == true);
      REQUIRE(CheckNoNodeAtLocation(parser, "number", "-123", 4) == true);
    }
    SECTION("Test 2") {
      REQUIRE(CheckNodeAtLocationIs<gd::UnaryOperatorNode>(
                  parser, "number", "-+-123", 0) == true);
      REQUIRE(CheckNodeAtLocationIs<gd::UnaryOperatorNode>(
                  parser, "number", "-+-123", 1) == true);
      REQUIRE(CheckNodeAtLocationIs<gd::UnaryOperatorNode>(
                  parser, "number", "-+-123", 2) == true);
      REQUIRE(CheckNodeAtLocationIs<gd::NumberNode>(
                  parser, "number", "-+-123", 3) == true);
    }
  }

  SECTION("Invalid number operators") {
    SECTION("Test 1") {
      REQUIRE(CheckNodeAtLocationIs<gd::NumberNode>(
                  parser, "number", "12 ! 34", 0) == true);
      REQUIRE(CheckNodeAtLocationIs<gd::NumberNode>(
                  parser, "number", "12 ! 34", 1) == true);
      REQUIRE(CheckNodeAtLocationIs<gd::OperatorNode>(
                  parser, "number", "12 ! 34", 2) == true);
      REQUIRE(CheckNodeAtLocationIs<gd::OperatorNode>(
                  parser, "number", "12 ! 34", 3) == true);
      REQUIRE(CheckNodeAtLocationIs<gd::OperatorNode>(
                  parser, "number", "12 ! 34", 4) == true);
      REQUIRE(CheckNodeAtLocationIs<gd::NumberNode>(
                  parser, "number", "12 ! 34", 5) == true);
      REQUIRE(CheckNodeAtLocationIs<gd::NumberNode>(
                  parser, "number", "12 ! 34", 6) == true);
    }
    SECTION("Test 2") {
      REQUIRE(CheckNodeAtLocationIs<gd::NumberNode>(
                  parser, "number", "1 / /2", 0) == true);
      REQUIRE(CheckNodeAtLocationIs<gd::OperatorNode>(
                  parser, "number", "1 / /2", 1) == true);
      REQUIRE(CheckNodeAtLocationIs<gd::OperatorNode>(
                  parser, "number", "1 / /2", 2) == true);
      REQUIRE(CheckNodeAtLocationIs<gd::OperatorNode>(
                  parser, "number", "1 / /2", 3) == true);
      REQUIRE(CheckNodeAtLocationIs<gd::EmptyNode>(
                  parser, "number", "1 / /2", 4) == true);
      REQUIRE(CheckNodeAtLocationIs<gd::EmptyNode>(
                  parser, "number", "1 / /2", 5) == true);
    }
  }

  SECTION("Numbers and texts mismatchs") {
    REQUIRE(CheckNodeAtLocationIs<gd::NumberNode>(parser, "number", "12+\"hello\"", 0) == true);
    REQUIRE(CheckNodeAtLocationIs<gd::NumberNode>(parser, "number", "12+\"hello\"", 1) == true);
    REQUIRE(CheckNodeAtLocationIs<gd::OperatorNode>(parser, "number", "12+\"hello\"", 2) == true);
    REQUIRE(CheckNodeAtLocationIs<gd::TextNode>(parser, "number", "12+\"hello\"", 3) == true);
  }

  SECTION("Numbers and texts mismatchs (parent node)") {
    REQUIRE(CheckParentNodeAtLocationIs<gd::OperatorNode>(parser, "number", "12+\"hello\"", 0) == true);
    REQUIRE(CheckParentNodeAtLocationIs<gd::OperatorNode>(parser, "number", "12+\"hello\"", 1) == true);
    REQUIRE(CheckNoParentNodeAtLocation(parser, "number", "12+\"hello\"", 2) == true);
    REQUIRE(CheckParentNodeAtLocationIs<gd::OperatorNode>(parser, "number", "12+\"hello\"", 3) == true);
  }

  SECTION("Valid objects") {
    REQUIRE(CheckNodeAtLocationIs<gd::IdentifierNode>(
                parser, "object", "HelloWorld1", 0) == true);
    REQUIRE(CheckNodeAtLocationIs<gd::IdentifierNode>(
                parser, "object", "HelloWorld1", 1) == true);
    REQUIRE(CheckNodeAtLocationIs<gd::IdentifierNode>(
                parser, "object", "HelloWorld1", 10) == true);
    REQUIRE(CheckNoNodeAtLocation(parser, "object", "HelloWorld1", 11) == true);
  }
  SECTION("Valid objects (parent node)") {
    REQUIRE(CheckNoParentNodeAtLocation(
                parser, "object", "HelloWorld1", 0) == true);
  }
  SECTION("Invalid objects") {
    REQUIRE(CheckNodeAtLocationIs<gd::IdentifierNode>(
                parser, "object", "a+b", 0) == true);
    REQUIRE(CheckNodeAtLocationIs<gd::OperatorNode>(
                parser, "object", "a+b", 1) == true);
    REQUIRE(CheckNodeAtLocationIs<gd::IdentifierNode>(
                parser, "object", "a+b", 2) == true);
    REQUIRE(CheckNoNodeAtLocation(parser, "object", "a+b", 3) == true);
  }
  SECTION("Valid function calls") {
    SECTION("Test 1") {
      REQUIRE(CheckNodeAtLocationIs<gd::NumberNode>(
                  parser, "number", "12 + MyExtension::GetNumber()", 0) ==
              true);
      REQUIRE(CheckNodeAtLocationIs<gd::NumberNode>(
                  parser, "number", "12 + MyExtension::GetNumber()", 1) ==
              true);
      REQUIRE(CheckNodeAtLocationIs<gd::OperatorNode>(
                  parser, "number", "12 + MyExtension::GetNumber()", 2) ==
              true);
      REQUIRE(CheckNodeAtLocationIs<gd::OperatorNode>(
                  parser, "number", "12 + MyExtension::GetNumber()", 3) ==
              true);
      REQUIRE(CheckNodeAtLocationIs<gd::OperatorNode>(
                  parser, "number", "12 + MyExtension::GetNumber()", 4) ==
              true);
      REQUIRE(CheckNodeAtLocationIs<gd::FunctionCallNode>(
                  parser, "number", "12 + MyExtension::GetNumber()", 5) ==
              true);
      REQUIRE(CheckNodeAtLocationIs<gd::FunctionCallNode>(
                  parser, "number", "12 + MyExtension::GetNumber()", 27) ==
              true);
      REQUIRE(CheckNodeAtLocationIs<gd::FunctionCallNode>(
                  parser, "number", "12 + MyExtension::GetNumber()", 28) ==
              true);
      REQUIRE(CheckNoNodeAtLocation(
                  parser, "number", "12 + MyExtension::GetNumber()", 29) ==
              true);
    }
    SECTION("Test 2") {
      REQUIRE(CheckNodeAtLocationIs<gd::FunctionCallNode>(
                  parser,
                  "number",
                  "MyExtension::GetNumberWith2Params(12, \"hello world\")",
                  0) == true);
      REQUIRE(CheckNodeAtLocationIs<gd::FunctionCallNode>(
                  parser,
                  "number",
                  "MyExtension::GetNumberWith2Params(12, \"hello world\")",
                  1) == true);
      REQUIRE(CheckNodeAtLocationIs<gd::FunctionCallNode>(
                  parser,
                  "number",
                  "MyExtension::GetNumberWith2Params(12, \"hello world\")",
                  33) == true);
      REQUIRE(CheckNodeAtLocationIs<gd::NumberNode>(
                  parser,
                  "number",
                  "MyExtension::GetNumberWith2Params(12, \"hello world\")",
                  34) == true);
      REQUIRE(CheckNodeAtLocationIs<gd::NumberNode>(
                  parser,
                  "number",
                  "MyExtension::GetNumberWith2Params(12, \"hello world\")",
                  35) == true);
      REQUIRE(CheckNodeAtLocationIs<gd::FunctionCallNode>(
                  parser,
                  "number",
                  "MyExtension::GetNumberWith2Params(12, \"hello world\")",
                  36) == true);
      REQUIRE(CheckNodeAtLocationIs<gd::FunctionCallNode>(
                  parser,
                  "number",
                  "MyExtension::GetNumberWith2Params(12, \"hello world\")",
                  37) == true);
      REQUIRE(CheckNodeAtLocationIs<gd::TextNode>(
                  parser,
                  "number",
                  "MyExtension::GetNumberWith2Params(12, \"hello world\")",
                  38) == true);
      REQUIRE(CheckNodeAtLocationIs<gd::TextNode>(
                  parser,
                  "number",
                  "MyExtension::GetNumberWith2Params(12, \"hello world\")",
                  39) == true);
      REQUIRE(CheckNodeAtLocationIs<gd::TextNode>(
                  parser,
                  "number",
                  "MyExtension::GetNumberWith2Params(12, \"hello world\")",
                  50) == true);
      REQUIRE(CheckNodeAtLocationIs<gd::FunctionCallNode>(
                  parser,
                  "number",
                  "MyExtension::GetNumberWith2Params(12, \"hello world\")",
                  51) == true);
      REQUIRE(CheckNoNodeAtLocation(
                  parser,
                  "number",
                  "MyExtension::GetNumberWith2Params(12, \"hello world\")",
                  52) == true);
    }
    SECTION("Parent node") {
      REQUIRE(CheckParentNodeAtLocationIs<gd::OperatorNode>(
                  parser, "number", "12 + MyExtension::GetNumber()", 0) ==
              true);
      REQUIRE(CheckParentNodeAtLocationIs<gd::OperatorNode>(
                  parser, "number", "12 + MyExtension::GetNumber()", 6) ==
              true);
      REQUIRE(CheckNodeAtLocationIs<gd::NumberNode>(
                  parser,
                  "number",
                  "MyExtension::GetNumberWith2Params(12, \"hello world\")",
                  35) == true);
      REQUIRE(CheckParentNodeAtLocationIs<gd::FunctionCallNode>(
                  parser,
                  "number",
                  "MyExtension::GetNumberWith2Params(12, \"hello world\")",
                  35) == true);
      REQUIRE(CheckParentNodeAtLocationIs<gd::FunctionCallNode>(
                  parser,
                  "number",
                  "MyExtension::GetNumberWith2Params(12, \"hello world\")",
                  39) == true);
    }
  }

  SECTION("Invalid function calls") {
    REQUIRE(CheckNodeAtLocationIs<gd::FunctionCallNode>(
                parser, "number", "Idontexist(12)", 0) == true);
    REQUIRE(CheckNodeAtLocationIs<gd::FunctionCallNode>(
                parser, "number", "Idontexist(12)", 1) == true);
    REQUIRE(CheckNodeAtLocationIs<gd::FunctionCallNode>(
                parser, "number", "Idontexist(12)", 2) == true);
    REQUIRE(CheckNodeAtLocationIs<gd::FunctionCallNode>(
                parser, "number", "Idontexist(12)", 10) == true);
    REQUIRE(CheckNodeAtLocationIs<gd::NumberNode>(
                parser, "number", "Idontexist(12)", 11) == true);
    REQUIRE(CheckNodeAtLocationIs<gd::NumberNode>(
                parser, "number", "Idontexist(12)", 12) == true);
    REQUIRE(CheckNodeAtLocationIs<gd::FunctionCallNode>(
                parser, "number", "Idontexist(12)", 13) == true);
    REQUIRE(CheckNoNodeAtLocation(parser, "number", "Idontexist(12)", 14) ==
            true);
  }
  SECTION("Invalid function calls (parent node)") {
    REQUIRE(CheckNodeAtLocationIs<gd::NumberNode>(
                parser, "number", "Idontexist(12)", 12) == true);
    REQUIRE(CheckParentNodeAtLocationIs<gd::FunctionCallNode>(
                parser, "number", "Idontexist(12)", 12) == true);
  }

  SECTION("Unterminated function calls") {
    REQUIRE(CheckNodeAtLocationIs<gd::FunctionCallNode>(
                parser, "number", "Idontexist(", 0) == true);
    REQUIRE(CheckNodeAtLocationIs<gd::FunctionCallNode>(
                parser, "number", "Idontexist(", 1) == true);
    REQUIRE(CheckNodeAtLocationIs<gd::FunctionCallNode>(
                parser, "number", "Idontexist(", 10) == true);
    REQUIRE(CheckNoNodeAtLocation(parser, "number", "Idontexist(", 11) == true);
  }

  SECTION("Valid variables") {
    SECTION("Test 1") {
      REQUIRE(CheckNodeAtLocationIs<gd::VariableNode>(
                  parser, "scenevar", "myVariable", 0) == true);
      REQUIRE(CheckNodeAtLocationIs<gd::VariableNode>(
                  parser, "scenevar", "myVariable", 9) == true);
      REQUIRE(CheckNoNodeAtLocation(parser, "scenevar", "myVariable", 10) ==
              true);
    }
    SECTION("Test 2") {
      auto node = parser.ParseExpression("scenevar", "Var1.Child1");
      REQUIRE(node != nullptr);

      auto var1Node =
          gd::ExpressionNodeLocationFinder::GetNodeAtPosition(*node, 0);
      REQUIRE(dynamic_cast<gd::VariableNode*>(var1Node) != nullptr);
      REQUIRE(dynamic_cast<gd::VariableNode&>(*var1Node).name == "Var1");

      auto child1Node =
          gd::ExpressionNodeLocationFinder::GetNodeAtPosition(*node, 4);
      REQUIRE(dynamic_cast<gd::VariableAccessorNode*>(child1Node) != nullptr);
      REQUIRE(dynamic_cast<gd::VariableAccessorNode&>(*child1Node).name ==
              "Child1");
    }
    SECTION("Test 3") {
      auto node = parser.ParseExpression(
          "scenevar", "myVariable[ \"My named children\"  ].grandChild");
      REQUIRE(node != nullptr);

      auto myVariableNode =
          gd::ExpressionNodeLocationFinder::GetNodeAtPosition(*node, 0);
      REQUIRE(dynamic_cast<gd::VariableNode*>(myVariableNode) != nullptr);
      REQUIRE(dynamic_cast<gd::VariableNode&>(*myVariableNode).name ==
              "myVariable");

      auto variableBracketAccessorNode =
          gd::ExpressionNodeLocationFinder::GetNodeAtPosition(*node, 10);
      REQUIRE(dynamic_cast<gd::VariableBracketAccessorNode*>(
                  variableBracketAccessorNode) != nullptr);

      auto textNode =
          gd::ExpressionNodeLocationFinder::GetNodeAtPosition(*node, 15);
      REQUIRE(dynamic_cast<gd::TextNode*>(textNode) != nullptr);

      auto grandChildNode =
          gd::ExpressionNodeLocationFinder::GetNodeAtPosition(*node, 40);
      REQUIRE(dynamic_cast<gd::VariableAccessorNode*>(grandChildNode) !=
              nullptr);
      REQUIRE(dynamic_cast<gd::VariableAccessorNode&>(*grandChildNode).name ==
              "grandChild");
    }
  }
}
