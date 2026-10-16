/*
 * GDevelop Core
 * Copyright 2008-present Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "GDCore/Project/NamedEasingsContainer.h"

#include "GDCore/Project/EventsFunctionsExtension.h"
#include "GDCore/Project/NamedEasing.h"
#include "GDCore/Project/Project.h"
#include "GDCore/Serialization/Serializer.h"
#include "GDCore/Serialization/SerializerElement.h"
#include "catch.hpp"

TEST_CASE("NamedEasingsContainer", "[common]") {
  SECTION("Basic container operations") {
    gd::NamedEasingsContainer namedEasings;
    REQUIRE(namedEasings.GetNamedEasingsCount() == 0);
    REQUIRE(namedEasings.HasNamedEasingNamed("PopupOpen") == false);

    gd::NamedEasing& easing = namedEasings.InsertNewNamedEasing("PopupOpen", 0);
    easing.SetX1(0.34);
    easing.SetY1(1.56);
    easing.SetX2(0.64);
    easing.SetY2(1);
    REQUIRE(namedEasings.GetNamedEasingsCount() == 1);
    REQUIRE(namedEasings.HasNamedEasingNamed("PopupOpen") == true);
    REQUIRE(namedEasings.GetNamedEasing("PopupOpen").GetX1() == 0.34);
    REQUIRE(namedEasings.GetNamedEasing(0).GetY1() == 1.56);

    namedEasings.InsertNewNamedEasing("PopupClose", 1);
    namedEasings.MoveNamedEasing(1, 0);
    REQUIRE(namedEasings.GetNamedEasing(0).GetName() == "PopupClose");

    namedEasings.RemoveNamedEasing("PopupClose");
    REQUIRE(namedEasings.GetNamedEasingsCount() == 1);
    REQUIRE(namedEasings.HasNamedEasingNamed("PopupClose") == false);
  }

  SECTION("Serialization round trip") {
    gd::NamedEasingsContainer namedEasings;
    gd::NamedEasing& easing = namedEasings.InsertNewNamedEasing("PopupOpen", 0);
    easing.SetX1(0.34);
    easing.SetY1(1.56);
    easing.SetX2(0.64);
    easing.SetY2(1);
    namedEasings.InsertNewNamedEasing("Linear", 1);

    gd::SerializerElement element;
    namedEasings.SerializeNamedEasingsTo(element);

    gd::NamedEasingsContainer unserializedNamedEasings;
    unserializedNamedEasings.UnserializeNamedEasingsFrom(element);
    REQUIRE(unserializedNamedEasings.GetNamedEasingsCount() == 2);
    const gd::NamedEasing& unserializedEasing =
        unserializedNamedEasings.GetNamedEasing("PopupOpen");
    REQUIRE(unserializedEasing.GetX1() == 0.34);
    REQUIRE(unserializedEasing.GetY1() == 1.56);
    REQUIRE(unserializedEasing.GetX2() == 0.64);
    REQUIRE(unserializedEasing.GetY2() == 1);
    REQUIRE(unserializedNamedEasings.GetNamedEasing("Linear").GetX1() == 0);
    REQUIRE(unserializedNamedEasings.GetNamedEasing("Linear").GetY2() == 1);
  }

  SECTION("Project copy includes named easings") {
    gd::Project project;
    project.GetNamedEasings().InsertNewNamedEasing("PopupOpen", 0).SetX1(0.34);

    gd::Project project2 = project;
    REQUIRE(project2.GetNamedEasings().GetNamedEasingsCount() == 1);
    REQUIRE(project2.GetNamedEasings().GetNamedEasing("PopupOpen").GetX1() ==
            0.34);

    project.GetNamedEasings().GetNamedEasing("PopupOpen").SetX1(0.5);
    REQUIRE(project2.GetNamedEasings().GetNamedEasing("PopupOpen").GetX1() ==
            0.34);
  }

  SECTION("Project serialization includes named easings") {
    gd::Project project;
    project.GetNamedEasings().InsertNewNamedEasing("PopupOpen", 0).SetX1(0.34);

    gd::SerializerElement element;
    project.SerializeTo(element);

    gd::Project project2;
    project2.UnserializeFrom(element);
    REQUIRE(project2.GetNamedEasings().GetNamedEasingsCount() == 1);
    REQUIRE(project2.GetNamedEasings().GetNamedEasing("PopupOpen").GetX1() ==
            0.34);

    gd::Project emptyProject;
    gd::SerializerElement emptyElement;
    emptyProject.SerializeTo(emptyElement);
    REQUIRE(emptyElement.HasChild("namedEasings") == false);

    project2.UnserializeFrom(emptyElement);
    REQUIRE(project2.GetNamedEasings().GetNamedEasingsCount() == 0);
  }

  SECTION("EventsFunctionsExtension copy and serialization include named easings") {
    gd::EventsFunctionsExtension extension;
    extension.GetNamedEasings().InsertNewNamedEasing("ExtensionEasing", 0).SetX1(
        0.25);

    gd::EventsFunctionsExtension extension2 = extension;
    REQUIRE(extension2.GetNamedEasings().GetNamedEasingsCount() == 1);
    REQUIRE(
        extension2.GetNamedEasings().GetNamedEasing("ExtensionEasing").GetX1() ==
        0.25);

    gd::Project project;
    gd::SerializerElement element;
    extension.SerializeTo(element);

    gd::EventsFunctionsExtension unserializedExtension;
    unserializedExtension.UnserializeFrom(project, element);
    REQUIRE(unserializedExtension.GetNamedEasings().GetNamedEasingsCount() == 1);
    REQUIRE(unserializedExtension.GetNamedEasings()
                .GetNamedEasing("ExtensionEasing")
                .GetX1() == 0.25);
  }
}
