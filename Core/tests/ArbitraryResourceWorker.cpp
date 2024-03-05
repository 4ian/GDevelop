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
#include "GDCore/Events/Builtin/LinkEvent.h"
#include "GDCore/Extensions/Platform.h"
#include "GDCore/Serialization/Serializer.h"
#include "GDCore/Tools/SystemStats.h"
#include "GDCore/Tools/VersionWrapper.h"
#include "DummyPlatform.h"
#include "GDCore/Extensions/Builtin/SpriteExtension/SpriteObject.h"
#include "catch.hpp"
#include "GDCore/IDE/ResourceExposer.h"
#include "GDCore/Project/Effect.h"
#include "GDCore/Project/EventsFunctionsExtension.h"
#include "GDCore/Project/ExternalEvents.h"

class ArbitraryResourceWorkerTest : public gd::ArbitraryResourceWorker {
public:
  ArbitraryResourceWorkerTest(gd::ResourcesManager &resourcesManager)
      : ArbitraryResourceWorker(resourcesManager){};
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
  SECTION("ExposeWholeProjectResources") {
    SECTION("Can find resources in a project") {
      gd::Project project;
      project.GetResourcesManager().AddResource(
          "res1", "path/to/file1.png", "image");
      project.GetResourcesManager().AddResource(
          "res2", "path/to/file2.png", "image");
      project.GetResourcesManager().AddResource(
          "res3", "path/to/file3.png", "image");
      project.GetResourcesManager().AddResource(
          "res4", "path/to/file4.png", "audio");
      ArbitraryResourceWorkerTest worker(project.GetResourcesManager());

      gd::ResourceExposer::ExposeWholeProjectResources(project, worker);
      REQUIRE(worker.files.size() == 4);
      REQUIRE(std::find(worker.files.begin(),
                        worker.files.end(),
                        "path/to/file2.png") != worker.files.end());
      REQUIRE(std::find(worker.files.begin(),
                        worker.files.end(),
                        "path/to/file4.png") != worker.files.end());
    }

    SECTION("Can find resource usages in global object configurations") {
      gd::Project project;
      project.GetResourcesManager().AddResource(
          "res1", "path/to/file1.png", "image");
      project.GetResourcesManager().AddResource(
          "res2", "path/to/file2.png", "image");
      project.GetResourcesManager().AddResource(
          "res3", "path/to/file3.png", "image");
      project.GetResourcesManager().AddResource(
          "res4", "path/to/file4.png", "audio");
      ArbitraryResourceWorkerTest worker(project.GetResourcesManager());

      gd::SpriteObject spriteConfiguration;
      gd::Animation anim;
      gd::Sprite sprite;
      sprite.SetImageName("res1");
      anim.SetDirectionsCount(1);
      anim.GetDirection(0).AddSprite(sprite);
      spriteConfiguration.GetAnimations().AddAnimation(anim);

      gd::Object obj("myObject", "", spriteConfiguration.Clone());
      project.InsertObject(obj, 0);

      worker.files.clear();
      worker.images.clear();
      gd::ResourceExposer::ExposeWholeProjectResources(project, worker);
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

    SECTION("Can find resource usages in object configurations") {
      gd::Project project;
      project.GetResourcesManager().AddResource(
          "res1", "path/to/file1.png", "image");
      project.GetResourcesManager().AddResource(
          "res2", "path/to/file2.png", "image");
      project.GetResourcesManager().AddResource(
          "res3", "path/to/file3.png", "image");
      project.GetResourcesManager().AddResource(
          "res4", "path/to/file4.png", "audio");
      ArbitraryResourceWorkerTest worker(project.GetResourcesManager());
      
      auto& layout = project.InsertNewLayout("Scene", 0);

      gd::SpriteObject spriteConfiguration;
      gd::Animation anim;
      gd::Sprite sprite;
      sprite.SetImageName("res1");
      anim.SetDirectionsCount(1);
      anim.GetDirection(0).AddSprite(sprite);
      spriteConfiguration.GetAnimations().AddAnimation(anim);

      gd::Object obj("myObject", "", spriteConfiguration.Clone());
      layout.InsertObject(obj, 0);

      worker.files.clear();
      worker.images.clear();
      gd::ResourceExposer::ExposeWholeProjectResources(project, worker);
      REQUIRE(worker.files.size() == 4);
      REQUIRE(worker.images.size() == 1);
      REQUIRE(worker.images[0] == "res1");
    }

    SECTION("Can find resource usages in layout events") {
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
      ArbitraryResourceWorkerTest worker(project.GetResourcesManager());

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

      gd::ResourceExposer::ExposeWholeProjectResources(project, worker);
      REQUIRE(worker.bitmapFonts.size() == 1);
      REQUIRE(worker.bitmapFonts[0] == "res3");
      REQUIRE(worker.images.size() == 1);
      REQUIRE(worker.images[0] == "res1");
      REQUIRE(worker.audios.size() == 1);
      REQUIRE(worker.audios[0] == "res4");
    }

    SECTION("Can find resource usages in external events") {
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
      ArbitraryResourceWorkerTest worker(project.GetResourcesManager());

      auto& externalEvents = project.InsertNewExternalEvents("MyExternalEvents", 0);

      gd::StandardEvent standardEvent;
      gd::Instruction instruction;
      instruction.SetType("MyExtension::DoSomethingWithResources");
      instruction.SetParametersCount(3);
      instruction.SetParameter(0, "res3");
      instruction.SetParameter(1, "res1");
      instruction.SetParameter(2, "res4");
      standardEvent.GetActions().Insert(instruction);
      externalEvents.GetEvents().InsertEvent(standardEvent);

      // MyExternalEvents doesn't need to be used in any layout events.

      gd::ResourceExposer::ExposeWholeProjectResources(project, worker);
      REQUIRE(worker.bitmapFonts.size() == 1);
      REQUIRE(worker.bitmapFonts[0] == "res3");
      REQUIRE(worker.images.size() == 1);
      REQUIRE(worker.images[0] == "res1");
      REQUIRE(worker.audios.size() == 1);
      REQUIRE(worker.audios[0] == "res4");
    }

    SECTION("Can find resource usages in event-based functions") {
      gd::Project project;
      gd::Platform platform;
      SetupProjectWithDummyPlatform(project, platform);

      project.GetResourcesManager().AddResource(
          "res1", "path/to/file1.png", "image");
      project.GetResourcesManager().AddResource(
          "res2", "path/to/file2.png", "image");
      project.GetResourcesManager().AddResource(
          "res3", "path/to/file3.png", "image");
      ArbitraryResourceWorkerTest worker(project.GetResourcesManager());

      auto& extension = project.InsertNewEventsFunctionsExtension("MyEventExtension", 0);
      auto& function = extension.InsertNewEventsFunction("MyFreeFunction", 0);
      
      gd::StandardEvent standardEvent;
      gd::Instruction instruction;
      instruction.SetType("MyExtension::DoSomethingWithResources");
      instruction.SetParametersCount(3);
      instruction.SetParameter(0, "res3");
      instruction.SetParameter(1, "res1");
      instruction.SetParameter(2, "res4");
      standardEvent.GetActions().Insert(instruction);
      function.GetEvents().InsertEvent(standardEvent);

      // MyEventExtension::MyFreeFunction doesn't need to be actually used in events.

      gd::ResourceExposer::ExposeWholeProjectResources(project, worker);
      REQUIRE(worker.bitmapFonts.size() == 1);
      REQUIRE(worker.bitmapFonts[0] == "res3");
      REQUIRE(worker.images.size() == 1);
      REQUIRE(worker.images[0] == "res1");
      REQUIRE(worker.audios.size() == 1);
      REQUIRE(worker.audios[0] == "res4");
    }

    SECTION("Can find resource usages in event-based behavior functions") {
      gd::Project project;
      gd::Platform platform;
      SetupProjectWithDummyPlatform(project, platform);

      project.GetResourcesManager().AddResource(
          "res1", "path/to/file1.png", "image");
      project.GetResourcesManager().AddResource(
          "res2", "path/to/file2.png", "image");
      project.GetResourcesManager().AddResource(
          "res3", "path/to/file3.png", "image");
      ArbitraryResourceWorkerTest worker(project.GetResourcesManager());

      auto& extension = project.InsertNewEventsFunctionsExtension("MyEventExtension", 0);
      auto& behavior = extension.GetEventsBasedBehaviors().InsertNew("MyBehavior", 0);
      auto& function = behavior.GetEventsFunctions().InsertNewEventsFunction("MyFunction", 0);
      
      gd::StandardEvent standardEvent;
      gd::Instruction instruction;
      instruction.SetType("MyExtension::DoSomethingWithResources");
      instruction.SetParametersCount(3);
      instruction.SetParameter(0, "res3");
      instruction.SetParameter(1, "res1");
      instruction.SetParameter(2, "res4");
      standardEvent.GetActions().Insert(instruction);
      function.GetEvents().InsertEvent(standardEvent);

      // MyEventExtension::MyBehavior::MyFunction doesn't need to be actually used in events.

      gd::ResourceExposer::ExposeWholeProjectResources(project, worker);
      REQUIRE(worker.bitmapFonts.size() == 1);
      REQUIRE(worker.bitmapFonts[0] == "res3");
      REQUIRE(worker.images.size() == 1);
      REQUIRE(worker.images[0] == "res1");
      REQUIRE(worker.audios.size() == 1);
      REQUIRE(worker.audios[0] == "res4");
    }

    SECTION("Can find resource usages in event-based object functions") {
      gd::Project project;
      gd::Platform platform;
      SetupProjectWithDummyPlatform(project, platform);

      project.GetResourcesManager().AddResource(
          "res1", "path/to/file1.png", "image");
      project.GetResourcesManager().AddResource(
          "res2", "path/to/file2.png", "image");
      project.GetResourcesManager().AddResource(
          "res3", "path/to/file3.png", "image");
      ArbitraryResourceWorkerTest worker(project.GetResourcesManager());

      auto& extension = project.InsertNewEventsFunctionsExtension("MyEventExtension", 0);
      auto& object = extension.GetEventsBasedObjects().InsertNew("MyObject", 0);
      auto& function = object.GetEventsFunctions().InsertNewEventsFunction("MyFunction", 0);
      
      gd::StandardEvent standardEvent;
      gd::Instruction instruction;
      instruction.SetType("MyExtension::DoSomethingWithResources");
      instruction.SetParametersCount(3);
      instruction.SetParameter(0, "res3");
      instruction.SetParameter(1, "res1");
      instruction.SetParameter(2, "res4");
      standardEvent.GetActions().Insert(instruction);
      function.GetEvents().InsertEvent(standardEvent);

      // MyEventExtension::MyObject::MyFunction doesn't need to be actually used in events.

      gd::ResourceExposer::ExposeWholeProjectResources(project, worker);
      REQUIRE(worker.bitmapFonts.size() == 1);
      REQUIRE(worker.bitmapFonts[0] == "res3");
      REQUIRE(worker.images.size() == 1);
      REQUIRE(worker.images[0] == "res1");
      REQUIRE(worker.audios.size() == 1);
      REQUIRE(worker.audios[0] == "res4");
    }

    SECTION("Can find resource usages in layer effects") {
      gd::Project project;
      gd::Platform platform;
      SetupProjectWithDummyPlatform(project, platform);

      project.GetResourcesManager().AddResource(
          "res1", "path/to/file1.png", "image");
      project.GetResourcesManager().AddResource(
          "res2", "path/to/file2.png", "image");
      project.GetResourcesManager().AddResource(
          "res3", "path/to/file3.png", "image");
      ArbitraryResourceWorkerTest worker(project.GetResourcesManager());

      auto& layout = project.InsertNewLayout("Scene", 0);
      layout.InsertNewLayer("MyLayer", 0);
      auto& layer = layout.GetLayer("MyLayer");
      auto& effect = layer.GetEffects().InsertNewEffect("MyEffect", 0);
      effect.SetEffectType("MyExtension::EffectWithResource");
      effect.SetStringParameter("texture", "res1");

      gd::ResourceExposer::ExposeWholeProjectResources(project, worker);
      REQUIRE(worker.files.size() == 3);
      REQUIRE(worker.images.size() == 1);
      REQUIRE(worker.images[0] == "res1");
    }

    SECTION("Can find resource usages in object effects") {
      gd::Project project;
      gd::Platform platform;
      SetupProjectWithDummyPlatform(project, platform);

      project.GetResourcesManager().AddResource(
          "res1", "path/to/file1.png", "image");
      project.GetResourcesManager().AddResource(
          "res2", "path/to/file2.png", "image");
      project.GetResourcesManager().AddResource(
          "res3", "path/to/file3.png", "image");
      ArbitraryResourceWorkerTest worker(project.GetResourcesManager());

      auto& layout = project.InsertNewLayout("Scene", 0);
      layout.InsertNewLayer("MyLayer", 0);
      auto& layer = layout.GetLayer("MyLayer");
      auto& object = layout.InsertNewObject(project, "MyExtension::Sprite", "MyObject", 0);
      auto& effect = object.GetEffects().InsertNewEffect("MyEffect", 0);
      effect.SetEffectType("MyExtension::EffectWithResource");
      effect.SetStringParameter("texture", "res1");

      gd::ResourceExposer::ExposeWholeProjectResources(project, worker);
      REQUIRE(worker.files.size() == 3);
      REQUIRE(worker.images.size() == 1);
      REQUIRE(worker.images[0] == "res1");
    }
  }

  SECTION("ExposeLayoutResources") {
    SECTION("Can find there is no resource usage in an empty layer") {
      gd::Platform platform;
      gd::Project project;
      SetupProjectWithDummyPlatform(project, platform);

      project.GetResourcesManager().AddResource(
          "res1", "path/to/file1.png", "image");
      project.GetResourcesManager().AddResource(
          "res2", "path/to/file2.png", "image");
      project.GetResourcesManager().AddResource(
          "res3", "path/to/file3.png", "image");
      project.GetResourcesManager().AddResource(
          "res4", "path/to/file4.png", "audio");
      ArbitraryResourceWorkerTest worker(project.GetResourcesManager());

      auto& layout = project.InsertNewLayout("Scene", 0);

      gd::ResourceExposer::ExposeLayoutResources(project, layout, worker);
      REQUIRE(worker.files.size() == 0);
      REQUIRE(worker.images.size() == 0);
      REQUIRE(worker.audios.size() == 0);
    }

    SECTION("Can find resource usages in object configurations") {
      gd::Platform platform;
      gd::Project project;
      SetupProjectWithDummyPlatform(project, platform);

      project.GetResourcesManager().AddResource(
          "res1", "path/to/file1.png", "image");
      project.GetResourcesManager().AddResource(
          "res2", "path/to/file2.png", "image");
      project.GetResourcesManager().AddResource(
          "res3", "path/to/file3.png", "image");
      project.GetResourcesManager().AddResource(
          "res4", "path/to/file4.png", "audio");
      ArbitraryResourceWorkerTest worker(project.GetResourcesManager());
      
      auto& layout = project.InsertNewLayout("Scene", 0);

      gd::SpriteObject spriteConfiguration;
      gd::Animation anim;
      gd::Sprite sprite;
      sprite.SetImageName("res1");
      anim.SetDirectionsCount(1);
      anim.GetDirection(0).AddSprite(sprite);
      spriteConfiguration.GetAnimations().AddAnimation(anim);

      gd::Object obj("myObject", "", spriteConfiguration.Clone());
      layout.InsertObject(obj, 0);

      worker.files.clear();
      worker.images.clear();
      gd::ResourceExposer::ExposeLayoutResources(project, layout, worker);
      REQUIRE(worker.images.size() == 1);
      REQUIRE(worker.images[0] == "res1");
    }

    SECTION("Can find resource usages in layout events") {
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
      ArbitraryResourceWorkerTest worker(project.GetResourcesManager());

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

      gd::ResourceExposer::ExposeLayoutResources(project, layout, worker);
      REQUIRE(worker.bitmapFonts.size() == 1);
      REQUIRE(worker.bitmapFonts[0] == "res3");
      REQUIRE(worker.images.size() == 1);
      REQUIRE(worker.images[0] == "res1");
      REQUIRE(worker.audios.size() == 1);
      REQUIRE(worker.audios[0] == "res4");
    }

    SECTION("Must not find resource usages in external events that are not linked to the layout") {
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
      ArbitraryResourceWorkerTest worker(project.GetResourcesManager());

      auto& layout = project.InsertNewLayout("MyScene", 0);
      auto& externalEvents = project.InsertNewExternalEvents("MyExternalEvents", 0);
      externalEvents.SetAssociatedLayout("MyScene");

      gd::StandardEvent standardEvent;
      gd::Instruction instruction;
      instruction.SetType("MyExtension::DoSomethingWithResources");
      instruction.SetParametersCount(3);
      instruction.SetParameter(0, "res3");
      instruction.SetParameter(1, "res1");
      instruction.SetParameter(2, "res4");
      standardEvent.GetActions().Insert(instruction);
      externalEvents.GetEvents().InsertEvent(standardEvent);

      // MyScene events don't have any link to MyExternalEvents.

      gd::ResourceExposer::ExposeLayoutResources(project, layout, worker);
      REQUIRE(worker.bitmapFonts.size() == 0);
      REQUIRE(worker.images.size() == 0);
      REQUIRE(worker.audios.size() == 0);
    }

    SECTION("Can find resource usages in external events that are linked to the layout") {
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
      ArbitraryResourceWorkerTest worker(project.GetResourcesManager());

      auto& layout = project.InsertNewLayout("MyScene", 0);
      auto& externalEvents = project.InsertNewExternalEvents("MyExternalEvents", 0);
      externalEvents.SetAssociatedLayout("MyScene");

      gd::StandardEvent standardEvent;
      gd::Instruction instruction;
      instruction.SetType("MyExtension::DoSomethingWithResources");
      instruction.SetParametersCount(3);
      instruction.SetParameter(0, "res3");
      instruction.SetParameter(1, "res1");
      instruction.SetParameter(2, "res4");
      standardEvent.GetActions().Insert(instruction);
      externalEvents.GetEvents().InsertEvent(standardEvent);

      // Add a link from MyScene events to MyExternalEvents.
      gd::LinkEvent linkEvent;
      linkEvent.SetTarget("MyExternalEvents");
      layout.GetEvents().InsertEvent(linkEvent);

      gd::ResourceExposer::ExposeLayoutResources(project, layout, worker);
      REQUIRE(worker.bitmapFonts.size() == 1);
      REQUIRE(worker.bitmapFonts[0] == "res3");
      REQUIRE(worker.images.size() == 1);
      REQUIRE(worker.images[0] == "res1");
      REQUIRE(worker.audios.size() == 1);
      REQUIRE(worker.audios[0] == "res4");
    }

    SECTION("Can find resource usages in external events transitively") {
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
      ArbitraryResourceWorkerTest worker(project.GetResourcesManager());

      auto& layout = project.InsertNewLayout("Scene", 0);
      auto& externalEventsA = project.InsertNewExternalEvents("MyExternalEventsA", 0);
      externalEventsA.SetAssociatedLayout("Scene");
      auto& externalEventsB = project.InsertNewExternalEvents("MyExternalEventsB", 0);
      externalEventsB.SetAssociatedLayout("Scene");

      // MyScene --> MyExternalEventsA --> MyExternalEventsB.
      gd::LinkEvent linkEventA;
      linkEventA.SetTarget("MyExternalEventsA");
      layout.GetEvents().InsertEvent(linkEventA);
      gd::LinkEvent linkEventB;
      linkEventB.SetTarget("MyExternalEventsB");
      externalEventsA.GetEvents().InsertEvent(linkEventB);

      gd::StandardEvent standardEvent;
      gd::Instruction instruction;
      instruction.SetType("MyExtension::DoSomethingWithResources");
      instruction.SetParametersCount(3);
      instruction.SetParameter(0, "res3");
      instruction.SetParameter(1, "res1");
      instruction.SetParameter(2, "res4");
      standardEvent.GetActions().Insert(instruction);
      externalEventsB.GetEvents().InsertEvent(standardEvent);

      gd::ResourceExposer::ExposeLayoutResources(project, layout, worker);
      REQUIRE(worker.bitmapFonts.size() == 1);
      REQUIRE(worker.bitmapFonts[0] == "res3");
      REQUIRE(worker.images.size() == 1);
      REQUIRE(worker.images[0] == "res1");
      REQUIRE(worker.audios.size() == 1);
      REQUIRE(worker.audios[0] == "res4");
    }

    SECTION("Must not find resource usages in another layout events that is not linked") {
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
      ArbitraryResourceWorkerTest worker(project.GetResourcesManager());

      auto& layout = project.InsertNewLayout("MyScene", 0);
      auto& otherLayout = project.InsertNewLayout("MyOtherScene", 0);

      gd::StandardEvent standardEvent;
      gd::Instruction instruction;
      instruction.SetType("MyExtension::DoSomethingWithResources");
      instruction.SetParametersCount(3);
      instruction.SetParameter(0, "res3");
      instruction.SetParameter(1, "res1");
      instruction.SetParameter(2, "res4");
      standardEvent.GetActions().Insert(instruction);
      otherLayout.GetEvents().InsertEvent(standardEvent);

      // There is no link from MyScene to MyOtherScene

      gd::ResourceExposer::ExposeLayoutResources(project, layout, worker);
      REQUIRE(worker.bitmapFonts.size() == 0);
      REQUIRE(worker.images.size() == 0);
      REQUIRE(worker.audios.size() == 0);
    }

    SECTION("Can find resource usages in another layout events that is linked") {
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
      ArbitraryResourceWorkerTest worker(project.GetResourcesManager());

      auto& layout = project.InsertNewLayout("MyScene", 0);
      auto& otherLayout = project.InsertNewLayout("MyOtherScene", 0);

      gd::StandardEvent standardEvent;
      gd::Instruction instruction;
      instruction.SetType("MyExtension::DoSomethingWithResources");
      instruction.SetParametersCount(3);
      instruction.SetParameter(0, "res3");
      instruction.SetParameter(1, "res1");
      instruction.SetParameter(2, "res4");
      standardEvent.GetActions().Insert(instruction);
      otherLayout.GetEvents().InsertEvent(standardEvent);

      // Add a link from MyScene events to MyExternalEvents which is associated
      // to MyOtherScene.
      gd::LinkEvent linkEvent;
      linkEvent.SetTarget("MyOtherScene");
      layout.GetEvents().InsertEvent(linkEvent);

      gd::ResourceExposer::ExposeLayoutResources(project, layout, worker);
      REQUIRE(worker.bitmapFonts.size() == 1);
      REQUIRE(worker.bitmapFonts[0] == "res3");
      REQUIRE(worker.images.size() == 1);
      REQUIRE(worker.images[0] == "res1");
      REQUIRE(worker.audios.size() == 1);
      REQUIRE(worker.audios[0] == "res4");
    }

    SECTION("Can find resource usages in external events associated with another layout as long as it's linked") {
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
      ArbitraryResourceWorkerTest worker(project.GetResourcesManager());

      auto& layout = project.InsertNewLayout("MyScene", 0);

      auto& otherLayout = project.InsertNewLayout("MyOtherScene", 0);
      auto& externalEvents = project.InsertNewExternalEvents("MyExternalEvents", 0);
      externalEvents.SetAssociatedLayout("MyOtherScene");

      gd::StandardEvent standardEvent;
      gd::Instruction instruction;
      instruction.SetType("MyExtension::DoSomethingWithResources");
      instruction.SetParametersCount(3);
      instruction.SetParameter(0, "res3");
      instruction.SetParameter(1, "res1");
      instruction.SetParameter(2, "res4");
      standardEvent.GetActions().Insert(instruction);
      externalEvents.GetEvents().InsertEvent(standardEvent);

      // Add a link from MyScene events to MyExternalEvents which is associated
      // to MyOtherScene.
      gd::LinkEvent linkEvent;
      linkEvent.SetTarget("MyExternalEvents");
      layout.GetEvents().InsertEvent(linkEvent);

      gd::ResourceExposer::ExposeLayoutResources(project, layout, worker);
      REQUIRE(worker.bitmapFonts.size() == 1);
      REQUIRE(worker.bitmapFonts[0] == "res3");
      REQUIRE(worker.images.size() == 1);
      REQUIRE(worker.images[0] == "res1");
      REQUIRE(worker.audios.size() == 1);
      REQUIRE(worker.audios[0] == "res4");
    }

    SECTION("Can find resource usages in event-based functions") {
      gd::Project project;
      gd::Platform platform;
      SetupProjectWithDummyPlatform(project, platform);

      project.GetResourcesManager().AddResource(
          "res1", "path/to/file1.png", "image");
      project.GetResourcesManager().AddResource(
          "res2", "path/to/file2.png", "image");
      project.GetResourcesManager().AddResource(
          "res3", "path/to/file3.png", "image");
      ArbitraryResourceWorkerTest worker(project.GetResourcesManager());

      auto& extension = project.InsertNewEventsFunctionsExtension("MyEventExtension", 0);
      auto& function = extension.InsertNewEventsFunction("MyFreeFunction", 0);
      
      gd::StandardEvent standardEvent;
      gd::Instruction instruction;
      instruction.SetType("MyExtension::DoSomethingWithResources");
      instruction.SetParametersCount(3);
      instruction.SetParameter(0, "res3");
      instruction.SetParameter(1, "res1");
      instruction.SetParameter(2, "res4");
      standardEvent.GetActions().Insert(instruction);
      function.GetEvents().InsertEvent(standardEvent);

      auto& layout = project.InsertNewLayout("MyScene", 0);

      // MyEventExtension::MyFreeFunction doesn't need to be actually used in
      // events because the implementation is naive.

      gd::ResourceExposer::ExposeLayoutResources(project, layout, worker);
      REQUIRE(worker.bitmapFonts.size() == 1);
      REQUIRE(worker.bitmapFonts[0] == "res3");
      REQUIRE(worker.images.size() == 1);
      REQUIRE(worker.images[0] == "res1");
      REQUIRE(worker.audios.size() == 1);
      REQUIRE(worker.audios[0] == "res4");
    }

    SECTION("Can find resource usages in event-based behavior functions") {
      gd::Project project;
      gd::Platform platform;
      SetupProjectWithDummyPlatform(project, platform);

      project.GetResourcesManager().AddResource(
          "res1", "path/to/file1.png", "image");
      project.GetResourcesManager().AddResource(
          "res2", "path/to/file2.png", "image");
      project.GetResourcesManager().AddResource(
          "res3", "path/to/file3.png", "image");
      ArbitraryResourceWorkerTest worker(project.GetResourcesManager());

      auto& extension = project.InsertNewEventsFunctionsExtension("MyEventExtension", 0);
      auto& behavior = extension.GetEventsBasedBehaviors().InsertNew("MyBehavior", 0);
      auto& function = behavior.GetEventsFunctions().InsertNewEventsFunction("MyFunction", 0);
      
      gd::StandardEvent standardEvent;
      gd::Instruction instruction;
      instruction.SetType("MyExtension::DoSomethingWithResources");
      instruction.SetParametersCount(3);
      instruction.SetParameter(0, "res3");
      instruction.SetParameter(1, "res1");
      instruction.SetParameter(2, "res4");
      standardEvent.GetActions().Insert(instruction);
      function.GetEvents().InsertEvent(standardEvent);

      auto& layout = project.InsertNewLayout("MyScene", 0);

      // MyEventExtension::MyBehavior::MyFunction doesn't need to be actually used in
      // events because the implementation is naive.

      gd::ResourceExposer::ExposeLayoutResources(project, layout, worker);
      REQUIRE(worker.bitmapFonts.size() == 1);
      REQUIRE(worker.bitmapFonts[0] == "res3");
      REQUIRE(worker.images.size() == 1);
      REQUIRE(worker.images[0] == "res1");
      REQUIRE(worker.audios.size() == 1);
      REQUIRE(worker.audios[0] == "res4");
    }

    SECTION("Can find resource usages in event-based object functions") {
      gd::Project project;
      gd::Platform platform;
      SetupProjectWithDummyPlatform(project, platform);

      project.GetResourcesManager().AddResource(
          "res1", "path/to/file1.png", "image");
      project.GetResourcesManager().AddResource(
          "res2", "path/to/file2.png", "image");
      project.GetResourcesManager().AddResource(
          "res3", "path/to/file3.png", "image");
      ArbitraryResourceWorkerTest worker(project.GetResourcesManager());

      auto& extension = project.InsertNewEventsFunctionsExtension("MyEventExtension", 0);
      auto& object = extension.GetEventsBasedObjects().InsertNew("MyObject", 0);
      auto& function = object.GetEventsFunctions().InsertNewEventsFunction("MyFunction", 0);
      
      gd::StandardEvent standardEvent;
      gd::Instruction instruction;
      instruction.SetType("MyExtension::DoSomethingWithResources");
      instruction.SetParametersCount(3);
      instruction.SetParameter(0, "res3");
      instruction.SetParameter(1, "res1");
      instruction.SetParameter(2, "res4");
      standardEvent.GetActions().Insert(instruction);
      function.GetEvents().InsertEvent(standardEvent);

      auto& layout = project.InsertNewLayout("MyScene", 0);

      // MyEventExtension::MyObject::MyFunction doesn't need to be actually used in
      // events because the implementation is naive.

      gd::ResourceExposer::ExposeLayoutResources(project, layout, worker);
      REQUIRE(worker.bitmapFonts.size() == 1);
      REQUIRE(worker.bitmapFonts[0] == "res3");
      REQUIRE(worker.images.size() == 1);
      REQUIRE(worker.images[0] == "res1");
      REQUIRE(worker.audios.size() == 1);
      REQUIRE(worker.audios[0] == "res4");
    }

    SECTION("Can find resource usages in layer effects") {
      gd::Project project;
      gd::Platform platform;
      SetupProjectWithDummyPlatform(project, platform);

      project.GetResourcesManager().AddResource(
          "res1", "path/to/file1.png", "image");
      project.GetResourcesManager().AddResource(
          "res2", "path/to/file2.png", "image");
      project.GetResourcesManager().AddResource(
          "res3", "path/to/file3.png", "image");
      ArbitraryResourceWorkerTest worker(project.GetResourcesManager());

      auto& layout = project.InsertNewLayout("Scene", 0);
      layout.InsertNewLayer("MyLayer", 0);
      auto& layer = layout.GetLayer("MyLayer");
      auto& effect = layer.GetEffects().InsertNewEffect("MyEffect", 0);
      effect.SetEffectType("MyExtension::EffectWithResource");
      effect.SetStringParameter("texture", "res1");

      gd::ResourceExposer::ExposeLayoutResources(project, layout, worker);
      REQUIRE(worker.images.size() == 1);
      REQUIRE(worker.images[0] == "res1");
    }

    SECTION("Can find resource usages in object effects") {
      gd::Project project;
      gd::Platform platform;
      SetupProjectWithDummyPlatform(project, platform);

      project.GetResourcesManager().AddResource(
          "res1", "path/to/file1.png", "image");
      project.GetResourcesManager().AddResource(
          "res2", "path/to/file2.png", "image");
      project.GetResourcesManager().AddResource(
          "res3", "path/to/file3.png", "image");
      ArbitraryResourceWorkerTest worker(project.GetResourcesManager());

      auto& layout = project.InsertNewLayout("Scene", 0);
      layout.InsertNewLayer("MyLayer", 0);
      auto& layer = layout.GetLayer("MyLayer");
      auto& object = layout.InsertNewObject(project, "MyExtension::Sprite", "MyObject", 0);
      auto& effect = object.GetEffects().InsertNewEffect("MyEffect", 0);
      effect.SetEffectType("MyExtension::EffectWithResource");
      effect.SetStringParameter("texture", "res1");

      gd::ResourceExposer::ExposeLayoutResources(project, layout, worker);
      REQUIRE(worker.images.size() == 1);
      REQUIRE(worker.images[0] == "res1");
    }
  }
}
