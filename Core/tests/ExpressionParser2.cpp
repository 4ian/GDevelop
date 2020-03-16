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
#include "GDCore/Project/Layout.h"
#include "GDCore/Project/Project.h"
#include "catch.hpp"

TEST_CASE("ExpressionParser2", "[common][events]") {
  gd::Project project;
  gd::Platform platform;
  SetupProjectWithDummyPlatform(project, platform);
  auto &layout1 = project.InsertNewLayout("Layout1", 0);
  layout1.InsertNewObject(project, "MyExtension::Sprite", "MySpriteObject", 0);

  gd::ExpressionParser2 parser(platform, project, layout1);

  SECTION("Empty expression") {
    {
      auto node = parser.ParseExpression("string", "");
      REQUIRE(node != nullptr);
      auto &emptyNode = dynamic_cast<gd::EmptyNode &>(*node);
      REQUIRE(emptyNode.type == "string");
      REQUIRE(emptyNode.text == "");
    }
    {
      auto node = parser.ParseExpression("number", "");
      REQUIRE(node != nullptr);
      auto &emptyNode = dynamic_cast<gd::EmptyNode &>(*node);
      REQUIRE(emptyNode.type == "number");
      REQUIRE(emptyNode.text == "");
    }
    {
      auto node = parser.ParseExpression("object", "");
      REQUIRE(node != nullptr);
      auto &emptyNode = dynamic_cast<gd::EmptyNode &>(*node);
      REQUIRE(emptyNode.type == "object");
      REQUIRE(emptyNode.text == "");
    }
    {
      auto node = parser.ParseExpression("string", " ");
      REQUIRE(node != nullptr);
      auto &emptyNode = dynamic_cast<gd::EmptyNode &>(*node);
      REQUIRE(emptyNode.type == "string");
      REQUIRE(emptyNode.text == "");
    }
    {
      auto node = parser.ParseExpression("number", " ");
      REQUIRE(node != nullptr);
      auto &emptyNode = dynamic_cast<gd::EmptyNode &>(*node);
      REQUIRE(emptyNode.type == "number");
      REQUIRE(emptyNode.text == "");
    }
    {
      auto node = parser.ParseExpression("object", " ");
      REQUIRE(node != nullptr);
      auto &emptyNode = dynamic_cast<gd::EmptyNode &>(*node);
      REQUIRE(emptyNode.type == "object");
      REQUIRE(emptyNode.text == "");
    }
  }

  SECTION("Valid texts") {
    {
      auto node = parser.ParseExpression("string", "\"hello world\"");
      REQUIRE(node != nullptr);
      auto &textNode = dynamic_cast<gd::TextNode &>(*node);
      REQUIRE(textNode.text == "hello world");
    }

    {
      auto node = parser.ParseExpression("string", "\"\"");
      REQUIRE(node != nullptr);
      auto &textNode = dynamic_cast<gd::TextNode &>(*node);
      REQUIRE(textNode.text == "");
    }

    {
      auto node = parser.ParseExpression("string", "\"hello \\\"world\\\"\"");
      REQUIRE(node != nullptr);
      auto &textNode = dynamic_cast<gd::TextNode &>(*node);
      REQUIRE(textNode.text == "hello \"world\"");
    }

    {
      auto node = parser.ParseExpression("string", "\"\\\\\"");
      REQUIRE(node != nullptr);
      auto &textNode = dynamic_cast<gd::TextNode &>(*node);
      REQUIRE(textNode.text == "\\");
    }
    {
      auto node =
          parser.ParseExpression("string", "\"hello \\\\\\\"world\\\"\"");
      REQUIRE(node != nullptr);
      auto &textNode = dynamic_cast<gd::TextNode &>(*node);
      REQUIRE(textNode.text == "hello \\\"world\"");
    }
  }

  SECTION("Invalid texts") {
    {
      auto node = parser.ParseExpression("string", "");
      REQUIRE(node != nullptr);

      gd::ExpressionValidator validator;
      node->Visit(validator);
      REQUIRE(validator.GetErrors().size() == 1);
      REQUIRE(
          validator.GetErrors()[0]->GetMessage() ==
          "You must enter a text (between quotes) or a valid expression call.");
    }
    {
      auto node = parser.ParseExpression("string", "abcd");
      REQUIRE(node != nullptr);

      gd::ExpressionValidator validator;
      node->Visit(validator);
      REQUIRE(validator.GetErrors().size() == 1);
      REQUIRE(validator.GetErrors()[0]->GetMessage() ==
              "You must wrap your text inside double quotes (example: \"Hello "
              "world\").");
    }
    {
      auto node = parser.ParseExpression("string", "123");
      REQUIRE(node != nullptr);

      gd::ExpressionValidator validator;
      node->Visit(validator);
      REQUIRE(validator.GetErrors().size() == 1);
      REQUIRE(validator.GetErrors()[0]->GetMessage() ==
              "You entered a number, but a text was expected (in quotes).");
    }
    {
      auto node = parser.ParseExpression("string", "abcd efgh");
      REQUIRE(node != nullptr);

      gd::ExpressionValidator validator;
      node->Visit(validator);
      REQUIRE(validator.GetErrors().size() == 1);
      REQUIRE(validator.GetErrors()[0]->GetMessage() ==
              "You must wrap your text inside double quotes (example: \"Hello "
              "world\").");
      REQUIRE(validator.GetErrors()[0]->GetStartPosition() == 0);
      REQUIRE(validator.GetErrors()[0]->GetEndPosition() == 9);
    }
    {
      auto node = parser.ParseExpression("string", "abcd + efgh");
      REQUIRE(node != nullptr);

      gd::ExpressionValidator validator;
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
      auto node = parser.ParseExpression("string", "\"");
      REQUIRE(node != nullptr);

      gd::ExpressionValidator validator;
      node->Visit(validator);
      REQUIRE(validator.GetErrors().size() == 1);
      REQUIRE(validator.GetErrors()[0]->GetMessage() ==
              "A text must end with a double quote (\"). Add a double quote to "
              "terminate the text.");
      REQUIRE(validator.GetErrors()[0]->GetStartPosition() == 1);
    }
    {
      auto node = parser.ParseExpression("string", "\"hello world");
      REQUIRE(node != nullptr);

      gd::ExpressionValidator validator;
      node->Visit(validator);
      REQUIRE(validator.GetErrors().size() == 1);
      REQUIRE(validator.GetErrors()[0]->GetMessage() ==
              "A text must end with a double quote (\"). Add a double quote to "
              "terminate the text.");
      REQUIRE(validator.GetErrors()[0]->GetStartPosition() == 12);
    }
    {
      auto node = parser.ParseExpression("string", "\"\"\"");
      REQUIRE(node != nullptr);

      gd::ExpressionValidator validator;
      node->Visit(validator);
      REQUIRE(validator.GetErrors().size() == 2);
      REQUIRE(validator.GetErrors()[0]->GetMessage() ==
              "You must add the operator + between texts or expressions. For "
              "example: \"Your name: \" + VariableString(PlayerName).");
      REQUIRE(validator.GetErrors()[0]->GetStartPosition() == 2);
      REQUIRE(validator.GetErrors()[1]->GetMessage() ==
              "A text must end with a double quote (\"). Add a double quote to "
              "terminate the text.");
    }
  }

  SECTION("Unterminated expressions/extra characters") {
    {
      auto node = parser.ParseExpression("string", "\"hello\",");
      REQUIRE(node != nullptr);

      gd::ExpressionValidator validator;
      node->Visit(validator);
      REQUIRE(validator.GetErrors().size() == 1);
      REQUIRE(validator.GetErrors()[0]->GetMessage() ==
              "The expression has extra character at the end that should be "
              "removed (or completed if your expression is not finished).");
    }
    {
      auto node = parser.ParseExpression("string", "\"hello\"]");
      REQUIRE(node != nullptr);

      gd::ExpressionValidator validator;
      node->Visit(validator);
      REQUIRE(validator.GetErrors().size() == 1);
      REQUIRE(validator.GetErrors()[0]->GetMessage() ==
              "The expression has extra character at the end that should be "
              "removed (or completed if your expression is not finished).");
    }
    {
      auto node = parser.ParseExpression("string", "Idontexist(\"hello\"");
      REQUIRE(node != nullptr);

      gd::ExpressionValidator validator;
      node->Visit(validator);
      REQUIRE(validator.GetErrors().size() == 2);
      REQUIRE(validator.GetErrors()[0]->GetMessage() ==
              "The list of parameters is not terminated. Add a closing "
              "parenthesis to end the parameters.");
      REQUIRE(validator.GetErrors()[1]->GetMessage() ==
              "This parameter was not expected by this expression. Remove it "
              "or verify that you've entered the proper expression name.");
    }
    {
      auto node = parser.ParseExpression("string", "=\"test\"");
      REQUIRE(node != nullptr);

      gd::ExpressionValidator validator;
      node->Visit(validator);
      REQUIRE(validator.GetErrors().size() == 1);
      REQUIRE(
          validator.GetErrors()[0]->GetMessage() ==
          "You must enter a text (between quotes) or a valid expression call.");
    }
  }

  SECTION("Invalid parenthesis") {
    {
      auto node = parser.ParseExpression("string", "((\"hello\"");
      REQUIRE(node != nullptr);

      gd::ExpressionValidator validator;
      node->Visit(validator);
      REQUIRE(validator.GetErrors().size() == 2);
      REQUIRE(validator.GetErrors()[0]->GetMessage() ==
              "Missing a closing parenthesis. Add a closing parenthesis for "
              "each opening parenthesis.");
      REQUIRE(validator.GetErrors()[1]->GetMessage() ==
              "Missing a closing parenthesis. Add a closing parenthesis for "
              "each opening parenthesis.");
    }
  }

  SECTION("Invalid text operators") {
    {
      auto node = parser.ParseExpression("string", "\"Hello \" - \"World\"");
      REQUIRE(node != nullptr);

      gd::ExpressionValidator validator;
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
      auto node = parser.ParseExpression("number", "123");
      REQUIRE(node != nullptr);
      auto &numberNode = dynamic_cast<gd::NumberNode &>(*node);
      REQUIRE(numberNode.number == "123");
    }
    {
      auto node = parser.ParseExpression("number", "0");
      REQUIRE(node != nullptr);
      auto &numberNode = dynamic_cast<gd::NumberNode &>(*node);
      REQUIRE(numberNode.number == "0");
    }
    {
      auto node = parser.ParseExpression("number", "3.14159");
      REQUIRE(node != nullptr);
      auto &numberNode = dynamic_cast<gd::NumberNode &>(*node);
      REQUIRE(numberNode.number == "3.14159");
    }
    {
      auto node = parser.ParseExpression("number", ".14159");
      REQUIRE(node != nullptr);
      auto &numberNode = dynamic_cast<gd::NumberNode &>(*node);
      REQUIRE(numberNode.number == "0.14159");
    }
    {
      auto node = parser.ParseExpression("number", "3.");
      REQUIRE(node != nullptr);
      auto &numberNode = dynamic_cast<gd::NumberNode &>(*node);
      REQUIRE(numberNode.number == "3.");
    }
    {
      auto node = parser.ParseExpression("number", "0.");
      REQUIRE(node != nullptr);
      auto &numberNode = dynamic_cast<gd::NumberNode &>(*node);
      REQUIRE(numberNode.number == "0.");
    }
  }

  SECTION("valid operators") {
    {
      auto node = parser.ParseExpression("number", "123 + 456");
      REQUIRE(node != nullptr);
      auto &operatorNode = dynamic_cast<gd::OperatorNode &>(*node);
      REQUIRE(operatorNode.op == '+');
      REQUIRE(operatorNode.type == "number");
      auto &leftNumberNode =
          dynamic_cast<gd::NumberNode &>(*operatorNode.leftHandSide);
      REQUIRE(leftNumberNode.number == "123");
      auto &rightNumberNode =
          dynamic_cast<gd::NumberNode &>(*operatorNode.rightHandSide);
      REQUIRE(rightNumberNode.number == "456");
    }
    {
      auto node = parser.ParseExpression("string", "\"abc\" + \"def\"");
      REQUIRE(node != nullptr);
      auto &operatorNode = dynamic_cast<gd::OperatorNode &>(*node);
      REQUIRE(operatorNode.op == '+');
      REQUIRE(operatorNode.type == "string");
      auto &leftTextNode =
          dynamic_cast<gd::TextNode &>(*operatorNode.leftHandSide);
      REQUIRE(leftTextNode.text == "abc");
      auto &rightTextNode =
          dynamic_cast<gd::TextNode &>(*operatorNode.rightHandSide);
      REQUIRE(rightTextNode.text == "def");
    }
  }

  SECTION("valid unary operators") {
    {
      auto node = parser.ParseExpression("number", "-123");
      REQUIRE(node != nullptr);
      auto &unaryOperatorNode = dynamic_cast<gd::UnaryOperatorNode &>(*node);
      REQUIRE(unaryOperatorNode.op == '-');
      REQUIRE(unaryOperatorNode.type == "number");
      auto &numberNode =
          dynamic_cast<gd::NumberNode &>(*unaryOperatorNode.factor);
      REQUIRE(numberNode.number == "123");
    }
    {
      auto node = parser.ParseExpression("number", "+123");
      REQUIRE(node != nullptr);
      auto &unaryOperatorNode = dynamic_cast<gd::UnaryOperatorNode &>(*node);
      REQUIRE(unaryOperatorNode.op == '+');
      REQUIRE(unaryOperatorNode.type == "number");
      auto &numberNode =
          dynamic_cast<gd::NumberNode &>(*unaryOperatorNode.factor);
      REQUIRE(numberNode.number == "123");
    }
    {
      auto node = parser.ParseExpression("number", "-123.2");
      REQUIRE(node != nullptr);
      auto &unaryOperatorNode = dynamic_cast<gd::UnaryOperatorNode &>(*node);
      REQUIRE(unaryOperatorNode.op == '-');
      REQUIRE(unaryOperatorNode.type == "number");
      auto &numberNode =
          dynamic_cast<gd::NumberNode &>(*unaryOperatorNode.factor);
      REQUIRE(numberNode.number == "123.2");
    }
  }

  SECTION("Invalid unary operators") {
    {
      auto node = parser.ParseExpression("number", "*123");
      REQUIRE(node != nullptr);

      gd::ExpressionValidator validator;
      node->Visit(validator);
      REQUIRE(validator.GetErrors().size() == 1);
      REQUIRE(validator.GetErrors()[0]->GetMessage() ==
              "You must enter a number or a valid expression call.");
      REQUIRE(validator.GetErrors()[0]->GetStartPosition() == 0);
    }
    {
      auto node = parser.ParseExpression("string", "-\"hello\"");
      REQUIRE(node != nullptr);

      gd::ExpressionValidator validator;
      node->Visit(validator);
      REQUIRE(validator.GetErrors().size() == 1);
      REQUIRE(validator.GetErrors()[0]->GetMessage() ==
              "You've used an operator that is not supported. Only + can be "
              "used to concatenate texts, and must be placed between two texts "
              "(or expressions).");
      REQUIRE(validator.GetErrors()[0]->GetStartPosition() == 0);
    }
    {
      auto node = parser.ParseExpression("string", "+-\"hello\"");
      REQUIRE(node != nullptr);

      gd::ExpressionValidator validator;
      node->Visit(validator);
      REQUIRE(validator.GetErrors().size() == 2);
      REQUIRE(validator.GetErrors()[0]->GetMessage() ==
              "You've used an operator that is not supported. Only + can be "
              "used to concatenate texts, and must be placed between two texts "
              "(or expressions).");
      REQUIRE(validator.GetErrors()[0]->GetStartPosition() == 0);
      REQUIRE(validator.GetErrors()[1]->GetMessage() ==
              "You've used an operator that is not supported. Only + can be "
              "used to concatenate texts, and must be placed between two texts "
              "(or expressions).");
      REQUIRE(validator.GetErrors()[1]->GetStartPosition() == 1);
    }
  }

  SECTION("Invalid numbers") {
    {
      auto node = parser.ParseExpression("number", "");
      REQUIRE(node != nullptr);

      gd::ExpressionValidator validator;
      node->Visit(validator);
      REQUIRE(validator.GetErrors().size() == 1);
      REQUIRE(validator.GetErrors()[0]->GetMessage() ==
              "You must enter a number or a valid expression call.");
      REQUIRE(validator.GetErrors()[0]->GetStartPosition() == 0);
    }
    {
      auto node = parser.ParseExpression("number", "abcd");
      REQUIRE(node != nullptr);

      gd::ExpressionValidator validator;
      node->Visit(validator);
      REQUIRE(validator.GetErrors().size() == 1);
      REQUIRE(validator.GetErrors()[0]->GetMessage() ==
              "You must enter a number.");
      REQUIRE(validator.GetErrors()[0]->GetStartPosition() == 0);
    }
    {
      auto node = parser.ParseExpression("number", "\"hello world\"");
      REQUIRE(node != nullptr);

      gd::ExpressionValidator validator;
      node->Visit(validator);
      REQUIRE(validator.GetErrors().size() == 1);
      REQUIRE(validator.GetErrors()[0]->GetMessage() ==
              "You entered a text, but a number was expected.");
      REQUIRE(validator.GetErrors()[0]->GetStartPosition() == 0);
      REQUIRE(validator.GetErrors()[0]->GetEndPosition() == 13);
    }
    {
      auto node = parser.ParseExpression("number", "123 456");
      REQUIRE(node != nullptr);

      gd::ExpressionValidator validator;
      node->Visit(validator);
      REQUIRE(validator.GetErrors().size() == 1);
      REQUIRE(validator.GetErrors()[0]->GetMessage() ==
              "No operator found. Did you forget to enter an operator (like +, "
              "-, * or /) between numbers or expressions?");
      REQUIRE(validator.GetErrors()[0]->GetStartPosition() == 4);
    }
    {
      auto node = parser.ParseExpression("number", "3..14");
      REQUIRE(node != nullptr);

      gd::ExpressionValidator validator;
      node->Visit(validator);
      REQUIRE(validator.GetErrors().size() == 1);
      REQUIRE(validator.GetErrors()[0]->GetMessage() ==
              "No operator found. Did you forget to enter an operator (like +, "
              "-, * or /) between numbers or expressions?");
      REQUIRE(validator.GetErrors()[0]->GetStartPosition() == 2);
    }
    {
      auto node = parser.ParseExpression("number", ".");
      REQUIRE(node != nullptr);

      gd::ExpressionValidator validator;
      node->Visit(validator);
      REQUIRE(validator.GetErrors().size() == 1);
      REQUIRE(validator.GetErrors()[0]->GetMessage() ==
              "A number was expected. You must enter a number here.");
      REQUIRE(validator.GetErrors()[0]->GetStartPosition() == 1);
    }
  }

  SECTION("Invalid number operators") {
    {
      auto node = parser.ParseExpression("number", "123 % 456");
      REQUIRE(node != nullptr);

      gd::ExpressionValidator validator;
      node->Visit(validator);
      REQUIRE(validator.GetErrors().size() == 2);
      REQUIRE(validator.GetErrors()[0]->GetMessage() ==
              "No operator found. Did you forget to enter an operator (like +, "
              "-, * or /) between numbers or expressions?");
      REQUIRE(validator.GetErrors()[0]->GetStartPosition() == 4);
    }
    {
      auto node = parser.ParseExpression("number", "1//2");
      REQUIRE(node != nullptr);

      gd::ExpressionValidator validator;
      node->Visit(validator);
      REQUIRE(validator.GetErrors().size() == 1);
      REQUIRE(validator.GetErrors()[0]->GetMessage() ==
              "You must enter a number or a valid expression call.");
      REQUIRE(validator.GetErrors()[0]->GetStartPosition() == 2);
    }
  }

  SECTION("Numbers and texts mismatchs") {
    {
      auto node = parser.ParseExpression("number", "123 + \"hello world\"");
      REQUIRE(node != nullptr);

      gd::ExpressionValidator validator;
      node->Visit(validator);
      REQUIRE(validator.GetErrors().size() == 1);
      REQUIRE(validator.GetErrors()[0]->GetMessage() ==
              "You entered a text, but a number was expected.");
      REQUIRE(validator.GetErrors()[0]->GetStartPosition() == 6);
      REQUIRE(validator.GetErrors()[0]->GetEndPosition() == 19);
    }
    {
      auto node = parser.ParseExpression("string", "\"hello world\" + 123");
      REQUIRE(node != nullptr);

      gd::ExpressionValidator validator;
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
          parser.ParseExpression("number", "((123)) + (\"hello world\")");
      REQUIRE(node != nullptr);

      gd::ExpressionValidator validator;
      node->Visit(validator);
      REQUIRE(validator.GetErrors().size() == 1);
      REQUIRE(validator.GetErrors()[0]->GetMessage() ==
              "You entered a text, but a number was expected.");
      REQUIRE(validator.GetErrors()[0]->GetStartPosition() == 11);
      REQUIRE(validator.GetErrors()[0]->GetEndPosition() == 24);
    }
    {
      auto node =
          parser.ParseExpression("string", "((\"hello world\") + (123))");
      REQUIRE(node != nullptr);

      gd::ExpressionValidator validator;
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
      auto node = parser.ParseExpression("object", "HelloWorld1");
      REQUIRE(node != nullptr);
      auto &identifierNode = dynamic_cast<gd::IdentifierNode &>(*node);
      REQUIRE(identifierNode.identifierName == "HelloWorld1");

      gd::ExpressionValidator validator;
      node->Visit(validator);
      REQUIRE(validator.GetErrors().size() == 0);
    }

    {
      auto node = parser.ParseExpression("object", "Hello World 1");
      REQUIRE(node != nullptr);
      auto &identifierNode = dynamic_cast<gd::IdentifierNode &>(*node);
      REQUIRE(identifierNode.identifierName == "Hello World 1");

      gd::ExpressionValidator validator;
      node->Visit(validator);
      REQUIRE(validator.GetErrors().size() == 0);
    }
    {
      auto node = parser.ParseExpression("object", "Hello World 1 ");
      REQUIRE(node != nullptr);
      auto &identifierNode = dynamic_cast<gd::IdentifierNode &>(*node);
      REQUIRE(identifierNode.identifierName == "Hello World 1");

      gd::ExpressionValidator validator;
      node->Visit(validator);
      REQUIRE(validator.GetErrors().size() == 0);
    }
    {
      auto node = parser.ParseExpression("object", "Hello World 1  ");
      REQUIRE(node != nullptr);
      auto &identifierNode = dynamic_cast<gd::IdentifierNode &>(*node);
      REQUIRE(identifierNode.identifierName == "Hello World 1");

      gd::ExpressionValidator validator;
      node->Visit(validator);
      REQUIRE(validator.GetErrors().size() == 0);
    }
  }

  SECTION("Invalid identifiers") {
    {
      auto node = parser.ParseExpression("object", "");
      REQUIRE(node != nullptr);

      gd::ExpressionValidator validator;
      node->Visit(validator);
      REQUIRE(validator.GetErrors().size() == 1);
      REQUIRE(validator.GetErrors()[0]->GetMessage() ==
              "You must enter a valid object name.");
    }
    {
      auto node = parser.ParseExpression("object", "Hello + World1");
      REQUIRE(node != nullptr);

      gd::ExpressionValidator validator;
      node->Visit(validator);
      REQUIRE(validator.GetErrors().size() == 1);
      REQUIRE(validator.GetErrors()[0]->GetMessage() ==
              "Operators (+, -, /, *) can't be used with an object name. "
              "Remove the operator.");
    }
  }

  SECTION("Valid function calls") {
    {
      auto node = parser.ParseExpression("number", "MyExtension::GetNumber()");
      REQUIRE(node != nullptr);
      auto &functionNode = dynamic_cast<gd::FunctionCallNode &>(*node);
      REQUIRE(functionNode.functionName == "MyExtension::GetNumber");
      REQUIRE(functionNode.objectName == "");
      REQUIRE(functionNode.behaviorName == "");

      gd::ExpressionValidator validator;
      node->Visit(validator);
      REQUIRE(validator.GetErrors().size() == 0);
    }
    {
      auto node = parser.ParseExpression(
          "number", "MyExtension::GetNumberWith2Params(12, \"hello world\")");
      REQUIRE(node != nullptr);
      auto &functionNode = dynamic_cast<gd::FunctionCallNode &>(*node);
      REQUIRE(functionNode.functionName == "MyExtension::GetNumberWith2Params");
      REQUIRE(functionNode.objectName == "");
      REQUIRE(functionNode.behaviorName == "");

      gd::ExpressionValidator validator;
      node->Visit(validator);
      REQUIRE(validator.GetErrors().size() == 0);
    }
    {
      auto node = parser.ParseExpression(
          "number", "MyExtension::GetNumberWith3Params(12, \"hello world\")");
      REQUIRE(node != nullptr);
      auto &functionNode = dynamic_cast<gd::FunctionCallNode &>(*node);

      gd::ExpressionValidator validator;
      node->Visit(validator);
      REQUIRE(validator.GetErrors().size() == 0);
    }
    {
      auto node = parser.ParseExpression(
          "number",
          "MyExtension::GetNumberWith3Params(12, \"hello world\", 34)");
      REQUIRE(node != nullptr);
      auto &functionNode = dynamic_cast<gd::FunctionCallNode &>(*node);

      gd::ExpressionValidator validator;
      node->Visit(validator);
      REQUIRE(validator.GetErrors().size() == 0);
    }
    {
      auto node =
          parser.ParseExpression("number", "MySpriteObject.GetObjectNumber()");
      REQUIRE(node != nullptr);
      auto &functionNode = dynamic_cast<gd::FunctionCallNode &>(*node);
      REQUIRE(functionNode.functionName == "GetObjectNumber");
      REQUIRE(functionNode.objectName == "MySpriteObject");
      REQUIRE(functionNode.behaviorName == "");

      gd::ExpressionValidator validator;
      node->Visit(validator);
      REQUIRE(validator.GetErrors().size() == 0);
    }
    {
      auto node = parser.ParseExpression(
          "number", "WhateverObject.WhateverBehavior::WhateverFunction()");
      REQUIRE(node != nullptr);
      auto &functionNode = dynamic_cast<gd::FunctionCallNode &>(*node);
      REQUIRE(functionNode.functionName == "WhateverFunction");
      REQUIRE(functionNode.objectName == "WhateverObject");
      REQUIRE(functionNode.behaviorName == "WhateverBehavior");
    }
    {
      auto node = parser.ParseExpression(
          "number",
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

  SECTION("Valid function calls (whitespaces)") {
    {
      auto node =
          parser.ParseExpression("number", "MyExtension::GetNumber  ()");
      REQUIRE(node != nullptr);
      auto &functionNode = dynamic_cast<gd::FunctionCallNode &>(*node);
      REQUIRE(functionNode.functionName == "MyExtension::GetNumber");
      REQUIRE(functionNode.objectName == "");
      REQUIRE(functionNode.behaviorName == "");

      gd::ExpressionValidator validator;
      node->Visit(validator);
      REQUIRE(validator.GetErrors().size() == 0);
    }
    {
      auto node = parser.ParseExpression(
          "number", "MySpriteObject  .  GetObjectNumber  ()");
      REQUIRE(node != nullptr);
      auto &functionNode = dynamic_cast<gd::FunctionCallNode &>(*node);
      REQUIRE(functionNode.functionName == "GetObjectNumber");
      REQUIRE(functionNode.objectName == "MySpriteObject");
      REQUIRE(functionNode.behaviorName == "");

      gd::ExpressionValidator validator;
      node->Visit(validator);
      REQUIRE(validator.GetErrors().size() == 0);
    }
    {
      auto node = parser.ParseExpression("number",
                                         "WhateverObject  .  WhateverBehavior  "
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
          "number", "MyExtension::GetNumberWith3Params(12, \"hello world\",)");
      REQUIRE(node != nullptr);
      auto &functionNode = dynamic_cast<gd::FunctionCallNode &>(*node);

      gd::ExpressionValidator validator;
      node->Visit(validator);
      REQUIRE(validator.GetErrors().size() == 0);
    }
  }

  SECTION("Valid function calls (deprecated missing optional arguments)") {
    {
      auto node = parser.ParseExpression("number", "MyExtension::MouseX(,)");
      REQUIRE(node != nullptr);
      auto &functionNode = dynamic_cast<gd::FunctionCallNode &>(*node);

      gd::ExpressionValidator validator;
      node->Visit(validator);
      REQUIRE(validator.GetErrors().size() == 0);
    }
  }

  SECTION("Valid object function name") {
      auto node = parser.ParseExpression("string", "MyObject.MyFunc");
      REQUIRE(node != nullptr);
      auto &objectFunctionName = dynamic_cast<gd::ObjectFunctionNameNode &>(*node);
      REQUIRE(objectFunctionName.objectName == "MyObject");
      REQUIRE(objectFunctionName.objectFunctionOrBehaviorName == "MyFunc");
  }

  SECTION("Valid object behavior name") {
      auto node = parser.ParseExpression("string", "MyObject.MyBehavior::MyFunc");
      REQUIRE(node != nullptr);
      auto &objectFunctionName = dynamic_cast<gd::ObjectFunctionNameNode &>(*node);
      REQUIRE(objectFunctionName.objectName == "MyObject");
      REQUIRE(objectFunctionName.objectFunctionOrBehaviorName == "MyBehavior");
      REQUIRE(objectFunctionName.behaviorFunctionName == "MyFunc");
  }

  SECTION("Unfinished object function name") {
      auto node = parser.ParseExpression("string", "MyObject.");
      REQUIRE(node != nullptr);
      auto &objectFunctionName = dynamic_cast<gd::ObjectFunctionNameNode &>(*node);
      REQUIRE(objectFunctionName.objectName == "MyObject");
      REQUIRE(objectFunctionName.objectFunctionOrBehaviorName == "");
  }

  SECTION("Unfinished object behavior name") {
      auto node = parser.ParseExpression("string", "MyObject.MyBehavior::");
      REQUIRE(node != nullptr);
      auto &objectFunctionName = dynamic_cast<gd::ObjectFunctionNameNode &>(*node);
      REQUIRE(objectFunctionName.objectName == "MyObject");
      REQUIRE(objectFunctionName.objectFunctionOrBehaviorName == "MyBehavior");
      REQUIRE(objectFunctionName.behaviorFunctionName == "");
  }

  SECTION("Invalid function calls") {
    {
      auto node = parser.ParseExpression("number", "Idontexist(12)");
      REQUIRE(node != nullptr);

      gd::ExpressionValidator validator;
      node->Visit(validator);
      REQUIRE(validator.GetErrors().size() == 2);
      REQUIRE(validator.GetErrors()[0]->GetMessage() ==
              "Cannot find an expression with this name: Idontexist\nDouble "
              "check that you've not made any typo in the name.");
      REQUIRE(validator.GetErrors()[0]->GetStartPosition() == 0);
      REQUIRE(validator.GetErrors()[0]->GetEndPosition() == 14);
      REQUIRE(validator.GetErrors()[1]->GetMessage() ==
              "This parameter was not expected by this expression. Remove it "
              "or verify that you've entered the proper expression name.");
    }
    {
      auto node =
          parser.ParseExpression("number", "MyExtension::GetNumber(12)");
      REQUIRE(node != nullptr);

      gd::ExpressionValidator validator;
      node->Visit(validator);
      REQUIRE(validator.GetErrors().size() == 1);
      REQUIRE(validator.GetErrors()[0]->GetMessage() ==
              "This parameter was not expected by this expression. Remove it "
              "or verify that you've entered the proper expression name.");
      REQUIRE(validator.GetErrors()[0]->GetStartPosition() == 23);
      REQUIRE(validator.GetErrors()[0]->GetEndPosition() == 25);
    }
    {
      auto node = parser.ParseExpression(
          "number", "MyExtension::GetNumberWith2Params(12)");
      REQUIRE(node != nullptr);

      gd::ExpressionValidator validator;
      node->Visit(validator);
      REQUIRE(validator.GetErrors().size() == 1);
      REQUIRE(validator.GetErrors()[0]->GetMessage() ==
              "You have not entered enough parameters for the expression. The "
              "number of parameters must be exactly 2");
      REQUIRE(validator.GetErrors()[0]->GetStartPosition() == 0);
      REQUIRE(validator.GetErrors()[0]->GetEndPosition() == 37);
    }
    {
      auto node = parser.ParseExpression(
          "number", "MyExtension::GetNumberWith2Params(1, 1)");
      REQUIRE(node != nullptr);

      gd::ExpressionValidator validator;
      node->Visit(validator);
      REQUIRE(validator.GetErrors().size() == 1);
      REQUIRE(validator.GetErrors()[0]->GetMessage() ==
              "You entered a number, but a text was expected (in quotes).");
      REQUIRE(validator.GetErrors()[0]->GetStartPosition() == 37);
      REQUIRE(validator.GetErrors()[0]->GetEndPosition() == 38);
    }
    {
      auto node = parser.ParseExpression("number",
                                         "MySpriteObject.GetObjectNumber(12)");
      REQUIRE(node != nullptr);

      gd::ExpressionValidator validator;
      node->Visit(validator);
      REQUIRE(validator.GetErrors().size() == 1);
      REQUIRE(validator.GetErrors()[0]->GetMessage() ==
              "This parameter was not expected by this expression. Remove it "
              "or verify that you've entered the proper expression name.");
      REQUIRE(validator.GetErrors()[0]->GetStartPosition() == 31);
      REQUIRE(validator.GetErrors()[0]->GetEndPosition() == 33);
    }
  }
  SECTION("Invalid free function call, finishing with namespace separator") {
    {
      auto node = parser.ParseExpression("number", "MyExtension::(12)");
      REQUIRE(node != nullptr);

      gd::ExpressionValidator validator;
      node->Visit(validator);
      REQUIRE(validator.GetErrors().size() == 2);
      REQUIRE(validator.GetErrors()[0]->GetMessage() ==
              "Cannot find an expression with this name: MyExtension::\nDouble "
              "check that you've not made any typo in the name.");
      REQUIRE(validator.GetErrors()[0]->GetStartPosition() == 0);
      REQUIRE(validator.GetErrors()[0]->GetEndPosition() == 17);
      REQUIRE(validator.GetErrors()[1]->GetMessage() ==
              "This parameter was not expected by this expression. Remove it "
              "or verify that you've entered the proper expression name.");
    }
  }

  SECTION("Invalid behavior function call, finishing with namespace separator") {
    {
      auto node = parser.ParseExpression("number", "MyObject.MyBehavior::(12)");
      REQUIRE(node != nullptr);

      gd::ExpressionValidator validator;
      node->Visit(validator);
      REQUIRE(validator.GetErrors().size() == 2);

      // TODO: The error message could be improved
      REQUIRE(validator.GetErrors()[0]->GetMessage() ==
              "Cannot find an expression with this name: \nDouble "
              "check that you've not made any typo in the name.");
      REQUIRE(validator.GetErrors()[0]->GetStartPosition() == 0);
      REQUIRE(validator.GetErrors()[0]->GetEndPosition() == 25);
      REQUIRE(validator.GetErrors()[1]->GetMessage() ==
              "This parameter was not expected by this expression. Remove it "
              "or verify that you've entered the proper expression name.");
    }
  }

  SECTION("Invalid variables") {
    {
      auto node = parser.ParseExpression("scenevar", "");
      REQUIRE(node != nullptr);

      gd::ExpressionValidator validator;
      node->Visit(validator);
      REQUIRE(validator.GetErrors().size() == 1);
      REQUIRE(validator.GetErrors()[0]->GetMessage() ==
              "You must enter a variable name.");
    }
  }

  SECTION("Valid variables") {
    {
      auto node = parser.ParseExpression("scenevar", "myVariable");
      REQUIRE(node != nullptr);
      auto &variableNode = dynamic_cast<gd::VariableNode &>(*node);
      REQUIRE(variableNode.name == "myVariable");
    }

    {
      auto node = parser.ParseExpression("scenevar", "myVariable.myChild");
      REQUIRE(node != nullptr);
      auto &variableNode = dynamic_cast<gd::VariableNode &>(*node);
      REQUIRE(variableNode.name == "myVariable");
      REQUIRE(variableNode.child != nullptr);
      auto &childNode =
          dynamic_cast<gd::VariableAccessorNode &>(*variableNode.child);
      REQUIRE(childNode.name == "myChild");
    }

    {
      auto node = parser.ParseExpression(
          "scenevar", "myVariable[ \"My named children\"  ]");
      REQUIRE(node != nullptr);
      auto &variableNode = dynamic_cast<gd::VariableNode &>(*node);
      REQUIRE(variableNode.name == "myVariable");
      REQUIRE(variableNode.child != nullptr);
      auto &childNode =
          dynamic_cast<gd::VariableBracketAccessorNode &>(*variableNode.child);
      REQUIRE(childNode.expression != nullptr);
      auto &textNode = dynamic_cast<gd::TextNode &>(*childNode.expression);
      REQUIRE(textNode.text == "My named children");
    }

    {
      auto node = parser.ParseExpression(
          "scenevar", "myVariable[ \"My named children\"  ] . grandChild");
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
    }
  }

  SECTION("Fuzzy/random tests") {
    {
      auto testExpression = [&parser](const gd::String &expression) {
        auto testExpressionWithType = [&parser,
                                       &expression](const gd::String &type) {
          auto node = parser.ParseExpression(type, expression);
          REQUIRE(node != nullptr);
          gd::ExpressionValidator validator;
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
        auto node = parser.ParseExpression("string", "\"hello world\"");
        REQUIRE(node != nullptr);
        auto &textNode = dynamic_cast<gd::TextNode &>(*node);
        REQUIRE(textNode.text == "hello world");
        REQUIRE(textNode.location.GetStartPosition() == 0);
        REQUIRE(textNode.location.GetEndPosition() == 13);
      }
      {
        auto node = parser.ParseExpression("number", "3.14159");
        REQUIRE(node != nullptr);
        auto &numberNode = dynamic_cast<gd::NumberNode &>(*node);
        REQUIRE(numberNode.number == "3.14159");
        REQUIRE(numberNode.location.GetStartPosition() == 0);
        REQUIRE(numberNode.location.GetEndPosition() == 7);
      }
      {
        auto node = parser.ParseExpression("number", "345 +  678");
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
      auto node = parser.ParseExpression("scenevar", "MyVariable");
      REQUIRE(node != nullptr);
      auto &variableNode = dynamic_cast<gd::VariableNode &>(*node);
      REQUIRE(variableNode.name == "MyVariable");
      REQUIRE(variableNode.location.GetStartPosition() == 0);
      REQUIRE(variableNode.location.GetEndPosition() == 10);
      REQUIRE(variableNode.nameLocation.GetStartPosition() == 0);
      REQUIRE(variableNode.nameLocation.GetEndPosition() == 10);
    }
    SECTION("Variable locations (with child)") {
      auto node = parser.ParseExpression("scenevar", "MyVariable.MyChild");
      REQUIRE(node != nullptr);
      auto &variableNode = dynamic_cast<gd::VariableNode &>(*node);
      REQUIRE(variableNode.name == "MyVariable");
      REQUIRE(variableNode.location.GetStartPosition() == 0);
      REQUIRE(variableNode.location.GetEndPosition() == 18);
      REQUIRE(variableNode.nameLocation.GetStartPosition() == 0);
      REQUIRE(variableNode.nameLocation.GetEndPosition() == 10);
      REQUIRE(variableNode.child != nullptr);
      auto &childVariableAccessorNode =
          dynamic_cast<gd::VariableAccessorNode &>(*variableNode.child);
      REQUIRE(childVariableAccessorNode.location.GetStartPosition() == 10);
      REQUIRE(childVariableAccessorNode.location.GetEndPosition() == 18);
      REQUIRE(childVariableAccessorNode.dotLocation.GetStartPosition() == 10);
      REQUIRE(childVariableAccessorNode.dotLocation.GetEndPosition() == 11);
      REQUIRE(childVariableAccessorNode.nameLocation.GetStartPosition() == 11);
      REQUIRE(childVariableAccessorNode.nameLocation.GetEndPosition() == 18);
    }
    SECTION("Free function locations") {
      auto node =
          parser.ParseExpression("number", "WhateverFunction(1, \"2\", three)");
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
      auto node = parser.ParseExpression("number",
                                         "WhateverFunction  (1, \"2\", three)");
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
          "number", "WhateverObject.WhateverFunction(1, \"2\", three)");
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
          parser.ParseExpression("number", "WhateverObject.WhateverFunction");
      REQUIRE(node != nullptr);
      auto &objectFunctionNameNode =
          dynamic_cast<gd::ObjectFunctionNameNode &>(*node);
      REQUIRE(objectFunctionNameNode.objectName == "WhateverObject");
      REQUIRE(objectFunctionNameNode.objectFunctionOrBehaviorName ==
              "WhateverFunction");

      REQUIRE(objectFunctionNameNode.location.GetStartPosition() == 0);
      REQUIRE(objectFunctionNameNode.location.GetEndPosition() == 31);
      REQUIRE(objectFunctionNameNode.objectNameLocation.GetStartPosition() ==
              0);
      REQUIRE(objectFunctionNameNode.objectNameLocation.GetEndPosition() == 14);
      REQUIRE(objectFunctionNameNode.objectNameDotLocation.GetStartPosition() ==
              14);
      REQUIRE(objectFunctionNameNode.objectNameDotLocation.GetEndPosition() ==
              15);
      REQUIRE(objectFunctionNameNode.behaviorFunctionNameLocation.IsValid() ==
              false);
      REQUIRE(objectFunctionNameNode.behaviorNameNamespaceSeparatorLocation
                  .IsValid() == false);
      REQUIRE(objectFunctionNameNode.objectFunctionOrBehaviorNameLocation
                  .GetStartPosition() == 15);
      REQUIRE(objectFunctionNameNode.objectFunctionOrBehaviorNameLocation
                  .GetEndPosition() == 31);
    }
    SECTION("Object function name locations (with whitespace)") {
      auto node = parser.ParseExpression(
          "number", "WhateverObject  .  WhateverFunction  ");
      REQUIRE(node != nullptr);
      auto &objectFunctionNameNode =
          dynamic_cast<gd::ObjectFunctionNameNode &>(*node);
      REQUIRE(objectFunctionNameNode.objectName == "WhateverObject");
      REQUIRE(objectFunctionNameNode.objectFunctionOrBehaviorName ==
              "WhateverFunction");

      REQUIRE(objectFunctionNameNode.location.GetStartPosition() == 0);
      REQUIRE(objectFunctionNameNode.location.GetEndPosition() == 37);
      REQUIRE(objectFunctionNameNode.objectNameLocation.GetStartPosition() ==
              0);
      REQUIRE(objectFunctionNameNode.objectNameLocation.GetEndPosition() == 14);
      REQUIRE(objectFunctionNameNode.objectNameDotLocation.GetStartPosition() ==
              16);
      REQUIRE(objectFunctionNameNode.objectNameDotLocation.GetEndPosition() ==
              17);
      REQUIRE(objectFunctionNameNode.behaviorFunctionNameLocation.IsValid() ==
              false);
      REQUIRE(objectFunctionNameNode.behaviorNameNamespaceSeparatorLocation
                  .IsValid() == false);
      REQUIRE(objectFunctionNameNode.objectFunctionOrBehaviorNameLocation
                  .GetStartPosition() == 19);
      REQUIRE(objectFunctionNameNode.objectFunctionOrBehaviorNameLocation
                  .GetEndPosition() == 35);
    }
    SECTION("Object function locations (with whitespaces)") {
      auto node = parser.ParseExpression(
          "number", "WhateverObject . WhateverFunction (1, \"2\", three)");
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
          "number",
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
          "number", "WhateverObject  .  WhateverFunction  ");
      REQUIRE(node != nullptr);
      auto &objectFunctionNameNode =
          dynamic_cast<gd::ObjectFunctionNameNode &>(*node);
      REQUIRE(objectFunctionNameNode.objectName == "WhateverObject");
      REQUIRE(objectFunctionNameNode.objectFunctionOrBehaviorName ==
              "WhateverFunction");

      REQUIRE(objectFunctionNameNode.location.GetStartPosition() == 0);
      REQUIRE(objectFunctionNameNode.location.GetEndPosition() == 37);
      REQUIRE(objectFunctionNameNode.objectNameLocation.GetStartPosition() ==
              0);
      REQUIRE(objectFunctionNameNode.objectNameLocation.GetEndPosition() == 14);
      REQUIRE(objectFunctionNameNode.objectNameDotLocation.GetStartPosition() ==
              16);
      REQUIRE(objectFunctionNameNode.objectNameDotLocation.GetEndPosition() ==
              17);
      REQUIRE(objectFunctionNameNode.behaviorFunctionNameLocation.IsValid() ==
              false);
      REQUIRE(objectFunctionNameNode.behaviorNameNamespaceSeparatorLocation
                  .IsValid() == false);
      REQUIRE(objectFunctionNameNode.objectFunctionOrBehaviorNameLocation
                  .GetStartPosition() == 19);
      REQUIRE(objectFunctionNameNode.objectFunctionOrBehaviorNameLocation
                  .GetEndPosition() == 35);
    }
    SECTION("Behavior function name locations") {
      auto node = parser.ParseExpression(
          "number", "WhateverObject.WhateverBehavior::WhateverFunction");
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
          "number", "WhateverObject.WhateverBehavior  ::  WhateverFunction");
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
        auto node = parser.ParseExpression("number", "3.14159 + ");
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
        auto node = parser.ParseExpression("number", "\"abcde\" + ");
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
