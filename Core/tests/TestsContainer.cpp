/*
 * GDevelop Core
 * Copyright 2008-present Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "GDCore/Project/TestsContainer.h"

#include "GDCore/Project/EventsFunctionsExtension.h"
#include "GDCore/Project/Project.h"
#include "GDCore/Project/Test.h"
#include "GDCore/Serialization/Serializer.h"
#include "GDCore/Serialization/SerializerElement.h"
#include "catch.hpp"

TEST_CASE("TestsContainer", "[common]") {
  SECTION("Basic container operations") {
    gd::TestsContainer tests;
    REQUIRE(tests.GetTestsCount() == 0);
    REQUIRE(tests.HasTestNamed("MyTest") == false);

    gd::Test& test = tests.InsertNewTest("MyTest", 0);
    test.SetDescription("My description");
    test.SetSource("await harness.goToScene('Scene');");
    REQUIRE(tests.GetTestsCount() == 1);
    REQUIRE(tests.HasTestNamed("MyTest") == true);
    REQUIRE(tests.GetTest("MyTest").GetType() == "gameplay");
    REQUIRE(tests.GetTest(0).GetDescription() == "My description");

    tests.InsertNewTest("MyTest2", 1);
    tests.MoveTest(1, 0);
    REQUIRE(tests.GetTest(0).GetName() == "MyTest2");

    tests.RemoveTest("MyTest2");
    REQUIRE(tests.GetTestsCount() == 1);
    REQUIRE(tests.HasTestNamed("MyTest2") == false);
  }

  SECTION("Serialization round trip") {
    gd::TestsContainer tests;
    gd::Test& test = tests.InsertNewTest("MyTest", 0);
    test.SetDescription("My description");
    test.SetSource("await harness.goToScene('Scene');\nharness.assert(true, 'ok');");
    test.SetLastRunStatus("passed");
    test.SetLastRunAt(1769700000000.0);
    test.SetLastRunDurationMs(5400);
    test.SetLastRunFramesExecuted(320);
    tests.InsertNewTest("NeverRunTest", 1);

    gd::SerializerElement element;
    tests.SerializeTestsTo(element);

    gd::TestsContainer unserializedTests;
    unserializedTests.UnserializeTestsFrom(element);
    REQUIRE(unserializedTests.GetTestsCount() == 2);
    const gd::Test& unserializedTest = unserializedTests.GetTest("MyTest");
    REQUIRE(unserializedTest.GetType() == "gameplay");
    REQUIRE(unserializedTest.GetDescription() == "My description");
    REQUIRE(unserializedTest.GetSource() ==
            "await harness.goToScene('Scene');\nharness.assert(true, 'ok');");
    REQUIRE(unserializedTest.GetLastRunStatus() == "passed");
    REQUIRE(unserializedTest.GetLastRunAt() == 1769700000000.0);
    REQUIRE(unserializedTest.GetLastRunDurationMs() == 5400);
    REQUIRE(unserializedTest.GetLastRunFramesExecuted() == 320);
    REQUIRE(unserializedTests.GetTest("NeverRunTest").GetLastRunStatus() == "");
  }

  SECTION("Project copy includes tests") {
    gd::Project project;
    project.GetTests().InsertNewTest("MyTest", 0).SetSource("// Some code");

    gd::Project project2 = project;
    REQUIRE(project2.GetTests().GetTestsCount() == 1);
    REQUIRE(project2.GetTests().GetTest("MyTest").GetSource() == "// Some code");

    // Check that the copy has not somehow shared the same pointers.
    project.GetTests().GetTest("MyTest").SetSource("// Some other code");
    REQUIRE(project2.GetTests().GetTest("MyTest").GetSource() == "// Some code");
  }

  SECTION("Project serialization includes tests") {
    gd::Project project;
    project.GetTests().InsertNewTest("MyTest", 0).SetSource("// Some code");

    gd::SerializerElement element;
    project.SerializeTo(element);

    gd::Project project2;
    project2.UnserializeFrom(element);
    REQUIRE(project2.GetTests().GetTestsCount() == 1);
    REQUIRE(project2.GetTests().GetTest("MyTest").GetSource() == "// Some code");

    // A project with no tests does not serialize a "tests" element.
    gd::Project emptyProject;
    gd::SerializerElement emptyElement;
    emptyProject.SerializeTo(emptyElement);
    REQUIRE(emptyElement.HasChild("tests") == false);

    // Unserializing a project with no "tests" element clears the tests.
    project2.UnserializeFrom(emptyElement);
    REQUIRE(project2.GetTests().GetTestsCount() == 0);
  }

  SECTION("EventsFunctionsExtension copy and serialization include tests") {
    gd::EventsFunctionsExtension extension;
    extension.GetTests().InsertNewTest("MyExtensionTest", 0).SetSource(
        "// Extension test code");

    gd::EventsFunctionsExtension extension2 = extension;
    REQUIRE(extension2.GetTests().GetTestsCount() == 1);
    REQUIRE(extension2.GetTests().GetTest("MyExtensionTest").GetSource() ==
            "// Extension test code");

    gd::Project project;
    gd::SerializerElement element;
    extension.SerializeTo(element);

    gd::EventsFunctionsExtension unserializedExtension;
    unserializedExtension.UnserializeFrom(project, element);
    REQUIRE(unserializedExtension.GetTests().GetTestsCount() == 1);
    REQUIRE(
        unserializedExtension.GetTests().GetTest("MyExtensionTest").GetSource() ==
        "// Extension test code");
  }
}
