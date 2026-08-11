/*
 * GDevelop Core
 * Copyright 2008-present Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "catch.hpp"

#include <map>
#include <vector>

#include "DummyPlatform.h"
#include "GDCore/Events/Builtin/LinkEvent.h"
#include "GDCore/Events/Builtin/StandardEvent.h"
#include "GDCore/Extensions/Platform.h"
#include "GDCore/IDE/Events/ArbitraryEventsWorker.h"
#include "GDCore/IDE/ProjectBrowserHelper.h"
#include "GDCore/Project/ExternalEvents.h"
#include "GDCore/Project/Layout.h"
#include "GDCore/Project/Project.h"
#include "GDCore/Project/ProjectScopedContainers.h"
#include "GDCore/Project/SceneLifecycleEventsFunctions.h"
#include "GDCore/Serialization/SerializerElement.h"

namespace {

void InsertOneEvent(gd::EventsFunction& eventsFunction) {
  gd::StandardEvent event;
  event.SetType("BuiltinCommonInstructions::Standard");
  eventsFunction.GetEvents().InsertEvent(event);
}

void RequireOneEventInEveryLifecycleFunction(
    const gd::SceneLifecycleEventsFunctions& functions) {
  REQUIRE(functions.GetSceneLoadFunction().GetEvents().GetEventsCount() == 1);
  REQUIRE(functions.GetSceneSignalFunction().GetEvents().GetEventsCount() ==
          1);
  REQUIRE(functions.GetSceneUpdateFunction().GetEvents().GetEventsCount() ==
          1);
  REQUIRE(functions.GetSceneUnloadFunction().GetEvents().GetEventsCount() ==
          1);
}

bool IsScopedParameter(const gd::ProjectScopedContainers& containers,
                       const gd::String& name) {
  return containers.MatchIdentifierWithName<bool>(
      name, []() { return false; }, []() { return false; },
      []() { return false; }, []() { return true; },
      []() { return false; });
}

struct LifecycleScopeObservation {
  gd::String sceneName;
  gd::String externalEventsName;
  gd::String lifecycleFunctionName;
  bool hasSignalNameParameter;
  bool hasPayloadParameter;
};

class LifecycleScopeRecordingWorker
    : public gd::ArbitraryEventsWorkerWithContext {
 public:
  const std::vector<LifecycleScopeObservation>& GetObservations() const {
    return observations;
  }

 private:
  void DoVisitEventList(gd::EventsList&) override {
    const auto& containers = GetProjectScopedContainers();
    observations.push_back(
        {containers.GetScopeSceneName(),
         containers.GetScopeExternalEventsName(),
         containers.GetScopeSceneLifecycleFunctionName(),
         IsScopedParameter(containers, "SignalName"),
         IsScopedParameter(containers, "Payload")});
  }

  std::vector<LifecycleScopeObservation> observations;
};

}  // namespace

TEST_CASE("SceneLifecycleEventsFunctions", "[common]") {
  SECTION("starts with update and attaches reserved functions in order") {
    gd::SceneLifecycleEventsFunctions functions;

    REQUIRE(functions.HasValidMetadata());
    REQUIRE(functions.HasRoleName("sceneLoad"));
    REQUIRE(functions.HasRoleName("sceneSignal"));
    REQUIRE(functions.HasRoleName("sceneUpdate"));
    REQUIRE(functions.HasRoleName("sceneUnload"));
    REQUIRE_FALSE(functions.HasRoleName("onCreated"));
    REQUIRE_FALSE(functions.HasByName("sceneLoad"));
    REQUIRE_FALSE(functions.HasByName("sceneSignal"));
    REQUIRE(functions.HasByName("sceneUpdate"));
    REQUIRE_FALSE(functions.HasByName("sceneUnload"));

    functions.InsertByName("sceneLoad");
    functions.InsertByName("sceneSignal");
    functions.InsertByName("sceneUnload");

    std::vector<gd::String> visitedNames;
    functions.ForEach(
        [&visitedNames](gd::SceneLifecycleFunctionRole role,
                        const gd::EventsFunction& function) {
          visitedNames.push_back(function.GetName());
          if (function.GetName() == "sceneLoad") {
            REQUIRE(role == gd::SceneLifecycleFunctionRole::SceneLoad);
          }
        });
    const std::vector<gd::String> expectedNames{
        "sceneLoad", "sceneSignal", "sceneUpdate", "sceneUnload"};
    REQUIRE(visitedNames == expectedNames);

    REQUIRE(&functions.Get(gd::SceneLifecycleFunctionRole::SceneLoad) ==
            &functions.GetSceneLoadFunction());
    REQUIRE(&functions.GetByName("sceneSignal") ==
            &functions.GetSceneSignalFunction());

    const auto& signalParameters =
        functions.GetSceneSignalFunction().GetParameters();
    REQUIRE(signalParameters.GetParametersCount() == 2);
    REQUIRE(signalParameters.GetParameter(0).GetName() == "SignalName");
    REQUIRE(signalParameters.GetParameter(0).GetType() == "string");
    REQUIRE(signalParameters.GetParameter(1).GetName() == "Payload");
    REQUIRE(signalParameters.GetParameter(1).GetType() == "string");

    functions.GetSceneLoadFunction().SetName("changed");
    REQUIRE_FALSE(functions.HasValidMetadata());
  }

  SECTION("removing functions preserves stable empty slots") {
    gd::SceneLifecycleEventsFunctions functions;
    auto& load = functions.InsertByName("sceneLoad");
    auto& update = functions.GetByName("sceneUpdate");
    InsertOneEvent(load);
    InsertOneEvent(update);

    const auto* loadAddress = &load;
    const auto* updateAddress = &update;
    REQUIRE(functions.RemoveByName("sceneLoad"));
    REQUIRE_FALSE(functions.HasByName("sceneLoad"));
    REQUIRE_FALSE(functions.RemoveByName("sceneLoad"));
    REQUIRE(&functions.GetOrEmptyByName("sceneLoad") == loadAddress);
    REQUIRE(functions.GetOrEmptyByName("sceneLoad").GetEvents().IsEmpty());
    REQUIRE(&functions.GetByName("sceneUpdate") == updateAddress);
    REQUIRE(functions.GetByName("sceneUpdate")
                .GetEvents()
                .GetEventsCount() == 1);

    REQUIRE(functions.RemoveByName("sceneUpdate"));
    REQUIRE_FALSE(functions.HasByName("sceneUpdate"));
    REQUIRE(functions.GetOrEmptyByName("sceneUpdate").GetEvents().IsEmpty());
  }

  SECTION("layout and External Events keep GetEvents as the update alias") {
    gd::Layout layout;
    gd::ExternalEvents externalEvents;

    REQUIRE(&layout.GetEvents() ==
            &layout.GetLifecycleEventsFunctions()
                 .GetSceneUpdateFunction()
                 .GetEvents());
    REQUIRE(&externalEvents.GetEvents() ==
            &externalEvents.GetLifecycleEventsFunctions()
                 .GetSceneUpdateFunction()
                 .GetEvents());
  }

  SECTION("copying owners preserves every independent lifecycle body") {
    gd::Layout layout;
    auto& functions = layout.GetLifecycleEventsFunctions();
    InsertOneEvent(functions.GetSceneLoadFunction());
    InsertOneEvent(functions.GetSceneSignalFunction());
    InsertOneEvent(functions.GetSceneUpdateFunction());
    InsertOneEvent(functions.GetSceneUnloadFunction());

    gd::Layout copiedLayout(layout);
    RequireOneEventInEveryLifecycleFunction(
        copiedLayout.GetLifecycleEventsFunctions());
    functions.GetSceneLoadFunction().GetEvents().Clear();
    REQUIRE(copiedLayout.GetLifecycleEventsFunctions()
                .GetSceneLoadFunction()
                .GetEvents()
                .GetEventsCount() == 1);

    gd::ExternalEvents externalEvents;
    externalEvents.GetLifecycleEventsFunctions() =
        copiedLayout.GetLifecycleEventsFunctions();
    gd::ExternalEvents copiedExternalEvents(externalEvents);
    RequireOneEventInEveryLifecycleFunction(
        copiedExternalEvents.GetLifecycleEventsFunctions());
  }

  SECTION("serialization preserves present empty functions") {
    gd::Layout layout;
    layout.GetLifecycleEventsFunctions().InsertByName("sceneLoad");

    gd::SerializerElement element;
    layout.SerializeTo(element);

    REQUIRE(element.HasChild("sceneLifecycleFunctions"));
    const auto& presence = element.GetChild("sceneLifecycleFunctions");
    REQUIRE(presence.GetChildrenCount() == 2);
    REQUIRE(presence.GetChild(0).GetStringValue() == "sceneLoad");
    REQUIRE(presence.GetChild(1).GetStringValue() == "sceneUpdate");
    REQUIRE(element.HasChild("events"));
    REQUIRE(element.HasChild("sceneLoadEvents"));
    REQUIRE_FALSE(element.HasChild("sceneSignalEvents"));
    REQUIRE_FALSE(element.HasChild("sceneUnloadEvents"));
  }

  SECTION("serialization preserves an owner without update") {
    gd::Platform platform;
    gd::Project project;
    SetupProjectWithDummyPlatform(project, platform);

    gd::Layout layout;
    REQUIRE(layout.GetLifecycleEventsFunctions().RemoveByName("sceneUpdate"));
    gd::SerializerElement element;
    layout.SerializeTo(element);

    REQUIRE(element.GetChild("sceneLifecycleFunctions")
                .GetChildrenCount() == 0);
    REQUIRE(element.HasChild("events"));

    gd::Layout roundTrippedLayout;
    roundTrippedLayout.UnserializeFrom(project, element);
    REQUIRE_FALSE(roundTrippedLayout.GetLifecycleEventsFunctions()
                      .HasByName("sceneUpdate"));
    const gd::Layout& readOnlyLayout = roundTrippedLayout;
    REQUIRE(readOnlyLayout.GetEvents().IsEmpty());
    REQUIRE_FALSE(roundTrippedLayout.GetLifecycleEventsFunctions()
                      .HasByName("sceneUpdate"));
    roundTrippedLayout.GetEvents();
    REQUIRE(roundTrippedLayout.GetLifecycleEventsFunctions()
                .HasByName("sceneUpdate"));
  }

  SECTION("legacy serialization round-trips all four layout bodies") {
    gd::Platform platform;
    gd::Project project;
    SetupProjectWithDummyPlatform(project, platform);

    gd::Layout layout;
    auto& functions = layout.GetLifecycleEventsFunctions();
    InsertOneEvent(functions.GetSceneLoadFunction());
    InsertOneEvent(functions.GetSceneSignalFunction());
    InsertOneEvent(functions.GetSceneUpdateFunction());
    InsertOneEvent(functions.GetSceneUnloadFunction());

    gd::SerializerElement element;
    layout.SerializeTo(element);
    REQUIRE(element.HasChild("sceneLoadEvents"));
    REQUIRE(element.HasChild("sceneSignalEvents"));
    REQUIRE(element.HasChild("events"));
    REQUIRE(element.HasChild("sceneUnloadEvents"));

    gd::Layout roundTrippedLayout;
    roundTrippedLayout.UnserializeFrom(project, element);
    RequireOneEventInEveryLifecycleFunction(
        roundTrippedLayout.GetLifecycleEventsFunctions());
    REQUIRE(roundTrippedLayout.GetLifecycleEventsFunctions()
                .HasValidMetadata());
  }

  SECTION("missing legacy optional fields detach previously loaded functions") {
    gd::Platform platform;
    gd::Project project;
    SetupProjectWithDummyPlatform(project, platform);

    gd::Layout layout;
    auto& functions = layout.GetLifecycleEventsFunctions();
    InsertOneEvent(functions.GetSceneLoadFunction());
    InsertOneEvent(functions.GetSceneSignalFunction());
    InsertOneEvent(functions.GetSceneUnloadFunction());

    gd::Layout legacyLayout;
    InsertOneEvent(legacyLayout.GetLifecycleEventsFunctions()
                       .GetSceneUpdateFunction());
    gd::SerializerElement legacyElement;
    legacyLayout.SerializeTo(legacyElement);
    legacyElement.RemoveChild("sceneLifecycleFunctions");

    layout.UnserializeFrom(project, legacyElement);
    REQUIRE_FALSE(functions.HasByName("sceneLoad"));
    REQUIRE_FALSE(functions.HasByName("sceneSignal"));
    REQUIRE(functions.GetSceneUpdateFunction().GetEvents().GetEventsCount() ==
            1);
    REQUIRE_FALSE(functions.HasByName("sceneUnload"));
  }

  SECTION("External Events use the same legacy lifecycle-body keys") {
    gd::Platform platform;
    gd::Project project;
    SetupProjectWithDummyPlatform(project, platform);

    gd::ExternalEvents externalEvents;
    auto& functions = externalEvents.GetLifecycleEventsFunctions();
    InsertOneEvent(functions.GetSceneLoadFunction());
    InsertOneEvent(functions.GetSceneSignalFunction());
    InsertOneEvent(functions.GetSceneUpdateFunction());
    InsertOneEvent(functions.GetSceneUnloadFunction());

    gd::SerializerElement element;
    externalEvents.SerializeTo(element);
    REQUIRE(element.HasChild("sceneLoadEvents"));
    REQUIRE(element.HasChild("sceneSignalEvents"));
    REQUIRE(element.HasChild("events"));
    REQUIRE(element.HasChild("sceneUnloadEvents"));

    gd::ExternalEvents roundTrippedExternalEvents;
    roundTrippedExternalEvents.UnserializeFrom(project, element);
    RequireOneEventInEveryLifecycleFunction(
        roundTrippedExternalEvents.GetLifecycleEventsFunctions());
  }

  SECTION("empty same-role Links are valid no-ops") {
    gd::Project project;
    project.InsertNewExternalEvents("EmptyExternalEvents", 0);

    const std::vector<gd::String> lifecycleFunctionNames{
        "sceneLoad", "sceneSignal", "sceneUpdate", "sceneUnload"};
    for (const auto& lifecycleFunctionName : lifecycleFunctionNames) {
      gd::EventsList sourceEvents;
      gd::LinkEvent linkEvent;
      linkEvent.SetTarget("EmptyExternalEvents");
      sourceEvents.InsertEvent(linkEvent);

      linkEvent.ReplaceLinkByLinkedEvents(
          project, sourceEvents, 0, lifecycleFunctionName);

      REQUIRE(sourceEvents.IsEmpty());
    }
  }

  SECTION("project traversal exposes each lifecycle function parameter scope") {
    gd::Project project;
    project.InsertNewLayout("Scene", 0);
    auto& externalEvents =
        project.InsertNewExternalEvents("ExternalEvents", 0);
    externalEvents.SetAssociatedLayout("Scene");
    auto& layoutFunctions =
        project.GetLayout("Scene").GetLifecycleEventsFunctions();
    auto& externalFunctions = externalEvents.GetLifecycleEventsFunctions();
    layoutFunctions.InsertByName("sceneLoad");
    layoutFunctions.InsertByName("sceneSignal");
    layoutFunctions.InsertByName("sceneUnload");
    externalFunctions.InsertByName("sceneLoad");
    externalFunctions.InsertByName("sceneSignal");
    externalFunctions.InsertByName("sceneUnload");

    LifecycleScopeRecordingWorker worker;
    gd::ProjectBrowserHelper::ExposeProjectEventsWithoutExtensions(project,
                                                                    worker);

    const auto& observations = worker.GetObservations();
    REQUIRE(observations.size() == 8);

    std::map<gd::String, std::size_t> countsByLifecycleFunction;
    std::size_t externalEventsObservationCount = 0;
    for (const auto& observation : observations) {
      countsByLifecycleFunction[observation.lifecycleFunctionName]++;
      const bool isSignalFunction =
          observation.lifecycleFunctionName == "sceneSignal";
      REQUIRE(observation.hasSignalNameParameter == isSignalFunction);
      REQUIRE(observation.hasPayloadParameter == isSignalFunction);
      REQUIRE(observation.sceneName == "Scene");
      if (!observation.externalEventsName.empty()) {
        externalEventsObservationCount++;
        REQUIRE(observation.externalEventsName == "ExternalEvents");
      }
    }

    REQUIRE(countsByLifecycleFunction["sceneLoad"] == 2);
    REQUIRE(countsByLifecycleFunction["sceneSignal"] == 2);
    REQUIRE(countsByLifecycleFunction["sceneUpdate"] == 2);
    REQUIRE(countsByLifecycleFunction["sceneUnload"] == 2);
    REQUIRE(externalEventsObservationCount == 4);
  }

  SECTION("dependency traversal uses the linked lifecycle parameter scope") {
    gd::Project project;
    auto& layout = project.InsertNewLayout("Scene", 0);
    auto& externalEvents =
        project.InsertNewExternalEvents("ExternalEvents", 0);
    externalEvents.SetAssociatedLayout("Scene");
    externalEvents.GetLifecycleEventsFunctions().InsertByName("sceneSignal");

    gd::LinkEvent linkEvent;
    linkEvent.SetTarget("ExternalEvents");
    layout.GetLifecycleEventsFunctions()
        .GetSceneSignalFunction()
        .GetEvents()
        .InsertEvent(linkEvent);

    LifecycleScopeRecordingWorker worker;
    gd::ProjectBrowserHelper::ExposeLayoutEventsAndDependencies(project,
                                                                 layout,
                                                                 worker);

    std::size_t linkedSignalObservationCount = 0;
    for (const auto& observation : worker.GetObservations()) {
      if (observation.externalEventsName != "ExternalEvents") continue;

      linkedSignalObservationCount++;
      REQUIRE(observation.lifecycleFunctionName == "sceneSignal");
      REQUIRE(observation.hasSignalNameParameter);
      REQUIRE(observation.hasPayloadParameter);
    }
    REQUIRE(linkedSignalObservationCount == 1);
  }
}
