/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#if defined(GD_IDE_ONLY)
#include "EventsCodeNameMangler.h"
#include "GDCore/CommonTools.h"
#include "GDCore/String.h"

EventsCodeNameMangler *EventsCodeNameMangler::_singleton = nullptr;

const gd::String& EventsCodeNameMangler::GetMangledObjectsListName(
    const gd::String &originalObjectName) {
  auto it = mangledObjectNames.find(originalObjectName);
  if (it != mangledObjectNames.end()) {
    return it->second;
  }

  gd::String partiallyMangledName = GetMangledNameWithForbiddenUnderscore(originalObjectName);
  static const gd::String allowedCharacters =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

  for (size_t i = 0; i < partiallyMangledName.size();
       ++i)  // Replace all unallowed letter by an underscore and the ascii
             // number of the letter
  {
    if (allowedCharacters.find_first_of(
            std::u32string(1, partiallyMangledName[i])) == gd::String::npos) {
      char32_t unallowedChar = partiallyMangledName[i];
      partiallyMangledName.replace(i, 1, "_" + gd::String::From(unallowedChar));
    }
  }

  mangledObjectNames[originalObjectName] = "GD" + partiallyMangledName + "Objects";
  return mangledObjectNames[originalObjectName];
}

const gd::String& EventsCodeNameMangler::GetExternalEventsFunctionMangledName(
    const gd::String &externalEventsName) {
  auto it = mangledExternalEventsNames.find(externalEventsName);
  if (it != mangledExternalEventsNames.end()) {
    return it->second;
  }

  gd::String partiallyMangledName = GetMangledNameWithForbiddenUnderscore(externalEventsName);

  mangledExternalEventsNames[externalEventsName] = "GDExternalEvents" + partiallyMangledName;
  return mangledExternalEventsNames[externalEventsName];
}

gd::String EventsCodeNameMangler::GetMangledNameWithForbiddenUnderscore(
    const gd::String &name) {
  gd::String partiallyMangledName = name;
  static const gd::String allowedCharacters =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

  for (size_t i = 0; i < partiallyMangledName.size();
       ++i)  // Replace all unallowed letter by an underscore and the ascii
             // number of the letter
  {
    if (allowedCharacters.find_first_of(
            std::u32string(1, partiallyMangledName[i])) == gd::String::npos) {
      char32_t unallowedChar = partiallyMangledName[i];
      partiallyMangledName.replace(i, 1, "_" + gd::String::From(unallowedChar));
    }
  }
  return partiallyMangledName;
}

gd::String EventsCodeNameMangler::GetMangledName(
    const gd::String &name) {
  gd::String partiallyMangledName = name;
  static const gd::String allowedCharacters =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_";

  for (size_t i = 0; i < partiallyMangledName.size();
       ++i)  // Replace all unallowed letter by an underscore and the ascii
             // number of the letter
  {
    if (allowedCharacters.find_first_of(
            std::u32string(1, partiallyMangledName[i])) == gd::String::npos) {
      char32_t unallowedChar = partiallyMangledName[i];
      partiallyMangledName.replace(i, 1, "_" + gd::String::From(unallowedChar));
    }
  }
  return partiallyMangledName;
}



const gd::String& ManObjListName(const gd::String &objectName) {
  return EventsCodeNameMangler::Get()->GetMangledObjectsListName(objectName);
}

EventsCodeNameMangler *EventsCodeNameMangler::Get() {
  if (nullptr == _singleton) _singleton = new EventsCodeNameMangler;

  return (static_cast<EventsCodeNameMangler *>(_singleton));
}

void EventsCodeNameMangler::DestroySingleton() {
  if (nullptr != _singleton) {
    delete _singleton;
    _singleton = nullptr;
  }
}

#endif
