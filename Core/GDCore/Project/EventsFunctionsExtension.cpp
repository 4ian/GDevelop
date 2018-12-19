/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#if defined(GD_IDE_ONLY)
#include "EventsFunctionsExtension.h"
#include "EventsFunction.h"
#include "GDCore/Serialization/SerializerElement.h"
#include "GDCore/Tools/MakeUnique.h"
#include "GDCore/Tools/PolymorphicClone.h"

namespace gd {

EventsFunctionsExtension::EventsFunctionsExtension() {}

EventsFunctionsExtension::EventsFunctionsExtension(
    const EventsFunctionsExtension& other) {
  Init(other);
}

EventsFunctionsExtension& EventsFunctionsExtension::operator=(
    const EventsFunctionsExtension& other) {
  if (this != &other) Init(other);

  return *this;
}

void EventsFunctionsExtension::Init(const gd::EventsFunctionsExtension& other) {
  version = other.version;
  extensionNamespace = other.extensionNamespace;
  description = other.description;
  name = other.name;
  fullName = other.fullName;
  eventsFunctions = gd::Clone(other.eventsFunctions);
}

void EventsFunctionsExtension::SerializeTo(SerializerElement& element) const {
  element.SetAttribute("version", version);
  element.SetAttribute("extensionNamespace", extensionNamespace);
  element.SetAttribute("description", description);
  element.SetAttribute("name", name);
  element.SetAttribute("fullName", fullName);

  gd::SerializerElement& eventsFunctionsElement =
      element.AddChild("eventsFunctions");
  eventsFunctionsElement.ConsiderAsArrayOf("eventsFunction");
  for (const auto& eventsFunction : eventsFunctions) {
    eventsFunction->SerializeTo(
        eventsFunctionsElement.AddChild("eventsFunction"));
  }
}

void EventsFunctionsExtension::UnserializeFrom(
    gd::Project& project, const SerializerElement& element) {
  version = element.GetStringAttribute("version");
  extensionNamespace = element.GetStringAttribute("extensionNamespace");
  description = element.GetStringAttribute("description");
  name = element.GetStringAttribute("name");
  fullName = element.GetStringAttribute("fullName");

  const gd::SerializerElement& eventsFunctionsElement =
      element.GetChild("eventsFunctions");
  eventsFunctions.clear();
  eventsFunctionsElement.ConsiderAsArrayOf("eventsFunction");
  for (std::size_t i = 0; i < eventsFunctionsElement.GetChildrenCount(); ++i) {
    gd::EventsFunction& newEventsFunction =
        InsertNewEventsFunction("", GetEventsFunctionsCount());

    newEventsFunction.UnserializeFrom(project,
                                      eventsFunctionsElement.GetChild(i));
  }
}

bool EventsFunctionsExtension::HasEventsFunctionNamed(
    const gd::String& name) const {
  return find_if(eventsFunctions.begin(),
                 eventsFunctions.end(),
                 [&name](const std::unique_ptr<gd::EventsFunction>& function) {
                   return function->GetName() == name;
                 }) != eventsFunctions.end();
}

std::size_t EventsFunctionsExtension::GetEventsFunctionsCount() const {
  return eventsFunctions.size();
}

gd::EventsFunction& EventsFunctionsExtension::InsertNewEventsFunction(
    const gd::String& name, std::size_t position) {
  gd::EventsFunction& newEventsFunction = *(*(eventsFunctions.insert(
      position < eventsFunctions.size() ? eventsFunctions.begin() + position
                                        : eventsFunctions.end(),
      std::unique_ptr<gd::EventsFunction>(new EventsFunction()))));

  newEventsFunction.SetName(name);
  return newEventsFunction;
}

gd::EventsFunction& EventsFunctionsExtension::InsertEventsFunction(
    const gd::EventsFunction& object, std::size_t position) {
  gd::EventsFunction& newEventsFunction = *(*(eventsFunctions.insert(
      position < eventsFunctions.size() ? eventsFunctions.begin() + position
                                        : eventsFunctions.end(),
      std::unique_ptr<gd::EventsFunction>(new EventsFunction(object)))));

  return newEventsFunction;
}

void EventsFunctionsExtension::MoveEventsFunction(std::size_t oldIndex,
                                                  std::size_t newIndex) {
  if (oldIndex >= eventsFunctions.size() || newIndex >= eventsFunctions.size())
    return;

  std::unique_ptr<gd::EventsFunction> object =
      std::move(eventsFunctions[oldIndex]);
  eventsFunctions.erase(eventsFunctions.begin() + oldIndex);
  eventsFunctions.insert(eventsFunctions.begin() + newIndex, std::move(object));
}

void EventsFunctionsExtension::RemoveEventsFunction(const gd::String& name) {
  std::vector<std::unique_ptr<gd::EventsFunction> >::iterator object =
      find_if(eventsFunctions.begin(),
              eventsFunctions.end(),
              [&name](const std::unique_ptr<gd::EventsFunction>& function) {
                return function->GetName() == name;
              });
  if (object == eventsFunctions.end()) return;

  eventsFunctions.erase(object);
}

gd::EventsFunction& EventsFunctionsExtension::GetEventsFunction(
    const gd::String& name) {
  return *(
      *find_if(eventsFunctions.begin(),
               eventsFunctions.end(),
               [&name](const std::unique_ptr<gd::EventsFunction>& function) {
                 return function->GetName() == name;
               }));
}

const gd::EventsFunction& EventsFunctionsExtension::GetEventsFunction(
    const gd::String& name) const {
  return *(
      *find_if(eventsFunctions.begin(),
               eventsFunctions.end(),
               [&name](const std::unique_ptr<gd::EventsFunction>& function) {
                 return function->GetName() == name;
               }));
}

gd::EventsFunction& EventsFunctionsExtension::GetEventsFunction(std::size_t index) {
  return *eventsFunctions[index];
}
const gd::EventsFunction& EventsFunctionsExtension::GetEventsFunction(std::size_t index) const {
  return *eventsFunctions[index];
}

}  // namespace gd

#endif
