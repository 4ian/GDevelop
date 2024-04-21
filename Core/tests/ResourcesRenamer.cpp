/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
/**
 * @file Tests covering common features of GDevelop Core.
 */
#include "GDCore/IDE/Project/ResourcesRenamer.h"

#include "GDCore/CommonTools.h"
#include "GDCore/Project/Project.h"
#include "catch.hpp"
#include "GDCore/IDE/ResourceExposer.h"

TEST_CASE("ResourcesRenamer", "[common]") {
  SECTION("It renames resources that are exposed") {
    gd::Project project;
    std::map<gd::String, gd::String> renamings = {
        {"Resource1", "RenamedResource1"}};
    gd::ResourcesRenamer resourcesRenamer(project.GetResourcesManager(), renamings);

    // Add "classic", plain resources.
    gd::ImageResource resource1;
    resource1.SetName("Resource1");
    project.GetResourcesManager().AddResource(resource1);
    gd::ImageResource resource2;
    resource2.SetName("Resource2");
    project.GetResourcesManager().AddResource(resource2);

    // Add usage of some resources.
    project.GetPlatformSpecificAssets().Set(
        "android", "some-icon", "Resource1");
    project.GetPlatformSpecificAssets().Set(
        "android", "some-other-icon", "Resource2");

    gd::ResourceExposer::ExposeWholeProjectResources(project, resourcesRenamer);

    // Check that resources were renamed were used.
    REQUIRE(project.GetPlatformSpecificAssets().Get("android", "some-icon") ==
            "RenamedResource1");
    REQUIRE(project.GetPlatformSpecificAssets().Get(
                "android", "some-other-icon") == "Resource2");
  }

  SECTION("It renames embedded resources") {
    gd::Project project;
    std::map<gd::String, gd::String> renamings = {
        {"Resource1", "RenamedResource1"}};
    gd::ResourcesRenamer resourcesRenamer(project.GetResourcesManager(), renamings);

    // Add "classic", plain resources.
    gd::ImageResource resource1;
    resource1.SetName("Resource1");
    project.GetResourcesManager().AddResource(resource1);
    gd::ImageResource resource2;
    resource2.SetName("Resource2");
    project.GetResourcesManager().AddResource(resource2);

    // Add a resource containing a mapping to other resources.
    gd::JsonResource jsonResourceWithEmbeddeds;
    jsonResourceWithEmbeddeds.SetName("Resource3");
    jsonResourceWithEmbeddeds.SetMetadata(
        "{ \"embeddedResourcesMapping\": {\"some-resource-name\": "
        "\"Resource1\", \"some-other-resource-name\": \"Resource2\"} }");
    project.GetResourcesManager().AddResource(jsonResourceWithEmbeddeds);

    // Add usage of some resources.
    project.GetPlatformSpecificAssets().Set(
        "android", "some-icon", "Resource1");
    project.GetPlatformSpecificAssets().Set(
        "android", "some-other-icon", "Resource2");

    gd::ResourceExposer::ExposeWholeProjectResources(project, resourcesRenamer);

    // TODO: This should not be necessary, but for now not all resources support embeddeds,
    // so we must call it manually:
    gd::String resource3Name = "Resource3";
    resourcesRenamer.ExposeEmbeddeds(resource3Name);

    // Check that resources were renamed were used.
    REQUIRE(project.GetPlatformSpecificAssets().Get("android", "some-icon") ==
            "RenamedResource1");
    REQUIRE(project.GetPlatformSpecificAssets().Get(
                "android", "some-other-icon") == "Resource2");

    // Check that the names were also updated in the embedded resources mapping.
    REQUIRE(project.GetResourcesManager().HasResource("Resource3") == true);
    REQUIRE(
        project.GetResourcesManager().GetResource("Resource3").GetMetadata() ==
        "{\"embeddedResourcesMapping\":{\"some-resource-name\":"
        "\"RenamedResource1\",\"some-other-resource-name\":\"Resource2\"}}");
  }
}
