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
  }

  SECTION("Invalid texts") {
    {
      auto node = parser.ParseExpression("string", "");
      REQUIRE(node != nullptr);

      gd::ExpressionValidator validator;
      node->Visit(validator);
      REQUIRE(validator.GetErrors().size() == 1);
      REQUIRE(validator.GetErrors()[0]->GetMessage() ==
              "You must enter a text, number or a valid expression call.");
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
      auto node = parser.ParseExpression("number", "3.14159");
      REQUIRE(node != nullptr);
      auto &numberNode = dynamic_cast<gd::NumberNode &>(*node);
      REQUIRE(numberNode.number == "3.14159");
    }
    {
      auto node = parser.ParseExpression("number", ".14159");
      REQUIRE(node != nullptr);
      auto &numberNode = dynamic_cast<gd::NumberNode &>(*node);
      REQUIRE(numberNode.number == ".14159");
    }
    {
      auto node = parser.ParseExpression("number", "3.");
      REQUIRE(node != nullptr);
      auto &numberNode = dynamic_cast<gd::NumberNode &>(*node);
      REQUIRE(numberNode.number == "3.");
    }
  }

  SECTION("valid unary operators") {
    {
      auto node = parser.ParseExpression("number", "-123");
      REQUIRE(node != nullptr);
      auto &unaryOperatorNode = dynamic_cast<gd::UnaryOperatorNode &>(*node);
      REQUIRE(unaryOperatorNode.op == '-');
      auto &numberNode =
          dynamic_cast<gd::NumberNode &>(*unaryOperatorNode.factor);
      REQUIRE(numberNode.number == "123");
    }
    {
      auto node = parser.ParseExpression("number", "+123");
      REQUIRE(node != nullptr);
      auto &unaryOperatorNode = dynamic_cast<gd::UnaryOperatorNode &>(*node);
      REQUIRE(unaryOperatorNode.op == '+');
      auto &numberNode =
          dynamic_cast<gd::NumberNode &>(*unaryOperatorNode.factor);
      REQUIRE(numberNode.number == "123");
    }
    {
      auto node = parser.ParseExpression("number", "-123.2");
      REQUIRE(node != nullptr);
      auto &unaryOperatorNode = dynamic_cast<gd::UnaryOperatorNode &>(*node);
      REQUIRE(unaryOperatorNode.op == '-');
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
              "You must enter a text, number or a valid expression call.");
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
              "You must enter a text, number or a valid expression call.");
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
      auto node = parser.ParseExpression("identifier", "HelloWorld1");
      REQUIRE(node != nullptr);
      auto &identifierNode = dynamic_cast<gd::IdentifierNode &>(*node);
      REQUIRE(identifierNode.identifierName == "HelloWorld1");

      gd::ExpressionValidator validator;
      node->Visit(validator);
      REQUIRE(validator.GetErrors().size() == 0);
    }

    {
      auto node = parser.ParseExpression("identifier", "Hello World 1  ");
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
      auto node = parser.ParseExpression("identifier", "Hello + World1");
      REQUIRE(node != nullptr);

      gd::ExpressionValidator validator;
      node->Visit(validator);
      REQUIRE(validator.GetErrors().size() == 1);
      REQUIRE(validator.GetErrors()[0]->GetMessage() ==
              "Operators (+, -, /, *) can't be used there. Remove the operator.");
    }
  }

  SECTION("Valid function calls") {
    {
      auto node = parser.ParseExpression("number", "MyExtension::GetNumber()");
      REQUIRE(node != nullptr);
      auto &functionNode = dynamic_cast<gd::FunctionNode &>(*node);
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
      auto &functionNode = dynamic_cast<gd::FunctionNode &>(*node);
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
      auto &functionNode = dynamic_cast<gd::FunctionNode &>(*node);

      gd::ExpressionValidator validator;
      node->Visit(validator);
      REQUIRE(validator.GetErrors().size() == 0);
    }
    {
      auto node = parser.ParseExpression(
          "number",
          "MyExtension::GetNumberWith3Params(12, \"hello world\", 34)");
      REQUIRE(node != nullptr);
      auto &functionNode = dynamic_cast<gd::FunctionNode &>(*node);

      gd::ExpressionValidator validator;
      node->Visit(validator);
      REQUIRE(validator.GetErrors().size() == 0);
    }
    {
      auto node =
          parser.ParseExpression("number", "MySpriteObject.GetObjectNumber()");
      REQUIRE(node != nullptr);
      auto &functionNode = dynamic_cast<gd::FunctionNode &>(*node);
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
      auto &functionNode = dynamic_cast<gd::FunctionNode &>(*node);
      REQUIRE(functionNode.functionName == "WhateverFunction");
      REQUIRE(functionNode.objectName == "WhateverObject");
      REQUIRE(functionNode.behaviorName == "WhateverBehavior");
    }
    {
      auto node = parser.ParseExpression(
          "number",
          "WhateverObject.WhateverBehavior::WhateverFunction(1, \"2\", three)");
      REQUIRE(node != nullptr);
      auto &functionNode = dynamic_cast<gd::FunctionNode &>(*node);
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
      auto &functionNode = dynamic_cast<gd::FunctionNode &>(*node);

      gd::ExpressionValidator validator;
      node->Visit(validator);
      REQUIRE(validator.GetErrors().size() == 0);
    }
  }

  SECTION("Valid function calls (deprecated missing optional arguments)") {
    {
      auto node = parser.ParseExpression("number", "MyExtension::MouseX(,)");
      REQUIRE(node != nullptr);
      auto &functionNode = dynamic_cast<gd::FunctionNode &>(*node);

      gd::ExpressionValidator validator;
      node->Visit(validator);
      REQUIRE(validator.GetErrors().size() == 0);
    }
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
          "scenevar", "myVariable[ \"My named children\"  ].grandChild");
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
      auto testExpression = [&parser](const gd::String & expression) {
        auto testExpressionWithType = [&parser, &expression](const gd::String & type) {
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
        testExpressionWithType("identifier");
        testExpressionWithType("unknown");
      };

      REQUIRE_NOTHROW(testExpression(""));
      REQUIRE_NOTHROW(testExpression("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!"));
      REQUIRE_NOTHROW(testExpression("2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2/2[]"));
      REQUIRE_NOTHROW(testExpression("-043jovn"));
      REQUIRE_NOTHROW(testExpression("-043jo\t\t\r\n+==\t-vn"));
      REQUIRE_NOTHROW(testExpression("--=frpvlf-=3ok"));
      REQUIRE_NOTHROW(testExpression("-[][\\][\\][]]"));
      REQUIRE_NOTHROW(testExpression("r3o4f-kef03-34=-pf[w]"));
      REQUIRE_NOTHROW(testExpression("-=-+))(_OK*UJKL}{\""));
      REQUIRE_NOTHROW(testExpression("\\|\"\\|\"\\|\"w|\"\\\"\\\" \\\\\\\\\" fweewf \fe'f\fwe'\te'w\f'reg[pto43o]"));
    }
  }
}
