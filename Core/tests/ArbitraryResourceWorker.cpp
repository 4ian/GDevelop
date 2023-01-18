/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
/**
 * @file Tests covering common features of GDevelop Core.
 */
#include <string>
#include "GDCore/CommonTools.h"
#include "GDCore/Extensions/Builtin/SpriteExtension/SpriteObject.h"
#include "GDCore/IDE/Project/ArbitraryResourceWorker.h"
#include "GDCore/IDE/Project/ProjectResourcesAdder.h"
#include "GDCore/Project/Project.h"
#include "GDCore/Project/Layout.h"
#include "GDCore/Project/Object.h"
#include "GDCore/Events/Builtin/StandardEvent.h"
#include "GDCore/Extensions/Platform.h"
#include "GDCore/Serialization/Serializer.h"
#include "GDCore/Tools/SystemStats.h"
#include "GDCore/Tools/VersionWrapper.h"
#include "DummyPlatform.h"
#include "GDCore/Extensions/Builtin/SpriteExtension/SpriteObject.h"
#include "catch.hpp"

class ArbitraryResourceWorkerTest : public gd::ArbitraryResourceWorker {
 public:
  virtual void ExposeFile(gd::String& file) { files.push_back(file); };
  virtual void ExposeImage(gd::String& imageName) {
    images.push_back(imageName);
  };
  virtual void ExposeBitmapFont(gd::String& bitmapFontName) {
    bitmapFonts.push_back(bitmapFontName);
  };
  virtual void ExposeAudio(gd::String& audioName) {
    audios.push_back(audioName);
  };

  std::vector<gd::String> files;
  std::vector<gd::String> images;
  std::vector<gd::String> bitmapFonts;
  std::vector<gd::String> audios;
};

TEST_CASE("ArbitraryResourceWorker", "[common][resources]") {
  SECTION("Basics") {
    gd::Project project;
    project.GetResourcesManager().AddResource(
        "res1", "path/to/file1.png", "image");
    project.GetResourcesManager().AddResource(
        "res2", "path/to/file2.png", "image");
    project.GetResourcesManager().AddResource(
        "res3", "path/to/file3.png", "image");
    project.GetResourcesManager().AddResource(
        "res4", "path/to/file4.png", "audio");
    ArbitraryResourceWorkerTest worker;

    project.ExposeResources(worker);
    REQUIRE(worker.files.size() == 4);
    REQUIRE(std::find(worker.files.begin(),
                      worker.files.end(),
                      "path/to/file2.png") != worker.files.end());
    REQUIRE(std::find(worker.files.begin(),
                      worker.files.end(),
                      "path/to/file4.png") != worker.files.end());

    SECTION("Object using a resource") {
      gd::SpriteObject spriteConfiguration;
      gd::Animation anim;
      gd::Sprite sprite;
      sprite.SetImageName("res1");
      anim.SetDirectionsCount(1);
      anim.GetDirection(0).AddSprite(sprite);
      spriteConfiguration.AddAnimation(anim);

      gd::Object obj("myObject", "", spriteConfiguration.Clone());
      project.InsertObject(obj, 0);

      worker.files.clear();
      worker.images.clear();
      project.ExposeResources(worker);
      REQUIRE(worker.files.size() == 4);
      REQUIRE(worker.images.size() == 1);
      REQUIRE(worker.images[0] == "res1");

      SECTION("ProjectResourcesAdder") {
        std::vector<gd::String> uselessResources =
            gd::ProjectResourcesAdder::GetAllUseless(project, "image");

        REQUIRE(uselessResources.size() == 2);

        gd::ProjectResourcesAdder::RemoveAllUseless(project, "image");
        std::vector<gd::String> remainingResources =
            project.GetResourcesManager().GetAllResourceNames();
        REQUIRE(remainingResources.size() == 2);
        REQUIRE(remainingResources[0] == "res1");
        REQUIRE(remainingResources[1] == "res4");
      }
    }
  }
  SECTION("With events") {
    gd::Platform platform;
    gd::Project project;
    SetupProjectWithDummyPlatform(project, platform);
    project.GetResourcesManager().AddResource(
        "res1", "path/to/file1.png", "image");
    project.GetResourcesManager().AddResource(
        "res2", "path/to/file2.png", "image");
    project.GetResourcesManager().AddResource(
        "res3", "path/to/file3.fnt", "bitmapFont");
    project.GetResourcesManager().AddResource(
        "res4", "path/to/file4.png", "audio");
    ArbitraryResourceWorkerTest worker;

    auto& layout = project.InsertNewLayout("Scene", 0);

    gd::StandardEvent standardEvent;
    gd::Instruction instruction;
    instruction.SetType("MyExtension::DoSomethingWithResources");
    instruction.SetParametersCount(3);
    instruction.SetParameter(0, "res3");
    instruction.SetParameter(1, "res1");
    instruction.SetParameter(2, "res4");
    standardEvent.GetActions().Insert(instruction);
    layout.GetEvents().InsertEvent(standardEvent);

    project.ExposeResources(worker);
    REQUIRE(worker.bitmapFonts.size() == 1);
    REQUIRE(worker.bitmapFonts[0] == "res3");
    REQUIRE(worker.images.size() == 1);
    REQUIRE(worker.images[0] == "res1");
    REQUIRE(worker.audios.size() == 1);
    REQUIRE(worker.audios[0] == "res4");
  }
}
