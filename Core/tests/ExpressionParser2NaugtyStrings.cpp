/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include <fstream>
#include "GDCore/Events/Parsers/ExpressionParser2.h"
#include "DummyPlatform.h"
#include "GDCore/Extensions/Platform.h"
#include "GDCore/Extensions/PlatformExtension.h"
#include "GDCore/IDE/Events/ExpressionValidator.h"
#include "GDCore/Project/Layout.h"
#include "GDCore/Project/Project.h"
#include "catch.hpp"

TEST_CASE("ExpressionParser2 - Naughty strings", "[common][events]") {

  gd::Project project;
  gd::Platform platform;
  SetupProjectWithDummyPlatform(project, platform);
  auto &layout1 = project.InsertNewLayout("Layout1", 0);
  layout1.InsertNewObject(project, "MyExtension::Sprite", "MySpriteObject", 0);

  gd::ExpressionParser2 parser;

  SECTION("Check that no naughty string crash the parser") {
    std::string inputFile = std::string(__FILE__) + "-blns.txt";
    std::ifstream myfile (inputFile);
    std::cout << "Start checking naughty strings... " << std::endl;
    if (myfile.is_open()) {
      std::string line;
      size_t count = 0;
      while ( std::getline (myfile,line) ) {
        auto node1 = parser.ParseExpression(line.c_str());
        REQUIRE(node1 != nullptr);
        auto node2 = parser.ParseExpression(line.c_str());
        REQUIRE(node2 != nullptr);

        count++;
      }
      myfile.close();
      std::cout << "Done (" << count << " strings)." << std::endl;
    } else {
      FAIL("Can't open " + inputFile);
    }
  }
}
