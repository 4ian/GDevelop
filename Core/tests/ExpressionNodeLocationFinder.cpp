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
                           const gd::String& expression,
                           size_t searchPosition) {
  auto node = parser.ParseExpression(expression);
  REQUIRE(node != nullptr);
  return dynamic_cast<TNode*>(
             gd::ExpressionNodeLocationFinder::GetNodeAtPosition(
                 *node, searchPosition)) != nullptr;
}

template <class TNode>
bool CheckParentNodeAtLocationIs(gd::ExpressionParser2& parser,
                           const gd::String& expression,
                           size_t searchPosition) {
  auto node = parser.ParseExpression(expression);
  REQUIRE(node != nullptr);
  return dynamic_cast<TNode*>(
             gd::ExpressionNodeLocationFinder::GetParentNodeAtPosition(
                 *node, searchPosition)) != nullptr;
}

bool CheckNoNodeAtLocation(gd::ExpressionParser2& parser,
                           const gd::String& expression,
                           size_t searchPosition) {
  auto node = parser.ParseExpression(expression);
  REQUIRE(node != nullptr);
  return gd::ExpressionNodeLocationFinder::GetNodeAtPosition(
             *node, searchPosition) == nullptr;
}

bool CheckNoParentNodeAtLocation(gd::ExpressionParser2& parser,
                           const gd::String& expression,
                           size_t searchPosition) {
  auto node = parser.ParseExpression(expression);
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

  gd::ExpressionParser2 parser;

  SECTION("Empty expressions") {
    SECTION("Test 1") {
      REQUIRE(CheckNodeAtLocationIs<gd::EmptyNode>(
                  parser, "", 0) == true);
      REQUIRE(CheckNoNodeAtLocation(parser, "", 1) ==
              true);
    }
    SECTION("Test 2") {
      REQUIRE(CheckNoNodeAtLocation(parser, " ", 0) ==
              true);
      REQUIRE(CheckNodeAtLocationIs<gd::EmptyNode>(
                  parser, " ", 1) == true);
      REQUIRE(CheckNoNodeAtLocation(parser, " ", 2) ==
              true);
    }
  }

  SECTION("Valid text") {
    SECTION("Test 1") {
      REQUIRE(CheckNodeAtLocationIs<gd::TextNode>(
                  parser, "\"Hello world\"", 0) == true);
    }
    SECTION("Test 2") {
      REQUIRE(CheckNodeAtLocationIs<gd::TextNode>(
                  parser, "\"Hello world\"", 1) == true);
    }
    SECTION("Test 3") {
      REQUIRE(CheckNodeAtLocationIs<gd::TextNode>(
                  parser, "\"Hello world\"", 12) == true);
    }
    SECTION("Test 4") {
      REQUIRE(CheckNoNodeAtLocation(parser, "\"Hello world\"", 13) ==
              true);
    }
    SECTION("Test 5") {
      REQUIRE(CheckNoNodeAtLocation(parser, "\"Hello world\"", 99) ==
              true);
    }
  }
  SECTION("Valid text operators") {
    SECTION("Test 1") {
      REQUIRE(CheckNodeAtLocationIs<gd::TextNode>(
                  parser, "\"Hello \" + \"World\"", 1) == true);
      REQUIRE(CheckNodeAtLocationIs<gd::OperatorNode>(
                  parser, "\"Hello \" + \"World\"", 8) == true);
      REQUIRE(CheckNodeAtLocationIs<gd::TextNode>(
                  parser, "\"Hello \" + \"World\"", 15) == true);
    }
  }
  SECTION("Invalid texts") {
    REQUIRE(CheckNodeAtLocationIs<gd::TextNode>(parser, "\"", 0) ==
            true);
    REQUIRE(CheckNoNodeAtLocation(parser, "\"", 1) == true);
    REQUIRE(CheckNodeAtLocationIs<gd::TextNode>(parser, "\"a", 1) ==
            true);
  }

  SECTION("Invalid parenthesis") {
    REQUIRE(CheckNodeAtLocationIs<gd::SubExpressionNode>(
                parser, "((\"hello\"", 1) == true);
    REQUIRE(CheckNodeAtLocationIs<gd::TextNode>(
                parser, "((\"hello\"", 2) == true);
  }

  SECTION("Invalid text operators") {
    SECTION("Test 1") {
      REQUIRE(CheckNodeAtLocationIs<gd::TextNode>(
                  parser, "\"Hello \" - \"World\"", 0) == true);
      REQUIRE(CheckNodeAtLocationIs<gd::TextNode>(
                  parser, "\"Hello \" - \"World\"", 1) == true);
      REQUIRE(CheckNodeAtLocationIs<gd::OperatorNode>(
                  parser, "\"Hello \" / \"World\"", 8) == true);
      REQUIRE(CheckNodeAtLocationIs<gd::TextNode>(
                  parser, "\"Hello \" * \"World\"", 15) == true);
    }
  }

  SECTION("Valid unary operators") {
    SECTION("Test 1") {
      REQUIRE(CheckNodeAtLocationIs<gd::UnaryOperatorNode>(
                  parser, "-123", 0) == true);
      REQUIRE(CheckNodeAtLocationIs<gd::UnaryOperatorNode>(
                  parser, "+123", 0) == true);
      REQUIRE(CheckNodeAtLocationIs<gd::NumberNode>(
                  parser, "-123", 1) == true);
      REQUIRE(CheckNodeAtLocationIs<gd::NumberNode>(
                  parser, "-123", 2) == true);
      REQUIRE(CheckNodeAtLocationIs<gd::NumberNode>(
                  parser, "-123", 3) == true);
      REQUIRE(CheckNoNodeAtLocation(parser, "-123", 4) == true);
    }
    SECTION("Test 2") {
      REQUIRE(CheckNodeAtLocationIs<gd::UnaryOperatorNode>(
                  parser, "-+-123", 0) == true);
      REQUIRE(CheckNodeAtLocationIs<gd::UnaryOperatorNode>(
                  parser, "-+-123", 1) == true);
      REQUIRE(CheckNodeAtLocationIs<gd::UnaryOperatorNode>(
                  parser, "-+-123", 2) == true);
      REQUIRE(CheckNodeAtLocationIs<gd::NumberNode>(
                  parser, "-+-123", 3) == true);
    }
  }

  SECTION("Invalid number operators") {
    SECTION("Test 1") {
      REQUIRE(CheckNodeAtLocationIs<gd::NumberNode>(
                  parser, "12 ! 34", 0) == true);
      REQUIRE(CheckNodeAtLocationIs<gd::NumberNode>(
                  parser, "12 ! 34", 1) == true);
      REQUIRE(CheckNodeAtLocationIs<gd::OperatorNode>(
                  parser, "12 ! 34", 2) == true);
      REQUIRE(CheckNodeAtLocationIs<gd::OperatorNode>(
                  parser, "12 ! 34", 3) == true);
      REQUIRE(CheckNodeAtLocationIs<gd::OperatorNode>(
                  parser, "12 ! 34", 4) == true);
      REQUIRE(CheckNodeAtLocationIs<gd::NumberNode>(
                  parser, "12 ! 34", 5) == true);
      REQUIRE(CheckNodeAtLocationIs<gd::NumberNode>(
                  parser, "12 ! 34", 6) == true);
    }
    SECTION("Test 2") {
      REQUIRE(CheckNodeAtLocationIs<gd::NumberNode>(
                  parser, "1 / /2", 0) == true);
      REQUIRE(CheckNodeAtLocationIs<gd::OperatorNode>(
                  parser, "1 / /2", 1) == true);
      REQUIRE(CheckNodeAtLocationIs<gd::OperatorNode>(
                  parser, "1 / /2", 2) == true);
      REQUIRE(CheckNodeAtLocationIs<gd::OperatorNode>(
                  parser, "1 / /2", 3) == true);
      REQUIRE(CheckNodeAtLocationIs<gd::EmptyNode>(
                  parser, "1 / /2", 4) == true);
      REQUIRE(CheckNodeAtLocationIs<gd::EmptyNode>(
                  parser, "1 / /2", 5) == true);
    }
  }

  SECTION("Numbers and texts mismatches") {
    REQUIRE(CheckNodeAtLocationIs<gd::NumberNode>(parser, "12+\"hello\"", 0) == true);
    REQUIRE(CheckNodeAtLocationIs<gd::NumberNode>(parser, "12+\"hello\"", 1) == true);
    REQUIRE(CheckNodeAtLocationIs<gd::OperatorNode>(parser, "12+\"hello\"", 2) == true);
    REQUIRE(CheckNodeAtLocationIs<gd::TextNode>(parser, "12+\"hello\"", 3) == true);
  }

  SECTION("Numbers and texts mismatches (parent node)") {
    REQUIRE(CheckParentNodeAtLocationIs<gd::OperatorNode>(parser, "12+\"hello\"", 0) == true);
    REQUIRE(CheckParentNodeAtLocationIs<gd::OperatorNode>(parser, "12+\"hello\"", 1) == true);
    REQUIRE(CheckNoParentNodeAtLocation(parser, "12+\"hello\"", 2) == true);
    REQUIRE(CheckParentNodeAtLocationIs<gd::OperatorNode>(parser, "12+\"hello\"", 3) == true);
  }

  SECTION("Valid objects") {
    REQUIRE(CheckNodeAtLocationIs<gd::IdentifierNode>(
                parser, "HelloWorld1", 0) == true);
    REQUIRE(CheckNodeAtLocationIs<gd::IdentifierNode>(
                parser, "HelloWorld1", 1) == true);
    REQUIRE(CheckNodeAtLocationIs<gd::IdentifierNode>(
                parser, "HelloWorld1", 10) == true);
    REQUIRE(CheckNoNodeAtLocation(parser, "HelloWorld1", 11) == true);
  }
  SECTION("Valid objects (parent node)") {
    REQUIRE(CheckNoParentNodeAtLocation(
                parser, "HelloWorld1", 0) == true);
  }
  SECTION("Invalid objects") {
    REQUIRE(CheckNodeAtLocationIs<gd::IdentifierNode>(
                parser, "a+b", 0) == true);
    REQUIRE(CheckNodeAtLocationIs<gd::OperatorNode>(
                parser, "a+b", 1) == true);
    REQUIRE(CheckNodeAtLocationIs<gd::IdentifierNode>(
                parser, "a+b", 2) == true);
    REQUIRE(CheckNoNodeAtLocation(parser, "a+b", 3) == true);
  }
  SECTION("Valid function calls") {
    SECTION("Test 1") {
      REQUIRE(CheckNodeAtLocationIs<gd::NumberNode>(
                  parser, "12 + MyExtension::GetNumber()", 0) ==
              true);
      REQUIRE(CheckNodeAtLocationIs<gd::NumberNode>(
                  parser, "12 + MyExtension::GetNumber()", 1) ==
              true);
      REQUIRE(CheckNodeAtLocationIs<gd::OperatorNode>(
                  parser, "12 + MyExtension::GetNumber()", 2) ==
              true);
      REQUIRE(CheckNodeAtLocationIs<gd::OperatorNode>(
                  parser, "12 + MyExtension::GetNumber()", 3) ==
              true);
      REQUIRE(CheckNodeAtLocationIs<gd::OperatorNode>(
                  parser, "12 + MyExtension::GetNumber()", 4) ==
              true);
      REQUIRE(CheckNodeAtLocationIs<gd::FunctionCallNode>(
                  parser, "12 + MyExtension::GetNumber()", 5) ==
              true);
      REQUIRE(CheckNodeAtLocationIs<gd::FunctionCallNode>(
                  parser, "12 + MyExtension::GetNumber()", 27) ==
              true);
      REQUIRE(CheckNodeAtLocationIs<gd::FunctionCallNode>(
                  parser, "12 + MyExtension::GetNumber()", 28) ==
              true);
      REQUIRE(CheckNoNodeAtLocation(
                  parser, "12 + MyExtension::GetNumber()", 29) ==
              true);
    }
    SECTION("Test 2") {
      REQUIRE(CheckNodeAtLocationIs<gd::FunctionCallNode>(
                  parser,
                  "MyExtension::GetNumberWith2Params(12, \"hello world\")",
                  0) == true);
      REQUIRE(CheckNodeAtLocationIs<gd::FunctionCallNode>(
                  parser,
                  "MyExtension::GetNumberWith2Params(12, \"hello world\")",
                  1) == true);
      REQUIRE(CheckNodeAtLocationIs<gd::FunctionCallNode>(
                  parser,
                  "MyExtension::GetNumberWith2Params(12, \"hello world\")",
                  33) == true);
      REQUIRE(CheckNodeAtLocationIs<gd::NumberNode>(
                  parser,
                  "MyExtension::GetNumberWith2Params(12, \"hello world\")",
                  34) == true);
      REQUIRE(CheckNodeAtLocationIs<gd::NumberNode>(
                  parser,
                  "MyExtension::GetNumberWith2Params(12, \"hello world\")",
                  35) == true);
      REQUIRE(CheckNodeAtLocationIs<gd::FunctionCallNode>(
                  parser,
                  "MyExtension::GetNumberWith2Params(12, \"hello world\")",
                  36) == true);
      REQUIRE(CheckNodeAtLocationIs<gd::FunctionCallNode>(
                  parser,
                  "MyExtension::GetNumberWith2Params(12, \"hello world\")",
                  37) == true);
      REQUIRE(CheckNodeAtLocationIs<gd::TextNode>(
                  parser,
                  "MyExtension::GetNumberWith2Params(12, \"hello world\")",
                  38) == true);
      REQUIRE(CheckNodeAtLocationIs<gd::TextNode>(
                  parser,
                  "MyExtension::GetNumberWith2Params(12, \"hello world\")",
                  39) == true);
      REQUIRE(CheckNodeAtLocationIs<gd::TextNode>(
                  parser,
                  "MyExtension::GetNumberWith2Params(12, \"hello world\")",
                  50) == true);
      REQUIRE(CheckNodeAtLocationIs<gd::FunctionCallNode>(
                  parser,
                  "MyExtension::GetNumberWith2Params(12, \"hello world\")",
                  51) == true);
      REQUIRE(CheckNoNodeAtLocation(
                  parser,
                  "MyExtension::GetNumberWith2Params(12, \"hello world\")",
                  52) == true);
    }
    SECTION("Parent node") {
      REQUIRE(CheckParentNodeAtLocationIs<gd::OperatorNode>(
                  parser, "12 + MyExtension::GetNumber()", 0) ==
              true);
      REQUIRE(CheckParentNodeAtLocationIs<gd::OperatorNode>(
                  parser, "12 + MyExtension::GetNumber()", 6) ==
              true);
      REQUIRE(CheckNodeAtLocationIs<gd::NumberNode>(
                  parser,
                  "MyExtension::GetNumberWith2Params(12, \"hello world\")",
                  35) == true);
      REQUIRE(CheckParentNodeAtLocationIs<gd::FunctionCallNode>(
                  parser,
                  "MyExtension::GetNumberWith2Params(12, \"hello world\")",
                  35) == true);
      REQUIRE(CheckParentNodeAtLocationIs<gd::FunctionCallNode>(
                  parser,
                  "MyExtension::GetNumberWith2Params(12, \"hello world\")",
                  39) == true);
    }
  }

  SECTION("Invalid function calls") {
    REQUIRE(CheckNodeAtLocationIs<gd::FunctionCallNode>(
                parser, "Idontexist(12)", 0) == true);
    REQUIRE(CheckNodeAtLocationIs<gd::FunctionCallNode>(
                parser, "Idontexist(12)", 1) == true);
    REQUIRE(CheckNodeAtLocationIs<gd::FunctionCallNode>(
                parser, "Idontexist(12)", 2) == true);
    REQUIRE(CheckNodeAtLocationIs<gd::FunctionCallNode>(
                parser, "Idontexist(12)", 10) == true);
    REQUIRE(CheckNodeAtLocationIs<gd::NumberNode>(
                parser, "Idontexist(12)", 11) == true);
    REQUIRE(CheckNodeAtLocationIs<gd::NumberNode>(
                parser, "Idontexist(12)", 12) == true);
    REQUIRE(CheckNodeAtLocationIs<gd::FunctionCallNode>(
                parser, "Idontexist(12)", 13) == true);
    REQUIRE(CheckNoNodeAtLocation(parser, "Idontexist(12)", 14) ==
            true);
  }
  SECTION("Invalid function calls (parent node)") {
    REQUIRE(CheckNodeAtLocationIs<gd::NumberNode>(
                parser, "Idontexist(12)", 12) == true);
    REQUIRE(CheckParentNodeAtLocationIs<gd::FunctionCallNode>(
                parser, "Idontexist(12)", 12) == true);
  }

  SECTION("Unterminated function calls") {
    REQUIRE(CheckNodeAtLocationIs<gd::FunctionCallNode>(
                parser, "Idontexist(", 0) == true);
    REQUIRE(CheckNodeAtLocationIs<gd::FunctionCallNode>(
                parser, "Idontexist(", 1) == true);
    REQUIRE(CheckNodeAtLocationIs<gd::FunctionCallNode>(
                parser, "Idontexist(", 10) == true);
    REQUIRE(CheckNoNodeAtLocation(parser, "Idontexist(", 11) == true);
  }

  SECTION("Valid variables") {
    SECTION("Test 1") {
      REQUIRE(CheckNodeAtLocationIs<gd::IdentifierNode>(
                  parser, "myVariable", 0) == true);
      REQUIRE(CheckNodeAtLocationIs<gd::IdentifierNode>(
                  parser, "myVariable", 9) == true);
      REQUIRE(CheckNoNodeAtLocation(parser, "myVariable", 10) ==
              true);
    }
    SECTION("Test 2") {
      auto node = parser.ParseExpression("Var1.Child1");
      REQUIRE(node != nullptr);

      auto var1Node =
          gd::ExpressionNodeLocationFinder::GetNodeAtPosition(*node, 0);
      REQUIRE(dynamic_cast<gd::IdentifierNode*>(var1Node) != nullptr);
      REQUIRE(dynamic_cast<gd::IdentifierNode&>(*var1Node).identifierName == "Var1");

      // It's actually the same node.
      auto child1Node =
          gd::ExpressionNodeLocationFinder::GetNodeAtPosition(*node, 4);
      REQUIRE(dynamic_cast<gd::IdentifierNode*>(child1Node) != nullptr);
      REQUIRE(dynamic_cast<gd::IdentifierNode&>(*child1Node).childIdentifierName ==
              "Child1");
    }
    SECTION("Test 3") {
      auto node = parser.ParseExpression(
          "myVariable[ \"My named children\"  ].grandChild");
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
