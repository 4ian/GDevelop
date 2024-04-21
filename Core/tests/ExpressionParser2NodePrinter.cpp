/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "GDCore/Events/Parsers/ExpressionParser2NodePrinter.h"
#include "DummyPlatform.h"
#include "GDCore/Events/Parsers/ExpressionParser2.h"
#include "GDCore/Extensions/Platform.h"
#include "GDCore/Extensions/PlatformExtension.h"
#include "GDCore/IDE/Events/ExpressionValidator.h"
#include "GDCore/Project/Layout.h"
#include "GDCore/Project/Project.h"
#include "catch.hpp"

TEST_CASE("ExpressionParser2NodePrinter", "[common][events]") {
  gd::Project project;
  gd::Platform platform;
  SetupProjectWithDummyPlatform(project, platform);
  auto &layout1 = project.InsertNewLayout("Layout1", 0);
  layout1.InsertNewObject(project, "MyExtension::Sprite", "MySpriteObject", 0);

  gd::ExpressionParser2 parser;

  auto testPrinter = [&parser](const gd::String &type,
                               const gd::String &expression,
                               const gd::String &expectedOutput = "") {
    auto node = parser.ParseExpression(expression);
    REQUIRE(node != nullptr);
    gd::ExpressionParser2NodePrinter printer;
    node->Visit(printer);
    if (expectedOutput.empty()) {
      REQUIRE(printer.GetOutput() == expression);
    } else {
      REQUIRE(printer.GetOutput() == expectedOutput);
    }
  };

  SECTION("Valid texts") {
    testPrinter("string", "\"hello world\"");
    testPrinter("string", "\"\"");
    testPrinter("string", "\"hello \\\"world\\\"\"");
  }
  SECTION("Invalid texts") {
    testPrinter("string", "");
    testPrinter("string", "abcd");
    testPrinter("string", "abcd efgh");
    testPrinter("string", "abcd + efgh");
    testPrinter("string", "123");
    testPrinter("string", "123.5");
    testPrinter("string", "\"", "\"\"");
    testPrinter("string", "\"hello world", "\"hello world\"");
    testPrinter("string", "\"\"\"", "\"\" \"\"");
    testPrinter("number", "");
  }

  SECTION("Invalid parenthesis") {
    testPrinter("string", "((\"hello\"", "((\"hello\"))");
  }

  SECTION("Invalid text operators") {
    testPrinter("string", "\"Hello \" - \"World\"");
  }

  SECTION("Valid numbers") {
    testPrinter("number", "123");
    testPrinter("number", "3.14159");
    testPrinter("number", ".14159", "0.14159");
    testPrinter("number", "0.14159");
    testPrinter("number", "3.");
    testPrinter("number", "0");
    testPrinter("number", "00", "0");
    testPrinter("number", "000", "0");
    testPrinter("number", "0000", "0");
    testPrinter("number", "0001234", "1234");
    testPrinter("number", "0000.", "0.");
    testPrinter("number", "0000.1", "0.1");
    testPrinter("number", "0001.2", "1.2");
  }

  SECTION("Valid unary operators") {
    testPrinter("number", "-123");
    testPrinter("number", "+123");
    testPrinter("number", "+-123");
    testPrinter("number", "+-+123.34567");
    testPrinter("number", "-123.2");
    testPrinter("number", "- + - 123.2", "-+-123.2");
    testPrinter("number", "- + - .", "-+-0.");
    testPrinter("number", "- + - 000123.", "-+-123.");
    testPrinter("number", "- + - 000123.4", "-+-123.4");
  }

  SECTION("Valid unary operators with parenthesis") {
    testPrinter("number", "-(123)");
    testPrinter("number", "+((123))");
    testPrinter("number", "+-(((123)))");
    testPrinter("number", "+(-((+123.34567)))");
    testPrinter("number", "-123.2");
    testPrinter("number", "- (+ - ((123.2)))", "-(+-((123.2)))");
  }

  SECTION("Invalid numbers") {
    testPrinter("number", "abcd");
    testPrinter("number", "\"hello world\"");
    testPrinter("number", "123 456");
    testPrinter("number", "3..14", "3. 0.14");
    testPrinter("number", "0..", "0. 0.");
    testPrinter("number", "0...3", "0. 0. 0.3");
    testPrinter("number", "0...3.", "0. 0. 0.3 0.");
    testPrinter("number", "./.", "0. / 0.");
  }

  SECTION("Invalid number operators") {
    testPrinter("number", "123 % 456");
    testPrinter("number", "123 ? 456");
    testPrinter("number", "123 < 456");
    testPrinter("number", "123 > 456");
    testPrinter("number", "123 ! 456");
    testPrinter("number", "123 @ 456");
    testPrinter("number", "123 [ 456");
    testPrinter("number", "123 ] 456");
    testPrinter("number", "123 { 456");
    testPrinter("number", "123 } 456");
    testPrinter("number", "123 | 456");
    testPrinter("number", "123 ; 456");
    testPrinter("number", "123 : 456");
    testPrinter("number", "1 / /2");
    testPrinter("number", "123 ;; 456");
    testPrinter("number", "123 ?? 456", "123 ? ? 456");
    testPrinter("number", "123 << 456", "123 < < 456");
    testPrinter("number", "123 >> 456", "123 > > 456");
    testPrinter("number", "123 !!! 456", "123 ! !! 456");
  }

  SECTION("Numbers and texts mismatches") {
    testPrinter("number", "123 + \"hello world\"");
    testPrinter("string", "\"hello world\" + 123");
  }
  SECTION("Numbers and texts mismatches with parenthesis") {
    testPrinter("number", "((123)) + (\"hello world\")");
    testPrinter("string", "((\"hello world\") + (123))");
  }

  SECTION("Valid objects") {
    testPrinter("object", "HelloWorld1");
    testPrinter("object", "Hello World 1  ", "Hello World 1");
    testPrinter("objectPtr", "HelloWorld1");
    testPrinter("objectPtr", "Hello World 1  ", "Hello World 1");
  }
  SECTION("Invalid objects") {
    testPrinter("object", "Hello + World1");
  }
  SECTION("Valid function calls") {
    testPrinter("number", "MyExtension::GetNumber()");
    testPrinter("number",
                "MyExtension::GetNumberWith2Params(12, \"hello world\")");
    testPrinter("number",
                "MyExtension::GetNumberWith3Params(12, \"hello world\")");
    testPrinter("number",
                "MyExtension::GetNumberWith3Params(12, \"hello world\", 34)");
    testPrinter("number", "MySpriteObject.GetObjectNumber()");
  }
  SECTION("Invalid function calls") {
    testPrinter("number", "Idontexist(12)");
    testPrinter("number", "MyExtension::GetNumber(12)");
    testPrinter("number", "MyExtension::GetNumberWith2Params(12)");
    testPrinter(
        "number",
        "MyExtension::GetNumberWith3Params(12, \"hello world\", 34, blabla)");
    testPrinter("number", "MySpriteObject.GetObjectNumber(extraparameter)");
  }
  SECTION("Unterminated function calls") {
    testPrinter("number", "Idontexist(12", "Idontexist(12)");
    testPrinter("number",
                "Idontexist(12, 34,   \"56\" + 2    ",
                "Idontexist(12, 34, \"56\" + 2)");
  }

  SECTION("Valid function name") {
    SECTION("Free function") {
      testPrinter("number", "MyExtension::GetNumber");
      testPrinter("number", "MyExtension::GetNumberWith2Params");
      testPrinter("number", "MyExtension::UnknownFunc");
      testPrinter("number", "UnknownFunc");
    }
    SECTION("Object function") {
      testPrinter("number", "a.b");
      testPrinter("number", "MySpriteObject.GetObjectNumber");
      testPrinter("number", "MySpriteObject.MyOtherFunc");
    }
    SECTION("Behavior function") {
      testPrinter("number", "MySpriteObject.MyBehavior::MyFunc");
    }
  }

  SECTION("Valid variables") {
    testPrinter("scenevar", "myVariable");
    testPrinter("scenevar", "myVariable.myChild");
    testPrinter("scenevar",
                "myVariable[ \"My named children\"  ]",
                "myVariable[\"My named children\"]");
    testPrinter("scenevar",
                "myVariable[ \"My named children\"  ].grandChild",
                "myVariable[\"My named children\"].grandChild");
  }
  SECTION("Valid function calls with unary operators") {
    testPrinter("number", "-MyExtension::GetNumber()");
    testPrinter("number",
                "+MyExtension::GetNumberWith2Params(12, \"hello world\")");
    testPrinter("number",
                "+-MyExtension::GetNumberWith3Params(12, \"hello world\")");
    testPrinter(
        "number",
        "+--+MyExtension::GetNumberWith3Params(12, \"hello world\", 34)");
    testPrinter("number", "--MySpriteObject.GetObjectNumber()");
  }
  SECTION("Other/complex cases") {
    testPrinter("scenevar",
                "myVariable[ \"My children\" + "
                "ToString(+-MyExtension::GetNumberWith3Params(12, \"hello "
                "world\"))  ].grandChild",
                "myVariable[\"My children\" + "
                "ToString(+-MyExtension::GetNumberWith3Params(12, \"hello "
                "world\"))].grandChild");
  }
}
