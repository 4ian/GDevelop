/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "GDCore/Events/Parsers/ExpressionParser2.h"

#include "DummyPlatform.h"
#include "GDCore/Extensions/Platform.h"
#include "GDCore/Extensions/PlatformExtension.h"
#include "GDCore/IDE/Events/ExpressionValidator.h"
#include "GDCore/IDE/Events/ExpressionTypeFinder.h"
#include "GDCore/IDE/Events/ExpressionVariableOwnerFinder.h"
#include "GDCore/Project/Layout.h"
#include "GDCore/Project/Project.h"
#include "catch.hpp"

TEST_CASE("ExpressionParser2", "[common][events]") {
  gd::Project project;
  gd::Platform platform;
  SetupProjectWithDummyPlatform(project, platform);
  auto &layout1 = project.InsertNewLayout("Layout1", 0);
  layout1.InsertNewObject(project, "MyExtension::Sprite", "MySpriteObject", 0);
  layout1.InsertNewObject(project,
                          "MyExtension::FakeObjectWithUnsupportedCapability",
                          "MyFakeObjectWithUnsupportedCapability",
                          1);

  gd::ExpressionParser2 parser;

  SECTION("Empty expression") {
    SECTION("of type string") {
      auto node = parser.ParseExpression("");
      REQUIRE(node != nullptr);
      auto &emptyNode = dynamic_cast<gd::EmptyNode &>(*node);
      auto type = gd::ExpressionTypeFinder::GetType(
          platform, project, layout1, "string", emptyNode);
      REQUIRE(type == "string");
      REQUIRE(emptyNode.text == "");

      gd::ExpressionValidator validator(platform, project, layout1, "string");
      node->Visit(validator);
      REQUIRE(validator.GetErrors().size() == 1);
      REQUIRE(validator.GetErrors()[0]->GetMessage() ==
              "You must enter a text (between quotes) or a valid expression call.");
    }
    SECTION("of type number") {
      auto node = parser.ParseExpression("");
      REQUIRE(node != nullptr);
      auto &emptyNode = dynamic_cast<gd::EmptyNode &>(*node);
      auto type = gd::ExpressionTypeFinder::GetType(
          platform, project, layout1, "number", emptyNode);
      REQUIRE(type == "number");
      REQUIRE(emptyNode.text == "");

      gd::ExpressionValidator validator(platform, project, layout1, "number");
      node->Visit(validator);
      REQUIRE(validator.GetErrors().size() == 1);
      REQUIRE(validator.GetErrors()[0]->GetMessage() ==
              "You must enter a number or a valid expression call.");
    }
    SECTION("of type object") {
      auto node = parser.ParseExpression("");
      REQUIRE(node != nullptr);
      auto &emptyNode = dynamic_cast<gd::EmptyNode &>(*node);
      auto type = gd::ExpressionTypeFinder::GetType(
          platform, project, layout1, "object", emptyNode);
      REQUIRE(type == "object");
      REQUIRE(emptyNode.text == "");

      gd::ExpressionValidator validator(platform, project, layout1, "object");
      node->Visit(validator);
      REQUIRE(validator.GetErrors().size() == 1);
      REQUIRE(validator.GetErrors()[0]->GetMessage() ==
              "You must enter a valid object name.");
    }
  }
  SECTION("Expression with only a space") {
    SECTION("of type string") {
      auto node = parser.ParseExpression(" ");
      REQUIRE(node != nullptr);
      auto &emptyNode = dynamic_cast<gd::EmptyNode &>(*node);
      auto type = gd::ExpressionTypeFinder::GetType(
          platform, project, layout1, "string", emptyNode);
      REQUIRE(type == "string");
      REQUIRE(emptyNode.text == "");
    }
    SECTION("of type number") {
      auto node = parser.ParseExpression(" ");
      REQUIRE(node != nullptr);
      auto &emptyNode = dynamic_cast<gd::EmptyNode &>(*node);
      auto type = gd::ExpressionTypeFinder::GetType(
          platform, project, layout1, "number", emptyNode);
      REQUIRE(type == "number");
      REQUIRE(emptyNode.text == "");
    }
    SECTION("of type object") {
      auto node = parser.ParseExpression(" ");
      REQUIRE(node != nullptr);
      auto &emptyNode = dynamic_cast<gd::EmptyNode &>(*node);
      auto type = gd::ExpressionTypeFinder::GetType(
          platform, project, layout1, "object", emptyNode);
      REQUIRE(type == "object");
      REQUIRE(emptyNode.text == "");
    }
  }

  SECTION("Valid texts") {
    {
      auto node = parser.ParseExpression("\"hello world\"");
      REQUIRE(node != nullptr);
      auto &textNode = dynamic_cast<gd::TextNode &>(*node);
      REQUIRE(textNode.text == "hello world");
    }
    {
      auto node = parser.ParseExpression("\"\"");
      REQUIRE(node != nullptr);
      auto &textNode = dynamic_cast<gd::TextNode &>(*node);
      REQUIRE(textNode.text == "");
    }
    {
      auto node = parser.ParseExpression("\"hello \\\"world\\\"\"");
      REQUIRE(node != nullptr);
      auto &textNode = dynamic_cast<gd::TextNode &>(*node);
      REQUIRE(textNode.text == "hello \"world\"");
    }

    {
      auto node = parser.ParseExpression("\"\\\\\"");
      REQUIRE(node != nullptr);
      auto &textNode = dynamic_cast<gd::TextNode &>(*node);
      REQUIRE(textNode.text == "\\");
    }
    {
      auto node =
          parser.ParseExpression("\"hello \\\\\\\"world\\\"\"");
      REQUIRE(node != nullptr);
      auto &textNode = dynamic_cast<gd::TextNode &>(*node);
      REQUIRE(textNode.text == "hello \\\"world\"");
    }
  }

  SECTION("Invalid texts") {
    {
      auto node = parser.ParseExpression("");
      REQUIRE(node != nullptr);

      gd::ExpressionValidator validator(platform, project, layout1, "string");
      node->Visit(validator);
      REQUIRE(validator.GetErrors().size() == 1);
      REQUIRE(
          validator.GetErrors()[0]->GetMessage() ==
          "You must enter a text (between quotes) or a valid expression call.");
    }
    {
      auto node = parser.ParseExpression("abcd");
      REQUIRE(node != nullptr);

      gd::ExpressionValidator validator(platform, project, layout1, "string");
      node->Visit(validator);
      REQUIRE(validator.GetErrors().size() == 1);
      REQUIRE(validator.GetErrors()[0]->GetMessage() ==
              "You must wrap your text inside double quotes (example: \"Hello "
              "world\").");
    }
    {
      auto node = parser.ParseExpression("123");
      REQUIRE(node != nullptr);

      gd::ExpressionValidator validator(platform, project, layout1, "string");
      node->Visit(validator);
      REQUIRE(validator.GetErrors().size() == 1);
      REQUIRE(validator.GetErrors()[0]->GetMessage() ==
              "You entered a number, but a text was expected (in quotes).");
    }
    {
      auto node = parser.ParseExpression("abcd efgh");
      REQUIRE(node != nullptr);

      gd::ExpressionValidator validator(platform, project, layout1, "string");
      node->Visit(validator);
      REQUIRE(validator.GetErrors().size() == 1);
      REQUIRE(validator.GetErrors()[0]->GetMessage() ==
              "You must wrap your text inside double quotes (example: \"Hello "
              "world\").");
      REQUIRE(validator.GetErrors()[0]->GetStartPosition() == 0);
      REQUIRE(validator.GetErrors()[0]->GetEndPosition() == 9);
    }
    {
      auto node = parser.ParseExpression("abcd + efgh");
      REQUIRE(node != nullptr);

      gd::ExpressionValidator validator(platform, project, layout1, "string");
      node->Visit(validator);
      REQUIRE(validator.GetErrors().size() == 2);
      REQUIRE(validator.GetErrors()[0]->GetMessage() ==
              "You must wrap your text inside double quotes (example: \"Hello "
              "world\").");
      REQUIRE(validator.GetErrors()[1]->GetMessage() ==
              "You must wrap your text inside double quotes (example: \"Hello "
              "world\").");
    }

    {
      auto node = parser.ParseExpression("\"");
      REQUIRE(node != nullptr);

      gd::ExpressionValidator validator(platform, project, layout1, "string");
      node->Visit(validator);
      REQUIRE(validator.GetErrors().size() == 1);
      REQUIRE(validator.GetErrors()[0]->GetMessage() ==
              "A text must end with a double quote (\"). Add a double quote to "
              "terminate the text.");
      REQUIRE(validator.GetErrors()[0]->GetStartPosition() == 1);
    }
    {
      auto node = parser.ParseExpression("\"hello world");
      REQUIRE(node != nullptr);

      gd::ExpressionValidator validator(platform, project, layout1, "string");
      node->Visit(validator);
      REQUIRE(validator.GetErrors().size() == 1);
      REQUIRE(validator.GetErrors()[0]->GetMessage() ==
              "A text must end with a double quote (\"). Add a double quote to "
              "terminate the text.");
      REQUIRE(validator.GetErrors()[0]->GetStartPosition() == 12);
    }
    {
      auto node = parser.ParseExpression("\"\"\"");
      REQUIRE(node != nullptr);

      gd::ExpressionValidator validator(platform, project, layout1, "string");
      node->Visit(validator);
      REQUIRE(validator.GetErrors().size() == 3);
      REQUIRE(validator.GetErrors()[0]->GetMessage() ==
              "More than one term was found. Verify that your expression is "
              "properly written.");
      REQUIRE(validator.GetErrors()[1]->GetMessage() ==
              "You must add the operator + between texts or expressions. For "
              "example: \"Your name: \" + VariableString(PlayerName).");
      REQUIRE(validator.GetErrors()[1]->GetStartPosition() == 2);
      REQUIRE(validator.GetErrors()[2]->GetMessage() ==
              "A text must end with a double quote (\"). Add a double quote to "
              "terminate the text.");
    }
  }

  SECTION("Unterminated expressions/extra characters") {
    {
      auto node = parser.ParseExpression("\"hello\",");
      REQUIRE(node != nullptr);

      gd::ExpressionValidator validator(platform, project, layout1, "string");
      node->Visit(validator);
      REQUIRE(validator.GetErrors().size() == 3);

      // TODO Find a way to remove these 2 extra errors.
      REQUIRE(validator.GetErrors()[0]->GetMessage() ==
              "You must add the operator + between texts or expressions. For "
              "example: \"Your name: \" + VariableString(PlayerName).");
      REQUIRE(validator.GetErrors()[2]->GetMessage() ==
              "You must enter a text (between quotes) or a valid expression call.");

      REQUIRE(validator.GetErrors()[1]->GetMessage() ==
              "The expression has extra character at the end that should be "
              "removed (or completed if your expression is not finished).");
    }
    {
      auto node = parser.ParseExpression("\"hello\"]");
      REQUIRE(node != nullptr);

      gd::ExpressionValidator validator(platform, project, layout1, "string");
      node->Visit(validator);
      REQUIRE(validator.GetErrors().size() == 3);

      // TODO Find a way to remove these 2 extra errors.
      REQUIRE(validator.GetErrors()[0]->GetMessage() ==
              "You must add the operator + between texts or expressions. For "
              "example: \"Your name: \" + VariableString(PlayerName).");
      REQUIRE(validator.GetErrors()[2]->GetMessage() ==
              "You must enter a text (between quotes) or a valid expression call.");

      REQUIRE(validator.GetErrors()[1]->GetMessage() ==
              "The expression has extra character at the end that should be "
              "removed (or completed if your expression is not finished).");
    }
    {
      auto node = parser.ParseExpression("Idontexist(\"hello\"");
      REQUIRE(node != nullptr);

      gd::ExpressionValidator validator(platform, project, layout1, "string");
      node->Visit(validator);
      REQUIRE(validator.GetErrors().size() == 2);
      REQUIRE(validator.GetErrors()[0]->GetMessage() ==
              "The list of parameters is not terminated. Add a closing "
              "parenthesis to end the parameters.");
      REQUIRE(validator.GetErrors()[1]->GetMessage() ==
              "Cannot find an expression with this name: Idontexist\n"
              "Double check that you've not made any typo in the name.");
    }
    {
      auto node = parser.ParseExpression("=\"test\"");
      REQUIRE(node != nullptr);

      gd::ExpressionValidator validator(platform, project, layout1, "string");
      node->Visit(validator);
      REQUIRE(validator.GetErrors().size() == 1);
      REQUIRE(
          validator.GetErrors()[0]->GetMessage() ==
          "You must enter a text (between quotes) or a valid expression call.");
    }
  }

  SECTION("Invalid parenthesis") {
    {
      auto node = parser.ParseExpression("((\"hello\"");
      REQUIRE(node != nullptr);

      gd::ExpressionValidator validator(platform, project, layout1, "string");
      node->Visit(validator);
      REQUIRE(validator.GetErrors().size() == 2);
      REQUIRE(validator.GetErrors()[0]->GetMessage() ==
              "Missing a closing parenthesis. Add a closing parenthesis for "
              "each opening parenthesis.");
      REQUIRE(validator.GetErrors()[1]->GetMessage() ==
              "Missing a closing parenthesis. Add a closing parenthesis for "
              "each opening parenthesis.");
    }
    {
      auto node = parser.ParseExpression("MyObject.MyFunction)");
      REQUIRE(node != nullptr);

      gd::ExpressionValidator validator(platform, project, layout1, "string");
      node->Visit(validator);
      REQUIRE(validator.GetErrors().size() == 4);
      REQUIRE(validator.GetErrors()[0]->GetMessage() ==
              "You must wrap your text inside double quotes "
              "(example: \"Hello world\").");
      REQUIRE(validator.GetErrors()[1]->GetMessage() ==
              "You must add the operator + between texts or expressions. "
              "For example: \"Your name: \" + VariableString(PlayerName).");
      REQUIRE(validator.GetErrors()[2]->GetMessage() ==
              "The expression has extra character at the end that should be "
              "removed (or completed if your expression is not finished).");
      REQUIRE(validator.GetErrors()[3]->GetMessage() ==
              "You must enter a text (between quotes) or a valid expression call.");
    }
  }

  SECTION("Invalid text operators") {
    {
      auto node = parser.ParseExpression("\"Hello \" - \"World\"");
      REQUIRE(node != nullptr);

      gd::ExpressionValidator validator(platform, project, layout1, "string");
      node->Visit(validator);
      REQUIRE(validator.GetErrors().size() == 1);
      REQUIRE(validator.GetErrors()[0]->GetMessage() ==
              "You've used an operator that is not supported. Only + can be "
              "used to concatenate texts.");
      REQUIRE(validator.GetErrors()[0]->GetStartPosition() == 9);
    }
  }

  SECTION("Valid numbers") {
    {
      auto node = parser.ParseExpression("123");
      REQUIRE(node != nullptr);
      auto &numberNode = dynamic_cast<gd::NumberNode &>(*node);
      REQUIRE(numberNode.number == "123");
    }
    {
      auto node = parser.ParseExpression("0");
      REQUIRE(node != nullptr);
      auto &numberNode = dynamic_cast<gd::NumberNode &>(*node);
      REQUIRE(numberNode.number == "0");
    }
    {
      auto node = parser.ParseExpression("3.14159");
      REQUIRE(node != nullptr);
      auto &numberNode = dynamic_cast<gd::NumberNode &>(*node);
      REQUIRE(numberNode.number == "3.14159");
    }
    {
      auto node = parser.ParseExpression(".14159");
      REQUIRE(node != nullptr);
      auto &numberNode = dynamic_cast<gd::NumberNode &>(*node);
      REQUIRE(numberNode.number == "0.14159");
    }
    {
      auto node = parser.ParseExpression("3.");
      REQUIRE(node != nullptr);
      auto &numberNode = dynamic_cast<gd::NumberNode &>(*node);
      REQUIRE(numberNode.number == "3.");
    }
    {
      auto node = parser.ParseExpression("0.");
      REQUIRE(node != nullptr);
      auto &numberNode = dynamic_cast<gd::NumberNode &>(*node);
      REQUIRE(numberNode.number == "0.");
    }
  }

  SECTION("valid operators") {
    {
      auto node = parser.ParseExpression("123 + 456");
      REQUIRE(node != nullptr);
      auto &operatorNode = dynamic_cast<gd::OperatorNode &>(*node);
      auto type = gd::ExpressionTypeFinder::GetType(
          platform, project, layout1, "number", operatorNode);
      REQUIRE(operatorNode.op == '+');
      REQUIRE(type == "number");
      auto &leftNumberNode =
          dynamic_cast<gd::NumberNode &>(*operatorNode.leftHandSide);
      REQUIRE(leftNumberNode.number == "123");
      auto &rightNumberNode =
          dynamic_cast<gd::NumberNode &>(*operatorNode.rightHandSide);
      REQUIRE(rightNumberNode.number == "456");

      gd::ExpressionValidator validator(platform, project, layout1, "number");
      node->Visit(validator);
      REQUIRE(validator.GetErrors().size() == 0);
    }
    {
      auto node = parser.ParseExpression("\"abc\" + \"def\"");
      REQUIRE(node != nullptr);
      auto &operatorNode = dynamic_cast<gd::OperatorNode &>(*node);
      auto type = gd::ExpressionTypeFinder::GetType(
          platform, project, layout1, "string", operatorNode);
      REQUIRE(operatorNode.op == '+');
      REQUIRE(type == "string");
      auto &leftTextNode =
          dynamic_cast<gd::TextNode &>(*operatorNode.leftHandSide);
      REQUIRE(leftTextNode.text == "abc");
      auto &rightTextNode =
          dynamic_cast<gd::TextNode &>(*operatorNode.rightHandSide);
      REQUIRE(rightTextNode.text == "def");

      gd::ExpressionValidator validator(platform, project, layout1, "string");
      node->Visit(validator);
      REQUIRE(validator.GetErrors().size() == 0);
    }
  }

  SECTION("valid operators ('number|string' type)") {
    {
      auto node = parser.ParseExpression("123 + 456");
      REQUIRE(node != nullptr);
      auto &operatorNode = dynamic_cast<gd::OperatorNode &>(*node);
      auto type = gd::ExpressionTypeFinder::GetType(
          platform, project, layout1, "number|string", operatorNode);
      REQUIRE(operatorNode.op == '+');
      REQUIRE(type == "number");
      auto &leftNumberNode =
          dynamic_cast<gd::NumberNode &>(*operatorNode.leftHandSide);
      REQUIRE(leftNumberNode.number == "123");
      auto &rightNumberNode =
          dynamic_cast<gd::NumberNode &>(*operatorNode.rightHandSide);
      REQUIRE(rightNumberNode.number == "456");

      gd::ExpressionValidator validator(platform, project, layout1, "number|string");
      node->Visit(validator);
      REQUIRE(validator.GetErrors().size() == 0);
    }
    {
      auto node = parser.ParseExpression("\"abc\" + \"def\"");
      REQUIRE(node != nullptr);
      auto &operatorNode = dynamic_cast<gd::OperatorNode &>(*node);
      auto type = gd::ExpressionTypeFinder::GetType(
          platform, project, layout1, "number|string", operatorNode);
      REQUIRE(operatorNode.op == '+');
      REQUIRE(type == "string");
      auto &leftTextNode =
          dynamic_cast<gd::TextNode &>(*operatorNode.leftHandSide);
      REQUIRE(leftTextNode.text == "abc");
      auto &rightTextNode =
          dynamic_cast<gd::TextNode &>(*operatorNode.rightHandSide);
      REQUIRE(rightTextNode.text == "def");

      gd::ExpressionValidator validator(platform, project, layout1, "number|string");
      node->Visit(validator);
      REQUIRE(validator.GetErrors().size() == 0);
    }
  }

  SECTION("valid unary operators") {
    {
      auto node = parser.ParseExpression("-123");
      REQUIRE(node != nullptr);
      auto &unaryOperatorNode = dynamic_cast<gd::UnaryOperatorNode &>(*node);
      auto type = gd::ExpressionTypeFinder::GetType(
          platform, project, layout1, "number", unaryOperatorNode);
      REQUIRE(unaryOperatorNode.op == '-');
      REQUIRE(type == "number");
      auto &numberNode =
          dynamic_cast<gd::NumberNode &>(*unaryOperatorNode.factor);
      REQUIRE(numberNode.number == "123");

      gd::ExpressionValidator validator(platform, project, layout1, "number");
      node->Visit(validator);
      REQUIRE(validator.GetErrors().size() == 0);
    }
    {
      auto node = parser.ParseExpression("+123");
      REQUIRE(node != nullptr);
      auto &unaryOperatorNode = dynamic_cast<gd::UnaryOperatorNode &>(*node);
      auto type = gd::ExpressionTypeFinder::GetType(
          platform, project, layout1, "number", unaryOperatorNode);
      REQUIRE(unaryOperatorNode.op == '+');
      REQUIRE(type == "number");
      auto &numberNode =
          dynamic_cast<gd::NumberNode &>(*unaryOperatorNode.factor);
      REQUIRE(numberNode.number == "123");

      gd::ExpressionValidator validator(platform, project, layout1, "number");
      node->Visit(validator);
      REQUIRE(validator.GetErrors().size() == 0);
    }
    {
      auto node = parser.ParseExpression("-123.2");
      REQUIRE(node != nullptr);
      auto &unaryOperatorNode = dynamic_cast<gd::UnaryOperatorNode &>(*node);
      auto type = gd::ExpressionTypeFinder::GetType(
          platform, project, layout1, "number", unaryOperatorNode);
      REQUIRE(unaryOperatorNode.op == '-');
      REQUIRE(type == "number");
      auto &numberNode =
          dynamic_cast<gd::NumberNode &>(*unaryOperatorNode.factor);
      REQUIRE(numberNode.number == "123.2");

      gd::ExpressionValidator validator(platform, project, layout1, "number");
      node->Visit(validator);
      REQUIRE(validator.GetErrors().size() == 0);
    }
  }
  SECTION("valid unary operators ('number|string' type)") {
    {
      auto node = parser.ParseExpression("-123");
      REQUIRE(node != nullptr);
      auto &unaryOperatorNode = dynamic_cast<gd::UnaryOperatorNode &>(*node);
      auto type = gd::ExpressionTypeFinder::GetType(
          platform, project, layout1, "number|string", unaryOperatorNode);
      REQUIRE(unaryOperatorNode.op == '-');
      REQUIRE(type == "number");
      auto &numberNode =
          dynamic_cast<gd::NumberNode &>(*unaryOperatorNode.factor);
      REQUIRE(numberNode.number == "123");

      gd::ExpressionValidator validator(platform, project, layout1, "number|string");
      node->Visit(validator);
      REQUIRE(validator.GetErrors().size() == 0);
    }
    {
      auto node = parser.ParseExpression("+123");
      REQUIRE(node != nullptr);
      auto &unaryOperatorNode = dynamic_cast<gd::UnaryOperatorNode &>(*node);
      auto type = gd::ExpressionTypeFinder::GetType(
          platform, project, layout1, "number|string", unaryOperatorNode);
      REQUIRE(unaryOperatorNode.op == '+');
      REQUIRE(type == "number");
      auto &numberNode =
          dynamic_cast<gd::NumberNode &>(*unaryOperatorNode.factor);
      REQUIRE(numberNode.number == "123");

      gd::ExpressionValidator validator(platform, project, layout1, "number|string");
      node->Visit(validator);
      REQUIRE(validator.GetErrors().size() == 0);
    }
    {
      auto node = parser.ParseExpression("-123.2");
      REQUIRE(node != nullptr);
      auto &unaryOperatorNode = dynamic_cast<gd::UnaryOperatorNode &>(*node);
      auto type = gd::ExpressionTypeFinder::GetType(
          platform, project, layout1, "number|string", unaryOperatorNode);
      REQUIRE(unaryOperatorNode.op == '-');
      REQUIRE(type == "number");
      auto &numberNode =
          dynamic_cast<gd::NumberNode &>(*unaryOperatorNode.factor);
      REQUIRE(numberNode.number == "123.2");

      gd::ExpressionValidator validator(platform, project, layout1, "number|string");
      node->Visit(validator);
      REQUIRE(validator.GetErrors().size() == 0);
    }
  }

  SECTION("Invalid unary operators") {
    {
      auto node = parser.ParseExpression("*123");
      REQUIRE(node != nullptr);

      gd::ExpressionValidator validator(platform, project, layout1, "number");
      node->Visit(validator);
      REQUIRE(validator.GetErrors().size() == 1);
      REQUIRE(validator.GetErrors()[0]->GetMessage() ==
              "You must enter a number or a valid expression call.");
      REQUIRE(validator.GetErrors()[0]->GetStartPosition() == 0);
    }
    {
      auto node = parser.ParseExpression("-\"hello\"");
      REQUIRE(node != nullptr);

      gd::ExpressionValidator validator(platform, project, layout1, "string");
      node->Visit(validator);
      REQUIRE(validator.GetErrors().size() == 1);
      REQUIRE(validator.GetErrors()[0]->GetMessage() ==
              "You've used an operator that is not supported. Only + can be "
              "used to concatenate texts, and must be placed between two texts "
              "(or expressions).");
      REQUIRE(validator.GetErrors()[0]->GetStartPosition() == 0);
    }
    {
      auto node = parser.ParseExpression("+-\"hello\"");
      REQUIRE(node != nullptr);

      gd::ExpressionValidator validator(platform, project, layout1, "string");
      node->Visit(validator);
      REQUIRE(validator.GetErrors().size() == 2);
      REQUIRE(validator.GetErrors()[0]->GetMessage() ==
              "You've used an operator that is not supported. Only + can be "
              "used to concatenate texts, and must be placed between two texts "
              "(or expressions).");
      REQUIRE(validator.GetErrors()[0]->GetStartPosition() == 1);
      REQUIRE(validator.GetErrors()[1]->GetMessage() ==
              "You've used an operator that is not supported. Only + can be "
              "used to concatenate texts, and must be placed between two texts "
              "(or expressions).");
      REQUIRE(validator.GetErrors()[1]->GetStartPosition() == 0);
    }
  }

  SECTION("Invalid numbers") {
    {
      auto node = parser.ParseExpression("");
      REQUIRE(node != nullptr);

      gd::ExpressionValidator validator(platform, project, layout1, "number");
      node->Visit(validator);
      REQUIRE(validator.GetErrors().size() == 1);
      REQUIRE(validator.GetErrors()[0]->GetMessage() ==
              "You must enter a number or a valid expression call.");
      REQUIRE(validator.GetErrors()[0]->GetStartPosition() == 0);
    }
    {
      auto node = parser.ParseExpression("abcd");
      REQUIRE(node != nullptr);

      gd::ExpressionValidator validator(platform, project, layout1, "number");
      node->Visit(validator);
      REQUIRE(validator.GetErrors().size() == 1);
      REQUIRE(validator.GetErrors()[0]->GetMessage() ==
              "You must enter a number.");
      REQUIRE(validator.GetErrors()[0]->GetStartPosition() == 0);
    }
    {
      auto node = parser.ParseExpression("\"hello world\"");
      REQUIRE(node != nullptr);

      gd::ExpressionValidator validator(platform, project, layout1, "number");
      node->Visit(validator);
      REQUIRE(validator.GetErrors().size() == 1);
      REQUIRE(validator.GetErrors()[0]->GetMessage() ==
              "You entered a text, but a number was expected.");
      REQUIRE(validator.GetErrors()[0]->GetStartPosition() == 0);
      REQUIRE(validator.GetErrors()[0]->GetEndPosition() == 13);
    }
    {
      auto node = parser.ParseExpression("123 456");
      REQUIRE(node != nullptr);

      gd::ExpressionValidator validator(platform, project, layout1, "number");
      node->Visit(validator);
      REQUIRE(validator.GetErrors().size() == 2);
      REQUIRE(validator.GetErrors()[0]->GetMessage() ==
              "More than one term was found. Verify that your expression is "
          "properly written.");
      REQUIRE(validator.GetErrors()[1]->GetMessage() ==
              "No operator found. Did you forget to enter an operator (like +, "
              "-, * or /) between numbers or expressions?");
      REQUIRE(validator.GetErrors()[1]->GetStartPosition() == 4);
    }
    {
      auto node = parser.ParseExpression("3..14");
      REQUIRE(node != nullptr);

      gd::ExpressionValidator validator(platform, project, layout1, "number");
      node->Visit(validator);
      REQUIRE(validator.GetErrors().size() == 2);
      REQUIRE(validator.GetErrors()[0]->GetMessage() ==
              "More than one term was found. Verify that your expression is "
          "properly written.");
      REQUIRE(validator.GetErrors()[1]->GetMessage() ==
              "No operator found. Did you forget to enter an operator (like +, "
              "-, * or /) between numbers or expressions?");
      REQUIRE(validator.GetErrors()[1]->GetStartPosition() == 2);
    }
    {
      auto node = parser.ParseExpression(".");
      REQUIRE(node != nullptr);

      gd::ExpressionValidator validator(platform, project, layout1, "number");
      node->Visit(validator);
      REQUIRE(validator.GetErrors().size() == 1);
      REQUIRE(validator.GetErrors()[0]->GetMessage() ==
              "A number was expected. You must enter a number here.");
      REQUIRE(validator.GetErrors()[0]->GetStartPosition() == 1);
    }
  }

  SECTION("Invalid number operators") {
    {
      auto node = parser.ParseExpression("123 % 456");
      REQUIRE(node != nullptr);

      gd::ExpressionValidator validator(platform, project, layout1, "number");
      node->Visit(validator);
      REQUIRE(validator.GetErrors().size() == 3);
      REQUIRE(validator.GetErrors()[1]->GetMessage() ==
              "No operator found. Did you forget to enter an operator (like +, "
              "-, * or /) between numbers or expressions?");
      REQUIRE(validator.GetErrors()[1]->GetStartPosition() == 4);
      // TODO Should error be removed?
      REQUIRE(validator.GetErrors()[2]->GetMessage() ==
              "You must enter a number.");
    }
    {
      auto node = parser.ParseExpression("123 ? 456");
      REQUIRE(node != nullptr);

      gd::ExpressionValidator validator(platform, project, layout1, "number");
      node->Visit(validator);
      REQUIRE(validator.GetErrors().size() == 1);
      REQUIRE(validator.GetErrors()[0]->GetMessage() ==
              "You've used an operator that is not supported. Operator should be "
              "either +, -, / or *.");
    }
    {
      auto node = parser.ParseExpression("1//2");
      REQUIRE(node != nullptr);

      gd::ExpressionValidator validator(platform, project, layout1, "number");
      node->Visit(validator);
      REQUIRE(validator.GetErrors().size() == 1);
      REQUIRE(validator.GetErrors()[0]->GetMessage() ==
              "You must enter a number or a valid expression call.");
      REQUIRE(validator.GetErrors()[0]->GetStartPosition() == 2);
    }
  }

  SECTION("Numbers and texts mismatchs") {
    {
      auto node = parser.ParseExpression("123 + \"hello world\"");
      REQUIRE(node != nullptr);

      gd::ExpressionValidator validator(platform, project, layout1, "number");
      node->Visit(validator);
      REQUIRE(validator.GetErrors().size() == 1);
      REQUIRE(validator.GetErrors()[0]->GetMessage() ==
              "You entered a text, but a number was expected.");
      REQUIRE(validator.GetErrors()[0]->GetStartPosition() == 6);
      REQUIRE(validator.GetErrors()[0]->GetEndPosition() == 19);
    }
    {
      auto node = parser.ParseExpression("\"hello world\" + 123");
      REQUIRE(node != nullptr);

      gd::ExpressionValidator validator(platform, project, layout1, "string");
      node->Visit(validator);
      REQUIRE(validator.GetErrors().size() == 1);
      REQUIRE(validator.GetErrors()[0]->GetMessage() ==
              "You entered a number, but a text was expected (in quotes).");
      REQUIRE(validator.GetErrors()[0]->GetStartPosition() == 16);
      REQUIRE(validator.GetErrors()[0]->GetEndPosition() == 19);
    }
  }
  SECTION("Numbers and texts mismatchs ('number|string' type)") {
    {
      auto node =
          parser.ParseExpression("123 + \"hello world\"");
      REQUIRE(node != nullptr);

      gd::ExpressionValidator validator(platform, project, layout1, "number|string");
      node->Visit(validator);
      REQUIRE(validator.GetErrors().size() == 1);
      REQUIRE(validator.GetErrors()[0]->GetMessage() ==
              "You entered a text, but a number was expected.");
      REQUIRE(validator.GetErrors()[0]->GetStartPosition() == 6);
      REQUIRE(validator.GetErrors()[0]->GetEndPosition() == 19);
    }
    {
      auto node =
          parser.ParseExpression("\"hello world\" + 123");
      REQUIRE(node != nullptr);

      gd::ExpressionValidator validator(platform, project, layout1, "number|string");
      node->Visit(validator);
      REQUIRE(validator.GetErrors().size() == 1);
      REQUIRE(validator.GetErrors()[0]->GetMessage() ==
              "You entered a number, but a text was expected (in quotes).");
      REQUIRE(validator.GetErrors()[0]->GetStartPosition() == 16);
      REQUIRE(validator.GetErrors()[0]->GetEndPosition() == 19);
    }
  }
  SECTION("Numbers and texts mismatchs with parenthesis") {
    {
      auto node =
          parser.ParseExpression("((123)) + (\"hello world\")");
      REQUIRE(node != nullptr);

      gd::ExpressionValidator validator(platform, project, layout1, "number");
      node->Visit(validator);
      REQUIRE(validator.GetErrors().size() == 1);
      REQUIRE(validator.GetErrors()[0]->GetMessage() ==
              "You entered a text, but a number was expected.");
      REQUIRE(validator.GetErrors()[0]->GetStartPosition() == 11);
      REQUIRE(validator.GetErrors()[0]->GetEndPosition() == 24);
    }
    {
      auto node =
          parser.ParseExpression("((\"hello world\") + (123))");
      REQUIRE(node != nullptr);

      gd::ExpressionValidator validator(platform, project, layout1, "string");
      node->Visit(validator);
      REQUIRE(validator.GetErrors().size() == 1);
      REQUIRE(validator.GetErrors()[0]->GetMessage() ==
              "You entered a number, but a text was expected (in quotes).");
      REQUIRE(validator.GetErrors()[0]->GetStartPosition() == 20);
      REQUIRE(validator.GetErrors()[0]->GetEndPosition() == 23);
    }
  }

  SECTION("Valid identifiers") {
    {
      auto node = parser.ParseExpression("HelloWorld1");
      REQUIRE(node != nullptr);
      auto &identifierNode = dynamic_cast<gd::IdentifierNode &>(*node);
      REQUIRE(identifierNode.identifierName == "HelloWorld1");

      gd::ExpressionValidator validator(platform, project, layout1, "object");
      node->Visit(validator);
      REQUIRE(validator.GetErrors().size() == 0);
    }

    {
      auto node = parser.ParseExpression("Hello World 1");
      REQUIRE(node != nullptr);
      auto &identifierNode = dynamic_cast<gd::IdentifierNode &>(*node);
      REQUIRE(identifierNode.identifierName == "Hello World 1");

      gd::ExpressionValidator validator(platform, project, layout1, "object");
      node->Visit(validator);
      REQUIRE(validator.GetErrors().size() == 0);
    }
    {
      auto node = parser.ParseExpression("Hello World 1 ");
      REQUIRE(node != nullptr);
      auto &identifierNode = dynamic_cast<gd::IdentifierNode &>(*node);
      REQUIRE(identifierNode.identifierName == "Hello World 1");

      gd::ExpressionValidator validator(platform, project, layout1, "object");
      node->Visit(validator);
      REQUIRE(validator.GetErrors().size() == 0);
    }
    {
      auto node = parser.ParseExpression("Hello World 1  ");
      REQUIRE(node != nullptr);
      auto &identifierNode = dynamic_cast<gd::IdentifierNode &>(*node);
      REQUIRE(identifierNode.identifierName == "Hello World 1");

      gd::ExpressionValidator validator(platform, project, layout1, "object");
      node->Visit(validator);
      REQUIRE(validator.GetErrors().size() == 0);
    }
  }

  SECTION("Invalid identifiers") {
    SECTION("empty identifiers") {
      auto node = parser.ParseExpression("");
      REQUIRE(node != nullptr);

      gd::ExpressionValidator validator(platform, project, layout1, "object");
      node->Visit(validator);
      REQUIRE(validator.GetErrors().size() == 1);
      REQUIRE(validator.GetErrors()[0]->GetMessage() ==
              "You must enter a valid object name.");
    }
    SECTION("with operator") {
      auto node = parser.ParseExpression("Hello + World1");
      REQUIRE(node != nullptr);

      gd::ExpressionValidator validator(platform, project, layout1, "object");
      node->Visit(validator);
      REQUIRE(validator.GetErrors().size() == 1);
      REQUIRE(validator.GetErrors()[0]->GetMessage() ==
              "Operators (+, -, /, *) can't be used with an object name. "
              "Remove the operator.");
    }
  }

  SECTION("Valid function calls") {
    SECTION("without parameter") {
      auto node = parser.ParseExpression("MyExtension::GetNumber()");
      REQUIRE(node != nullptr);
      auto &functionNode = dynamic_cast<gd::FunctionCallNode &>(*node);
      REQUIRE(functionNode.functionName == "MyExtension::GetNumber");
      REQUIRE(functionNode.objectName == "");
      REQUIRE(functionNode.behaviorName == "");

      gd::ExpressionValidator validator(platform, project, layout1, "number");
      node->Visit(validator);
      REQUIRE(validator.GetErrors().size() == 0);
    }
    SECTION("number and string parameters") {
      auto node = parser.ParseExpression(
          "MyExtension::GetNumberWith2Params(12, \"hello world\")");
      REQUIRE(node != nullptr);
      auto &functionNode = dynamic_cast<gd::FunctionCallNode &>(*node);
      REQUIRE(functionNode.functionName == "MyExtension::GetNumberWith2Params");
      REQUIRE(functionNode.objectName == "");
      REQUIRE(functionNode.behaviorName == "");

      gd::ExpressionValidator validator(platform, project, layout1, "number");
      node->Visit(validator);
      REQUIRE(validator.GetErrors().size() == 0);
    }
    SECTION("3rd optional parameter not set") {
      auto node = parser.ParseExpression(
          "MyExtension::GetNumberWith3Params(12, \"hello world\")");
      REQUIRE(node != nullptr);
      auto &functionNode = dynamic_cast<gd::FunctionCallNode &>(*node);

      gd::ExpressionValidator validator(platform, project, layout1, "number");
      node->Visit(validator);
      REQUIRE(validator.GetErrors().size() == 0);
    }
    SECTION("3rd optional parameter set") {
      auto node = parser.ParseExpression(
          "MyExtension::GetNumberWith3Params(12, \"hello world\", 34)");
      REQUIRE(node != nullptr);
      auto &functionNode = dynamic_cast<gd::FunctionCallNode &>(*node);

      gd::ExpressionValidator validator(platform, project, layout1, "number");
      node->Visit(validator);
      REQUIRE(validator.GetErrors().size() == 0);
    }
    SECTION("object function call") {
      auto node =
          parser.ParseExpression("MySpriteObject.GetObjectNumber()");
      REQUIRE(node != nullptr);
      auto &functionNode = dynamic_cast<gd::FunctionCallNode &>(*node);
      REQUIRE(functionNode.functionName == "GetObjectNumber");
      REQUIRE(functionNode.objectName == "MySpriteObject");
      REQUIRE(functionNode.behaviorName == "");

      gd::ExpressionValidator validator(platform, project, layout1, "number");
      node->Visit(validator);
      REQUIRE(validator.GetErrors().size() == 0);
    }
    SECTION("behavior function call") {
      auto node = parser.ParseExpression(
          "WhateverObject.WhateverBehavior::WhateverFunction()");
      REQUIRE(node != nullptr);
      auto &functionNode = dynamic_cast<gd::FunctionCallNode &>(*node);
      REQUIRE(functionNode.functionName == "WhateverFunction");
      REQUIRE(functionNode.objectName == "WhateverObject");
      REQUIRE(functionNode.behaviorName == "WhateverBehavior");
    }
    SECTION("identifier parameter") {
      auto node = parser.ParseExpression(
          "WhateverObject.WhateverBehavior::WhateverFunction(1, \"2\", three)");
      REQUIRE(node != nullptr);
      auto &functionNode = dynamic_cast<gd::FunctionCallNode &>(*node);
      REQUIRE(functionNode.functionName == "WhateverFunction");
      REQUIRE(functionNode.objectName == "WhateverObject");
      REQUIRE(functionNode.behaviorName == "WhateverBehavior");
      REQUIRE(functionNode.parameters.size() == 3);
      auto &numberNode =
          dynamic_cast<gd::NumberNode &>(*functionNode.parameters[0]);
      auto &textNode =
          dynamic_cast<gd::TextNode &>(*functionNode.parameters[1]);
      auto &identifierNode =
          dynamic_cast<gd::IdentifierNode &>(*functionNode.parameters[2]);

      REQUIRE(numberNode.number == "1");
      REQUIRE(textNode.text == "2");
      REQUIRE(identifierNode.identifierName == "three");
    }
  }

  SECTION("Valid function calls ('number|string' type)") {
    {
      auto node =
          parser.ParseExpression("MyExtension::GetNumber()");
      REQUIRE(node != nullptr);
      auto &functionNode = dynamic_cast<gd::FunctionCallNode &>(*node);
      auto type = gd::ExpressionTypeFinder::GetType(
          platform, project, layout1, "number|string", functionNode);
      REQUIRE(functionNode.functionName == "MyExtension::GetNumber");
      REQUIRE(type == "number");
      REQUIRE(functionNode.objectName == "");
      REQUIRE(functionNode.behaviorName == "");

      gd::ExpressionValidator validator(platform, project, layout1, "number|string");
      node->Visit(validator);
      REQUIRE(validator.GetErrors().size() == 0);
    }
    {
      auto node =
          parser.ParseExpression("MyExtension::ToString(23)");
      REQUIRE(node != nullptr);
      auto &functionNode = dynamic_cast<gd::FunctionCallNode &>(*node);
      auto type = gd::ExpressionTypeFinder::GetType(
          platform, project, layout1, "number|string", functionNode);
      REQUIRE(functionNode.functionName == "MyExtension::ToString");
      REQUIRE(type == "string");
      REQUIRE(functionNode.objectName == "");
      REQUIRE(functionNode.behaviorName == "");

      gd::ExpressionValidator validator(platform, project, layout1, "number|string");
      node->Visit(validator);
      REQUIRE(validator.GetErrors().size() == 0);
    }
  }

  SECTION("Valid function calls (whitespaces)") {
    {
      auto node =
          parser.ParseExpression("MyExtension::GetNumber  ()");
      REQUIRE(node != nullptr);
      auto &functionNode = dynamic_cast<gd::FunctionCallNode &>(*node);
      REQUIRE(functionNode.functionName == "MyExtension::GetNumber");
      REQUIRE(functionNode.objectName == "");
      REQUIRE(functionNode.behaviorName == "");

      gd::ExpressionValidator validator(platform, project, layout1, "number");
      node->Visit(validator);
      REQUIRE(validator.GetErrors().size() == 0);
    }
    {
      auto node = parser.ParseExpression(
          "MySpriteObject  .  GetObjectNumber  ()");
      REQUIRE(node != nullptr);
      auto &functionNode = dynamic_cast<gd::FunctionCallNode &>(*node);
      REQUIRE(functionNode.functionName == "GetObjectNumber");
      REQUIRE(functionNode.objectName == "MySpriteObject");
      REQUIRE(functionNode.behaviorName == "");

      gd::ExpressionValidator validator(platform, project, layout1, "number");
      node->Visit(validator);
      REQUIRE(validator.GetErrors().size() == 0);
    }
    {
      auto node = parser.ParseExpression("WhateverObject  .  WhateverBehavior  "
                                         "::  WhateverFunction  (  1  ,  \"2\" "
                                         " ,  three  )");
      REQUIRE(node != nullptr);
      auto &functionNode = dynamic_cast<gd::FunctionCallNode &>(*node);
      REQUIRE(functionNode.functionName == "WhateverFunction");
      REQUIRE(functionNode.objectName == "WhateverObject");
      REQUIRE(functionNode.behaviorName == "WhateverBehavior");
      REQUIRE(functionNode.parameters.size() == 3);
      auto &numberNode =
          dynamic_cast<gd::NumberNode &>(*functionNode.parameters[0]);
      auto &textNode =
          dynamic_cast<gd::TextNode &>(*functionNode.parameters[1]);
      auto &identifierNode =
          dynamic_cast<gd::IdentifierNode &>(*functionNode.parameters[2]);

      REQUIRE(numberNode.number == "1");
      REQUIRE(textNode.text == "2");
      REQUIRE(identifierNode.identifierName == "three");
    }
  }

  SECTION("Valid function calls (trailing commas)") {
    {
      auto node = parser.ParseExpression(
          "MyExtension::GetNumberWith3Params(12, \"hello world\",)");
      REQUIRE(node != nullptr);
      auto &functionNode = dynamic_cast<gd::FunctionCallNode &>(*node);

      gd::ExpressionValidator validator(platform, project, layout1, "number");
      node->Visit(validator);
      REQUIRE(validator.GetErrors().size() == 0);
    }
  }

  SECTION("Valid function calls (deprecated missing optional arguments)") {
    {
      auto node = parser.ParseExpression("MyExtension::MouseX(,)");
      REQUIRE(node != nullptr);
      auto &functionNode = dynamic_cast<gd::FunctionCallNode &>(*node);

      gd::ExpressionValidator validator(platform, project, layout1, "number");
      node->Visit(validator);
      REQUIRE(validator.GetErrors().size() == 0);
    }
    {
      auto node = parser.ParseExpression("MyExtension::MouseX(,0)");
      REQUIRE(node != nullptr);
      auto &functionNode = dynamic_cast<gd::FunctionCallNode &>(*node);

      gd::ExpressionValidator validator(platform, project, layout1, "number");
      node->Visit(validator);
      REQUIRE(validator.GetErrors().size() == 0);
    }
  }

  SECTION("Valid object function name") {
    auto node = parser.ParseExpression("MyObject.MyFunc");
    REQUIRE(node != nullptr);
    auto &identifierNode =
        dynamic_cast<gd::IdentifierNode &>(*node);
    REQUIRE(identifierNode.identifierName == "MyObject");
    REQUIRE(identifierNode.childIdentifierName == "MyFunc");
  }

  SECTION("Valid object behavior name") {
    auto node = parser.ParseExpression("MyObject.MyBehavior::MyFunc");
    REQUIRE(node != nullptr);
    auto &objectFunctionName =
        dynamic_cast<gd::ObjectFunctionNameNode &>(*node);
    REQUIRE(objectFunctionName.objectName == "MyObject");
    REQUIRE(objectFunctionName.objectFunctionOrBehaviorName == "MyBehavior");
    REQUIRE(objectFunctionName.behaviorFunctionName == "MyFunc");

    gd::ExpressionValidator validator(platform, project, layout1, "number");
    node->Visit(validator);
    REQUIRE(validator.GetErrors().size() == 1);
    REQUIRE(validator.GetErrors()[0]->GetMessage() ==
            "An opening parenthesis was expected here to call a function.");
  }

  SECTION("Unfinished object function name") {
    auto node = parser.ParseExpression("MyObject.");
    REQUIRE(node != nullptr);
    auto &identifierNode =
        dynamic_cast<gd::IdentifierNode &>(*node);
    REQUIRE(identifierNode.identifierName == "MyObject");
    REQUIRE(identifierNode.childIdentifierName == "");
  }

  SECTION("Unfinished object function name of type string with parentheses") {
    auto node = parser.ParseExpression("MyObject.()");
    REQUIRE(node != nullptr);
    auto &objectFunctionCall = dynamic_cast<gd::FunctionCallNode &>(*node);
      auto type = gd::ExpressionTypeFinder::GetType(
          platform, project, layout1, "string", objectFunctionCall);
    REQUIRE(objectFunctionCall.objectName == "MyObject");
    REQUIRE(objectFunctionCall.functionName == "");
    REQUIRE(type == "string");
  }

  SECTION("Unfinished object function name of type number with parentheses") {
    auto node = parser.ParseExpression("MyObject.()");
    REQUIRE(node != nullptr);
    auto &objectFunctionCall = dynamic_cast<gd::FunctionCallNode &>(*node);
      auto type = gd::ExpressionTypeFinder::GetType(
          platform, project, layout1, "number", objectFunctionCall);
    REQUIRE(objectFunctionCall.objectName == "MyObject");
    REQUIRE(objectFunctionCall.functionName == "");
    REQUIRE(type == "number");
  }

  SECTION(
      "Unfinished object function name of type number|string with "
      "parentheses") {
    auto node = parser.ParseExpression("MyObject.()");
    REQUIRE(node != nullptr);
    auto &objectFunctionCall = dynamic_cast<gd::FunctionCallNode &>(*node);
      auto type = gd::ExpressionTypeFinder::GetType(
          platform, project, layout1, "number|string", objectFunctionCall);
    REQUIRE(objectFunctionCall.objectName == "MyObject");
    REQUIRE(objectFunctionCall.functionName == "");
    REQUIRE(type == "number|string");
  }

  SECTION("Unfinished object behavior name") {
    auto node = parser.ParseExpression("MyObject.MyBehavior::");
    REQUIRE(node != nullptr);
    auto &objectFunctionName =
        dynamic_cast<gd::ObjectFunctionNameNode &>(*node);
    REQUIRE(objectFunctionName.objectName == "MyObject");
    REQUIRE(objectFunctionName.objectFunctionOrBehaviorName == "MyBehavior");
    REQUIRE(objectFunctionName.behaviorFunctionName == "");
  }

  SECTION("Unfinished object behavior name of type string with parentheses") {
    auto node = parser.ParseExpression("MyObject.MyBehavior::()");
    REQUIRE(node != nullptr);
    auto &objectFunctionName = dynamic_cast<gd::FunctionCallNode &>(*node);
      auto type = gd::ExpressionTypeFinder::GetType(
          platform, project, layout1, "string", objectFunctionName);
    REQUIRE(objectFunctionName.objectName == "MyObject");
    REQUIRE(objectFunctionName.behaviorName == "MyBehavior");
    REQUIRE(objectFunctionName.functionName == "");
    REQUIRE(type == "string");
  }

  SECTION("Unfinished object behavior name of type number with parentheses") {
    auto node = parser.ParseExpression("MyObject.MyBehavior::()");
    REQUIRE(node != nullptr);
    auto &objectFunctionName = dynamic_cast<gd::FunctionCallNode &>(*node);
      auto type = gd::ExpressionTypeFinder::GetType(
          platform, project, layout1, "number", objectFunctionName);
    REQUIRE(objectFunctionName.objectName == "MyObject");
    REQUIRE(objectFunctionName.behaviorName == "MyBehavior");
    REQUIRE(objectFunctionName.functionName == "");
    REQUIRE(type == "number");
  }

  SECTION(
      "Unfinished object behavior name of type number|string with "
      "parentheses") {
    auto node =
        parser.ParseExpression("MyObject.MyBehavior::()");
    REQUIRE(node != nullptr);
    auto &objectFunctionName = dynamic_cast<gd::FunctionCallNode &>(*node);
      auto type = gd::ExpressionTypeFinder::GetType(
          platform, project, layout1, "number|string", objectFunctionName);
    REQUIRE(objectFunctionName.objectName == "MyObject");
    REQUIRE(objectFunctionName.behaviorName == "MyBehavior");
    REQUIRE(objectFunctionName.functionName == "");
    REQUIRE(type == "number|string");
  }

  SECTION("Unfinished free function name of type string with parentheses") {
    auto node = parser.ParseExpression("fun()");
    REQUIRE(node != nullptr);
    auto &freeFunctionCall = dynamic_cast<gd::FunctionCallNode &>(*node);
      auto type = gd::ExpressionTypeFinder::GetType(
          platform, project, layout1, "string", freeFunctionCall);
    REQUIRE(freeFunctionCall.objectName == "");
    REQUIRE(freeFunctionCall.functionName == "fun");
    REQUIRE(type == "string");
  }

  SECTION("Unfinished free function name of type number with parentheses") {
    auto node = parser.ParseExpression("fun()");
    REQUIRE(node != nullptr);
    auto &freeFunctionCall = dynamic_cast<gd::FunctionCallNode &>(*node);
      auto type = gd::ExpressionTypeFinder::GetType(
          platform, project, layout1, "number", freeFunctionCall);
    REQUIRE(freeFunctionCall.objectName == "");
    REQUIRE(freeFunctionCall.functionName == "fun");
    REQUIRE(type == "number");
  }

  SECTION(
      "Unfinished free function name of type number|string with parentheses") {
    auto node = parser.ParseExpression("fun()");
    REQUIRE(node != nullptr);
    auto &freeFunctionCall = dynamic_cast<gd::FunctionCallNode &>(*node);
      auto type = gd::ExpressionTypeFinder::GetType(
          platform, project, layout1, "number|string", freeFunctionCall);
    REQUIRE(freeFunctionCall.objectName == "");
    REQUIRE(freeFunctionCall.functionName == "fun");
    REQUIRE(type == "number|string");
  }

  SECTION("Invalid function calls") {
    SECTION("wrong name") {
      auto node = parser.ParseExpression("Idontexist(12)");
      REQUIRE(node != nullptr);

      gd::ExpressionValidator validator(platform, project, layout1, "number");
      node->Visit(validator);
      REQUIRE(validator.GetErrors().size() == 1);
      REQUIRE(validator.GetErrors()[0]->GetMessage() ==
              "Cannot find an expression with this name: Idontexist\nDouble "
              "check that you've not made any typo in the name.");
      REQUIRE(validator.GetErrors()[0]->GetStartPosition() == 0);
      REQUIRE(validator.GetErrors()[0]->GetEndPosition() == 14);
    }
    SECTION("too much parameters") {
      SECTION("on a free function") {
        auto node =
            parser.ParseExpression("MyExtension::GetNumber(12)");
        REQUIRE(node != nullptr);

        gd::ExpressionValidator validator(platform, project, layout1, "number");
        node->Visit(validator);
        REQUIRE(validator.GetErrors().size() == 1);
        REQUIRE(validator.GetErrors()[0]->GetMessage() ==
                "This parameter was not expected by this expression. Remove it "
                "or verify that you've entered the proper expression name. "
                "The number of parameters must be exactly 0");
        REQUIRE(validator.GetErrors()[0]->GetStartPosition() == 23);
        REQUIRE(validator.GetErrors()[0]->GetEndPosition() == 25);
      }
      SECTION("on an object function") {
        auto node = parser.ParseExpression("MySpriteObject.GetObjectNumber(12)");
        REQUIRE(node != nullptr);

        gd::ExpressionValidator validator(platform, project, layout1, "number");
        node->Visit(validator);
        REQUIRE(validator.GetErrors().size() == 1);
        REQUIRE(validator.GetErrors()[0]->GetMessage() ==
                "This parameter was not expected by this expression. Remove it "
                "or verify that you've entered the proper expression name. "
                "The number of parameters must be exactly 0");
        REQUIRE(validator.GetErrors()[0]->GetStartPosition() == 31);
        REQUIRE(validator.GetErrors()[0]->GetEndPosition() == 33);
      }
    }
    SECTION("not enough parameters") {
      auto node = parser.ParseExpression(
          "MyExtension::GetNumberWith2Params(12)");
      REQUIRE(node != nullptr);

      gd::ExpressionValidator validator(platform, project, layout1, "number");
      node->Visit(validator);
      REQUIRE(validator.GetErrors().size() == 1);
      REQUIRE(validator.GetErrors()[0]->GetMessage() ==
              "You have not entered enough parameters for the expression. The "
              "number of parameters must be exactly 2");
      REQUIRE(validator.GetErrors()[0]->GetStartPosition() == 0);
      REQUIRE(validator.GetErrors()[0]->GetEndPosition() == 37);
    }
    SECTION("wrong parameter type") {
      auto node = parser.ParseExpression(
          "MyExtension::GetNumberWith2Params(1, 1)");
      REQUIRE(node != nullptr);

      gd::ExpressionValidator validator(platform, project, layout1, "number");
      node->Visit(validator);
      REQUIRE(validator.GetErrors().size() == 1);
      REQUIRE(validator.GetErrors()[0]->GetMessage() ==
              "You entered a number, but a text was expected (in quotes).");
      REQUIRE(validator.GetErrors()[0]->GetStartPosition() == 37);
      REQUIRE(validator.GetErrors()[0]->GetEndPosition() == 38);
    }
    SECTION("wrong return type") {
      {
        auto node = parser.ParseExpression("MyExtension::GetNumber()");
        REQUIRE(node != nullptr);

        gd::ExpressionValidator validator(platform, project, layout1, "string");
        node->Visit(validator);
        REQUIRE(validator.GetErrors().size() == 1);
        REQUIRE(validator.GetErrors()[0]->GetMessage() ==
                "You tried to use an expression that returns a number, but a "
                "string is expected. Use `ToString` if you need to convert a "
                "number to a string.");
        REQUIRE(validator.GetErrors()[0]->GetStartPosition() == 0);
        REQUIRE(validator.GetErrors()[0]->GetEndPosition() == 24);
      }
      {
        auto node = parser.ParseExpression("MyExtension::ToString()");
        REQUIRE(node != nullptr);

        gd::ExpressionValidator validator(platform, project, layout1, "number");
        node->Visit(validator);
        REQUIRE(validator.GetErrors().size() == 1);
        REQUIRE(validator.GetErrors()[0]->GetMessage() ==
                "You tried to use an expression that returns a string, but a "
                "number is expected. Use `ToNumber` if you need to convert a "
                "string to a number.");
        REQUIRE(validator.GetErrors()[0]->GetStartPosition() == 0);
        REQUIRE(validator.GetErrors()[0]->GetEndPosition() == 23);
      }
    }
    SECTION("finishing with namespace separator") {
      SECTION("free function") {
        auto node = parser.ParseExpression("MyExtension::(12)");
        REQUIRE(node != nullptr);

        gd::ExpressionValidator validator(platform, project, layout1, "number");
        node->Visit(validator);
        REQUIRE(validator.GetErrors().size() == 1);
        REQUIRE(validator.GetErrors()[0]->GetMessage() ==
                "Cannot find an expression with this name: MyExtension::\nDouble "
                "check that you've not made any typo in the name.");
        REQUIRE(validator.GetErrors()[0]->GetStartPosition() == 0);
        REQUIRE(validator.GetErrors()[0]->GetEndPosition() == 17);
      }
      SECTION("behavior function") {
        auto node = parser.ParseExpression("MyObject.MyBehavior::(12)");
        REQUIRE(node != nullptr);

        gd::ExpressionValidator validator(platform, project, layout1, "number");
        node->Visit(validator);
        REQUIRE(validator.GetErrors().size() == 1);

        // TODO: The error message could be improved
        REQUIRE(validator.GetErrors()[0]->GetMessage() ==
                "Cannot find an expression with this name: \nDouble "
                "check that you've not made any typo in the name.");
        REQUIRE(validator.GetErrors()[0]->GetStartPosition() == 0);
        REQUIRE(validator.GetErrors()[0]->GetEndPosition() == 25);
      }
    }
  }

  SECTION("Invalid variables") {
    SECTION("empty variables") {
      auto node = parser.ParseExpression("");
      REQUIRE(node != nullptr);

      gd::ExpressionValidator validator(platform, project, layout1, "scenevar");
      node->Visit(validator);
      REQUIRE(validator.GetErrors().size() == 1);
      REQUIRE(validator.GetErrors()[0]->GetMessage() ==
              "You must enter a variable name.");
    }
    SECTION("identifier in brackets") {
      auto node = parser.ParseExpression("myVariable[myChild]");
      REQUIRE(node != nullptr);

      gd::ExpressionValidator validator(platform, project, layout1, "scenevar");
      node->Visit(validator);
      REQUIRE(validator.GetErrors().size() == 1);
      REQUIRE(validator.GetErrors()[0]->GetMessage() ==
            "You must enter a number or a text, wrapped inside double quotes "
            "(example: \"Hello world\").");
    }
    SECTION("no closing bracket") {
      auto node = parser.ParseExpression("myVariable[\"myChild\"");
      REQUIRE(node != nullptr);

      gd::ExpressionValidator validator(platform, project, layout1, "scenevar");
      node->Visit(validator);
      REQUIRE(validator.GetErrors().size() == 1);
      REQUIRE(validator.GetErrors()[0]->GetMessage() ==
            "Missing a closing bracket. Add a closing bracket for each opening bracket.");
    }
    SECTION("number instead") {
      auto node = parser.ParseExpression("1234");
      REQUIRE(node != nullptr);

      gd::ExpressionValidator validator(platform, project, layout1, "scenevar");
      node->Visit(validator);
      REQUIRE(validator.GetErrors().size() == 1);
      REQUIRE(validator.GetErrors()[0]->GetMessage() ==
              "You entered a number, but this type was expected: variable");
    }
    SECTION("string instead") {
      auto node = parser.ParseExpression("\"text\"");
      REQUIRE(node != nullptr);

      gd::ExpressionValidator validator(platform, project, layout1, "scenevar");
      node->Visit(validator);
      REQUIRE(validator.GetErrors().size() == 1);
      REQUIRE(validator.GetErrors()[0]->GetMessage() ==
              "You entered a text, but this type was expected: variable");
    }
  }

  SECTION("Valid variables") {
    SECTION("simple variable") {
      auto node = parser.ParseExpression("myVariable");
      REQUIRE(node != nullptr);
      auto &identifierNode = dynamic_cast<gd::IdentifierNode &>(*node);
      REQUIRE(identifierNode.identifierName == "myVariable");
      REQUIRE(identifierNode.identifierNameLocation.GetStartPosition() == 0);
      REQUIRE(identifierNode.identifierNameLocation.GetEndPosition() == 10);
      REQUIRE(identifierNode.childIdentifierName == "");
      REQUIRE(identifierNode.identifierNameDotLocation.IsValid() == false);
      REQUIRE(identifierNode.childIdentifierNameLocation.IsValid() == false);
    }
    SECTION("child with dot accessor") {
      auto node = parser.ParseExpression("myVariable.myChild");
      REQUIRE(node != nullptr);
      auto &identifierNode = dynamic_cast<gd::IdentifierNode &>(*node);
      REQUIRE(identifierNode.identifierName == "myVariable");
      REQUIRE(identifierNode.childIdentifierName == "myChild");
      
      gd::ExpressionValidator validator(platform, project, layout1, "scenevar");
      node->Visit(validator);
      REQUIRE(validator.GetErrors().size() == 0);
    }
    SECTION("child with brackets accessor") {
      auto node = parser.ParseExpression(
          "myVariable[ \"My named children\"  ]");
      REQUIRE(node != nullptr);
      auto &variableNode = dynamic_cast<gd::VariableNode &>(*node);
      REQUIRE(variableNode.name == "myVariable");
      REQUIRE(variableNode.child != nullptr);
      auto &childNode =
          dynamic_cast<gd::VariableBracketAccessorNode &>(*variableNode.child);
      REQUIRE(childNode.expression != nullptr);
      auto &textNode = dynamic_cast<gd::TextNode &>(*childNode.expression);
      REQUIRE(textNode.text == "My named children");

      gd::ExpressionValidator validator(platform, project, layout1, "scenevar");
      node->Visit(validator);
      REQUIRE(validator.GetErrors().size() == 0);
    }
    SECTION("child with brackets then dot") {
      auto node = parser.ParseExpression(
          "myVariable[ \"My named children\"  ] . grandChild");
      REQUIRE(node != nullptr);
      auto &variableNode = dynamic_cast<gd::VariableNode &>(*node);
      REQUIRE(variableNode.name == "myVariable");
      REQUIRE(variableNode.child != nullptr);
      auto &childNode =
          dynamic_cast<gd::VariableBracketAccessorNode &>(*variableNode.child);
      REQUIRE(childNode.child != nullptr);
      auto &grandChildNode =
          dynamic_cast<gd::VariableAccessorNode &>(*childNode.child);
      REQUIRE(grandChildNode.name == "grandChild");

      gd::ExpressionValidator validator(platform, project, layout1, "scenevar");
      node->Visit(validator);
      REQUIRE(validator.GetErrors().size() == 0);
    }
  }

  SECTION("Valid type inferred from expressions with type 'number|string'") {
    {
      auto node = parser.ParseExpression("123");
      REQUIRE(node != nullptr);
      auto type = gd::ExpressionTypeFinder::GetType(
          platform, project, layout1, "number|string", *node.get());
      REQUIRE(type == "number");
    }
    {
      auto node = parser.ParseExpression("123 + MyExtension::GetNumber()");
      REQUIRE(node != nullptr);
      auto type = gd::ExpressionTypeFinder::GetType(
          platform, project, layout1, "number|string", *node.get());
      REQUIRE(type == "number");
    }
    {
      auto node = parser.ParseExpression("\"Hello\"");
      REQUIRE(node != nullptr);
      auto type = gd::ExpressionTypeFinder::GetType(
          platform, project, layout1, "number|string", *node.get());
      REQUIRE(type == "string");
    }
    {
      auto node = parser.ParseExpression(
          "\"Hello\" + MyExtension::ToString(3)");
      REQUIRE(node != nullptr);
      auto type = gd::ExpressionTypeFinder::GetType(
          platform, project, layout1, "number|string", *node.get());
      REQUIRE(type == "string");
    }
  }

  SECTION("Valid function call with object variable") {
    {
      // Note that in this test we need to use an expression with "objectvar",
      // as ExpressionVariableOwnerFinder depends on this parameter type
      // information.
      auto node = parser.ParseExpression(
          "MyExtension::GetStringWith2ObjectParamAnd2ObjectVarParam(MyObject1, "
          "MyVar1, MyObject2, MyVar2)");
      REQUIRE(node != nullptr);
      auto &functionNode = dynamic_cast<gd::FunctionCallNode &>(*node);
      auto &identifierObject1Node =
          dynamic_cast<gd::IdentifierNode &>(*functionNode.parameters[0]);
      auto &variable1Node =
          dynamic_cast<gd::IdentifierNode &>(*functionNode.parameters[1]);
      auto &identifierObject2Node =
          dynamic_cast<gd::IdentifierNode &>(*functionNode.parameters[2]);
      auto &variable2Node =
          dynamic_cast<gd::IdentifierNode &>(*functionNode.parameters[3]);

      REQUIRE(identifierObject1Node.identifierName == "MyObject1");
      REQUIRE(identifierObject2Node.identifierName == "MyObject2");
      REQUIRE(variable1Node.identifierName == "MyVar1");
      REQUIRE(variable2Node.identifierName == "MyVar2");
      
      auto variable1ObjectName = gd::ExpressionVariableOwnerFinder::GetObjectName(
          platform, project, layout1, "", variable1Node);
      REQUIRE(variable1ObjectName == "MyObject1");
      auto variable2ObjectName = gd::ExpressionVariableOwnerFinder::GetObjectName(
          platform, project, layout1, "", variable2Node);
      REQUIRE(variable2ObjectName == "MyObject2");
      
      gd::ExpressionValidator validator(platform, project, layout1, "string");
      node->Visit(validator);
      REQUIRE(validator.GetErrors().size() == 0);
    }
  }

  SECTION("Valid function call with 2 object variable from the same object") {
    {
      auto node = parser.ParseExpression(
          "MyExtension::GetStringWith1ObjectParamAnd2ObjectVarParam(MyObject1, "
          "MyVar1, MyVar2)");
      REQUIRE(node != nullptr);
      auto &functionNode = dynamic_cast<gd::FunctionCallNode &>(*node);
      auto &identifierObject1Node =
          dynamic_cast<gd::IdentifierNode &>(*functionNode.parameters[0]);
      auto &variable1Node =
          dynamic_cast<gd::IdentifierNode &>(*functionNode.parameters[1]);
      auto &variable2Node =
          dynamic_cast<gd::IdentifierNode &>(*functionNode.parameters[2]);

      REQUIRE(identifierObject1Node.identifierName == "MyObject1");
      REQUIRE(variable1Node.identifierName == "MyVar1");
      REQUIRE(variable2Node.identifierName == "MyVar2");
      
      auto variable1ObjectName = gd::ExpressionVariableOwnerFinder::GetObjectName(
          platform, project, layout1, "", variable1Node);
      REQUIRE(variable1ObjectName == "MyObject1");
      auto variable2ObjectName = gd::ExpressionVariableOwnerFinder::GetObjectName(
          platform, project, layout1, "", variable2Node);
      REQUIRE(variable2ObjectName == "MyObject1");
      
      gd::ExpressionValidator validator(platform, project, layout1, "string");
      node->Visit(validator);
      REQUIRE(validator.GetErrors().size() == 0);
    }
  }

  SECTION("Valid object function call with 1 object variable from the object of the function") {
    {
      auto node = parser.ParseExpression(
          "MySpriteObject.GetObjectVariableAsNumber(MyVar1)");
      REQUIRE(node != nullptr);
      auto &functionNode = dynamic_cast<gd::FunctionCallNode &>(*node);
      auto &variable1Node =
          dynamic_cast<gd::IdentifierNode &>(*functionNode.parameters[0]);

      REQUIRE(variable1Node.identifierName == "MyVar1");
      
      auto variable1ObjectName = gd::ExpressionVariableOwnerFinder::GetObjectName(
          platform, project, layout1, "MySpriteObject", variable1Node);
      REQUIRE(variable1ObjectName == "MySpriteObject");
      
      gd::ExpressionValidator validator(platform, project, layout1, "number");
      node->Visit(validator);
      REQUIRE(validator.GetErrors().size() == 0);
    }
  }

  SECTION("Valid object function call with 1 object variable from the object of the function with a child") {
    {
      auto node = parser.ParseExpression(
          "MySpriteObject.GetObjectVariableAsNumber(MyVar1.MyChild)");
      REQUIRE(node != nullptr);
      auto &functionNode = dynamic_cast<gd::FunctionCallNode &>(*node);
      auto &variable1Node =
          dynamic_cast<gd::IdentifierNode &>(*functionNode.parameters[0]);

      REQUIRE(variable1Node.identifierName == "MyVar1");
      REQUIRE(variable1Node.childIdentifierName == "MyChild");
      
      auto variable1ObjectName = gd::ExpressionVariableOwnerFinder::GetObjectName(
          platform, project, layout1, "MySpriteObject", variable1Node);
      REQUIRE(variable1ObjectName == "MySpriteObject");
      
      gd::ExpressionValidator validator(platform, project, layout1, "number");
      node->Visit(validator);
      REQUIRE(validator.GetErrors().size() == 0);
    }
  }

  SECTION("Function call with an invalid object parameter") {
    {
      // Note that in this test we need to use an expression with "objectvar",
      // as the grammar of the parser depends on this parameter type
      // information.
      auto node = parser.ParseExpression(
          "MyExtension::GetStringWith2ObjectParamAnd2ObjectVarParam(My "
          "badly/written object1, MyVar1, MyObject2, MyVar2)");
      REQUIRE(node != nullptr);

      gd::ExpressionValidator validator(platform, project, layout1, "string");
      node->Visit(validator);
      REQUIRE(validator.GetErrors().size() == 2);
      REQUIRE(validator.GetErrors()[0]->GetMessage() ==
              "Operators (+, -, /, *) can't be used with an object name. Remove "
              "the operator.");
      REQUIRE(validator.GetErrors()[1]->GetMessage() ==
              "An object name was expected but something else was written. "
              "Enter just the name of the object for this parameter.");
    }
  }

  SECTION("Function call with an invalid variable parameter") {
    {
      // Note that in this test we need to use an expression with "objectvar",
      // as the grammar of the parser depends on this parameter type
      // information.
      auto node = parser.ParseExpression(
          "MyExtension::GetStringWith2ObjectParamAnd2ObjectVarParam(MyObject1, "
          "My badly/written var1, MyObject2, MyVar2)");
      REQUIRE(node != nullptr);

      gd::ExpressionValidator validator(platform, project, layout1, "string");
      node->Visit(validator);
      REQUIRE(validator.GetErrors().size() == 2);
      REQUIRE(validator.GetErrors()[0]->GetMessage() ==
              "Operators (+, -, /, *) can't be used in variable names. Remove "
              "the operator from the variable name.");
      REQUIRE(validator.GetErrors()[1]->GetMessage() ==
              "A variable name was expected but something else was written. "
              "Enter just the name of the variable for this parameter.");
    }
  }

  SECTION(
      "Valid function call with an object expression requiring a capability") {
    auto node = parser.ParseExpression(
        "MySpriteObject.GetSomethingRequiringEffectCapability(123)");
    REQUIRE(node != nullptr);

    gd::ExpressionValidator validator(platform, project, layout1, "string");
    node->Visit(validator);
    REQUIRE(validator.GetErrors().size() == 0);
  }

  SECTION(
      "Invalid function call with an object expression requiring a "
      "capability") {
    auto node =
        parser.ParseExpression("MyFakeObjectWithUnsupportedCapability."
                               "GetSomethingRequiringEffectCapability(123)");
    REQUIRE(node != nullptr);

    gd::ExpressionValidator validator(platform, project, layout1, "string");
    node->Visit(validator);
    REQUIRE(validator.GetErrors().size() == 1);
    REQUIRE(validator.GetErrors()[0]->GetMessage() ==
            "This expression exists, but it can't be used on this object.");
  }

  SECTION("Fuzzy/random tests") {
    {
      auto testExpression = [&parser, platform, project, layout1](const gd::String &expression) {
        auto testExpressionWithType = [&parser, platform, project, layout1,
                                       &expression](const gd::String &type) {
          auto node = parser.ParseExpression(expression);
          REQUIRE(node != nullptr);
          gd::ExpressionValidator validator(platform, project, layout1, type);
          node->Visit(validator);
          REQUIRE(validator.GetErrors().size() != 0);
        };

        testExpressionWithType("number");
        testExpressionWithType("string");
        testExpressionWithType("scenevar");
        testExpressionWithType("globalvar");
        testExpressionWithType("objectvar");
        testExpressionWithType("object");
        testExpressionWithType("objectPtr");
        testExpressionWithType("unknown");
      };

      REQUIRE_NOTHROW(testExpression(""));
      REQUIRE_NOTHROW(
          testExpression("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!"
                         "!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!"
                         "!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!"));
      REQUIRE_NOTHROW(testExpression(
          "2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/"
          "2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/"
          "2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/"
          "2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/"
          "2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2[]"));
      REQUIRE_NOTHROW(testExpression("-043jovn"));
      REQUIRE_NOTHROW(testExpression("-043jo\t\t\r\n+==\t-vn"));
      REQUIRE_NOTHROW(testExpression("--=frpvlf-=3ok"));
      REQUIRE_NOTHROW(testExpression("-[][\\][\\][]]"));
      REQUIRE_NOTHROW(testExpression("r3o4f-kef03-34=-pf[w]"));
      REQUIRE_NOTHROW(testExpression("-=-+))(_OK*UJKL}{\""));
      REQUIRE_NOTHROW(
          testExpression("\\|\"\\|\"\\|\"w|\"\\\"\\\" \\\\\\\\\" fweewf "
                         "\fe'f\fwe'\te'w\f'reg[pto43o]"));
    }
  }

  SECTION("Location") {
    SECTION("Single node locations") {
      {
        auto node = parser.ParseExpression("\"hello world\"");
        REQUIRE(node != nullptr);
        auto &textNode = dynamic_cast<gd::TextNode &>(*node);
        REQUIRE(textNode.text == "hello world");
        REQUIRE(textNode.location.GetStartPosition() == 0);
        REQUIRE(textNode.location.GetEndPosition() == 13);
      }
      {
        auto node = parser.ParseExpression("3.14159");
        REQUIRE(node != nullptr);
        auto &numberNode = dynamic_cast<gd::NumberNode &>(*node);
        REQUIRE(numberNode.number == "3.14159");
        REQUIRE(numberNode.location.GetStartPosition() == 0);
        REQUIRE(numberNode.location.GetEndPosition() == 7);
      }
      {
        auto node = parser.ParseExpression("345 +  678");
        REQUIRE(node != nullptr);
        auto &operatorNode = dynamic_cast<gd::OperatorNode &>(*node);
        REQUIRE(operatorNode.location.GetStartPosition() == 0);
        REQUIRE(operatorNode.location.GetEndPosition() == 10);
        REQUIRE(operatorNode.leftHandSide != nullptr);
        REQUIRE(operatorNode.rightHandSide != nullptr);
        REQUIRE(operatorNode.leftHandSide->location.GetStartPosition() == 0);
        REQUIRE(operatorNode.leftHandSide->location.GetEndPosition() == 3);
        REQUIRE(operatorNode.rightHandSide->location.GetStartPosition() == 7);
        REQUIRE(operatorNode.rightHandSide->location.GetEndPosition() == 10);
      }
    }
    SECTION("Variable locations (simple variable name)") {
      auto node = parser.ParseExpression("MyVariable");
      REQUIRE(node != nullptr);
      auto &identifierNode = dynamic_cast<gd::IdentifierNode &>(*node);
      REQUIRE(identifierNode.identifierName == "MyVariable");
      REQUIRE(identifierNode.location.GetStartPosition() == 0);
      REQUIRE(identifierNode.location.GetEndPosition() == 10);
      REQUIRE(identifierNode.childIdentifierName == "");
    }
    SECTION("Variable locations (with child)") {
      auto node = parser.ParseExpression("MyVariable.MyChild");
      REQUIRE(node != nullptr);
      auto &identifierNode = dynamic_cast<gd::IdentifierNode &>(*node);
      REQUIRE(identifierNode.identifierName == "MyVariable");
      REQUIRE(identifierNode.location.GetStartPosition() == 0);
      REQUIRE(identifierNode.location.GetEndPosition() == 18);
      REQUIRE(identifierNode.identifierNameLocation.GetStartPosition() == 0);
      REQUIRE(identifierNode.identifierNameLocation.GetEndPosition() == 10);
      REQUIRE(identifierNode.identifierNameDotLocation.GetStartPosition() == 10);
      REQUIRE(identifierNode.identifierNameDotLocation.GetEndPosition() == 11);
      REQUIRE(identifierNode.childIdentifierName == "MyChild");
      REQUIRE(identifierNode.childIdentifierNameLocation.GetStartPosition() == 11);
      REQUIRE(identifierNode.childIdentifierNameLocation.GetEndPosition() == 18);
    }
    SECTION("Free function locations") {
      auto node =
          parser.ParseExpression("WhateverFunction(1, \"2\", three)");
      REQUIRE(node != nullptr);
      auto &functionNode = dynamic_cast<gd::FunctionCallNode &>(*node);
      REQUIRE(functionNode.functionName == "WhateverFunction");
      REQUIRE(functionNode.parameters.size() == 3);
      auto &numberNode =
          dynamic_cast<gd::NumberNode &>(*functionNode.parameters[0]);
      auto &textNode =
          dynamic_cast<gd::TextNode &>(*functionNode.parameters[1]);
      auto &identifierNode =
          dynamic_cast<gd::IdentifierNode &>(*functionNode.parameters[2]);

      REQUIRE(numberNode.number == "1");
      REQUIRE(textNode.text == "2");
      REQUIRE(identifierNode.identifierName == "three");

      REQUIRE(functionNode.location.GetStartPosition() == 0);
      REQUIRE(functionNode.location.GetEndPosition() == 31);
      REQUIRE(functionNode.objectNameLocation.IsValid() == false);
      REQUIRE(functionNode.objectNameDotLocation.IsValid() == false);
      REQUIRE(functionNode.behaviorNameLocation.IsValid() == false);
      REQUIRE(functionNode.behaviorNameNamespaceSeparatorLocation.IsValid() ==
              false);
      REQUIRE(functionNode.functionNameLocation.GetStartPosition() == 0);
      REQUIRE(functionNode.functionNameLocation.GetEndPosition() == 16);
      REQUIRE(functionNode.openingParenthesisLocation.GetStartPosition() == 16);
      REQUIRE(functionNode.openingParenthesisLocation.GetEndPosition() == 17);
      REQUIRE(numberNode.location.GetStartPosition() == 17);
      REQUIRE(numberNode.location.GetEndPosition() == 18);
      REQUIRE(textNode.location.GetStartPosition() == 20);
      REQUIRE(textNode.location.GetEndPosition() == 23);
      REQUIRE(identifierNode.location.GetStartPosition() == 25);
      REQUIRE(identifierNode.location.GetEndPosition() == 30);
      REQUIRE(functionNode.closingParenthesisLocation.GetStartPosition() == 30);
      REQUIRE(functionNode.closingParenthesisLocation.GetEndPosition() == 31);
    }
    SECTION("Free function locations (with whitespaces)") {
      auto node = parser.ParseExpression("WhateverFunction  (1, \"2\", three)");
      REQUIRE(node != nullptr);
      auto &functionNode = dynamic_cast<gd::FunctionCallNode &>(*node);
      REQUIRE(functionNode.functionName == "WhateverFunction");
      REQUIRE(functionNode.parameters.size() == 3);

      REQUIRE(functionNode.location.GetStartPosition() == 0);
      REQUIRE(functionNode.location.GetEndPosition() == 33);
      REQUIRE(functionNode.objectNameLocation.IsValid() == false);
      REQUIRE(functionNode.objectNameDotLocation.IsValid() == false);
      REQUIRE(functionNode.behaviorNameLocation.IsValid() == false);
      REQUIRE(functionNode.behaviorNameNamespaceSeparatorLocation.IsValid() ==
              false);
      REQUIRE(functionNode.functionNameLocation.GetStartPosition() == 0);
      REQUIRE(functionNode.functionNameLocation.GetEndPosition() == 16);
      REQUIRE(functionNode.openingParenthesisLocation.GetStartPosition() == 18);
      REQUIRE(functionNode.openingParenthesisLocation.GetEndPosition() == 19);
      REQUIRE(functionNode.closingParenthesisLocation.GetStartPosition() == 32);
      REQUIRE(functionNode.closingParenthesisLocation.GetEndPosition() == 33);
    }
    SECTION("Object function locations") {
      auto node = parser.ParseExpression(
          "WhateverObject.WhateverFunction(1, \"2\", three)");
      REQUIRE(node != nullptr);
      auto &functionNode = dynamic_cast<gd::FunctionCallNode &>(*node);
      REQUIRE(functionNode.functionName == "WhateverFunction");
      REQUIRE(functionNode.objectName == "WhateverObject");
      REQUIRE(functionNode.parameters.size() == 3);
      auto &numberNode =
          dynamic_cast<gd::NumberNode &>(*functionNode.parameters[0]);
      auto &textNode =
          dynamic_cast<gd::TextNode &>(*functionNode.parameters[1]);
      auto &identifierNode =
          dynamic_cast<gd::IdentifierNode &>(*functionNode.parameters[2]);

      REQUIRE(numberNode.number == "1");
      REQUIRE(textNode.text == "2");
      REQUIRE(identifierNode.identifierName == "three");

      REQUIRE(functionNode.location.GetStartPosition() == 0);
      REQUIRE(functionNode.location.GetEndPosition() == 46);
      REQUIRE(functionNode.objectNameLocation.GetStartPosition() == 0);
      REQUIRE(functionNode.objectNameLocation.GetEndPosition() == 14);
      REQUIRE(functionNode.objectNameDotLocation.GetStartPosition() == 14);
      REQUIRE(functionNode.objectNameDotLocation.GetEndPosition() == 15);
      REQUIRE(functionNode.behaviorNameLocation.IsValid() == false);
      REQUIRE(functionNode.behaviorNameNamespaceSeparatorLocation.IsValid() ==
              false);
      REQUIRE(functionNode.functionNameLocation.GetStartPosition() == 15);
      REQUIRE(functionNode.functionNameLocation.GetEndPosition() == 31);
      REQUIRE(functionNode.openingParenthesisLocation.GetStartPosition() == 31);
      REQUIRE(functionNode.openingParenthesisLocation.GetEndPosition() == 32);
      REQUIRE(numberNode.location.GetStartPosition() == 32);
      REQUIRE(numberNode.location.GetEndPosition() == 33);
      REQUIRE(textNode.location.GetStartPosition() == 35);
      REQUIRE(textNode.location.GetEndPosition() == 38);
      REQUIRE(identifierNode.location.GetStartPosition() == 40);
      REQUIRE(identifierNode.location.GetEndPosition() == 45);
      REQUIRE(functionNode.closingParenthesisLocation.GetStartPosition() == 45);
      REQUIRE(functionNode.closingParenthesisLocation.GetEndPosition() == 46);
    }
    SECTION("Object function name locations") {
      auto node =
          parser.ParseExpression("WhateverObject.WhateverFunction");
      REQUIRE(node != nullptr);
      auto &identifierNode =
          dynamic_cast<gd::IdentifierNode &>(*node);
      REQUIRE(identifierNode.identifierName == "WhateverObject");
      REQUIRE(identifierNode.childIdentifierName ==
              "WhateverFunction");

      REQUIRE(identifierNode.location.GetStartPosition() == 0);
      REQUIRE(identifierNode.location.GetEndPosition() == 31);
      REQUIRE(identifierNode.identifierNameLocation.GetStartPosition() ==
              0);
      REQUIRE(identifierNode.identifierNameLocation.GetEndPosition() == 14);
      REQUIRE(identifierNode.identifierNameDotLocation.GetStartPosition() ==
              14);
      REQUIRE(identifierNode.identifierNameDotLocation.GetEndPosition() ==
              15);
      REQUIRE(identifierNode.childIdentifierNameLocation
                  .GetStartPosition() == 15);
      REQUIRE(identifierNode.childIdentifierNameLocation
                  .GetEndPosition() == 31);
    }
    SECTION("Object function name locations (with whitespace)") {
      auto node = parser.ParseExpression(
          "WhateverObject  .  WhateverFunction  ");
      REQUIRE(node != nullptr);
      auto &identifierNode =
          dynamic_cast<gd::IdentifierNode &>(*node);
      REQUIRE(identifierNode.identifierName == "WhateverObject");
      REQUIRE(identifierNode.childIdentifierName ==
              "WhateverFunction");

      REQUIRE(identifierNode.location.GetStartPosition() == 0);
      REQUIRE(identifierNode.location.GetEndPosition() == 37);
      REQUIRE(identifierNode.identifierNameLocation.GetStartPosition() ==
              0);
      REQUIRE(identifierNode.identifierNameLocation.GetEndPosition() == 14);
      REQUIRE(identifierNode.identifierNameDotLocation.GetStartPosition() ==
              16);
      REQUIRE(identifierNode.identifierNameDotLocation.GetEndPosition() ==
              17);
      REQUIRE(identifierNode.childIdentifierNameLocation
                  .GetStartPosition() == 19);
      REQUIRE(identifierNode.childIdentifierNameLocation
                  .GetEndPosition() == 35);
    }
    SECTION("Object function locations (with whitespaces)") {
      auto node = parser.ParseExpression(
          "WhateverObject . WhateverFunction (1, \"2\", three)");
      REQUIRE(node != nullptr);
      auto &functionNode = dynamic_cast<gd::FunctionCallNode &>(*node);
      REQUIRE(functionNode.functionName == "WhateverFunction");
      REQUIRE(functionNode.objectName == "WhateverObject");

      REQUIRE(functionNode.location.GetStartPosition() == 0);
      REQUIRE(functionNode.location.GetEndPosition() == 49);
      REQUIRE(functionNode.objectNameLocation.GetStartPosition() == 0);
      REQUIRE(functionNode.objectNameLocation.GetEndPosition() == 14);
      REQUIRE(functionNode.objectNameDotLocation.GetStartPosition() == 15);
      REQUIRE(functionNode.objectNameDotLocation.GetEndPosition() == 16);
      REQUIRE(functionNode.functionNameLocation.GetStartPosition() == 17);
      REQUIRE(functionNode.functionNameLocation.GetEndPosition() == 33);
      REQUIRE(functionNode.openingParenthesisLocation.GetStartPosition() == 34);
      REQUIRE(functionNode.openingParenthesisLocation.GetEndPosition() == 35);
      REQUIRE(functionNode.closingParenthesisLocation.GetStartPosition() == 48);
      REQUIRE(functionNode.closingParenthesisLocation.GetEndPosition() == 49);
    }
    SECTION("Behavior function locations") {
      auto node = parser.ParseExpression(
          "WhateverObject.WhateverBehavior::WhateverFunction(1, \"2\", three)");
      REQUIRE(node != nullptr);
      auto &functionNode = dynamic_cast<gd::FunctionCallNode &>(*node);
      REQUIRE(functionNode.functionName == "WhateverFunction");
      REQUIRE(functionNode.objectName == "WhateverObject");
      REQUIRE(functionNode.behaviorName == "WhateverBehavior");
      REQUIRE(functionNode.parameters.size() == 3);
      auto &numberNode =
          dynamic_cast<gd::NumberNode &>(*functionNode.parameters[0]);
      auto &textNode =
          dynamic_cast<gd::TextNode &>(*functionNode.parameters[1]);
      auto &identifierNode =
          dynamic_cast<gd::IdentifierNode &>(*functionNode.parameters[2]);

      REQUIRE(numberNode.number == "1");
      REQUIRE(textNode.text == "2");
      REQUIRE(identifierNode.identifierName == "three");

      REQUIRE(functionNode.location.GetStartPosition() == 0);
      REQUIRE(functionNode.location.GetEndPosition() == 64);
      REQUIRE(functionNode.objectNameLocation.GetStartPosition() == 0);
      REQUIRE(functionNode.objectNameLocation.GetEndPosition() == 14);
      REQUIRE(functionNode.objectNameDotLocation.GetStartPosition() == 14);
      REQUIRE(functionNode.objectNameDotLocation.GetEndPosition() == 15);
      REQUIRE(functionNode.behaviorNameLocation.GetStartPosition() == 15);
      REQUIRE(functionNode.behaviorNameLocation.GetEndPosition() == 31);
      REQUIRE(functionNode.behaviorNameNamespaceSeparatorLocation
                  .GetStartPosition() == 31);
      REQUIRE(functionNode.behaviorNameNamespaceSeparatorLocation
                  .GetEndPosition() == 33);
      REQUIRE(functionNode.functionNameLocation.GetStartPosition() == 33);
      REQUIRE(functionNode.functionNameLocation.GetEndPosition() == 49);
      REQUIRE(functionNode.openingParenthesisLocation.GetStartPosition() == 49);
      REQUIRE(functionNode.openingParenthesisLocation.GetEndPosition() == 50);
      REQUIRE(numberNode.location.GetStartPosition() == 50);
      REQUIRE(numberNode.location.GetEndPosition() == 51);
      REQUIRE(textNode.location.GetStartPosition() == 53);
      REQUIRE(textNode.location.GetEndPosition() == 56);
      REQUIRE(identifierNode.location.GetStartPosition() == 58);
      REQUIRE(identifierNode.location.GetEndPosition() == 63);
      REQUIRE(functionNode.closingParenthesisLocation.GetStartPosition() == 63);
      REQUIRE(functionNode.closingParenthesisLocation.GetEndPosition() == 64);
    }
    SECTION("Behavior function name locations (with whitespace)") {
      auto node = parser.ParseExpression(
          "WhateverObject  .  WhateverFunction  ");
      REQUIRE(node != nullptr);
      auto &identifierNode =
          dynamic_cast<gd::IdentifierNode &>(*node);
      REQUIRE(identifierNode.identifierName == "WhateverObject");
      REQUIRE(identifierNode.childIdentifierName ==
              "WhateverFunction");

      REQUIRE(identifierNode.location.GetStartPosition() == 0);
      REQUIRE(identifierNode.location.GetEndPosition() == 37);
      REQUIRE(identifierNode.identifierNameLocation.GetStartPosition() ==
              0);
      REQUIRE(identifierNode.identifierNameLocation.GetEndPosition() == 14);
      REQUIRE(identifierNode.identifierNameDotLocation.GetStartPosition() ==
              16);
      REQUIRE(identifierNode.identifierNameDotLocation.GetEndPosition() ==
              17);
      REQUIRE(identifierNode.childIdentifierNameLocation
                  .GetStartPosition() == 19);
      REQUIRE(identifierNode.childIdentifierNameLocation
                  .GetEndPosition() == 35);
    }
    SECTION("Behavior function name locations") {
      auto node = parser.ParseExpression(
          "WhateverObject.WhateverBehavior::WhateverFunction");
      REQUIRE(node != nullptr);
      auto &objectFunctionNameNode =
          dynamic_cast<gd::ObjectFunctionNameNode &>(*node);
      REQUIRE(objectFunctionNameNode.objectName == "WhateverObject");
      REQUIRE(objectFunctionNameNode.objectFunctionOrBehaviorName ==
              "WhateverBehavior");
      REQUIRE(objectFunctionNameNode.behaviorFunctionName ==
              "WhateverFunction");

      REQUIRE(objectFunctionNameNode.location.GetStartPosition() == 0);
      REQUIRE(objectFunctionNameNode.location.GetEndPosition() == 49);
      REQUIRE(objectFunctionNameNode.objectNameLocation.GetStartPosition() ==
              0);
      REQUIRE(objectFunctionNameNode.objectNameLocation.GetEndPosition() == 14);
      REQUIRE(objectFunctionNameNode.objectNameDotLocation.GetStartPosition() ==
              14);
      REQUIRE(objectFunctionNameNode.objectNameDotLocation.GetEndPosition() ==
              15);
      REQUIRE(objectFunctionNameNode.objectFunctionOrBehaviorNameLocation
                  .GetStartPosition() == 15);
      REQUIRE(objectFunctionNameNode.objectFunctionOrBehaviorNameLocation
                  .GetEndPosition() == 31);
      REQUIRE(objectFunctionNameNode.behaviorNameNamespaceSeparatorLocation
                  .GetStartPosition() == 31);
      REQUIRE(objectFunctionNameNode.behaviorNameNamespaceSeparatorLocation
                  .GetEndPosition() == 33);
      REQUIRE(objectFunctionNameNode.behaviorFunctionNameLocation
                  .GetStartPosition() == 33);
      REQUIRE(objectFunctionNameNode.behaviorFunctionNameLocation
                  .GetEndPosition() == 49);
    }
    SECTION("Behavior function name locations (with whitespace)") {
      auto node = parser.ParseExpression(
          "WhateverObject.WhateverBehavior  ::  WhateverFunction");
      REQUIRE(node != nullptr);
      auto &objectFunctionNameNode =
          dynamic_cast<gd::ObjectFunctionNameNode &>(*node);
      REQUIRE(objectFunctionNameNode.objectName == "WhateverObject");
      REQUIRE(objectFunctionNameNode.objectFunctionOrBehaviorName ==
              "WhateverBehavior");
      REQUIRE(objectFunctionNameNode.behaviorFunctionName ==
              "WhateverFunction");

      REQUIRE(objectFunctionNameNode.location.GetStartPosition() == 0);
      REQUIRE(objectFunctionNameNode.location.GetEndPosition() == 53);
      REQUIRE(objectFunctionNameNode.objectNameLocation.GetStartPosition() ==
              0);
      REQUIRE(objectFunctionNameNode.objectNameLocation.GetEndPosition() == 14);
      REQUIRE(objectFunctionNameNode.objectNameDotLocation.GetStartPosition() ==
              14);
      REQUIRE(objectFunctionNameNode.objectNameDotLocation.GetEndPosition() ==
              15);
      REQUIRE(objectFunctionNameNode.objectFunctionOrBehaviorNameLocation
                  .GetStartPosition() == 15);
      REQUIRE(objectFunctionNameNode.objectFunctionOrBehaviorNameLocation
                  .GetEndPosition() == 31);
      REQUIRE(objectFunctionNameNode.behaviorNameNamespaceSeparatorLocation
                  .GetStartPosition() == 33);
      REQUIRE(objectFunctionNameNode.behaviorNameNamespaceSeparatorLocation
                  .GetEndPosition() == 35);
      REQUIRE(objectFunctionNameNode.behaviorFunctionNameLocation
                  .GetStartPosition() == 37);
      REQUIRE(objectFunctionNameNode.behaviorFunctionNameLocation
                  .GetEndPosition() == 53);
    }
    SECTION("Invalid/partial expression locations") {
      {
        auto node = parser.ParseExpression("3.14159 + ");
        REQUIRE(node != nullptr);
        auto &operatorNode = dynamic_cast<gd::OperatorNode &>(*node);
        REQUIRE(operatorNode.leftHandSide != nullptr);
        REQUIRE(operatorNode.rightHandSide != nullptr);
        REQUIRE(operatorNode.location.GetStartPosition() == 0);
        REQUIRE(operatorNode.location.GetEndPosition() == 10);

        auto &numberNode =
            dynamic_cast<gd::NumberNode &>(*operatorNode.leftHandSide);
        auto &emptyNode =
            dynamic_cast<gd::EmptyNode &>(*operatorNode.rightHandSide);
        REQUIRE(numberNode.location.GetStartPosition() == 0);
        REQUIRE(numberNode.location.GetEndPosition() == 7);
        REQUIRE(emptyNode.location.GetStartPosition() == 10);
        REQUIRE(emptyNode.location.GetEndPosition() == 10);
      }
      {
        auto node = parser.ParseExpression("\"abcde\" + ");
        REQUIRE(node != nullptr);
        auto &operatorNode = dynamic_cast<gd::OperatorNode &>(*node);
        REQUIRE(operatorNode.leftHandSide != nullptr);
        REQUIRE(operatorNode.rightHandSide != nullptr);
        REQUIRE(operatorNode.location.GetStartPosition() == 0);
        REQUIRE(operatorNode.location.GetEndPosition() == 10);

        auto &textNode =
            dynamic_cast<gd::TextNode &>(*operatorNode.leftHandSide);
        auto &emptyNode =
            dynamic_cast<gd::EmptyNode &>(*operatorNode.rightHandSide);
        REQUIRE(textNode.location.GetStartPosition() == 0);
        REQUIRE(textNode.location.GetEndPosition() == 7);
        REQUIRE(emptyNode.location.GetStartPosition() == 10);
        REQUIRE(emptyNode.location.GetEndPosition() == 10);
      }
    }
  }
}
