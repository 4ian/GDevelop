/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
/**
 * @file Tests covering common features of GDevelop Core.
 */
#include "GDCore/IDE/DependenciesAnalyzer.h"
#include "GDCore/Events/Builtin/LinkEvent.h"
#include "GDCore/Events/Event.h"
#include "GDCore/Project/ExternalEvents.h"
#include "GDCore/Project/Layout.h"
#include "GDCore/Project/Project.h"
#include "GDCore/Project/Variable.h"
#include "catch.hpp"

TEST_CASE("DependenciesAnalyzer", "[common]") {
  SECTION("Can detect a simple scene dependency") {
    gd::Project project;
    auto& layout1 = project.InsertNewLayout("Layout1", 0);
    auto& layout2 = project.InsertNewLayout("Layout2", 0);

    gd::LinkEvent linkEvent1;
    linkEvent1.SetTarget("Layout2");
    layout1.GetEvents().InsertEvent(linkEvent1);

    DependenciesAnalyzer analyzer(project, layout1);
    analyzer.Analyze();

    REQUIRE(analyzer.GetScenesDependencies().size() == 1);
    REQUIRE(analyzer.GetScenesDependencies().find("Layout2") !=
            analyzer.GetScenesDependencies().end());
    REQUIRE(analyzer.GetExternalEventsDependencies().size() == 0);
    REQUIRE(analyzer.GetSourceFilesDependencies().size() == 0);
  }

  SECTION("Can detect a simple external events dependency") {
    gd::Project project;
    auto& layout1 = project.InsertNewLayout("Layout1", 0);
    auto& layout2 = project.InsertNewLayout("Layout2", 0);
    auto& externalEvents1 =
        project.InsertNewExternalEvents("ExternalEvents1", 0);
    auto& externalEvents2 =
        project.InsertNewExternalEvents("ExternalEvents2", 0);

    gd::LinkEvent linkEvent1;
    linkEvent1.SetTarget("ExternalEvents1");
    layout1.GetEvents().InsertEvent(linkEvent1);

    DependenciesAnalyzer analyzer(project, layout1);
    analyzer.Analyze();

    REQUIRE(analyzer.GetScenesDependencies().size() == 0);
    REQUIRE(analyzer.GetExternalEventsDependencies().size() == 1);
    REQUIRE(analyzer.GetExternalEventsDependencies().find("ExternalEvents1") !=
            analyzer.GetExternalEventsDependencies().end());
    REQUIRE(analyzer.GetSourceFilesDependencies().size() == 0);
  }

  SECTION("Can detect a transitive scene and external events dependency") {
    gd::Project project;
    auto& layout1 = project.InsertNewLayout("Layout1", 0);
    auto& layout2 = project.InsertNewLayout("Layout2", 0);
    auto& layout3 = project.InsertNewLayout("Layout3", 0);
    auto& externalEvents1 =
        project.InsertNewExternalEvents("ExternalEvents1", 0);

    gd::LinkEvent linkEvent1;
    linkEvent1.SetTarget("Layout2");
    layout1.GetEvents().InsertEvent(linkEvent1);
    gd::LinkEvent linkEvent2;
    linkEvent2.SetTarget("ExternalEvents1");
    layout2.GetEvents().InsertEvent(linkEvent2);
    gd::LinkEvent linkEvent3;
    linkEvent3.SetTarget("Layout3");
    externalEvents1.GetEvents().InsertEvent(linkEvent3);

    DependenciesAnalyzer analyzer(project, layout1);
    analyzer.Analyze();

    REQUIRE(analyzer.GetScenesDependencies().size() == 2);
    REQUIRE(analyzer.GetScenesDependencies().find("Layout2") !=
            analyzer.GetScenesDependencies().end());
    REQUIRE(analyzer.GetScenesDependencies().find("Layout3") !=
            analyzer.GetScenesDependencies().end());
    REQUIRE(analyzer.GetExternalEventsDependencies().size() == 1);
    REQUIRE(analyzer.GetExternalEventsDependencies().find("ExternalEvents1") !=
            analyzer.GetExternalEventsDependencies().end());
    REQUIRE(analyzer.GetSourceFilesDependencies().size() == 0);
  }

  SECTION("Can detect a (nested) circular dependency with scenes") {
    gd::Project project;
    auto& layout1 = project.InsertNewLayout("Layout1", 0);
    auto& layout2 = project.InsertNewLayout("Layout2", 0);
    auto& layout3 = project.InsertNewLayout("Layout3", 0);

    gd::LinkEvent linkEvent1;
    linkEvent1.SetTarget("Layout2");
    layout1.GetEvents().InsertEvent(linkEvent1);
    gd::LinkEvent linkEvent2;
    linkEvent2.SetTarget("Layout3");
    layout2.GetEvents().InsertEvent(linkEvent2);
    gd::LinkEvent linkEvent3;
    linkEvent3.SetTarget("Layout1");
    layout3.GetEvents().InsertEvent(linkEvent3);

    DependenciesAnalyzer analyzer(project, layout1);
    REQUIRE(analyzer.Analyze() == false);
  }

  SECTION(
      "Can detect a (nested) circular dependency with scenes and external "
      "events") {
    gd::Project project;
    auto& layout1 = project.InsertNewLayout("Layout1", 0);
    auto& layout2 = project.InsertNewLayout("Layout2", 0);
    auto& layout3 = project.InsertNewLayout("Layout3", 0);
    auto& externalEvents1 =
        project.InsertNewExternalEvents("ExternalEvents1", 0);
    auto& externalEvents2 =
        project.InsertNewExternalEvents("ExternalEvents2", 0);

    gd::LinkEvent linkEvent1;
    linkEvent1.SetTarget("Layout2");
    layout1.GetEvents().InsertEvent(linkEvent1);
    gd::LinkEvent linkEvent2;
    linkEvent2.SetTarget("ExternalEvents1");
    layout2.GetEvents().InsertEvent(linkEvent2);
    gd::LinkEvent linkEvent3;
    linkEvent3.SetTarget("Layout3");
    externalEvents1.GetEvents().InsertEvent(linkEvent3);
    gd::LinkEvent linkEvent4;
    linkEvent4.SetTarget("ExternalEvents2");
    layout3.GetEvents().InsertEvent(linkEvent4);
    gd::LinkEvent linkEvent5;
    linkEvent5.SetTarget("Layout1");
    externalEvents2.GetEvents().InsertEvent(linkEvent5);

    DependenciesAnalyzer analyzer(project, layout3);
    REQUIRE(analyzer.Analyze() == false);
  }
}
