/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
/**
 * @file Tests covering common features of GDevelop Core.
 */
#include "GDCore/CommonTools.h"
#include "GDCore/Project/Project.h"
#include "GDCore/Project/SourceFile.h"
#include "catch.hpp"

TEST_CASE("SourceFile", "[common]") {
  SECTION("Basics") {
    gd::Project project;
    project.InsertNewSourceFile("test.cpp", "C++");
    project.InsertNewSourceFile("test.js", "Javascript");
    REQUIRE(project.HasSourceFile("test.cpp", "C++") == true);
    REQUIRE(project.HasSourceFile("test.cpp", "JS") == false);
    REQUIRE(project.HasSourceFile("test.cpp") == true);
    gd::SourceFile& cppSourceFile = project.GetSourceFile("test.cpp");
    REQUIRE(cppSourceFile.GetFileName() == "test.cpp");
    REQUIRE(cppSourceFile.GetLanguage() == "C++");

    project.RemoveSourceFile("test.cpp");
    REQUIRE(project.HasSourceFile("test.cpp") == false);
    REQUIRE(project.HasSourceFile("test.js") == true);
  }
}
